import { Injectable, OnModuleDestroy } from '@nestjs/common';
import Redis from 'ioredis';
import { ISharedStatePort, RoomState } from '../../domain/ports';

@Injectable()
export class SharedStateAdapter implements ISharedStatePort, OnModuleDestroy {
  private readonly redis: Redis;
  private readonly keyPrefix = 'drawsync:room:';

  constructor() {
    this.redis = new Redis({
      host: process.env.REDIS_HOST ?? 'localhost',
      port: Number(process.env.REDIS_PORT ?? 6379),
    });
  }

  private key(roomId: string): string {
    return `${this.keyPrefix}${roomId}`;
  }

  async getRoomState(roomId: string): Promise<RoomState | null> {
    const raw = await this.redis.get(this.key(roomId));
    return raw ? JSON.parse(raw) : null;
  }

  async setRoomState(state: RoomState): Promise<void> {
    await this.redis.set(this.key(state.roomId), JSON.stringify(state));
  }

  async updateLockOwner(
    roomId: string,
    playerId: string | null,
  ): Promise<void> {
    const state = await this.getRoomState(roomId);
    if (!state) return;
    state.lockOwnerId = playerId;
    await this.setRoomState(state);
  }

  async addActivePlayer(roomId: string, playerId: string): Promise<void> {
    const state = await this.getRoomState(roomId);
    if (!state) return;
    if (!state.activePlayerIds.includes(playerId)) {
      state.activePlayerIds.push(playerId);
    }
    await this.setRoomState(state);
  }

  async removeActivePlayer(roomId: string, playerId: string): Promise<void> {
    const state = await this.getRoomState(roomId);
    if (!state) return;
    state.activePlayerIds = state.activePlayerIds.filter(
      (id) => id !== playerId,
    );
    await this.setRoomState(state);
  }

  async deleteRoomState(roomId: string): Promise<void> {
    await this.redis.del(this.key(roomId));
  }

  async onModuleDestroy(): Promise<void> {
    await this.redis.quit();
  }
}
