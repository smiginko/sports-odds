import { DatePipe, DecimalPipe } from '@angular/common';
import { booleanAttribute, Component, computed, inject, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ErrorState } from '../../shared/ui/error-state';
import { LoadingState } from '../../shared/ui/loading-state';
import { OddsValue } from '../../shared/ui/odds-value';
import { FavoriteButton } from '../favorites/favorite-button';
import { DEMO_MATCH_COUNT } from './demo-matches';
import { MatchesStore } from './matches.store';

@Component({
  selector: 'app-matches-page',
  imports: [RouterLink, DatePipe, DecimalPipe, LoadingState, ErrorState, OddsValue, FavoriteButton],
  providers: [MatchesStore],
  templateUrl: './matches-page.html',
})
export class MatchesPage {
  readonly sportKey = input.required<string>();
  /** `?demo=true` in the URL adds generated matches to the API response. */
  readonly demo = input(false, { transform: booleanAttribute });
  protected readonly store = inject(MatchesStore);
  protected readonly demoCount = DEMO_MATCH_COUNT;
  protected readonly params = computed(() => ({
    sportKey: this.sportKey(),
    demo: this.demo(),
  }));

  constructor() {
    this.store.load(this.params);
  }
}
