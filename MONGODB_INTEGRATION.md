# MongoDB Integration for Team Workspace

## Overview

The team workspace now includes MongoDB integration that automatically creates individual databases for users and teams. These databases store application-specific data like tasks, todos, chat sessions, and project information.

## Architecture

### Database Structure

- **User Databases**: `user_{userId}` (with hyphens replaced by underscores)
  - Collections: `tasks`, `todos`, `chat_sessions`, `projects`
  
- **Team Databases**: `team_{teamId}` (with hyphens replaced by underscores)
  - Collections: `tasks`, `projects`, `chat_sessions`, `documents`

### Automatic Provisioning

1. **User Registration**: When a new user signs up, the system automatically:
   - Creates a PostgreSQL user record
   - Creates an NFS private workspace
   - Creates a dedicated MongoDB database with collections
   - Stores the database name in `users.mongo_database_name`

2. **Team Creation**: When a team is created, the system automatically:
   - Creates a PostgreSQL team record
   - Creates an NFS shared workspace
   - Creates a dedicated MongoDB database with collections
   - Stores the database name in `teams.mongo_database_name`

## Configuration

### Environment Variables

Add to your `.env` file:

```env
MONGO_URL=mongodb://admin:changeme@localhost:27017
```

### Docker Setup

The MongoDB service is already configured in `infrastructure/infrastructure.yml`:

```yaml
mongodb:
  image: mongo:7
  container_name: team-mongodb
  environment:
    - MONGO_INITDB_ROOT_USERNAME=admin
    - MONGO_INITDB_ROOT_PASSWORD=changeme
  volumes:
    - /workdisk/infrastructure/data/mongo-data:/data/db
  ports:
    - "27017:27017"
  restart: unless-stopped
```

## Usage

### Accessing User Database

```typescript
import { mongoService } from './services/mongoService';

// Get connection to user's database
const userConn = mongoService.getUserDatabaseConnection(userId);
const tasksCollection = userConn.collection('tasks');

// Insert a task
await tasksCollection.insertOne({
  title: 'Complete project',
  status: 'pending',
  created_at: new Date()
});

// Don't forget to close the connection
await userConn.close();
```

### Accessing Team Database

```typescript
import { mongoService } from './services/mongoService';

// Get connection to team's database
const teamConn = mongoService.getTeamDatabaseConnection(teamId);
const projectsCollection = teamConn.collection('projects');

// Insert a project
await projectsCollection.insertOne({
  name: 'New Feature',
  description: 'Build new feature',
  created_at: new Date()
});

// Don't forget to close the connection
await teamConn.close();
```

## Database Schema

### User Collections

#### tasks
```javascript
{
  _id: ObjectId,
  title: String,
  description: String,
  status: String, // 'pending', 'in_progress', 'completed'
  priority: String, // 'low', 'medium', 'high'
  due_date: Date,
  created_at: Date,
  updated_at: Date
}
```

#### todos
```javascript
{
  _id: ObjectId,
  text: String,
  completed: Boolean,
  created_at: Date,
  updated_at: Date
}
```

#### chat_sessions
```javascript
{
  _id: ObjectId,
  session_id: String,
  messages: Array,
  created_at: Date,
  updated_at: Date
}
```

#### projects
```javascript
{
  _id: ObjectId,
  name: String,
  description: String,
  status: String,
  created_at: Date,
  updated_at: Date
}
```

### Team Collections

#### tasks
```javascript
{
  _id: ObjectId,
  title: String,
  description: String,
  assigned_to: String, // user_id
  status: String,
  priority: String,
  created_by: String, // user_id
  created_at: Date,
  updated_at: Date
}
```

#### projects
```javascript
{
  _id: ObjectId,
  name: String,
  description: String,
  status: String,
  members: Array, // array of user_ids
  created_by: String, // user_id
  created_at: Date,
  updated_at: Date
}
```

#### chat_sessions
```javascript
{
  _id: ObjectId,
  session_id: String,
  participants: Array, // array of user_ids
  messages: Array,
  created_at: Date,
  updated_at: Date
}
```

#### documents
```javascript
{
  _id: ObjectId,
  title: String,
  content: String,
  type: String, // 'markdown', 'text', 'code'
  created_by: String, // user_id
  created_at: Date,
  updated_at: Date
}
```

## Migration

The database columns were added via migration:

```sql
-- infrastructure/migrations/add_mongo_database_columns.sql
ALTER TABLE users ADD COLUMN IF NOT EXISTS mongo_database_name VARCHAR(255);
ALTER TABLE teams ADD COLUMN IF NOT EXISTS mongo_database_name VARCHAR(255);
CREATE INDEX IF NOT EXISTS idx_users_mongo_db ON users(mongo_database_name);
CREATE INDEX IF NOT EXISTS idx_teams_mongo_db ON teams(mongo_database_name);
```

To apply the migration:

```bash
docker exec -i team-postgres psql -U admin -d qwen_users < infrastructure/migrations/add_mongo_database_columns.sql
```

## API Response Changes

### User Signup Response

Now includes `mongo_database` field:

```json
{
  "user_id": "uuid",
  "api_key": "qwen_...",
  "workspace_path": "/private/uuid",
  "mongo_database": "user_uuid_with_underscores",
  "message": "User registered successfully"
}
```

### Team Creation Response

The team object now includes `mongo_database_name`:

```json
{
  "id": "uuid",
  "team_name": "My Team",
  "nfs_workspace_path": "/shared/uuid",
  "mongo_database_name": "team_uuid_with_underscores",
  "created_at": "2025-12-06T..."
}
```

## Troubleshooting

### Connection Issues

If you encounter connection issues:

1. Verify MongoDB is running:
   ```bash
   docker ps | grep team-mongodb
   ```

2. Check MongoDB logs:
   ```bash
   docker logs team-mongodb
   ```

3. Test connection:
   ```bash
   docker exec -it team-mongodb mongosh -u admin -p changeme --authenticationDatabase admin
   ```

### Database Not Created

If a database wasn't created during signup/team creation:

1. Check backend logs for errors
2. Verify MONGO_URL environment variable is set correctly
3. Ensure MongoDB container has proper permissions

### List All Databases

```bash
docker exec -it team-mongodb mongosh -u admin -p changeme --authenticationDatabase admin --eval "db.adminCommand('listDatabases')"
```

## Security Considerations

1. **Authentication**: Always use authentication in production
2. **Network**: Restrict MongoDB port access to backend services only
3. **Credentials**: Use strong passwords and rotate them regularly
4. **Backups**: Implement regular backup strategy for MongoDB data
5. **Connection Pooling**: Reuse connections when possible to avoid exhausting resources

## Future Enhancements

- Add MongoDB connection pooling
- Implement database backup/restore functionality
- Add data migration tools for schema changes
- Implement database cleanup for deleted users/teams
- Add monitoring and alerting for database health
