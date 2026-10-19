import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Logo } from '../shared/ui/logo';

@Component({
  selector: 'app-footer',
  imports: [RouterLink, Logo],
  templateUrl: './footer.html',
})
export class Footer {
  protected readonly technologies = ['Angular 22', 'Signal Store', 'Tailwind 4', 'RxJS'];
}
