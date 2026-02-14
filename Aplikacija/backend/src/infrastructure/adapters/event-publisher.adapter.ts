import { Inject, Injectable, Logger } from '@nestjs/common';
import type { ChannelWrapper } from 'amqp-connection-manager';
import { DomainEvent } from '../../domain/events';
import type { IEventPublisherPort } from '../../domain/ports';
import { RABBITMQ_CHANNEL } from '../messaging/rabbitmq-connection.provider';
import {
  RABBITMQ_EXCHANGE,
  eventTypeToRoutingKey,
} from '../messaging/rabbitmq.constants';

@Injectable()
export class EventPublisherAdapter implements IEventPublisherPort {
  private readonly logger = new Logger(EventPublisherAdapter.name);

  constructor(
    @Inject(RABBITMQ_CHANNEL)
    private readonly channel: ChannelWrapper,
  ) {}

  async publish(event: DomainEvent): Promise<void> {
    const routingKey = eventTypeToRoutingKey(event.eventType);
    const message = {
      eventId: event.eventId,
      eventType: event.eventType,
      occurredAt: event.occurredAt.toISOString(),
      payload: event.toPayload(),
    };
    await this.channel.publish(RABBITMQ_EXCHANGE, routingKey, message);
    this.logger.debug(`Published ${event.eventType} -> ${routingKey}`);
  }

  async publishMany(events: DomainEvent[]): Promise<void> {
    for (const event of events) {
      await this.publish(event);
    }
  }
}
