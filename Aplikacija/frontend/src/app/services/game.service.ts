import { Injectable, OnDestroy } from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';
import { io, Socket } from 'socket.io-client';
import { environment } from '../../environments/environment';

export interface PlayerState {
  playerId: string;
  userId: string;
  name?: string;
  score: number;
  state: string;
}

export interface StrokeData {
  strokeId: string;
  points: { x: number; y: number }[];
  style: { color: string; lineWidth: number; lineCap?: string; opacity?: number };
}

export interface GuessMsg {
  playerId: string;
  guessText: string;
  isCorrect: boolean;
  pointsAwarded: number;
}

export interface GameState {
  roomId: string;
  myPlayerId: string;
  roomOwnerId: string;
  roomStatus: 'WAITING' | 'IN_PROGRESS' | 'FINISHED';
  players: PlayerState[];
  roundId: string | null;
  roundNo: number;
  drawerId: string | null;
  nextDrawerId: string | null;
  word: string | null;
  strokes: StrokeData[];
  guesses: GuessMsg[];
}

const EMPTY: GameState = {
  roomId: '', myPlayerId: '', roomOwnerId: '',
  roomStatus: 'WAITING', players: [],
  roundId: null, roundNo: 0,
  drawerId: null, nextDrawerId: null,
  word: null, strokes: [], guesses: [],
};

@Injectable({ providedIn: 'root' })
export class GameService implements OnDestroy {
  private socket!: Socket;

  private stateSubject = new BehaviorSubject<GameState>({ ...EMPTY });
  state$ = this.stateSubject.asObservable();

  strokeApplied$ = new Subject<StrokeData>();
  strokeUndone$ = new Subject<string>();
  canvasCleared$ = new Subject<void>();
  gameFinished$ = new Subject<void>();
  error$ = new Subject<string>();

  get state(): GameState { return this.stateSubject.value; }

  connect(token: string): void {
    if (this.socket?.connected) return;
    this.socket = io(`${environment.wsUrl}/game`, {
      auth: { token },
      transports: ['websocket'],
    });
    this.registerHandlers();
  }

  disconnect(): void {
    this.socket?.disconnect();
    this.stateSubject.next({ ...EMPTY });
  }

  /** Call before navigating to /game when you already know the owner (e.g. after createRoom HTTP). */
  setRoomMeta(roomId: string, myPlayerId: string, roomOwnerId: string): void {
    this.patch({ roomId, myPlayerId, roomOwnerId });
  }

  joinRoom(roomId: string): void {
    this.patch({ roomId });
    this.socket.emit('joinRoom', { roomId });
  }

  startGame(): void {
    this.socket.emit('startGame', { roomId: this.state.roomId });
  }

  startRound(): void {
    this.socket.emit('startRound', { roomId: this.state.roomId });
  }

  completeRound(): void {
    this.socket.emit('completeRound', { roomId: this.state.roomId });
  }

  applyStroke(points: { x: number; y: number }[], style: StrokeData['style']): void {
    this.socket.emit('applyStroke', {
      roomId: this.state.roomId,
      playerId: this.state.myPlayerId,
      points,
      style,
    });
  }

  undoStroke(): void {
    this.socket.emit('undoStroke', { roomId: this.state.roomId, playerId: this.state.myPlayerId });
  }

  clearCanvas(): void {
    this.socket.emit('clearCanvas', { roomId: this.state.roomId, playerId: this.state.myPlayerId });
  }

  submitGuess(guessText: string): void {
    const { roomId, roundId, myPlayerId } = this.state;
    this.socket.emit('submitGuess', { roomId, roundId, playerId: myPlayerId, guessText });
  }

  private registerHandlers(): void {
    this.socket.on('error', (d: any) => this.error$.next(d?.error ?? 'Unknown error'));

    this.socket.on('joinedRoom', (d: { roomId: string; roomOwnerId: string; player: { playerId: string; userId: string; score: number; state: string }; players: PlayerState[] }) => {
      this.patch({
        myPlayerId: d.player.playerId,
        roomOwnerId: d.roomOwnerId,
        players: d.players,
      });
    });

    this.socket.on('playerJoined', (d: { playerId: string; userId: string; playerCount: number }) => {
      const players = [...this.state.players];
      if (!players.find(p => p.playerId === d.playerId)) {
        players.push({ playerId: d.playerId, userId: d.userId, score: 0, state: 'WAITING' });
      }
      this.patch({ players });
    });

    this.socket.on('playerLeft', (d: { playerId: string; newOwnerId?: string }) => {
      const players = this.state.players.filter(p => p.playerId !== d.playerId);
      const update: Partial<GameState> = { players };
      if (d.newOwnerId) update.roomOwnerId = d.newOwnerId;
      this.patch(update);
    });

    this.socket.on('gameStarted', (d: { roomId: string; nextDrawerId: string }) => {
      this.patch({ roomStatus: 'IN_PROGRESS', nextDrawerId: d.nextDrawerId });
    });

    this.socket.on('roundStarted', (d: { roundId: string; roundNo: number; drawerId: string }) => {
      this.patch({
        roundId: d.roundId,
        roundNo: d.roundNo,
        drawerId: d.drawerId,
        nextDrawerId: null,
        word: null,
        strokes: [],
        guesses: [],
      });
    });

    this.socket.on('drawerWord', (d: { word: string; roundId: string }) => {
      this.patch({ word: d.word });
    });

    this.socket.on('strokeApplied', (d: StrokeData) => {
      this.patch({ strokes: [...this.state.strokes, d] });
      this.strokeApplied$.next(d);
    });

    this.socket.on('strokeUndone', (d: { undoneStrokeId: string }) => {
      const strokes = this.state.strokes.filter(s => s.strokeId !== d.undoneStrokeId);
      this.patch({ strokes });
      this.strokeUndone$.next(d.undoneStrokeId);
    });

    this.socket.on('canvasCleared', () => {
      this.patch({ strokes: [] });
      this.canvasCleared$.next();
    });

    this.socket.on('guessSubmitted', (d: GuessMsg) => {
      this.patch({ guesses: [...this.state.guesses, d] });
    });

    this.socket.on('roundCompleted', (d: { roundId: string; roundNo: number; roomStatus: string; nextDrawerId: string | null }) => {
      this.patch({
        drawerId: null,
        nextDrawerId: d.nextDrawerId,
        roomStatus: d.roomStatus as any,
        word: null,
      });
    });

    this.socket.on('gameFinished', () => {
      this.patch({ roomStatus: 'FINISHED' });
      this.gameFinished$.next();
    });
  }

  private patch(partial: Partial<GameState>): void {
    this.stateSubject.next({ ...this.stateSubject.value, ...partial });
  }

  ngOnDestroy(): void { this.disconnect(); }
}
