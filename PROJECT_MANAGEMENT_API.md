# Project Management MongoDB Persistence API

## Overview
MongoDB persistence layer for team workspace project management with support for projects, sections, and statistics.

## Collections
- `projects` - Main project documents
- `project_sections` - Project sections (requirements, architecture, design, etc.)
- `project_stats` - Project statistics and metrics

## API Endpoints

### Projects

#### Create Project
```
POST /api/teams/:teamId/projects
Body: {
  name: string,
  description?: string,
  status: 'active' | 'archived' | 'completed'
}
```

#### List Projects
```
GET /api/teams/:teamId/projects
```

#### Get Project
```
GET /api/teams/:teamId/projects/:projectId
```

#### Update Project
```
PUT /api/teams/:teamId/projects/:projectId
Body: Partial<Project>
```

### Project Sections

#### Create Section
```
POST /api/teams/:teamId/sections
Body: {
  projectId: string,
  type: 'requirements' | 'architecture' | 'design' | 'implementation' | 'tasks' | 'code' | 'issues' | 'meetings',
  title: string,
  content: any,
  order: number
}
```

#### List Sections
```
GET /api/teams/:teamId/projects/:projectId/sections
```

#### Get Section
```
GET /api/teams/:teamId/sections/:sectionId
```

#### Update Section
```
PUT /api/teams/:teamId/sections/:sectionId
Body: Partial<ProjectSection>
```

### Project Stats

#### Create Stats
```
POST /api/teams/:teamId/stats
Body: {
  projectId: string,
  totalTasks: number,
  completedTasks: number,
  totalIssues: number,
  openIssues: number,
  totalMeetings: number,
  lastActivity: Date
}
```

#### Get Stats
```
GET /api/teams/:teamId/projects/:projectId/stats
```

#### Update Stats
```
PUT /api/teams/:teamId/projects/:projectId/stats
Body: Partial<ProjectStats>
```

## Data Models

### Project
```typescript
{
  _id?: string;
  teamId: string;
  name: string;
  description?: string;
  status: 'active' | 'archived' | 'completed';
  created_at: Date;
  updated_at: Date;
}
```

### ProjectSection
```typescript
{
  _id?: string;
  projectId: string;
  teamId: string;
  type: 'requirements' | 'architecture' | 'design' | 'implementation' | 'tasks' | 'code' | 'issues' | 'meetings';
  title: string;
  content: any;
  order: number;
  created_at: Date;
  updated_at: Date;
}
```

### ProjectStats
```typescript
{
  _id?: string;
  projectId: string;
  teamId: string;
  totalTasks: number;
  completedTasks: number;
  totalIssues: number;
  openIssues: number;
  totalMeetings: number;
  lastActivity: Date;
  created_at: Date;
  updated_at: Date;
}
```

## Implementation Files
- `/packages/backend/src/models/Project.ts` - Type definitions
- `/packages/backend/src/services/projectService.ts` - Business logic
- `/packages/backend/src/controllers/projectController.ts` - Request handlers
- `/packages/backend/src/routes/index.ts` - Route definitions
