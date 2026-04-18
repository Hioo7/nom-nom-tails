import sharp from 'sharp';
import { IMAGE_QUALITY } from '../config/constants';

export async function compressToAvif(inputBuffer: Buffer): Promise<Buffer> {
  return sharp(inputBuffer).avif({ quality: IMAGE_QUALITY }).toBuffer();
}
