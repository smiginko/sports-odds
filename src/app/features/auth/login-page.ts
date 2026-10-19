import { Component, inject, signal } from '@angular/core';
import {
  email,
  form,
  FormField,
  FormRoot,
  minLength,
  pattern,
  required,
} from '@angular/forms/signals';
import { Router } from '@angular/router';
import { AuthStore } from '../../core/auth/auth.store';
import { Logo } from '../../shared/ui/logo';

@Component({
  selector: 'app-login-page',
  imports: [FormRoot, FormField, Logo],
  templateUrl: './login-page.html',
})
export class LoginPage {
  private readonly auth = inject(AuthStore);
  private readonly router = inject(Router);

  protected readonly model = signal({ email: '', password: '' });

  protected readonly loginForm = form(
    this.model,
    (path) => {
      required(path.email, { message: 'Zadaj email.' });
      email(path.email, { message: 'Email nemá platný formát.' });
      required(path.password, { message: 'Zadaj heslo.' });
      minLength(path.password, 8, { message: 'Heslo musí mať aspoň 8 znakov.' });
      pattern(path.password, /[A-Z]/, { message: 'Heslo musí obsahovať veľké písmeno.' });
      pattern(path.password, /\d/, { message: 'Heslo musí obsahovať číslicu.' });
    },
    {
      submission: {
        action: async () => {
          this.auth.login(this.model().email);
          await this.router.navigate(['/client']);
        },
      },
    },
  );
}
