import { DomainEvent } from 'src/domain/events/base.event';
import { Room, Player } from '../../models';
import { Result } from '../base.result';

export interface CreateRoomResultData {
  room: Room;
  player: Player;
  events: DomainEvent[];
}

export type CreateRoomResult = Result<CreateRoomResultData>;