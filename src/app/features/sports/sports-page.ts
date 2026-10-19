import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { EmptyState } from '../../shared/ui/empty-state';
import { ErrorState } from '../../shared/ui/error-state';
import { LoadingState } from '../../shared/ui/loading-state';
import { SportsStore } from './sports.store';

@Component({
  selector: 'app-sports-page',
  imports: [RouterLink, LoadingState, ErrorState, EmptyState],
  templateUrl: './sports-page.html',
})
export class SportsPage {
  protected readonly store = inject(SportsStore);
}
