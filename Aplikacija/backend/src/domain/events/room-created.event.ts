import { DomainEvent } from "./base.event";

export class RoomCreatedEvent extends DomainEvent {
  constructor(
    public readonly roomId: string,
    public readonly ownerId: string,
    public readonly roundCount: number,
    public readonly playerMaxCount: number
  ) {
    super('ROOM_CREATED');
  }

  toPayload(): Record<string, any> {
    return {
      roomId: this.roomId,
      ownerId: this.ownerId,
      roundCount: this.roundCount,
      playerMaxCount: this.playerMaxCount
    };
  }
}