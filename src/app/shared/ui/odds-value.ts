import { DecimalPipe } from '@angular/common';
import { Component, effect, ElementRef, inject, input } from '@angular/core';

const FLASH_UP = '#a7f3d0'; // Tailwind emerald-200
const FLASH_DOWN = '#fecaca'; // Tailwind red-200
const FLASH_MS = 800;

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
  host: { class: 'block rounded' },
})
export class OddsValue {
  readonly value = input.required<number | null>();
  /** Identity of these odds (match, bookmaker, outcome); without it the value never flashes. */
  readonly key = input<string | null>(null);

  private readonly element = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
  private previous: { key: string | null; value: number | null } | null = null;

  constructor() {
    // A side effect on the DOM, not derived state, so `effect` (not `computed`) is the right tool.
    effect(() => {
      const key = this.key();
      const value = this.value();
      const previous = this.previous;
      this.previous = { key, value };

      // Flash only a real change of the same odds: not on first render, not when a recycled
      // virtual-scroll row shows another match, not when the bookmaker changes.
      if (key === null || previous?.key !== key || previous.value === null || value === null) {
        return;
      }
      if (value !== previous.value) {
        this.flash(value > previous.value ? FLASH_UP : FLASH_DOWN);
      }
    });
  }

  private flash(color: string): void {
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return;
    }
    this.element.animate([{ backgroundColor: color }, { backgroundColor: 'transparent' }], {
      duration: FLASH_MS,
      easing: 'ease-out',
    });
  }
}
