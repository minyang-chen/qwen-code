import { pool } from '../config/database';
import { v4 as uuidv4 } from 'uuid';
import { nfsService } from './nfsService';

interface CreateTeamInput {
  team_name: string;
  specialization?: string;
  description?: string;
  created_by: string;
}

export const teamService = {
  async findByName(teamName: string) {
    const result = await pool.query(
      'SELECT id FROM teams WHERE team_name = $1',
      [teamName]
    );
    return result.rows[0];
  },
  
  async findById(teamId: string) {
    const result = await pool.query(
      'SELECT id, team_name, nfs_workspace_path, created_by FROM teams WHERE id = $1 AND is_active = true',
      [teamId]
    );
    return result.rows[0];
  },
  
  async createTeam(input: CreateTeamInput) {
    const teamId = uuidv4();
    const workspacePath = `/shared/${teamId}`;
    
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      
      const teamResult = await client.query(
        `INSERT INTO teams (id, team_name, specialization, description, nfs_workspace_path, created_by)
         VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING id, team_name, nfs_workspace_path, created_at`,
        [teamId, input.team_name, input.specialization, input.description, workspacePath, input.created_by]
      );
      
      await client.query(
        `INSERT INTO team_members (team_id, user_id, role)
         VALUES ($1, $2, 'admin')`,
        [teamId, input.created_by]
      );
      
      await client.query('COMMIT');
      
      await nfsService.createTeamWorkspace(teamId);
      
      return teamResult.rows[0];
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  },
  
  async getUserTeams(userId: string) {
    const result = await pool.query(
      `SELECT t.id, t.team_name, t.specialization, tm.role
       FROM teams t
       JOIN team_members tm ON t.id = tm.team_id
       WHERE tm.user_id = $1 AND t.is_active = true`,
      [userId]
    );
    return result.rows;
  },
  
  async isMember(teamId: string, userId: string): Promise<boolean> {
    const result = await pool.query(
      'SELECT id FROM team_members WHERE team_id = $1 AND user_id = $2',
      [teamId, userId]
    );
    return result.rows.length > 0;
  },
  
  async addMember(teamId: string, userId: string) {
    await pool.query(
      `INSERT INTO team_members (team_id, user_id, role)
       VALUES ($1, $2, 'member')`,
      [teamId, userId]
    );
  },

  async searchTeams(query: string) {
    const result = await pool.query(
      `SELECT id, team_name, specialization, description, created_at
       FROM teams
       WHERE is_active = true
       AND (team_name ILIKE $1 OR specialization ILIKE $1 OR description ILIKE $1)
       ORDER BY created_at DESC
       LIMIT 50`,
      [`%${query}%`]
    );
    return result.rows;
  },

  async deleteTeam(teamId: string) {
    await pool.query(
      'UPDATE teams SET is_active = false WHERE id = $1',
      [teamId]
    );
  }
};
