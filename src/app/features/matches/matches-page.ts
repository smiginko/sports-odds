import { DatePipe, DecimalPipe } from '@angular/common';
import { Component, inject, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ErrorState } from '../../shared/ui/error-state';
import { LoadingState } from '../../shared/ui/loading-state';
import { OddsValue } from '../../shared/ui/odds-value';
import { MatchesStore } from './matches.store';

@Component({
  selector: 'app-matches-page',
  imports: [RouterLink, DatePipe, DecimalPipe, LoadingState, ErrorState, OddsValue],
  providers: [MatchesStore],
  templateUrl: './matches-page.html',
})
export class MatchesPage {
  readonly sportKey = input.required<string>();
  protected readonly store = inject(MatchesStore);

  constructor() {
    this.store.load(this.sportKey);
  }
}
