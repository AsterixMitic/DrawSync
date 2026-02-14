import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { Logger } from '@nestjs/common';
import { WorkerModule } from './worker.module.js';

async function bootstrap() {
  const logger = new Logger('Worker');

  const host = process.env.RABBITMQ_HOST ?? 'localhost';
  const port = process.env.RABBITMQ_PORT ?? '5672';
  const user = process.env.RABBITMQ_USER ?? 'guest';
  const password = process.env.RABBITMQ_PASSWORD ?? 'guest';
  const url = `amqp://${user}:${password}@${host}:${port}`;

  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    WorkerModule,
    {
      transport: Transport.RMQ,
      options: {
        urls: [url],
        queue: 'drawsync.persistence',
        queueOptions: { durable: true },
        noAck: false,
      },
    },
  );

  await app.listen();
  logger.log('Worker service is listening on drawsync.persistence queue');
}
bootstrap();
