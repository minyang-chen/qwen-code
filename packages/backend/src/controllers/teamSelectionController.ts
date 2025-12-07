import { Request, Response } from 'express';
import { teamService } from '../services/teamService';
import { sessionService } from '../services/sessionService';

interface Team {
  id: string;
  team_name: string;
  role?: string;
  member_count?: number;
}

export const listTeams = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const myTeams = await teamService.getUserTeams(userId);
    const allTeams = await teamService.getAllTeams();
    
    const myTeamIds = new Set(myTeams.map((t: Team) => t.id));
    const availableTeams = allTeams.filter((t: Team) => !myTeamIds.has(t.id));

    res.json({
      myTeams: myTeams.map((t: Team) => ({
        id: t.id,
        name: t.team_name,
        role: t.role || 'member'
      })),
      availableTeams: availableTeams.map((t: Team) => ({
        id: t.id,
        name: t.team_name,
        memberCount: t.member_count || 0
      }))
    });
  } catch (error) {
    console.error('List teams error:', error);
    res.status(500).json({ error: 'Failed to list teams' });
  }
};

export const selectTeam = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const { teamId } = req.body;
    const sessionToken = req.headers.authorization?.split(' ')[1];

    if (!userId || !sessionToken) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    if (!teamId) {
      return res.status(400).json({ error: 'Team ID required' });
    }

    const teams = await teamService.getUserTeams(userId);
    const isMember = teams.some((t: Team) => t.id === teamId);

    if (!isMember) {
      return res.status(403).json({ error: 'Not a team member' });
    }

    await sessionService.setActiveTeam(sessionToken, teamId);

    res.json({
      success: true,
      redirectTo: '/team/workspace'
    });
  } catch (error) {
    console.error('Select team error:', error);
    res.status(500).json({ error: 'Failed to select team' });
  }
};

export const getActiveTeam = async (req: Request, res: Response) => {
  try {
    const sessionToken = req.headers.authorization?.split(' ')[1];
    if (!sessionToken) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const activeTeamId = await sessionService.getActiveTeam(sessionToken);
    res.json({ activeTeamId });
  } catch (error) {
    console.error('Get active team error:', error);
    res.status(500).json({ error: 'Failed to get active team' });
  }
};
