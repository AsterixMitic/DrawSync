import { generateUUID } from "src/shared/utils/uuid.util";

export abstract class DomainEvent {
  public readonly eventId: string;
  public readonly occurredAt: Date;
  public readonly eventType: string;

  constructor(eventType: string) {
    this.eventId = generateUUID();
    this.occurredAt = new Date();
    this.eventType = eventType;
  }

  abstract toPayload(): Record<string, any>;
}