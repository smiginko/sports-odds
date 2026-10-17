import { Component, computed, inject, input } from '@angular/core';
import { FavoriteMatch, FavoritesStore } from '../../core/favorites/favorites.store';

@Component({
  selector: 'app-favorite-button',
  template: `
    <button
      type="button"
      [attr.aria-pressed]="isFavorite()"
      [attr.aria-label]="'Obľúbený zápas ' + match().homeTeam + ' – ' + match().awayTeam"
      [title]="isFavorite() ? 'Odobrať z obľúbených' : 'Pridať do obľúbených'"
      (click)="favorites.toggle(match())"
      class="rounded-md p-1.5 text-slate-400 hover:text-amber-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-700 aria-pressed:text-amber-500"
    >
      <svg
        viewBox="0 0 24 24"
        stroke="currentColor"
        stroke-width="1.5"
        class="size-6"
        aria-hidden="true"
        [attr.fill]="isFavorite() ? 'currentColor' : 'none'"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          d="M11.48 3.499a.562.562 0 0 1 1.04 0l2.125 5.111a.563.563 0 0 0 .475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 0 0-.182.557l1.285 5.385a.562.562 0 0 1-.84.61l-4.725-2.885a.562.562 0 0 0-.586 0L6.982 20.54a.562.562 0 0 1-.84-.61l1.285-5.386a.562.562 0 0 0-.182-.557l-4.204-3.602a.562.562 0 0 1 .321-.988l5.518-.442a.563.563 0 0 0 .475-.345L11.48 3.5Z"
        />
      </svg>
    </button>
  `,
})
export class FavoriteButton {
  readonly match = input.required<FavoriteMatch>();
  protected readonly favorites = inject(FavoritesStore);
  protected readonly isFavorite = computed(() => this.favorites.ids().has(this.match().id));
}
