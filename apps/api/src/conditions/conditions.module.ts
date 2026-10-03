import { Module } from '@nestjs/common';

import { HorizonModule } from '../horizon/horizon.module';
import { WeatherModule } from '../weather/weather.module';
import { ConditionsController } from './conditions.controller';
import { ConditionsService } from './conditions.service';

@Module({
  imports: [WeatherModule, HorizonModule],
  controllers: [ConditionsController],
  providers: [ConditionsService]
})
export class ConditionsModule {}
