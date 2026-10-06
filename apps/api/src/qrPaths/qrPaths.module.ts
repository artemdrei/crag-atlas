import { Module } from '@nestjs/common';

import { QrPathsController } from './qrPaths.controller';
import { QrPathsService } from './qrPaths.service';

@Module({
  controllers: [QrPathsController],
  providers: [QrPathsService]
})
export class QrPathsModule {}
