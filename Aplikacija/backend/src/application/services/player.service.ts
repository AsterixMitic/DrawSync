import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { Player } from '../../domain/models/player.model';
import { PlayerRepository } from '../../domain/repositories/player.repository';
import { RoomRepository } from '../../domain/repositories/room.repository';

@Injectable()
export class PlayerService {
  constructor(
    private readonly roomRepository: RoomRepository,
    private readonly playerRepository: PlayerRepository
  ) {}

  async createPlayer(roomId: string, payload: { nickname: string }): Promise<Player> {
    const room = await this.roomRepository.findById(roomId);
    if (!room) {
      throw new NotFoundException('Soba nije pronađena.');
    }

    const nickname = payload.nickname?.trim();
    if (!nickname) {
      throw new BadRequestException('Nadimak je obavezan.');
    }

    return this.playerRepository.create({ roomId, nickname });
  }

  async listPlayers(roomId: string): Promise<Player[]> {
    const room = await this.roomRepository.findById(roomId);
    if (!room) {
      throw new NotFoundException('Soba nije pronađena.');
    }

    return this.playerRepository.findByRoom(roomId);
  }

  async getPlayer(id: string): Promise<Player> {
    const player = await this.playerRepository.findById(id);
    if (!player) {
      throw new NotFoundException('Igrač nije pronađen.');
    }
    return player;
  }
}
