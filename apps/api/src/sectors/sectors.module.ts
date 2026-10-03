import { Module } from '@nestjs/common';

import { HorizonModule } from '../horizon/horizon.module';
import { SectorController } from './sector.controller';
import { SectorsController } from './sectors.controller';
import { SectorsService } from './sectors.service';

@Module({
  imports: [HorizonModule],
  controllers: [SectorsController, SectorController],
  providers: [SectorsService]
})
export class SectorsModule {}
