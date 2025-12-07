# TeamDashboard.tsx Refactoring Migration Plan

## Current State
- **File**: `packages/web-ui/client/src/pages/team/TeamDashboard.tsx`
- **Size**: 2,939 lines
- **Complexity**: High - manages 6 main tabs, 8 project sub-tabs, multiple state variables

## Goals
1. Split into manageable, focused files (< 300 lines each)
2. Maintain all existing functionality
3. Zero breaking changes to user experience
4. Improve maintainability and testability

---

## Phase 1: Setup & Types (Low Risk)
**Estimated Time**: 30 minutes  
**Risk Level**: ⚠️ Low

### Step 1.1: Create Directory Structure
```bash
mkdir -p packages/web-ui/client/src/pages/team/components/tabs
mkdir -p packages/web-ui/client/src/pages/team/hooks
mkdir -p packages/web-ui/client/src/pages/team/types
```

### Step 1.2: Extract TypeScript Types
**New File**: `packages/web-ui/client/src/pages/team/types/team.types.ts`

Extract:
- `TabType` type definition
- All interface definitions for data structures
- Form state types

**Testing**: TypeScript compilation should pass

---

## Phase 2: Extract Custom Hooks (Medium Risk)
**Estimated Time**: 2 hours  
**Risk Level**: ⚠️⚠️ Medium

### Step 2.1: Extract Profile Hook
**New File**: `packages/web-ui/client/src/pages/team/hooks/useProfile.ts`

Extract:
- `profileData` state
- `isEditingProfile` state
- `loadProfile()` function
- `handleUpdateProfile()` function

**Dependencies**: None  
**Testing**: Profile tab should load and update correctly

### Step 2.2: Extract Teams Hook
**New File**: `packages/web-ui/client/src/pages/team/hooks/useTeams.ts`

Extract:
- `myTeams` state
- `selectedTeam` state
- `teamMembers` state
- `loadMyTeams()` function
- `handleCreateTeam()` function
- `handleJoinTeam()` function
- `handleSelectTeam()` function
- `loadTeamMembers()` function
- `handleAddMember()` function
- `handleRemoveMember()` function

**Dependencies**: None  
**Testing**: Team creation, joining, and member management

### Step 2.3: Extract Todos Hook
**New File**: `packages/web-ui/client/src/pages/team/hooks/useTodos.ts`

Extract:
- `todos` state
- `newTodo` state
- `loadTodos()` function
- `addTodo()` function
- `toggleTodo()` function
- `deleteTodo()` function
- `updateTodo()` function

**Dependencies**: `selectedTeam`  
**Testing**: Todo CRUD operations

### Step 2.4: Extract Calendar Hook
**New File**: `packages/web-ui/client/src/pages/team/hooks/useCalendar.ts`

Extract:
- `currentMonth` state
- `calendarEvents` state
- `eventForm` state
- `loadCalendarEvents()` function
- `addCalendarEvent()` function
- `deleteCalendarEvent()` function
- Calendar navigation functions

**Dependencies**: `selectedTeam`  
**Testing**: Calendar display and event management

### Step 2.5: Extract Notifications Hook
**New File**: `packages/web-ui/client/src/pages/team/hooks/useNotifications.ts`

Extract:
- `notifications` state
- `selectedNotification` state
- `replyMessage` state
- `broadcastMessage` state
- `broadcastType` state
- `loadNotifications()` function
- `loadAllTeamNotifications()` function
- `handleBroadcast()` function
- `handleReply()` function
- `markAsRead()` function

**Dependencies**: `selectedTeam`, `myTeams`  
**Testing**: Notification loading, broadcasting, replies

### Step 2.6: Extract Project Hook
**New File**: `packages/web-ui/client/src/pages/team/hooks/useProject.ts`

Extract:
- All 8 project section states (requirements, architectures, etc.)
- All 8 form states
- `loadProjectData()` function
- All CRUD functions for 8 sections (32 functions total)

**Dependencies**: `selectedTeam`  
**Testing**: All project management CRUD operations

### Step 2.7: Extract Knowledge Hook
**New File**: `packages/web-ui/client/src/pages/team/hooks/useKnowledge.ts`

Extract:
- `files` state
- `searchQuery` state
- `searchResults` state
- `loadFiles()` function
- `handleUpload()` function
- `handleDelete()` function
- `handleSearch()` function

**Dependencies**: `workspaceType`, `selectedTeamId`  
**Testing**: File upload, delete, search

---

## Phase 3: Extract Tab Components (Medium Risk)
**Estimated Time**: 3 hours  
**Risk Level**: ⚠️⚠️ Medium

### Step 3.1: Extract Dashboard Tab
**New File**: `packages/web-ui/client/src/pages/team/components/tabs/DashboardTab.tsx`

Extract:
- Dashboard sub-tab navigation
- Notifications section
- Todo list section
- Calendar section

**Props Needed**:
- `dashboardSubTab`, `setDashboardSubTab`
- Hooks: `useNotifications`, `useTodos`, `useCalendar`
- `selectedTeam`

**Testing**: All dashboard sub-tabs render and function

### Step 3.2: Extract Project Tab
**New File**: `packages/web-ui/client/src/pages/team/components/tabs/ProjectTab.tsx`

Extract:
- Project sub-tab navigation (8 tabs)
- All 8 project sections UI

