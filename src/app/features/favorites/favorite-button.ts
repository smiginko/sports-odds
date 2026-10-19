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
      class="grid size-9 cursor-pointer place-items-center rounded-md text-ink-subtle transition-colors duration-120 hover:bg-surface-hover hover:text-ink aria-pressed:text-ember"
    >
      <svg
        viewBox="0 0 24 24"
        stroke="currentColor"
        stroke-width="2"
        stroke-linejoin="round"
        aria-hidden="true"
        class="size-5"
        [attr.fill]="isFavorite() ? 'currentColor' : 'none'"
      >
        <path d="M12 3.5l2.6 5.3 5.9.9-4.3 4.1 1 5.8L12 16.9l-5.2 2.7 1-5.8-4.3-4.1 5.9-.9z" />
      </svg>
    </button>
  `,
})
export class FavoriteButton {
  readonly match = input.required<FavoriteMatch>();
  protected readonly favorites = inject(FavoritesStore);
  protected readonly isFavorite = computed(() => this.favorites.ids().has(this.match().id));
}
