import { DomainEvent } from "./base.event";

export class RoomOwnerChangedEvent extends DomainEvent {
  constructor(
    public readonly roomId: string,
    public readonly newOwnerId: string
  ) {
    super('ROOM_OWNER_CHANGED');
  }

  toPayload(): Record<string, any> {
    return {
      roomId: this.roomId,
      newOwnerId: this.newOwnerId
    };
  }
}
