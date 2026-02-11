import { DomainEvent } from "./base.event";

export class RoomDeletedEvent extends DomainEvent {
  constructor(public readonly roomId: string) {
    super('ROOM_DELETED');
  }

  toPayload(): Record<string, any> {
    return { roomId: this.roomId };
  }
}
