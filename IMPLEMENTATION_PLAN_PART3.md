# Implementation Plan - Part 3

## Phase 4: Frontend Development (10-14 days)

### Task 4.1: Frontend Project Setup
**Priority**: P0 (Critical)
**Assignee**: Frontend Developer
**Estimated Time**: 4 hours
**Dependencies**: None

**Acceptance Criteria:**
- [ ] React project initialized in `packages/web-ui`
- [ ] TypeScript configured
- [ ] React Router setup
- [ ] State management (Redux Toolkit) configured
- [ ] API client service created
- [ ] UI component library integrated (Material-UI or Ant Design)

**Project Structure:**
```
packages/web-ui/
├── package.json
├── tsconfig.json
├── vite.config.ts
├── src/
│   ├── main.tsx
│   ├── App.tsx
│   ├── components/
│   ├── pages/
│   ├── services/
│   ├── store/
│   ├── types/
│   └── utils/
└── public/
```

**package.json:**
```json
{
  "name": "@qwen-code/web-ui",
  "version": "1.0.0",
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-router-dom": "^6.20.1",
    "@reduxjs/toolkit": "^2.0.1",
    "react-redux": "^9.0.4",
    "axios": "^1.6.2",
    "@mui/material": "^5.15.0",
    "@mui/icons-material": "^5.15.0",
    "@emotion/react": "^11.11.3",
    "@emotion/styled": "^11.11.0"
  },
  "devDependencies": {
    "@types/react": "^18.2.45",
    "@types/react-dom": "^18.2.18",
    "@vitejs/plugin-react": "^4.2.1",
    "typescript": "^5.3.3",
    "vite": "^5.0.8"
  }
}
```

**API Client: `src/services/api.ts`**
```typescript
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001';

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor to add auth token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('session_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('session_token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);
```

---

### Task 4.2: Login Page
**Priority**: P0 (Critical)
**Assignee**: Frontend Developer
**Estimated Time**: 4 hours
**Dependencies**: Task 4.1

**Acceptance Criteria:**
- [ ] Login form with username and password fields
- [ ] Form validation
- [ ] Error message display
- [ ] Redirect to dashboard on success
- [ ] "Sign up" link to registration page
- [ ] Session token stored in localStorage

**Implementation:**

**File: `src/pages/Login.tsx`**
```typescript
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Box, TextField, Button, Typography, Alert, Paper } from '@mui/material';
import { useAppDispatch } from '../store/hooks';
import { login } from '../store/authSlice';

export const Login: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      await dispatch(login({ username, password })).unwrap();
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
      <Paper sx={{ p: 4, maxWidth: 400, width: '100%' }}>
        <Typography variant="h4" gutterBottom>Login</Typography>
        
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        
        <form onSubmit={handleSubmit}>
          <TextField
            label="Username"
            fullWidth
            margin="normal"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
          
          <TextField
            label="Password"
            type="password"
            fullWidth
            margin="normal"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          
          <Button
            type="submit"
            variant="contained"
            fullWidth
            sx={{ mt: 2 }}
            disabled={loading}
          >
            {loading ? 'Logging in...' : 'Login'}
          </Button>
        </form>
        
        <Box sx={{ mt: 2, textAlign: 'center' }}>
          <Typography variant="body2">
            Don't have an account? <Link to="/signup">Sign up</Link>
          </Typography>
        </Box>
      </Paper>
    </Box>
  );
};
```

**File: `src/store/authSlice.ts`**
```typescript
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { authService } from '../services/authService';

interface AuthState {
  user: {
    id: string;
    username: string;
    workspace_path: string;
  } | null;
  teams: string[];
  isAuthenticated: boolean;
}

const initialState: AuthState = {
  user: null,
  teams: [],
  isAuthenticated: false
};

export const login = createAsyncThunk(
  'auth/login',
  async (credentials: { username: string; password: string }) => {
    const response = await authService.login(credentials);
    localStorage.setItem('session_token', response.session_token);
    return response;
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout: (state) => {
      state.user = null;
      state.teams = [];
      state.isAuthenticated = false;
      localStorage.removeItem('session_token');
    }
  },
  extraReducers: (builder) => {
    builder.addCase(login.fulfilled, (state, action) => {
      state.user = {
        id: action.payload.user_id,
        username: action.payload.username,
        workspace_path: action.payload.workspace_path
      };
      state.teams = action.payload.teams;
      state.isAuthenticated = true;
    });
  }
});

export const { logout } = authSlice.actions;
export default authSlice.reducer;
```

