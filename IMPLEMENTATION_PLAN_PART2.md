# Implementation Plan - Part 2

## Phase 2 (Continued): Backend API Development

### Task 2.4: Team Creation Endpoint
**Priority**: P1 (High)
**Assignee**: Backend Developer
**Estimated Time**: 5 hours
**Dependencies**: Task 2.3

**Acceptance Criteria:**
- [ ] POST `/api/teams/create` endpoint implemented
- [ ] Team name uniqueness validation
- [ ] Team record created in PostgreSQL
- [ ] Creator automatically added as team member with 'admin' role
- [ ] Returns team_id and workspace_path
- [ ] Requires authentication

**Implementation:**

**File: `src/controllers/teamController.ts`**
```typescript
import { Request, Response } from 'express';
import { teamService } from '../services/teamService';

export const createTeam = async (req: Request, res: Response) => {
  try {
    const { team_name, specialization, description, attachments } = req.body;
    const userId = req.user.id; // From auth middleware
    
    // Check if team name exists
    const existing = await teamService.findByName(team_name);
    if (existing) {
      return res.status(409).json({ 
        error: { code: 'TEAM_EXISTS', message: 'Team name already exists' } 
      });
    }
    
    // Create team
    const team = await teamService.createTeam({
      team_name,
      specialization,
      description,
      created_by: userId
    });
    
    res.status(201).json({
      team_id: team.id,
      workspace_path: team.nfs_workspace_path,
      message: 'Team created successfully'
    });
  } catch (error) {
    console.error('Team creation error:', error);
    res.status(500).json({ 
      error: { code: 'INTERNAL_ERROR', message: 'Failed to create team' } 
    });
  }
};
```

**File: `src/services/teamService.ts`**
```typescript
import { pool } from '../config/database';
import { v4 as uuidv4 } from 'uuid';
import { nfsService } from './nfsService';

interface CreateTeamInput {
  team_name: string;
  specialization?: string;
  description?: string;
  created_by: string;
}

export const teamService = {
  async findByName(teamName: string) {
    const result = await pool.query(
      'SELECT id FROM teams WHERE team_name = $1',
      [teamName]
    );
    return result.rows[0];
  },
  
  async createTeam(input: CreateTeamInput) {
    const teamId = uuidv4();
    const workspacePath = `/shared/${teamId}`;
    
    // Start transaction
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      
      // Create team
      const teamResult = await client.query(
        `INSERT INTO teams (id, team_name, specialization, description, nfs_workspace_path, created_by)
         VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING id, team_name, nfs_workspace_path, created_at`,
        [teamId, input.team_name, input.specialization, input.description, workspacePath, input.created_by]
      );
      
      // Add creator as admin member
      await client.query(
        `INSERT INTO team_members (team_id, user_id, role)
         VALUES ($1, $2, 'admin')`,
        [teamId, input.created_by]
      );
      
      await client.query('COMMIT');
      
      // Create NFS workspace
      await nfsService.createTeamWorkspace(teamId);
      
      return teamResult.rows[0];
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  },
  
  async getUserTeams(userId: string) {
    const result = await pool.query(
      `SELECT t.id, t.team_name, t.specialization, tm.role
       FROM teams t
       JOIN team_members tm ON t.id = tm.team_id
       WHERE tm.user_id = $1 AND t.is_active = true`,
      [userId]
    );
    return result.rows;
  }
};
```

---

### Task 2.5: Team Join Endpoint
**Priority**: P1 (High)
**Assignee**: Backend Developer
**Estimated Time**: 4 hours
**Dependencies**: Task 2.4

**Acceptance Criteria:**
- [ ] POST `/api/teams/join` endpoint implemented
- [ ] Team existence validation
- [ ] Duplicate membership check
- [ ] User added to team_members table
- [ ] Returns team workspace path
- [ ] Requires authentication

**Implementation:**

