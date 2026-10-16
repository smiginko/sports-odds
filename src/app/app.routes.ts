import { Routes } from '@angular/router';
import { authGuard } from './core/auth/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'sports', pathMatch: 'full' },
  {
    path: 'sports',
    title: 'Športy',
    loadComponent: () => import('./features/sports/sports-page').then((m) => m.SportsPage),
  },
  {
    path: 'sports/:sportKey',
    title: 'Zápasy',
    loadComponent: () => import('./features/matches/matches-page').then((m) => m.MatchesPage),
  },
  {
    path: 'login',
    title: 'Prihlásenie',
    loadComponent: () => import('./features/auth/login-page').then((m) => m.LoginPage),
  },
  {
    path: 'client',
    title: 'Klient',
    canActivate: [authGuard],
    loadComponent: () => import('./features/auth/client-page').then((m) => m.ClientPage),
  },
  { path: '**', redirectTo: 'sports' },
];
