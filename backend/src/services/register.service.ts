import { RegisterInput } from '../schema/register.schema';
import { SafeUser } from '../types/user.types';
import { hash } from '../lib/password';
import { signToken } from '../lib/jwt';
import AppError from '../lib/AppError';
import prisma from '../lib/prisma';

class RegisterService {
  private static instance: RegisterService;

  static getInstance(): RegisterService {
    if (!RegisterService.instance) {
      RegisterService.instance = new RegisterService();
    }
    return RegisterService.instance;
  }

  async register(input: RegisterInput): Promise<{ token: string; user: SafeUser }> {
    const existing = await prisma.user.findUnique({ where: { email: input.email } });
    if (existing) {
      throw new AppError(409, 'An account with this email already exists');
    }

    const hashedPassword = await hash(input.password);
    const user = await prisma.user.create({
      data: {
        name: input.name,
        email: input.email,
        password: hashedPassword,
        role: 'CUSTOMER',
      },
    });

    const token = signToken({ sub: user.id, role: user.role });
    const { password: _, ...safeUser } = user;
    return { token, user: safeUser };
  }
}

export default RegisterService;
