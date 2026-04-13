import type { ErrorRequestHandler, RequestHandler } from 'express';
import AppError from '../utils/AppError..js';

export const notFoundHandler: RequestHandler = (req, res, next) => {
  next(new AppError(`Route ${req.originalUrl} not found`, 404));
};

export const errorHandler: ErrorRequestHandler = (error, req, res, next) => {
  void req;
  void next;

  let err = error;

  if (!(err instanceof AppError)) {
    const message = err instanceof Error ? err.message : 'Internal server error';
    const statusCode = typeof (err as { statusCode?: unknown })?.statusCode === 'number'
      ? (err as { statusCode: number }).statusCode
      : 500;
    const errors = (err as { errors?: unknown })?.errors ?? null;

    err = new AppError(message, statusCode, errors);
  }

  res.status(err.statusCode).json({
    success: false,
    message: err.message,
    ...(err.errors ? { errors: err.errors } : {}),
    ...(process.env.NODE_ENV === 'development' ? { stack: err.stack } : {}),
  });
};
