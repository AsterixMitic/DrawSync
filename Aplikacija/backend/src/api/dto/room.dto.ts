import { RoomStatus } from '../../domain/models/statuses';
import { PlayerDto } from './player.dto';
import { RoundDto } from './round.dto';

export interface RoomDto {
  id: string;
  code: string;
  name: string;
  status: RoomStatus;
  createdAt: Date;
  updatedAt: Date;
  rounds?: RoundDto[];
  players?: PlayerDto[];
}