**File: `src/controllers/teamController.ts` (add):**
```typescript
export const joinTeam = async (req: Request, res: Response) => {
  try {
    const { team_id } = req.body;
    const userId = req.user.id;
    
    // Check if team exists
    const team = await teamService.findById(team_id);
    if (!team) {
      return res.status(404).json({ 
        error: { code: 'TEAM_NOT_FOUND', message: 'Team not found' } 
      });
    }
    
    // Check if already a member
    const isMember = await teamService.isMember(team_id, userId);
    if (isMember) {
      return res.status(409).json({ 
        error: { code: 'ALREADY_MEMBER', message: 'Already a team member' } 
      });
    }
    
    // Add member
    await teamService.addMember(team_id, userId);
    
    res.json({
      team_id: team.id,
      workspace_path: team.nfs_workspace_path,
      message: 'Joined team successfully'
    });
  } catch (error) {
    console.error('Join team error:', error);
    res.status(500).json({ 
      error: { code: 'INTERNAL_ERROR', message: 'Failed to join team' } 
    });
  }
};
```

**File: `src/services/teamService.ts` (add):**
```typescript
async findById(teamId: string) {
  const result = await pool.query(
    'SELECT id, team_name, nfs_workspace_path FROM teams WHERE id = $1 AND is_active = true',
    [teamId]
  );
  return result.rows[0];
},

async isMember(teamId: string, userId: string): Promise<boolean> {
  const result = await pool.query(
    'SELECT id FROM team_members WHERE team_id = $1 AND user_id = $2',
    [teamId, userId]
  );
  return result.rows.length > 0;
},

async addMember(teamId: string, userId: string) {
  await pool.query(
    `INSERT INTO team_members (team_id, user_id, role)
     VALUES ($1, $2, 'member')`,
    [teamId, userId]
  );
}
```

---

### Task 2.6: Team Sign-in Endpoint
**Priority**: P1 (High)
**Assignee**: Backend Developer
**Estimated Time**: 4 hours
**Dependencies**: Task 2.5

**Acceptance Criteria:**
- [ ] POST `/api/teams/signin` endpoint implemented
- [ ] User credentials validated
- [ ] Team membership verified
- [ ] Team session created in MongoDB
- [ ] Returns session_token and team workspace path

**Implementation:**

**File: `src/controllers/teamController.ts` (add):**
```typescript
export const teamSignin = async (req: Request, res: Response) => {
  try {
    const { team_id, username, password } = req.body;
    
    // Validate user credentials
    const user = await userService.findByUsername(username);
    if (!user || !(await bcrypt.compare(password, user.password_hash))) {
      return res.status(401).json({ 
        error: { code: 'INVALID_CREDENTIALS', message: 'Invalid credentials' } 
      });
    }
    
    // Check team membership
    const isMember = await teamService.isMember(team_id, user.id);
    if (!isMember) {
      return res.status(403).json({ 
        error: { code: 'NOT_MEMBER', message: 'Not a team member' } 
      });
    }
    
    // Get team info
    const team = await teamService.findById(team_id);
    
    // Create team session
    const sessionToken = await sessionService.createTeamSession(
      user.id, 
      team_id, 
      team.nfs_workspace_path
    );
    
    res.json({
      session_token: sessionToken,
      team_id: team.id,
      workspace_path: team.nfs_workspace_path
    });
  } catch (error) {
    console.error('Team signin error:', error);
    res.status(500).json({ 
      error: { code: 'INTERNAL_ERROR', message: 'Team signin failed' } 
    });
  }
};
```

**File: `src/services/sessionService.ts` (add):**
```typescript
const teamSessionSchema = new mongoose.Schema({
  user_id: { type: String, required: true },
  team_id: { type: String, required: true },
  session_token: { type: String, required: true, unique: true },
  workspace_path: { type: String, required: true },
  created_at: { type: Date, default: Date.now },
  expires_at: { type: Date, required: true },
  last_activity: { type: Date, default: Date.now }
});

const TeamSession = mongoose.model('team_sessions', teamSessionSchema);

async createTeamSession(userId: string, teamId: string, workspacePath: string) {
  const sessionToken = jwt.sign({ userId, teamId }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
  
  const session = new TeamSession({
    user_id: userId,
    team_id: teamId,
    session_token: sessionToken,
    workspace_path: workspacePath,
    expires_at: expiresAt
  });
  
  await session.save();
  return sessionToken;
}
```

---

### Task 2.7: File Operations Endpoints
**Priority**: P0 (Critical)
**Assignee**: Backend Developer
**Estimated Time**: 8 hours
**Dependencies**: Task 2.3, 2.6

**Acceptance Criteria:**
- [ ] GET `/api/files/list` - List files in workspace
- [ ] POST `/api/files/upload` - Upload file with multipart/form-data
- [ ] GET `/api/files/download` - Download file
- [ ] DELETE `/api/files/delete` - Delete file
- [ ] Access control based on workspace type
- [ ] File size limit enforced (100MB)

