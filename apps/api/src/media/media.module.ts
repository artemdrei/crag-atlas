import { Module } from '@nestjs/common';

import { MediaController } from './media.controller';
import { MediaService } from './media.service';
import { VideosController } from './videos.controller';
import { VideosService } from './videos.service';

@Module({
  controllers: [MediaController, VideosController],
  providers: [MediaService, VideosService]
})
export class MediaModule {}
