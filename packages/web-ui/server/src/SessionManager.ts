import {
  GeminiClient as Client,
  Config,
  ApprovalMode,
  AuthType,
} from '@qwen-code/core';
import { nanoid } from 'nanoid';

export interface Session {
  id: string;
  userId: string;
  client: Client;
  createdAt: Date;
  lastActivity: Date;
}

interface UserCredentials {
  type?: string;
  apiKey?: string;
  baseUrl?: string;
  model?: string;
  accessToken?: string;
  refreshToken?: string;
}

export class SessionManager {
  private sessions = new Map<string, Session>();

  async createSession(
    userId: string,
    userCredentials?: UserCredentials,
  ): Promise<Session> {
    const sessionId = nanoid();

    console.log('Creating session with credentials:', {
      type: userCredentials?.type,
      hasAccessToken: !!userCredentials?.accessToken,
      hasApiKey: !!userCredentials?.apiKey,
      baseUrl: userCredentials?.baseUrl,
      model: userCredentials?.model,
    });

    let apiKey: string | undefined;
    let baseUrl: string | undefined;
    let model: string | undefined;
    let authType: AuthType;

    if (userCredentials?.type === 'qwen-oauth') {
      const { promises: fs } = await import('fs');
      const path = await import('path');
      const os = await import('os');

      const qwenDir = path.join(os.homedir(), '.qwen');
      const credsPath = path.join(qwenDir, 'oauth_creds.json');

      // If new credentials provided, save them
      if (userCredentials.accessToken) {
        const oauthCreds = {
          access_token: userCredentials.accessToken,
          refresh_token: userCredentials.refreshToken,
          token_type: 'Bearer',
          resource_url: 'portal.qwen.ai',
          expiry_date: Date.now() + 3600 * 1000,
        };

        await fs.mkdir(qwenDir, { recursive: true });
        await fs.writeFile(credsPath, JSON.stringify(oauthCreds, null, 2));
      }

      // Use QWEN_OAUTH auth type to leverage QwenContentGenerator
      apiKey = 'oauth-placeholder';
      baseUrl = 'https://dashscope.aliyuncs.com/compatible-mode/v1';
      model = 'qwen-plus';
      authType = AuthType.QWEN_OAUTH;
    } else if (userCredentials?.type === 'openai') {
      apiKey = userCredentials.apiKey;
      baseUrl = userCredentials.baseUrl || process.env.OPENAI_BASE_URL;
      model = userCredentials.model || process.env.OPENAI_MODEL;
      authType = AuthType.USE_OPENAI;
    } else {
      apiKey = process.env.OPENAI_API_KEY;
      baseUrl = process.env.OPENAI_BASE_URL;
      model = process.env.OPENAI_MODEL || 'gpt-4';
      authType = AuthType.USE_OPENAI;
    }

    console.log('Resolved credentials:', {
      apiKey: apiKey?.substring(0, 10) + '...',
      baseUrl,
      model,
    });

    if (!apiKey) {
      throw new Error('API key is required');
    }

    if (!baseUrl) {
      throw new Error('Base URL is required');
    }

    // Normalize baseUrl to include protocol
    if (!baseUrl.startsWith('http://') && !baseUrl.startsWith('https://')) {
      baseUrl = `https://${baseUrl}`;
    }

    // Ensure baseUrl ends with /v1 for OpenAI compatibility
    if (!baseUrl.endsWith('/v1')) {
      baseUrl = `${baseUrl}/v1`;
    }

    console.log('Normalized baseUrl:', baseUrl);

    const config = new Config({
      sessionId,
      targetDir: process.cwd(),
      cwd: process.cwd(),
      debugMode: false,
      approvalMode: ApprovalMode.YOLO,
      mcpServers: {},
      includeDirectories: [],
      model,
    });

    await config.initialize();

    config.updateCredentials({
      apiKey,
      baseUrl,
      model,
    });

    await config.refreshAuth(authType, true);

    const client = new Client(config);
    await client.initialize();

    const session: Session = {
      id: sessionId,
      userId,
      client,
      createdAt: new Date(),
      lastActivity: new Date(),
    };
    this.sessions.set(session.id, session);
    return session;
  }

  getSession(sessionId: string): Session | undefined {
    const session = this.sessions.get(sessionId);
    if (session) {
      session.lastActivity = new Date();
    }
    return session;
  }

  deleteSession(sessionId: string): void {
    this.sessions.delete(sessionId);
  }

  getUserSessions(userId: string): Session[] {
    return Array.from(this.sessions.values()).filter(
      (s) => s.userId === userId,
    );
  }

  cleanup(maxAge: number = 3600000): void {
    const now = Date.now();
    for (const [id, session] of this.sessions) {
      if (now - session.lastActivity.getTime() > maxAge) {
        this.sessions.delete(id);
      }
    }
  }
}
