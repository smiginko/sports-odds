import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthStore } from '../core/auth/auth.store';
import { FavoritesStore } from '../core/favorites/favorites.store';
import { Logo } from '../shared/ui/logo';

@Component({
  selector: 'app-header',
  imports: [RouterLink, RouterLinkActive, Logo],
  templateUrl: './header.html',
  // Sticky on the host: a sticky element only sticks inside its parent, and here that is the whole page.
  host: { class: 'sticky top-0 z-10' },
})
export class Header {
  protected readonly auth = inject(AuthStore);
  protected readonly favorites = inject(FavoritesStore);
}
