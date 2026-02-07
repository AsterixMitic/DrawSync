import { DomainEvent } from "./base.event";

export class PlayerLeftEvent extends DomainEvent {
  constructor(
    public readonly roomId: string,
    public readonly playerId: string,
    public readonly playerCount: number,
    public readonly wasOwner: boolean
  ) {
    super('PLAYER_LEFT');
  }

  toPayload(): Record<string, any> {
    return {
      roomId: this.roomId,
      playerId: this.playerId,
      playerCount: this.playerCount,
      wasOwner: this.wasOwner
    };
  }
}
