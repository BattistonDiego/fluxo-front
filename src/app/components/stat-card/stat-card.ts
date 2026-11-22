import { Component, input } from '@angular/core';

import { MoedaPipe } from '../pipes/moeda.pipe';

export type VarianteStatCard = 'in' | 'out' | 'accent';
export type IconeStatCard = 'seta-baixo' | 'seta-cima' | 'cofrinho';

/** Card de indicador: ícone colorido + label + valor em euro. */
@Component({
  selector: 'app-stat-card',
  imports: [MoedaPipe],
  templateUrl: './stat-card.html',
  styleUrl: './stat-card.scss',
  host: {
    '[attr.data-variante]': 'variante()',
    '[attr.aria-busy]': 'carregando()',
    '[attr.data-layout-mobile]': 'layoutMobile()',
  },
})
export class StatCard {
  readonly label = input.required<string>();
  readonly valor = input<number | null | undefined>();
  readonly variante = input<VarianteStatCard>('accent');
  readonly icone = input.required<IconeStatCard>();
  /** Mostra um skeleton no lugar do valor. */
  readonly carregando = input(false);
  /**
   * Como o card se apresenta no mobile:
   * 'card' (igual ao desktop) ou 'linha' (linha de lista; o pai fornece o fundo do grupo).
   */
  readonly layoutMobile = input<'card' | 'linha'>('card');
}
