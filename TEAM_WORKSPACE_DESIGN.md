# Team Workspace Feature - Design & Implementation

## Executive Summary

This document outlines the design and implementation plan for adding multi-tenant team workspace support to the Qwen Code web UI, integrating with PostgreSQL (user/team data), MongoDB (sessions), and NFS (file storage).

---

## System Architecture

### Data Flow
```
User/Team Auth → PostgreSQL (user/team records)
                ↓
         API Key Generation
                ↓
         NFS Workspace Creation (private/shared)
                ↓
         MongoDB Session Tracking
                ↓
         Web UI Access (file operations)
```

### Storage Architecture
```
NFS Server
├── /private/<user_id>/          # Individual user workspaces
└── /shared/<team_id>/            # Team shared workspaces

PostgreSQL
├── users                         # User profiles & credentials
├── teams                         # Team information
├── team_members                  # User-team relationships
└── api_keys                      # User API keys

MongoDB
├── user_sessions                 # Active user sessions
└── team_sessions                 # Active team sessions
```

---

## Database Schema Design

### PostgreSQL Tables

> **Note**: PostgreSQL is configured with pgvector extension for vector similarity search on file embeddings.

#### 1. users
```sql
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username VARCHAR(255) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    password_hash VARCHAR(255) NOT NULL,
    nfs_workspace_path VARCHAR(500) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT true
);

CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_email ON users(email);
```

#### 2. teams
```sql
CREATE TABLE teams (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    team_name VARCHAR(255) UNIQUE NOT NULL,
    specialization VARCHAR(255),
    description TEXT,
    nfs_workspace_path VARCHAR(500) NOT NULL,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT true
);

CREATE INDEX idx_teams_name ON teams(team_name);
```

#### 3. team_members
```sql
CREATE TABLE team_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    role VARCHAR(50) DEFAULT 'member',
    joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(team_id, user_id)
);

CREATE INDEX idx_team_members_team ON team_members(team_id);
CREATE INDEX idx_team_members_user ON team_members(user_id);
```

#### 4. api_keys
```sql
CREATE TABLE api_keys (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    api_key VARCHAR(255) UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP,
    is_active BOOLEAN DEFAULT true
);

CREATE INDEX idx_api_keys_user ON api_keys(user_id);
CREATE INDEX idx_api_keys_key ON api_keys(api_key);
```

#### 5. file_embeddings (Vector Search)
```sql
CREATE TABLE file_embeddings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    file_path VARCHAR(1000) NOT NULL,
    file_name VARCHAR(500) NOT NULL,
    workspace_type VARCHAR(20) NOT NULL CHECK (workspace_type IN ('private', 'team')),
    owner_id UUID REFERENCES users(id) ON DELETE CASCADE,
    team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
    content_hash VARCHAR(64) NOT NULL,
    embedding vector(1536),
    metadata JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_file_embeddings_path ON file_embeddings(file_path);
CREATE INDEX idx_file_embeddings_owner ON file_embeddings(owner_id);
CREATE INDEX idx_file_embeddings_team ON file_embeddings(team_id);
CREATE INDEX idx_file_embeddings_vector ON file_embeddings USING hnsw (embedding vector_cosine_ops);
```

### MongoDB Collections

#### user_sessions
```javascript
{
  _id: ObjectId,
  user_id: String,
  session_token: String,
  workspace_path: String,
  created_at: Date,
  expires_at: Date,
  last_activity: Date
}
```

#### team_sessions
```javascript
{
  _id: ObjectId,
  user_id: String,
  team_id: String,
  session_token: String,
  workspace_path: String,
  created_at: Date,
  expires_at: Date,
  last_activity: Date
}
```

---

## API Endpoints Design

### Authentication & User Management

#### POST /api/auth/signup
**Request:**
```json
{
  "username": "john_doe",
  "email": "john@example.com",
  "full_name": "John Doe",
  "phone": "+1234567890",
  "password": "securePassword123"
}
```
**Response:**
```json
{
  "user_id": "uuid",
  "api_key": "qwen_xxxxxxxxxxxxx",
  "workspace_path": "/private/uuid",
  "message": "User registered successfully"
}
```

#### POST /api/auth/login
**Request:**
```json
{
  "username": "john_doe",
  "password": "securePassword123"
}
```
**Response:**
```json
{
  "session_token": "token",
  "user_id": "uuid",
  "workspace_path": "/private/uuid",
  "teams": ["team_id_1", "team_id_2"]
}
```

### Team Management

