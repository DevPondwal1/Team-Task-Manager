import { Request, Response, NextFunction } from 'express';
import { errorResponse } from '../utils/response';

export const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
  console.error('[Error]', err.message, err.stack);

  if (err.code === 'P2002') {
    return errorResponse(res, 'A record with this value already exists', 409);
  }
  if (err.code === 'P2025') {
    return errorResponse(res, 'Record not found', 404);
  }

  if (err.name === 'ZodError') {
    const issues = err.issues || err.errors || [];
    const errors = issues.map((e: any) => ({ field: e.path?.join('.') || 'unknown', message: e.message }));
    return errorResponse(res, 'Validation failed', 422, errors);
  }

  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal server error';
  return errorResponse(res, message, statusCode);
};
