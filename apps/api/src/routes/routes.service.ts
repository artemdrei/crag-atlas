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

  findOne(routeId: string): RouteDto {
    const route = routesData.find((r) => r.id === routeId);

    if (!route) {
      throw new NotFoundException(
        `Route "${routeId}" not found`,
        'ROUTE_NOT_FOUND'
      );
    }

    return route as RouteDto;
  }
}
