import { Controller, Logger } from '@nestjs/common';
import { Ctx, EventPattern, Payload, RmqContext } from '@nestjs/microservices';
import { StrokeEventHandler } from '../event-handlers/stroke-event.handler.js';
import { GuessEventHandler } from '../event-handlers/guess-event.handler.js';
import { RoundEventHandler } from '../event-handlers/round-event.handler.js';
import { RoomEventHandler } from '../event-handlers/room-event.handler.js';
import { ScoreEventHandler } from '../event-handlers/score-event.handler.js';

interface EventMessage {
  eventId: string;
  eventType: string;
  occurredAt: string;
  payload: Record<string, any>;
}

@Controller()
export class PersistenceConsumer {
  private readonly logger = new Logger(PersistenceConsumer.name);

  constructor(
    private readonly strokeHandler: StrokeEventHandler,
    private readonly guessHandler: GuessEventHandler,
    private readonly roundHandler: RoundEventHandler,
    private readonly roomHandler: RoomEventHandler,
    private readonly scoreHandler: ScoreEventHandler,
  ) {}

  @EventPattern('drawsync.persistence')
  async handleEvent(
    @Payload() message: EventMessage,
    @Ctx() context: RmqContext,
  ): Promise<void> {
    const channel = context.getChannelRef();
    const originalMsg = context.getMessage();

    try {
      this.logger.log(
        `Processing event: ${message.eventType} (${message.eventId})`,
      );

      switch (message.eventType) {
        case 'STROKE_APPLIED':
          await this.strokeHandler.handleStrokeApplied(message.payload);
          break;
        case 'STROKE_UNDONE':
          await this.strokeHandler.handleStrokeUndone(message.payload);
          break;
        case 'CANVAS_CLEARED':
          await this.strokeHandler.handleCanvasCleared(message.payload);
          break;
        case 'GUESS_SUBMITTED':
          await this.guessHandler.handleGuessSubmitted(message.payload);
          break;
        case 'CORRECT_GUESS':
          await this.scoreHandler.handleCorrectGuess(message.payload);
          break;
        case 'ROUND_STARTED':
          await this.roundHandler.handleRoundStarted(message.payload);
          break;
        case 'ROUND_COMPLETED':
          await this.roundHandler.handleRoundCompleted(message.payload);
          break;
        case 'PLAYER_JOINED':
          await this.roomHandler.handlePlayerJoined(message.payload);
          break;
        case 'PLAYER_LEFT':
          await this.roomHandler.handlePlayerLeft(message.payload);
          break;
        case 'ROOM_CREATED':
        case 'ROOM_DELETED':
        case 'ROOM_OWNER_CHANGED':
        case 'GAME_STARTED':
        case 'DRAWER_CHANGED':
        case 'USER_REGISTERED':
          this.logger.log(
            `Event ${message.eventType} acknowledged (persisted by API)`,
          );
          break;
        default:
          this.logger.warn(`Unknown event type: ${message.eventType}`);
      }

      channel.ack(originalMsg);
    } catch (error) {
      this.logger.error(
        `Failed to process event ${message.eventType}: ${error}`,
      );
      channel.nack(originalMsg, false, true);
    }
  }
}