**File: `src/services/authService.ts`**
```typescript
import { api } from './api';

export const authService = {
  async login(credentials: { username: string; password: string }) {
    const response = await api.post('/api/auth/login', credentials);
    return response.data;
  },
  
  async signup(data: {
    username: string;
    email: string;
    full_name: string;
    phone?: string;
    password: string;
  }) {
    const response = await api.post('/api/auth/signup', data);
    return response.data;
  }
};
```

---

### Task 4.3: Signup Page
**Priority**: P0 (Critical)
**Assignee**: Frontend Developer
**Estimated Time**: 5 hours
**Dependencies**: Task 4.2

**Acceptance Criteria:**
- [ ] Signup form with all required fields
- [ ] Email validation
- [ ] Password strength indicator
- [ ] Form validation
- [ ] Display API key after successful registration
- [ ] Redirect to dashboard or show onboarding

**Implementation:**

**File: `src/pages/Signup.tsx`**
```typescript
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Box, TextField, Button, Typography, Alert, Paper } from '@mui/material';
import { authService } from '../services/authService';

export const Signup: React.FC = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    full_name: '',
    phone: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [loading, setLoading] = useState(false);
  
  const navigate = useNavigate();
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    
    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }
    
    setLoading(true);
    
    try {
      const response = await authService.signup({
        username: formData.username,
        email: formData.email,
        full_name: formData.full_name,
        phone: formData.phone,
        password: formData.password
      });
      
      setApiKey(response.api_key);
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Signup failed');
    } finally {
      setLoading(false);
    }
  };
  
  if (apiKey) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <Paper sx={{ p: 4, maxWidth: 500, width: '100%' }}>
          <Typography variant="h4" gutterBottom>Registration Successful!</Typography>
          
          <Alert severity="success" sx={{ mb: 2 }}>
            Your account has been created successfully.
          </Alert>
          
          <Alert severity="info" sx={{ mb: 2 }}>
            <Typography variant="subtitle2" gutterBottom>Your API Key:</Typography>
            <Typography variant="body2" sx={{ fontFamily: 'monospace', wordBreak: 'break-all' }}>
              {apiKey}
            </Typography>
            <Typography variant="caption" display="block" sx={{ mt: 1 }}>
              Please save this key securely. You won't be able to see it again.
            </Typography>
          </Alert>
          
          <Button
            variant="contained"
            fullWidth
            onClick={() => navigate('/login')}
          >
            Continue to Login
          </Button>
        </Paper>
      </Box>
    );
  }
  
  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
      <Paper sx={{ p: 4, maxWidth: 500, width: '100%' }}>
        <Typography variant="h4" gutterBottom>Sign Up</Typography>
        
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        
        <form onSubmit={handleSubmit}>
          <TextField
            name="username"
            label="Username"
            fullWidth
            margin="normal"
            value={formData.username}
            onChange={handleChange}
            required
          />
          
          <TextField
            name="email"
            label="Email"
            type="email"
            fullWidth
            margin="normal"
            value={formData.email}
            onChange={handleChange}
            required
          />
          
          <TextField
            name="full_name"
            label="Full Name"
            fullWidth
            margin="normal"
            value={formData.full_name}
            onChange={handleChange}
            required
          />
          
          <TextField
            name="phone"
            label="Phone (optional)"
            fullWidth
            margin="normal"
            value={formData.phone}
            onChange={handleChange}
          />
          
          <TextField
            name="password"
            label="Password"
            type="password"
            fullWidth
            margin="normal"
            value={formData.password}
            onChange={handleChange}
            required
          />
          
          <TextField
            name="confirmPassword"
            label="Confirm Password"
            type="password"
            fullWidth
            margin="normal"
            value={formData.confirmPassword}
            onChange={handleChange}
            required
          />
          
          <Button
            type="submit"
            variant="contained"
            fullWidth
            sx={{ mt: 2 }}
            disabled={loading}
          >
            {loading ? 'Creating Account...' : 'Sign Up'}
          </Button>
        </form>
        
        <Box sx={{ mt: 2, textAlign: 'center' }}>
          <Typography variant="body2">
            Already have an account? <Link to="/login">Login</Link>
          </Typography>
        </Box>
      </Paper>
    </Box>
  );
};
```

