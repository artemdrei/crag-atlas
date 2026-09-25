import { Module } from '@nestjs/common';

import { RouteTicksController } from './routeTicks.controller';
import { TicksController } from './ticks.controller';
import { TicksService } from './ticks.service';

@Module({
  controllers: [TicksController, RouteTicksController],
  providers: [TicksService]
})
export class TicksModule {}
