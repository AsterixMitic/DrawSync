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
  wordLength: number | null;
  wordChoices: string[] | null;
  hintDisplay: string | null;
  strokes: StrokeData[];
  guesses: GuessMsg[];
  timeLeft: number | null;
  roundDuration: number;
}

const EMPTY: GameState = {
  roomId: '', myPlayerId: '', roomOwnerId: '',
  roomStatus: 'WAITING', players: [],
  roundId: null, roundNo: 0,
  drawerId: null, nextDrawerId: null,
  word: null, wordLength: null,
  wordChoices: null, hintDisplay: null,
  strokes: [], guesses: [],
  timeLeft: null, roundDuration: 60,
};

@Injectable({ providedIn: 'root' })
export class GameService implements OnDestroy {
  private socket!: Socket;
  private timerInterval: ReturnType<typeof setInterval> | null = null;

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
    this.clearTimerInterval();
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

  selectWord(word: string): void {
    this.socket.emit('selectWord', { roomId: this.state.roomId, word });
  }

  completeRound(): void {
    this.socket.emit('completeRound', { roomId: this.state.roomId });
  }

  leaveRoom(): void {
    const { roomId, myPlayerId } = this.state;
    if (this.socket?.connected && roomId && myPlayerId) {
      this.socket.emit('leaveRoom', { roomId, playerId: myPlayerId });
    }
    this.disconnect();
  }

  resetRoom(): void {
    this.socket.emit('resetRoom', { roomId: this.state.roomId });
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

    this.socket.on('joinedRoom', (d: {
      roomId: string;
      roomOwnerId: string;
      player: { playerId: string; userId: string; name?: string; score: number; state: string };
      players: PlayerState[];
    }) => {
      // Ensure the joining player's own entry uses the JWT-sourced name
      const players = d.players.map(p =>
        p.playerId === d.player.playerId ? { ...p, name: d.player.name ?? p.name } : p
      );
      this.patch({
        myPlayerId: d.player.playerId,
        roomOwnerId: d.roomOwnerId,
        players,
      });
    });

    this.socket.on('playerJoined', (d: { playerId: string; userId: string; name?: string; playerCount: number }) => {
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

    this.socket.on('wordChoices', (d: { choices: string[] }) => {
      this.patch({ wordChoices: d.choices });
    });

    this.socket.on('roundStarted', (d: {
      roundId: string;
      roundNo: number;
      drawerId: string;
      wordLength?: number;
      durationSeconds?: number;
    }) => {
      this.clearTimerInterval();
      const duration = d.durationSeconds ?? 60;
      this.patch({
        roundId: d.roundId,
        roundNo: d.roundNo,
        drawerId: d.drawerId,
        nextDrawerId: null,
        word: null,
        wordLength: d.wordLength ?? null,
        wordChoices: null,
        hintDisplay: null,
        strokes: [],
        guesses: [],
        timeLeft: duration,
        roundDuration: duration,
      });
      this.timerInterval = setInterval(() => {
        const current = this.state.timeLeft;
        if (current === null || current <= 0) {
          this.clearTimerInterval();
          return;
        }
        this.patch({ timeLeft: current - 1 });
      }, 1000);
    });

    this.socket.on('drawerWord', (d: { word: string; roundId: string }) => {
      this.patch({ word: d.word });
    });

    this.socket.on('hintRevealed', (d: { hint: string }) => {
      this.patch({ hintDisplay: d.hint });
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

    this.socket.on('roundCompleted', (d: { roundId: string; roundNo: number; roomStatus: string; nextDrawerId: string | null; drawerPlayerId: string | null; drawerBonusPoints: number }) => {
      this.clearTimerInterval();
      let players = this.state.players;
      if (d.drawerPlayerId && d.drawerBonusPoints > 0) {
        players = players.map(p =>
          p.playerId === d.drawerPlayerId ? { ...p, score: p.score + d.drawerBonusPoints } : p
        );
      }
      this.patch({
        players,
        drawerId: null,
        nextDrawerId: d.nextDrawerId,
        roomStatus: d.roomStatus as any,
        word: null,
        wordLength: null,
        wordChoices: null,
        hintDisplay: null,
        timeLeft: null,
        roundId: null,
      });
    });

    this.socket.on('gameFinished', () => {
      this.clearTimerInterval();
      this.patch({ roomStatus: 'FINISHED' });
      this.gameFinished$.next();
    });

    this.socket.on('roomReset', () => {
      this.clearTimerInterval();
      this.patch({
        roomStatus: 'WAITING',
        players: this.state.players.map(p => ({ ...p, score: 0, state: 'WAITING' })),
        roundId: null,
        roundNo: 0,
        drawerId: null,
        nextDrawerId: null,
        word: null,
        wordLength: null,
        wordChoices: null,
        hintDisplay: null,
        strokes: [],
        guesses: [],
        timeLeft: null,
      });
    });
  }

  private clearTimerInterval(): void {
    if (this.timerInterval !== null) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
  }

  private patch(partial: Partial<GameState>): void {
    this.stateSubject.next({ ...this.stateSubject.value, ...partial });
  }

  ngOnDestroy(): void { this.disconnect(); }
}
