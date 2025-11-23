import { Request, Response, NextFunction } from 'express';
import { ExpedienteService } from '../services/expediente.service';
import { AuthRequest } from '../middleware/auth.middleware';

const expedienteService = new ExpedienteService();

export class ExpedienteController {
  async createExpediente(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, message: 'No autenticado' });
        return;
      }

      const expediente = await expedienteService.createExpediente(req.body, req.user.id);

      res.status(201).json({
        success: true,
        message: 'Expediente creado exitosamente',
        data: expediente,
      });
    } catch (error) {
      next(error);
    }
  }

  async getAllExpedientes(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const filters = {
        status: req.query.status as string,
        technician_id: req.query.technician_id ? parseInt(req.query.technician_id as string) : undefined,
        coordinator_id: req.query.coordinator_id ? parseInt(req.query.coordinator_id as string) : undefined,
        start_date: req.query.start_date as string,
        end_date: req.query.end_date as string,
      };

      const expedientes = await expedienteService.getAllExpedientes(filters);

      res.status(200).json({
        success: true,
        data: expedientes,
      });
    } catch (error) {
      next(error);
    }
  }

  async getExpedienteById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = parseInt(req.params.id);
      const expediente = await expedienteService.getExpedienteById(id);

      res.status(200).json({
        success: true,
        data: expediente,
      });
    } catch (error) {
      next(error);
    }
  }

  async updateExpediente(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, message: 'No autenticado' });
        return;
      }

      const id = parseInt(req.params.id);
      const expediente = await expedienteService.updateExpediente(id, req.body, req.user.id, req.user.role);

      res.status(200).json({
        success: true,
        message: 'Expediente actualizado exitosamente',
        data: expediente,
      });
    } catch (error) {
      next(error);
    }
  }

  async submitForReview(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, message: 'No autenticado' });
        return;
      }

      const id = parseInt(req.params.id);
      const expediente = await expedienteService.submitForReview(id, req.user.id, req.user.role);

      res.status(200).json({
        success: true,
        message: 'Expediente enviado a revisión exitosamente',
        data: expediente,
      });
    } catch (error) {
      next(error);
    }
  }

  async approveExpediente(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, message: 'No autenticado' });
        return;
      }

      const id = parseInt(req.params.id);
      const expediente = await expedienteService.approveExpediente(id, req.user.id, req.user.role);

      res.status(200).json({
        success: true,
        message: 'Expediente aprobado exitosamente',
        data: expediente,
      });
    } catch (error) {
      next(error);
    }
  }

  async rejectExpediente(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, message: 'No autenticado' });
        return;
      }

      const id = parseInt(req.params.id);
      const expediente = await expedienteService.rejectExpediente(id, req.body, req.user.id, req.user.role);

      res.status(200).json({
        success: true,
        message: 'Expediente rechazado exitosamente',
        data: expediente,
      });
    } catch (error) {
      next(error);
    }
  }

  async reopenExpediente(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, message: 'No autenticado' });
        return;
      }

      const id = parseInt(req.params.id);
      const expediente = await expedienteService.reopenExpediente(id, req.user.id, req.user.role);

      res.status(200).json({
        success: true,
        message: 'Expediente reabierto exitosamente',
        data: expediente,
      });
    } catch (error) {
      next(error);
    }
  }
}