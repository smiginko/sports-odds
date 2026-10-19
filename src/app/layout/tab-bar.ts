import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthStore } from '../core/auth/auth.store';
import { FavoritesStore } from '../core/favorites/favorites.store';

/** Bottom navigation on phones; under 640 px it replaces the navigation in the header. */
@Component({
  selector: 'app-tab-bar',
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './tab-bar.html',
})
export class TabBar {
  protected readonly auth = inject(AuthStore);
  protected readonly favorites = inject(FavoritesStore);
}
