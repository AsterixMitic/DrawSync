import { Injectable, Logger } from '@nestjs/common';
import { DomainEvent } from '../../domain/events';
import type { IEventPublisherPort } from '../../domain/ports';

@Injectable()
export class EventPublisherAdapter implements IEventPublisherPort {
  private readonly logger = new Logger(EventPublisherAdapter.name);

  async publish(event: DomainEvent): Promise<void> {
    // TODO: Integrate RabbitMQ or another message broker.
    this.logger.debug(`Publishing event: ${event.eventType}`);
  }

  async publishMany(events: DomainEvent[]): Promise<void> {
    for (const event of events) {
      await this.publish(event);
    }
  }
}
