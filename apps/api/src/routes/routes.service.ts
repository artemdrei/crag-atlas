import { Injectable } from '@nestjs/common';

import { NotFoundException } from '../common/exceptions/app.exception';
import routesData from './data/routes.json';
import type { RouteDto } from './routes.types';

@Injectable()
export class RoutesService {
  findBySector(idSector: string): RouteDto[] {
    const routes = routesData.filter((route) => route.idSector === idSector);

    if (routes.length === 0) {
      throw new NotFoundException(
        `No routes found for sector "${idSector}"`,
        'SECTOR_NOT_FOUND'
      );
    }

    return routes as RouteDto[];
  }

  findOne(idRoute: string): RouteDto {
    const route = routesData.find((r) => r.id === idRoute);

    if (!route) {
      throw new NotFoundException(
        `Route "${idRoute}" not found`,
        'ROUTE_NOT_FOUND'
      );
    }

    return route as RouteDto;
  }
}
