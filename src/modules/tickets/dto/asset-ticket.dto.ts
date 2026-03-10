import { IsIn, IsOptional, IsString } from 'class-validator';
export class AssetIssueDto {
  @IsOptional()
  @IsString()
  assetSerialNumber?: string | null;

  @IsOptional()
  @IsString()
  assetCategory?: string | null;

  @IsOptional()
  @IsIn(['NETWORK', 'SOFTWARE', 'HARDWARE'])
  assetClassification?: 'NETWORK' | 'SOFTWARE' | 'HARDWARE' | null;

  @IsOptional()
  @IsString()
  requestedAssetName?: string | null;
}
