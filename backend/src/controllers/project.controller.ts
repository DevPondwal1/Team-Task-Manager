import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import prisma from '../config/prisma';
import { successResponse, errorResponse } from '../utils/response';
import { Role } from '@prisma/client';

const createProjectSchema = z.object({
  name: z.string().min(2, 'Project name must be at least 2 characters').max(100),
  description: z.string().max(500).optional(),
});

const updateProjectSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  description: z.string().max(500).optional(),
});

const addMemberSchema = z.object({
  email: z.string().email('Invalid email address'),
  role: z.enum(['ADMIN', 'MEMBER']).default('MEMBER'),
});

export const getAllProjects = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;

    const projects = await prisma.project.findMany({
      where: {
        OR: [
          { ownerId: userId },
          { members: { some: { userId } } },
        ],
      },
      include: {
        owner: { select: { id: true, name: true, email: true } },
        _count: { select: { members: true, tasks: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return successResponse(res, projects, 'Projects fetched successfully');
  } catch (error) {
    next(error);
  }
};

export const createProject = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, description } = createProjectSchema.parse(req.body);
    const userId = req.user!.id;

    const project = await prisma.project.create({
      data: {
        name,
        description,
        ownerId: userId,
        members: {
          create: { userId, role: Role.ADMIN },
        },
      },
      include: {
        owner: { select: { id: true, name: true, email: true } },
        _count: { select: { members: true, tasks: true } },
      },
    });

    return successResponse(res, project, 'Project created successfully', 201);
  } catch (error) {
    next(error);
  }
};

export const getProject = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { projectId } = req.params as Record<string, string>;

    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: {
        owner: { select: { id: true, name: true, email: true } },
        members: {
          include: { user: { select: { id: true, name: true, email: true } } },
        },
        _count: { select: { tasks: true } },
      },
    });

    if (!project) return errorResponse(res, 'Project not found', 404);

    return successResponse(res, project, 'Project fetched successfully');
  } catch (error) {
    next(error);
  }
};

export const updateProject = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { projectId } = req.params as Record<string, string>;
    const data = updateProjectSchema.parse(req.body);

    const project = await prisma.project.update({
      where: { id: projectId },
      data,
      include: {
        owner: { select: { id: true, name: true, email: true } },
        _count: { select: { members: true, tasks: true } },
      },
    });

    return successResponse(res, project, 'Project updated successfully');
  } catch (error) {
    next(error);
  }
};

export const deleteProject = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { projectId } = req.params as Record<string, string>;
    const userId = req.user!.id;

    const project = await prisma.project.findUnique({ where: { id: projectId } });
    if (!project) return errorResponse(res, 'Project not found', 404);
    if (project.ownerId !== userId) {
      return errorResponse(res, 'Only the project owner can delete this project', 403);
    }

    await prisma.project.delete({ where: { id: projectId } });
    return successResponse(res, null, 'Project deleted successfully');
  } catch (error) {
    next(error);
  }
};

export const addMember = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { projectId } = req.params as Record<string, string>;
    const { email, role } = addMemberSchema.parse(req.body);

    const userToAdd = await prisma.user.findUnique({ where: { email } });
    if (!userToAdd) return errorResponse(res, 'User with this email not found', 404);

    const existingMember = await prisma.projectMember.findUnique({
      where: { projectId_userId: { projectId, userId: userToAdd.id } },
    });

    if (existingMember) return errorResponse(res, 'User is already a member of this project', 409);

    const member = await prisma.projectMember.create({
      data: { projectId, userId: userToAdd.id, role: role as Role },
      include: { user: { select: { id: true, name: true, email: true } } },
    });

    return successResponse(res, member, 'Member added successfully', 201);
  } catch (error) {
    next(error);
  }
};

export const removeMember = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { projectId, memberId } = req.params as Record<string, string>;
    const userId = req.user!.id;

    const project = await prisma.project.findUnique({ where: { id: projectId } });
    if (!project) return errorResponse(res, 'Project not found', 404);

    if (memberId === project.ownerId) {
      return errorResponse(res, 'Cannot remove the project owner', 400);
    }

    const member = await prisma.projectMember.findUnique({
      where: { projectId_userId: { projectId, userId: memberId } },
    });

    if (!member) return errorResponse(res, 'Member not found', 404);

    await prisma.projectMember.delete({
      where: { projectId_userId: { projectId, userId: memberId } },
    });

    return successResponse(res, null, 'Member removed successfully');
  } catch (error) {
    next(error);
  }
};

export const getMembers = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { projectId } = req.params as Record<string, string>;

    const members = await prisma.projectMember.findMany({
      where: { projectId },
      include: { user: { select: { id: true, name: true, email: true } } },
      orderBy: { joinedAt: 'asc' },
    });

    return successResponse(res, members, 'Members fetched successfully');
  } catch (error) {
    next(error);
  }
};
