import fs from 'fs/promises';
import path from 'path';
import { NFS_BASE_PATH } from '../config/env';

export const nfsService = {
  async createPrivateWorkspace(userId: string): Promise<string> {
    const workspacePath = path.join(NFS_BASE_PATH, 'private', userId);
    
    try {
      await fs.mkdir(workspacePath, { recursive: true, mode: 0o700 });
      return `/private/${userId}`;
    } catch (error) {
      console.error('Failed to create workspace:', error);
      throw new Error('Workspace creation failed');
    }
  },
  
  async createTeamWorkspace(teamId: string): Promise<string> {
    const workspacePath = path.join(NFS_BASE_PATH, 'shared', teamId);
    
    try {
      await fs.mkdir(workspacePath, { recursive: true, mode: 0o770 });
      return `/shared/${teamId}`;
    } catch (error) {
      console.error('Failed to create team workspace:', error);
      throw new Error('Team workspace creation failed');
    }
  }
};
