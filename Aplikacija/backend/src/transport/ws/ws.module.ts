import { Module } from '@nestjs/common';
import { PersistenceModule } from '../../infrastructure/persistence.module';
import { RoomApplicationModule } from '../../application/client-api/room.application.module';
import { RoundApplicationModule } from '../../application/client-api/round.application.module';
import { StrokeApplicationModule } from '../../application/client-api/stroke.application.module';
import { GuessApplicationModule } from '../../application/client-api/guess.application.module';
import { GameGateway } from './game.gateway';
import { WsAuthGuard } from './ws-auth.guard';
import { RoundTimerService } from './round-timer.service';
import { WordBankService } from '../../domain/services/word-bank.service';

@Module({
  imports: [
    PersistenceModule,
    RoomApplicationModule,
    RoundApplicationModule,
    StrokeApplicationModule,
    GuessApplicationModule,
  ],
  providers: [GameGateway, WsAuthGuard, RoundTimerService, WordBankService],
  exports: [GameGateway],
})
export class WsModule {}
