import { Controller, Get } from '@nestjs/common';

import { RegionsService } from './regions.service';
import type { RegionDto } from './regions.types';

@Controller('regions')
export class RegionsController {
  constructor(private readonly regionsService: RegionsService) {}

  @Get()
  findAll(): RegionDto[] {
    return this.regionsService.findAll();
  }
}
