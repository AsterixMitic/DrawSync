export type LineCap = 'round' | 'square' | 'butt';

export class StrokeStyle {
  public readonly color: string;
  public readonly lineWidth: number;
  public readonly lineCap: LineCap;
  public readonly opacity: number;

  constructor(params: {
    color: string;
    lineWidth: number;
    lineCap?: LineCap;
    opacity?: number;
  }) {
    this.validateColor(params.color);
    this.validateLineWidth(params.lineWidth);

    this.color = params.color;
    this.lineWidth = params.lineWidth;
    this.lineCap = params.lineCap ?? 'round';
    this.opacity = params.opacity ?? 1;
    Object.freeze(this);
  }

  private validateColor(color: string): void {
    const hexPattern = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
    const rgbPattern = /^rgb\(\d{1,3},\s*\d{1,3},\s*\d{1,3}\)$/;
    if (!hexPattern.test(color) && !rgbPattern.test(color)) {
      throw new Error(`Invalid color format: ${color}`);
    }
  }

  private validateLineWidth(width: number): void {
    if (width <= 0 || width > 100) {
      throw new Error(`Line width must be between 0 and 100: ${width}`);
    }
  }

  equals(other: StrokeStyle): boolean {
    return (
      this.color === other.color &&
      this.lineWidth === other.lineWidth &&
      this.lineCap === other.lineCap &&
      this.opacity === other.opacity
    );
  }

  toJSON(): object {
    return {
      color: this.color,
      lineWidth: this.lineWidth,
      lineCap: this.lineCap,
      opacity: this.opacity
    };
  }

  static fromJSON(json: any): StrokeStyle {
    return new StrokeStyle({
      color: json.color,
      lineWidth: json.lineWidth,
      lineCap: json.lineCap,
      opacity: json.opacity
    });
  }

  static default(): StrokeStyle {
    return new StrokeStyle({
      color: '#000000',
      lineWidth: 5,
      lineCap: 'round',
      opacity: 1
    });
  }
}
