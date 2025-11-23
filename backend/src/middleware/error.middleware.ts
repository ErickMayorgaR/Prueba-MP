import { Request, Response, NextFunction } from 'express';
import logger from '../config/logger';

export class AppError extends Error {
  statusCode: number;
  isOperational: boolean;
  errors?: string[];

  constructor(message: string, statusCode: number = 500, errors?: string[]) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    this.errors = errors;

    Error.captureStackTrace(this, this.constructor);
  }
}

export const errorHandler = (
  err: Error | AppError,
  req: Request,
  res: Response,
  _next: NextFunction
): void => {
  if (err instanceof AppError) {
    logger.error('Application Error', {
      message: err.message,
      statusCode: err.statusCode,
      method: req.method,
      url: req.originalUrl,
      errors: err.errors,
      stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
    });

    res.status(err.statusCode).json({
      success: false,
      message: err.message,
      errors: err.errors,
    });
    return;
  }

  logger.error('Unhandled Error', {
    message: err.message,
    method: req.method,
    url: req.originalUrl,
    stack: err.stack,
  });

  res.status(500).json({
    success: false,
    message: process.env.NODE_ENV === 'production'
      ? 'Error interno del servidor'
      : err.message,
  });
};

export const notFoundHandler = (
  req: Request,
  res: Response,
  _next: NextFunction
): void => {
  logger.warn('Route Not Found', {
    method: req.method,
    url: req.originalUrl,
  });

  res.status(404).json({
    success: false,
    message: `Ruta no encontrada: ${req.originalUrl}`,
  });
};