import './config.js';
import {
  PORT,
  BASE_URL,
  JWT_SECRET,
  QWEN_CLIENT_ID,
  QWEN_CLIENT_SECRET,
  OPENAI_API_KEY,
  OPENAI_BASE_URL,
  OPENAI_MODEL,
  CORS_ORIGIN,
  MESSAGE_WINDOW_SIZE,
  SESSION_TOKEN_LIMIT,
} from './config.js';

console.log('Centralized config loaded');
console.log('OPENAI_API_KEY:', OPENAI_API_KEY?.substring(0, 10) + '...');
console.log('OPENAI_BASE_URL:', OPENAI_BASE_URL);
console.log('OPENAI_MODEL:', OPENAI_MODEL);

import Fastify from 'fastify';
import cors from '@fastify/cors';
import cookie from '@fastify/cookie';
import { Server as SocketServer } from 'socket.io';
import { SessionManager } from './SessionManager.js';
import { setupWebSocket } from './websocket.js';
import jwt from 'jsonwebtoken';
import { nanoid } from 'nanoid';

const app = Fastify({ logger: true });
const sessionManager = new SessionManager();

// Middleware
await app.register(cors, {
  origin: CORS_ORIGIN,
  credentials: true,
});
await app.register(cookie);

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
        client_id: QWEN_CLIENT_ID!,
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
        client_id: QWEN_CLIENT_ID!,
        device_code,
        code_verifier,
      }),
    });

    const data = (await res.json()) as {
      access_token?: string;
      refresh_token?: string;
    };

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
  const redirectUri = `${BASE_URL}/api/auth/oauth/callback`;
  const authUrl = `https://chat.qwen.ai/api/v1/oauth2/authorize?client_id=${QWEN_CLIENT_ID}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&state=${state}`;

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
  const savedState = request.cookies['oauth_state'];

  if (!code || !state || state !== savedState) {
    return reply.code(400).send({ error: 'Invalid OAuth callback' });
  }

  try {
    // Exchange code for token
    const tokenRes = await fetch('https://chat.qwen.ai/api/v1/oauth2/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        client_id: QWEN_CLIENT_ID,
        client_secret: QWEN_CLIENT_SECRET,
        code,
        grant_type: 'authorization_code',
        redirect_uri: `${BASE_URL}/api/auth/oauth/callback`,
      }),
    });

    if (!tokenRes.ok) throw new Error('Token exchange failed');

    const { access_token, refresh_token } = (await tokenRes.json()) as {
      access_token: string;
      refresh_token: string;
    };

    // Get user info
    const userRes = await fetch('https://api.qwen.ai/user', {
      headers: { Authorization: `Bearer ${access_token}` },
    });

    if (!userRes.ok) throw new Error('Failed to get user info');

    const user = (await userRes.json()) as { id: string };
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

  // Use hash of API key as userId for consistent workspace
  const crypto = await import('crypto');
  const userId = crypto
    .createHash('sha256')
    .update(apiKey)
    .digest('hex')
    .substring(0, 16);

  const credentials = {
    type: 'openai',
    apiKey,
    baseUrl: baseUrl || OPENAI_BASE_URL,
    model: model || OPENAI_MODEL,
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

app.get('/api/config/:type', async (request) => {
  const { type } = request.params as { type: 'individual' | 'team' };

  if (type === 'individual') {
    return {
      'Qwen OAuth Client ID': QWEN_CLIENT_ID || 'Not configured',
      'OpenAI API Key': OPENAI_API_KEY
        ? OPENAI_API_KEY.substring(0, 10) + '...'
        : 'Not configured',
      'OpenAI Base URL': OPENAI_BASE_URL || 'Not configured',
      'OpenAI Model': OPENAI_MODEL || 'Not configured',
      'JWT Secret': JWT_SECRET ? '***configured***' : 'Not configured',
    };
  } else {
    return {
      'PostgreSQL Host': process.env['POSTGRES_HOST'] || 'Not configured',
      'PostgreSQL Port': process.env['POSTGRES_PORT'] || 'Not configured',
      'PostgreSQL Database': process.env['POSTGRES_DB'] || 'Not configured',
      'MongoDB URI': process.env['MONGODB_URI']
        ? process.env['MONGODB_URI'].replace(/:[^:@]+@/, ':***@')
        : 'Not configured',
      'NFS Base Path': process.env['NFS_BASE_PATH'] || 'Not configured',
      'OpenAI Base URL': OPENAI_BASE_URL || 'Not configured',
      'OpenAI Model': OPENAI_MODEL || 'Not configured',
      'Embedding Base URL':
        process.env['EMBEDDING_BASE_URL'] || 'Not configured',
      'Embedding Model': process.env['EMBEDDING_MODEL'] || 'Not configured',
    };
  }
});

app.get('/api/sessions/:id/stats', async (request, reply) => {
  const { id } = request.params as { id: string };
  const stats = sessionManager.getSessionStats(id);

  if (!stats) {
    return reply.code(404).send({ error: 'Session not found' });
  }

  return stats;
});

app.get('/api/settings', async () => {
  return {
    messageWindowSize: MESSAGE_WINDOW_SIZE,
    sessionTokenLimit: SESSION_TOKEN_LIMIT,
  };
});

app.get('/api/auth/info', async (request, reply) => {
  const token = request.cookies['auth_token'];
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
  const token = request.cookies['auth_token'];
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
    app.log.error({ error }, 'Failed to create session');
    return reply.code(500).send({
      error: 'Failed to create session',
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
    });
  }
});

app.get('/api/sessions', async (request, reply) => {
  const token = request.cookies['auth_token'];
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
  const token = request.cookies['auth_token'];
  const user = token ? verifyToken(token) : null;

  if (!user) {
    return reply.code(401).send({ error: 'Unauthorized' });
  }

  try {
    const session = sessionManager.getSession(id);
    if (!session) {
      return reply.code(404).send({ error: 'Session not found' });
    }

    // TODO: Implement compress history
    // const result = await session.client.compressHistory();
    return {
      success: true,
      tokensBeforeCompression: 0,
      tokensAfterCompression: 0,
      compressionRatio: 0,
    };
  } catch (error) {
    console.error('Compression failed:', error);
    return reply.code(500).send({ error: 'Compression failed' });
  }
});

// WebSocket
const io = new SocketServer(app.server, {
  cors: {
    origin: CORS_ORIGIN,
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
