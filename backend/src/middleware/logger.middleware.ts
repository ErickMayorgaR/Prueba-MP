import { Request, Response, NextFunction } from 'express';
import logger from '../config/logger';

export const requestLogger = (req: Request, res: Response, next: NextFunction) => {
  const start = Date.now();
  const requestId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

  const requestInfo = {
    requestId,
    method: req.method,
    url: req.originalUrl,
    ip: req.ip || req.socket.remoteAddress,
  };

  logger.info(`Incoming Request: ${req.method} ${req.originalUrl}`, requestInfo);

  if (req.method !== 'GET' && req.body && Object.keys(req.body).length > 0) {
    const sanitizedBody = { ...req.body };
    if (sanitizedBody.password) sanitizedBody.password = '***';
    if (sanitizedBody.password_hash) sanitizedBody.password_hash = '***';
    logger.info('Request Body', { requestId, body: sanitizedBody });
  }

  const originalSend = res.send;
  res.send = function (data: any): Response {
    const duration = Date.now() - start;
    
    const responseInfo = {
      requestId,
      method: req.method,
      url: req.originalUrl,
      status: res.statusCode,
      duration: `${duration}ms`,
    };

    if (res.statusCode >= 400) {
      logger.error(`Error Response: ${req.method} ${req.originalUrl} - ${res.statusCode} (${duration}ms)`, {
        ...responseInfo,
        response: typeof data === 'string' ? data.substring(0, 500) : data,
      });
    } else {
      logger.info(`Outgoing Response: ${req.method} ${req.originalUrl} - ${res.statusCode} (${duration}ms)`, responseInfo);
    }

    return originalSend.call(this, data);
  };

  next();
};