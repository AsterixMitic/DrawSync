import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { UseGuards, Logger } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import { WsAuthGuard } from './ws-auth.guard';
import { RoundTimerService } from './round-timer.service';
import { RoomClientApi } from '../../application/client-api/room.client-api';
import { RoundClientApi } from '../../application/client-api/round.client-api';
import { StrokeClientApi } from '../../application/client-api/stroke.client-api';
import { GuessClientApi } from '../../application/client-api/guess.client-api';
import { RoomStatus } from '../../domain/enums';

interface SocketMeta {
  userId: string;
  roomId?: string;
  playerId?: string;
}

@WebSocketGateway({
  namespace: '/game',
  cors: { origin: '*' },
})
@UseGuards(WsAuthGuard)
export class GameGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(GameGateway.name);
  private readonly socketMeta = new Map<string, SocketMeta>();
  private readonly ROUND_MS = parseInt(process.env.ROUND_DURATION_MS ?? '60000');

  constructor(
    private readonly roomClientApi: RoomClientApi,
    private readonly roundClientApi: RoundClientApi,
    private readonly strokeClientApi: StrokeClientApi,
    private readonly guessClientApi: GuessClientApi,
    private readonly timerService: RoundTimerService,
  ) {}

  handleConnection(client: Socket): void {
    this.logger.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket): void {
    const meta = this.socketMeta.get(client.id);
    if (meta?.roomId) {
      client.leave(meta.roomId);
    }
    this.socketMeta.delete(client.id);
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  private isAuthorizedPlayer(client: Socket, playerId: string): boolean {
    return this.socketMeta.get(client.id)?.playerId === playerId;
  }

  @SubscribeMessage('joinRoom')
  async handleJoinRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { roomId: string },
  ) {
    const user = (client as any).user;
    client.join(data.roomId);
    this.socketMeta.set(client.id, {
      userId: user.userId,
      roomId: data.roomId,
    });

    const result = await this.roomClientApi.joinRoom({
      roomId: data.roomId,
      userId: user.userId,
    });

    if (result.isFailure()) {
      client.leave(data.roomId);
      this.socketMeta.set(client.id, { userId: user.userId });
      return { event: 'error', data: { error: result.error, errorCode: result.errorCode } };
    }

    this.socketMeta.set(client.id, {
      userId: user.userId,
      roomId: data.roomId,
      playerId: result.data!.player.playerId,
    });

    client.to(data.roomId).emit('playerJoined', {
      roomId: data.roomId,
      playerId: result.data!.player.playerId,
      userId: user.userId,
      name: user.name,
      playerCount: result.data!.room.playerCount,
    });

    const p = result.data!.player;
    const r = result.data!.room;
    return {
      event: 'joinedRoom',
      data: {
        roomId: data.roomId,
        roomOwnerId: r.roomOwnerId,
        player: {
          playerId: p.playerId,
          userId: p.userId,
          roomId: p.roomId,
          score: p.score,
          state: p.state,
          name: user.name,
        },
        players: r.players.map(pl => ({
          playerId: pl.playerId,
          userId: pl.userId,
          name: pl.user?.name ?? pl.userId,
          score: pl.score,
          state: pl.state,
        })),
      },
    };
  }

  @SubscribeMessage('leaveRoom')
  async handleLeaveRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { roomId: string; playerId: string },
  ) {
    const user = (client as any).user;
    const result = await this.roomClientApi.leaveRoom({
      roomId: data.roomId,
      playerId: data.playerId,
    });

    client.leave(data.roomId);
    this.socketMeta.set(client.id, { userId: user.userId });

    if (result.isSuccess()) {
      this.server.to(data.roomId).emit('playerLeft', {
        roomId: data.roomId,
        playerId: data.playerId,
        playerCount: result.data!.room?.playerCount ?? 0,
        roomDeleted: result.data!.roomDeleted,
        newOwnerId: result.data!.newOwnerId,
      });
    }

    return { event: 'leftRoom', data: { roomId: data.roomId } };
  }

  @SubscribeMessage('startGame')
  async handleStartGame(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { roomId: string },
  ) {
    const user = (client as any).user;
    const result = await this.roomClientApi.startGame({
      roomId: data.roomId,
      userId: user.userId,
    });

    if (result.isFailure()) {
      return { event: 'error', data: { error: result.error, errorCode: result.errorCode } };
    }

    const gameStartedPayload = {
      roomId: data.roomId,
      nextDrawerId: result.data!.nextDrawerId,
    };
    client.to(data.roomId).emit('gameStarted', gameStartedPayload);
    return { event: 'gameStarted', data: gameStartedPayload };
  }

  @SubscribeMessage('startRound')
  async handleStartRound(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { roomId: string },
  ) {
    const user = (client as any).user;
    const result = await this.roundClientApi.startRound({
      roomId: data.roomId,
      userId: user.userId,
    });

    if (result.isFailure()) {
      return { event: 'error', data: { error: result.error, errorCode: result.errorCode } };
    }

    const word = result.data!.round.word;
    const wordLength = word.length;
    const timerSeconds = Math.floor(this.ROUND_MS / 1000);
    const roundStartedBase = {
      roomId: data.roomId,
      roundId: result.data!.round.id,
      roundNo: result.data!.round.roundNo,
      drawerId: result.data!.drawerId,
      wordLength,
      timerSeconds,
    };
    // To all other players (no word)
    client.to(data.roomId).emit('roundStarted', roundStartedBase);
    // To the drawer: same payload but with the word included
    client.emit('roundStarted', { ...roundStartedBase, word });

    // Start round timer
    this.timerService.start(data.roomId, this.ROUND_MS, () => this.autoCompleteRound(data.roomId));
  }

  @SubscribeMessage('completeRound')
  async handleCompleteRound(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { roomId: string },
  ) {
    const user = (client as any).user;
    const result = await this.roundClientApi.completeRound({
      roomId: data.roomId,
      userId: user.userId,
    });

    if (result.isFailure()) {
      return { event: 'error', data: { error: result.error, errorCode: result.errorCode } };
    }

    this.timerService.clear(data.roomId);

    const roundCompletedPayload = {
      roomId: data.roomId,
      roundId: result.data!.round.id,
      roundNo: result.data!.round.roundNo,
      roomStatus: result.data!.roomStatus,
      nextDrawerId: result.data!.nextDrawerId,
      drawerId: result.data!.drawerId,
      drawerPoints: result.data!.drawerPoints,
    };
    client.to(data.roomId).emit('roundCompleted', roundCompletedPayload);

    if (result.data!.roomStatus === RoomStatus.FINISHED) {
      this.server.to(data.roomId).emit('gameFinished', { roomId: data.roomId });
    }

    return { event: 'roundCompleted', data: roundCompletedPayload };
  }

  private async autoCompleteRound(roomId: string): Promise<void> {
    this.timerService.clear(roomId);
    const result = await this.roundClientApi.completeRound({ roomId, skipOwnerCheck: true });
    if (result.isSuccess()) {
      this.server.to(roomId).emit('roundCompleted', {
        roomId,
        roundId: result.data!.round.id,
        roundNo: result.data!.round.roundNo,
        roomStatus: result.data!.roomStatus,
        nextDrawerId: result.data!.nextDrawerId,
        drawerId: result.data!.drawerId,
        drawerPoints: result.data!.drawerPoints,
      });
      if (result.data!.roomStatus === RoomStatus.FINISHED) {
        this.server.to(roomId).emit('gameFinished', { roomId });
      } else {
        // Brief pause so clients process roundCompleted before roundStarted
        setTimeout(() => this.autoStartNextRound(roomId), 2000);
      }
    }
  }

  private async autoStartNextRound(roomId: string): Promise<void> {
    const result = await this.roundClientApi.startRound({
      roomId,
      userId: '',
      skipDrawerCheck: true,
    });

    if (result.isFailure()) {
      this.logger.warn(`autoStartNextRound failed for room ${roomId}: ${result.error}`);
      this.server.to(roomId).emit('error', { error: `autoStartNextRound: ${result.error}` });
      return;
    }

    const word = result.data!.round.word;
    const wordLength = word.length;
    const timerSeconds = Math.floor(this.ROUND_MS / 1000);
    const roundStartedBase = {
      roomId,
      roundId: result.data!.round.id,
      roundNo: result.data!.round.roundNo,
      drawerId: result.data!.drawerId,
      wordLength,
      timerSeconds,
    };

    // Find the drawer's socket to send the word only to them
    const drawerSocketId = [...this.socketMeta.entries()]
      .find(([, meta]) => meta.roomId === roomId && meta.playerId === result.data!.drawerId)?.[0];

    if (drawerSocketId) {
      this.server.to(roomId).except(drawerSocketId).emit('roundStarted', roundStartedBase);
      this.server.to(drawerSocketId).emit('roundStarted', { ...roundStartedBase, word });
    } else {
      // Fallback: broadcast without word if drawer socket not found
      this.server.to(roomId).emit('roundStarted', roundStartedBase);
    }

    this.timerService.start(roomId, this.ROUND_MS, () => this.autoCompleteRound(roomId));
  }

  @SubscribeMessage('applyStroke')
  async handleApplyStroke(
    @ConnectedSocket() client: Socket,
    @MessageBody()
    data: {
      roomId: string;
      playerId: string;
      points: Array<{
        x: number;
        y: number;
        pressure?: number;
        timestamp?: number;
      }>;
      style: {
        color: string;
        lineWidth: number;
        lineCap?: 'round' | 'square' | 'butt';
        opacity?: number;
      };
    },
  ) {
    if (!this.isAuthorizedPlayer(client, data.playerId)) {
      return { event: 'error', data: { error: 'Unauthorized', errorCode: 'UNAUTHORIZED' } };
    }

    const result = await this.strokeClientApi.applyStroke({
      roomId: data.roomId,
      playerId: data.playerId,
      points: data.points,
      style: data.style,
    });

    if (result.isFailure()) {
      return { event: 'error', data: { error: result.error, errorCode: result.errorCode } };
    }

    // Broadcast to everyone in room except sender
    client.to(data.roomId).emit('strokeApplied', {
      strokeId: result.data!.stroke.id,
      points: data.points,
      style: data.style,
    });

    return { event: 'strokeApplied', data: { strokeId: result.data!.stroke.id, points: data.points, style: data.style } };
  }

  @SubscribeMessage('undoStroke')
  async handleUndoStroke(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { roomId: string; playerId: string },
  ) {
    if (!this.isAuthorizedPlayer(client, data.playerId)) {
      return { event: 'error', data: { error: 'Unauthorized', errorCode: 'UNAUTHORIZED' } };
    }

    const result = await this.strokeClientApi.undoStroke({
      roomId: data.roomId,
      playerId: data.playerId,
    });

    if (result.isFailure()) {
      return { event: 'error', data: { error: result.error, errorCode: result.errorCode } };
    }

    client.to(data.roomId).emit('strokeUndone', {
      undoneStrokeId: result.data!.undoneStrokeId,
    });

    return { event: 'strokeUndone', data: { undoneStrokeId: result.data!.undoneStrokeId } };
  }

  @SubscribeMessage('clearCanvas')
  async handleClearCanvas(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { roomId: string; playerId: string },
  ) {
    if (!this.isAuthorizedPlayer(client, data.playerId)) {
      return { event: 'error', data: { error: 'Unauthorized', errorCode: 'UNAUTHORIZED' } };
    }

    const result = await this.strokeClientApi.clearCanvas({
      roomId: data.roomId,
      playerId: data.playerId,
    });

    if (result.isFailure()) {
      return { event: 'error', data: { error: result.error, errorCode: result.errorCode } };
    }

    client.to(data.roomId).emit('canvasCleared', {
      roomId: data.roomId,
    });

    return { event: 'canvasCleared', data: { roomId: data.roomId } };
  }

  @SubscribeMessage('submitGuess')
  async handleSubmitGuess(
    @ConnectedSocket() client: Socket,
    @MessageBody()
    data: {
      roomId: string;
      roundId: string;
      playerId: string;
      guessText: string;
    },
  ) {
    const result = await this.guessClientApi.submitGuess({
      roundId: data.roundId,
      playerId: data.playerId,
      guessText: data.guessText,
    });

    if (result.isFailure()) {
      return { event: 'error', data: { error: result.error, errorCode: result.errorCode } };
    }

    this.server.to(data.roomId).emit('guessSubmitted', {
      playerId: data.playerId,
      guessText: result.data!.isCorrect ? '[CORRECT]' : data.guessText,
      isCorrect: result.data!.isCorrect,
      pointsAwarded: result.data!.pointsAwarded,
    });

    if (result.data!.isCorrect) {
      this.server.to(data.roomId).emit('correctGuess', {
        playerId: data.playerId,
        pointsAwarded: result.data!.pointsAwarded,
      });

      if (result.data!.allGuessersCorrect) {
        await this.autoCompleteRound(data.roomId);
      }
    }

    return {
      event: 'guessResult',
      data: {
        isCorrect: result.data!.isCorrect,
        pointsAwarded: result.data!.pointsAwarded,
      },
    };
  }

  broadcastToRoom(roomId: string, event: string, data: any): void {
    this.server.to(roomId).emit(event, data);
  }
}
