import { Component } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatListModule } from '@angular/material/list';

@Component({
  selector: 'app-lobby-page',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatButtonModule,
    MatCardModule,
    MatChipsModule,
    MatDividerModule,
    MatFormFieldModule,
    MatInputModule,
    MatListModule,
  ],
  templateUrl: './lobby.page.html',
  styleUrl: './lobby.page.css',
})
export class LobbyPage {
  protected readonly createRoomForm = new FormGroup({
    nickname: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    roomName: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
  });

  protected readonly joinRoomForm = new FormGroup({
    nickname: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    roomCode: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
  });

  protected readonly rooms = [
    { code: 'ABCD', name: 'Brzi crteži', players: 3, status: 'Čekanje' },
    { code: 'QWER', name: 'Večernja partija', players: 5, status: 'U toku' },
    { code: 'ZXCV', name: 'Random tema', players: 2, status: 'Čekanje' },
  ];

  protected onCreateRoom(): void {
    if (this.createRoomForm.invalid) {
      this.createRoomForm.markAllAsTouched();
      return;
    }

    console.info('Create room', this.createRoomForm.getRawValue());
  }

  protected onJoinRoom(): void {
    if (this.joinRoomForm.invalid) {
      this.joinRoomForm.markAllAsTouched();
      return;
    }

    console.info('Join room', this.joinRoomForm.getRawValue());
  }
}
