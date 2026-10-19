import { DatePipe } from '@angular/common';
import { Component, input, output } from '@angular/core';
import { RouterLink } from '@angular/router';
import { OddsValue } from '../../shared/ui/odds-value';
import { FavoriteButton } from '../favorites/favorite-button';
import { MatchRowData } from './matches.store';

/** Height of one row in px for the virtual scroll; must match the host classes `h-40 md:h-20`. */
export const MATCH_ROW_HEIGHT = { narrow: 160, wide: 80 };

@Component({
  selector: 'app-match-row',
  imports: [RouterLink, DatePipe, OddsValue, FavoriteButton],
  templateUrl: './match-row.html',
  host: { class: 'block h-40 pb-2 md:h-20' },
})
export class MatchRow {
  readonly row = input.required<MatchRowData>();
  readonly selectMatch = output();
}
