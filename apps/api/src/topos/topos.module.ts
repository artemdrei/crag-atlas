import { Module } from '@nestjs/common';

import { ToposController } from './topos.controller';
import { ToposService } from './topos.service';

@Module({
  controllers: [ToposController],
  providers: [ToposService]
})
export class ToposModule {}
