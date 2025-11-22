import {
  IsString,
  IsOptional,
  IsDateString,
  IsInt,
  MinLength,
  MaxLength,
  Matches,
} from 'class-validator';

export class CreateExpedienteDTO {
  @IsString({ message: 'El número de caso es requerido' })
  @MinLength(3, { message: 'El número de caso debe tener al menos 3 caracteres' })
  @MaxLength(50, { message: 'El número de caso no puede exceder 50 caracteres' })
  @Matches(/^[A-Z0-9-]+$/, {
    message: 'El número de caso solo puede contener letras mayúsculas, números y guiones',
  })
  case_number!: string;

  @IsString({ message: 'El título es requerido' })
  @MinLength(3, { message: 'El título debe tener al menos 3 caracteres' })
  @MaxLength(255, { message: 'El título no puede exceder 255 caracteres' })
  title!: string;

  @IsOptional()
  @IsString({ message: 'La descripción debe ser un string' })
  description?: string;

  @IsOptional()
  @IsString({ message: 'La ubicación debe ser un string' })
  @MaxLength(500, { message: 'La ubicación no puede exceder 500 caracteres' })
  location?: string;

  @IsOptional()
  @IsDateString({}, { message: 'La fecha del incidente debe ser una fecha válida' })
  incident_date?: string;
}

export class UpdateExpedienteDTO {
  @IsOptional()
  @IsString({ message: 'El título debe ser un string' })
  @MinLength(3, { message: 'El título debe tener al menos 3 caracteres' })
  @MaxLength(255, { message: 'El título no puede exceder 255 caracteres' })
  title?: string;

  @IsOptional()
  @IsString({ message: 'La descripción debe ser un string' })
  description?: string;

  @IsOptional()
  @IsString({ message: 'La ubicación debe ser un string' })
  @MaxLength(500, { message: 'La ubicación no puede exceder 500 caracteres' })
  location?: string;

  @IsOptional()
  @IsDateString({}, { message: 'La fecha del incidente debe ser una fecha válida' })
  incident_date?: string;
}

export class RejectExpedienteDTO {
  @IsString({ message: 'La razón de rechazo es requerida' })
  @MinLength(10, { message: 'La razón de rechazo debe tener al menos 10 caracteres' })
  rejection_reason!: string;
}

export class FilterExpedientesDTO {
  @IsOptional()
  @IsString()
  @Matches(/^(EN_REGISTRO|EN_REVISION|APROBADO|RECHAZADO)$/, {
    message: 'El estado debe ser EN_REGISTRO, EN_REVISION, APROBADO o RECHAZADO',
  })
  status?: string;

  @IsOptional()
  @IsInt({ message: 'El ID del técnico debe ser un número entero' })
  technician_id?: number;

  @IsOptional()
  @IsInt({ message: 'El ID del coordinador debe ser un número entero' })
  coordinator_id?: number;

  @IsOptional()
  @IsDateString({}, { message: 'La fecha de inicio debe ser una fecha válida' })
  start_date?: string;

  @IsOptional()
  @IsDateString({}, { message: 'La fecha de fin debe ser una fecha válida' })
  end_date?: string;
}
