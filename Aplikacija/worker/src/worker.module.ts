import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { typeOrmConfig } from './database/typeorm.config.js';
import {
  GuessEntity,
  PlayerEntity,
  RoomEntity,
  RoundEntity,
  StrokeEntity,
  StrokeEventEntity,
  UserEntity,
} from './database/entities/index.js';
import { PersistenceConsumer } from './consumers/persistence.consumer.js';
import { StrokeEventHandler } from './event-handlers/stroke-event.handler.js';
import { GuessEventHandler } from './event-handlers/guess-event.handler.js';
import { RoundEventHandler } from './event-handlers/round-event.handler.js';
import { RoomEventHandler } from './event-handlers/room-event.handler.js';
import { ScoreEventHandler } from './event-handlers/score-event.handler.js';

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
      GuessEntity,
    ]),
  ],
  providers: [
    PersistenceConsumer,
    StrokeEventHandler,
    GuessEventHandler,
    RoundEventHandler,
    RoomEventHandler,
    ScoreEventHandler,
  ],
})
export class WorkerModule {}
