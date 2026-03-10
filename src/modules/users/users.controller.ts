import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Patch,
  Query,
  UseGuards,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from 'src/generated/prisma/enums';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Roles(Role.HR, Role.IT_ADMIN)
  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Roles(Role.HR, Role.IT_SUPPORT, Role.IT_ADMIN)
  @Get()
  findAll(@Query('role') role?: string) {
    return this.usersService.findAll(role);
  }

  @Get('me/profile')
  getMyProfile(@CurrentUser('userId') userId: string) {
    return this.usersService.findOne(userId);
  }

  @Roles(Role.HR, Role.IT_SUPPORT, Role.IT_ADMIN)
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }

  @Roles(Role.HR, Role.IT_ADMIN)
  @Patch(':id/toggle')
  toggleActive(@Param('id') id: string) {
    return this.usersService.toggleActive(id);
  }
}
