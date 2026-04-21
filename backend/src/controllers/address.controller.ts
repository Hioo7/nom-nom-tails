import { Request, Response, NextFunction } from 'express';
import AddressService from '../services/address.service';
import { CreateAddressSchema, UpdateAddressSchema } from '../schema/address.schema';
import AppError from '../lib/AppError';

const addressService = AddressService.getInstance();

export async function listAddresses(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const addresses = await addressService.listAddresses(req.user!.id);
    res.json({ data: addresses });
  } catch (err) {
    next(err);
  }
}

export async function createAddress(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const parsed = CreateAddressSchema.safeParse(req.body);
    if (!parsed.success) {
      throw new AppError(400, parsed.error.issues[0].message);
    }
    const address = await addressService.createAddress(req.user!.id, parsed.data);
    res.status(201).json({ data: address });
  } catch (err) {
    next(err);
  }
}

export async function updateAddress(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const parsed = UpdateAddressSchema.safeParse(req.body);
    if (!parsed.success) {
      throw new AppError(400, parsed.error.issues[0].message);
    }
    const address = await addressService.updateAddress(req.user!.id, req.params['id'] as string, parsed.data);
    res.json({ data: address });
  } catch (err) {
    next(err);
  }
}

export async function deleteAddress(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    await addressService.deleteAddress(req.user!.id, req.params['id'] as string);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}
