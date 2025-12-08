# Landing Page and Routing Implementation

## Overview
Implemented a landing page with two workspace options: Individual and Project Team, with proper routing for each workflow.

## URL Structure

### Root Landing Page
- **URL**: `http://localhost:5173/`
- **Purpose**: Entry point showing two workspace options
- **Options**:
  - Individual → `/individual/login`
  - Project Team → `/team/login`

### Individual Workspace Flow

```
http://localhost:5173/
  └─ Click "Individual"
      └─ http://localhost:5173/individual/login (Login Page)
          └─ After login
              └─ http://localhost:5173/individual/agent (Chat Agent)
```

**Routes:**
- `/individual/login` - Individual login page
- `/individual/agent` - Individual chat agent workspace

### Team Workspace Flow

```
http://localhost:5173/
  └─ Click "Project Team"
      └─ http://localhost:5173/team/login (Team Login)
          └─ After login
              └─ http://localhost:5173/team/project (Team & Project Selection)
                  └─ After team & project selection
                      └─ http://localhost:5173/team/workspace (Project Workspace)
```

**Routes:**
- `/team/login` - Team login page
- `/team/signup` - Team signup page
- `/team/project` - Team and project selection page
- `/team/workspace` - Team project workspace

## Components Created/Modified

### 1. **LandingPage.tsx** (New)
- Landing page with two cards: Individual and Project Team
- Handles navigation to respective login pages
- Responsive design with hover effects

### 2. **RootApp.tsx** (New)
- Root routing component
- Routes based on URL path:
  - `/` → LandingPage
  - `/individual/*` → App (Individual workspace)
  - `/team/*` → TeamApp (Team workspace)
- Handles browser navigation events

### 3. **main.tsx** (Modified)
- Updated to use RootApp instead of App
- Entry point for the entire application

### 4. **App.tsx** (Modified)
- Handles `/individual` routes
- Added routing logic:
  - Not authenticated → `/individual/login`
  - Authenticated → `/individual/agent`
- Added `onSuccess` callback support

### 5. **Login.tsx** (Modified)
- Added optional `onSuccess` prop
- Calls `onSuccess()` after successful login
- Supports custom redirect logic

### 6. **TeamApp.tsx** (Modified)
- Updated routing to use new URL structure:
  - `/team/login` - Login page
  - `/team/project` - Team/project selection
  - `/team/workspace` - Workspace
- Validates team AND project selection for workspace access
- Proper redirects based on authentication and selection state

## Storage Keys

### Individual Workspace
- Session cookies managed by backend

### Team Workspace
- `team_session_token` - Authentication token
- `selectedTeam` - Currently selected team (JSON)
- `activeProject` - Currently selected project (JSON)

## Authentication & Authorization

### Individual Workspace
1. User must be authenticated to access `/individual/agent`
2. Unauthenticated users redirected to `/individual/login`
3. After login, redirected to `/individual/agent`

### Team Workspace
1. User must be authenticated to access `/team/project` and `/team/workspace`
2. User must have selected team to access `/team/workspace`
3. User must have selected project to access `/team/workspace`
4. Redirects:
   - No auth → `/team/login`
   - Auth but no team/project → `/team/project`

## Navigation Flow Diagrams

### Individual Flow
```
┌─────────────┐
│   Landing   │
│   Page (/)  │
└──────┬──────┘
       │ Click "Individual"
       ▼
┌─────────────────────┐
│ /individual/login   │
│  (Login Page)       │
└──────┬──────────────┘
       │ Login Success
       ▼
┌─────────────────────┐
│ /individual/agent   │
│  (Chat Agent)       │
└─────────────────────┘
```

### Team Flow
```
┌─────────────┐
│   Landing   │
│   Page (/)  │
└──────┬──────┘
       │ Click "Project Team"
       ▼
┌─────────────────────┐
│   /team/login       │
│   (Team Login)      │
└──────┬──────────────┘
       │ Login Success
       ▼
┌─────────────────────┐
│   /team/project     │
│ (Team & Project     │
│   Selection)        │
└──────┬──────────────┘
       │ Team & Project Selected
       ▼
┌─────────────────────┐
│  /team/workspace    │
│ (Project Workspace) │
└─────────────────────┘
```

## Browser Navigation Support

All routes support:
- ✅ Direct URL access
- ✅ Browser back button
- ✅ Browser forward button
- ✅ Page refresh
- ✅ Proper redirects based on state

## Testing Scenarios

### Test 1: Landing Page Access
1. Visit `http://localhost:5173/`
2. Should see landing page with two options
3. Click "Individual" → Navigate to `/individual/login`
4. Click back → Return to landing page
5. Click "Project Team" → Navigate to `/team/login`

### Test 2: Individual Workflow
1. From landing, click "Individual"
2. Login at `/individual/login`
3. Should redirect to `/individual/agent`
4. Refresh page → Should stay at `/individual/agent`

### Test 3: Team Workflow
1. From landing, click "Project Team"
2. Login at `/team/login`
3. Should redirect to `/team/project`
4. Select team and project
5. Should redirect to `/team/workspace`
6. Refresh page → Should stay at `/team/workspace`

### Test 4: Direct URL Access (Not Authenticated)
1. Visit `http://localhost:5173/individual/agent`
2. Should redirect to `/individual/login`
3. Visit `http://localhost:5173/team/workspace`
4. Should redirect to `/team/login`

### Test 5: Direct URL Access (Authenticated, No Selection)
1. Login to team workspace
2. Don't select team/project
3. Visit `http://localhost:5173/team/workspace`
4. Should redirect to `/team/project`

### Test 6: Logout
1. From any workspace, click logout
2. Should clear storage
3. Should redirect to respective login page
4. Cannot access workspace URLs without re-authentication

## Implementation Notes

### Route Protection
- Individual routes check session authentication
- Team routes check token + team + project selection
- Automatic redirects prevent unauthorized access

### State Management
- Individual: Session-based (backend cookies)
- Team: localStorage-based (client-side)
- Both support page refresh and direct URL access

### URL Design
- Clean, semantic URLs
- RESTful structure
- Easy to bookmark and share
- Clear separation between individual and team workspaces

## Future Enhancements

- Add React Router for more robust routing
- Add route transition animations
- Add loading states during navigation
- Add breadcrumb navigation
- Add route-based analytics
- Add deep linking support for specific projects/teams
