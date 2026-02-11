import { IsString, MinLength } from 'class-validator';

export class StartRoundDto {
  @IsString()
  @MinLength(2)
  word: string;
}
