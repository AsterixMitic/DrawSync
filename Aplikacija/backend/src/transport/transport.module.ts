import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { PersistenceModule } from '../infrastructure/persistence.module';
import { RoomApplicationModule } from '../application/client-api/room.application.module';
import { RoundApplicationModule } from '../application/client-api/round.application.module';
import { StrokeApplicationModule } from '../application/client-api/stroke.application.module';
import { GuessApplicationModule } from '../application/client-api/guess.application.module';
import { AuthApplicationModule } from '../application/client-api/auth.application.module';
import { RoomController } from './http/controllers/room.controller';
import { RoundController } from './http/controllers/round.controller';
import { StrokeController } from './http/controllers/stroke.controller';
import { GuessController } from './http/controllers/guess.controller';
import { AuthController } from './http/controllers/auth.controller';
import { JwtAuthGuard } from './http/guards/jwt-auth.guard';

@Module({
  imports: [
    PersistenceModule,
    RoomApplicationModule,
    RoundApplicationModule,
    StrokeApplicationModule,
    GuessApplicationModule,
    AuthApplicationModule
  ],
  controllers: [
    RoomController,
    RoundController,
    StrokeController,
    GuessController,
    AuthController
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard
    }
  ]
})
export class TransportModule {}
