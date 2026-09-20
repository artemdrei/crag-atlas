import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { CommentsModule } from './comments/comments.module';
import { HealthModule } from './health/health.module';
import { MeModule } from './me/me.module';
import { MediaModule } from './media/media.module';
import { RegionsModule } from './regions/regions.module';
import { RoutesModule } from './routes/routes.module';
import { SectorsModule } from './sectors/sectors.module';
import { TicksModule } from './ticks/ticks.module';
import { ToposModule } from './topos/topos.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    HealthModule,
    MeModule,
    RegionsModule,
    SectorsModule,
    RoutesModule,
    TicksModule,
    ToposModule,
    CommentsModule,
    MediaModule
  ]
})
export class AppModule {}
