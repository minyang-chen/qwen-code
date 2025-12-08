import dotenv from 'dotenv';
import path from 'path';
import { existsSync } from 'fs';

// Load centralized web UI config
// __dirname in compiled code is packages/backend/dist/config
// So we need ../../../../.env.webui to reach project root
const configPath = path.join(__dirname, '../../../../.env.webui');
console.log('Backend config __dirname:', __dirname);
console.log('Backend config path:', configPath);
console.log('Config file exists:', existsSync(configPath));
dotenv.config({ path: configPath });

export const PORT = process.env.SERVICE_BACKEND_PORT || 3001;
export const NODE_ENV = process.env.NODE_ENV || 'development';

export const POSTGRES_HOST = process.env.POSTGRES_HOST || 'localhost';
export const POSTGRES_PORT = parseInt(process.env.POSTGRES_PORT || '5432', 10);
export const POSTGRES_USER = process.env.POSTGRES_USER || 'admin';
export const POSTGRES_PASSWORD = process.env.POSTGRES_PASSWORD || 'changeme';
export const POSTGRES_DB = process.env.POSTGRES_DB || 'qwen_users';

export const MONGODB_URI =
  process.env.MONGODB_URI ||
  'mongodb://admin:changeme@localhost:27017/qwen_sessions?authSource=admin';
export const MONGO_URL =
  process.env.MONGO_URL || 'mongodb://admin:changeme@localhost:27017';

export const NFS_BASE_PATH =
  process.env.NFS_BASE_PATH || '../../infrastructure/nfs-data';

export const JWT_SECRET =
  process.env.JWT_SECRET || 'your-secret-key-change-in-production';
export const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '24h';

export const OPENAI_API_KEY = process.env.OPENAI_API_KEY || '';
export const OPENAI_BASE_URL = process.env.OPENAI_BASE_URL;
export const OPENAI_MODEL = process.env.OPENAI_MODEL;

export const EMBEDDING_API_KEY = process.env.EMBEDDING_API_KEY;
export const EMBEDDING_BASE_URL = process.env.EMBEDDING_BASE_URL;
export const EMBEDDING_MODEL = process.env.EMBEDDING_MODEL;

export const BCRYPT_ROUNDS = parseInt(process.env.BCRYPT_ROUNDS || '10', 10);
