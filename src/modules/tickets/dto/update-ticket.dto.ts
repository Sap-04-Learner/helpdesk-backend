import { PartialType } from '@nestjs/mapped-types';
import { CreateTicketDto } from './create-ticket.dto';
import { IsEnum, IsOptional, ValidateNested } from 'class-validator';
import { TicketStatus } from '../../../generated/prisma/client.js';
import { Type } from 'class-transformer';
import { AssetIssueDto } from './asset-ticket.dto';

export class UpdateTicketDto extends PartialType(CreateTicketDto) {
  @IsEnum(TicketStatus)
  @IsOptional()
  status?: TicketStatus;

  @IsOptional()
  @ValidateNested()
  @Type(() => AssetIssueDto)
  assetIssue?: AssetIssueDto | null;
}
