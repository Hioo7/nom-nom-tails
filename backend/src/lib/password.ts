import bcrypt from 'bcryptjs';
import { BCRYPT_ROUNDS } from '../config/constants';

export async function hash(plain: string): Promise<string> {
  return bcrypt.hash(plain, BCRYPT_ROUNDS);
}

export async function compare(plain: string, hashed: string): Promise<boolean> {
  return bcrypt.compare(plain, hashed);
}
