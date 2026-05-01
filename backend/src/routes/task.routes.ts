import { Router } from 'express';
import { requireProjectMember, requireProjectAdmin } from '../middleware/rbac';
import {
  getTasks,
  createTask,
  getTask,
  updateTask,
  updateTaskStatus,
  deleteTask,
} from '../controllers/task.controller';

// mergeParams: true is needed because this router is mounted inside project.routes.ts
const router = Router({ mergeParams: true });

router.use(requireProjectMember);

router.get('/', getTasks);
router.post('/', requireProjectAdmin, createTask);
router.get('/:taskId', getTask);
router.put('/:taskId', requireProjectAdmin, updateTask);
router.patch('/:taskId/status', updateTaskStatus); // Special logic in controller handles who can do this
router.delete('/:taskId', requireProjectAdmin, deleteTask);

export default router;
