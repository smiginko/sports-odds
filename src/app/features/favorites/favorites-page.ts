import { DatePipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FavoritesStore } from '../../core/favorites/favorites.store';
import { FavoriteButton } from './favorite-button';

@Component({
  selector: 'app-favorites-page',
  imports: [RouterLink, DatePipe, FavoriteButton],
  templateUrl: './favorites-page.html',
})
export class FavoritesPage {
  protected readonly favorites = inject(FavoritesStore);
}
