import { IsArray, ArrayMinSize, IsString } from 'class-validator';

export class StartGameDto {
  @IsArray()
  @ArrayMinSize(1)
  @IsString({ each: true })
  words: string[];
}
