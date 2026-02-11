import { DomainEvent } from "./base.event";

export class GameStartedEvent extends DomainEvent {
  constructor(
    public readonly roomId: string,
    public readonly playerCount: number
  ) {
    super('GAME_STARTED');
  }

  toPayload(): Record<string, any> {
    return {
      roomId: this.roomId,
      playerCount: this.playerCount
    };
  }
}
