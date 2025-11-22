import {
  IsEmail,
  IsString,
  IsBoolean,
  IsOptional,
  MinLength,
  MaxLength,
  Matches,
} from 'class-validator';

export class CreateUserDTO {
  @IsString({ message: 'El nombre de usuario es requerido' })
  @MinLength(3, { message: 'El nombre de usuario debe tener al menos 3 caracteres' })
  @MaxLength(100, { message: 'El nombre de usuario no puede exceder 100 caracteres' })
  @Matches(/^[a-zA-Z0-9_]+$/, {
    message: 'El nombre de usuario solo puede contener letras, números y guiones bajos',
  })
  username!: string;

  @IsEmail({}, { message: 'El email debe ser válido' })
  email!: string;

  @IsString({ message: 'La contraseña es requerida' })
  @MinLength(8, { message: 'La contraseña debe tener al menos 8 caracteres' })
  password!: string;

  @IsString({ message: 'El nombre completo es requerido' })
  @MinLength(3, { message: 'El nombre completo debe tener al menos 3 caracteres' })
  @MaxLength(255, { message: 'El nombre completo no puede exceder 255 caracteres' })
  full_name!: string;

  @IsString({ message: 'El rol es requerido' })
  @Matches(/^(ADMIN|TECNICO|COORDINADOR)$/, {
    message: 'El rol debe ser ADMIN, TECNICO o COORDINADOR',
  })
  role!: string;
}

export class UpdateUserDTO {
  @IsOptional()
  @IsString({ message: 'El nombre de usuario debe ser un string' })
  @MinLength(3, { message: 'El nombre de usuario debe tener al menos 3 caracteres' })
  @MaxLength(100, { message: 'El nombre de usuario no puede exceder 100 caracteres' })
  username?: string;

  @IsOptional()
  @IsEmail({}, { message: 'El email debe ser válido' })
  email?: string;

  @IsOptional()
  @IsString({ message: 'El nombre completo debe ser un string' })
  @MinLength(3, { message: 'El nombre completo debe tener al menos 3 caracteres' })
  @MaxLength(255, { message: 'El nombre completo no puede exceder 255 caracteres' })
  full_name?: string;

  @IsOptional()
  @IsString({ message: 'El rol debe ser un string' })
  @Matches(/^(ADMIN|TECNICO|COORDINADOR)$/, {
    message: 'El rol debe ser ADMIN, TECNICO o COORDINADOR',
  })
  role?: string;

  @IsOptional()
  @IsBoolean({ message: 'is_active debe ser un booleano' })
  is_active?: boolean;
}

export class UserResponseDTO {
  id!: number;
  username!: string;
  email!: string;
  role!: string;
  full_name!: string;
  is_active!: boolean;
  created_at!: Date;
  updated_at!: Date;
}
