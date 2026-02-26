import { Injectable } from '@nestjs/common';
import { CreateTicketDto, CurrentUser } from './dto/create-ticket.dto';
import {
  AssignTicketDto,
  UpdateTicketStatusDto,
} from './dto/update-ticket.dto';
import {
  Department,
  Prisma,
  PrismaClient,
  Role,
  TicketPriority,
  TicketStatus,
} from 'src/generated/prisma/client';
import { GetTicketsFilterDto } from './dto/filter-ticket.dto';

@Injectable()
export class TicketsService {
  // Inject the Prisma client via constructor for easier testing/mocking
  constructor(private prisma: PrismaClient) {}

  // ==========================================
  // 1. CREATE TICKET
  // ==========================================
  async createTicket(data: CreateTicketDto, currentUser: CurrentUser) {
    // ----------------------------------------------------
    // EDGE CASE 1: Basic Input Validation
    // (Ideally handled by a library like Zod/Joi in the route handler,
    // but good to have a safety net in the service)
    // ----------------------------------------------------
    if (!data.title || data.title.trim().length === 0) {
      throw new Error('Ticket title is required.');
    }
    if (!data.summary || data.summary.trim().length === 0) {
      throw new Error('Ticket summary is required.');
    }
    if (!Object.values(Department).includes(data.department)) {
      throw new Error('Invalid department specified.');
    }

    // ----------------------------------------------------
    // EDGE CASE 2: Validate the User
    // Just because they have a JWT token doesn't mean they
    // still exist in the DB or are currently active.
    // ----------------------------------------------------
    const user = await this.prisma.user.findUnique({
      where: { id: currentUser.id },
      select: { isActive: true }, // Only fetch what we need
    });

    if (!user) {
      throw new Error('User associated with this request does not exist.');
    }

    if (!user.isActive) {
      throw new Error(
        'Your account is currently inactive. You cannot create tickets.',
      );
    }

    // ----------------------------------------------------
    // EDGE CASE 3: Rate Limiting / Spam Prevention (Optional but recommended)
    // Prevent a user from creating 100 tickets in 1 minute.
    // ----------------------------------------------------
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    const recentTicketsCount = await this.prisma.ticket.count({
      where: {
        createdById: currentUser.id,
        createdAt: { gte: fiveMinutesAgo },
      },
    });

    if (recentTicketsCount >= 5) {
      throw new Error(
        'You are creating tickets too quickly. Please wait a few minutes.',
      );
    }

    // ----------------------------------------------------
    // HAPPY PATH: Create the ticket
    // ----------------------------------------------------
    try {
      const newTicket = await this.prisma.ticket.create({
        data: {
          title: data.title.trim(),
          summary: data.summary.trim(),
          department: data.department,
          priority: data.priority || TicketPriority.LOW,
          imageUrl: data.imageUrl,
          createdById: currentUser.id,
        },
        include: {
          createdBy: { select: { name: true, email: true, role: true } },
        },
      });

      return newTicket;
    } catch (error) {
      // EDGE CASE 4: Catching unexpected database errors
      console.error('[TicketService.createTicket] Database Error:', error);
      throw new Error(
        'An unexpected error occurred while creating the ticket. Please try again later.',
      );
    }
  }

