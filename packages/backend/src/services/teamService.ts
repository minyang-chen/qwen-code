import { pool } from '../config/database';
import { v4 as uuidv4 } from 'uuid';
import { nfsService } from './nfsService';
import { mongoService } from './mongoService';

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
      [teamName],
    );
    return result.rows[0];
  },

  async findById(teamId: string) {
    const result = await pool.query(
      'SELECT id, team_name, nfs_workspace_path, created_by FROM teams WHERE id = $1 AND is_active = true',
      [teamId],
    );
    return result.rows[0];
  },

  async createTeam(input: CreateTeamInput) {
    const teamId = uuidv4();
    const workspacePath = `/shared/${teamId}`;
    const mongoDbName = `team_${teamId.replace(/-/g, '_')}`;

    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      const teamResult = await client.query(
        `INSERT INTO teams (id, team_name, specialization, description, nfs_workspace_path, mongo_database_name, created_by)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         RETURNING id, team_name, nfs_workspace_path, mongo_database_name, created_at`,
        [
          teamId,
          input.team_name,
          input.specialization,
          input.description,
          workspacePath,
          mongoDbName,
          input.created_by,
        ],
      );

      await client.query(
        `INSERT INTO team_members (team_id, user_id, role)
         VALUES ($1, $2, 'admin')`,
        [teamId, input.created_by],
      );

      await client.query('COMMIT');

      await nfsService.createTeamWorkspace(teamId);
      await mongoService.createTeamDatabase(teamId);

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
      [userId],
    );
    return result.rows;
  },

  async getAllTeams() {
    const result = await pool.query(
      `SELECT t.id, t.team_name, t.specialization, 
       (SELECT COUNT(*) FROM team_members WHERE team_id = t.id) as member_count
       FROM teams t
       WHERE t.is_active = true
       ORDER BY t.created_at DESC`,
      [],
    );
    return result.rows;
  },

  async isMember(teamId: string, userId: string): Promise<boolean> {
    const result = await pool.query(
      'SELECT id FROM team_members WHERE team_id = $1 AND user_id = $2',
      [teamId, userId],
    );
    return result.rows.length > 0;
  },

  async addMember(teamId: string, userId: string) {
    await pool.query(
      `INSERT INTO team_members (team_id, user_id, role)
       VALUES ($1, $2, 'member')`,
      [teamId, userId],
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
      [`%${query}%`],
    );
    return result.rows;
  },

  async deleteTeam(teamId: string) {
    await pool.query('UPDATE teams SET is_active = false WHERE id = $1', [
      teamId,
    ]);
  },

  async updateTeam(
    teamId: string,
    updates: {
      team_name?: string;
      specialization?: string;
      description?: string;
    },
  ) {
    const fields = [];
    const values = [];
    let paramCount = 1;

    if (updates.team_name !== undefined) {
      fields.push(`team_name = $${paramCount++}`);
      values.push(updates.team_name);
    }
    if (updates.specialization !== undefined) {
      fields.push(`specialization = $${paramCount++}`);
      values.push(updates.specialization);
    }
    if (updates.description !== undefined) {
      fields.push(`description = $${paramCount++}`);
      values.push(updates.description);
    }

    if (fields.length === 0) return;

    values.push(teamId);
    await pool.query(
      `UPDATE teams SET ${fields.join(', ')} WHERE id = $${paramCount}`,
      values,
    );
  },

  async getTeamMembers(teamId: string) {
    const result = await pool.query(
      `SELECT u.id, u.username, u.email, tm.role, tm.status, tm.joined_at
       FROM team_members tm
       JOIN users u ON tm.user_id = u.id
       WHERE tm.team_id = $1
       ORDER BY tm.joined_at ASC`,
      [teamId],
    );
    return result.rows;
  },

  async addMemberByEmail(teamId: string, email: string) {
    const userResult = await pool.query(
      'SELECT id FROM users WHERE email = $1',
      [email],
    );

    if (userResult.rows.length === 0) {
      throw new Error('User not found');
    }

    const userId = userResult.rows[0].id;

    const existingMember = await pool.query(
      'SELECT id FROM team_members WHERE team_id = $1 AND user_id = $2',
      [teamId, userId],
    );

    if (existingMember.rows.length > 0) {
      throw new Error('User is already a member');
    }

    await pool.query(
      `INSERT INTO team_members (team_id, user_id, role, status)
       VALUES ($1, $2, 'member', 'active')`,
      [teamId, userId],
    );
  },

  async removeMember(teamId: string, memberId: string) {
    await pool.query(
      'DELETE FROM team_members WHERE team_id = $1 AND user_id = $2',
      [teamId, memberId],
    );
  },

  async updateMemberStatus(teamId: string, memberId: string, status: string) {
    await pool.query(
      'UPDATE team_members SET status = $1 WHERE team_id = $2 AND user_id = $3',
      [status, teamId, memberId],
    );
  },

  async isAdmin(teamId: string, userId: string): Promise<boolean> {
    const result = await pool.query(
      'SELECT role FROM team_members WHERE team_id = $1 AND user_id = $2',
      [teamId, userId],
    );
    return result.rows.length > 0 && result.rows[0].role === 'admin';
  },
};
