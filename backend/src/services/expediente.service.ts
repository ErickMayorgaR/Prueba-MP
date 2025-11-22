import { AppDataSource } from '../config/database';
import { Expediente, ExpedienteStatus } from '../entities/Expediente';
// ← CORREGIDO: Eliminado UserRole porque no se usa
import {
  CreateExpedienteDTO,
  UpdateExpedienteDTO,
  RejectExpedienteDTO,
  FilterExpedientesDTO,
} from '../dto/expediente.dto';
import { AppError } from '../middleware/error.middleware';

export class ExpedienteService {
  private expedienteRepository = AppDataSource.getRepository(Expediente);
  // ← CORREGIDO: Eliminado userRepository porque no se usa

  async createExpediente(data: CreateExpedienteDTO, technicianId: number): Promise<Expediente> {
    const existingExpediente = await this.expedienteRepository.findOne({
      where: { case_number: data.case_number },
    });

    if (existingExpediente) {
      throw new AppError('El número de caso ya existe', 400);
    }

    const expediente = this.expedienteRepository.create({
      case_number: data.case_number,
      title: data.title,
      description: data.description,
      location: data.location,
      incident_date: data.incident_date ? new Date(data.incident_date) : undefined,
      technician_id: technicianId,
      status: ExpedienteStatus.EN_REGISTRO,
    });

    await this.expedienteRepository.save(expediente);
    return await this.getExpedienteById(expediente.id);
  }

  async getExpedienteById(id: number): Promise<Expediente> {
    const expediente = await this.expedienteRepository.findOne({
      where: { id },
      relations: ['technician', 'coordinator', 'indicios'],
    });

    if (!expediente) {
      throw new AppError('Expediente no encontrado', 404);
    }

    return expediente;
  }

  async getAllExpedientes(filters: FilterExpedientesDTO): Promise<Expediente[]> {
    const queryBuilder = this.expedienteRepository
      .createQueryBuilder('expediente')
      .leftJoinAndSelect('expediente.technician', 'technician')
      .leftJoinAndSelect('expediente.coordinator', 'coordinator')
      .leftJoinAndSelect('expediente.indicios', 'indicios');

    if (filters.status) {
      queryBuilder.andWhere('expediente.status = :status', { status: filters.status });
    }

    if (filters.technician_id) {
      queryBuilder.andWhere('expediente.technician_id = :technician_id', {
        technician_id: filters.technician_id,
      });
    }

    if (filters.coordinator_id) {
      queryBuilder.andWhere('expediente.coordinator_id = :coordinator_id', {
        coordinator_id: filters.coordinator_id,
      });
    }

    if (filters.start_date) {
      queryBuilder.andWhere('expediente.created_at >= :start_date', {
        start_date: new Date(filters.start_date),
      });
    }

    if (filters.end_date) {
      queryBuilder.andWhere('expediente.created_at <= :end_date', {
        end_date: new Date(filters.end_date),
      });
    }

    return await queryBuilder.orderBy('expediente.created_at', 'DESC').getMany();
  }

  async updateExpediente(id: number, data: UpdateExpedienteDTO, userId: number): Promise<Expediente> {
    const expediente = await this.expedienteRepository.findOne({
      where: { id },
      relations: ['technician'],
    });

    if (!expediente) {
      throw new AppError('Expediente no encontrado', 404);
    }

    if (expediente.status !== ExpedienteStatus.EN_REGISTRO) {
      throw new AppError('Solo se pueden modificar expedientes en estado EN_REGISTRO', 400);
    }

    if (expediente.technician_id !== userId) {
      throw new AppError('Solo el técnico asignado puede modificar este expediente', 403);
    }

    Object.assign(expediente, {
      ...data,
      incident_date: data.incident_date ? new Date(data.incident_date) : expediente.incident_date,
    });

    await this.expedienteRepository.save(expediente);
    return await this.getExpedienteById(id);
  }

  async submitForReview(id: number, userId: number): Promise<Expediente> {
    const expediente = await this.expedienteRepository.findOne({
      where: { id },
      relations: ['indicios'],
    });

    if (!expediente) {
      throw new AppError('Expediente no encontrado', 404);
    }

    if (expediente.status !== ExpedienteStatus.EN_REGISTRO) {
      throw new AppError('Solo se pueden enviar a revisión expedientes en estado EN_REGISTRO', 400);
    }

    if (expediente.technician_id !== userId) {
      throw new AppError('Solo el técnico asignado puede enviar este expediente a revisión', 403);
    }

    if (!expediente.indicios || expediente.indicios.length === 0) {
      throw new AppError('El expediente debe tener al menos un indicio antes de enviarlo a revisión', 400);
    }

    expediente.status = ExpedienteStatus.EN_REVISION;
    expediente.submitted_at = new Date();

    await this.expedienteRepository.save(expediente);
    return await this.getExpedienteById(id);
  }

  async approveExpediente(id: number, coordinatorId: number): Promise<Expediente> {
    const expediente = await this.expedienteRepository.findOne({
      where: { id },
    });

    if (!expediente) {
      throw new AppError('Expediente no encontrado', 404);
    }

    if (expediente.status !== ExpedienteStatus.EN_REVISION) {
      throw new AppError('Solo se pueden aprobar expedientes en estado EN_REVISION', 400);
    }

    expediente.status = ExpedienteStatus.APROBADO;
    expediente.coordinator_id = coordinatorId;
    expediente.reviewed_at = new Date();
    expediente.approved_at = new Date();
    expediente.rejection_reason = undefined;

    await this.expedienteRepository.save(expediente);
    return await this.getExpedienteById(id);
  }

  async rejectExpediente(id: number, data: RejectExpedienteDTO, coordinatorId: number): Promise<Expediente> {
    const expediente = await this.expedienteRepository.findOne({
      where: { id },
    });

    if (!expediente) {
      throw new AppError('Expediente no encontrado', 404);
    }

    if (expediente.status !== ExpedienteStatus.EN_REVISION) {
      throw new AppError('Solo se pueden rechazar expedientes en estado EN_REVISION', 400);
    }

    expediente.status = ExpedienteStatus.RECHAZADO;
    expediente.coordinator_id = coordinatorId;
    expediente.rejection_reason = data.rejection_reason;
    expediente.reviewed_at = new Date();

    await this.expedienteRepository.save(expediente);
    return await this.getExpedienteById(id);
  }

  async reopenExpediente(id: number, userId: number): Promise<Expediente> {
    const expediente = await this.expedienteRepository.findOne({
      where: { id },
    });

    if (!expediente) {
      throw new AppError('Expediente no encontrado', 404);
    }

    if (expediente.status !== ExpedienteStatus.RECHAZADO) {
      throw new AppError('Solo se pueden reabrir expedientes rechazados', 400);
    }

    if (expediente.technician_id !== userId) {
      throw new AppError('Solo el técnico asignado puede reabrir este expediente', 403);
    }

    expediente.status = ExpedienteStatus.EN_REGISTRO;
    expediente.submitted_at = undefined;
    expediente.reviewed_at = undefined;

    await this.expedienteRepository.save(expediente);
    return await this.getExpedienteById(id);
  }
}