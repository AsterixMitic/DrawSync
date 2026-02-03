import { StrokeType } from '../enums';
import { generateUUID } from '../../shared/utils/uuid.util';
import { Stroke } from './stroke.model';

export interface StrokeEventProps {
  eventId?: string;
  roundId: string;
  seq: number;
  strokeType: StrokeType;
  createdAt?: Date;
  strokeId?: string | null;
  stroke?: Stroke;
}

export class StrokeEvent {
  private readonly _eventId: string;
  private readonly _roundId: string;
  private readonly _seq: number;
  private readonly _strokeType: StrokeType;
  private readonly _createdAt: Date;
  private readonly _strokeId: string | null;
  private _stroke?: Stroke;

  constructor(props: StrokeEventProps) {
    this._eventId = props.eventId ?? generateUUID();
    this._roundId = props.roundId;
    this._seq = props.seq;
    this._strokeType = props.strokeType;
    this._createdAt = props.createdAt ?? new Date();
    this._strokeId = props.strokeId ?? props.stroke?.id ?? null;
    this._stroke = props.stroke;
  }

  // Getters
  get eventId(): string { return this._eventId; }
  get roundId(): string { return this._roundId; }
  get seq(): number { return this._seq; }
  get strokeType(): StrokeType { return this._strokeType; }
  get createdAt(): Date { return this._createdAt; }
  get strokeId(): string | null { return this._strokeId; }
  get stroke(): Stroke | undefined { return this._stroke; }

  // Computed
  get isDraw(): boolean {
    return this._strokeType === StrokeType.DRAW;
  }

  get isErase(): boolean {
    return this._strokeType === StrokeType.ERASE;
  }

  get isClear(): boolean {
    return this._strokeType === StrokeType.CLEAR;
  }

  get isUndo(): boolean {
    return this._strokeType === StrokeType.UNDO;
  }

  setStroke(stroke: Stroke): void {
    this._stroke = stroke;
  }
}