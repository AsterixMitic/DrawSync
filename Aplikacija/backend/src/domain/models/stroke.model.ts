import { StrokePoint, StrokeStyle } from '../value-objects';
import { generateUUID } from '../../shared/utils/uuid.util';

export interface StrokeProps {
  id?: string;
  roundId: string;
  createdAt?: Date;
  points: StrokePoint[];
  style: StrokeStyle;
}

export class Stroke {
  private readonly _id: string;
  private readonly _roundId: string;
  private readonly _createdAt: Date;
  private readonly _points: StrokePoint[];
  private readonly _style: StrokeStyle;

  constructor(props: StrokeProps) {
    this._id = props.id ?? generateUUID();
    this._roundId = props.roundId;
    this._createdAt = props.createdAt ?? new Date();
    this._points = [...props.points];
    this._style = props.style;
    Object.freeze(this._points);
  }

  // Getters
  get id(): string { return this._id; }
  get roundId(): string { return this._roundId; }
  get createdAt(): Date { return this._createdAt; }
  get points(): readonly StrokePoint[] { return this._points; }
  get style(): StrokeStyle { return this._style; }

  // Computed
  get pointCount(): number {
    return this._points.length;
  }

  get boundingBox(): { minX: number; minY: number; maxX: number; maxY: number } {
    if (this._points.length === 0) {
      return { minX: 0, minY: 0, maxX: 0, maxY: 0 };
    }
    const xs = this._points.map(p => p.x);
    const ys = this._points.map(p => p.y);
    return {
      minX: Math.min(...xs),
      minY: Math.min(...ys),
      maxX: Math.max(...xs),
      maxY: Math.max(...ys)
    };
  }

  get length(): number {
    let totalLength = 0;
    for (let i = 1; i < this._points.length; i++) {
      const dx = this._points[i].x - this._points[i - 1].x;
      const dy = this._points[i].y - this._points[i - 1].y;
      totalLength += Math.sqrt(dx * dx + dy * dy);
    }
    return totalLength;
  }
}