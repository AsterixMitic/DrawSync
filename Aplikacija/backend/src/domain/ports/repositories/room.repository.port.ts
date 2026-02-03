import { Room } from '../../models';
import { RoomStatus } from '../../enums';

export interface IRoomRepositoryPort {
  findById(id: string): Promise<Room | null>;
  findByIdWithPlayers(id: string): Promise<Room | null>;
  findByIdWithRounds(id: string): Promise<Room | null>;
  findByIdFull(id: string): Promise<Room | null>;
  findByStatus(status: RoomStatus): Promise<Room[]>;
  findAvailableRooms(): Promise<Room[]>;
  exists(id: string): Promise<boolean>;
}