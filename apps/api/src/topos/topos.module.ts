import { Module } from '@nestjs/common';

import { RouteLineController } from './routeLine.controller';
import { RouteLinesService } from './routeLines.service';
import { TopoController } from './topo.controller';
import { ToposController } from './topos.controller';
import { ToposService } from './topos.service';

@Module({
  controllers: [ToposController, TopoController, RouteLineController],
  providers: [ToposService, RouteLinesService]
})
export class ToposModule {}
