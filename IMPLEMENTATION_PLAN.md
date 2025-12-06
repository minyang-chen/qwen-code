# Team Workspace - Implementation Plan & Tasks

## Project Overview

**Project Name**: Qwen Code Team Workspace Feature
**Duration**: 31-46 days (6-9 weeks)
**Team Size**: 2-4 developers (1 backend, 1 frontend, 1 full-stack, 1 QA)

---

## Sprint Structure

- **Sprint Duration**: 2 weeks
- **Total Sprints**: 3-4 sprints
- **Sprint 0**: Setup & Planning (3-5 days)
- **Sprint 1**: Backend Core (10-12 days)
- **Sprint 2**: Frontend & Integration (10-14 days)
- **Sprint 3**: Testing & Deployment (8-10 days)

---

## Phase 1: Database & Infrastructure Setup (3-5 days)

### Task 1.1: PostgreSQL Schema Setup
**Priority**: P0 (Critical)
**Assignee**: Backend Developer
**Estimated Time**: 4 hours
**Dependencies**: None

**Acceptance Criteria:**
- [ ] PostgreSQL container running with pgvector extension
- [ ] All 5 tables created (users, teams, team_members, api_keys, file_embeddings)
- [ ] All indexes created successfully
- [ ] Foreign key constraints working
- [ ] Can connect from backend application

**Implementation Steps:**
1. Verify `infrastructure/init-db/01-init.sql` is correct
2. Start PostgreSQL container: `docker-compose -f infrastructure/infrastructure.yml up -d postgres`
3. Connect and verify: `psql -h localhost -U admin -d qwen_users`
4. Run: `\dt` to list tables
5. Run: `\d+ file_embeddings` to verify vector column
6. Test insert/select on each table

**Testing:**
```sql
-- Test vector extension
SELECT * FROM pg_extension WHERE extname = 'vector';

-- Test insert user
INSERT INTO users (username, email, full_name, password_hash, nfs_workspace_path)
VALUES ('test_user', 'test@example.com', 'Test User', 'hash123', '/private/test');

-- Test vector insert
INSERT INTO file_embeddings (file_path, file_name, workspace_type, owner_id, content_hash, embedding)
VALUES ('/test/file.txt', 'file.txt', 'private', 
        (SELECT id FROM users WHERE username='test_user'), 
        'abc123', '[0.1, 0.2, 0.3]'::vector);
```

---

### Task 1.2: MongoDB Collections Setup
**Priority**: P0 (Critical)
**Assignee**: Backend Developer
**Estimated Time**: 2 hours
**Dependencies**: None

**Acceptance Criteria:**
- [ ] MongoDB container running
- [ ] Database `qwen_sessions` created
- [ ] Collections `user_sessions` and `team_sessions` created
- [ ] Indexes on session_token and user_id fields
- [ ] TTL index for automatic session expiration

**Implementation Steps:**
1. Start MongoDB: `docker-compose -f infrastructure/infrastructure.yml up -d mongodb`
2. Connect: `mongosh mongodb://admin:changeme@localhost:27017`
3. Create database and collections
4. Create indexes

**MongoDB Setup Script:**
```javascript
// Create database
use qwen_sessions;

// Create user_sessions collection with schema validation
db.createCollection("user_sessions", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["user_id", "session_token", "workspace_path", "created_at", "expires_at"],
      properties: {
        user_id: { bsonType: "string" },
        session_token: { bsonType: "string" },
        workspace_path: { bsonType: "string" },
        created_at: { bsonType: "date" },
        expires_at: { bsonType: "date" },
        last_activity: { bsonType: "date" }
      }
    }
  }
});

// Create indexes
db.user_sessions.createIndex({ "session_token": 1 }, { unique: true });
db.user_sessions.createIndex({ "user_id": 1 });
db.user_sessions.createIndex({ "expires_at": 1 }, { expireAfterSeconds: 0 });

// Create team_sessions collection
db.createCollection("team_sessions", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["user_id", "team_id", "session_token", "workspace_path", "created_at", "expires_at"],
      properties: {
        user_id: { bsonType: "string" },
        team_id: { bsonType: "string" },
        session_token: { bsonType: "string" },
        workspace_path: { bsonType: "string" },
        created_at: { bsonType: "date" },
        expires_at: { bsonType: "date" },
        last_activity: { bsonType: "date" }
      }
    }
  }
});

// Create indexes
db.team_sessions.createIndex({ "session_token": 1 }, { unique: true });
db.team_sessions.createIndex({ "user_id": 1 });
db.team_sessions.createIndex({ "team_id": 1 });
db.team_sessions.createIndex({ "expires_at": 1 }, { expireAfterSeconds: 0 });
```

---

### Task 1.3: NFS Server Setup
**Priority**: P0 (Critical)
**Assignee**: DevOps/Backend Developer
**Estimated Time**: 3 hours
**Dependencies**: None

