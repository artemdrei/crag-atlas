import { Module } from '@nestjs/common';

import { RouteController } from './route.controller';
import { RoutesController } from './routes.controller';
import { RoutesService } from './routes.service';

@Module({
  controllers: [RoutesController, RouteController],
  providers: [RoutesService]
})
export class RoutesModule {}
