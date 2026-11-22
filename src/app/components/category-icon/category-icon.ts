import { Component, computed, input } from '@angular/core';

/** Paths de linha (viewBox 24x24). Cada entrada pode ter vários subpaths. */
const ICONES: Record<string, string> = {
  house: 'M4 11l8-7 8 7v9H4z M10 20v-5h4v5',
  cart: 'M3 4h2l2.4 11h11l2-8H6.2 M9 20.5a1 1 0 1 0 0-2 1 1 0 0 0 0 2z M18 20.5a1 1 0 1 0 0-2 1 1 0 0 0 0 2z',
  bus: 'M6 17V6a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v11z M6 11h12 M8 17v3 M16 17v3',
  game: 'M6 9h12a3 3 0 0 1 3 3v2a3 3 0 0 1-5.4 1.8L14 14h-4l-1.6 1.8A3 3 0 0 1 3 14v-2a3 3 0 0 1 3-3z M8 11v3 M6.5 12.5h3',
  repeat: 'M17 2l3 3-3 3 M4 11V9a4 4 0 0 1 4-4h12 M7 22l-3-3 3-3 M20 13v2a4 4 0 0 1-4 4H4',
  heart: 'M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z',
  bag: 'M5 8h14l-1 12H6z M9 8V6a3 3 0 0 1 6 0v2',
  dots: 'M6 12a1 1 0 1 1-2 0 1 1 0 0 1 2 0z M13 12a1 1 0 1 1-2 0 1 1 0 0 1 2 0z M20 12a1 1 0 1 1-2 0 1 1 0 0 1 2 0z',
  briefcase: 'M4 8h16v11H4z M9 8V5h6v3 M4 13h16',
  laptop: 'M5 5h14v10H5z M3 19h18',
  piggy:
    'M19 5c-1.5 0-2.8 1.4-3 2-3.5-1.5-11-.3-11 5 0 1.8 0 3 2 4.5V20h4v-2h3v2h4v-4c1-.5 1.7-1 2-2h2v-4h-2c0-1-.5-1.5-1-2V5z M2 9v1c0 1.1.9 2 2 2h1 M16 11h.01',
};

/** Ícone de linha de categoria. Herda a cor do texto (currentColor). */
@Component({
  selector: 'app-category-icon',
  template: `
    <svg
      viewBox="0 0 24 24"
      [attr.width]="tamanho()"
      [attr.height]="tamanho()"
      fill="none"
      stroke="currentColor"
      stroke-width="1.8"
      stroke-linecap="round"
      stroke-linejoin="round"
      aria-hidden="true"
    >
      <path [attr.d]="path()" />
    </svg>
  `,
  styles: `
    :host {
      display: inline-flex;
    }

    /* O pai pode trocar o tamanho via CSS (ex.: no mobile) definindo --tamanho-icone. */
    svg {
      width: var(--tamanho-icone, var(--_tamanho));
      height: var(--tamanho-icone, var(--_tamanho));
    }
  `,
  host: {
    '[style.--_tamanho]': `tamanho() + 'px'`,
  },
})
export class CategoryIcon {
  /** Nome do ícone (house, cart, bus, game, repeat, heart, bag, dots, briefcase, laptop, piggy). */
  readonly nome = input.required<string>();
  readonly tamanho = input(20);

  protected readonly path = computed(() => ICONES[this.nome()] ?? ICONES['dots']);
}
