import AppError from '../lib/AppError';
import prisma from '../lib/prisma';
import { CreateAddressInput, UpdateAddressInput, UpdateCurrentLocationInput } from '../schema/address.schema';
import { Address } from '@prisma/client';

class AddressService {
  private static instance: AddressService;

  static getInstance(): AddressService {
    if (!AddressService.instance) {
      AddressService.instance = new AddressService();
    }
    return AddressService.instance;
  }

  async listAddresses(userId: string): Promise<Address[]> {
    // Exclude the current-location entry from the normal address list
    return prisma.address.findMany({
      where: { userId, isCurrentLocation: false },
      orderBy: { createdAt: 'asc' },
    });
  }

  async getCurrentLocation(userId: string): Promise<Address | null> {
    return prisma.address.findFirst({
      where: { userId, isCurrentLocation: true },
    });
  }

  // Upsert the GPS-detected current location into the address table
  async upsertCurrentLocation(userId: string, data: UpdateCurrentLocationInput): Promise<Address> {
    const existing = await prisma.address.findFirst({
      where: { userId, isCurrentLocation: true },
    });

    if (existing) {
      return prisma.address.update({
        where: { id: existing.id },
        data: { lat: data.lat, lng: data.lng, displayName: data.displayName },
      });
    }

    return prisma.address.create({
      data: {
        userId,
        isCurrentLocation: true,
        lat: data.lat,
        lng: data.lng,
        displayName: data.displayName,
      },
    });
  }

  async createAddress(userId: string, data: CreateAddressInput): Promise<Address> {
    return prisma.address.create({
      data: {
        userId,
        isCurrentLocation: false,
        type: data.type,
        fullName: data.fullName,
        phone: data.phone,
        line1: data.line1,
        line2: data.line2 ?? null,
        city: data.city,
        state: data.state,
        pin: data.pin,
        lat: data.lat,
        lng: data.lng,
      },
    });
  }

  async updateAddress(userId: string, id: string, data: UpdateAddressInput): Promise<Address> {
    const existing = await prisma.address.findUnique({ where: { id } });
    if (!existing || existing.userId !== userId) {
      throw new AppError(404, 'Address not found');
    }
    return prisma.address.update({ where: { id }, data });
  }

  async deleteAddress(userId: string, id: string): Promise<void> {
    const existing = await prisma.address.findUnique({ where: { id } });
    if (!existing || existing.userId !== userId) {
      throw new AppError(404, 'Address not found');
    }
    await prisma.address.delete({ where: { id } });
  }
}

export default AddressService;
