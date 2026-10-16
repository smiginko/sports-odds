import { Routes } from '@angular/router';

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
  { path: '**', redirectTo: 'sports' },
];
