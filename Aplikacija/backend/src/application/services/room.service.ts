import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { Room } from '../../domain/models/room.model';
import { CreateRoomPayload, RoomRepository } from '../../domain/repositories/room.repository';

@Injectable()
export class RoomService {
  private static readonly ROOM_CODE_CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

  constructor(private readonly roomRepository: RoomRepository) {}

  async createRoom(payload: { name: string; code?: string }): Promise<Room> {
    const name = payload.name?.trim();
    if (!name) {
      throw new BadRequestException('Naziv sobe je obavezan.');
    }

    const code = payload.code?.trim() || this.generateRoomCode();
    const createPayload: CreateRoomPayload = {
      name,
      code,
    };
    return this.roomRepository.create(createPayload);
  }

  async getRoom(id: string): Promise<Room> {
    const room = await this.roomRepository.findById(id);
    if (!room) {
      throw new NotFoundException('Soba nije pronađena.');
    }
    return room;
  }

  private generateRoomCode(length = 4): string {
    let code = '';
    for (let i = 0; i < length; i += 1) {
      const index = Math.floor(Math.random() * RoomService.ROOM_CODE_CHARS.length);
      code += RoomService.ROOM_CODE_CHARS[index];
    }
    return code;
  }
}
