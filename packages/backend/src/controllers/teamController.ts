import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import { teamService } from '../services/teamService';
import { userService } from '../services/userService';
import { sessionService } from '../services/sessionService';

export const createTeam = async (req: Request, res: Response) => {
  try {
    const { team_name, specialization, description } = req.body;
    const userId = (req as any).user.id;
    
    const existing = await teamService.findByName(team_name);
    if (existing) {
      return res.status(409).json({ error: { code: 'TEAM_EXISTS', message: 'Team name already exists' } });
    }
    
    const team = await teamService.createTeam({ team_name, specialization, description, created_by: userId });
    
    res.status(201).json({
      team_id: team.id,
      workspace_path: team.nfs_workspace_path,
      message: 'Team created successfully'
    });
  } catch (error) {
    console.error('Team creation error:', error);
    res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: 'Failed to create team' } });
  }
};

export const joinTeam = async (req: Request, res: Response) => {
  try {
    const { team_id } = req.body;
    const userId = (req as any).user.id;
    
    const team = await teamService.findById(team_id);
    if (!team) {
      return res.status(404).json({ error: { code: 'TEAM_NOT_FOUND', message: 'Team not found' } });
    }
    
    const isMember = await teamService.isMember(team_id, userId);
    if (isMember) {
      return res.status(409).json({ error: { code: 'ALREADY_MEMBER', message: 'Already a team member' } });
    }
    
    await teamService.addMember(team_id, userId);
    
    res.json({
      team_id: team.id,
      workspace_path: team.nfs_workspace_path,
      message: 'Joined team successfully'
    });
  } catch (error) {
    console.error('Join team error:', error);
    res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: 'Failed to join team' } });
  }
};

export const teamSignin = async (req: Request, res: Response) => {
  try {
    const { team_id, username, password } = req.body;
    
    const user = await userService.findByUsername(username);
    if (!user || !(await bcrypt.compare(password, user.password_hash))) {
      return res.status(401).json({ error: { code: 'INVALID_CREDENTIALS', message: 'Invalid credentials' } });
    }
    
    const isMember = await teamService.isMember(team_id, user.id);
    if (!isMember) {
      return res.status(403).json({ error: { code: 'NOT_MEMBER', message: 'Not a team member' } });
    }
    
    const team = await teamService.findById(team_id);
    const sessionToken = await sessionService.createTeamSession(user.id, team_id, team.nfs_workspace_path);
    
    res.json({
      session_token: sessionToken,
      team_id: team.id,
      workspace_path: team.nfs_workspace_path
    });
  } catch (error) {
    console.error('Team signin error:', error);
    res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: 'Team signin failed' } });
  }
};

export const searchTeams = async (req: Request, res: Response) => {
  try {
    const { query } = req.query;
    const teams = await teamService.searchTeams(query as string || '');
    res.json({ teams });
  } catch (error) {
    console.error('Search teams error:', error);
    res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: 'Failed to search teams' } });
  }
};

export const getUserTeams = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const teams = await teamService.getUserTeams(userId);
    res.json({ teams });
  } catch (error) {
    console.error('Get user teams error:', error);
    res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: 'Failed to get teams' } });
  }
};

export const deleteTeam = async (req: Request, res: Response) => {
  try {
    const { team_id } = req.body;
    const userId = (req as any).user.id;
    
    const team = await teamService.findById(team_id);
    if (!team) {
      return res.status(404).json({ error: { code: 'TEAM_NOT_FOUND', message: 'Team not found' } });
    }
    
    if (team.created_by !== userId) {
      return res.status(403).json({ error: { code: 'FORBIDDEN', message: 'Only team creator can delete' } });
    }
    
    await teamService.deleteTeam(team_id);
    res.json({ message: 'Team deleted successfully' });
  } catch (error) {
    console.error('Delete team error:', error);
    res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: 'Failed to delete team' } });
  }
};
