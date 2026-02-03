import { PlayerState } from '../enums';
import { generateUUID } from '../../shared/utils/uuid.util';
import { User } from './user.model';

export interface PlayerProps {
  playerId?: string;
  oddserId: string;
  roomId: string;
  score?: number;
  state?: PlayerState;
  user?: User;
}

export class Player {
  private readonly _playerId: string;
  private readonly _userId: string;
  private readonly _roomId: string;
  private _score: number;
  private _state: PlayerState;
  private _user?: User;

  constructor(props: PlayerProps) {
    this._playerId = props.playerId ?? generateUUID();
    //?
    this._userId = props.user?.id ?? props.oddserId;
    this._roomId = props.roomId;
    this._score = props.score ?? 0;
    this._state = props.state ?? PlayerState.WAITING;
    this._user = props.user;
  }

  // Getters
  get playerId(): string { return this._playerId; }
  get oddserId(): string { return this._userId; }
  get roomId(): string { return this._roomId; }
  get score(): number { return this._score; }
  get state(): PlayerState { return this._state; }
  get user(): User | undefined { return this._user; }

  // Business methods
  isDrawer(): boolean {
    return this._state === PlayerState.DRAWING;
  }

  isGuessing(): boolean {
    return this._state === PlayerState.GUESSING;
  }

  canDraw(): boolean {
    return this._state === PlayerState.DRAWING;
  }

  canGuess(): boolean {
    return this._state === PlayerState.GUESSING;
  }

  addScore(points: number): void {
    if (points < 0) {
      throw new Error('Points cannot be negative');
    }
    this._score += points;
  }

  changeState(newState: PlayerState): void {
    this._state = newState;
  }

  setAsDrawer(): void {
    this._state = PlayerState.DRAWING;
  }

  setAsGuesser(): void {
    this._state = PlayerState.GUESSING;
  }

  setAsWaiting(): void {
    this._state = PlayerState.WAITING;
  }

  setAsSpectator(): void {
    this._state = PlayerState.SPECTATING;
  }

  setUser(user: User): void {
    this._user = user;
  }
}