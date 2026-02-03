import { Player } from '../models/player.model';

export interface CreatePlayerPayload {
  roomId: string;
  nickname: string;
}

export abstract class PlayerRepository {
  abstract create(payload: CreatePlayerPayload): Promise<Player>;
  abstract findById(id: string): Promise<Player | null>;
  abstract findByRoom(roomId: string): Promise<Player[]>;
}
