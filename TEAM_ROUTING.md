# Team Workspace Routing

## URL Structure

### `/team` - Team Login/Selection Page
- **Not authenticated**: Shows login page
- **Authenticated**: Shows team selection page
- **Purpose**: Entry point for team workspace

### `/team/workspace` - Team Workspace
- **Not authenticated**: Redirects to `/team` (login)
- **Authenticated + No team selected**: Redirects to `/team` (team selection)
- **Authenticated + Team selected + No project**: Shows project selection
- **Authenticated + Team selected + Project selected**: Shows project workspace
- **Purpose**: Main workspace for team collaboration

### `/team/signup` - Team Signup Page
- Shows signup form
- After successful signup, redirects to `/team` (login)

## Authentication Flow

```
User visits /team
  ├─ No token → Show Login
  └─ Has token → Show Team Selection
       └─ Team selected → Can access /team/workspace
```

## Workspace Flow

```
User visits /team/workspace
  ├─ No token → Redirect to /team (login)
  ├─ Has token, no team → Redirect to /team (team selection)
  └─ Has token + team
       ├─ No project → Show project selection
       └─ Has project → Show project workspace
```

## Storage Keys

- `team_session_token` - Authentication token
- `selectedTeam` - Currently selected team (JSON)
- `activeProject` - Currently selected project (JSON)

## Implementation Details

### TeamApp Component
- Handles routing logic based on URL path
- Checks authentication status
- Manages view state (login/signup/select/workspace)
- Handles browser back/forward navigation

### Route Protection
1. All routes except `/team` and `/team/signup` require authentication
2. `/team/workspace` requires both authentication and team selection
3. Unauthenticated users are redirected to `/team`
4. Authenticated users without team are redirected to `/team`

### Navigation
- Login success → `/team` (team selection)
- Team selection → `/team/workspace`
- Logout → `/team` (login)
- Browser back/forward buttons are handled via `popstate` event

## Testing

1. **Direct URL Access**:
   - Visit `http://localhost:5173/team` → Should show login or team selection
   - Visit `http://localhost:5173/team/workspace` → Should redirect if not authenticated/no team

2. **Navigation Flow**:
   - Login → Team Selection → Workspace
   - Use browser back button → Should navigate correctly
   - Refresh page → Should maintain state

3. **Logout**:
   - Click logout → Should clear storage and return to login
   - All storage keys should be cleared
