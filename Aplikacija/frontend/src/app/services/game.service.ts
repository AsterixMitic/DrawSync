import { Injectable, OnDestroy, NgZone } from '@angular/core';
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
  points: { x: number; y: number }[];  // normalized 0–1 range
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
  wordLength: number | null;
  timeLeft: number | null;
  strokes: StrokeData[];
  guesses: GuessMsg[];
}

const EMPTY: GameState = {
  roomId: '', myPlayerId: '', roomOwnerId: '',
  roomStatus: 'WAITING', players: [],
  roundId: null, roundNo: 0,
  drawerId: null, nextDrawerId: null,
  word: null, wordLength: null, timeLeft: null,
  strokes: [], guesses: [],
};

@Injectable({ providedIn: 'root' })
export class GameService implements OnDestroy {
  private socket!: Socket;
  private timerHandle: ReturnType<typeof setInterval> | null = null;

  constructor(private ngZone: NgZone) {}

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
    this.clearTimer();
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

  leaveRoom(): void {
    const { roomId, myPlayerId } = this.state;
    if (roomId && myPlayerId) {
      this.socket.emit('leaveRoom', { roomId, playerId: myPlayerId });
    }
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

  private startTimer(seconds: number): void {
    this.clearTimer();
    this.patch({ timeLeft: seconds });
    this.timerHandle = setInterval(() => {
      const current = this.state.timeLeft ?? 0;
      const next = current <= 1 ? 0 : current - 1;
      this.patch({ timeLeft: next });
      if (next === 0) this.clearTimer();
    }, 1000);
  }

  private clearTimer(): void {
    if (this.timerHandle !== null) {
      clearInterval(this.timerHandle);
      this.timerHandle = null;
    }
  }

  private registerHandlers(): void {
    this.socket.on('error', (d: any) => this.error$.next(d?.error ?? 'Unknown error'));

    this.socket.on('joinedRoom', (d: {
      roomId: string;
      roomOwnerId: string;
      player: { playerId: string; userId: string; score: number; state: string; name: string };
      players: PlayerState[];
    }) => {
      this.patch({
        myPlayerId: d.player.playerId,
        roomOwnerId: d.roomOwnerId,
        players: d.players,
      });
    });

    this.socket.on('playerJoined', (d: { playerId: string; userId: string; name: string; playerCount: number }) => {
      const players = [...this.state.players];
      if (!players.find(p => p.playerId === d.playerId)) {
        players.push({ playerId: d.playerId, userId: d.userId, name: d.name, score: 0, state: 'WAITING' });
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

    this.socket.on('roundStarted', (d: { roundId: string; roundNo: number; drawerId: string; wordLength: number; timerSeconds: number; word?: string }) => {
      console.log('[GameService] roundStarted received:', d);
      console.log('[GameService] word in payload:', d.word);
      console.log('[GameService] myPlayerId:', this.state.myPlayerId, '| drawerId:', d.drawerId);
      this.patch({
        roundId: d.roundId,
        roundNo: d.roundNo,
        drawerId: d.drawerId,
        nextDrawerId: null,
        word: d.word ?? null,
        wordLength: d.wordLength,
        timeLeft: d.timerSeconds,
        strokes: [],
        guesses: [],
      });
      console.log('[GameService] state.word after patch:', this.state.word);
      this.startTimer(d.timerSeconds);
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

    this.socket.on('correctGuess', (d: { playerId: string; pointsAwarded: number }) => {
      const players = this.state.players.map(p =>
        p.playerId === d.playerId ? { ...p, score: p.score + d.pointsAwarded } : p
      );
      this.patch({ players });
    });

    this.socket.on('roundCompleted', (d: { roundId: string; roundNo: number; roomStatus: string; nextDrawerId: string | null; drawerId: string | null; drawerPoints: number }) => {
      this.clearTimer();
      // Apply drawer points earned this round
      const players = d.drawerId && d.drawerPoints > 0
        ? this.state.players.map(p =>
            p.playerId === d.drawerId ? { ...p, score: p.score + d.drawerPoints } : p
          )
        : this.state.players;
      this.patch({
        drawerId: null,
        nextDrawerId: d.nextDrawerId,
        roomStatus: d.roomStatus as any,
        word: null,
        wordLength: null,
        timeLeft: null,
        players,
      });
    });

    this.socket.on('gameFinished', () => {
      this.patch({ roomStatus: 'FINISHED' });
      this.gameFinished$.next();
    });
  }

  private patch(partial: Partial<GameState>): void {
    this.ngZone.run(() => {
      this.stateSubject.next({ ...this.stateSubject.value, ...partial });
    });
  }

  ngOnDestroy(): void { this.disconnect(); }
}
