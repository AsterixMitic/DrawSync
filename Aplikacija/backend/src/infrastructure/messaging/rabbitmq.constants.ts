export const RABBITMQ_EXCHANGE = 'drawsync.events';
export const RABBITMQ_PERSISTENCE_QUEUE = 'drawsync.persistence';
export const RABBITMQ_DLX = 'drawsync.dlx';
export const RABBITMQ_DLQ = 'drawsync.persistence.dead';

export function eventTypeToRoutingKey(eventType: string): string {
  return eventType.toLowerCase().replace(/_/g, '.');
}
