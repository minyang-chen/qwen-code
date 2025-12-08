import { config } from 'dotenv';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { existsSync } from 'fs';

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load centralized web UI config
// __dirname is packages/web-ui/server/src
// So we need ../../../../.env.webui to reach project root
const configPath = resolve(__dirname, '../../../../.env.webui');
console.log('Web-UI server config __dirname:', __dirname);
console.log('Web-UI server config path:', configPath);
console.log('Config file exists:', existsSync(configPath));
config({ path: configPath });

export const PORT = parseInt(process.env['WEBUI_SERVER_PORT'] || '3000');
export const BASE_URL = process.env['BASE_URL'] || 'http://localhost:3000';
export const JWT_SECRET =
  process.env['JWT_SECRET'] || 'dev-secret-change-in-production';
export const QWEN_CLIENT_ID = process.env['QWEN_CLIENT_ID'];
export const QWEN_CLIENT_SECRET = process.env['QWEN_CLIENT_SECRET'];
export const OPENAI_API_KEY = process.env['OPENAI_API_KEY'];
export const OPENAI_BASE_URL = process.env['OPENAI_BASE_URL'];
export const OPENAI_MODEL = process.env['OPENAI_MODEL'];
export const CORS_ORIGIN =
  process.env['CORS_ORIGIN'] ||
  `http://localhost:${process.env['WEBUI_CLIENT_PORT'] || '5173'}`;
export const NFS_BASE_PATH =
  process.env['NFS_BASE_PATH'] || '../../infrastructure/nfs-data';

// Sandbox Configuration
export const SANDBOX_ENABLED = process.env['SANDBOX_ENABLED'] !== 'false';
export const SANDBOX_IMAGE = process.env['SANDBOX_IMAGE'] || 'node:20-bookworm';
export const SANDBOX_MEMORY = process.env['SANDBOX_MEMORY'] || '1g';
export const SANDBOX_CPUS = parseInt(process.env['SANDBOX_CPUS'] || '2');
export const SANDBOX_NETWORK = process.env['SANDBOX_NETWORK'] || 'bridge';
export const SANDBOX_IDLE_TIMEOUT = parseInt(
  process.env['SANDBOX_IDLE_TIMEOUT'] || '3600000',
); // 1 hour
export const SANDBOX_CLEANUP_INTERVAL = parseInt(
  process.env['SANDBOX_CLEANUP_INTERVAL'] || '300000',
); // 5 minutes

// Session Configuration
export const SESSION_TOKEN_LIMIT = parseInt(
  process.env['SESSION_TOKEN_LIMIT'] || '32000',
);
export const MESSAGE_WINDOW_SIZE = parseInt(
  process.env['MESSAGE_WINDOW_SIZE'] || '100',
);
