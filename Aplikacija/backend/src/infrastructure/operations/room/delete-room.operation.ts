import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RoomEntity } from '../../database/entities';

export interface DeleteRoomInput {
  roomId: string;
}

@Injectable()
export class DeleteRoomOperation {
  constructor(
    @InjectRepository(RoomEntity)
    private readonly roomRepo: Repository<RoomEntity>
  ) {}

  async execute(input: DeleteRoomInput): Promise<void> {
    await this.roomRepo.delete({ id: input.roomId });
  }
}
