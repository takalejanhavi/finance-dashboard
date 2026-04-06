import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { UsersRepository } from './users.repository';
import { CreateUserDto, UpdateUserDto, UserQueryDto } from './dto/users.dto';
import { paginate } from '../../common/dto/pagination.dto';

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);
  private readonly SALT_ROUNDS = 12;

  constructor(private readonly usersRepository: UsersRepository) {}

  async findAll(query: UserQueryDto) {
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 10;
    const { users, total } = await this.usersRepository.findAll({ ...query, page, limit });
    return paginate(users, total, page, limit);
  }

  async findById(id: string) {
    const user = await this.usersRepository.findById(id);
    if (!user) throw new NotFoundException(`User with ID ${id} not found`);
    return user;
  }

  async create(dto: CreateUserDto) {
    const existing = await this.usersRepository.findByEmail(dto.email);
    if (existing) throw new ConflictException('A user with this email already exists');

    const hashedPassword = await bcrypt.hash(dto.password, this.SALT_ROUNDS);
    const user = await this.usersRepository.create(dto, hashedPassword);
    this.logger.log(`Admin created user: ${user.email} with role ${user.role}`);
    return user;
  }

  async update(id: string, dto: UpdateUserDto) {
    await this.findById(id); // Ensure user exists
    const updated = await this.usersRepository.update(id, dto);
    this.logger.log(`User ${id} updated`);
    return updated;
  }

  async setActive(id: string, isActive: boolean) {
    await this.findById(id);
    const updated = await this.usersRepository.update(id, { isActive });
    this.logger.log(`User ${id} ${isActive ? 'activated' : 'deactivated'}`);
    return updated;
  }

  async getUserStats() {
    const byRole = await this.usersRepository.countByRole();
    return byRole.reduce((acc, row) => {
      acc[row.role] = row._count.role;
      return acc;
    }, {} as Record<string, number>);
  }
}
