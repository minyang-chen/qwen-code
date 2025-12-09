import type { RequestHandler } from 'express';
import { Router } from 'express';
import { signup, login } from '../controllers/authController';
import {
  createTeam,
  joinTeam,
  teamSignin,
  searchTeams,
  getUserTeams,
  deleteTeam,
  updateTeam,
  getTeamMembers,
  addTeamMember,
  removeTeamMember,
  updateMemberStatus,
} from '../controllers/teamController';
import {
  listTeams,
  selectTeam,
  getActiveTeam,
} from '../controllers/teamSelectionController';
import {
  listFiles,
  uploadFile,
  downloadFile,
  deleteFile,
  searchFiles,
} from '../controllers/fileController';
import {
  getProfile,
  updateProfile,
  regenerateApiKey,
} from '../controllers/userController';
import {
  getTodos,
  createTodo,
  updateTodo,
  deleteTodo,
} from '../controllers/todoController';
import {
  sendBroadcast,
  getNotifications,
  replyToNotification,
} from '../controllers/notificationController';
import { projectController } from '../controllers/projectController';
import { authenticate } from '../middleware/authMiddleware';
import { OPENAI_API_KEY, OPENAI_BASE_URL, OPENAI_MODEL } from '../config/env';

const router = Router();

// Auth routes
router.post('/api/auth/signup', signup);
router.post('/api/auth/login', login);

// Team selection routes
router.get('/api/team/list', authenticate, listTeams);
router.post('/api/team/select', authenticate, selectTeam);
router.get('/api/team/active', authenticate, getActiveTeam);

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
router.put('/api/teams/update', authenticate, updateTeam);
router.post('/api/teams/signin', teamSignin);

// Team member routes
router.get('/api/teams/:teamId/members', authenticate, getTeamMembers);
router.post('/api/teams/:teamId/members', authenticate, addTeamMember);
router.delete(
  '/api/teams/:teamId/members/:memberId',
  authenticate,
  removeTeamMember,
);
router.patch(
  '/api/teams/:teamId/members/:memberId/status',
  authenticate,
  updateMemberStatus,
);

// Notification routes
router.post('/api/teams/:teamId/broadcast', authenticate, sendBroadcast);
router.get('/api/teams/:teamId/notifications', authenticate, getNotifications);
router.post(
  '/api/teams/:teamId/notifications/:notificationId/reply',
  authenticate,
  replyToNotification,
);

// OpenAI config for task agent
router.get('/api/team/openai-config', authenticate, (req, res) => {
  res.json({
    apiKey: OPENAI_API_KEY,
    baseUrl: OPENAI_BASE_URL,
    model: OPENAI_MODEL,
  });
});

// File routes
router.get('/api/files/list', authenticate, listFiles);
router.post(
  '/api/files/upload',
  authenticate,
  ...(uploadFile as RequestHandler[]),
);
router.get('/api/files/download', authenticate, downloadFile);
router.delete('/api/files/delete', authenticate, deleteFile);
router.post('/api/files/search', authenticate, searchFiles);

// Project management routes
router.post(
  '/api/teams/:teamId/projects',
  authenticate,
  projectController.project.create,
);
router.get(
  '/api/teams/:teamId/projects',
  authenticate,
  projectController.project.list,
);
router.get(
  '/api/teams/:teamId/projects/:projectId',
  authenticate,
  projectController.project.get,
);
router.put(
  '/api/teams/:teamId/projects/:projectId',
  authenticate,
  projectController.project.update,
);

// Project sections routes
router.post(
  '/api/teams/:teamId/sections',
  authenticate,
  projectController.section.create,
);
router.get(
  '/api/teams/:teamId/projects/:projectId/sections',
  authenticate,
  projectController.section.list,
);
router.get(
  '/api/teams/:teamId/sections/:sectionId',
  authenticate,
  projectController.section.get,
);
router.put(
  '/api/teams/:teamId/sections/:sectionId',
  authenticate,
  projectController.section.update,
);

