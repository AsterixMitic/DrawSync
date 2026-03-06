import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';

export interface RoomInfo { id: string; status: string; roundCount: number; playerMaxCount: number; roomOwnerId: string; }
export interface PlayerInfo { playerId: string; userId: string; state: string; score: number; }
interface ApiResponse<T> { success: boolean; data: T; error?: string; }

@Injectable({ providedIn: 'root' })
export class RoomService {
  constructor(private http: HttpClient) {}

  createRoom(roundCount: number, playerMaxCount: number) {
    return this.http.post<ApiResponse<{ room: RoomInfo; player: PlayerInfo }>>(`${environment.apiUrl}/rooms`, { roundCount, playerMaxCount });
  }
}
