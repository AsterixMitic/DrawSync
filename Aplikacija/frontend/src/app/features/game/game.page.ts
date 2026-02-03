import { Component } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatListModule } from '@angular/material/list';
import { MatProgressBarModule } from '@angular/material/progress-bar';

@Component({
  selector: 'app-game-page',
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
    MatProgressBarModule,
  ],
  templateUrl: './game.page.html',
  styleUrl: './game.page.css',
})
export class GamePage {
  protected readonly chatControl = new FormControl('', { nonNullable: true });

  protected readonly players = [
    { name: 'Mare', score: 120, role: 'Crta' },
    { name: 'Ana', score: 95, role: 'Pogađa' },
    { name: 'Luka', score: 70, role: 'Pogađa' },
  ];

  protected readonly messages = [
    { author: 'Ana', text: 'Mislim da je kuća?', time: '12:41' },
    { author: 'Mare', text: 'Blizu!', time: '12:41' },
    { author: 'Luka', text: 'Da li je most?', time: '12:42' },
  ];

  protected onSendMessage(): void {
    const trimmed = this.chatControl.value.trim();
    if (!trimmed) {
      return;
    }

    console.info('Send message', trimmed);
    this.chatControl.setValue('');
  }
}
