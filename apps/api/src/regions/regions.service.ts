import { Injectable } from '@nestjs/common';

import regionsData from './data/regions.json';
import type { RegionDto } from './regions.types';

@Injectable()
export class RegionsService {
  findAll(): RegionDto[] {
    return regionsData;
  }
}
