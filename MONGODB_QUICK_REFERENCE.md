# MongoDB Integration - Quick Reference

## Quick Commands

### Setup MongoDB for Existing Users/Teams
```bash
./infrastructure/setup_existing_mongo_databases.sh
```

### Check MongoDB Status
```bash
docker ps | grep team-mongodb
```

### List All User/Team Databases
```bash
./infrastructure/list_mongo_databases.sh
```

### Test MongoDB Integration
```bash
./infrastructure/test_mongo_integration.sh
```

### Connect to MongoDB Shell
```bash
docker exec -it team-mongodb mongosh -u admin -p changeme --authenticationDatabase admin
```

### View Specific Database
```bash
# Replace {userId} with actual user ID (hyphens replaced with underscores)
docker exec -it team-mongodb mongosh -u admin -p changeme --authenticationDatabase admin --eval "use user_{userId}; db.getCollectionNames()"
```

## Code Snippets

### Get User Database Connection
```typescript
import { mongoService } from './services/mongoService';

const conn = mongoService.getUserDatabaseConnection(userId);
// Use connection...
await conn.close(); // Always close when done
```

### Get Team Database Connection
```typescript
import { mongoService } from './services/mongoService';

const conn = mongoService.getTeamDatabaseConnection(teamId);
// Use connection...
await conn.close(); // Always close when done
```

### Insert Document
```typescript
const conn = mongoService.getUserDatabaseConnection(userId);
try {
  await conn.collection('tasks').insertOne({
    title: 'My Task',
    status: 'pending',
    created_at: new Date()
  });
} finally {
  await conn.close();
}
```

### Query Documents
```typescript
const conn = mongoService.getUserDatabaseConnection(userId);
try {
  const tasks = await conn.collection('tasks')
    .find({ status: 'pending' })
    .sort({ created_at: -1 })
    .limit(10)
    .toArray();
  return tasks;
} finally {
  await conn.close();
}
```

### Update Document
```typescript
const conn = mongoService.getUserDatabaseConnection(userId);
try {
  await conn.collection('tasks').updateOne(
    { _id: taskId },
    { 
      $set: { 
        status: 'completed',
        updated_at: new Date()
      }
    }
  );
} finally {
  await conn.close();
}
```

### Delete Document
```typescript
const conn = mongoService.getUserDatabaseConnection(userId);
try {
  await conn.collection('tasks').deleteOne({ _id: taskId });
} finally {
  await conn.close();
}
```

## Database Structure

### User Database: `user_{userId}`
- `tasks` - Personal tasks
- `todos` - To-do items
- `chat_sessions` - Chat history
- `projects` - Personal projects

### Team Database: `team_{teamId}`
- `tasks` - Team tasks
- `projects` - Team projects
- `chat_sessions` - Team chats
- `documents` - Shared documents

## Environment Variables

```env
# MongoDB connection URL
MONGO_URL=mongodb://admin:changeme@localhost:27017
```

## Common Operations

### Backup User Database
```bash
USER_ID="your-user-id"
DB_NAME="user_${USER_ID//-/_}"
docker exec team-mongodb mongodump -u admin -p changeme --authenticationDatabase admin --db $DB_NAME --out /tmp/backup
docker cp team-mongodb:/tmp/backup ./backup
```

### Restore User Database
```bash
USER_ID="your-user-id"
DB_NAME="user_${USER_ID//-/_}"
docker cp ./backup team-mongodb:/tmp/backup
docker exec team-mongodb mongorestore -u admin -p changeme --authenticationDatabase admin --db $DB_NAME /tmp/backup/$DB_NAME
```

### Drop User Database (Careful!)
```bash
USER_ID="your-user-id"
DB_NAME="user_${USER_ID//-/_}"
docker exec team-mongodb mongosh -u admin -p changeme --authenticationDatabase admin --eval "use $DB_NAME; db.dropDatabase()"
```

## Troubleshooting

### MongoDB Not Running
```bash
cd infrastructure
docker-compose up -d mongodb
```

### Check MongoDB Logs
```bash
docker logs team-mongodb
docker logs -f team-mongodb  # Follow logs
```

### Connection Refused
1. Check if MongoDB is running
2. Verify port 27017 is accessible
3. Check credentials in MONGO_URL

### Database Not Created
1. Check backend logs for errors
2. Verify mongoService is being called
3. Test MongoDB connection manually

## Performance Tips

1. **Use Indexes**: Collections have indexes on `created_at` by default
2. **Close Connections**: Always close connections after use
3. **Batch Operations**: Use `insertMany()` for multiple documents
4. **Projection**: Only fetch fields you need
5. **Limit Results**: Use `.limit()` for pagination

## Security Best Practices

1. **Never expose MongoDB port** publicly
2. **Use strong passwords** in production
3. **Enable SSL/TLS** for production
4. **Rotate credentials** regularly
5. **Implement rate limiting** on database operations
6. **Validate input** before storing in MongoDB
7. **Use connection pooling** for better performance

## Monitoring

### Check Database Size
```bash
docker exec team-mongodb mongosh -u admin -p changeme --authenticationDatabase admin --eval "
  db.adminCommand('listDatabases').databases.forEach(function(db) {
    if (db.name.startsWith('user_') || db.name.startsWith('team_')) {
      print(db.name + ': ' + (db.sizeOnDisk / 1024 / 1024).toFixed(2) + ' MB');
    }
  });
"
```

### Count Documents in Collection
```bash
DB_NAME="user_your_id"
docker exec team-mongodb mongosh -u admin -p changeme --authenticationDatabase admin --eval "use $DB_NAME; db.tasks.countDocuments()"
```

## Additional Resources

- Full Documentation: `MONGODB_INTEGRATION.md`
- Implementation Summary: `MONGODB_ONBOARDING_SUMMARY.md`
- Test Script: `infrastructure/test_mongo_integration.sh`
- List Script: `infrastructure/list_mongo_databases.sh`
