import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { PlayerService } from '../../application/services/player.service';
import { RoomService } from '../../application/services/room.service';
import { RoundService } from '../../application/services/round.service';
import { Player } from '../../domain/models/player.model';
import { Room } from '../../domain/models/room.model';
import { Round } from '../../domain/models/round.model';
import { CreatePlayerDto } from '../dto/create-player.dto';
import { CreateRoomDto } from '../dto/create-room.dto';
import { CreateRoundDto } from '../dto/create-round.dto';
import { PlayerDto } from '../dto/player.dto';
import { RoomDto } from '../dto/room.dto';
import { RoundDto } from '../dto/round.dto';

@Controller('rooms')
export class RoomsController {
  constructor(
    private readonly roomService: RoomService,
    private readonly roundService: RoundService,
    private readonly playerService: PlayerService
  ) {}

  @Post()
  async createRoom(@Body() dto: CreateRoomDto): Promise<RoomDto> {
    const room = await this.roomService.createRoom(dto);
    return this.toRoomDto(room);
  }

  @Get(':roomId')
  async getRoom(@Param('roomId') roomId: string): Promise<RoomDto> {
    const room = await this.roomService.getRoom(roomId);
    return this.toRoomDto(room);
  }

  @Post(':roomId/players')
  async createPlayer(
    @Param('roomId') roomId: string,
    @Body() dto: CreatePlayerDto
  ): Promise<PlayerDto> {
    const player = await this.playerService.createPlayer(roomId, dto);
    return this.toPlayerDto(player);
  }

  @Get(':roomId/players')
  async listPlayers(@Param('roomId') roomId: string): Promise<PlayerDto[]> {
    const players = await this.playerService.listPlayers(roomId);
    return players.map((player) => this.toPlayerDto(player));
  }

  @Post(':roomId/rounds')
  async createRound(
    @Param('roomId') roomId: string,
    @Body() dto: CreateRoundDto
  ): Promise<RoundDto> {
    const round = await this.roundService.createRound(roomId, dto);
    return this.toRoundDto(round);
  }

  private toRoomDto(room: Room): RoomDto {
    return {
      id: room.id,
      code: room.code,
      name: room.name,
      status: room.status,
      createdAt: room.createdAt,
      updatedAt: room.updatedAt,
      rounds: room.rounds?.map((round) => this.toRoundDto(round)),
      players: room.players?.map((player) => this.toPlayerDto(player)),
    };
  }

  private toPlayerDto(player: Player): PlayerDto {
    return {
      id: player.id,
      roomId: player.roomId,
      nickname: player.nickname,
      score: player.score,
      createdAt: player.createdAt,
      updatedAt: player.updatedAt,
    };
  }

  private toRoundDto(round: Round): RoundDto {
    return {
      id: round.id,
      roomId: round.roomId,
      roundNumber: round.roundNumber,
      word: round.word,
      status: round.status,
      durationSeconds: round.durationSeconds,
      startedAt: round.startedAt,
      endedAt: round.endedAt,
      createdAt: round.createdAt,
      updatedAt: round.updatedAt,
    };
  }
}
