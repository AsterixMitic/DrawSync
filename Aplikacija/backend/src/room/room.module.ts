import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PlayerService } from '../application/services/player.service';
import { RoomService } from '../application/services/room.service';
import { RoundService } from '../application/services/round.service';
import { RoomsController } from '../api/controllers/rooms.controller';
import { RoundsController } from '../api/controllers/rounds.controller';
import { PlayerRepository } from '../domain/repositories/player.repository';
import { RoomRepository } from '../domain/repositories/room.repository';
import { RoundRepository } from '../domain/repositories/round.repository';
import { PlayerEntity } from '../persistence/entities/player.entity';
import { RoomEntity } from '../persistence/entities/room.entity';
import { RoundEntity } from '../persistence/entities/round.entity';
import { TypeOrmPlayerRepository } from '../persistence/repositories/typeorm-player.repository';
import { TypeOrmRoomRepository } from '../persistence/repositories/typeorm-room.repository';
import { TypeOrmRoundRepository } from '../persistence/repositories/typeorm-round.repository';

@Module({
  imports: [TypeOrmModule.forFeature([RoomEntity, RoundEntity, PlayerEntity])],
  controllers: [RoomsController, RoundsController],
  providers: [
    RoomService,
    RoundService,
    PlayerService,
    { provide: RoomRepository, useClass: TypeOrmRoomRepository },
    { provide: RoundRepository, useClass: TypeOrmRoundRepository },
    { provide: PlayerRepository, useClass: TypeOrmPlayerRepository },
  ],
})
export class RoomModule {}
