import { Injectable } from '@nestjs/common';
import { WORD_LIST } from '../data/word-list.data';

@Injectable()
export class WordBankService {
  getRandom(): string {
    const idx = Math.floor(Math.random() * WORD_LIST.length);
    return WORD_LIST[idx];
  }

  getMultipleRandom(count: number): string[] {
    const shuffled = [...WORD_LIST].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, count);
  }

  getAll(): string[] {
    return [...WORD_LIST];
  }
}
