import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import { JWT_SECRET, JWT_EXPIRES_IN } from '../config/env';

const userSessionSchema = new mongoose.Schema({
  user_id: { type: String, required: true },
  session_token: { type: String, required: true, unique: true },
  workspace_path: { type: String, required: true },
  active_team_id: { type: String },
  created_at: { type: Date, default: Date.now },
  expires_at: { type: Date, required: true },
  last_activity: { type: Date, default: Date.now }
});

const teamSessionSchema = new mongoose.Schema({
  user_id: { type: String, required: true },
  team_id: { type: String, required: true },
  session_token: { type: String, required: true, unique: true },
  workspace_path: { type: String, required: true },
  created_at: { type: Date, default: Date.now },
  expires_at: { type: Date, required: true },
  last_activity: { type: Date, default: Date.now }
});

const UserSession = mongoose.model('user_sessions', userSessionSchema);
const TeamSession = mongoose.model('team_sessions', teamSessionSchema);

export const sessionService = {
  async createUserSession(userId: string, workspacePath: string) {
    const sessionToken = jwt.sign({ userId }, JWT_SECRET, { expiresIn: '24h' });
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
    
    const session = new UserSession({
      user_id: userId,
      session_token: sessionToken,
      workspace_path: workspacePath,
      expires_at: expiresAt
    });
    
    await session.save();
    return sessionToken;
  },
  
  async setActiveTeam(sessionToken: string, teamId: string) {
    const session = await UserSession.findOne({ 
      session_token: sessionToken,
      expires_at: { $gt: new Date() }
    });
    
    if (!session) return false;
    
    session.active_team_id = teamId;
    session.last_activity = new Date();
    await session.save();
    return true;
  },
  
  async getActiveTeam(sessionToken: string) {
    const session = await UserSession.findOne({ 
      session_token: sessionToken,
      expires_at: { $gt: new Date() }
    });
    
    return session?.active_team_id || null;
  },
  
  async createTeamSession(userId: string, teamId: string, workspacePath: string) {
    const sessionToken = jwt.sign({ userId, teamId }, JWT_SECRET, { expiresIn: '24h' });
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
    
    const session = new TeamSession({
      user_id: userId,
      team_id: teamId,
      session_token: sessionToken,
      workspace_path: workspacePath,
      expires_at: expiresAt
    });
    
    await session.save();
    return sessionToken;
  },
  
  async validateSession(sessionToken: string) {
    try {
      const decoded = jwt.verify(sessionToken, JWT_SECRET) as { userId: string };
      const session = await UserSession.findOne({ 
        session_token: sessionToken,
        expires_at: { $gt: new Date() }
      });
      
      if (!session) return null;
      
      session.last_activity = new Date();
      await session.save();
      
      return decoded.userId;
    } catch (error) {
      return null;
    }
  }
};
