import { AddressType, Role } from '@prisma/client';
import prisma from '../../src/lib/prisma';
import { hash } from '../../src/lib/password';

export interface CustomerRecord {
  id: string;
  addressId: string;
}

export interface CustomersResult {
  arjun: CustomerRecord;
  priya: CustomerRecord;
  vikram: CustomerRecord;
  anjali: CustomerRecord;
  karan: CustomerRecord;
  sneha: CustomerRecord;
  rahul: CustomerRecord;
  divya: CustomerRecord;
  aditya: CustomerRecord;
  pooja: CustomerRecord;
}

// Delivery coordinates spread across Bangalore area
const CUSTOMER_DEFINITIONS = [
  // Loyalty customers
  {
    name: 'Arjun Mehta',
    email: 'arjun@example.com',
    phone: '+919876543210',
    isLoyalty: true,
    lat: 12.9716,
    lng: 77.5946,
    line1: '14 MG Road',
    line2: 'Ashok Nagar',
    city: 'Bangalore',
    state: 'Karnataka',
    pin: '560001',
  },
  {
    name: 'Priya Nair',
    email: 'priya@example.com',
    phone: '+919876543211',
    isLoyalty: true,
    lat: 12.9352,
    lng: 77.6245,
    line1: '8 Koramangala 4th Block',
    line2: null,
    city: 'Bangalore',
    state: 'Karnataka',
    pin: '560034',
  },
  {
    name: 'Vikram Singh',
    email: 'vikram@example.com',
    phone: '+919876543212',
    isLoyalty: true,
    lat: 12.9698,
    lng: 77.75,
    line1: '22 Whitefield Main Road',
    line2: 'Kadugodi',
    city: 'Bangalore',
    state: 'Karnataka',
    pin: '560066',
  },
  {
    name: 'Anjali Reddy',
    email: 'anjali@example.com',
    phone: '+919876543213',
    isLoyalty: true,
    lat: 13.0827,
    lng: 77.5877,
    line1: '5 Hebbal Ring Road',
    line2: null,
    city: 'Bangalore',
    state: 'Karnataka',
    pin: '560024',
  },
  {
    name: 'Karan Kapoor',
    email: 'karan@example.com',
    phone: '+919876543214',
    isLoyalty: true,
    lat: 12.9279,
    lng: 77.6271,
    line1: '31 HSR Layout Sector 4',
    line2: null,
    city: 'Bangalore',
    state: 'Karnataka',
    pin: '560102',
  },
  // Non-loyalty customers
  {
    name: 'Sneha Joshi',
    email: 'sneha@example.com',
    phone: '+919876543215',
    isLoyalty: false,
    lat: 13.0012,
    lng: 77.5552,
    line1: '19 Rajajinagar 3rd Block',
    line2: null,
    city: 'Bangalore',
    state: 'Karnataka',
    pin: '560010',
  },
  {
    name: 'Rahul Gupta',
    email: 'rahul@example.com',
    phone: '+919876543216',
    isLoyalty: false,
    lat: 12.9263,
    lng: 77.5539,
    line1: '7 Banashankari 2nd Stage',
    line2: 'BDA Complex',
    city: 'Bangalore',
    state: 'Karnataka',
    pin: '560070',
  },
  {
    name: 'Divya Kumar',
    email: 'divya@example.com',
    phone: '+919876543217',
    isLoyalty: false,
    lat: 12.9719,
    lng: 77.6412,
    line1: '3 Indiranagar 12th Main',
    line2: null,
    city: 'Bangalore',
    state: 'Karnataka',
    pin: '560038',
  },
  {
    name: 'Aditya Shah',
    email: 'aditya@example.com',
    phone: '+919876543218',
    isLoyalty: false,
    lat: 13.0358,
    lng: 77.597,
    line1: '45 Yelahanka New Town',
    line2: null,
    city: 'Bangalore',
    state: 'Karnataka',
    pin: '560064',
  },
  {
    name: 'Pooja Iyer',
    email: 'pooja@example.com',
    phone: '+919876543219',
    isLoyalty: false,
    lat: 12.9141,
    lng: 77.6101,
    line1: '12 JP Nagar 6th Phase',
    line2: null,
    city: 'Bangalore',
    state: 'Karnataka',
    pin: '560078',
  },
] as const;

export async function seedCustomers(): Promise<CustomersResult> {
  const defaultPassword = await hash('Customer@123');

  const results: CustomerRecord[] = [];

  for (const def of CUSTOMER_DEFINITIONS) {
    const user = await prisma.user.create({
      data: {
        email: def.email,
        password: defaultPassword,
        name: def.name,
        role: Role.CUSTOMER,
        isLoyalty: def.isLoyalty,
      },
    });

    const address = await prisma.address.create({
      data: {
        userId: user.id,
        type: AddressType.HOME,
        fullName: def.name,
        phone: def.phone,
        line1: def.line1,
        line2: def.line2 ?? undefined,
        city: def.city,
        state: def.state,
        pin: def.pin,
        lat: def.lat,
        lng: def.lng,
      },
    });

    results.push({ id: user.id, addressId: address.id });
  }

  console.log(`  Created ${results.length} customers with home addresses (5 loyalty, 5 non-loyalty).`);

  return {
    arjun: results[0],
    priya: results[1],
    vikram: results[2],
    anjali: results[3],
    karan: results[4],
    sneha: results[5],
    rahul: results[6],
    divya: results[7],
    aditya: results[8],
    pooja: results[9],
  };
}
