import { User, Project, ProjectMember } from '@prisma/client';

declare global {
  namespace Express {
    interface Request {
      user?: Omit<User, 'password'>;
      project?: Project;
      projectMember?: ProjectMember | null;
    }
  }
}