#### POST /api/teams/create
**Request:**
```json
{
  "team_name": "AI Research Team",
  "specialization": "Machine Learning",
  "description": "Focused on LLM research",
  "attachments": ["file1.pdf", "file2.doc"]
}
```
**Response:**
```json
{
  "team_id": "uuid",
  "workspace_path": "/shared/uuid",
  "message": "Team created successfully"
}
```

#### POST /api/teams/join
**Request:**
```json
{
  "team_id": "uuid"
}
```
**Response:**
```json
{
  "team_id": "uuid",
  "workspace_path": "/shared/uuid",
  "message": "Joined team successfully"
}
```

#### GET /api/teams/list
**Response:**
```json
{
  "teams": [
    {
      "team_id": "uuid",
      "team_name": "AI Research Team",
      "specialization": "Machine Learning",
      "member_count": 5
    }
  ]
}
```

#### POST /api/teams/signin
**Request:**
```json
{
  "team_id": "uuid",
  "username": "john_doe",
  "password": "securePassword123"
}
```
**Response:**
```json
{
  "session_token": "token",
  "team_id": "uuid",
  "workspace_path": "/shared/uuid"
}
```

### File Operations

#### GET /api/files/list
**Query:** `?workspace_type=private|team&team_id=uuid`
**Response:**
```json
{
  "files": [
    {
      "name": "file.txt",
      "path": "/private/uuid/file.txt",
      "size": 1024,
      "modified_at": "2025-12-06T01:00:00Z"
    }
  ]
}
```

#### POST /api/files/upload
**Request:** `multipart/form-data`
- `file`: File binary
- `workspace_type`: "private" | "team"
- `team_id`: (optional, required for team uploads)

#### GET /api/files/download
**Query:** `?path=/private/uuid/file.txt`

#### DELETE /api/files/delete
**Request:**
```json
{
  "path": "/private/uuid/file.txt"
}
```

#### POST /api/files/search
**Request:**
```json
{
  "query": "machine learning implementation",
  "workspace_type": "private|team",
  "team_id": "uuid",
  "limit": 10
}
```
**Response:**
```json
{
  "results": [
    {
      "file_path": "/private/uuid/ml_model.py",
      "file_name": "ml_model.py",
      "similarity_score": 0.92,
      "metadata": {
        "size": 2048,
        "modified_at": "2025-12-06T01:00:00Z"
      }
    }
  ]
}
```

---

## Vector Search Integration

### pgvector Extension

PostgreSQL is configured with the pgvector extension to enable semantic search across files in user and team workspaces.

### Use Cases

1. **Semantic File Search**: Find files by meaning, not just filename
2. **Code Similarity**: Discover similar code patterns across workspace
3. **Knowledge Discovery**: Find relevant documents in team workspace
4. **Duplicate Detection**: Identify similar or duplicate files

### Embedding Generation

Files are automatically embedded when uploaded:
- Text files: Direct content embedding
- Code files: Syntax-aware embedding
- Documents: Extracted text embedding
- Embedding model: OpenAI text-embedding-3-small (1536 dimensions)

### Vector Search Query Example

```sql
-- Find similar files to a query embedding
SELECT 
    file_path,
    file_name,
    1 - (embedding <=> $1::vector) as similarity_score,
    metadata
FROM file_embeddings
WHERE workspace_type = 'private' AND owner_id = $2
ORDER BY embedding <=> $1::vector
LIMIT 10;
```

### Backend Integration

```typescript
// Generate embedding for uploaded file
const embedding = await generateEmbedding(fileContent);

// Store in database
await db.query(`
    INSERT INTO file_embeddings 
    (file_path, file_name, workspace_type, owner_id, content_hash, embedding, metadata)
    VALUES ($1, $2, $3, $4, $5, $6, $7)
`, [filePath, fileName, 'private', userId, hash, embedding, metadata]);

// Search similar files
const results = await db.query(`
    SELECT file_path, file_name, 
           1 - (embedding <=> $1::vector) as similarity
    FROM file_embeddings
    WHERE owner_id = $2
    ORDER BY embedding <=> $1::vector
    LIMIT $3
`, [queryEmbedding, userId, limit]);
```

---

## Frontend Components Structure

