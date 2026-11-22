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

/**
 * Altura de cada barra como fração (0–1) do maior valor.
 * A altura em px sai do CSS (--altura-max: 170px no desktop, 120px no mobile; mínimo 8px).
 */
const FRACOES_SKELETON = [0.53, 0.76, 0.41, 0.88, 0.65, 0.7];

const formatadorInteiro = new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 0 });
const formatadorDecimal = new Intl.NumberFormat('pt-BR', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});
const moeda = new MoedaPipe();

/** "300" quando inteiro, "46,32" caso contrário (o "€" fica num span à parte). */
function valorCompacto(valor: number): string {
  const formatador = Number.isInteger(valor) ? formatadorInteiro : formatadorDecimal;
  return formatador.format(valor);
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

  protected readonly fracoesSkeleton = FRACOES_SKELETON;

  protected readonly barras = computed(() => {
    const itens = this.itens();
    const maior = Math.max(0, ...itens.map((i) => i.valor));
    return itens.map((item) => ({
      ...item,
      fracao: maior > 0 ? item.valor / maior : 0,
      valorFormatado: valorCompacto(item.valor),
      ariaLabel: `${item.rotuloCompleto}: ${moeda.transform(item.valor)}`,
    }));
  });
}
