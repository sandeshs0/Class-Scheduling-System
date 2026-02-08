import { Request, Response, NextFunction } from 'express';
import { errorResponse } from '../utils/apiResponse';

interface CustomError extends Error {
  statusCode?: number;
  errors?: any;
}

const errorHandler = (
  err: CustomError,
  req: Request,
  res: Response,
  next: NextFunction
): Response => {
    
  let statusCode = err.statusCode || 500;
  let title = 'Error';
  let message = err.message || 'Something went wrong';
  let errors: { field: string; message: string }[] = [];

  if (err.name === 'ValidationError' && err.errors) {
    statusCode = 400;
    title = 'Validation Error';
    message = 'Invalid input data';
    errors = Object.keys(err.errors).map((key) => ({
      field: key,
      message: (err.errors as any)[key].message,
    }));
  }

  if (err.name === 'CastError') {
    statusCode = 400;
    title = 'Invalid ID';
    message = 'Resource not found with the provided ID';
  }

  if ((err as any).code === 11000) {
    statusCode = 400;
    title = 'Duplicate Error';
    message = 'A resource with this value already exists';
  }

  return errorResponse(res, statusCode, title, message, errors.length > 0 ? errors : undefined);
};

export default errorHandler;