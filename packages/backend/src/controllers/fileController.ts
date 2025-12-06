import { Request, Response } from 'express';
import multer from 'multer';
import fs from 'fs/promises';
import { fileService } from '../services/fileService';
import { teamService } from '../services/teamService';
import { userService } from '../services/userService';
import { embeddingService } from '../services/embeddingService';

const upload = multer({ dest: '/tmp/uploads', limits: { fileSize: 100 * 1024 * 1024 } });

export const listFiles = async (req: Request, res: Response) => {
  try {
    const { workspace_type, team_id } = req.query;
    const userId = (req as any).user.id;
    
    let workspacePath: string;
    
    if (workspace_type === 'team' && team_id) {
      const isMember = await teamService.isMember(team_id as string, userId);
      if (!isMember) {
        return res.status(403).json({ error: { code: 'ACCESS_DENIED', message: 'Not a team member' } });
      }
      const team = await teamService.findById(team_id as string);
      workspacePath = team.nfs_workspace_path;
    } else {
      const user = await userService.findById(userId);
      workspacePath = user.nfs_workspace_path;
    }
    
    const files = await fileService.listFiles(workspacePath);
    res.json({ files });
  } catch (error) {
    console.error('List files error:', error);
    res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: 'Failed to list files' } });
  }
};

export const uploadFile = [
  upload.single('file'),
  async (req: Request, res: Response) => {
    try {
      const { workspace_type, team_id } = req.body;
      const userId = (req as any).user.id;
      const file = req.file;
      
      if (!file) {
        return res.status(400).json({ error: { code: 'NO_FILE', message: 'No file provided' } });
      }
      
      let workspacePath: string;
      let ownerId: string | null = null;
      let teamIdValue: string | null = null;
      
      if (workspace_type === 'team' && team_id) {
        const isMember = await teamService.isMember(team_id, userId);
        if (!isMember) {
          return res.status(403).json({ error: { code: 'ACCESS_DENIED', message: 'Not a team member' } });
        }
        const team = await teamService.findById(team_id);
        workspacePath = team.nfs_workspace_path;
        teamIdValue = team_id;
      } else {
        const user = await userService.findById(userId);
        workspacePath = user.nfs_workspace_path;
        ownerId = userId;
      }
      
      const savedFile = await fileService.saveFile(file, workspacePath, ownerId, teamIdValue);
      
      // Auto-generate embedding (async, non-blocking)
      setImmediate(async () => {
        try {
          const fullPath = await fileService.getFullPath(savedFile.path);
          const content = await fs.readFile(fullPath, 'utf-8').catch(() => '');
          if (content) {
            const embedding = await embeddingService.generateEmbedding(content);
            await embeddingService.storeFileEmbedding(
              savedFile.path,
              savedFile.name,
              workspace_type === 'team' ? 'team' : 'private',
              ownerId,
              teamIdValue,
              savedFile.hash,
              embedding
            );
          }
        } catch (error) {
          console.error('Embedding generation failed:', error);
        }
      });
      
      res.json({ message: 'File uploaded successfully', file: savedFile });
    } catch (error) {
      console.error('Upload file error:', error);
      res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: 'Failed to upload file' } });
    }
  }
];

export const downloadFile = async (req: Request, res: Response) => {
  try {
    const { path: filePath } = req.query;
    const userId = (req as any).user.id;
    
    const hasAccess = await fileService.verifyAccess(filePath as string, userId);
    if (!hasAccess) {
      return res.status(403).json({ error: { code: 'ACCESS_DENIED', message: 'Access denied' } });
    }
    
    const fullPath = await fileService.getFullPath(filePath as string);
    res.download(fullPath);
  } catch (error) {
    console.error('Download file error:', error);
    res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: 'Failed to download file' } });
  }
};

export const deleteFile = async (req: Request, res: Response) => {
  try {
    const { path: filePath } = req.body;
    const userId = (req as any).user.id;
    
    const hasAccess = await fileService.verifyAccess(filePath, userId);
    if (!hasAccess) {
      return res.status(403).json({ error: { code: 'ACCESS_DENIED', message: 'Access denied' } });
    }
    
    await fileService.deleteFile(filePath);
    res.json({ message: 'File deleted successfully' });
  } catch (error) {
    console.error('Delete file error:', error);
    res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: 'Failed to delete file' } });
  }
};

export const searchFiles = async (req: Request, res: Response) => {
  try {
    const { query, workspace_type, team_id, limit = 10 } = req.body;
    const userId = (req as any).user.id;
    
    if (workspace_type === 'team' && team_id) {
      const isMember = await teamService.isMember(team_id, userId);
      if (!isMember) {
        return res.status(403).json({ error: { code: 'ACCESS_DENIED', message: 'Not a team member' } });
      }
    }
    
    const queryEmbedding = await embeddingService.generateEmbedding(query);
    const results = await embeddingService.searchSimilarFiles(
      queryEmbedding,
      workspace_type,
      userId,
      team_id,
      limit
    );
    
    // Read file content for each result
    const fs = require('fs').promises;
    const enrichedResults = await Promise.all(
      results.map(async (result: any) => {
        try {
          const content = await fs.readFile(result.file_path, 'utf-8');
          const preview = content.substring(0, 300);
          return {
            ...result,
            content_preview: preview,
            similarity_score: (result.similarity_score * 100).toFixed(1)
          };
        } catch (err) {
          return {
            ...result,
            content_preview: 'Unable to read file content',
            similarity_score: (result.similarity_score * 100).toFixed(1)
          };
        }
      })
    );
    
    res.json({ results: enrichedResults });
  } catch (error) {
    console.error('Search files error:', error);
    res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: 'Search failed' } });
  }
};
