import { DomainEvent } from "../events/base.event";

export interface IEventPublisherPort {
  publish(event: DomainEvent): Promise<void>;
  publishMany(events: DomainEvent[]): Promise<void>;
}