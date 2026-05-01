import { Response } from 'express';

export const successResponse = (res: Response, data: any, message = 'Success', statusCode = 200) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
  });
};

export const errorResponse = (res: Response, message = 'Something went wrong', statusCode = 500, errors: any = null) => {
  const response: any = { success: false, message };
  if (errors) response.errors = errors;
  return res.status(statusCode).json(response);
};
