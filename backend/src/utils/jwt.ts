import jwt from 'jsonwebtoken';
import { UserRole } from '../entities/User';

export interface JWTPayload {
  id: number;
  email: string;
  role: UserRole;
}

export const generateAccessToken = (payload: JWTPayload): string => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET no está configurado');
  }

  return jwt.sign(
    payload as any,
    secret,
    { expiresIn: process.env.JWT_EXPIRES_IN || '24h' } as any
  );
};

export const generateRefreshToken = (payload: JWTPayload): string => {
  const secret = process.env.JWT_REFRESH_SECRET;
  if (!secret) {
    throw new Error('JWT_REFRESH_SECRET no está configurado');
  }

  return jwt.sign(
    payload as any,
    secret,
    { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d' } as any
  );
};

export const verifyAccessToken = (token: string): JWTPayload => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET no está configurado');
  }

  try {
    return jwt.verify(token, secret) as JWTPayload;
  } catch (error) {
    throw new Error('Token inválido o expirado');
  }
};

export const verifyRefreshToken = (token: string): JWTPayload => {
  const secret = process.env.JWT_REFRESH_SECRET;
  if (!secret) {
    throw new Error('JWT_REFRESH_SECRET no está configurado');
  }

  try {
    return jwt.verify(token, secret) as JWTPayload;
  } catch (error) {
    throw new Error('Refresh token inválido o expirado');
  }
};

export const verifyToken = verifyAccessToken;