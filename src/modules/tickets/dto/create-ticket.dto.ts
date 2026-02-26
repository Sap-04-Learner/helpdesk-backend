import { Department, Role, TicketPriority } from 'src/generated/prisma/client';

// Types for our service inputs
export class CreateTicketDto {
  title: string;
  summary: string;
  department: Department;
  priority?: TicketPriority;
  imageUrl?: string;
}

// User object passed from your Auth Middleware
export interface CurrentUser {
  id: string;
  role: Role;
}
