import { IsEnum, IsOptional, IsString } from 'class-validator';
import { AssetStatus, AssetType } from 'src/generated/prisma/enums';

export class CreateAssetDto {
  @IsString()
  serialNumber: string;

  @IsString()
  assetName: string;

  @IsEnum(AssetType)
  assetType: AssetType;

  @IsOptional()
  @IsEnum(AssetStatus)
  assetStatus?: AssetStatus;

  @IsOptional()
  @IsString()
  assignedToId?: string;
}