  // ==========================================
  // 2. GET TICKETS (WITH ROLE-BASED FILTERING)
  // ==========================================
  async getTickets(
    currentUser: CurrentUser,
    filters: GetTicketsFilterDto = {},
  ) {
    // ----------------------------------------------------
    // EDGE CASE 1: Pagination (Performance & DoS Protection)
    // Never allow fetching ALL tickets at once.
    // Default to page 1, 10 items. Cap max items at 50.
    // ----------------------------------------------------
    const page = Math.max(1, filters.page || 1);
    const limit = Math.min(50, Math.max(1, filters.limit || 10));
    const skip = (page - 1) * limit;

    // ----------------------------------------------------
    // FIXING ESLINT: Strict typing for the Where Clause
    // This guarantees we only query valid schema fields.
    // ----------------------------------------------------
    const whereClause: Prisma.TicketWhereInput = {};

    // Apply basic user-requested filters
    if (filters.status) whereClause.status = filters.status;
    if (filters.priority) whereClause.priority = filters.priority;

    // ----------------------------------------------------
    // EDGE CASE 2: Strict Role-Based Access Control (RBAC)
    // We must ensure that a user passing `department=IT`
    // in the URL cannot bypass their role restrictions.
    // ----------------------------------------------------
    switch (currentUser.role) {
      case Role.EMPLOYEE:
        // Employees CANNOT see other people's tickets, period.
        whereClause.createdById = currentUser.id;
        if (filters.department) whereClause.department = filters.department;
        break;

      case Role.HR:
        // HR sees their own tickets OR any ticket in the HR department
        if (filters.department) {
          if (filters.department === Department.HR) {
            whereClause.department = Department.HR;
          } else {
            // EDGE CASE 3: If HR asks for IT tickets, they only see the ones THEY created.
            whereClause.department = filters.department;
            whereClause.createdById = currentUser.id;
          }
        } else {
          whereClause.OR = [
            { department: Department.HR },
            { createdById: currentUser.id },
          ];
        }
        break;

      case Role.IT:
        // IT sees their own tickets OR any ticket in the IT department
        if (filters.department) {
          if (filters.department === Department.IT) {
            whereClause.department = Department.IT;
          } else {
            // If IT asks for HR tickets, they only see the ones THEY created.
            whereClause.department = filters.department;
            whereClause.createdById = currentUser.id;
          }
        } else {
          whereClause.OR = [
            { department: Department.IT },
            { createdById: currentUser.id },
          ];
        }
        break;

      case Role.ADMIN:
        // Admins have no forced restrictions. Apply department filter if requested.
        if (filters.department) whereClause.department = filters.department;
        break;
    }

    // ----------------------------------------------------
    // DB CALL: Use $transaction to run count and fetch in parallel
    // ----------------------------------------------------
    try {
      const [tickets, totalCount] = await this.prisma.$transaction([
        this.prisma.ticket.findMany({
          where: whereClause,
          skip,
          take: limit,
          orderBy: { createdAt: 'desc' }, // Show newest tickets first
          include: {
            createdBy: { select: { id: true, name: true, email: true } },
            assignedTo: { select: { id: true, name: true } },
          },
        }),
        this.prisma.ticket.count({ where: whereClause }),
      ]);

      return {
        data: tickets,
        meta: {
          total: totalCount,
          page,
          limit,
          totalPages: Math.ceil(totalCount / limit),
        },
      };
    } catch (error) {
      console.error('[TicketService.getTickets] Database Error:', error);
      throw new Error('Failed to fetch tickets. Please try again later.');
    }
  }

