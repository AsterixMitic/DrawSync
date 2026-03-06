import { Provider, Logger } from '@nestjs/common';
import * as amqp from 'amqp-connection-manager';
import type { Channel } from 'amqplib';
import {
  RABBITMQ_EXCHANGE,
  RABBITMQ_PERSISTENCE_QUEUE,
} from './rabbitmq.constants';

export const RABBITMQ_CONNECTION = 'RABBITMQ_CONNECTION';
export const RABBITMQ_CHANNEL = 'RABBITMQ_CHANNEL';

export const RabbitMQProviders: Provider[] = [
  {
    provide: RABBITMQ_CONNECTION,
    useFactory: () => {
      const host = process.env.RABBITMQ_HOST ?? 'localhost';
      const port = process.env.RABBITMQ_PORT ?? '5672';
      const user = process.env.RABBITMQ_USER ?? 'guest';
      const password = process.env.RABBITMQ_PASSWORD ?? 'guest';
      const url = `amqp://${user}:${password}@${host}:${port}`;

      const connection = amqp.connect([url]);
      const logger = new Logger('RabbitMQ');
      connection.on('connect', () => logger.log('Connected to RabbitMQ'));
      connection.on('disconnect', (params) =>
        logger.warn('Disconnected from RabbitMQ', params?.err?.message),
      );
      return connection;
    },
  },
  {
    provide: RABBITMQ_CHANNEL,
    useFactory: (connection: amqp.AmqpConnectionManager) => {
      return connection.createChannel({
        json: true,
        setup: async (ch: Channel) => {
          await ch.assertExchange(RABBITMQ_EXCHANGE, 'topic', {
            durable: true,
          });
          await ch.assertQueue(RABBITMQ_PERSISTENCE_QUEUE, { durable: true });
          await ch.bindQueue(
            RABBITMQ_PERSISTENCE_QUEUE,
            RABBITMQ_EXCHANGE,
            '#',
          );
        },
      });
    },
    inject: [RABBITMQ_CONNECTION],
  },
];