**Acceptance Criteria:**
- [ ] NFS server container running
- [ ] Directory structure created: `/nfs-data/private` and `/nfs-data/shared`
- [ ] Proper permissions set (700 for private, 770 for shared)
- [ ] Can mount NFS share from host
- [ ] Can create/read/write/delete files

**Implementation Steps:**
1. Start NFS server: `docker-compose -f infrastructure/infrastructure.yml up -d nfs-server`
2. Create directory structure
3. Set permissions
4. Test NFS mount

**Setup Commands:**
```bash
# Create directories
mkdir -p nfs-data/private nfs-data/shared

# Set permissions
chmod 755 nfs-data/private nfs-data/shared

# Test NFS server
docker exec team-nfs-server ls -la /data

# Test creating a user workspace
mkdir -p nfs-data/private/test-user-id
echo "test file" > nfs-data/private/test-user-id/test.txt
cat nfs-data/private/test-user-id/test.txt
```

---

### Task 1.4: Backend Project Initialization
**Priority**: P0 (Critical)
**Assignee**: Backend Developer
**Estimated Time**: 4 hours
**Dependencies**: None

**Acceptance Criteria:**
- [ ] Node.js project initialized in `packages/backend`
- [ ] All dependencies installed
- [ ] TypeScript configured
- [ ] Environment variables setup
- [ ] Database connections working
- [ ] Basic Express server running

**Implementation Steps:**
1. Create backend project structure
2. Initialize npm project
3. Install dependencies
4. Configure TypeScript
5. Setup environment variables
6. Create database connection modules

**Project Structure:**
```
packages/backend/
├── package.json
├── tsconfig.json
├── .env.example
├── src/
│   ├── index.ts
│   ├── config/
│   │   ├── database.ts
│   │   └── env.ts
│   ├── controllers/
│   ├── services/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   └── utils/
└── tests/
```

**package.json:**
```json
{
  "name": "@qwen-code/backend",
  "version": "1.0.0",
  "scripts": {
    "dev": "tsx watch src/index.ts",
    "build": "tsc",
    "start": "node dist/index.js"
  },
  "dependencies": {
    "express": "^4.18.2",
    "pg": "^8.11.3",
    "pgvector": "^0.1.8",
    "mongoose": "^8.0.3",
    "bcrypt": "^5.1.1",
    "jsonwebtoken": "^9.0.2",
    "multer": "^1.4.5-lts.1",
    "openai": "^4.20.1",
    "dotenv": "^16.3.1",
    "cors": "^2.8.5",
    "helmet": "^7.1.0",
    "express-rate-limit": "^7.1.5"
  },
  "devDependencies": {
    "@types/express": "^4.17.21",
    "@types/node": "^20.10.6",
    "@types/bcrypt": "^5.0.2",
    "@types/jsonwebtoken": "^9.0.5",
    "@types/multer": "^1.4.11",
    "typescript": "^5.3.3",
    "tsx": "^4.7.0"
  }
}
```

**.env.example:**
```env
# Server
PORT=3001
NODE_ENV=development

# PostgreSQL
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_USER=admin
POSTGRES_PASSWORD=changeme
POSTGRES_DB=qwen_users

# MongoDB
MONGODB_URI=mongodb://admin:changeme@localhost:27017/qwen_sessions?authSource=admin

# NFS
NFS_BASE_PATH=./nfs-data

# JWT
JWT_SECRET=your-secret-key-change-in-production
JWT_EXPIRES_IN=24h

# OpenAI (for embeddings)
OPENAI_API_KEY=your-openai-api-key

# Security
BCRYPT_ROUNDS=10
```

---

## Phase 2: Backend API Development (7-10 days)

### Task 2.1: User Registration Endpoint
**Priority**: P0 (Critical)
**Assignee**: Backend Developer
**Estimated Time**: 6 hours
**Dependencies**: Task 1.1, 1.4

**Acceptance Criteria:**
- [ ] POST `/api/auth/signup` endpoint implemented
- [ ] Input validation (username, email, password strength)
- [ ] Duplicate username/email check
- [ ] Password hashing with bcrypt
- [ ] User record created in PostgreSQL
- [ ] Returns user_id and success message
- [ ] Error handling for all edge cases

**Implementation:**

**File: `src/controllers/authController.ts`**
```typescript
import { Request, Response } from 'express';
import { userService } from '../services/userService';
import { validateSignup } from '../utils/validation';

export const signup = async (req: Request, res: Response) => {
  try {
    const { username, email, full_name, phone, password } = req.body;
    
    // Validate input
    const validation = validateSignup(req.body);
    if (!validation.valid) {
      return res.status(400).json({ error: validation.errors });
    }
    
    // Check if user exists
    const existingUser = await userService.findByUsernameOrEmail(username, email);
    if (existingUser) {
      return res.status(409).json({ 
        error: { 
          code: 'USER_EXISTS', 
          message: 'Username or email already exists' 
        } 
      });
    }
    
    // Create user
    const user = await userService.createUser({
      username,
      email,
      full_name,
      phone,
      password
    });
    
    res.status(201).json({
      user_id: user.id,
      message: 'User registered successfully'
    });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ 
      error: { 
        code: 'INTERNAL_ERROR', 
        message: 'Failed to register user' 
      } 
    });
  }
};
```

