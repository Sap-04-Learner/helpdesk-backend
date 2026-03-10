import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUrl,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { Department, TicketPriority } from 'src/generated/prisma/client';
import { AssetIssueDto } from './asset-ticket.dto';

export enum TicketIssueTypeDto {
  GENERAL = 'GENERAL',
  ASSET_REQUEST = 'ASSET_REQUEST',
  ASSET_PROBLEM = 'ASSET_PROBLEM',
}

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

  @IsOptional()
  @IsEnum(TicketIssueTypeDto)
  issueType?: TicketIssueTypeDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => AssetIssueDto)
  assetIssue?: AssetIssueDto | null;

  @IsString()
  @IsNotEmpty()
  createdById: string;

  @IsString()
  @IsOptional()
  assignedToId?: string;
}
