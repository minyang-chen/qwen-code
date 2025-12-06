import { Pool } from 'pg';
import mongoose from 'mongoose';
import { POSTGRES_HOST, POSTGRES_PORT, POSTGRES_USER, POSTGRES_PASSWORD, POSTGRES_DB, MONGODB_URI } from './env';

export const pool = new Pool({
  host: POSTGRES_HOST,
  port: POSTGRES_PORT,
  user: POSTGRES_USER,
  password: POSTGRES_PASSWORD,
  database: POSTGRES_DB,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

export const connectMongoDB = async () => {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('MongoDB connected successfully');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

export const testPostgresConnection = async () => {
  try {
    const client = await pool.connect();
    await client.query('SELECT NOW()');
    client.release();
    console.log('PostgreSQL connected successfully');
  } catch (error) {
    console.error('PostgreSQL connection error:', error);
    process.exit(1);
  }
};
