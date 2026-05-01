import { Request, Response, NextFunction } from 'express';
import { errorResponse } from '../utils/response';
import prisma from '../config/prisma';

export const requireProjectAdmin = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { projectId } = req.params as Record<string, string>;
    const userId = req.user?.id;

    if (!userId) return errorResponse(res, 'Unauthorized', 401);

    const member = await prisma.projectMember.findUnique({
      where: { projectId_userId: { projectId, userId } },
    });

    const project = await prisma.project.findUnique({ where: { id: projectId } });

    if (!project) {
      return errorResponse(res, 'Project not found', 404);
    }

    if (project.ownerId === userId || (member && member.role === 'ADMIN')) {
      req.project = project;
      req.projectMember = member;
      return next();
    }

    return errorResponse(res, 'Admin access required for this action', 403);
  } catch (error) {
    next(error);
  }
};

export const requireProjectMember = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { projectId } = req.params as Record<string, string>;
    const userId = req.user?.id;

    if (!userId) return errorResponse(res, 'Unauthorized', 401);

    const project = await prisma.project.findUnique({ where: { id: projectId } });

    if (!project) {
      return errorResponse(res, 'Project not found', 404);
    }

    if (project.ownerId === userId) {
      req.project = project;
      req.projectMember = null;
      return next();
    }

    const member = await prisma.projectMember.findUnique({
      where: { projectId_userId: { projectId, userId } },
    });

    if (!member) {
      return errorResponse(res, 'You are not a member of this project', 403);
    }

    req.project = project;
    req.projectMember = member;
    next();
  } catch (error) {
    next(error);
  }
};
