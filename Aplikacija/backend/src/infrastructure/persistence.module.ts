import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  GuessEntity,
  PlayerEntity,
  RoomEntity,
  RoundEntity,
  StrokeEntity,
  StrokeEventEntity,
  UserEntity
} from './database/entities';
import { typeOrmConfig } from './database/typeorm.config';
import {
  GuessMapper,
  PlayerMapper,
  RoomMapper,
  RoundMapper,
  StrokeEventMapper,
  StrokeMapper,
  UserMapper
} from './mappers';
import {
  GuessRepository,
  PlayerRepository,
  RoomRepository,
  RoundRepository,
  StrokeEventRepository,
  StrokeRepository,
  UserRepository
} from './repositories';
import { EventPublisherAdapter } from './adapters/event-publisher.adapter';
import { SharedStateAdapter } from './adapters/shared-state.adapter';
import { SaveRoomOperation } from './operations/room/save-room.operation';
import { SavePlayerOperation } from './operations/room/save-player.operation';
import { RemovePlayerOperation } from './operations/room/remove-player.operation';
import { DeleteRoomOperation } from './operations/room/delete-room.operation';
import { SaveRoundOperation } from './operations/round/save-round.operation';
import { UpdateRoundStatusOperation } from './operations/round/update-round-status.operation';
import { SaveStrokeOperation } from './operations/stroke/save-stroke.operation';
import { SaveStrokeEventOperation } from './operations/stroke/save-stroke-event.operation';
import { SaveGuessOperation } from './operations/guess/save-guess.operation';
import { UpdatePlayerScoreOperation } from './operations/score/update-player-score.operation';
import { UpdateUserScoreOperation } from './operations/score/update-user-score.operation';
import { BusinessModelPersistence } from './data-layer/business-model.persistence';

@Module({
  imports: [
    TypeOrmModule.forRoot(typeOrmConfig),
    TypeOrmModule.forFeature([
      UserEntity,
      PlayerEntity,
      RoomEntity,
      RoundEntity,
      StrokeEntity,
      StrokeEventEntity,
      GuessEntity
    ])
  ],
  providers: [
    UserMapper,
    PlayerMapper,
    RoomMapper,
    RoundMapper,
    StrokeMapper,
    StrokeEventMapper,
    GuessMapper,
    RoomRepository,
    RoundRepository,
    PlayerRepository,
    UserRepository,
    StrokeRepository,
    StrokeEventRepository,
    GuessRepository,
    SaveRoomOperation,
    SavePlayerOperation,
    RemovePlayerOperation,
    DeleteRoomOperation,
    SaveRoundOperation,
    UpdateRoundStatusOperation,
    SaveStrokeOperation,
    SaveStrokeEventOperation,
    SaveGuessOperation,
    UpdatePlayerScoreOperation,
    UpdateUserScoreOperation,
    BusinessModelPersistence,
    {
      provide: 'IRoomRepositoryPort',
      useClass: RoomRepository
    },
    {
      provide: 'IRoundRepositoryPort',
      useClass: RoundRepository
    },
    {
      provide: 'IPlayerRepositoryPort',
      useClass: PlayerRepository
    },
    {
      provide: 'IUserRepositoryPort',
      useClass: UserRepository
    },
    {
      provide: 'IStrokeRepositoryPort',
      useClass: StrokeRepository
    },
    {
      provide: 'IGuessRepositoryPort',
      useClass: GuessRepository
    },
    {
      provide: 'IEventPublisherPort',
      useClass: EventPublisherAdapter
    },
    {
      provide: 'ISharedStatePort',
      useClass: SharedStateAdapter
    }
  ],
  exports: [
    'IRoomRepositoryPort',
    'IRoundRepositoryPort',
    'IPlayerRepositoryPort',
    'IUserRepositoryPort',
    'IStrokeRepositoryPort',
    'IGuessRepositoryPort',
    'IEventPublisherPort',
    'ISharedStatePort',
    SaveRoomOperation,
    SavePlayerOperation,
    RemovePlayerOperation,
    DeleteRoomOperation,
    SaveRoundOperation,
    UpdateRoundStatusOperation,
    SaveStrokeOperation,
    SaveStrokeEventOperation,
    SaveGuessOperation,
    UpdatePlayerScoreOperation,
    UpdateUserScoreOperation,
    BusinessModelPersistence
  ]
})
export class PersistenceModule {}
