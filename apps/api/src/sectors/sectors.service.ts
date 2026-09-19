import { Injectable } from '@nestjs/common';

import { NotFoundException } from '../common/exceptions/app.exception';
import sectorsData from './data/sectors.json';
import type { SectorDto } from './sectors.types';

@Injectable()
export class SectorsService {
  findByRegion(idRegion: string): SectorDto[] {
    const sectors = sectorsData.filter(
      (sector) => sector.idRegion === idRegion
    );

    if (sectors.length === 0) {
      throw new NotFoundException(
        `No sectors found for region "${idRegion}"`,
        'REGION_NOT_FOUND'
      );
    }

    return sectors;
  }
}
