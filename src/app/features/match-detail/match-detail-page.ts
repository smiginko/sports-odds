import { DatePipe } from '@angular/common';
import { Component, computed, inject, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ErrorState } from '../../shared/ui/error-state';
import { LoadingState } from '../../shared/ui/loading-state';
import { OddsValue } from '../../shared/ui/odds-value';
import { FavoriteButton } from '../favorites/favorite-button';
import { MatchDetailStore } from './match-detail.store';

@Component({
  selector: 'app-match-detail-page',
  imports: [RouterLink, DatePipe, LoadingState, ErrorState, OddsValue, FavoriteButton],
  providers: [MatchDetailStore],
  templateUrl: './match-detail-page.html',
})
export class MatchDetailPage {
  readonly sportKey = input.required<string>();
  readonly eventId = input.required<string>();
  protected readonly store = inject(MatchDetailStore);
  protected readonly params = computed(() => ({
    sportKey: this.sportKey(),
    eventId: this.eventId(),
  }));

  constructor() {
    this.store.load(this.params);
  }
}
