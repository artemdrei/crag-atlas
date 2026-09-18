import { Controller, Get } from '@nestjs/common';
import { ApiOkResponse } from '@nestjs/swagger';

import { RegionsService } from './regions.service';
import { RegionDto } from './regions.types';

@Controller('regions')
export class RegionsController {
  constructor(private readonly regionsService: RegionsService) {}

  @Get()
  @ApiOkResponse({ type: RegionDto, isArray: true })
  findAll(): RegionDto[] {
    return this.regionsService.findAll();
  }
}
