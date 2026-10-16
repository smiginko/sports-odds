import { Component } from '@angular/core';

@Component({
  selector: 'app-loading-state',
  template: `
    <div role="status" class="space-y-3">
      <span class="sr-only">Načítavam…</span>
      @for (row of rows; track $index) {
        <div class="h-16 animate-pulse rounded-lg bg-slate-200"></div>
      }
    </div>
  `,
})
export class LoadingState {
  protected readonly rows = Array.from({ length: 6 });
}
