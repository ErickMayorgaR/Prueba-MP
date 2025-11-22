import { AppDataSource } from '../config/database';
import { Expediente, ExpedienteStatus } from '../entities/Expediente';
import { Indicio } from '../entities/Indicio';
import { User, UserRole } from '../entities/User';

export interface GeneralStats {
  total_expedientes: number;
  en_registro: number;
  en_revision: number;
  aprobados: number;
  rechazados: number;
  total_indicios: number;
}

export interface TechnicianStats {
  id: number;
  full_name: string;
  total_expedientes: number;
  aprobados: number;
  rechazados: number;
  en_registro: number;
  en_revision: number;
  total_indicios: number;
}

export class StatsService {
  private expedienteRepository = AppDataSource.getRepository(Expediente);
  private indicioRepository = AppDataSource.getRepository(Indicio);
  private userRepository = AppDataSource.getRepository(User);

  async getGeneralStats(startDate?: string, endDate?: string): Promise<GeneralStats> {
    const queryBuilder = this.expedienteRepository.createQueryBuilder('expediente');

    if (startDate) {
      queryBuilder.andWhere('expediente.created_at >= :startDate', {
        startDate: new Date(startDate),
      });
    }

    if (endDate) {
      queryBuilder.andWhere('expediente.created_at <= :endDate', {
        endDate: new Date(endDate),
      });
    }

    const expedientes = await queryBuilder.getMany();

    const stats: GeneralStats = {
      total_expedientes: expedientes.length,
      en_registro: expedientes.filter((e) => e.status === ExpedienteStatus.EN_REGISTRO).length,
      en_revision: expedientes.filter((e) => e.status === ExpedienteStatus.EN_REVISION).length,
      aprobados: expedientes.filter((e) => e.status === ExpedienteStatus.APROBADO).length,
      rechazados: expedientes.filter((e) => e.status === ExpedienteStatus.RECHAZADO).length,
      total_indicios: 0,
    };

    const indiciosQuery = this.indicioRepository
      .createQueryBuilder('indicio')
      .innerJoin('indicio.expediente', 'expediente');

    if (startDate) {
      indiciosQuery.andWhere('expediente.created_at >= :startDate', {
        startDate: new Date(startDate),
      });
    }

    if (endDate) {
      indiciosQuery.andWhere('expediente.created_at <= :endDate', {
        endDate: new Date(endDate),
      });
    }

    stats.total_indicios = await indiciosQuery.getCount();

    return stats;
  }

  async getStatsByTechnician(startDate?: string, endDate?: string): Promise<TechnicianStats[]> {
    const technicians = await this.userRepository.find({
      where: { role: UserRole.TECNICO, is_active: true },
    });

    const stats: TechnicianStats[] = [];

    for (const technician of technicians) {
      const queryBuilder = this.expedienteRepository
        .createQueryBuilder('expediente')
        .where('expediente.technician_id = :technicianId', { technicianId: technician.id });

      if (startDate) {
        queryBuilder.andWhere('expediente.created_at >= :startDate', {
          startDate: new Date(startDate),
        });
      }

      if (endDate) {
        queryBuilder.andWhere('expediente.created_at <= :endDate', {
          endDate: new Date(endDate),
        });
      }

      const expedientes = await queryBuilder.getMany();

      const indiciosCount = await this.indicioRepository.count({
        where: { technician_id: technician.id },
      });

      stats.push({
        id: technician.id,
        full_name: technician.full_name,
        total_expedientes: expedientes.length,
        aprobados: expedientes.filter((e) => e.status === ExpedienteStatus.APROBADO).length,
        rechazados: expedientes.filter((e) => e.status === ExpedienteStatus.RECHAZADO).length,
        en_registro: expedientes.filter((e) => e.status === ExpedienteStatus.EN_REGISTRO).length,
        en_revision: expedientes.filter((e) => e.status === ExpedienteStatus.EN_REVISION).length,
        total_indicios: indiciosCount,
      });
    }

    return stats.sort((a, b) => b.total_expedientes - a.total_expedientes);
  }

  async getExpedientesByStatus(): Promise<{ status: string; count: number }[]> {
    const result = await this.expedienteRepository
      .createQueryBuilder('expediente')
      .select('expediente.status', 'status')
      .addSelect('COUNT(*)', 'count')
      .groupBy('expediente.status')
      .getRawMany();

    return result.map((r) => ({
      status: r.status,
      count: parseInt(r.count),
    }));
  }

  async getMonthlyExpedientes(year: number): Promise<{ month: number; count: number }[]> {
    const result = await this.expedienteRepository
      .createQueryBuilder('expediente')
      .select('MONTH(expediente.created_at)', 'month')
      .addSelect('COUNT(*)', 'count')
      .where('YEAR(expediente.created_at) = :year', { year })
      .groupBy('MONTH(expediente.created_at)')
      .orderBy('MONTH(expediente.created_at)', 'ASC')
      .getRawMany();

    return result.map((r) => ({
      month: parseInt(r.month),
      count: parseInt(r.count),
    }));
  }
}
