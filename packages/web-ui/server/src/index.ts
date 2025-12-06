import { config } from 'dotenv';
import { resolve } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const envPath = resolve(__dirname, '../../../../.env');
console.log('Loading .env from:', envPath);
const result = config({ path: envPath });
if (result.error) {
  console.error('Error loading .env:', result.error);
} else {
  console.log('.env loaded successfully');
}
console.log('Environment variables after loading:');
console.log(
  'OPENAI_API_KEY:',
  process.env.OPENAI_API_KEY?.substring(0, 10) + '...',
);
console.log('OPENAI_BASE_URL:', process.env.OPENAI_BASE_URL);
console.log('OPENAI_MODEL:', process.env.OPENAI_MODEL);

import Fastify from 'fastify';
import cors from '@fastify/cors';
import cookie from '@fastify/cookie';
import { Server as SocketServer } from 'socket.io';
import { SessionManager } from './SessionManager.js';
import { setupWebSocket } from './websocket.js';
import jwt from 'jsonwebtoken';
import { nanoid } from 'nanoid';

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-in-production';
const PORT = parseInt(process.env.PORT || '3000');

const app = Fastify({ logger: true });
const sessionManager = new SessionManager();

// Middleware
await app.register(cors, {
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  credentials: true,
});
await app.register(cookie);

// Auth helper - used for OAuth token refresh when sessions expire
// eslint-disable-next-line @typescript-eslint/no-unused-vars
async function refreshAccessToken(
  refreshToken: string,
): Promise<string | null> {
  try {
    const res = await fetch('https://chat.qwen.ai/api/v1/oauth2/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        client_id: process.env.QWEN_CLIENT_ID,
        client_secret: process.env.QWEN_CLIENT_SECRET,
        refresh_token: refreshToken,
        grant_type: 'refresh_token',
      }),
    });

    if (!res.ok) return null;

    const { access_token } = await res.json();
    return access_token;
  } catch {
    return null;
  }
}

function verifyToken(token: string): {
  userId: string;
  accessToken?: string;
  refreshToken?: string;
  credentials?: {
    type: string;
    apiKey?: string;
    baseUrl?: string;
    model?: string;
  };
} | null {
  try {
    return jwt.verify(token, JWT_SECRET) as {
      userId: string;
      accessToken?: string;
      refreshToken?: string;
      credentials?: {
        type: string;
        apiKey?: string;
        baseUrl?: string;
        model?: string;
      };
    };
  } catch {
    return null;
  }
}

// Routes
app.post('/api/auth/oauth/qwen/device', async (request, reply) => {
  const { code_challenge, code_challenge_method } = request.body as {
    code_challenge: string;
    code_challenge_method: string;
  };

  try {
    const res = await fetch('https://chat.qwen.ai/api/v1/oauth2/device/code', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Accept: 'application/json',
      },
      body: new URLSearchParams({
        client_id: process.env.QWEN_CLIENT_ID!,
        scope: 'openid profile email model.completion',
        code_challenge,
        code_challenge_method,
      }),
    });

    const data = await res.json();
    return data;
  } catch (error) {
    console.error('Device authorization error:', error);
    return reply
      .code(500)
      .send({ error: 'Failed to initiate device authorization' });
  }
});

app.post('/api/auth/oauth/qwen/token', async (request, reply) => {
  const { device_code, code_verifier } = request.body as {
    device_code: string;
    code_verifier: string;
  };

  try {
    const res = await fetch('https://chat.qwen.ai/api/v1/oauth2/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Accept: 'application/json',
      },
      body: new URLSearchParams({
        grant_type: 'urn:ietf:params:oauth:grant-type:device_code',
        client_id: process.env.QWEN_CLIENT_ID!,
        device_code,
        code_verifier,
      }),
    });

    const data = await res.json();

    if (data.access_token) {
      // Create session with OAuth token
      const userId = nanoid();
      const token = jwt.sign(
        {
          userId,
          credentials: {
            type: 'qwen-oauth',
            apiKey: data.access_token,
            baseUrl: 'https://dashscope.aliyuncs.com/compatible-mode/v1',
            model: 'qwen-plus',
            accessToken: data.access_token,
            refreshToken: data.refresh_token,
          },
        },
        JWT_SECRET,
      );

      reply.setCookie('auth_token', token, {
        httpOnly: true,
        secure: false,
        sameSite: 'lax',
        path: '/',
        maxAge: 60 * 60 * 24 * 7,
      });
    }

    return data;
  } catch (error) {
    console.error('Token exchange error:', error);
    return reply
      .code(500)
      .send({ error: 'Failed to exchange device code for token' });
  }
});

