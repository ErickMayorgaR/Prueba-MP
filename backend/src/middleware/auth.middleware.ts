import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../utils/jwt'; // ← Ya funciona con el alias agregado
import { AppError } from './error.middleware';

export interface AuthRequest extends Request {
  user?: {
    id: number;
    email: string;
    role: string;
  };
}

export const authenticate = async (
  req: AuthRequest,
  _res: Response, // ← CORREGIDO: res → _res
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new AppError('Token no proporcionado', 401);
    }

    const token = authHeader.split(' ')[1];
    const decoded = verifyToken(token) as { id: number; email: string; role: string };

    req.user = decoded;
    next();
  } catch (error) {
    next(new AppError('Token inválido o expirado', 401));
  }
};

export const authorize = (...roles: string[]) => {
  return (req: AuthRequest, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      return next(new AppError('No autenticado', 401));
    }

    if (!roles.includes(req.user.role)) {
      return next(new AppError('No autorizado para esta acción', 403));
    }

    next();
  };
};