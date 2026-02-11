import { DomainEvent } from "./base.event";

export class DrawerChangedEvent extends DomainEvent {
  constructor(
    public readonly roomId: string,
    public readonly drawerId: string
  ) {
    super('DRAWER_CHANGED');
  }

  toPayload(): Record<string, any> {
    return {
      roomId: this.roomId,
      drawerId: this.drawerId
    };
  }
}
