import { Injectable } from '@nestjs/common';

import { NotFoundException } from '../common/exceptions/app.exception';
import sectorsData from './data/sectors.json';
import type { SectorDto } from './sectors.types';

@Injectable()
export class SectorsService {
  findByRegion(regionId: string): SectorDto[] {
    const sectors = sectorsData.filter(
      (sector) => sector.regionId === regionId
    );

    if (sectors.length === 0) {
      throw new NotFoundException(
        `No sectors found for region "${regionId}"`,
        'REGION_NOT_FOUND'
      );
    }

    return sectors;
  }
}
