import { AppDataSource } from '../config/database';
import { User, UserRole } from '../entities/User';
import { hashPassword } from '../utils/password';
import { AppError } from '../middleware/error.middleware';
import { CreateUserDTO, UpdateUserDTO } from '../dto/user.dto';

export class UserService {
  private userRepository = AppDataSource.getRepository(User);

  async createUser(data: CreateUserDTO): Promise<User> {
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
      role: data.role as UserRole,
      full_name: data.full_name,
      is_active: true,
    });

    await this.userRepository.save(user);
    return user;
  }

  async getAllUsers(role?: UserRole, isActive?: boolean): Promise<User[]> {
    const queryBuilder = this.userRepository
      .createQueryBuilder('user')
      .select([
        'user.id',
        'user.username',
        'user.email',
        'user.role',
        'user.full_name',
        'user.is_active',
        'user.created_at',
        'user.updated_at',
      ]);

    if (role) {
      queryBuilder.andWhere('user.role = :role', { role });
    }

    if (isActive !== undefined) {
      queryBuilder.andWhere('user.is_active = :isActive', { isActive });
    }

    return await queryBuilder.orderBy('user.created_at', 'DESC').getMany();
  }

  async getUserById(id: number): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { id },
      select: [
        'id',
        'username',
        'email',
        'role',
        'full_name',
        'is_active',
        'created_at',
        'updated_at',
      ],
    });

    if (!user) {
      throw new AppError('Usuario no encontrado', 404);
    }

    return user;
  }

  async updateUser(id: number, data: UpdateUserDTO): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id } });

    if (!user) {
      throw new AppError('Usuario no encontrado', 404);
    }

    if (data.email && data.email !== user.email) {
      const existingUser = await this.userRepository.findOne({
        where: { email: data.email },
      });
      if (existingUser) {
        throw new AppError('El email ya está registrado', 400);
      }
    }

    if (data.username && data.username !== user.username) {
      const existingUser = await this.userRepository.findOne({
        where: { username: data.username },
      });
      if (existingUser) {
        throw new AppError('El nombre de usuario ya está en uso', 400);
      }
    }

    Object.assign(user, data);
    await this.userRepository.save(user);

    return user;
  }

  async deleteUser(id: number): Promise<void> {
    const user = await this.userRepository.findOne({ where: { id } });

    if (!user) {
      throw new AppError('Usuario no encontrado', 404);
    }

    user.is_active = false;
    await this.userRepository.save(user);
  }
}