app.get('/api/auth/oauth/qwen', async (request, reply) => {
  const state = nanoid();
  const redirectUri = `${process.env.BASE_URL || 'http://localhost:3000'}/api/auth/oauth/callback`;
  const authUrl = `https://chat.qwen.ai/api/v1/oauth2/authorize?client_id=${process.env.QWEN_CLIENT_ID}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&state=${state}`;

  reply.setCookie('oauth_state', state, {
    httpOnly: true,
    secure: false,
    sameSite: 'lax',
    path: '/',
    maxAge: 600, // 10 minutes
  });

  return reply.redirect(authUrl);
});

app.get('/api/auth/oauth/callback', async (request, reply) => {
  const { code, state } = request.query as { code?: string; state?: string };
  const savedState = request.cookies.oauth_state;

  if (!code || !state || state !== savedState) {
    return reply.code(400).send({ error: 'Invalid OAuth callback' });
  }

  try {
    // Exchange code for token
    const tokenRes = await fetch('https://chat.qwen.ai/api/v1/oauth2/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        client_id: process.env.QWEN_CLIENT_ID,
        client_secret: process.env.QWEN_CLIENT_SECRET,
        code,
        grant_type: 'authorization_code',
        redirect_uri: `${process.env.BASE_URL || 'http://localhost:3000'}/api/auth/oauth/callback`,
      }),
    });

    if (!tokenRes.ok) throw new Error('Token exchange failed');

    const { access_token, refresh_token } = await tokenRes.json();

    // Get user info
    const userRes = await fetch('https://api.qwen.ai/user', {
      headers: { Authorization: `Bearer ${access_token}` },
    });

    if (!userRes.ok) throw new Error('Failed to get user info');

    const user = await userRes.json();
    const userId = user.id;

    // Create session token
    const token = jwt.sign(
      { userId, accessToken: access_token, refreshToken: refresh_token },
      JWT_SECRET,
      { expiresIn: '7d' },
    );

    reply.setCookie('auth_token', token, {
      httpOnly: true,
      secure: false,
      sameSite: 'lax',
      path: '/',
      maxAge: 7 * 24 * 60 * 60,
    });

    reply.clearCookie('oauth_state');

    return reply.redirect('/');
  } catch (error) {
    console.error('OAuth callback error:', error);
    return reply.code(500).send({ error: 'OAuth authentication failed' });
  }
});

app.post('/api/auth/login', async (request, reply) => {
  // Simple dev auth - replace with real OAuth in production
  const userId = nanoid();
  const token = jwt.sign({ userId }, JWT_SECRET, { expiresIn: '7d' });

  reply.setCookie('auth_token', token, {
    httpOnly: true,
    secure: false,
    sameSite: 'lax',
    path: '/',
    maxAge: 7 * 24 * 60 * 60,
  });

  return { userId, token };
});

app.post('/api/auth/login/openai', async (request, reply) => {
  const { apiKey, baseUrl, model } = request.body as {
    apiKey?: string;
    baseUrl?: string;
    model?: string;
  };

  if (!apiKey) {
    return reply.code(400).send({ error: 'API key is required' });
  }

  const userId = nanoid();
  const credentials = {
    type: 'openai',
    apiKey,
    baseUrl: baseUrl || process.env.OPENAI_BASE_URL,
    model: model || process.env.OPENAI_MODEL,
  };

  const token = jwt.sign({ userId, credentials }, JWT_SECRET, {
    expiresIn: '7d',
  });

  console.log('OpenAI Login - Setting cookie with credentials:', {
    userId,
    type: credentials.type,
    baseUrl: credentials.baseUrl,
    model: credentials.model,
  });

  reply.setCookie('auth_token', token, {
    httpOnly: true,
    secure: false,
    sameSite: 'lax',
    path: '/',
    maxAge: 7 * 24 * 60 * 60,
  });

  return { userId, token };
});

