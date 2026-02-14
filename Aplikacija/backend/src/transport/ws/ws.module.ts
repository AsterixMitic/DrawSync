import { Module } from '@nestjs/common';
import { PersistenceModule } from '../../infrastructure/persistence.module';
import { RoomApplicationModule } from '../../application/client-api/room.application.module';
import { RoundApplicationModule } from '../../application/client-api/round.application.module';
import { StrokeApplicationModule } from '../../application/client-api/stroke.application.module';
import { GuessApplicationModule } from '../../application/client-api/guess.application.module';
import { GameGateway } from './game.gateway';
import { WsAuthGuard } from './ws-auth.guard';

@Module({
  imports: [
    PersistenceModule,
    RoomApplicationModule,
    RoundApplicationModule,
    StrokeApplicationModule,
    GuessApplicationModule,
  ],
  providers: [GameGateway, WsAuthGuard],
  exports: [GameGateway],
})
export class WsModule {}
