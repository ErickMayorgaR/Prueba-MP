import { IsEmail, IsString, MinLength, MaxLength, Matches } from 'class-validator';

export class LoginDTO {
  @IsEmail({}, { message: 'El email debe ser válido' })
  email!: string;

  @IsString({ message: 'La contraseña es requerida' })
  @MinLength(6, { message: 'La contraseña debe tener al menos 8 caracteres' })
  password!: string;
}

export class RegisterDTO {
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
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/, {
    message: 'La contraseña debe contener al menos una mayúscula, una minúscula, un número y un carácter especial',
  })
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

export class ChangePasswordDTO {
  @IsString({ message: 'La contraseña actual es requerida' })
  current_password!: string;

  @IsString({ message: 'La nueva contraseña es requerida' })
  @MinLength(8, { message: 'La nueva contraseña debe tener al menos 8 caracteres' })
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/, {
    message: 'La contraseña debe contener al menos una mayúscula, una minúscula, un número y un carácter especial',
  })
  new_password!: string;
}
