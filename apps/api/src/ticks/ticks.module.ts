import { Module } from '@nestjs/common';

import { WeatherModule } from '../weather/weather.module';
import { RouteTicksController } from './routeTicks.controller';
import { TicksController } from './ticks.controller';
import { TicksService } from './ticks.service';

@Module({
  imports: [WeatherModule],
  controllers: [TicksController, RouteTicksController],
  providers: [TicksService]
})
export class TicksModule {}
