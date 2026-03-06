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
import { RoomClientApi } from '../../application/client-api/room.client-api';
import { RoundClientApi } from '../../application/client-api/round.client-api';
import { StrokeClientApi } from '../../application/client-api/stroke.client-api';
import { GuessClientApi } from '../../application/client-api/guess.client-api';

interface SocketMeta {
  userId: string;
  roomId?: string;
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

  constructor(
    private readonly roomClientApi: RoomClientApi,
    private readonly roundClientApi: RoundClientApi,
    private readonly strokeClientApi: StrokeClientApi,
    private readonly guessClientApi: GuessClientApi,
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

    client.to(data.roomId).emit('playerJoined', {
      roomId: data.roomId,
      playerId: result.data!.player.playerId,
      userId: user.userId,
      playerCount: result.data!.room.playerCount,
    });

    return { event: 'joinedRoom', data: { roomId: data.roomId, player: result.data!.player } };
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
    @MessageBody() data: { roomId: string; words: string[] },
  ) {
    const result = await this.roomClientApi.startGame({
      roomId: data.roomId,
      words: data.words,
    });

    if (result.isFailure()) {
      return { event: 'error', data: { error: result.error, errorCode: result.errorCode } };
    }

    this.server.to(data.roomId).emit('gameStarted', {
      roomId: data.roomId,
      firstRound: {
        roundId: result.data!.firstRound.id,
        roundNo: result.data!.firstRound.roundNo,
        drawerId: result.data!.drawerId,
      },
    });

    return { event: 'gameStarted', data: { roomId: data.roomId } };
  }

  @SubscribeMessage('startRound')
  async handleStartRound(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { roomId: string; word: string },
  ) {
    const result = await this.roundClientApi.startRound({
      roomId: data.roomId,
      word: data.word,
    });

    if (result.isFailure()) {
      return { event: 'error', data: { error: result.error, errorCode: result.errorCode } };
    }

    this.server.to(data.roomId).emit('roundStarted', {
      roomId: data.roomId,
      roundId: result.data!.round.id,
      roundNo: result.data!.round.roundNo,
      drawerId: result.data!.drawerId,
    });

    return { event: 'roundStarted', data: { roundId: result.data!.round.id } };
  }

  @SubscribeMessage('completeRound')
  async handleCompleteRound(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { roomId: string },
  ) {
    const result = await this.roundClientApi.completeRound({
      roomId: data.roomId,
    });

    if (result.isFailure()) {
      return { event: 'error', data: { error: result.error, errorCode: result.errorCode } };
    }

    this.server.to(data.roomId).emit('roundCompleted', {
      roomId: data.roomId,
      roundId: result.data!.round.id,
      roundNo: result.data!.round.roundNo,
      roomStatus: result.data!.roomStatus,
    });

    return { event: 'roundCompleted', data: { roundId: result.data!.round.id } };
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

    return { event: 'strokeApplied', data: { strokeId: result.data!.stroke.id } };
  }

  @SubscribeMessage('undoStroke')
  async handleUndoStroke(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { roomId: string; playerId: string },
  ) {
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
