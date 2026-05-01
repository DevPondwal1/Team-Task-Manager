import { Request, Response, NextFunction } from 'express';
import prisma from '../config/prisma';
import { successResponse } from '../utils/response';

export const getDashboardStats = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;

    // Get all projects the user has access to
    const projects = await prisma.project.findMany({
      where: {
        OR: [
          { ownerId: userId },
          { members: { some: { userId } } },
        ],
      },
      select: { id: true },
    });

    const projectIds = projects.map(p => p.id);

    // Get all tasks for these projects
    const totalTasks = await prisma.task.count({
      where: { projectId: { in: projectIds } },
    });

    const tasksByStatus = await prisma.task.groupBy({
      by: ['status'],
      where: { projectId: { in: projectIds } },
      _count: { status: true },
    });

    const overdueTasks = await prisma.task.count({
      where: {
        projectId: { in: projectIds },
        status: { not: 'DONE' },
        dueDate: { lt: new Date() },
      },
    });

    const myTasksCount = await prisma.task.count({
      where: { assigneeId: userId, status: { not: 'DONE' } },
    });

    const recentActivity = await prisma.task.findMany({
      where: { projectId: { in: projectIds } },
      orderBy: { updatedAt: 'desc' },
      take: 5,
      include: {
        project: { select: { name: true } },
        assignee: { select: { name: true } },
      },
    });

    const statusMap = {
      TODO: 0,
      IN_PROGRESS: 0,
      DONE: 0,
    };

    tasksByStatus.forEach((stat) => {
      statusMap[stat.status] = stat._count.status;
    });

    return successResponse(res, {
      totalTasks,
      statusCounts: statusMap,
      overdueTasks,
      myPendingTasks: myTasksCount,
      recentActivity,
    }, 'Dashboard stats fetched successfully');
  } catch (error) {
    next(error);
  }
};
