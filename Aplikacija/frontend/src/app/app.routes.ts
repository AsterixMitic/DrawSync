import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./features/home/home.page').then((m) => m.HomePage),
  },
  {
    path: 'lobby',
    loadComponent: () =>
      import('./features/lobby/lobby.page').then((m) => m.LobbyPage),
  },
  {
    path: 'room/:roomId',
    loadComponent: () =>
      import('./features/room/room.page').then((m) => m.RoomPage),
  },
  {
    path: 'game/:roomId',
    loadComponent: () =>
      import('./features/game/game.page').then((m) => m.GamePage),
  },
  {
    path: '**',
    redirectTo: '',
  },
];