---

### Task 4.4: Dashboard with File Explorer
**Priority**: P0 (Critical)
**Assignee**: Frontend Developer
**Estimated Time**: 8 hours
**Dependencies**: Task 4.2

**Acceptance Criteria:**
- [ ] Dashboard layout with sidebar and main content
- [ ] File list display
- [ ] Upload button and functionality
- [ ] Download file functionality
- [ ] Delete file functionality
- [ ] Workspace selector (private/team)
- [ ] Search bar for semantic search

**Implementation:**

**File: `src/pages/Dashboard.tsx`**
```typescript
import React, { useEffect, useState } from 'react';
import { Box, AppBar, Toolbar, Typography, Button, Drawer, List, ListItem, ListItemText } from '@mui/material';
import { FileExplorer } from '../components/workspace/FileExplorer';
import { FileUpload } from '../components/workspace/FileUpload';
import { WorkspaceSelector } from '../components/workspace/WorkspaceSelector';
import { useAppSelector, useAppDispatch } from '../store/hooks';
import { logout } from '../store/authSlice';
import { useNavigate } from 'react-router-dom';

export const Dashboard: React.FC = () => {
  const { user, teams } = useAppSelector((state) => state.auth);
  const [workspaceType, setWorkspaceType] = useState<'private' | 'team'>('private');
  const [selectedTeam, setSelectedTeam] = useState<string | null>(null);
  
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  
  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };
  
  return (
    <Box sx={{ display: 'flex', height: '100vh' }}>
      <AppBar position="fixed">
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            Qwen Code Workspace
          </Typography>
          <Typography variant="body2" sx={{ mr: 2 }}>
            {user?.username}
          </Typography>
          <Button color="inherit" onClick={handleLogout}>
            Logout
          </Button>
        </Toolbar>
      </AppBar>
      
      <Drawer
        variant="permanent"
        sx={{
          width: 240,
          flexShrink: 0,
          '& .MuiDrawer-paper': { width: 240, boxSizing: 'border-box', mt: 8 }
        }}
      >
        <WorkspaceSelector
          workspaceType={workspaceType}
          teams={teams}
          selectedTeam={selectedTeam}
          onWorkspaceChange={setWorkspaceType}
          onTeamChange={setSelectedTeam}
        />
      </Drawer>
      
      <Box component="main" sx={{ flexGrow: 1, p: 3, mt: 8 }}>
        <FileUpload workspaceType={workspaceType} teamId={selectedTeam} />
        <FileExplorer workspaceType={workspaceType} teamId={selectedTeam} />
      </Box>
    </Box>
  );
};
```

