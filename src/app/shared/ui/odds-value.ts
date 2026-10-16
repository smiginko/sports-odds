import { DecimalPipe } from '@angular/common';
import { Component, input } from '@angular/core';

@Component({
  selector: 'app-odds-value',
  imports: [DecimalPipe],
  template: `
    @if (value() !== null) {
      {{ value() | number: '1.2-2' }}
    } @else {
      –
    }
  `,
})
export class OddsValue {
  readonly value = input.required<number | null>();
}
