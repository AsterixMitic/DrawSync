import { RoundStatus } from '../enums';
import { InvalidStateError } from '../errors';
import { generateUUID } from '../../shared/utils/uuid.util';
import { Stroke } from './stroke.model';
import { Guess } from './guess.model';

export interface RoundProps {
  id?: string;
  roundNo: number;
  roomId: string;
  status?: RoundStatus;
  word?: string;
  startedAt?: Date;
  currentDrawerId?: string | null;
  strokes?: Stroke[];
  guesses?: Guess[];
}

export class Round {
  private readonly _id: string;
  private readonly _roundNo: number;
  private readonly _roomId: string;
  private _status: RoundStatus;
  private _word: string;
  private _startedAt: Date;
  private _currentDrawerId: string | null;
  private _strokes: Stroke[];
  private _guesses: Guess[];

  constructor(props: RoundProps) {
    this._id = props.id ?? generateUUID();
    this._roundNo = props.roundNo;
    this._roomId = props.roomId;
    this._status = props.status ?? RoundStatus.PENDING;
    this._word = props.word ?? '';
    this._startedAt = props.startedAt ?? new Date();
    this._currentDrawerId = props.currentDrawerId ?? null;
    this._strokes = props.strokes ?? [];
    this._guesses = props.guesses ?? [];
  }

  // Getters
  get id(): string { return this._id; }
  get roundNo(): number { return this._roundNo; }
  get roomId(): string { return this._roomId; }
  get status(): RoundStatus { return this._status; }
  get word(): string { return this._word; }
  get startedAt(): Date { return this._startedAt; }
  get currentDrawerId(): string | null { return this._currentDrawerId; }
  get strokes(): readonly Stroke[] { return [...this._strokes]; }
  get guesses(): readonly Guess[] { return [...this._guesses]; }

  // Computed
  get isActive(): boolean {
    return this._status === RoundStatus.ACTIVE;
  }

  get isPending(): boolean {
    return this._status === RoundStatus.PENDING;
  }

  get isCompleted(): boolean {
    return this._status === RoundStatus.COMPLETED;
  }

  get correctGuesses(): Guess[] {
    return this._guesses.filter(g => g.isCorrect);
  }

  // Business methods
  setWord(word: string): void {
    if (this._status !== RoundStatus.PENDING) {
      throw new InvalidStateError('Round', this._status, RoundStatus.PENDING);
    }
    if (word.trim().length < 2) {
      throw new Error('Word must be at least 2 characters');
    }
    this._word = word.trim().toLowerCase();
  }

  setDrawer(playerId: string): void {
    if (this._status !== RoundStatus.PENDING) {
      throw new InvalidStateError('Round', this._status, RoundStatus.PENDING);
    }
    this._currentDrawerId = playerId;
  }

  start(): void {
    if (this._status !== RoundStatus.PENDING) {
      throw new InvalidStateError('Round', this._status, RoundStatus.PENDING);
    }
    if (!this._word) {
      throw new Error('Word must be set before starting');
    }
    if (!this._currentDrawerId) {
      throw new Error('Drawer must be set before starting');
    }
    this._status = RoundStatus.ACTIVE;
    this._startedAt = new Date();
  }

  complete(): void {
    if (this._status !== RoundStatus.ACTIVE) {
      throw new InvalidStateError('Round', this._status, RoundStatus.ACTIVE);
    }
    this._status = RoundStatus.COMPLETED;
  }

  addStroke(stroke: Stroke): void {
    if (this._status !== RoundStatus.ACTIVE) {
      throw new InvalidStateError('Round', this._status, RoundStatus.ACTIVE);
    }
    this._strokes.push(stroke);
  }

  addGuess(guess: Guess): boolean {
    if (this._status !== RoundStatus.ACTIVE) {
      throw new InvalidStateError('Round', this._status, RoundStatus.ACTIVE);
    }
    
    // Check if player already guessed correctly
    if (this._guesses.some(g => g.playerId === guess.playerId && g.isCorrect)) {
      throw new Error('Player already guessed correctly');
    }

    this._guesses.push(guess);
    return guess.checkAnswer(this._word);
  }

  clearCanvas(): void {
    if (this._status !== RoundStatus.ACTIVE) {
      throw new InvalidStateError('Round', this._status, RoundStatus.ACTIVE);
    }
    this._strokes = [];
  }

  setStrokes(strokes: Stroke[]): void {
    this._strokes = strokes;
  }

  setGuesses(guesses: Guess[]): void {
    this._guesses = guesses;
  }
}