**File: `src/components/workspace/FileExplorer.tsx`**
```typescript
import React, { useEffect, useState } from 'react';
import { Box, Table, TableBody, TableCell, TableHead, TableRow, IconButton, Typography } from '@mui/material';
import { Download, Delete } from '@mui/icons-material';
import { fileService } from '../../services/fileService';

interface FileExplorerProps {
  workspaceType: 'private' | 'team';
  teamId: string | null;
}

export const FileExplorer: React.FC<FileExplorerProps> = ({ workspaceType, teamId }) => {
  const [files, setFiles] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  
  useEffect(() => {
    loadFiles();
  }, [workspaceType, teamId]);
  
  const loadFiles = async () => {
    setLoading(true);
    try {
      const data = await fileService.listFiles(workspaceType, teamId);
      setFiles(data.files);
    } catch (error) {
      console.error('Failed to load files:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const handleDownload = async (filePath: string) => {
    try {
      await fileService.downloadFile(filePath);
    } catch (error) {
      console.error('Download failed:', error);
    }
  };
  
  const handleDelete = async (filePath: string) => {
    if (!confirm('Are you sure you want to delete this file?')) return;
    
    try {
      await fileService.deleteFile(filePath);
      loadFiles();
    } catch (error) {
      console.error('Delete failed:', error);
    }
  };
  
  if (loading) return <Typography>Loading...</Typography>;
  
  return (
    <Box sx={{ mt: 3 }}>
      <Typography variant="h6" gutterBottom>Files</Typography>
      
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Name</TableCell>
            <TableCell>Size</TableCell>
            <TableCell>Modified</TableCell>
            <TableCell>Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {files.map((file) => (
            <TableRow key={file.path}>
              <TableCell>{file.name}</TableCell>
              <TableCell>{(file.size / 1024).toFixed(2)} KB</TableCell>
              <TableCell>{new Date(file.modified_at).toLocaleString()}</TableCell>
              <TableCell>
                <IconButton onClick={() => handleDownload(file.path)}>
                  <Download />
                </IconButton>
                <IconButton onClick={() => handleDelete(file.path)}>
                  <Delete />
                </IconButton>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Box>
  );
};
```

---

### Task 4.5: Team Management UI
**Priority**: P1 (High)
**Assignee**: Frontend Developer
**Estimated Time**: 6 hours
**Dependencies**: Task 4.4

**Acceptance Criteria:**
- [ ] Team creation dialog
- [ ] Team list view
- [ ] Join team functionality
- [ ] Team sign-in page
- [ ] Team workspace view

**Implementation:**

**File: `src/components/team/TeamCreateDialog.tsx`**
```typescript
import React, { useState } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, TextField, Button, Alert } from '@mui/material';
import { teamService } from '../../services/teamService';

interface TeamCreateDialogProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const TeamCreateDialog: React.FC<TeamCreateDialogProps> = ({ open, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    team_name: '',
    specialization: '',
    description: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const handleSubmit = async () => {
    setError('');
    setLoading(true);
    
    try {
      await teamService.createTeam(formData);
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Failed to create team');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Create New Team</DialogTitle>
      <DialogContent>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        
        <TextField
          label="Team Name"
          fullWidth
          margin="normal"
          value={formData.team_name}
          onChange={(e) => setFormData({ ...formData, team_name: e.target.value })}
          required
        />
        
        <TextField
          label="Specialization"
          fullWidth
          margin="normal"
          value={formData.specialization}
          onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
        />
        
        <TextField
          label="Description"
          fullWidth
          multiline
          rows={4}
          margin="normal"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleSubmit} variant="contained" disabled={loading}>
          {loading ? 'Creating...' : 'Create Team'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
```

---

## Phase 5: Testing (5-7 days)

### Task 5.1: Unit Tests - Backend
**Priority**: P1 (High)
**Assignee**: Backend Developer / QA
**Estimated Time**: 8 hours
**Dependencies**: Phase 2 complete

**Test Coverage:**
- [ ] User service tests
- [ ] Team service tests
- [ ] File service tests
- [ ] Embedding service tests
- [ ] Authentication middleware tests

**Example Test:**
```typescript
// tests/services/userService.test.ts
import { userService } from '../../src/services/userService';
import { pool } from '../../src/config/database';

describe('UserService', () => {
  afterAll(async () => {
    await pool.end();
  });
  
  describe('createUser', () => {
    it('should create a new user', async () => {
      const userData = {
        username: 'test_user',
        email: 'test@example.com',
        full_name: 'Test User',
        password: 'password123'
      };
      
      const user = await userService.createUser(userData);
      
      expect(user).toHaveProperty('id');
      expect(user.username).toBe(userData.username);
      expect(user.email).toBe(userData.email);
    });
    
    it('should hash password', async () => {
      const user = await userService.findByUsername('test_user');
      expect(user.password_hash).not.toBe('password123');
    });
  });
});
```

