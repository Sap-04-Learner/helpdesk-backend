import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { AssetsService } from './assets.service';
import { CreateAssetDto } from './dto/create-asset.dto';
import { UpdateAssetDto } from './dto/update-asset.dto';
import { AssignAssetDto } from './dto/assign-asset.dto';
import { FilterAssetDto } from './dto/filter-asset.dto';

@Controller('assets')
export class AssetsController {
  constructor(private readonly assetsService: AssetsService) {}

  @Post()
  create(@Body() dto: CreateAssetDto) {
    return this.assetsService.create(dto);
  }

  // --- "MINE" ROUTE (Must be above /:id) ---
  @Get('mine')
  getMyAssets() {
    // TODO: Extract ID from JWT Auth Guard
    const userId = 'example-user-id';
    return this.assetsService.getMyAssets(userId);
  }

  @Get()
  findAll(@Query() filter: FilterAssetDto) {
    return this.assetsService.findAll(filter);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.assetsService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateAssetDto) {
    return this.assetsService.update(id, dto);
  }

  @Post(':id/assign')
  assign(@Param('id') id: string, @Body() dto: AssignAssetDto) {
    return this.assetsService.assign(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.assetsService.remove(id);
  }
}