```
packages/web-ui/
├── src/
│   ├── components/
│   │   ├── auth/
│   │   │   ├── LoginForm.tsx
│   │   │   ├── SignupForm.tsx
│   │   │   └── TeamSigninForm.tsx
│   │   ├── team/
│   │   │   ├── TeamCreateForm.tsx
│   │   │   ├── TeamJoinDialog.tsx
│   │   │   ├── TeamList.tsx
│   │   │   └── TeamWorkspace.tsx
│   │   ├── workspace/
│   │   │   ├── FileExplorer.tsx
│   │   │   ├── FileUpload.tsx
│   │   │   └── WorkspaceSelector.tsx
│   │   └── onboarding/
│   │       └── UserOnboarding.tsx
│   ├── pages/
│   │   ├── Login.tsx
│   │   ├── Signup.tsx
│   │   ├── Dashboard.tsx
│   │   └── TeamWorkspace.tsx
│   ├── services/
│   │   ├── authService.ts
│   │   ├── teamService.ts
│   │   └── fileService.ts
│   └── store/
│       ├── authSlice.ts
│       ├── teamSlice.ts
│       └── workspaceSlice.ts
```

---

## Backend Services Structure

```
packages/backend/
├── src/
│   ├── controllers/
│   │   ├── authController.ts
│   │   ├── teamController.ts
│   │   └── fileController.ts
│   ├── services/
│   │   ├── userService.ts
│   │   ├── teamService.ts
│   │   ├── nfsService.ts
│   │   ├── apiKeyService.ts
│   │   └── sessionService.ts
│   ├── middleware/
│   │   ├── authMiddleware.ts
│   │   └── teamAccessMiddleware.ts
│   ├── models/
│   │   ├── User.ts
│   │   ├── Team.ts
│   │   └── TeamMember.ts
│   └── utils/
│       ├── nfsClient.ts
│       ├── passwordHash.ts
│       └── apiKeyGenerator.ts
```

---

## Implementation Tasks

### Phase 1: Database & Infrastructure Setup
- [ ] **Task 1.1**: Create PostgreSQL schema (users, teams, team_members, api_keys)
- [ ] **Task 1.2**: Create MongoDB collections (user_sessions, team_sessions)
- [ ] **Task 1.3**: Update docker-compose.yml with initialization scripts
- [ ] **Task 1.4**: Create NFS directory structure (/private, /shared)

### Phase 2: Backend API Development
- [ ] **Task 2.1**: Implement user registration endpoint with validation
- [ ] **Task 2.2**: Implement user onboarding (API key generation, NFS workspace creation)
- [ ] **Task 2.3**: Implement user login with session management
- [ ] **Task 2.4**: Implement team creation endpoint
- [ ] **Task 2.5**: Implement team onboarding (NFS shared workspace creation)
- [ ] **Task 2.6**: Implement team join functionality
- [ ] **Task 2.7**: Implement team sign-in endpoint
- [ ] **Task 2.8**: Implement file operations (list, upload, download, delete)
- [ ] **Task 2.9**: Create authentication middleware
- [ ] **Task 2.10**: Create team access control middleware

### Phase 3: NFS Integration
- [ ] **Task 3.1**: Implement NFS client service for directory operations
- [ ] **Task 3.2**: Create workspace initialization logic (private/shared)
- [ ] **Task 3.3**: Implement file permission management
- [ ] **Task 3.4**: Add NFS health check and error handling

### Phase 4: Frontend Development
- [ ] **Task 4.1**: Create login page with username/password form
- [ ] **Task 4.2**: Create signup page with user information form
- [ ] **Task 4.3**: Create user onboarding flow UI
- [ ] **Task 4.4**: Create team creation form
- [ ] **Task 4.5**: Create team join dialog with team selection
- [ ] **Task 4.6**: Create team sign-in page
- [ ] **Task 4.7**: Create file explorer component for workspace
- [ ] **Task 4.8**: Create file upload component
- [ ] **Task 4.9**: Create workspace selector (private vs team)
- [ ] **Task 4.10**: Implement state management (Redux/Context)

### Phase 5: Integration & Testing
- [ ] **Task 5.1**: Integration testing for user registration flow
- [ ] **Task 5.2**: Integration testing for team creation flow
- [ ] **Task 5.3**: Integration testing for team join flow
- [ ] **Task 5.4**: Integration testing for file operations
- [ ] **Task 5.5**: End-to-end testing for complete user journey
- [ ] **Task 5.6**: Security testing (authentication, authorization)
- [ ] **Task 5.7**: Performance testing (concurrent users, file operations)

### Phase 6: Documentation & Deployment
- [ ] **Task 6.1**: API documentation (OpenAPI/Swagger)
- [ ] **Task 6.2**: User guide for web UI
- [ ] **Task 6.3**: Admin guide for team management
- [ ] **Task 6.4**: Deployment scripts and configuration
- [ ] **Task 6.5**: Monitoring and logging setup

