import { AppDataSource } from '../config/database';
import { User } from '../entities/User';
import { hashPassword, comparePassword } from '../utils/password';
import { generateAccessToken, generateRefreshToken } from '../utils/jwt';
import { AppError } from '../middleware/error.middleware';
import { LoginDTO, RegisterDTO } from '../dto/auth.dto';

export class AuthService {
  private userRepository = AppDataSource.getRepository(User);

  async register(data: RegisterDTO): Promise<{ user: User; accessToken: string; refreshToken: string }> {
    const existingUser = await this.userRepository.findOne({
      where: [{ email: data.email }, { username: data.username }],
    });

    if (existingUser) {
      if (existingUser.email === data.email) {
        throw new AppError('El email ya está registrado', 400);
      }
      if (existingUser.username === data.username) {
        throw new AppError('El nombre de usuario ya está en uso', 400);
      }
    }

    const password_hash = await hashPassword(data.password);

    const user = this.userRepository.create({
      username: data.username,
      email: data.email,
      password_hash,
      role: data.role as any,
      full_name: data.full_name,
      is_active: true,
    });

    await this.userRepository.save(user);

    const accessToken = generateAccessToken({
      id: user.id,
      email: user.email,
      role: user.role,
    });

    const refreshToken = generateRefreshToken({
      id: user.id,
      email: user.email,
      role: user.role,
    });

    return { user, accessToken, refreshToken };
  }

  async login(data: LoginDTO): Promise<{ user: User; accessToken: string; refreshToken: string }> {
    const user = await this.userRepository.findOne({
      where: { email: data.email },
    });

    if (!user) {
      throw new AppError('Credenciales inválidas', 401);
    }

    if (!user.is_active) {
      throw new AppError('Usuario inactivo', 403);
    }

    const isPasswordValid = await comparePassword(data.password, user.password_hash);

    if (!isPasswordValid) {
      throw new AppError('Credenciales inválidas', 401);
    }

    const accessToken = generateAccessToken({
      id: user.id,
      email: user.email,
      role: user.role,
    });

    const refreshToken = generateRefreshToken({
      id: user.id,
      email: user.email,
      role: user.role,
    });

    return { user, accessToken, refreshToken };
  }

  async getCurrentUser(userId: number): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      select: ['id', 'username', 'email', 'role', 'full_name', 'is_active', 'created_at', 'updated_at'],
    });

    if (!user) {
      throw new AppError('Usuario no encontrado', 404);
    }

    return user;
  }
}
