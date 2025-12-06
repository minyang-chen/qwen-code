import fs from 'fs/promises';
import path from 'path';
import crypto from 'crypto';
import { NFS_BASE_PATH } from '../config/env';
import { pool } from '../config/database';

export const fileService = {
  async listFiles(workspacePath: string) {
    const fullPath = path.join(NFS_BASE_PATH, workspacePath);
    try {
      const entries = await fs.readdir(fullPath, { withFileTypes: true });
      return entries.map(entry => ({
        name: entry.name,
        path: path.join(workspacePath, entry.name),
        isDirectory: entry.isDirectory()
      }));
    } catch {
      return [];
    }
  },

  async saveFile(file: Express.Multer.File, workspacePath: string, ownerId: string | null, teamId: string | null) {
    const destPath = path.join(NFS_BASE_PATH, workspacePath, file.originalname);
    await fs.copyFile(file.path, destPath);
    await fs.unlink(file.path);
    
    const fileBuffer = await fs.readFile(destPath);
    const hash = crypto.createHash('sha256').update(fileBuffer).digest('hex');
    
    return {
      name: file.originalname,
      path: path.join(workspacePath, file.originalname),
      size: file.size,
      hash
    };
  },

  async verifyAccess(filePath: string, userId: string): Promise<boolean> {
    if (filePath.startsWith('/private/')) {
      return filePath.split('/')[2] === userId;
    }
    if (filePath.startsWith('/shared/')) {
      const teamId = filePath.split('/')[2];
      const result = await pool.query(
        'SELECT id FROM team_members WHERE team_id = $1 AND user_id = $2',
        [teamId, userId]
      );
      return result.rows.length > 0;
    }
    return false;
  },

  async getFullPath(filePath: string): Promise<string> {
    return path.join(NFS_BASE_PATH, filePath);
  },

  async deleteFile(filePath: string) {
    const fullPath = path.join(NFS_BASE_PATH, filePath);
    await fs.unlink(fullPath);
  }
};
