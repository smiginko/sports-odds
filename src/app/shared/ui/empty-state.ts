import { Component, input } from '@angular/core';

/** "Nothing here" panel: a heading, and the parent's own text and optional action inside. */
@Component({
  selector: 'app-empty-state',
  template: `
    <div class="card flex max-w-140 flex-col items-start gap-3 p-6 text-ink-muted">
      <span class="grid size-10 place-items-center rounded-md bg-surface-hover">
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2.2"
          stroke-linecap="round"
          aria-hidden="true"
          class="size-5"
        >
          <circle cx="11" cy="11" r="7" />
          <path d="M20 20l-3.5-3.5M8 11h6" />
        </svg>
      </span>
      <h2 class="font-display text-title text-ink">{{ heading() }}</h2>
      <ng-content />
    </div>
  `,
  host: { class: 'block' },
})
export class EmptyState {
  /** Not called `title`: that is also an HTML attribute and would show as a tooltip. */
  readonly heading = input.required<string>();
}
