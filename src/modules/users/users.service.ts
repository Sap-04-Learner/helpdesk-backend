import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import * as argon2 from 'argon2';
import { Role } from 'src/generated/prisma/enums';

// Reusable select object to ensure passwords are NEVER returned
const userSelect = {
  id: true,
  name: true,
  email: true,
  role: true,
  isActive: true,
  createdAt: true,
  updatedAt: true,
};

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  private normalizeRole(role?: string | null) {
    if (!role) return role;
    if (role === 'It_ADMIN') return 'IT_ADMIN';
    if (role === 'IT') return 'IT_SUPPORT';
    return role;
  }

  private mapRoleFilter(role?: string): Role | undefined {
    if (!role) return undefined;
    if (role === 'IT_ADMIN') return 'It_ADMIN' as Role;
    if (role === 'IT') return 'IT_SUPPORT' as Role;
    return role as Role;
  }

  private mapUserResponse<T extends { role?: string | null }>(user: T): T {
    return {
      ...user,
      role: this.normalizeRole(user.role),
    };
  }

  async create(dto: CreateUserDto) {
    const existing = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });
    if (existing) throw new ConflictException('Email already exists');

    // Hash the password with Argon2
    const hashedPassword = await argon2.hash(dto.password);

    return this.prisma.user.create({
      data: {
        ...dto,
        password: hashedPassword,
      },
      select: userSelect,
    });
  }

  async findAll(role?: string) {
    const normalizedRole = this.mapRoleFilter(role);

    return this.prisma.user.findMany({
      where: normalizedRole ? { role: normalizedRole } : undefined,
      select: userSelect,
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: userSelect,
    });

    if (!user) throw new NotFoundException(`User ${id} not found`);
    return this.mapUserResponse(user);
  }

  async toggleActive(id: string) {
    // Reuses findOne to ensure the user exists before updating
    const user = await this.findOne(id);

    return this.prisma.user.update({
      where: { id },
      data: { isActive: !user.isActive },
      select: userSelect,
    });
  }
}
