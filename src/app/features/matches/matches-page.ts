import { BreakpointObserver } from '@angular/cdk/layout';
import {
  CdkFixedSizeVirtualScroll,
  CdkVirtualForOf,
  CdkVirtualScrollableWindow,
  CdkVirtualScrollViewport,
} from '@angular/cdk/scrolling';
import { DecimalPipe } from '@angular/common';
import { booleanAttribute, Component, computed, inject, input } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { map } from 'rxjs';
import { EmptyState } from '../../shared/ui/empty-state';
import { ErrorState } from '../../shared/ui/error-state';
import { LoadingState } from '../../shared/ui/loading-state';
import { DEMO_MATCH_COUNT } from './demo-matches';
import { MATCH_ROW_HEIGHT, MatchRow } from './match-row';
import { MatchesStore, MatchRowData } from './matches.store';

@Component({
  selector: 'app-matches-page',
  imports: [
    RouterLink,
    DecimalPipe,
    LoadingState,
    ErrorState,
    EmptyState,
    MatchRow,
    CdkVirtualScrollViewport,
    CdkFixedSizeVirtualScroll,
    CdkVirtualScrollableWindow,
    CdkVirtualForOf,
  ],
  providers: [MatchesStore],
  templateUrl: './matches-page.html',
})
export class MatchesPage {
  readonly sportKey = input.required<string>();
  /** `?demo=true` in the URL adds generated matches to the API response. */
  readonly demo = input(false, { transform: booleanAttribute });
  protected readonly store = inject(MatchesStore);
  protected readonly demoCount = DEMO_MATCH_COUNT;
  /** True from 768 px (`48rem`), the same breakpoint as Tailwind `md:`; there the row is one line. */
  private readonly wide = toSignal(
    inject(BreakpointObserver)
      .observe('(min-width: 48rem)')
      .pipe(map((state) => state.matches)),
    { initialValue: false },
  );
  protected readonly rowHeight = computed(() =>
    this.wide() ? MATCH_ROW_HEIGHT.wide : MATCH_ROW_HEIGHT.narrow,
  );
  protected readonly params = computed(() => ({
    sportKey: this.sportKey(),
    demo: this.demo(),
  }));

  constructor() {
    this.store.load(this.params);
  }

  protected trackById(_index: number, row: MatchRowData): string {
    return row.match.id;
  }
}
