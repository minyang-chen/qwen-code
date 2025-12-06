# Team Workspace Deployment Guide

## Prerequisites

- Docker and Docker Compose
- Node.js 20+
- NFS client utilities (for production)
- OpenAI API key (for vector search)

## Infrastructure Setup

### 1. Start Infrastructure Services

```bash
cd infrastructure
docker-compose -f infrastructure.yml up -d
```

This starts:
- PostgreSQL with pgvector extension (port 5432)
- MongoDB (port 27017)
- NFS server (port 2049)

### 2. Verify Services

```bash
# Check all containers are running
docker ps

# Verify PostgreSQL
docker exec -it team-postgres psql -U admin -d qwen_users -c "\dt"

# Verify MongoDB
docker exec -it team-mongodb mongosh -u admin -p changeme --eval "db.version()"

# Verify NFS
docker logs team-nfs-server
```

## Backend Setup

### 1. Install Dependencies

```bash
cd packages/backend
npm install
```

### 2. Configure Environment

Create `.env` file:

```env
# Server
PORT=3001
NODE_ENV=production

# PostgreSQL
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_USER=admin
POSTGRES_PASSWORD=changeme
POSTGRES_DB=qwen_users

# MongoDB
MONGODB_URI=mongodb://admin:changeme@localhost:27017/team_workspaces?authSource=admin

# JWT
JWT_SECRET=your-secure-random-secret-key-change-in-production

# NFS
NFS_BASE_PATH=/workdisk/infrastructure/data/nfs-data

# OpenAI (for vector search)
OPENAI_API_KEY=your-openai-api-key
OPENAI_BASE_URL=https://api.openai.com/v1
```

### 3. Build and Start

```bash
# Development
npm run dev

# Production
npm run build
npm start
```

## Frontend Setup

### 1. Install Dependencies

```bash
cd packages/web-ui/client
npm install
```

### 2. Configure API Endpoint

Update `src/services/team/api.ts` if needed:

```typescript
const API_BASE_URL = process.env.VITE_API_URL || 'http://localhost:3001';
```

### 3. Build

```bash
npm run build
```

The team workspace will be available at `dist/team.html`.

## Production Deployment

### Backend (PM2)

```bash
cd packages/backend
npm install -g pm2
pm2 start dist/index.js --name team-backend
pm2 save
pm2 startup
```

### Frontend (Nginx)

```nginx
server {
    listen 80;
    server_name your-domain.com;

    # Team workspace
    location /team {
        alias /path/to/packages/web-ui/client/dist;
        try_files $uri $uri/ /team.html;
    }

    # API proxy
    location /api {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### Docker Deployment

Create `docker-compose.prod.yml`:

```yaml
version: '3.8'

services:
  backend:
    build: ./packages/backend
    ports:
      - "3001:3001"
    environment:
      - NODE_ENV=production
    env_file:
      - ./packages/backend/.env
    depends_on:
      - postgres
      - mongodb
      - nfs-server
    volumes:
      - /workdisk/infrastructure/data/nfs-data:/nfs-share

  frontend:
    build: ./packages/web-ui/client
    ports:
      - "80:80"
    depends_on:
      - backend
```

## Security Considerations

### 1. Change Default Credentials

Update in `infrastructure/infrastructure.yml`:
- PostgreSQL: `POSTGRES_PASSWORD`
- MongoDB: `MONGO_INITDB_ROOT_PASSWORD`

### 2. Secure JWT Secret

Generate a strong secret:
```bash
openssl rand -base64 32
```

### 3. Enable HTTPS

Use Let's Encrypt with Certbot:
```bash
certbot --nginx -d your-domain.com
```

### 4. NFS Security

For production NFS:
- Use authentication: Remove `no_auth_nlm,insecure`
- Restrict access: Add specific IP ranges
- Use encrypted connections: Consider NFS over TLS

## Monitoring

### Health Checks

```bash
# Backend health
curl http://localhost:3001/health

# Database connections
docker exec team-postgres pg_isready
docker exec team-mongodb mongosh --eval "db.adminCommand('ping')"
```

### Logs

```bash
# Backend logs
pm2 logs team-backend

# Infrastructure logs
docker logs team-postgres
docker logs team-mongodb
docker logs team-nfs-server
```

## Backup Strategy

### PostgreSQL

```bash
docker exec team-postgres pg_dump -U admin qwen_users > backup.sql
```

### MongoDB

```bash
docker exec team-mongodb mongodump --username admin --password changeme --out /backup
```

### NFS Data

```bash
rsync -av /workdisk/infrastructure/data/nfs-data/ /backup/nfs-data/
```

## Troubleshooting

### Backend won't start

- Check `.env` file exists and has correct values
- Verify database connections
- Check port 3001 is available

### File upload fails

- Verify NFS mount is accessible
- Check NFS_BASE_PATH in `.env`
- Ensure write permissions on NFS share

### Vector search not working

- Verify OPENAI_API_KEY is set
- Check pgvector extension is installed
- Verify embeddings table exists

### Authentication issues

- Check JWT_SECRET is set
- Verify session tokens are valid
- Check database user records

## API Documentation

See `docs/team-workspace-api.md` for complete API reference.

## Scaling Considerations

### Horizontal Scaling

- Use Redis for session storage (replace in-memory sessions)
- Load balance backend with Nginx/HAProxy
- Use managed PostgreSQL/MongoDB services

### Performance Optimization

- Enable PostgreSQL connection pooling
- Add Redis caching layer
- Use CDN for static assets
- Implement rate limiting

## Environment Variables Reference

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| PORT | No | 3001 | Backend server port |
| NODE_ENV | No | development | Environment mode |
| POSTGRES_HOST | Yes | - | PostgreSQL host |
| POSTGRES_PORT | Yes | - | PostgreSQL port |
| POSTGRES_USER | Yes | - | PostgreSQL username |
| POSTGRES_PASSWORD | Yes | - | PostgreSQL password |
| POSTGRES_DB | Yes | - | PostgreSQL database |
| MONGODB_URI | Yes | - | MongoDB connection string |
| JWT_SECRET | Yes | - | JWT signing secret |
| NFS_BASE_PATH | Yes | - | NFS mount path |
| OPENAI_API_KEY | Yes | - | OpenAI API key |
| OPENAI_BASE_URL | No | https://api.openai.com/v1 | OpenAI API endpoint |
