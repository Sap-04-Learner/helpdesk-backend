/* eslint-disable @typescript-eslint/no-unsafe-call */
import { Injectable } from '@nestjs/common';
import { PrismaClient } from './generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import * as dotenv from 'dotenv';
dotenv.config();
@Injectable()
export class PrismaService extends PrismaClient {
  constructor() {
    const connectionString = process.env.DATABASE_URL;

    if (
      typeof connectionString !== 'string' ||
      connectionString.trim().length === 0
    ) {
      throw new Error(
        'DATABASE_URL is missing. Add a valid PostgreSQL connection string to your environment.',
      );
    }

    const parsedUrl = new URL(connectionString);
    if (!parsedUrl.password) {
      throw new Error(
        'DATABASE_URL has no password. PostgreSQL SCRAM authentication requires a password in the URL.',
      );
    }

    const adapter = new PrismaPg({ connectionString });
    super({ adapter } as any);
  }

  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
