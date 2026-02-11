import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
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
import { PasswordHasherAdapter } from './adapters/password-hasher.adapter';
import { TokenProviderAdapter } from './adapters/token-provider.adapter';
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
import { SaveUserOperation } from './operations/user/save-user.operation';
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
    ]),
    JwtModule.register({
      secret: process.env.JWT_SECRET ?? 'drawsync-dev-secret',
      signOptions: { expiresIn: '24h' }
    })
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
    SaveUserOperation,
    PasswordHasherAdapter,
    TokenProviderAdapter,
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
      provide: 'IStrokeEventRepositoryPort',
      useClass: StrokeEventRepository
    },
    {
      provide: 'IEventPublisherPort',
      useClass: EventPublisherAdapter
    },
    {
      provide: 'ISharedStatePort',
      useClass: SharedStateAdapter
    },
    {
      provide: 'ISaveRoomOperationPort',
      useClass: SaveRoomOperation
    },
    {
      provide: 'ISavePlayerOperationPort',
      useClass: SavePlayerOperation
    },
    {
      provide: 'IRemovePlayerOperationPort',
      useClass: RemovePlayerOperation
    },
    {
      provide: 'IDeleteRoomOperationPort',
      useClass: DeleteRoomOperation
    },
    {
      provide: 'ISaveRoundOperationPort',
      useClass: SaveRoundOperation
    },
    {
      provide: 'IUpdateRoundStatusOperationPort',
      useClass: UpdateRoundStatusOperation
    },
    {
      provide: 'ISaveStrokeOperationPort',
      useClass: SaveStrokeOperation
    },
    {
      provide: 'ISaveStrokeEventOperationPort',
      useClass: SaveStrokeEventOperation
    },
    {
      provide: 'ISaveGuessOperationPort',
      useClass: SaveGuessOperation
    },
    {
      provide: 'IUpdatePlayerScoreOperationPort',
      useClass: UpdatePlayerScoreOperation
    },
    {
      provide: 'IUpdateUserScoreOperationPort',
      useClass: UpdateUserScoreOperation
    },
    {
      provide: 'ISaveUserOperationPort',
      useClass: SaveUserOperation
    },
    {
      provide: 'IPasswordHasherPort',
      useClass: PasswordHasherAdapter
    },
    {
      provide: 'ITokenProviderPort',
      useClass: TokenProviderAdapter
    }
  ],
  exports: [
    'IRoomRepositoryPort',
    'IRoundRepositoryPort',
    'IPlayerRepositoryPort',
    'IUserRepositoryPort',
    'IStrokeRepositoryPort',
    'IGuessRepositoryPort',
    'IStrokeEventRepositoryPort',
    'IEventPublisherPort',
    'ISharedStatePort',
    'ISaveRoomOperationPort',
    'ISavePlayerOperationPort',
    'IRemovePlayerOperationPort',
    'IDeleteRoomOperationPort',
    'ISaveRoundOperationPort',
    'IUpdateRoundStatusOperationPort',
    'ISaveStrokeOperationPort',
    'ISaveStrokeEventOperationPort',
    'ISaveGuessOperationPort',
    'IUpdatePlayerScoreOperationPort',
    'IUpdateUserScoreOperationPort',
    'ISaveUserOperationPort',
    'IPasswordHasherPort',
    'ITokenProviderPort',
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
