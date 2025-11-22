import {
  IsString,
  IsOptional,
  IsInt,
  MinLength,
  MaxLength,
  Matches,
} from 'class-validator';

export class CreateIndicioDTO {
  @IsInt({ message: 'El ID del expediente debe ser un número entero' })
  expediente_id!: number;

  @IsString({ message: 'El código es requerido' })
  @MinLength(1, { message: 'El código debe tener al menos 1 caracter' })
  @MaxLength(50, { message: 'El código no puede exceder 50 caracteres' })
  @Matches(/^[A-Z0-9-]+$/, {
    message: 'El código solo puede contener letras mayúsculas, números y guiones',
  })
  code!: string;

  @IsString({ message: 'La descripción es requerida' })
  @MinLength(3, { message: 'La descripción debe tener al menos 3 caracteres' })
  description!: string;

  @IsOptional()
  @IsString({ message: 'El color debe ser un string' })
  @MaxLength(100, { message: 'El color no puede exceder 100 caracteres' })
  color?: string;

  @IsOptional()
  @IsString({ message: 'El tamaño debe ser un string' })
  @MaxLength(100, { message: 'El tamaño no puede exceder 100 caracteres' })
  size?: string;

  @IsOptional()
  @IsString({ message: 'El peso debe ser un string' })
  @MaxLength(100, { message: 'El peso no puede exceder 100 caracteres' })
  weight?: string;

  @IsOptional()
  @IsString({ message: 'La ubicación debe ser un string' })
  @MaxLength(500, { message: 'La ubicación no puede exceder 500 caracteres' })
  location?: string;

  @IsOptional()
  @IsString({ message: 'Las observaciones deben ser un string' })
  observations?: string;
}

export class UpdateIndicioDTO {
  @IsOptional()
  @IsString({ message: 'El código debe ser un string' })
  @MinLength(1, { message: 'El código debe tener al menos 1 caracter' })
  @MaxLength(50, { message: 'El código no puede exceder 50 caracteres' })
  @Matches(/^[A-Z0-9-]+$/, {
    message: 'El código solo puede contener letras mayúsculas, números y guiones',
  })
  code?: string;

  @IsOptional()
  @IsString({ message: 'La descripción debe ser un string' })
  @MinLength(3, { message: 'La descripción debe tener al menos 3 caracteres' })
  description?: string;

  @IsOptional()
  @IsString({ message: 'El color debe ser un string' })
  @MaxLength(100, { message: 'El color no puede exceder 100 caracteres' })
  color?: string;

  @IsOptional()
  @IsString({ message: 'El tamaño debe ser un string' })
  @MaxLength(100, { message: 'El tamaño no puede exceder 100 caracteres' })
  size?: string;

  @IsOptional()
  @IsString({ message: 'El peso debe ser un string' })
  @MaxLength(100, { message: 'El peso no puede exceder 100 caracteres' })
  weight?: string;

  @IsOptional()
  @IsString({ message: 'La ubicación debe ser un string' })
  @MaxLength(500, { message: 'La ubicación no puede exceder 500 caracteres' })
  location?: string;

  @IsOptional()
  @IsString({ message: 'Las observaciones deben ser un string' })
  observations?: string;
}
