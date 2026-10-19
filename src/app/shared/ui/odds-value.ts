import { DecimalPipe } from '@angular/common';
import { Component, effect, ElementRef, inject, input, signal, viewChild } from '@angular/core';

// Same values as the tokens --color-rise-soft and --color-fall-soft in styles.css.
const FLASH_UP = '#1f3e36';
const FLASH_DOWN = '#3e2833';
const FLASH_MS = 900;

type Trend = 'up' | 'down';

@Component({
  selector: 'app-odds-value',
  imports: [DecimalPipe],
  template: `
    @if (value() !== null) {
      {{ value() | number: '1.2-2' }}
    } @else {
      <span class="text-ink-subtle">–</span>
      <span class="sr-only">kurz nie je k dispozícii</span>
    }
    @if (key() !== null) {
      <!-- Colour is never alone: the arrow tells up from down. Invisible until a flash. -->
      <span
        #arrow
        aria-hidden="true"
        class="text-[10px] opacity-0"
        [class.text-rise]="trend() === 'up'"
        [class.text-fall]="trend() === 'down'"
      >
        {{ trend() === 'up' ? '▲' : '▼' }}
      </span>
    }
  `,
  host: {
    class:
      'inline-flex items-center justify-center gap-1 rounded-sm font-mono text-odds tabular-nums',
  },
})
export class OddsValue {
  readonly value = input.required<number | null>();
  /** Identity of these odds (match, bookmaker, outcome); without it the value never flashes. */
  readonly key = input<string | null>(null);

  protected readonly trend = signal<Trend>('up');
  private readonly arrow = viewChild<ElementRef<HTMLElement>>('arrow');
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
        this.flash(value > previous.value ? 'up' : 'down');
      }
    });
  }

  private flash(trend: Trend): void {
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return;
    }
    this.trend.set(trend);
    // Fade back to the cell's own background, whatever the parent gave it.
    const resting = getComputedStyle(this.element).backgroundColor;
    const timing = { duration: FLASH_MS, easing: 'ease-out' };
    this.element.animate(
      [{ backgroundColor: trend === 'up' ? FLASH_UP : FLASH_DOWN }, { backgroundColor: resting }],
      timing,
    );
    this.arrow()?.nativeElement.animate([{ opacity: 1 }, { opacity: 0 }], timing);
  }
}
