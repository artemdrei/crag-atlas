import { Injectable } from '@nestjs/common';

import { NotFoundException } from '../common/exceptions/app.exception';
import routesData from './data/routes.json';
import type { RouteDto } from './routes.types';

@Injectable()
export class RoutesService {
  findBySector(sectorId: string): RouteDto[] {
    const routes = routesData.filter((route) => route.sectorId === sectorId);

    if (routes.length === 0) {
      throw new NotFoundException(
        `No routes found for sector "${sectorId}"`,
        'SECTOR_NOT_FOUND'
      );
    }

    return routes as RouteDto[];
  }
}
