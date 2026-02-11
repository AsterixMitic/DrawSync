import { Injectable } from '@nestjs/common';
import {
  Guess,
  Player,
  Room,
  Round,
  Stroke,
  StrokeEvent
} from '../../domain/models';
import {
  DeleteRoomOperation,
  RemovePlayerOperation,
  SaveGuessOperation,
  SavePlayerOperation,
  SaveRoomOperation,
  SaveRoundOperation,
  SaveStrokeEventOperation,
  SaveStrokeOperation
} from '../operations';
import {
  GuessRepository,
  PlayerRepository,
  RoomRepository,
  RoundRepository,
  StrokeEventRepository,
  StrokeRepository
} from '../repositories';

export interface LoadRoomOptions {
  withPlayers?: boolean;
  withRounds?: boolean;
  full?: boolean;
}

export interface LoadRoundOptions {
  withStrokes?: boolean;
  withGuesses?: boolean;
}

@Injectable()
export class BusinessModelPersistence {
  constructor(
    private readonly roomRepo: RoomRepository,
    private readonly roundRepo: RoundRepository,
    private readonly playerRepo: PlayerRepository,
    private readonly strokeRepo: StrokeRepository,
    private readonly strokeEventRepo: StrokeEventRepository,
    private readonly guessRepo: GuessRepository,
    private readonly saveRoomOp: SaveRoomOperation,
    private readonly savePlayerOp: SavePlayerOperation,
    private readonly saveRoundOp: SaveRoundOperation,
    private readonly saveStrokeOp: SaveStrokeOperation,
    private readonly saveStrokeEventOp: SaveStrokeEventOperation,
    private readonly saveGuessOp: SaveGuessOperation,
    private readonly removePlayerOp: RemovePlayerOperation,
    private readonly deleteRoomOp: DeleteRoomOperation
  ) {}

  async loadRoom(roomId: string, options: LoadRoomOptions = {}): Promise<Room | null> {
    if (options.full) {
      return this.roomRepo.findByIdFull(roomId);
    }
    if (options.withRounds) {
      return this.roomRepo.findByIdWithRounds(roomId);
    }
    if (options.withPlayers) {
      return this.roomRepo.findByIdWithPlayers(roomId);
    }
    return this.roomRepo.findById(roomId);
  }

  async loadRound(roundId: string, options: LoadRoundOptions = {}): Promise<Round | null> {
    if (options.withGuesses) {
      return this.roundRepo.findByIdWithGuesses(roundId);
    }
    if (options.withStrokes) {
      return this.roundRepo.findByIdWithStrokes(roundId);
    }
    return this.roundRepo.findById(roundId);
  }

  async loadRoundEventLog(roundId: string): Promise<StrokeEvent[]> {
    return this.strokeEventRepo.findByRoundId(roundId);
  }

  async saveRoom(room: Room): Promise<void> {
    await this.saveRoomOp.execute({ room });
  }

  async savePlayer(player: Player): Promise<void> {
    await this.savePlayerOp.execute({ player });
  }

  async saveRound(round: Round): Promise<void> {
    await this.saveRoundOp.execute({ round });
  }

  async saveStroke(stroke: Stroke): Promise<void> {
    await this.saveStrokeOp.execute({ stroke });
  }

  async saveStrokeEvent(strokeEvent: StrokeEvent): Promise<void> {
    await this.saveStrokeEventOp.execute({ strokeEvent });
  }

  async saveGuess(guess: Guess): Promise<void> {
    await this.saveGuessOp.execute({ guess });
  }

  async removePlayer(playerId: string): Promise<void> {
    await this.removePlayerOp.execute({ playerId });
  }

  async deleteRoom(roomId: string): Promise<void> {
    await this.deleteRoomOp.execute({ roomId });
  }
}