**Props Needed**:
- `projectSubTab`, `setProjectSubTab`
- Hook: `useProject`
- `selectedTeam`

**Testing**: All 8 project sub-tabs and CRUD operations

### Step 3.3: Extract Knowledge Tab
**New File**: `packages/web-ui/client/src/pages/team/components/tabs/KnowledgeTab.tsx`

Extract:
- File upload UI
- File list display
- Search functionality

**Props Needed**:
- Hook: `useKnowledge`
- `workspaceType`, `selectedTeamId`

**Testing**: Upload, delete, search files

### Step 3.4: Extract Team Tab
**New File**: `packages/web-ui/client/src/pages/team/components/tabs/TeamTab.tsx`

Extract:
- Team sub-tab navigation (my-teams, all-teams)
- Team action tabs (create, join)
- Team list display
- Team creation form
- Team join form
- Team member management

**Props Needed**:
- `teamSubTab`, `setTeamSubTab`
- `teamActionTab`, `setTeamActionTab`
- Hook: `useTeams`

**Testing**: Team CRUD and member management

### Step 3.5: Extract Profile Tab
**New File**: `packages/web-ui/client/src/pages/team/components/tabs/ProfileTab.tsx`

Extract:
- Profile display
- Profile edit form
- Broadcast message form

**Props Needed**:
- Hook: `useProfile`
- `selectedTeam`

**Testing**: Profile view and update

---

## Phase 4: Extract Navigation Components (Low Risk)
**Estimated Time**: 1 hour  
**Risk Level**: ⚠️ Low

### Step 4.1: Extract Navigation Bar
**New File**: `packages/web-ui/client/src/pages/team/components/Navigation.tsx`

Extract:
- Top navigation bar
- Tab buttons
- Workspace type selector
- Username display
- Logout button

**Props Needed**:
- `activeTab`, `setActiveTab`
- `workspaceType`, `setWorkspaceType`
- `username`
- `handleLogout`

**Testing**: Tab navigation and logout

### Step 4.2: Extract Team Selector
**New File**: `packages/web-ui/client/src/pages/team/components/TeamSelector.tsx`

Extract:
- Team dropdown selector
- Team search functionality

**Props Needed**:
- `myTeams`
- `selectedTeam`, `setSelectedTeam`
- `teamSearchQuery`, `setTeamSearchQuery`
- `teamSearchResults`

**Testing**: Team selection and search

---

## Phase 5: Refactor Main Component (High Risk)
**Estimated Time**: 1 hour  
**Risk Level**: ⚠️⚠️⚠️ High

### Step 5.1: Simplify TeamDashboard.tsx
**Modified File**: `packages/web-ui/client/src/pages/team/TeamDashboard.tsx`

Transform into orchestrator:
- Import all hooks
- Import all tab components
- Import navigation components
- Manage only top-level state (activeTab, workspaceType)
- Pass props to child components
- Handle logout and authentication

**Expected Size**: ~200 lines

**Testing**: Full regression test of all features

---

## Phase 6: Cleanup & Optimization (Low Risk)
**Estimated Time**: 30 minutes  
**Risk Level**: ⚠️ Low

### Step 6.1: Remove Unused Code
- Remove commented code
- Clean up console.logs
- Verify all imports

### Step 6.2: Add Documentation
- Add JSDoc comments to hooks
- Document component props
- Update README if needed

---

## Testing Strategy

### After Each Phase:
1. **TypeScript Compilation**: `npm run build` (web-ui)
2. **Manual Testing**: Test affected features in browser
3. **Git Commit**: Commit working state before next phase

### Critical Test Cases:
- [ ] Login/Logout flow
- [ ] Team creation and joining
- [ ] Team member management
- [ ] File upload and search
- [ ] Todo CRUD operations
- [ ] Calendar event management
- [ ] Notification system
- [ ] All 8 project management sections
- [ ] Profile update
- [ ] Tab navigation
- [ ] Team switching

---

## Rollback Plan

### If Issues Arise:
1. **Git Revert**: Each phase is committed separately
2. **Feature Flags**: Can temporarily disable new components
3. **Backup**: Original file preserved as `TeamDashboard.backup.tsx`

---

## Success Metrics

### Code Quality:
- ✅ No file > 300 lines
- ✅ Each file has single responsibility
- ✅ TypeScript strict mode passes
- ✅ No ESLint errors

### Functionality:
- ✅ All existing features work
- ✅ No performance regression
- ✅ No visual changes (unless intentional)

### Maintainability:
- ✅ Clear file organization
- ✅ Reusable hooks
- ✅ Easy to locate code
- ✅ Easier to add new features

---

## Estimated Total Time: 7-8 hours

## Risk Mitigation:
- Work in feature branch
- Commit after each phase
- Test thoroughly before merging
- Keep original file as backup
- Can pause/resume at any phase boundary

---

## Next Steps

1. **Review this plan** - Confirm approach
2. **Create feature branch**: `git checkout -b refactor/split-team-dashboard`
3. **Start Phase 1** - Low risk, quick wins
4. **Proceed sequentially** - Don't skip phases
5. **Test continuously** - Catch issues early

---

## Notes

- MongoDB integration already complete (from previous work)
- All API endpoints functional
- Focus on code organization, not functionality changes
- Can parallelize some hook extractions if needed
- Consider adding unit tests for hooks in future phase
