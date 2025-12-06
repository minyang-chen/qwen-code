import { Request, Response } from 'express';
import { userService } from '../services/userService';

export const getProfile = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const user = await userService.findById(userId);
    
    if (!user) {
      return res.status(404).json({ error: { code: 'USER_NOT_FOUND', message: 'User not found' } });
    }

    const apiKey = await userService.getApiKey(userId);
    
    res.json({
      username: user.username,
      email: user.email,
      full_name: user.full_name,
      phone: user.phone,
      api_key: apiKey
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: 'Failed to get profile' } });
  }
};

export const updateProfile = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { email, full_name, phone } = req.body;
    
    await userService.updateProfile(userId, { email, full_name, phone });
    
    res.json({ message: 'Profile updated successfully' });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: 'Failed to update profile' } });
  }
};

export const regenerateApiKey = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const newApiKey = await userService.regenerateApiKey(userId);
    
    res.json({ api_key: newApiKey, message: 'API key regenerated successfully' });
  } catch (error) {
    console.error('Regenerate API key error:', error);
    res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: 'Failed to regenerate API key' } });
  }
};
