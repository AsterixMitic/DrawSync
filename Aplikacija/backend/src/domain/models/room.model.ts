import { Player } from './player.model';
import { Round } from './round.model';
import { RoomStatus } from './statuses';

export interface Room {
  id: string;
  code: string;
  name: string;
  status: RoomStatus;
  createdAt: Date;
  updatedAt: Date;
  rounds?: Round[];
  players?: Player[];
}