**File: `src/services/userService.ts`**
```typescript
import bcrypt from 'bcrypt';
import { pool } from '../config/database';
import { v4 as uuidv4 } from 'uuid';

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
  
  async createUser(input: CreateUserInput) {
    const userId = uuidv4();
    const passwordHash = await bcrypt.hash(input.password, 10);
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
```

**Testing:**
```bash
curl -X POST http://localhost:3001/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "username": "john_doe",
    "email": "john@example.com",
    "full_name": "John Doe",
    "phone": "+1234567890",
    "password": "SecurePass123!"
  }'
```

---

### Task 2.2: User Onboarding (API Key + NFS Workspace)
**Priority**: P0 (Critical)
**Assignee**: Backend Developer
**Estimated Time**: 6 hours
**Dependencies**: Task 2.1, 1.3

**Acceptance Criteria:**
- [ ] API key generated on user registration
- [ ] API key stored in `api_keys` table
- [ ] NFS private workspace directory created
- [ ] Workspace permissions set correctly (700)
- [ ] API key returned in signup response
- [ ] Idempotent (can handle retries)

**Implementation:**

**File: `src/services/apiKeyService.ts`**
```typescript
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
```

**File: `src/services/nfsService.ts`**
```typescript
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
```

**Update `authController.ts` signup:**
```typescript
// After creating user
const apiKey = await apiKeyService.createApiKey(user.id);
await nfsService.createPrivateWorkspace(user.id);

res.status(201).json({
  user_id: user.id,
  api_key: apiKey,
  workspace_path: user.nfs_workspace_path,
  message: 'User registered successfully'
});
```

---

### Task 2.3: User Login Endpoint
**Priority**: P0 (Critical)
**Assignee**: Backend Developer
**Estimated Time**: 5 hours
**Dependencies**: Task 2.1, 1.2

**Acceptance Criteria:**
- [ ] POST `/api/auth/login` endpoint implemented
- [ ] Username/password validation
- [ ] Password verification with bcrypt
- [ ] JWT session token generated
- [ ] Session stored in MongoDB
- [ ] Returns session_token, user_id, workspace_path, teams
- [ ] Rate limiting (5 attempts per 15 minutes)

**Implementation:**

**File: `src/services/sessionService.ts`**
```typescript
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import { JWT_SECRET, JWT_EXPIRES_IN } from '../config/env';

const userSessionSchema = new mongoose.Schema({
  user_id: { type: String, required: true },
  session_token: { type: String, required: true, unique: true },
  workspace_path: { type: String, required: true },
  created_at: { type: Date, default: Date.now },
  expires_at: { type: Date, required: true },
  last_activity: { type: Date, default: Date.now }
});

const UserSession = mongoose.model('user_sessions', userSessionSchema);

export const sessionService = {
  async createUserSession(userId: string, workspacePath: string) {
    const sessionToken = jwt.sign({ userId }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
    
    const session = new UserSession({
      user_id: userId,
      session_token: sessionToken,
      workspace_path: workspacePath,
      expires_at: expiresAt
    });
    
    await session.save();
    return sessionToken;
  },
  
  async validateSession(sessionToken: string) {
    try {
      const decoded = jwt.verify(sessionToken, JWT_SECRET) as { userId: string };
      const session = await UserSession.findOne({ 
        session_token: sessionToken,
        expires_at: { $gt: new Date() }
      });
      
      if (!session) return null;
      
      // Update last activity
      session.last_activity = new Date();
      await session.save();
      
      return decoded.userId;
    } catch (error) {
      return null;
    }
  }
};
```

**File: `src/controllers/authController.ts` (add login):**
```typescript
export const login = async (req: Request, res: Response) => {
  try {
    const { username, password } = req.body;
    
    // Find user
    const user = await userService.findByUsername(username);
    if (!user) {
      return res.status(401).json({ 
        error: { code: 'INVALID_CREDENTIALS', message: 'Invalid username or password' } 
      });
    }
    
    // Verify password
    const isValid = await bcrypt.compare(password, user.password_hash);
    if (!isValid) {
      return res.status(401).json({ 
        error: { code: 'INVALID_CREDENTIALS', message: 'Invalid username or password' } 
      });
    }
    
    // Create session
    const sessionToken = await sessionService.createUserSession(user.id, user.nfs_workspace_path);
    
    // Get user teams
    const teams = await teamService.getUserTeams(user.id);
    
    res.json({
      session_token: sessionToken,
      user_id: user.id,
      workspace_path: user.nfs_workspace_path,
      teams: teams.map(t => t.id)
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ 
      error: { code: 'INTERNAL_ERROR', message: 'Login failed' } 
    });
  }
};
```

---

