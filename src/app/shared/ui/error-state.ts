import { Component, input, output } from '@angular/core';

@Component({
  selector: 'app-error-state',
  template: `
    <div role="alert" class="rounded-lg border border-red-200 bg-red-50 p-6 text-center">
      <p class="font-medium text-red-800">{{ message() }}</p>
      <button
        type="button"
        class="mt-4 rounded-md bg-red-700 px-4 py-2 text-sm font-medium text-white hover:bg-red-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-700"
        (click)="retry.emit()"
      >
        Skúsiť znova
      </button>
    </div>
  `,
})
export class ErrorState {
  readonly message = input.required<string>();
  readonly retry = output();
}
