import { IsString, IsNotEmpty, IsArray, ArrayMinSize, IsObject } from 'class-validator';

export class ApplyStrokeDto {
  @IsString()
  @IsNotEmpty()
  playerId: string;

  @IsArray()
  @ArrayMinSize(1)
  points: Array<{ x: number; y: number; pressure?: number; timestamp?: number }>;

  @IsObject()
  style: { color: string; lineWidth: number; lineCap?: 'round' | 'square' | 'butt'; opacity?: number };
}
