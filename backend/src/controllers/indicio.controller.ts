import { Request, Response, NextFunction } from 'express';
import { IndicioService } from '../services/indicio.service';
import { AuthRequest } from '../middleware/auth.middleware';

const indicioService = new IndicioService();

export class IndicioController {
  async createIndicio(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, message: 'No autenticado' });
        return;
      }

      const indicio = await indicioService.createIndicio(req.body, req.user.id, req.user.role);

      res.status(201).json({
        success: true,
        message: 'Indicio creado exitosamente',
        data: indicio,
      });
    } catch (error) {
      next(error);
    }
  }

  async getIndicioById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = parseInt(req.params.id);
      const indicio = await indicioService.getIndicioById(id);

      res.status(200).json({
        success: true,
        data: indicio,
      });
    } catch (error) {
      next(error);
    }
  }

  async getIndiciosByExpediente(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const expedienteId = parseInt(req.params.expedienteId);
      const indicios = await indicioService.getIndiciosByExpediente(expedienteId);

      res.status(200).json({
        success: true,
        data: indicios,
      });
    } catch (error) {
      next(error);
    }
  }

  async updateIndicio(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, message: 'No autenticado' });
        return;
      }

      const id = parseInt(req.params.id);
      const indicio = await indicioService.updateIndicio(id, req.body, req.user.id, req.user.role);

      res.status(200).json({
        success: true,
        message: 'Indicio actualizado exitosamente',
        data: indicio,
      });
    } catch (error) {
      next(error);
    }
  }

  async deleteIndicio(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, message: 'No autenticado' });
        return;
      }

      const id = parseInt(req.params.id);
      await indicioService.deleteIndicio(id, req.user.id, req.user.role);

      res.status(200).json({
        success: true,
        message: 'Indicio eliminado exitosamente',
      });
    } catch (error) {
      next(error);
    }
  }
}