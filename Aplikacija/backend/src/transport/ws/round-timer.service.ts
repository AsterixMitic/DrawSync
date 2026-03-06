import { Injectable } from '@nestjs/common';

@Injectable()
export class RoundTimerService {
  private readonly timers = new Map<string, NodeJS.Timeout>();

  start(roomId: string, durationMs: number, onExpire: () => void): void {
    this.clear(roomId);
    this.timers.set(roomId, setTimeout(onExpire, durationMs));
  }

  clear(roomId: string): void {
    const t = this.timers.get(roomId);
    if (t) {
      clearTimeout(t);
      this.timers.delete(roomId);
    }
  }
}
