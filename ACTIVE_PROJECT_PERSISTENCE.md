# Active Project Persistence Fix

## Problem
When navigating between tabs in the team workspace, the active project selection was lost, causing the "Please select a project to view tasks" message to appear when returning to the Project Task tab.

## Root Cause
The active project was stored in `sessionStorage` but the state was not properly synchronized when switching tabs. The component state (`activeProject`) was being reset while the sessionStorage value remained.

## Solution
Implemented a centralized persistence mechanism using `localStorage` with proper state synchronization:

### 1. **useProject Hook** (`packages/web-ui/client/src/pages/team/hooks/useProject.ts`)
Added three persistence helper functions:

- `getActiveProjectId()` - Returns the active project ID from localStorage
- `getActiveProject()` - Returns the full active project object from localStorage  
- `setActiveProject(project)` - Saves or removes the active project in localStorage

**Key Changes:**
- Changed from `sessionStorage` to `localStorage` for better persistence
- Exported `getActiveProject` and `setActiveProject` for use by components
- Handles null values properly (removes from storage when project is null)

### 2. **TeamDashboard Component** (`packages/web-ui/client/src/pages/team/TeamDashboard.tsx`)
Created a wrapper function to synchronize state and persistence:

```typescript
const handleSetActiveProject = (proj: any) => {
  setActiveProject(proj);
  project.setActiveProject(proj);
};
```

**Key Changes:**
- Loads active project on mount using `project.getActiveProject()`
- Passes `handleSetActiveProject` to child components instead of raw `setActiveProject`
- Ensures both React state and localStorage are updated together

### 3. **ProjectTab Component** (`packages/web-ui/client/src/pages/team/components/tabs/ProjectTab.tsx`)
Removed direct storage manipulation:

**Key Changes:**
- Removed all `sessionStorage.setItem()` calls
- Removed all `sessionStorage.removeItem()` calls
- Now relies on parent component's `setActiveProject` prop for persistence

## Benefits

1. **Persistent Selection**: Active project persists across tab switches and page refreshes
2. **Centralized Logic**: All persistence logic is in one place (useProject hook)
3. **Better UX**: Users don't lose their project selection when navigating
4. **localStorage vs sessionStorage**: Using localStorage provides persistence across browser sessions

## Testing

To verify the fix:
1. Select a project in the Project tab
2. Navigate to other tabs (Knowledge, Team, etc.)
3. Return to Project Task tab
4. The selected project should still be active
5. Refresh the page - the project selection should persist

## Files Modified

- `packages/web-ui/client/src/pages/team/hooks/useProject.ts`
- `packages/web-ui/client/src/pages/team/TeamDashboard.tsx`
- `packages/web-ui/client/src/pages/team/components/tabs/ProjectTab.tsx`
