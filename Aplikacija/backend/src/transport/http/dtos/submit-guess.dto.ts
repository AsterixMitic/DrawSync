import { IsString, IsNotEmpty } from 'class-validator';

export class SubmitGuessDto {
  @IsString()
  @IsNotEmpty()
  roundId: string;

  @IsString()
  @IsNotEmpty()
  playerId: string;

  @IsString()
  @IsNotEmpty()
  guessText: string;
}
