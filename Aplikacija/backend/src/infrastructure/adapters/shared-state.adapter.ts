import { Injectable } from '@nestjs/common';
import { ISharedStatePort, RoomState } from '../../domain/ports';

@Injectable()
export class SharedStateAdapter implements ISharedStatePort {
  private readonly rooms = new Map<string, RoomState>();

  async getRoomState(roomId: string): Promise<RoomState | null> {
    const state = this.rooms.get(roomId);
    return state ? { ...state, activePlayerIds: [...state.activePlayerIds] } : null;
  }

  async setRoomState(state: RoomState): Promise<void> {
    this.rooms.set(state.roomId, {
      ...state,
      activePlayerIds: [...state.activePlayerIds]
    });
  }

  async updateLockOwner(roomId: string, playerId: string | null): Promise<void> {
    const state = this.rooms.get(roomId);
    if (!state) return;
    this.rooms.set(roomId, { ...state, lockOwnerId: playerId });
  }

  async addActivePlayer(roomId: string, playerId: string): Promise<void> {
    const state = this.rooms.get(roomId);
    if (!state) return;
    const activePlayerIds = state.activePlayerIds.includes(playerId)
      ? state.activePlayerIds
      : [...state.activePlayerIds, playerId];
    this.rooms.set(roomId, { ...state, activePlayerIds });
  }

  async removeActivePlayer(roomId: string, playerId: string): Promise<void> {
    const state = this.rooms.get(roomId);
    if (!state) return;
    const activePlayerIds = state.activePlayerIds.filter((id) => id !== playerId);
    this.rooms.set(roomId, { ...state, activePlayerIds });
  }

  async deleteRoomState(roomId: string): Promise<void> {
    this.rooms.delete(roomId);
  }
}
