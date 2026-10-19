import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

/** Oddline logo linking home. The size follows the font size the parent sets, e.g. `class="text-xl"`. */
@Component({
  selector: 'app-logo',
  imports: [RouterLink],
  template: `
    <a
      routerLink="/"
      aria-label="Oddline – domov"
      class="inline-flex items-center gap-2.5 rounded-md"
    >
      <svg viewBox="0 0 64 64" aria-hidden="true" class="size-[1.6em] shrink-0">
        <rect width="64" height="64" rx="16" class="fill-volt" />
        <circle cx="20" cy="36" r="8.5" fill="none" stroke-width="6" class="stroke-on-volt" />
        <path
          d="M33 44 L39.5 36 L44 40.5 L52 24"
          fill="none"
          stroke-width="6"
          stroke-linecap="round"
          stroke-linejoin="round"
          class="stroke-on-volt"
        />
      </svg>
      <span class="font-display leading-none font-bold tracking-[-0.02em] text-ink">
        odd<span class="text-volt">line</span>
      </span>
    </a>
  `,
})
export class Logo {}
