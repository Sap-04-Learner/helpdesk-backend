/* eslint-disable @typescript-eslint/no-unsafe-call */
import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUrl,
} from 'class-validator';
import { Department, Role, TicketPriority } from 'src/generated/prisma/client';

// Types for our service inputs
export class CreateTicketDto {
  @IsString()
  @IsNotEmpty({ message: 'Ticket title cannot be empty' })
  title: string;

  @IsString()
  @IsNotEmpty()
  summary: string;

  @IsEnum(Department, { message: 'Invalid department specified' })
  department: Department;

  @IsOptional()
  @IsEnum(TicketPriority)
  priority?: TicketPriority;

  @IsOptional()
  @IsUrl({}, { message: 'Image must be a valid URL' })
  imageUrl?: string;
}

// User object passed from your Auth Middleware
export interface CurrentUser {
  id: string;
  role: Role;
}
