import { UpdateMeInput, UpdateLocationInput } from '../schema/me.schema';
import { SafeUser } from '../types/user.types';
import { hash, compare } from '../lib/password';
import AppError from '../lib/AppError';
import prisma from '../lib/prisma';

class MeService {
  private static instance: MeService;

  static getInstance(): MeService {
    if (!MeService.instance) {
      MeService.instance = new MeService();
    }
    return MeService.instance;
  }

  async getMe(userId: string): Promise<SafeUser> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      omit: { password: true },
    });
    if (!user) throw new AppError(404, 'User not found');
    return user;
  }

  async updateLocation(userId: string, data: UpdateLocationInput): Promise<SafeUser> {
    const user = await prisma.user.update({
      where: { id: userId },
      data: { lat: data.lat, lng: data.lng },
      omit: { password: true },
    });
    return user;
  }

  async updateMe(userId: string, data: UpdateMeInput): Promise<SafeUser> {
    const updateData: { name?: string; email?: string; password?: string } = {};

    if (data.name !== undefined) updateData.name = data.name;

    if (data.email !== undefined) {
      const conflict = await prisma.user.findFirst({
        where: { email: data.email, id: { not: userId } },
      });
      if (conflict) throw new AppError(409, 'Email already in use');
      updateData.email = data.email;
    }

    if (data.newPassword) {
      const user = await prisma.user.findUnique({ where: { id: userId } });
      if (!user) throw new AppError(404, 'User not found');

      const valid = await compare(data.currentPassword!, user.password);
      if (!valid) throw new AppError(400, 'Current password is incorrect');

      updateData.password = await hash(data.newPassword);
    }

    const user = await prisma.user.update({
      where: { id: userId },
      data: updateData,
      omit: { password: true },
    });
    return user;
  }
}

export default MeService;
