import { Request, Response, NextFunction } from 'express';
import { StatsService } from '../services/stats.service';

const statsService = new StatsService();

export class StatsController {
  async getGeneralStats(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { start_date, end_date } = req.query;

      const stats = await statsService.getGeneralStats(
        start_date as string,
        end_date as string
      );

      res.status(200).json({
        success: true,
        data: stats,
      });
    } catch (error) {
      next(error);
    }
  }

  async getStatsByTechnician(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { start_date, end_date } = req.query;

      const stats = await statsService.getStatsByTechnician(
        start_date as string,
        end_date as string
      );

      res.status(200).json({
        success: true,
        data: stats,
      });
    } catch (error) {
      next(error);
    }
  }

  async getExpedientesByStatus(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const stats = await statsService.getExpedientesByStatus();

      res.status(200).json({
        success: true,
        data: stats,
      });
    } catch (error) {
      next(error);
    }
  }

  async getMonthlyExpedientes(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const year = parseInt(req.params.year) || new Date().getFullYear();
      const stats = await statsService.getMonthlyExpedientes(year);

      res.status(200).json({
        success: true,
        data: stats,
      });
    } catch (error) {
      next(error);
    }
  }
}