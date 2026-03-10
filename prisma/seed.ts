import { PrismaClient } from '../src/generated/prisma/client';
import { Role, Department, AssetType } from '../src/generated/prisma/enums';

import { PrismaPg } from '@prisma/adapter-pg';
import * as argon2 from 'argon2';
import 'dotenv/config';

// Set up the exact same adapter logic from your prisma.service.ts
const connectionString =
  process.env.DATABASE_URL ||
  'postgresql://postgres:guna@localhost:5432/helpdesk';

const adapter = new PrismaPg({ connectionString } as any);

// Pass the adapter into the constructor to satisfy TypeScript!
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('Starting database seeding...');

  // 1. Create a Master IT Admin
  const adminPassword = await argon2.hash('Admin123!');
  const admin = await prisma.user.upsert({
    where: { email: 'admin@company.com' },
    update: {},
    create: {
      name: 'Master Admin',
      email: 'admin@company.com',
      password: adminPassword,
      role: Role.IT_ADMIN,
    },
  });
  console.log(`Created IT_ADMIN: ${admin.email}`);

  // Create a standard Employee
  const employeePassword = await argon2.hash('Employee123!');
  const employee = await prisma.user.upsert({
    where: { email: 'john@company.com' },
    update: {},
    create: {
      name: 'John Doe',
      email: 'john@company.com',
      password: employeePassword,
      role: Role.EMPLOYEE,
    },
  });
  console.log(`Created EMPLOYEE: ${employee.email}`);

  // Create a Dummy Ticket
  const ticket = await prisma.ticket.create({
    data: {
      title: 'Cannot access email',
      summary: 'Outlook keeps crashing on startup.',
      department: Department.IT,
      priority: 'HIGH',
      createdById: employee.id,
    },
  });
  console.log(`Created dummy ticket: ${ticket.title}`);

  // Create a Dummy Asset
  const asset = await prisma.asset.create({
    data: {
      serialNumber: 'AST-MAC-001',
      assetName: 'MacBook Pro M3',
      assetType: AssetType.HARDWARE,
    },
  });
  console.log(`Created dummy asset: ${asset.serialNumber}`);

  console.log('Seeding finished successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
