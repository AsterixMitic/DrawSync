import { IsString, IsNotEmpty } from 'class-validator';

export class StrokeActionDto {
  @IsString()
  @IsNotEmpty()
  playerId: string;
}
