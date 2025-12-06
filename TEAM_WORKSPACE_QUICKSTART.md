# Team Workspace - Quick Start Guide

## Overview

The Team Workspace feature adds multi-tenant collaboration capabilities to Qwen Code, allowing users to:
- Create personal accounts with private workspaces
- Create and join teams with shared workspaces
- Manage files in team environments
- Use semantic search with pgvector (optional)

## Architecture

```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│   Frontend      │────▶│   Backend API    │────▶│   PostgreSQL    │
│  (React/Vite)   │     │   (Express)      │     │   (pgvector)    │
│  Port 5173      │     │   Port 3001      │     │   Port 5432     │
└─────────────────┘     └──────────────────┘     └─────────────────┘
                               │                          │
                               ▼                          ▼
                        ┌──────────────┐         ┌─────────────────┐
                        │   MongoDB    │         │   NFS Server    │
                        │  (Sessions)  │         │  (File Storage) │
                        │  Port 27017  │         │   Port 2049     │
                        └──────────────┘         └─────────────────┘
```

## Quick Start (5 minutes)

### 1. Start Infrastructure (1 min)

```bash
cd infrastructure
docker-compose -f infrastructure.yml up -d
```

Verify services are running:
```bash
docker ps
# Should show: team-postgres, team-mongodb, team-nfs-server
```

### 2. Start Backend (1 min)

```bash
cd packages/backend
npm install  # First time only
npm run dev
```

You should see:
```
PostgreSQL connected successfully
MongoDB connected successfully
Server running on port 3001
```

### 3. Start Frontend (1 min)

```bash
cd packages/web-ui/client
npm run dev
```

### 4. Access Team Workspace (2 min)

Open browser to: `http://localhost:5173/team.html`

**Create Account:**
1. Click "Sign up"
2. Fill in username, email, full name, password
3. Save the API key shown (you won't see it again!)
4. Click "Continue to Login"

**Login:**
1. Enter username and password
2. Click "Login"

**Create Team:**
1. Click "Create New Team"
2. Enter team name
3. Click "Create"

**Join Team:**
1. Get team ID from team creator
2. Click "Join Existing Team"
3. Enter team ID
4. Click "Join"

## API Endpoints

### Authentication
```bash
# Signup
curl -X POST http://localhost:3001/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "username": "john",
    "email": "john@example.com",
    "full_name": "John Doe",
    "password": "password123"
  }'

# Login
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "john",
    "password": "password123"
  }'
```

### Team Management
```bash
# Create Team (requires auth token)
curl -X POST http://localhost:3001/api/teams/create \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_SESSION_TOKEN" \
  -d '{
    "team_name": "AI Research Team",
    "specialization": "Machine Learning"
  }'

# Join Team (requires auth token)
curl -X POST http://localhost:3001/api/teams/join \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_SESSION_TOKEN" \
  -d '{
    "team_id": "TEAM_UUID"
  }'
```

## Directory Structure

```
qwen-code/
├── infrastructure/
│   ├── infrastructure.yml          # Docker compose for services
│   ├── init-db/
│   │   └── 01-init.sql            # PostgreSQL schema
│   └── nfs-data/
│       ├── private/               # User workspaces
│       └── shared/                # Team workspaces
│
├── packages/
│   ├── backend/                   # Express API server
│   │   ├── src/
│   │   │   ├── config/           # Database & env config
│   │   │   ├── services/         # Business logic
│   │   │   ├── controllers/      # API handlers
│   │   │   ├── middleware/       # Auth middleware
│   │   │   └── routes/           # API routes
│   │   └── package.json
│   │
│   └── web-ui/
│       └── client/               # React frontend
│           ├── src/
│           │   ├── pages/team/   # Team workspace pages
│           │   └── services/team/ # API client
│           ├── team.html         # Team workspace entry
│           └── vite.config.ts    # Multi-page build
```

## Troubleshooting

### Backend won't start
```bash
# Check if ports are available
lsof -i :3001  # Backend port
lsof -i :5432  # PostgreSQL
lsof -i :27017 # MongoDB

# Check database connections
docker logs team-postgres
docker logs team-mongodb
```

### Frontend build errors
```bash
# Clear node_modules and reinstall
cd packages/web-ui/client
rm -rf node_modules package-lock.json
npm install
```

### Can't connect to backend
- Ensure backend is running on port 3001
- Check browser console for CORS errors
- Verify API_BASE in `client/src/services/team/api.ts`

## Next Steps

1. **Add File Operations**: Implement file upload/download/list endpoints
2. **Add Vector Search**: Integrate OpenAI embeddings for semantic search
3. **Add Team Members UI**: Show team members and roles
4. **Add File Explorer**: Browse and manage team files
5. **Add Search UI**: Semantic file search interface

## Production Deployment

### Build Frontend
```bash
cd packages/web-ui/client
npm run build
```

### Build Backend
```bash
cd packages/backend
npm run build
npm start
```

### Environment Variables
Set these in production:
- `JWT_SECRET` - Strong random secret
- `POSTGRES_PASSWORD` - Strong password
- `MONGODB_URI` - Production MongoDB URL
- `NODE_ENV=production`

## Support

For issues or questions:
- Check `TEAM_WORKSPACE_DESIGN.md` for architecture details
- Check `IMPLEMENTATION_PLAN*.md` for implementation details
- Check `TEAM_WORKSPACE_STATUS.md` for current status
