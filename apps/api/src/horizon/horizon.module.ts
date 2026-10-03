import { Module } from '@nestjs/common';

import { HorizonController } from './horizon.controller';
import { HorizonService } from './horizon.service';

@Module({
  controllers: [HorizonController],
  providers: [HorizonService],
  exports: [HorizonService]
})
export class HorizonModule {}
