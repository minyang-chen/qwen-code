# Team Login Flow Implementation

## Overview
Session-based authentication with team selection step before workspace access.

## Route Structure
```
/team/login → /team/select → /team/workspace
```

---

## 1. Backend Implementation

### 1.1 Session Schema
```typescript
interface Session {
  userId: string;
  token: string;
  activeTeamId?: string;  // Set after team selection
  expiresAt: Date;
}
```

### 1.2 API Endpoints

#### POST /api/team/login
**Request:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "user": {
    "id": "user_123",
    "email": "user@example.com",
    "name": "John Doe"
  },
  "sessionToken": "sess_abc123"
}
```

**Logic:**
1. Validate credentials
2. Create session (without activeTeamId)
3. Return session token in cookie + response
4. Frontend redirects to `/team/select`

---

#### GET /api/team/list
**Headers:** `Authorization: Bearer <sessionToken>`

**Response:**
```json
{
  "myTeams": [
    { "id": "team_1", "name": "My Team", "role": "owner" },
    { "id": "team_2", "name": "Dev Team", "role": "member" }
  ],
  "availableTeams": [
    { "id": "team_3", "name": "Public Team", "memberCount": 15 }
  ]
}
```

**Logic:**
1. Verify session token
2. Query teams where user is member/owner
3. Query public/joinable teams
4. Return sorted lists

---

#### POST /api/team/create
**Headers:** `Authorization: Bearer <sessionToken>`

**Request:**
```json
{
  "name": "New Team",
  "description": "Team description"
}
```

**Response:**
```json
{
  "success": true,
  "team": {
    "id": "team_4",
    "name": "New Team",
    "role": "owner"
  }
}
```

**Logic:**
1. Verify session
2. Create team with user as owner
3. Return team details

---

#### POST /api/team/join
**Headers:** `Authorization: Bearer <sessionToken>`

**Request:**
```json
{
  "teamId": "team_3"
}
```

**Response:**
```json
{
  "success": true,
  "team": {
    "id": "team_3",
    "name": "Public Team",
    "role": "member"
  }
}
```

**Logic:**
1. Verify session
2. Check team exists and is joinable
3. Add user to team
4. Return team details

---

#### POST /api/team/select
**Headers:** `Authorization: Bearer <sessionToken>`

**Request:**
```json
{
  "teamId": "team_1"
}
```

**Response:**
```json
{
  "success": true,
  "redirectTo": "/team/workspace"
}
```

**Logic:**
1. Verify session
2. Verify user is member of team
3. Update session: `activeTeamId = teamId`
4. Return success

---

#### GET /api/team/workspace
**Headers:** `Authorization: Bearer <sessionToken>`

**Response:**
```json
{
  "team": {
    "id": "team_1",
    "name": "My Team"
  },
  "dashboard": {
    "projects": [...],
    "members": [...],
    "activity": [...]
  }
}
```

**Logic:**
1. Verify session has `activeTeamId`
2. If no `activeTeamId`, return 403 + redirect to `/team/select`
3. Load team workspace data
4. Return dashboard

---

### 1.3 Middleware

#### Auth Middleware
```typescript
function requireAuth(req, res, next) {
  const token = req.cookies.sessionToken || req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ error: 'Not authenticated' });
  }
  
  const session = getSession(token);
  if (!session || session.expiresAt < new Date()) {
    return res.status(401).json({ error: 'Session expired' });
  }
  
  req.userId = session.userId;
  req.session = session;
  next();
}
```

#### Team Access Middleware
```typescript
function requireTeamAccess(req, res, next) {
  if (!req.session.activeTeamId) {
    return res.status(403).json({ 
      error: 'No team selected',
      redirectTo: '/team/select'
    });
  }
  
  const isMember = checkTeamMembership(req.userId, req.session.activeTeamId);
  if (!isMember) {
    return res.status(403).json({ error: 'Not a team member' });
  }
  
  req.teamId = req.session.activeTeamId;
  next();
}
```

---

## 2. Frontend Implementation

### 2.1 Route Configuration
```typescript
// routes.tsx
const routes = [
  { path: '/team/login', component: LoginPage },
  { path: '/team/select', component: TeamSelectPage, middleware: requireAuth },
  { path: '/team/workspace', component: WorkspacePage, middleware: requireTeamAccess }
];
```

### 2.2 Login Page (`/team/login`)

```tsx
// pages/team/login.tsx
export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    
    const res = await fetch('/api/team/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    
    const data = await res.json();
    
    if (data.success) {
      navigate('/team/select');
    }
  };

  return (
    <form onSubmit={handleLogin}>
      <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
      <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
      <button type="submit">Login</button>
    </form>
  );
}
```

---

### 2.3 Team Selection Page (`/team/select`)

```tsx
// pages/team/select.tsx
export default function TeamSelectPage() {
  const [teams, setTeams] = useState({ myTeams: [], availableTeams: [] });
  const [showCreate, setShowCreate] = useState(false);
  const [showJoin, setShowJoin] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetch('/api/team/list').then(r => r.json()).then(setTeams);
  }, []);

  const selectTeam = async (teamId) => {
    const res = await fetch('/api/team/select', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ teamId })
    });
    
    if (res.ok) {
      navigate('/team/workspace');
    }
  };

  const createTeam = async (name) => {
    const res = await fetch('/api/team/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name })
    });
    
    const data = await res.json();
    if (data.success) {
      await selectTeam(data.team.id);
    }
  };

  const joinTeam = async (teamId) => {
    const res = await fetch('/api/team/join', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ teamId })
    });
    
    const data = await res.json();
    if (data.success) {
      await selectTeam(data.team.id);
    }
  };

  return (
    <div>
      <h1>Select Team</h1>
      
      <section>
        <h2>My Teams</h2>
        {teams.myTeams.map(team => (
          <div key={team.id} onClick={() => selectTeam(team.id)}>
            {team.name} ({team.role})
          </div>
        ))}
      </section>

      <button onClick={() => setShowCreate(true)}>Create Team</button>
      <button onClick={() => setShowJoin(true)}>Join Team</button>

      {showCreate && <CreateTeamForm onSubmit={createTeam} />}
      {showJoin && <JoinTeamList teams={teams.availableTeams} onJoin={joinTeam} />}
    </div>
  );
}
```

---

### 2.4 Workspace Page (`/team/workspace`)

```tsx
// pages/team/workspace.tsx
export default function WorkspacePage() {
  const [workspace, setWorkspace] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetch('/api/team/workspace')
      .then(r => {
        if (r.status === 403) {
          navigate('/team/select');
          return null;
        }
        return r.json();
      })
      .then(data => data && setWorkspace(data));
  }, []);

  if (!workspace) return <div>Loading...</div>;

  return (
    <div>
      <h1>{workspace.team.name} Dashboard</h1>
      {/* Dashboard content */}
    </div>
  );
}
```

---

## 3. Database Schema

### Users Table
```sql
CREATE TABLE users (
  id VARCHAR(255) PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  name VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Teams Table
```sql
CREATE TABLE teams (
  id VARCHAR(255) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  is_public BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Team Members Table
```sql
CREATE TABLE team_members (
  team_id VARCHAR(255) REFERENCES teams(id),
  user_id VARCHAR(255) REFERENCES users(id),
  role ENUM('owner', 'admin', 'member') DEFAULT 'member',
  joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (team_id, user_id)
);
```

### Sessions Table
```sql
CREATE TABLE sessions (
  token VARCHAR(255) PRIMARY KEY,
  user_id VARCHAR(255) REFERENCES users(id),
  active_team_id VARCHAR(255) REFERENCES teams(id),
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

## 4. Flow Diagram

```
┌─────────────┐
│ /team/login │
└──────┬──────┘
       │ POST /api/team/login
       │ (creates session without activeTeamId)
       ▼
┌──────────────┐
│ /team/select │
└──────┬───────┘
       │ GET /api/team/list
       │ User chooses: My Team | Create | Join
       │
       ├─► POST /api/team/create (if creating)
       ├─► POST /api/team/join (if joining)
       │
       │ POST /api/team/select
       │ (updates session.activeTeamId)
       ▼
┌────────────────┐
│ /team/workspace│
└────────────────┘
       │ GET /api/team/workspace
       │ (requires session.activeTeamId)
       ▼
   Dashboard
```

---

## 5. Security Considerations

1. **Session Token**: Use httpOnly cookies to prevent XSS
2. **CSRF Protection**: Add CSRF tokens for state-changing operations
3. **Password**: Hash with bcrypt (min 10 rounds)
4. **Session Expiry**: Default 7 days, refresh on activity
5. **Team Access**: Always verify membership server-side
6. **Rate Limiting**: Limit login attempts (5 per 15 min)

---

## 6. Edge Cases

| Scenario | Behavior |
|----------|----------|
| User has no teams | Auto-show "Create Team" form on `/team/select` |
| User has 1 team | Optional: auto-select and redirect to workspace |
| Session expires | Redirect to `/team/login` with return URL |
| Invalid team selection | Return 403, stay on `/team/select` |
| User switches teams | Call `/api/team/select` with new teamId |
| Direct access to `/team/workspace` without team | Middleware redirects to `/team/select` |

---

## 7. Implementation Checklist

### Backend
- [ ] Implement session management (create, validate, update)
- [ ] Create auth middleware
- [ ] Create team access middleware
- [ ] Implement `/api/team/login` endpoint
- [ ] Implement `/api/team/list` endpoint
- [ ] Implement `/api/team/create` endpoint
- [ ] Implement `/api/team/join` endpoint
- [ ] Implement `/api/team/select` endpoint
- [ ] Implement `/api/team/workspace` endpoint
- [ ] Set up database tables
- [ ] Add session expiry cleanup job

### Frontend
- [ ] Create `/team/login` page
- [ ] Create `/team/select` page with team list
- [ ] Add "Create Team" form/modal
- [ ] Add "Join Team" interface
- [ ] Create `/team/workspace` page
- [ ] Add route guards for auth/team access
- [ ] Handle 401/403 redirects
- [ ] Add loading states
- [ ] Add error handling

### Testing
- [ ] Test full login flow
- [ ] Test team creation
- [ ] Test team joining
- [ ] Test team switching
- [ ] Test session expiry
- [ ] Test unauthorized access
- [ ] Test edge cases (no teams, invalid team, etc.)
