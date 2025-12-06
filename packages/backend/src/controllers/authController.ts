import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import { userService } from '../services/userService';
import { sessionService } from '../services/sessionService';
import { apiKeyService } from '../services/apiKeyService';
import { nfsService } from '../services/nfsService';
import { teamService } from '../services/teamService';

export const signup = async (req: Request, res: Response) => {
  try {
    const { username, email, full_name, phone, password } = req.body;
    
    if (!username || !email || !full_name || !password) {
      return res.status(400).json({ error: { code: 'MISSING_FIELDS', message: 'Required fields missing' } });
    }
    
    const existingUser = await userService.findByUsernameOrEmail(username, email);
    if (existingUser) {
      return res.status(409).json({ error: { code: 'USER_EXISTS', message: 'Username or email already exists' } });
    }
    
    const user = await userService.createUser({ username, email, full_name, phone, password });
    const apiKey = await apiKeyService.createApiKey(user.id);
    await nfsService.createPrivateWorkspace(user.id);
    
    res.status(201).json({
      user_id: user.id,
      api_key: apiKey,
      workspace_path: user.nfs_workspace_path,
      message: 'User registered successfully'
    });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: 'Failed to register user' } });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { username, password } = req.body;
    
    const user = await userService.findByUsername(username);
    if (!user) {
      return res.status(401).json({ error: { code: 'INVALID_CREDENTIALS', message: 'Invalid username or password' } });
    }
    
    const isValid = await bcrypt.compare(password, user.password_hash);
    if (!isValid) {
      return res.status(401).json({ error: { code: 'INVALID_CREDENTIALS', message: 'Invalid username or password' } });
    }
    
    const sessionToken = await sessionService.createUserSession(user.id, user.nfs_workspace_path);
    const teams = await teamService.getUserTeams(user.id);
    
    res.json({
      session_token: sessionToken,
      user_id: user.id,
      workspace_path: user.nfs_workspace_path,
      teams: teams.map(t => t.id)
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: 'Login failed' } });
  }
};
