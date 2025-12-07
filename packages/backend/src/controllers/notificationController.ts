import { Request, Response } from 'express';
import { notificationService } from '../services/notificationService';
import { teamService } from '../services/teamService';

export const sendBroadcast = async (req: Request, res: Response) => {
  try {
    const { teamId } = req.params;
    const { message, message_type } = req.body;
    const userId = (req as any).user.id;
    const username = (req as any).user.username;
    
    const isAdmin = await teamService.isAdmin(teamId, userId);
    if (!isAdmin) {
      return res.status(403).json({ error: { code: 'FORBIDDEN', message: 'Only admins can send broadcasts' } });
    }
    
    const notification = await notificationService.sendBroadcast(teamId, message, username, message_type);
    res.json({ notification, message: 'Broadcast sent successfully' });
  } catch (error) {
    console.error('Send broadcast error:', error);
    res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: 'Failed to send broadcast' } });
  }
};

export const getNotifications = async (req: Request, res: Response) => {
  try {
    const { teamId } = req.params;
    const userId = (req as any).user.id;
    
    const isMember = await teamService.isMember(teamId, userId);
    if (!isMember) {
      return res.status(403).json({ error: { code: 'FORBIDDEN', message: 'Not a team member' } });
    }
    
    const notifications = await notificationService.getNotifications(teamId);
    res.json({ notifications });
  } catch (error) {
    console.error('Get notifications error:', error);
    res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: 'Failed to get notifications' } });
  }
};

export const replyToNotification = async (req: Request, res: Response) => {
  try {
    const { teamId, notificationId } = req.params;
    const { message } = req.body;
    const userId = (req as any).user.id;
    const username = (req as any).user.username;
    
    const isMember = await teamService.isMember(teamId, userId);
    if (!isMember) {
      return res.status(403).json({ error: { code: 'FORBIDDEN', message: 'Not a team member' } });
    }
    
    const reply = await notificationService.addReply(teamId, notificationId, message, username);
    res.json({ reply, message: 'Reply added successfully' });
  } catch (error) {
    console.error('Reply to notification error:', error);
    res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: 'Failed to add reply' } });
  }
};
