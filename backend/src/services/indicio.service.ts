import { AppDataSource } from '../config/database';
import { Indicio } from '../entities/Indicio';
import { Expediente, ExpedienteStatus } from '../entities/Expediente';
import { AppError } from '../middleware/error.middleware';
import { CreateIndicioDTO, UpdateIndicioDTO } from '../dto/indicio.dto';
import { UserRole } from '../entities/User';

export class IndicioService {
  private indicioRepository = AppDataSource.getRepository(Indicio);
  private expedienteRepository = AppDataSource.getRepository(Expediente);

  async createIndicio(data: CreateIndicioDTO, technicianId: number, userRole: string): Promise<Indicio> {
    const expediente = await this.expedienteRepository.findOne({
      where: { id: data.expediente_id },
    });

    if (!expediente) {
      throw new AppError('Expediente no encontrado', 404);
    }

    if (expediente.status !== ExpedienteStatus.EN_REGISTRO) {
      throw new AppError('Solo se pueden agregar indicios a expedientes en estado EN_REGISTRO', 400);
    }

    if (userRole !== UserRole.ADMIN && expediente.technician_id !== technicianId) {
      throw new AppError('Solo el técnico asignado puede agregar indicios a este expediente', 403);
    }

    const existingIndicio = await this.indicioRepository.findOne({
      where: {
        expediente_id: data.expediente_id,
        code: data.code,
      },
    });

    if (existingIndicio) {
      throw new AppError('Ya existe un indicio con este código en el expediente', 400);
    }

    const indicio = this.indicioRepository.create({
      expediente_id: data.expediente_id,
      code: data.code,
      description: data.description,
      color: data.color,
      size: data.size,
      weight: data.weight,
      location: data.location,
      observations: data.observations,
      technician_id: technicianId,
    });

    await this.indicioRepository.save(indicio);

    expediente.updated_at = new Date();
    await this.expedienteRepository.save(expediente);

    return await this.getIndicioById(indicio.id);
  }

  async getIndicioById(id: number): Promise<Indicio> {
    const indicio = await this.indicioRepository.findOne({
      where: { id },
      relations: ['technician', 'expediente'],
    });

    if (!indicio) {
      throw new AppError('Indicio no encontrado', 404);
    }

    return indicio;
  }

  async getIndiciosByExpediente(expedienteId: number): Promise<Indicio[]> {
    const expediente = await this.expedienteRepository.findOne({
      where: { id: expedienteId },
    });

    if (!expediente) {
      throw new AppError('Expediente no encontrado', 404);
    }

    return await this.indicioRepository.find({
      where: { expediente_id: expedienteId },
      relations: ['technician'],
      order: { created_at: 'ASC' },
    });
  }

  async updateIndicio(id: number, data: UpdateIndicioDTO, userId: number, userRole: string): Promise<Indicio> {
    const indicio = await this.indicioRepository.findOne({
      where: { id },
      relations: ['expediente'],
    });

    if (!indicio) {
      throw new AppError('Indicio no encontrado', 404);
    }

    if (!indicio.expediente) {
      throw new AppError('Expediente no encontrado', 404);
    }

    if (indicio.expediente.status !== ExpedienteStatus.EN_REGISTRO) {
      throw new AppError('Solo se pueden modificar indicios de expedientes en estado EN_REGISTRO', 400);
    }

    if (userRole !== UserRole.ADMIN && indicio.expediente.technician_id !== userId) {
      throw new AppError('Solo el técnico asignado puede modificar este indicio', 403);
    }

    if (data.code && data.code !== indicio.code) {
      const existingIndicio = await this.indicioRepository.findOne({
        where: {
          expediente_id: indicio.expediente_id,
          code: data.code,
        },
      });

      if (existingIndicio) {
        throw new AppError('Ya existe un indicio con este código en el expediente', 400);
      }
    }

    Object.assign(indicio, data);
    await this.indicioRepository.save(indicio);

    indicio.expediente.updated_at = new Date();
    await this.expedienteRepository.save(indicio.expediente);

    return await this.getIndicioById(id);
  }

  async deleteIndicio(id: number, userId: number, userRole: string): Promise<void> {
    const indicio = await this.indicioRepository.findOne({
      where: { id },
      relations: ['expediente'],
    });

    if (!indicio) {
      throw new AppError('Indicio no encontrado', 404);
    }

    if (!indicio.expediente) {
      throw new AppError('Expediente no encontrado', 404);
    }

    if (indicio.expediente.status !== ExpedienteStatus.EN_REGISTRO) {
      throw new AppError('Solo se pueden eliminar indicios de expedientes en estado EN_REGISTRO', 400);
    }

    if (userRole !== UserRole.ADMIN && indicio.expediente.technician_id !== userId) {
      throw new AppError('Solo el técnico asignado puede eliminar este indicio', 403);
    }

    await this.indicioRepository.remove(indicio);

    const expediente = await this.expedienteRepository.findOne({
      where: { id: indicio.expediente_id },
    });

    if (expediente) {
      expediente.updated_at = new Date();
      await this.expedienteRepository.save(expediente);
    }
  }
}