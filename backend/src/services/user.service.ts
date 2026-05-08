import { Role } from '@prisma/client';
import { CreateUserInput, UpdateUserInput } from '../schema/user.schema';
import { SafeUser } from '../types/user.types';
import { hash } from '../lib/password';
import AppError from '../lib/AppError';
import prisma from '../lib/prisma';

const STAFF_ROLES = [Role.ADMIN, Role.DELIVERY_PARTNER, Role.CHEF];

class UserService {
  private static instance: UserService;

  static getInstance(): UserService {
    if (!UserService.instance) {
      UserService.instance = new UserService();
    }
    return UserService.instance;
  }

  async listStaff(): Promise<SafeUser[]> {
    const users = await prisma.user.findMany({
      where: { role: { in: STAFF_ROLES } },
      omit: { password: true },
      orderBy: { createdAt: 'desc' },
    });
    return users;
  }

  async getStaffMember(id: string): Promise<SafeUser> {
    const user = await prisma.user.findFirst({
      where: { id, role: { in: STAFF_ROLES } },
      omit: { password: true },
    });
    if (!user) throw new AppError(404, 'User not found');
    return user;
  }

  async createStaffMember(data: CreateUserInput): Promise<SafeUser> {
    const existing = await prisma.user.findUnique({ where: { email: data.email } });
    if (existing) throw new AppError(409, 'Email already in use');

    const hashedPassword = await hash(data.password);
    const user = await prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        password: hashedPassword,
        role: data.role,
      },
      omit: { password: true },
    });
    return user;
  }

  async updateStaffMember(
    targetId: string,
    requesterId: string,
    data: UpdateUserInput,
  ): Promise<SafeUser> {
    this.guardSelfOperation(targetId, requesterId);
    await this.findStaffOrThrow(targetId);

    const updateData: {
      name?: string;
      email?: string;
      password?: string;
      role?: Role;
    } = {};

    if (data.name !== undefined) updateData.name = data.name;
    if (data.email !== undefined) updateData.email = data.email;
    if (data.role !== undefined) updateData.role = data.role;
    if (data.password !== undefined) updateData.password = await hash(data.password);

    if (data.email) {
      const conflict = await prisma.user.findFirst({
        where: { email: data.email, id: { not: targetId } },
      });
      if (conflict) throw new AppError(409, 'Email already in use');
    }

    const user = await prisma.user.update({
      where: { id: targetId },
      data: updateData,
      omit: { password: true },
    });
    return user;
  }

  async deleteStaffMember(targetId: string, requesterId: string): Promise<void> {
    this.guardSelfOperation(targetId, requesterId);
    await this.findStaffOrThrow(targetId);
    await prisma.user.delete({ where: { id: targetId } });
  }

  private guardSelfOperation(targetId: string, requesterId: string): void {
    if (targetId === requesterId) {
      throw new AppError(403, 'Cannot perform this operation on your own account');
    }
  }

  private async findStaffOrThrow(id: string): Promise<void> {
    const user = await prisma.user.findFirst({ where: { id, role: { in: STAFF_ROLES } } });
    if (!user) throw new AppError(404, 'User not found');
  }
}

export default UserService;
