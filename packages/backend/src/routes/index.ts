import { Router } from 'express';
import { signup, login } from '../controllers/authController';
import { createTeam, joinTeam, teamSignin, searchTeams, getUserTeams, deleteTeam } from '../controllers/teamController';
import { listFiles, uploadFile, downloadFile, deleteFile, searchFiles } from '../controllers/fileController';
import { authenticate } from '../middleware/authMiddleware';

const router = Router();

// Auth routes
router.post('/api/auth/signup', signup);
router.post('/api/auth/login', login);

// User routes
router.get('/api/user/me', authenticate, (req, res) => {
  res.json({ userId: req.user?.id });
});

// Team routes
router.post('/api/teams/create', authenticate, createTeam);
router.post('/api/teams/join', authenticate, joinTeam);
router.get('/api/teams/search', authenticate, searchTeams);
router.get('/api/teams/my-teams', authenticate, getUserTeams);
router.delete('/api/teams/delete', authenticate, deleteTeam);
router.post('/api/teams/signin', teamSignin);

// OpenAI config for task agent
router.get('/api/team/openai-config', authenticate, (req, res) => {
  res.json({
    apiKey: process.env.OPENAI_API_KEY,
    baseUrl: process.env.OPENAI_BASE_URL,
    model: process.env.OPENAI_MODEL,
  });
});

// File routes
router.get('/api/files/list', authenticate, listFiles);
router.post('/api/files/upload', authenticate, ...uploadFile);
router.get('/api/files/download', authenticate, downloadFile);
router.delete('/api/files/delete', authenticate, deleteFile);
router.post('/api/files/search', authenticate, searchFiles);

export default router;
