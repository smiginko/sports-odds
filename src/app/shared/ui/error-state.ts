import { Component, input, output } from '@angular/core';

@Component({
  selector: 'app-error-state',
  template: `
    <div role="alert" class="card flex max-w-140 flex-col items-start gap-3 p-6">
      <span class="grid size-10 place-items-center rounded-md bg-fall-soft text-fall">
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2.2"
          stroke-linecap="round"
          aria-hidden="true"
          class="size-5"
        >
          <path d="M12 8v5M12 16.5v.5" />
          <circle cx="12" cy="12" r="9" />
        </svg>
      </span>
      <h2 class="font-display text-title">Dáta sa nepodarilo načítať</h2>
      <p class="text-ink-muted">{{ message() }}</p>
      <!-- Secondary: retrying is not the main action of the page. -->
      <button type="button" class="btn btn-secondary" (click)="retry.emit()">Skúsiť znova</button>
    </div>
  `,
})
export class ErrorState {
  readonly message = input.required<string>();
  readonly retry = output();
}
