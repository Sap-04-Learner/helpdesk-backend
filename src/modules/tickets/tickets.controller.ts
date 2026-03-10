import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
} from '@nestjs/common';
import { TicketsService } from './tickets.service';
import { Role, TicketStatus } from 'src/generated/prisma/enums';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { GetTicketsFilterDto } from './dto/filter-ticket.dto';
import { UpdateTicketDto } from './dto/update-ticket.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('tickets')
export class TicketsController {
  constructor(private readonly ticketsService: TicketsService) {}

  @Post()
  create(
    @Body() createTicketDto: CreateTicketDto,
    @CurrentUser('userId') userId: string,
  ) {
    createTicketDto.createdById = userId;
    return this.ticketsService.create(createTicketDto);
  }

  @Get('mine')
  getMyTickets(@CurrentUser('userId') userId: string) {
    return this.ticketsService.getMyTickets(userId);
  }

  @Roles(Role.HR, Role.IT_SUPPORT, Role.IT_ADMIN)
  @Get()
  findAll(@Query() filterDto: GetTicketsFilterDto) {
    return this.ticketsService.findAll(filterDto);
  }

  @Roles(Role.HR, Role.IT_SUPPORT, Role.IT_ADMIN)
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.ticketsService.findOne(id);
  }

  @Roles(Role.HR, Role.IT_SUPPORT, Role.IT_ADMIN)
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateTicketDto: UpdateTicketDto) {
    return this.ticketsService.update(id, updateTicketDto);
  }

  @Roles(Role.HR, Role.IT_SUPPORT, Role.IT_ADMIN)
  @Patch(':id/status')
  updateStatus(@Param('id') id: string, @Body('status') status: TicketStatus) {
    return this.ticketsService.updateStatus(id, status);
  }

  @Roles(Role.IT_ADMIN)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.ticketsService.remove(id);
  }
}
