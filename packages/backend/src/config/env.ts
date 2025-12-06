import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(__dirname, '../../.env') });

export const PORT = process.env.PORT || 3001;
export const NODE_ENV = process.env.NODE_ENV || 'development';

export const POSTGRES_HOST = process.env.POSTGRES_HOST || 'localhost';
export const POSTGRES_PORT = parseInt(process.env.POSTGRES_PORT || '5432');
export const POSTGRES_USER = process.env.POSTGRES_USER || 'admin';
export const POSTGRES_PASSWORD = process.env.POSTGRES_PASSWORD || 'changeme';
export const POSTGRES_DB = process.env.POSTGRES_DB || 'qwen_users';

export const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://admin:changeme@localhost:27017/qwen_sessions?authSource=admin';

export const NFS_BASE_PATH = process.env.NFS_BASE_PATH || '../../infrastructure/nfs-data';

export const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
export const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '24h';

export const OPENAI_API_KEY = process.env.OPENAI_API_KEY || '';

export const BCRYPT_ROUNDS = parseInt(process.env.BCRYPT_ROUNDS || '10');
