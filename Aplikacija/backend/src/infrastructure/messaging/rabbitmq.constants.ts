export const RABBITMQ_EXCHANGE = 'drawsync.events';
export const RABBITMQ_PERSISTENCE_QUEUE = 'drawsync.persistence';

export function eventTypeToRoutingKey(eventType: string): string {
  return eventType.toLowerCase().replace(/_/g, '.');
}
