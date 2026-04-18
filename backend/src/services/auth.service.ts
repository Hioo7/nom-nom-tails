import { LoginInput } from '../schema/auth.schema';
import { SafeUser } from '../types/user.types';
import { compare } from '../lib/password';
import { signToken } from '../lib/jwt';
import AppError from '../lib/AppError';
import prisma from '../lib/prisma';

class AuthService {
  private static instance: AuthService;

  static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  async login(input: LoginInput): Promise<{ token: string; user: SafeUser }> {
    const user = await prisma.user.findUnique({ where: { email: input.email } });

    if (!user || !user.isActive) {
      throw new AppError(401, 'Invalid email or password');
    }

    const passwordMatch = await compare(input.password, user.password);
    if (!passwordMatch) {
      throw new AppError(401, 'Invalid email or password');
    }

    const token = signToken({ sub: user.id, role: user.role });

    const { password: _, ...safeUser } = user;
    return { token, user: safeUser };
  }
}

export default AuthService;
