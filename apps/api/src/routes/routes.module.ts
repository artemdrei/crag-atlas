import { Module } from '@nestjs/common';

import { RouteController } from './route.controller';
import { RoutesController } from './routes.controller';
import { RoutesService } from './routes.service';

@Module({
  controllers: [RoutesController, RouteController],
  providers: [RoutesService],
  exports: [RoutesService]
})
export class RoutesModule {}
