export class StrokePoint {
  public readonly x: number;
  public readonly y: number;
  public readonly pressure: number;
  public readonly timestamp: number;

  constructor(params: {
    x: number;
    y: number;
    pressure?: number;
    timestamp?: number;
  }) {
    this.x = params.x;
    this.y = params.y;
    this.pressure = params.pressure ?? 1;
    this.timestamp = params.timestamp ?? Date.now();
    Object.freeze(this);
  }

  equals(other: StrokePoint): boolean {
    return (
      this.x === other.x &&
      this.y === other.y &&
      this.pressure === other.pressure
    );
  }

  toJSON(): object {
    return {
      x: this.x,
      y: this.y,
      pressure: this.pressure,
      timestamp: this.timestamp
    };
  }

  static fromJSON(json: any): StrokePoint {
    return new StrokePoint({
      x: json.x,
      y: json.y,
      pressure: json.pressure,
      timestamp: json.timestamp
    });
  }
}