---

### Task 5.2: Integration Tests
**Priority**: P1 (High)
**Assignee**: QA Engineer
**Estimated Time**: 12 hours
**Dependencies**: Phase 2, 3 complete

**Test Scenarios:**
- [ ] User registration flow
- [ ] User login flow
- [ ] Team creation and join flow
- [ ] File upload and download
- [ ] Vector search functionality
- [ ] Access control validation

---

### Task 5.3: E2E Tests
**Priority**: P2 (Medium)
**Assignee**: QA Engineer
**Estimated Time**: 10 hours
**Dependencies**: Phase 4 complete

**Test Scenarios:**
- [ ] Complete user journey (signup → login → upload → search)
- [ ] Team collaboration workflow
- [ ] Multi-user scenarios
- [ ] Error handling and edge cases

---

## Phase 6: Deployment & Documentation (3-5 days)

### Task 6.1: API Documentation
**Priority**: P1 (High)
**Assignee**: Backend Developer
**Estimated Time**: 6 hours

**Deliverables:**
- [ ] OpenAPI/Swagger specification
- [ ] API endpoint documentation
- [ ] Authentication guide
- [ ] Error code reference

---

### Task 6.2: User Documentation
**Priority**: P1 (High)
**Assignee**: Technical Writer / Developer
**Estimated Time**: 8 hours

**Deliverables:**
- [ ] User guide for web UI
- [ ] Team management guide
- [ ] File operations guide
- [ ] Troubleshooting guide

---

### Task 6.3: Deployment Setup
**Priority**: P0 (Critical)
**Assignee**: DevOps Engineer
**Estimated Time**: 8 hours

**Deliverables:**
- [ ] Production docker-compose configuration
- [ ] Environment variable documentation
- [ ] Backup and restore procedures
- [ ] Monitoring setup (Prometheus/Grafana)
- [ ] Log aggregation (ELK stack)

---

## Task Tracking Template

```markdown
## Task: [Task Name]
**Status**: Not Started | In Progress | Blocked | Review | Done
**Assignee**: [Name]
**Priority**: P0 | P1 | P2
**Estimated**: [X hours]
**Actual**: [X hours]
**Sprint**: [Sprint Number]

### Progress
- [ ] Subtask 1
- [ ] Subtask 2
- [ ] Subtask 3

### Blockers
- None

### Notes
- [Any relevant notes]
```

---

## Risk Management

### High Risk Items
1. **NFS Performance**: File operations may be slow
   - Mitigation: Implement caching, async operations
   
2. **Vector Search Accuracy**: Embeddings may not be accurate
   - Mitigation: Test with various file types, tune parameters
   
3. **Concurrent Access**: Race conditions in file operations
   - Mitigation: Implement file locking, transaction management

### Medium Risk Items
1. **API Rate Limits**: OpenAI embedding API limits
   - Mitigation: Implement queue system, batch processing
   
2. **Storage Limits**: NFS storage capacity
   - Mitigation: Implement quotas, cleanup policies

---

## Success Metrics

### Performance Metrics
- API response time < 200ms (95th percentile)
- File upload speed > 10MB/s
- Vector search latency < 500ms
- Concurrent users supported: 100+

### Quality Metrics
- Test coverage > 80%
- Zero critical bugs in production
- API uptime > 99.9%

### User Metrics
- User registration success rate > 95%
- File upload success rate > 99%
- Search result relevance > 80%

---

## Deployment Checklist

- [ ] All tests passing
- [ ] Database migrations tested
- [ ] Environment variables configured
- [ ] SSL certificates installed
- [ ] Backup procedures tested
- [ ] Monitoring dashboards created
- [ ] Documentation published
- [ ] Security audit completed
- [ ] Performance testing completed
- [ ] Rollback plan documented
