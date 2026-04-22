import { Role } from '@prisma/client';
import prisma from '../../src/lib/prisma';
import { hash } from '../../src/lib/password';

export interface CustomerRecord {
  id: string;
  lat: number;
  lng: number;
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
  { name: 'Arjun Mehta', email: 'arjun@example.com', phone: '+919876543210', isLoyalty: true, lat: 12.9716, lng: 77.5946 },
  { name: 'Priya Nair', email: 'priya@example.com', phone: '+919876543211', isLoyalty: true, lat: 12.9352, lng: 77.6245 },
  { name: 'Vikram Singh', email: 'vikram@example.com', phone: '+919876543212', isLoyalty: true, lat: 12.9698, lng: 77.75 },
  { name: 'Anjali Reddy', email: 'anjali@example.com', phone: '+919876543213', isLoyalty: true, lat: 13.0827, lng: 77.5877 },
  { name: 'Karan Kapoor', email: 'karan@example.com', phone: '+919876543214', isLoyalty: true, lat: 12.9279, lng: 77.6271 },
  // Non-loyalty customers
  { name: 'Sneha Joshi', email: 'sneha@example.com', phone: '+919876543215', isLoyalty: false, lat: 13.0012, lng: 77.5552 },
  { name: 'Rahul Gupta', email: 'rahul@example.com', phone: '+919876543216', isLoyalty: false, lat: 12.9263, lng: 77.5539 },
  { name: 'Divya Kumar', email: 'divya@example.com', phone: '+919876543217', isLoyalty: false, lat: 12.9719, lng: 77.6412 },
  { name: 'Aditya Shah', email: 'aditya@example.com', phone: '+919876543218', isLoyalty: false, lat: 13.0358, lng: 77.597 },
  { name: 'Pooja Iyer', email: 'pooja@example.com', phone: '+919876543219', isLoyalty: false, lat: 12.9141, lng: 77.6101 },
] as const;

export async function seedCustomers(): Promise<CustomersResult> {
  const defaultPassword = await hash('Customer@123');

  const created = await prisma.$transaction(
    CUSTOMER_DEFINITIONS.map((def) =>
      prisma.user.create({
        data: {
          email: def.email,
          password: defaultPassword,
          name: def.name,
          phone: def.phone,
          role: Role.CUSTOMER,
          isLoyalty: def.isLoyalty,
        },
      }),
    ),
  );

  console.log(`  Created ${created.length} customers (5 loyalty, 5 non-loyalty).`);

  return {
    arjun: { id: created[0].id, lat: CUSTOMER_DEFINITIONS[0].lat, lng: CUSTOMER_DEFINITIONS[0].lng },
    priya: { id: created[1].id, lat: CUSTOMER_DEFINITIONS[1].lat, lng: CUSTOMER_DEFINITIONS[1].lng },
    vikram: { id: created[2].id, lat: CUSTOMER_DEFINITIONS[2].lat, lng: CUSTOMER_DEFINITIONS[2].lng },
    anjali: { id: created[3].id, lat: CUSTOMER_DEFINITIONS[3].lat, lng: CUSTOMER_DEFINITIONS[3].lng },
    karan: { id: created[4].id, lat: CUSTOMER_DEFINITIONS[4].lat, lng: CUSTOMER_DEFINITIONS[4].lng },
    sneha: { id: created[5].id, lat: CUSTOMER_DEFINITIONS[5].lat, lng: CUSTOMER_DEFINITIONS[5].lng },
    rahul: { id: created[6].id, lat: CUSTOMER_DEFINITIONS[6].lat, lng: CUSTOMER_DEFINITIONS[6].lng },
    divya: { id: created[7].id, lat: CUSTOMER_DEFINITIONS[7].lat, lng: CUSTOMER_DEFINITIONS[7].lng },
    aditya: { id: created[8].id, lat: CUSTOMER_DEFINITIONS[8].lat, lng: CUSTOMER_DEFINITIONS[8].lng },
    pooja: { id: created[9].id, lat: CUSTOMER_DEFINITIONS[9].lat, lng: CUSTOMER_DEFINITIONS[9].lng },
  };
}
