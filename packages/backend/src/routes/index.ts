import { Router } from 'express';
import { signup, login } from '../controllers/authController';
import { createTeam, joinTeam, teamSignin, searchTeams, getUserTeams, deleteTeam, getTeamMembers, addTeamMember, removeTeamMember, updateMemberStatus } from '../controllers/teamController';
import { listFiles, uploadFile, downloadFile, deleteFile, searchFiles } from '../controllers/fileController';
import { getProfile, updateProfile, regenerateApiKey } from '../controllers/userController';
import { getTodos, createTodo, updateTodo, deleteTodo } from '../controllers/todoController';
import { authenticate } from '../middleware/authMiddleware';

const router = Router();

// Auth routes
router.post('/api/auth/signup', signup);
router.post('/api/auth/login', login);

// User routes
router.get('/api/user/me', authenticate, (req, res) => {
  res.json({ userId: req.user?.id });
});
router.get('/api/user/profile', authenticate, getProfile);
router.put('/api/user/profile', authenticate, updateProfile);
router.post('/api/user/regenerate-api-key', authenticate, regenerateApiKey);

// Todo routes
router.get('/api/todos', authenticate, getTodos);
router.post('/api/todos', authenticate, createTodo);
router.put('/api/todos/:id', authenticate, updateTodo);
router.delete('/api/todos/:id', authenticate, deleteTodo);

// Team routes
router.post('/api/teams/create', authenticate, createTeam);
router.post('/api/teams/join', authenticate, joinTeam);
router.get('/api/teams/search', authenticate, searchTeams);
router.get('/api/teams/my-teams', authenticate, getUserTeams);
router.delete('/api/teams/delete', authenticate, deleteTeam);
router.post('/api/teams/signin', teamSignin);

// Team member routes
router.get('/api/teams/:teamId/members', authenticate, getTeamMembers);
router.post('/api/teams/:teamId/members', authenticate, addTeamMember);
router.delete('/api/teams/:teamId/members/:memberId', authenticate, removeTeamMember);
router.patch('/api/teams/:teamId/members/:memberId/status', authenticate, updateMemberStatus);

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
