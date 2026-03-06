import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  {
    path: 'auth',
    loadComponent: () => import('./pages/auth/auth.component').then(m => m.AuthComponent)
  },
  {
    path: 'home',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/home/home.component').then(m => m.HomeComponent)
  },
  {
    path: 'rooms/create',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/room-create/room-create.component').then(m => m.RoomCreateComponent)
  },
  {
    path: 'game/:roomId',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/game/game.component').then(m => m.GameComponent)
  },
  { path: '**', redirectTo: 'home' }
];
