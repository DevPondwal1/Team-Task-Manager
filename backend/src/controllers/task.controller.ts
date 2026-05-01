import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import prisma from '../config/prisma';
import { successResponse, errorResponse } from '../utils/response';
import { TaskStatus, Priority } from '@prisma/client';

const createTaskSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200),
  description: z.string().optional(),
  status: z.nativeEnum(TaskStatus).optional(),
  priority: z.nativeEnum(Priority).optional(),
  dueDate: z.string().datetime().optional().nullable(),
  assigneeId: z.string().optional().nullable(),
});

const updateTaskSchema = createTaskSchema.partial();

const updateStatusSchema = z.object({
  status: z.nativeEnum(TaskStatus),
});

export const getTasks = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { projectId } = req.params as Record<string, string>;

    const tasks = await prisma.task.findMany({
      where: { projectId },
      include: {
        assignee: { select: { id: true, name: true, email: true } },
        createdBy: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return successResponse(res, tasks, 'Tasks fetched successfully');
  } catch (error) {
    next(error);
  }
};

export const createTask = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { projectId } = req.params as Record<string, string>;
    const { title, description, status, priority, dueDate, assigneeId } = createTaskSchema.parse(req.body);
    const userId = req.user!.id;

    if (assigneeId) {
      const member = await prisma.projectMember.findUnique({
        where: { projectId_userId: { projectId, userId: assigneeId } },
      });
      if (!member && req.project?.ownerId !== assigneeId) {
        return errorResponse(res, 'Assignee must be a member of the project', 400);
      }
    }

    const task = await prisma.task.create({
      data: {
        title,
        description,
        status: status || TaskStatus.TODO,
        priority: priority || Priority.MEDIUM,
        dueDate: dueDate ? new Date(dueDate) : null,
        projectId,
        assigneeId,
        createdById: userId,
      },
      include: {
        assignee: { select: { id: true, name: true, email: true } },
      },
    });

    return successResponse(res, task, 'Task created successfully', 201);
  } catch (error) {
    next(error);
  }
};

export const getTask = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { taskId } = req.params as Record<string, string>;

    const task = await prisma.task.findUnique({
      where: { id: taskId },
      include: {
        assignee: { select: { id: true, name: true, email: true } },
        createdBy: { select: { id: true, name: true } },
        project: { select: { id: true, name: true } },
      },
    });

    if (!task) return errorResponse(res, 'Task not found', 404);

    return successResponse(res, task, 'Task fetched successfully');
  } catch (error) {
    next(error);
  }
};

export const updateTask = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { projectId, taskId } = req.params as Record<string, string>;
    const data = updateTaskSchema.parse(req.body);

    const task = await prisma.task.findUnique({ where: { id: taskId } });
    if (!task) return errorResponse(res, 'Task not found', 404);

    if (data.assigneeId) {
      const member = await prisma.projectMember.findUnique({
        where: { projectId_userId: { projectId, userId: data.assigneeId } },
      });
      if (!member && req.project?.ownerId !== data.assigneeId) {
        return errorResponse(res, 'Assignee must be a member of the project', 400);
      }
    }

    const updatedTask = await prisma.task.update({
      where: { id: taskId },
      data: {
        ...data,
        dueDate: data.dueDate !== undefined ? (data.dueDate ? new Date(data.dueDate) : null) : undefined,
      },
      include: {
        assignee: { select: { id: true, name: true, email: true } },
      },
    });

    return successResponse(res, updatedTask, 'Task updated successfully');
  } catch (error) {
    next(error);
  }
};

export const updateTaskStatus = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { taskId } = req.params as Record<string, string>;
    const { status } = updateStatusSchema.parse(req.body);
    const userId = req.user!.id;

    const task = await prisma.task.findUnique({ where: { id: taskId } });
    if (!task) return errorResponse(res, 'Task not found', 404);

    const isAdmin = req.project?.ownerId === userId || req.projectMember?.role === 'ADMIN';

    if (!isAdmin && task.assigneeId !== userId) {
      return errorResponse(res, 'Only admins or the task assignee can update the status', 403);
    }

    const updatedTask = await prisma.task.update({
      where: { id: taskId },
      data: { status },
      include: {
        assignee: { select: { id: true, name: true, email: true } },
      },
    });

    return successResponse(res, updatedTask, 'Task status updated successfully');
  } catch (error) {
    next(error);
  }
};

export const deleteTask = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { taskId } = req.params as Record<string, string>;

    const task = await prisma.task.findUnique({ where: { id: taskId } });
    if (!task) return errorResponse(res, 'Task not found', 404);

    await prisma.task.delete({ where: { id: taskId } });

    return successResponse(res, null, 'Task deleted successfully');
  } catch (error) {
    next(error);
  }
};
