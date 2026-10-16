import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', redirectTo: 'sports', pathMatch: 'full' },
  {
    path: 'sports',
    title: 'Športy',
    loadComponent: () => import('./features/sports/sports-page').then((m) => m.SportsPage),
  },
  { path: '**', redirectTo: 'sports' },
];
