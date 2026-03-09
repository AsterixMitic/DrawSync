import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { RoomService } from '../../services/room.service';
import { GameService } from '../../services/game.service';

@Component({
  selector: 'app-room-create',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './room-create.component.html',
  styleUrl: './room-create.component.css',
})
export class RoomCreateComponent {
  roundCount = 3;
  playerMaxCount = 8;
  loading = false;
  error = '';

  constructor(private roomService: RoomService, private router: Router, private game: GameService) {}

  create(): void {
    this.error = '';
    this.loading = true;
    this.roomService.createRoom(this.roundCount, this.playerMaxCount).subscribe({
      next: res => {
        if (res.success) {
          this.game.setRoomMeta(res.data.room.id, res.data.player.playerId, res.data.room.roomOwnerId);
          this.router.navigate(['/game', res.data.room.id]);
        } else {
          this.error = 'Failed to create room';
          this.loading = false;
        }
      },
      error: err => { this.error = err.error?.error ?? 'Failed to create room'; this.loading = false; },
    });
  }

  back(): void { this.router.navigate(['/home']); }
}
