import { Module } from '@nestjs/common';
import { PersistenceModule } from '../../infrastructure/persistence.module';
import { CreateRoomCommand } from '../commands/room/create-room.command';
import { JoinRoomCommand } from '../commands/room/join-room.command';
import { LeaveRoomCommand } from '../commands/room/leave-room.command';
import { StartGameCommand } from '../commands/room/start-game.command';
import { RoomDomainApi } from './room.domain-api';

@Module({
  imports: [PersistenceModule],
  providers: [
    CreateRoomCommand,
    JoinRoomCommand,
    LeaveRoomCommand,
    StartGameCommand,
    RoomDomainApi
  ],
  exports: [RoomDomainApi]
})
export class RoomDomainModule {}