  // ==========================================
  // 3. ASSIGN TICKET
  // ==========================================
  async assignTicket(
    ticketId: string,
    data: AssignTicketDto,
    currentUser: CurrentUser,
  ) {
    // ----------------------------------------------------
    // EDGE CASE 1: Basic Role Check
    // Employees cannot assign tickets at all.
    // ----------------------------------------------------
    if (currentUser.role === Role.EMPLOYEE) {
      throw new Error('Employees do not have permission to assign tickets.');
    }

    // Fetch the ticket to check its current state and department
    const ticket = await this.prisma.ticket.findUnique({
      where: { id: ticketId },
    });

    if (!ticket) throw new Error('Ticket not found.');

    // Prevent re-assigning resolved tickets
    if (ticket.status === TicketStatus.RESOLVED) {
      throw new Error(
        'Cannot reassign a resolved ticket. Please reopen it first.',
      );
    }

    // ----------------------------------------------------
    // EDGE CASE 2: Validate the Assignee
    // Ensure the person being assigned exists, is active,
    // and belongs to the correct department.
    // ----------------------------------------------------
    const assignee = await this.prisma.user.findUnique({
      where: { id: data.assigneeId },
      select: { role: true, isActive: true },
    });

    if (!assignee) throw new Error('Target assignee does not exist.');
    if (!assignee.isActive)
      throw new Error('Cannot assign ticket to an inactive user.');

    // HR tickets must go to HR or Admin. IT tickets must go to IT or Admin.
    if (
      ticket.department === Department.HR &&
      assignee.role !== Role.HR &&
      assignee.role !== Role.ADMIN
    ) {
      throw new Error('HR tickets can only be assigned to HR personnel.');
    }
    if (
      ticket.department === Department.IT &&
      assignee.role !== Role.IT &&
      assignee.role !== Role.ADMIN
    ) {
      throw new Error('IT tickets can only be assigned to IT personnel.');
    }

    // ----------------------------------------------------
    // DB CALL: Update Assignment and Auto-Shift Status
    // ----------------------------------------------------
    try {
      return await this.prisma.ticket.update({
        where: { id: ticketId },
        data: {
          assignedToId: data.assigneeId,
          // EDGE CASE 3: Auto-transition status
          // If the ticket was OPEN, picking it up should move it to IN_PROGRESS
          status:
            ticket.status === TicketStatus.OPEN
              ? TicketStatus.IN_PROGRESS
              : ticket.status,
        },
        include: {
          assignedTo: { select: { id: true, name: true, email: true } },
        },
      });
    } catch (error) {
      console.error('[TicketService.assignTicket] Database Error:', error);
      throw new Error('Failed to assign ticket.');
    }
  }

  // ==========================================
  // 4. UPDATE TICKET STATUS
  // ==========================================
  async updateTicketStatus(
    ticketId: string,
    data: UpdateTicketStatusDto,
    currentUser: CurrentUser,
  ) {
    const ticket = await this.prisma.ticket.findUnique({
      where: { id: ticketId },
    });

    if (!ticket) throw new Error('Ticket not found.');

    // ----------------------------------------------------
    // EDGE CASE 4: State Machine Logic
    // You shouldn't be able to resolve a ticket that
    // nobody has investigated (i.e., no assignee).
    // ----------------------------------------------------
    if (data.status === TicketStatus.RESOLVED && !ticket.assignedToId) {
      throw new Error(
        'Cannot resolve a ticket that has not been assigned to anyone.',
      );
    }

    // ----------------------------------------------------
    // EDGE CASE 5: Strict Update Permissions
    // ----------------------------------------------------
    if (currentUser.role === Role.EMPLOYEE) {
      // Employees can only close their OWN tickets (e.g., "Nevermind, I fixed it!")
      if (ticket.createdById !== currentUser.id) {
        throw new Error('You do not have permission to modify this ticket.');
      }
      if (data.status !== TicketStatus.RESOLVED) {
        throw new Error('Employees can only resolve/close their own tickets.');
      }
    } else if (currentUser.role === Role.HR || currentUser.role === Role.IT) {
      // Agents can only update tickets in their specific department
      if (
        (currentUser.role === Role.HR && ticket.department !== Department.HR) ||
        (currentUser.role === Role.IT && ticket.department !== Department.IT)
      ) {
        throw new Error(
          `You do not have permission to update ${ticket.department} tickets.`,
        );
      }
    }
    // Admins bypass the above checks.

    // ----------------------------------------------------
    // DB CALL: Update Status
    // ----------------------------------------------------
    try {
      return await this.prisma.ticket.update({
        where: { id: ticketId },
        data: { status: data.status },
      });
    } catch (error) {
      console.error(
        '[TicketService.updateTicketStatus] Database Error:',
        error,
      );
      throw new Error('Failed to update ticket status.');
    }
  }
}
