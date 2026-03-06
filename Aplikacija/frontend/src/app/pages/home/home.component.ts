import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css',
})
export class HomeComponent {
  roomId = '';
  error = '';

  constructor(public auth: AuthService, private router: Router) {}

  joinRoom(): void {
    const id = this.roomId.trim();
    if (!id) { this.error = 'Enter a room ID'; return; }
    this.router.navigate(['/game', id]);
  }

  createRoom(): void {
    this.router.navigate(['/rooms/create']);
  }

  logout(): void {
    this.auth.logout();
    this.router.navigate(['/auth']);
  }
}
