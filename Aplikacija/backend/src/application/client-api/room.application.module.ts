import { Module } from '@nestjs/common';
import { PersistenceModule } from '../../infrastructure/persistence.module';
import { RoomDomainModule } from '../../domain/api/room.domain.module';
import { RoundDomainModule } from '../../domain/api/round.domain.module';
import { StartGameWorkflow } from '../workflows/start-game.workflow';
import { RoomClientApi } from './room.client-api';

@Module({
  imports: [
    PersistenceModule,
    RoomDomainModule,
    RoundDomainModule
  ],
  providers: [
    StartGameWorkflow,
    RoomClientApi
  ],
  exports: [RoomClientApi]
})
export class RoomApplicationModule {}
