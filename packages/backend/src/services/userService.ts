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
      'SELECT id, username, email, full_name, nfs_workspace_path FROM users WHERE id = $1',
      [userId]
    );
    return result.rows[0];
  },
  
  async createUser(input: CreateUserInput) {
    const userId = uuidv4();
    const passwordHash = await bcrypt.hash(input.password, BCRYPT_ROUNDS);
    const workspacePath = `/private/${userId}`;
    
    const result = await pool.query(
      `INSERT INTO users (id, username, email, full_name, phone, password_hash, nfs_workspace_path)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING id, username, email, full_name, nfs_workspace_path, created_at`,
      [userId, input.username, input.email, input.full_name, input.phone, passwordHash, workspacePath]
    );
    
    return result.rows[0];
  }
};