app.get('/api/auth/info', async (request, reply) => {
  const token = request.cookies.auth_token;
  console.log(
    'Auth info - received cookie token (first 50 chars):',
    token?.substring(0, 50),
  );

  const user = token ? verifyToken(token) : null;

  if (!user) {
    return reply.code(401).send({ error: 'Unauthorized' });
  }

  console.log('Auth info - user object:', JSON.stringify(user, null, 2));

  const credentials = user.credentials as
    | { type: 'openai'; baseUrl?: string; model?: string }
    | undefined;

  const isQwenOAuth = !credentials || credentials.type !== 'openai';

  const result = {
    loginType: isQwenOAuth ? 'qwen-oauth' : 'openai',
    baseUrl: isQwenOAuth ? 'https://chat.qwen.ai/api/v1' : credentials.baseUrl,
    model: isQwenOAuth ? null : credentials.model,
  };

  console.log('Auth info - returning:', JSON.stringify(result, null, 2));

  return result;
});

app.post('/api/auth/logout', async (request, reply) => {
  console.log('Logout - clearing auth_token cookie');

  // Force expire the cookie by setting it to empty with past expiration
  reply.setCookie('auth_token', '', {
    httpOnly: true,
    secure: false,
    sameSite: 'lax',
    path: '/',
    expires: new Date(0), // Set to epoch time (Jan 1, 1970)
  });

  return { success: true };
});

app.post('/api/sessions', async (request, reply) => {
  const token = request.cookies.auth_token;
  const user = token ? verifyToken(token) : null;

  if (!user) {
    return reply.code(401).send({ error: 'Unauthorized' });
  }

  const { workingDirectory } = request.body as { workingDirectory?: string };

  try {
    const session = await sessionManager.createSession(
      user.userId,
      user.credentials,
      workingDirectory,
    );
    return { sessionId: session.id };
  } catch (error) {
    console.error('Session creation failed:', error);
    app.log.error('Failed to create session:', error);
    return reply.code(500).send({
      error: 'Failed to create session',
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
    });
  }
});

app.get('/api/sessions', async (request, reply) => {
  const token = request.cookies.auth_token;
  const user = token ? verifyToken(token) : null;

  if (!user) {
    return reply.code(401).send({ error: 'Unauthorized' });
  }

  const sessions = sessionManager.getUserSessions(user.userId);
  return sessions.map((s) => ({
    id: s.id,
    createdAt: s.createdAt,
    lastActivity: s.lastActivity,
  }));
});

app.delete('/api/sessions/:id', async (request) => {
  const { id } = request.params as { id: string };
  sessionManager.deleteSession(id);
  return { success: true };
});

app.post('/api/sessions/:id/compress', async (request, reply) => {
  const { id } = request.params as { id: string };
  const token = request.cookies.auth_token;
  const user = token ? verifyToken(token) : null;

  if (!user) {
    return reply.code(401).send({ error: 'Unauthorized' });
  }

  try {
    const session = sessionManager.getSession(id);
    if (!session) {
      return reply.code(404).send({ error: 'Session not found' });
    }

    const result = await session.client.compressHistory();
    return {
      success: true,
      tokensBeforeCompression: result.tokensBeforeCompression,
      tokensAfterCompression: result.tokensAfterCompression,
      compressionRatio: result.compressionRatio,
    };
  } catch (error) {
    console.error('Compression failed:', error);
    return reply.code(500).send({ error: 'Compression failed' });
  }
});

app.get('/api/sessions/:id/stats', async (request, reply) => {
  const { id } = request.params as { id: string };
  const token = request.cookies.auth_token;
  const user = token ? verifyToken(token) : null;

  if (!user) {
    return reply.code(401).send({ error: 'Unauthorized' });
  }

  try {
    const session = sessionManager.getSession(id);
    if (!session) {
      return reply.code(404).send({ error: 'Session not found' });
    }

    const history = session.client.getHistory();
    const tokenCount = history.reduce(
      (sum, msg) => sum + (msg.content?.length || 0),
      0,
    );

    return {
      messageCount: history.length,
      estimatedTokens: Math.ceil(tokenCount / 4),
    };
  } catch (error) {
    console.error('Stats fetch failed:', error);
    return reply.code(500).send({ error: 'Failed to fetch stats' });
  }
});

// WebSocket
const io = new SocketServer(app.server, {
  cors: {
    origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
    credentials: true,
  },
});

setupWebSocket(io, sessionManager);

// Cleanup old sessions every hour
setInterval(() => sessionManager.cleanup(), 3600000);

// Start server
app.listen({ port: PORT, host: '0.0.0.0' }, (err) => {
  if (err) {
    app.log.error(err);
    process.exit(1);
  }
  console.log(`Server running on http://localhost:${PORT}`);
});
