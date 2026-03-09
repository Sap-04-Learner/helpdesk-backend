// assign-asset.dto.ts
import { IsString, IsNotEmpty } from 'class-validator';

export class AssignAssetDto {
  @IsString()
  @IsNotEmpty()
  assignedById: string;

  @IsString()
  @IsNotEmpty()
  assignedToId: string;
}
