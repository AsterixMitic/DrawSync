import { Room } from '../models/room.model';

export interface CreateRoomPayload {
  code: string;
  name: string;
}

export abstract class RoomRepository {
  abstract create(payload: CreateRoomPayload): Promise<Room>;
  abstract findById(id: string): Promise<Room | null>;
}