---

## Security Considerations

### Authentication
- Password hashing using bcrypt (min 10 rounds)
- Session tokens with expiration (24 hours default)
- API key format: `qwen_<random_32_chars>`
- Rate limiting on login attempts (5 attempts per 15 minutes)

### Authorization
- User can only access their own private workspace
- Team members can only access teams they've joined
- File operations validated against user/team membership
- API key required for programmatic access

### Data Protection
- HTTPS only for all API endpoints
- Input validation and sanitization
- SQL injection prevention (parameterized queries)
- XSS prevention (output encoding)
- CSRF protection for state-changing operations

---

## NFS Integration Details

### Workspace Creation Flow

**Private Workspace:**
```bash
# On user registration
mkdir -p /nfs-data/private/<user_id>
chown qwen-agent:qwen-agent /nfs-data/private/<user_id>
chmod 700 /nfs-data/private/<user_id>
```

**Team Workspace:**
```bash
# On team creation
mkdir -p /nfs-data/shared/<team_id>
chown qwen-agent:qwen-agent /nfs-data/shared/<team_id>
chmod 770 /nfs-data/shared/<team_id>
```

### File Operations
- All file operations go through backend API (no direct NFS access from frontend)
- Backend validates user/team membership before file operations
- File paths are sanitized to prevent directory traversal attacks
- File size limits enforced (configurable, default 100MB per file)

---

## Error Handling

### Common Error Codes
- `400`: Bad request (validation errors)
- `401`: Unauthorized (invalid credentials)
- `403`: Forbidden (insufficient permissions)
- `404`: Resource not found
- `409`: Conflict (duplicate username/email/team)
- `500`: Internal server error

### Error Response Format
```json
{
  "error": {
    "code": "DUPLICATE_USERNAME",
    "message": "Username already exists",
    "details": {}
  }
}
```

---

## Performance Optimization

### Caching Strategy
- User session data cached in MongoDB (fast lookup)
- Team membership cached in memory (Redis optional)
- File listings cached with TTL (5 minutes)

### Database Optimization
- Indexes on frequently queried columns
- Connection pooling for PostgreSQL
- Prepared statements for common queries

### NFS Optimization
- Batch file operations where possible
- Async file operations (non-blocking)
- File metadata caching

---

## Monitoring & Logging

### Metrics to Track
- User registration rate
- Team creation rate
- Active sessions (user/team)
- File operation counts (upload/download/delete)
- API response times
- Error rates by endpoint

### Logging Requirements
- User authentication events (success/failure)
- Team operations (create/join)
- File operations with user/team context
- API errors with stack traces
- NFS operation failures

---

## Future Enhancements

1. **Team Roles & Permissions**: Admin, member, viewer roles with granular permissions
2. **File Versioning**: Track file changes and allow rollback
3. **Team Invitations**: Email-based team invitations
4. **Workspace Quotas**: Storage limits per user/team
5. **Activity Feed**: Real-time team activity notifications
6. **File Sharing**: Share files between users/teams
7. **OAuth Integration**: Google/GitHub login support
8. **Mobile App**: Native mobile client for file access

---

## Estimated Timeline

- **Phase 1**: 3-5 days
- **Phase 2**: 7-10 days
- **Phase 3**: 3-5 days
- **Phase 4**: 10-14 days
- **Phase 5**: 5-7 days
- **Phase 6**: 3-5 days

**Total**: 31-46 days (6-9 weeks)

---

## Dependencies

### Backend
- Node.js >= 20
- Express.js
- PostgreSQL client (pg) with pgvector support
- MongoDB client (mongoose)
- bcrypt (password hashing)
- jsonwebtoken (session tokens)
- multer (file uploads)
- node-nfs (NFS client)
- openai (embedding generation)
- crypto (content hashing)

### Frontend
- React >= 18
- TypeScript
- React Router
- Axios (HTTP client)
- Redux Toolkit (state management)
- Material-UI or Ant Design (UI components)
- React Query (data fetching)

---

## Conclusion

This design provides a comprehensive multi-tenant team workspace system with:
- Secure user authentication and authorization
- Individual and team workspaces with NFS storage
- Complete file management capabilities
- Scalable architecture with PostgreSQL, MongoDB, and NFS
- Clear separation of concerns between frontend and backend

The implementation follows best practices for security, performance, and maintainability.