**Implementation:**

**File: `src/controllers/fileController.ts`**
```typescript
import { Request, Response } from 'express';
import { fileService } from '../services/fileService';
import multer from 'multer';
import path from 'path';

const upload = multer({
  dest: '/tmp/uploads',
  limits: { fileSize: 100 * 1024 * 1024 } // 100MB
});

export const listFiles = async (req: Request, res: Response) => {
  try {
    const { workspace_type, team_id } = req.query;
    const userId = req.user.id;
    
    let workspacePath: string;
    
    if (workspace_type === 'team') {
      // Verify team membership
      const isMember = await teamService.isMember(team_id as string, userId);
      if (!isMember) {
        return res.status(403).json({ 
          error: { code: 'ACCESS_DENIED', message: 'Not a team member' } 
        });
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
    res.status(500).json({ 
      error: { code: 'INTERNAL_ERROR', message: 'Failed to list files' } 
    });
  }
};

export const uploadFile = [
  upload.single('file'),
  async (req: Request, res: Response) => {
    try {
      const { workspace_type, team_id } = req.body;
      const userId = req.user.id;
      const file = req.file;
      
      if (!file) {
        return res.status(400).json({ 
          error: { code: 'NO_FILE', message: 'No file provided' } 
        });
      }
      
      let workspacePath: string;
      let ownerId: string | null = null;
      let teamIdValue: string | null = null;
      
      if (workspace_type === 'team') {
        const isMember = await teamService.isMember(team_id, userId);
        if (!isMember) {
          return res.status(403).json({ 
            error: { code: 'ACCESS_DENIED', message: 'Not a team member' } 
          });
        }
        const team = await teamService.findById(team_id);
        workspacePath = team.nfs_workspace_path;
        teamIdValue = team_id;
      } else {
        const user = await userService.findById(userId);
        workspacePath = user.nfs_workspace_path;
        ownerId = userId;
      }
      
      const savedFile = await fileService.saveFile(
        file,
        workspacePath,
        workspace_type,
        ownerId,
        teamIdValue
      );
      
      res.json({
        message: 'File uploaded successfully',
        file: savedFile
      });
    } catch (error) {
      console.error('Upload file error:', error);
      res.status(500).json({ 
        error: { code: 'INTERNAL_ERROR', message: 'Failed to upload file' } 
      });
    }
  }
];

export const downloadFile = async (req: Request, res: Response) => {
  try {
    const { path: filePath } = req.query;
    const userId = req.user.id;
    
    // Verify access
    const hasAccess = await fileService.verifyAccess(filePath as string, userId);
    if (!hasAccess) {
      return res.status(403).json({ 
        error: { code: 'ACCESS_DENIED', message: 'Access denied' } 
      });
    }
    
    const fullPath = await fileService.getFullPath(filePath as string);
    res.download(fullPath);
  } catch (error) {
    console.error('Download file error:', error);
    res.status(500).json({ 
      error: { code: 'INTERNAL_ERROR', message: 'Failed to download file' } 
    });
  }
};

export const deleteFile = async (req: Request, res: Response) => {
  try {
    const { path: filePath } = req.body;
    const userId = req.user.id;
    
    // Verify access
    const hasAccess = await fileService.verifyAccess(filePath, userId);
    if (!hasAccess) {
      return res.status(403).json({ 
        error: { code: 'ACCESS_DENIED', message: 'Access denied' } 
      });
    }
    
    await fileService.deleteFile(filePath);
    
    res.json({ message: 'File deleted successfully' });
  } catch (error) {
    console.error('Delete file error:', error);
    res.status(500).json({ 
      error: { code: 'INTERNAL_ERROR', message: 'Failed to delete file' } 
    });
  }
};
```

