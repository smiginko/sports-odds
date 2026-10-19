import { DatePipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AuthStore } from '../../core/auth/auth.store';
import { FavoritesStore } from '../../core/favorites/favorites.store';

@Component({
  selector: 'app-client-page',
  imports: [RouterLink, DatePipe],
  templateUrl: './client-page.html',
})
export class ClientPage {
  protected readonly auth = inject(AuthStore);
  protected readonly favorites = inject(FavoritesStore);
  private readonly router = inject(Router);

  protected logout(): void {
    this.auth.logout();
    this.router.navigate(['/login']);
  }
}
