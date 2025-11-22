import { Request, Response, NextFunction } from 'express';
import { UserService } from '../services/user.service';

const userService = new UserService();

export class UserController {
  async createUser(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = await userService.createUser(req.body);

      res.status(201).json({
        success: true,
        message: 'Usuario creado exitosamente',
        data: {
          id: user.id,
          username: user.username,
          email: user.email,
          role: user.role,
          full_name: user.full_name,
          is_active: user.is_active,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  async getAllUsers(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { role, is_active } = req.query;

      const users = await userService.getAllUsers(
        role as any,
        is_active === 'true' ? true : is_active === 'false' ? false : undefined
      );

      res.status(200).json({
        success: true,
        data: users.map((user) => ({
          id: user.id,
          username: user.username,
          email: user.email,
          role: user.role,
          full_name: user.full_name,
          is_active: user.is_active,
          created_at: user.created_at,
        })),
      });
    } catch (error) {
      next(error);
    }
  }

  async getUserById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = parseInt(req.params.id);
      const user = await userService.getUserById(id);

      res.status(200).json({
        success: true,
        data: {
          id: user.id,
          username: user.username,
          email: user.email,
          role: user.role,
          full_name: user.full_name,
          is_active: user.is_active,
          created_at: user.created_at,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  async updateUser(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = parseInt(req.params.id);
      const user = await userService.updateUser(id, req.body);

      res.status(200).json({
        success: true,
        message: 'Usuario actualizado exitosamente',
        data: {
          id: user.id,
          username: user.username,
          email: user.email,
          role: user.role,
          full_name: user.full_name,
          is_active: user.is_active,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  async deleteUser(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = parseInt(req.params.id);
      await userService.deleteUser(id);

      res.status(200).json({
        success: true,
        message: 'Usuario desactivado exitosamente',
      });
    } catch (error) {
      next(error);
    }
  }
}