// Project stats routes
router.post(
  '/api/teams/:teamId/stats',
  authenticate,
  projectController.stats.create,
);
router.get(
  '/api/teams/:teamId/projects/:projectId/stats',
  authenticate,
  projectController.stats.get,
);
router.put(
  '/api/teams/:teamId/projects/:projectId/stats',
  authenticate,
  projectController.stats.update,
);

router.get(
  '/api/teams/:teamId/requirements',
  authenticate,
  projectController.requirements.get,
);
router.post(
  '/api/teams/:teamId/requirements',
  authenticate,
  projectController.requirements.create,
);
router.put(
  '/api/teams/:teamId/requirements/:id',
  authenticate,
  projectController.requirements.update,
);
router.delete(
  '/api/teams/:teamId/requirements/:id',
  authenticate,
  projectController.requirements.delete,
);

router.get(
  '/api/teams/:teamId/architecture',
  authenticate,
  projectController.architecture.get,
);
router.post(
  '/api/teams/:teamId/architecture',
  authenticate,
  projectController.architecture.create,
);
router.put(
  '/api/teams/:teamId/architecture/:id',
  authenticate,
  projectController.architecture.update,
);
router.delete(
  '/api/teams/:teamId/architecture/:id',
  authenticate,
  projectController.architecture.delete,
);

router.get(
  '/api/teams/:teamId/design',
  authenticate,
  projectController.design.get,
);
router.post(
  '/api/teams/:teamId/design',
  authenticate,
  projectController.design.create,
);
router.put(
  '/api/teams/:teamId/design/:id',
  authenticate,
  projectController.design.update,
);
router.delete(
  '/api/teams/:teamId/design/:id',
  authenticate,
  projectController.design.delete,
);

router.get(
  '/api/teams/:teamId/implementation',
  authenticate,
  projectController.implementation.get,
);
router.post(
  '/api/teams/:teamId/implementation',
  authenticate,
  projectController.implementation.create,
);
router.put(
  '/api/teams/:teamId/implementation/:id',
  authenticate,
  projectController.implementation.update,
);
router.delete(
  '/api/teams/:teamId/implementation/:id',
  authenticate,
  projectController.implementation.delete,
);

router.get(
  '/api/teams/:teamId/tasks',
  authenticate,
  projectController.tasks.get,
);
router.post(
  '/api/teams/:teamId/tasks',
  authenticate,
  projectController.tasks.create,
);
router.put(
  '/api/teams/:teamId/tasks/:id',
  authenticate,
  projectController.tasks.update,
);
router.delete(
  '/api/teams/:teamId/tasks/:id',
  authenticate,
  projectController.tasks.delete,
);

router.get('/api/teams/:teamId/code', authenticate, projectController.code.get);
router.post(
  '/api/teams/:teamId/code',
  authenticate,
  projectController.code.create,
);
router.put(
  '/api/teams/:teamId/code/:id',
  authenticate,
  projectController.code.update,
);
router.delete(
  '/api/teams/:teamId/code/:id',
  authenticate,
  projectController.code.delete,
);

router.get(
  '/api/teams/:teamId/issues',
  authenticate,
  projectController.issues.get,
);
router.post(
  '/api/teams/:teamId/issues',
  authenticate,
  projectController.issues.create,
);
router.put(
  '/api/teams/:teamId/issues/:id',
  authenticate,
  projectController.issues.update,
);
router.delete(
  '/api/teams/:teamId/issues/:id',
  authenticate,
  projectController.issues.delete,
);

router.get(
  '/api/teams/:teamId/meetings',
  authenticate,
  projectController.meetings.get,
);
router.post(
  '/api/teams/:teamId/meetings',
  authenticate,
  projectController.meetings.create,
);
router.put(
  '/api/teams/:teamId/meetings/:id',
  authenticate,
  projectController.meetings.update,
);
router.delete(
  '/api/teams/:teamId/meetings/:id',
  authenticate,
  projectController.meetings.delete,
);

export default router;
