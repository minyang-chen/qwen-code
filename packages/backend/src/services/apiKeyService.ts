import crypto from 'crypto';
import { pool } from '../config/database';

export const apiKeyService = {
  generateApiKey(): string {
    const randomBytes = crypto.randomBytes(24);
    return `qwen_${randomBytes.toString('hex')}`;
  },
  
  async createApiKey(userId: string): Promise<string> {
    const apiKey = this.generateApiKey();
    
    await pool.query(
      `INSERT INTO api_keys (user_id, api_key)
       VALUES ($1, $2)
       ON CONFLICT (api_key) DO NOTHING`,
      [userId, apiKey]
    );
    
    return apiKey;
  },
  
  async validateApiKey(apiKey: string): Promise<string | null> {
    const result = await pool.query(
      `SELECT user_id FROM api_keys 
       WHERE api_key = $1 AND is_active = true 
       AND (expires_at IS NULL OR expires_at > NOW())`,
      [apiKey]
    );
    
    return result.rows[0]?.user_id || null;
  }
};
