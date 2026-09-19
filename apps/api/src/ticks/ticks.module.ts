import { Module } from '@nestjs/common';

import { RoutesModule } from '../routes/routes.module';
import { SectorsModule } from '../sectors/sectors.module';
import { TicksController } from './ticks.controller';
import { TicksService } from './ticks.service';

@Module({
  imports: [RoutesModule, SectorsModule],
  controllers: [TicksController],
  providers: [TicksService]
})
export class TicksModule {}
