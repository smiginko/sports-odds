import { Component } from '@angular/core';

@Component({
  selector: 'app-loading-state',
  template: `
    <div role="status">
      <span class="sr-only">Načítavam…</span>
      <div aria-hidden="true" class="space-y-2">
        @for (row of rows; track $index) {
          <div
            class="h-18 animate-shimmer rounded-md bg-linear-to-r from-surface-raised via-surface-hover to-surface-raised bg-size-[200%_100%] motion-reduce:animate-none"
          ></div>
        }
      </div>
    </div>
  `,
})
export class LoadingState {
  protected readonly rows = Array.from({ length: 6 });
}
