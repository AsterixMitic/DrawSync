import { generateUUID } from '../../shared/utils/uuid.util';

export interface GuessProps {
  id?: string;
  roundId: string;
  playerId: string;
  guessText: string;
  time?: Date;
  isCorrect?: boolean;
}

export class Guess {
  private readonly _id: string;
  private readonly _roundId: string;
  private readonly _playerId: string;
  private readonly _guessText: string;
  private readonly _time: Date;
  private _isCorrect: boolean;

  constructor(props: GuessProps) {
    this._id = props.id ?? generateUUID();
    this._roundId = props.roundId;
    this._playerId = props.playerId;
    this._guessText = props.guessText.trim().toLowerCase();
    this._time = props.time ?? new Date();
    this._isCorrect = props.isCorrect ?? false;
  }

  // Getters
  get id(): string { return this._id; }
  get roundId(): string { return this._roundId; }
  get playerId(): string { return this._playerId; }
  get guessText(): string { return this._guessText; }
  get time(): Date { return this._time; }
  get isCorrect(): boolean { return this._isCorrect; }

  // Business methods
  checkAnswer(correctWord: string): boolean {
    this._isCorrect = this._guessText === correctWord.trim().toLowerCase();
    return this._isCorrect;
  }

  markAsCorrect(): void {
    this._isCorrect = true;
  }
}