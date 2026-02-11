import { IsOptional, IsInt, Min, Max } from 'class-validator';

export class CreateRoomDto {
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(10)
  roundCount?: number;

  @IsOptional()
  @IsInt()
  @Min(2)
  @Max(16)
  playerMaxCount?: number;
}
