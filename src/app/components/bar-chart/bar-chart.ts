import { Component, computed, input, output } from '@angular/core';

import { MoedaPipe } from '../pipes/moeda.pipe';

export interface BarraItem {
  /** Identificador emitido ao selecionar (ex.: '2026-11'). */
  id: string;
  /** Rótulo curto embaixo da barra (ex.: 'Nov'). */
  rotulo: string;
  /** Rótulo para leitores de tela (ex.: 'Novembro 2026'). */
  rotuloCompleto: string;
  valor: number;
}

/** Altura máxima da barra (px); o restante dos 240px fica para valor e rótulo. */
const ALTURA_MAXIMA = 170;
const ALTURA_MINIMA = 8;

/** Alturas dos placeholders enquanto carrega. */
const ALTURAS_SKELETON = [90, 130, 70, 150, 110, 120];

const formatadorInteiro = new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 0 });
const formatadorDecimal = new Intl.NumberFormat('pt-BR', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});
const moeda = new MoedaPipe();

/** "300 €" quando inteiro, "46,32 €" caso contrário. */
function valorCompacto(valor: number): string {
  const formatador = Number.isInteger(valor) ? formatadorInteiro : formatadorDecimal;
  return `${formatador.format(valor)} €`;
}

/** Gráfico de barras verticais em HTML/CSS; cada barra é um botão selecionável. */
@Component({
  selector: 'app-bar-chart',
  templateUrl: './bar-chart.html',
  styleUrl: './bar-chart.scss',
})
export class BarChart {
  readonly itens = input.required<BarraItem[]>();
  /** id do item selecionado. */
  readonly selecionado = input<string | null>(null);
  /** Mostra barras de skeleton no lugar dos dados. */
  readonly carregando = input(false);
  readonly ariaLabel = input('Escolha um mês');

  readonly selecionar = output<string>();

  protected readonly alturasSkeleton = ALTURAS_SKELETON;

  protected readonly barras = computed(() => {
    const itens = this.itens();
    const maior = Math.max(0, ...itens.map((i) => i.valor));
    return itens.map((item) => ({
      ...item,
      altura: maior > 0 ? Math.max((item.valor / maior) * ALTURA_MAXIMA, ALTURA_MINIMA) : ALTURA_MINIMA,
      valorFormatado: valorCompacto(item.valor),
      ariaLabel: `${item.rotuloCompleto}: ${moeda.transform(item.valor)}`,
    }));
  });
}
