import { IsOptional, IsString, MinLength } from 'class-validator';

export class StartRoundDto {
  @IsOptional()
  @IsString()
  @MinLength(2)
  word?: string;
}
