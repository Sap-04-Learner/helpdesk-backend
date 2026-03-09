import { IsEnum, IsOptional, IsString, IsInt, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { AssetStatus, AssetType } from 'src/generated/prisma/enums';

export class FilterAssetDto {
  @IsOptional()
  @IsEnum(AssetStatus)
  assetStatus?: AssetStatus;

  @IsOptional()
  @IsEnum(AssetType)
  assetType?: AssetType;

  @IsOptional()
  @IsString()
  assignedToId?: string;

  // Added pagination for Next.js tables
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number;
}
