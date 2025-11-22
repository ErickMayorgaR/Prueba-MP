import { Request, Response, NextFunction } from 'express';
import { validateDTO } from '../utils/validation';
import { AppError } from './error.middleware';

export const validateBody = <T extends object>(dtoClass: new () => T) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const validationResult = await validateDTO(dtoClass, req.body);

      if (!validationResult.isValid) {
        res.status(400).json({
          success: false,
          message: 'Error de validación',
          errors: validationResult.errors,
        });
        return;
      }

      next();
    } catch (error) {
      next(new AppError('Error en la validación de datos', 400));
    }
  };
};

export const validateQuery = <T extends object>(dtoClass: new () => T) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const validationResult = await validateDTO(dtoClass, req.query);

      if (!validationResult.isValid) {
        res.status(400).json({
          success: false,
          message: 'Error de validación',
          errors: validationResult.errors,
        });
        return;
      }

      next();
    } catch (error) {
      next(new AppError('Error en la validación de parámetros', 400));
    }
  };
};
