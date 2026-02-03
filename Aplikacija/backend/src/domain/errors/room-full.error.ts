import { DomainError } from './domain-error';

export class RoomFullError extends DomainError {
  constructor(roomId: string, maxPlayers: number) {
    super(
      `Room ${roomId} is full (max ${maxPlayers} players)`,
      'ROOM_FULL'
    );
  }
}