**File: `src/services/fileService.ts`**
```typescript
import fs from 'fs/promises';
import path from 'path';
import crypto from 'crypto';
import { NFS_BASE_PATH } from '../config/env';
import { pool } from '../config/database';

export const fileService = {
  async listFiles(workspacePath: string) {
    const fullPath = path.join(NFS_BASE_PATH, workspacePath);
    const entries = await fs.readdir(fullPath, { withFileTypes: true });
    
    const files = await Promise.all(
      entries.map(async (entry) => {
        const stats = await fs.stat(path.join(fullPath, entry.name));
        return {
          name: entry.name,
          path: path.join(workspacePath, entry.name),
          size: stats.size,
          modified_at: stats.mtime,
          is_directory: entry.isDirectory()
        };
      })
    );
    
    return files;
  },
  
  async saveFile(
    file: Express.Multer.File,
    workspacePath: string,
    workspaceType: string,
    ownerId: string | null,
    teamId: string | null
  ) {
    const destPath = path.join(NFS_BASE_PATH, workspacePath, file.originalname);
    await fs.copyFile(file.path, destPath);
    await fs.unlink(file.path); // Clean up temp file
    
    // Generate file hash
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
      const userIdFromPath = filePath.split('/')[2];
      return userIdFromPath === userId;
    } else if (filePath.startsWith('/shared/')) {
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
```

---

### Task 2.8: Authentication Middleware
**Priority**: P0 (Critical)
**Assignee**: Backend Developer
**Estimated Time**: 3 hours
**Dependencies**: Task 2.3

**Acceptance Criteria:**
- [ ] JWT token validation middleware
- [ ] User attached to request object
- [ ] Handles expired tokens
- [ ] Handles invalid tokens
- [ ] Returns 401 for unauthorized requests

**Implementation:**

**File: `src/middleware/authMiddleware.ts`**
```typescript
import { Request, Response, NextFunction } from 'express';
import { sessionService } from '../services/sessionService';
import { userService } from '../services/userService';

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        username: string;
      };
    }
  }
}

export const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ 
        error: { code: 'NO_TOKEN', message: 'Authentication required' } 
      });
    }
    
    const token = authHeader.substring(7);
    const userId = await sessionService.validateSession(token);
    
    if (!userId) {
      return res.status(401).json({ 
        error: { code: 'INVALID_TOKEN', message: 'Invalid or expired token' } 
      });
    }
    
    const user = await userService.findById(userId);
    req.user = {
      id: user.id,
      username: user.username
    };
    
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(401).json({ 
      error: { code: 'AUTH_ERROR', message: 'Authentication failed' } 
    });
  }
};
```

---

## Phase 3: Vector Search Integration (3-5 days)

### Task 3.1: Embedding Generation Service
**Priority**: P1 (High)
**Assignee**: Backend Developer
**Estimated Time**: 4 hours
**Dependencies**: Task 2.7

**Acceptance Criteria:**
- [ ] OpenAI embedding generation integrated
- [ ] Text extraction from various file types
- [ ] Embedding stored in file_embeddings table
- [ ] Error handling for API failures
- [ ] Batch processing support

**Implementation:**

**File: `src/services/embeddingService.ts`**
```typescript
import OpenAI from 'openai';
import { OPENAI_API_KEY } from '../config/env';
import { pool } from '../config/database';

const openai = new OpenAI({ apiKey: OPENAI_API_KEY });

export const embeddingService = {
  async generateEmbedding(text: string): Promise<number[]> {
    try {
      const response = await openai.embeddings.create({
        model: 'text-embedding-3-small',
        input: text.substring(0, 8000) // Limit input size
      });
      
      return response.data[0].embedding;
    } catch (error) {
      console.error('Embedding generation error:', error);
      throw new Error('Failed to generate embedding');
    }
  },
  
  async storeFileEmbedding(
    filePath: string,
    fileName: string,
    workspaceType: string,
    ownerId: string | null,
    teamId: string | null,
    contentHash: string,
    embedding: number[],
    metadata: any
  ) {
    await pool.query(
      `INSERT INTO file_embeddings 
       (file_path, file_name, workspace_type, owner_id, team_id, content_hash, embedding, metadata)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       ON CONFLICT (file_path) DO UPDATE SET
         embedding = EXCLUDED.embedding,
         content_hash = EXCLUDED.content_hash,
         updated_at = CURRENT_TIMESTAMP`,
      [filePath, fileName, workspaceType, ownerId, teamId, contentHash, `[${embedding.join(',')}]`, JSON.stringify(metadata)]
    );
  },
  
  async searchSimilarFiles(
    queryEmbedding: number[],
    workspaceType: string,
    userId: string,
    teamId: string | null,
    limit: number = 10
  ) {
    const embeddingStr = `[${queryEmbedding.join(',')}]`;
    
    let query: string;
    let params: any[];
    
    if (workspaceType === 'team' && teamId) {
      query = `
        SELECT file_path, file_name, metadata,
               1 - (embedding <=> $1::vector) as similarity_score
        FROM file_embeddings
        WHERE workspace_type = 'team' AND team_id = $2
        ORDER BY embedding <=> $1::vector
        LIMIT $3
      `;
      params = [embeddingStr, teamId, limit];
    } else {
      query = `
        SELECT file_path, file_name, metadata,
               1 - (embedding <=> $1::vector) as similarity_score
        FROM file_embeddings
        WHERE workspace_type = 'private' AND owner_id = $2
        ORDER BY embedding <=> $1::vector
        LIMIT $3
      `;
      params = [embeddingStr, userId, limit];
    }
    
    const result = await pool.query(query, params);
    return result.rows;
  }
};
```

