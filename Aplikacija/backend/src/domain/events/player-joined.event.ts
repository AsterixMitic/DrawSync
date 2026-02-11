import { DomainEvent } from "./base.event";

export class PlayerJoinedEvent extends DomainEvent {
  constructor(
    public readonly roomId: string,
    public readonly playerId: string,
    public readonly userId: string,
    public readonly playerCount: number
  ) {
    super('PLAYER_JOINED');
  }

  toPayload(): Record<string, any> {
    return {
      roomId: this.roomId,
      playerId: this.playerId,
      userId: this.userId,
      playerCount: this.playerCount
    };
  }
}