import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';

import { AdminsModule } from './admins/admins.module';
import { CommentsModule } from './comments/comments.module';
import { ConditionsModule } from './conditions/conditions.module';
import { FeedbackModule } from './feedback/feedback.module';
import { HealthModule } from './health/health.module';
import { HorizonModule } from './horizon/horizon.module';
import { MeModule } from './me/me.module';
import { MediaModule } from './media/media.module';
import { QrPathsModule } from './qrPaths/qrPaths.module';
import { RegionsModule } from './regions/regions.module';
import { RoutesModule } from './routes/routes.module';
import { SearchModule } from './search/search.module';
import { SectorsModule } from './sectors/sectors.module';
import { TicksModule } from './ticks/ticks.module';
import { ToposModule } from './topos/topos.module';
import { UsersModule } from './users/users.module';
import { WeatherModule } from './weather/weather.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ThrottlerModule.forRoot([{ ttl: 60_000, limit: 5 }]),
    HealthModule,
    AdminsModule,
    MeModule,
    RegionsModule,
    SectorsModule,
    QrPathsModule,
    RoutesModule,
    SearchModule,
    TicksModule,
    ToposModule,
    UsersModule,
    CommentsModule,
    MediaModule,
    WeatherModule,
    HorizonModule,
    ConditionsModule,
    FeedbackModule
  ]
})
export class AppModule {}
