import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { requireProjectAdmin, requireProjectMember } from '../middleware/rbac';
import {
  getAllProjects,
  createProject,
  getProject,
  updateProject,
  deleteProject,
  addMember,
  removeMember,
  getMembers,
} from '../controllers/project.controller';
import taskRoutes from './task.routes';

const router = Router();

router.use(authenticate);

// Project Routes
router.get('/', getAllProjects);
router.post('/', createProject); // Any user can create a project (becomes admin)

router.get('/:projectId', requireProjectMember, getProject);
router.put('/:projectId', requireProjectAdmin, updateProject);
router.delete('/:projectId', requireProjectAdmin, deleteProject);

// Project Member Routes
router.get('/:projectId/members', requireProjectMember, getMembers);
router.post('/:projectId/members', requireProjectAdmin, addMember);
router.delete('/:projectId/members/:memberId', requireProjectAdmin, removeMember);

// Nest task routes under projects
router.use('/:projectId/tasks', taskRoutes);

export default router;