---

### Task 3.2: File Search Endpoint
**Priority**: P1 (High)
**Assignee**: Backend Developer
**Estimated Time**: 3 hours
**Dependencies**: Task 3.1

**Acceptance Criteria:**
- [ ] POST `/api/files/search` endpoint implemented
- [ ] Query text converted to embedding
- [ ] Vector similarity search performed
- [ ] Results sorted by similarity score
- [ ] Access control enforced

**Implementation:**

**File: `src/controllers/fileController.ts` (add):**
```typescript
export const searchFiles = async (req: Request, res: Response) => {
  try {
    const { query, workspace_type, team_id, limit = 10 } = req.body;
    const userId = req.user.id;
    
    // Verify access
    if (workspace_type === 'team') {
      const isMember = await teamService.isMember(team_id, userId);
      if (!isMember) {
        return res.status(403).json({ 
          error: { code: 'ACCESS_DENIED', message: 'Not a team member' } 
        });
      }
    }
    
    // Generate query embedding
    const queryEmbedding = await embeddingService.generateEmbedding(query);
    
    // Search similar files
    const results = await embeddingService.searchSimilarFiles(
      queryEmbedding,
      workspace_type,
      userId,
      team_id,
      limit
    );
    
    res.json({ results });
  } catch (error) {
    console.error('Search files error:', error);
    res.status(500).json({ 
      error: { code: 'INTERNAL_ERROR', message: 'Search failed' } 
    });
  }
};
```

---

### Task 3.3: Auto-Embedding on Upload
**Priority**: P1 (High)
**Assignee**: Backend Developer
**Estimated Time**: 4 hours
**Dependencies**: Task 3.1, 2.7

**Acceptance Criteria:**
- [ ] Files automatically embedded on upload
- [ ] Text extraction for supported file types
- [ ] Async processing (non-blocking)
- [ ] Error handling doesn't block upload
- [ ] Embedding stored in database

**Implementation:**

Update `fileService.saveFile` to include embedding:

```typescript
async saveFile(
  file: Express.Multer.File,
  workspacePath: string,
  workspaceType: string,
  ownerId: string | null,
  teamId: string | null
) {
  const destPath = path.join(NFS_BASE_PATH, workspacePath, file.originalname);
  await fs.copyFile(file.path, destPath);
  await fs.unlink(file.path);
  
  const fileBuffer = await fs.readFile(destPath);
  const hash = crypto.createHash('sha256').update(fileBuffer).digest('hex');
  
  // Generate embedding asynchronously (don't block response)
  setImmediate(async () => {
    try {
      const content = await this.extractText(destPath, file.mimetype);
      if (content) {
        const embedding = await embeddingService.generateEmbedding(content);
        await embeddingService.storeFileEmbedding(
          path.join(workspacePath, file.originalname),
          file.originalname,
          workspaceType,
          ownerId,
          teamId,
          hash,
          embedding,
          { size: file.size, mimetype: file.mimetype }
        );
      }
    } catch (error) {
      console.error('Embedding generation failed:', error);
    }
  });
  
  return {
    name: file.originalname,
    path: path.join(workspacePath, file.originalname),
    size: file.size,
    hash
  };
},

async extractText(filePath: string, mimetype: string): Promise<string | null> {
  // Simple text extraction for text files
  if (mimetype.startsWith('text/') || 
      mimetype === 'application/json' ||
      mimetype === 'application/javascript') {
    return await fs.readFile(filePath, 'utf-8');
  }
  
  // For other types, return null (can be extended with libraries like pdf-parse)
  return null;
}
```

---

