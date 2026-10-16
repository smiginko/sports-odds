import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthStore } from '../../core/auth/auth.store';

@Component({
  selector: 'app-client-page',
  template: `
    <div class="mx-auto max-w-sm">
      <h1 class="text-2xl font-bold">Klient</h1>

      <div class="mt-8 rounded-lg border border-slate-200 bg-white p-6">
        <p class="text-sm text-slate-500">Prihlásený ako</p>
        <p class="mt-1 font-medium break-all">{{ auth.email() }}</p>

        <button
          type="button"
          class="mt-6 w-full rounded-md border border-slate-300 px-4 py-2 font-medium hover:bg-slate-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-700"
          (click)="logout()"
        >
          Odhlásiť sa
        </button>
      </div>
    </div>
  `,
})
export class ClientPage {
  protected readonly auth = inject(AuthStore);
  private readonly router = inject(Router);

  protected logout(): void {
    this.auth.logout();
    this.router.navigate(['/login']);
  }
}
