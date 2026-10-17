import { DatePipe } from '@angular/common';
import { Component, input, output } from '@angular/core';
import { RouterLink } from '@angular/router';
import { OddsValue } from '../../shared/ui/odds-value';
import { FavoriteButton } from '../favorites/favorite-button';
import { MatchRowData } from './matches.store';

/** Height of one row in px for the virtual scroll; must match the `h-30` class on the host. */
export const MATCH_ROW_HEIGHT = 120;

@Component({
  selector: 'app-match-row',
  imports: [RouterLink, DatePipe, OddsValue, FavoriteButton],
  templateUrl: './match-row.html',
  host: { class: 'block h-30 pb-2' },
})
export class MatchRow {
  readonly row = input.required<MatchRowData>();
  readonly selectMatch = output();
}
