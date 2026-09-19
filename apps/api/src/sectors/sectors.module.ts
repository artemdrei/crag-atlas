import { Module } from '@nestjs/common';

import { SectorController } from './sector.controller';
import { SectorsController } from './sectors.controller';
import { SectorsService } from './sectors.service';

@Module({
  controllers: [SectorsController, SectorController],
  providers: [SectorsService]
})
export class SectorsModule {}
