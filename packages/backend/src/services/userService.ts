import bcrypt from 'bcrypt';
import { pool } from '../config/database';
import { v4 as uuidv4 } from 'uuid';
import { BCRYPT_ROUNDS } from '../config/env';

interface CreateUserInput {
  username: string;
  email: string;
  full_name: string;
  phone?: string;
  password: string;
}

export const userService = {
  async findByUsernameOrEmail(username: string, email: string) {
    const result = await pool.query(
      'SELECT id FROM users WHERE username = $1 OR email = $2',
      [username, email]
    );
    return result.rows[0];
  },
  
  async findByUsername(username: string) {
    const result = await pool.query(
      'SELECT id, username, email, full_name, password_hash, nfs_workspace_path FROM users WHERE username = $1',
      [username]
    );
    return result.rows[0];
  },
  
  async findById(userId: string) {
    const result = await pool.query(
      'SELECT id, username, email, full_name, phone, nfs_workspace_path FROM users WHERE id = $1',
      [userId]
    );
    return result.rows[0];
  },
  
  async createUser(input: CreateUserInput) {
    const userId = uuidv4();
    const passwordHash = await bcrypt.hash(input.password, BCRYPT_ROUNDS);
    const workspacePath = `/private/${userId}`;
    const mongoDbName = `user_${userId.replace(/-/g, '_')}`;
    
    const result = await pool.query(
      `INSERT INTO users (id, username, email, full_name, phone, password_hash, nfs_workspace_path, mongo_database_name)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING id, username, email, full_name, nfs_workspace_path, mongo_database_name, created_at`,
      [userId, input.username, input.email, input.full_name, input.phone, passwordHash, workspacePath, mongoDbName]
    );
    
    return result.rows[0];
  },

  async updateProfile(userId: string, data: { email?: string; full_name?: string; phone?: string }) {
    const updates: string[] = [];
    const values: any[] = [];
    let paramCount = 1;

    if (data.email !== undefined) {
      updates.push(`email = $${paramCount++}`);
      values.push(data.email);
    }
    if (data.full_name !== undefined) {
      updates.push(`full_name = $${paramCount++}`);
      values.push(data.full_name);
    }
    if (data.phone !== undefined) {
      updates.push(`phone = $${paramCount++}`);
      values.push(data.phone);
    }

    if (updates.length === 0) return;

    values.push(userId);
    await pool.query(
      `UPDATE users SET ${updates.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = $${paramCount}`,
      values
    );
  },

  async getApiKey(userId: string) {
    const result = await pool.query(
      'SELECT api_key FROM api_keys WHERE user_id = $1 AND is_active = true ORDER BY created_at DESC LIMIT 1',
      [userId]
    );
    return result.rows[0]?.api_key || null;
  },

  async regenerateApiKey(userId: string) {
    const newApiKey = `qwen_${uuidv4().replace(/-/g, '')}`;
    
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      
      await client.query(
        'UPDATE api_keys SET is_active = false WHERE user_id = $1',
        [userId]
      );
      
      await client.query(
        'INSERT INTO api_keys (user_id, api_key) VALUES ($1, $2)',
        [userId, newApiKey]
      );
      
      await client.query('COMMIT');
      return newApiKey;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }
};
