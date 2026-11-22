import { Component, computed, input } from '@angular/core';

import { MoedaPipe } from '../pipes/moeda.pipe';

export interface FatiaDonut {
  label: string;
  valor: number;
  /** Qualquer cor CSS (hex, var(--x)…). */
  cor: string;
}

interface Segmento {
  label: string;
  cor: string;
  dasharray: string;
  dashoffset: number;
}

const RAIO = 80;
const CIRCUNFERENCIA = 2 * Math.PI * RAIO;
/** Espaço entre as fatias (em unidades do viewBox). */
const ESPACO = 2.5;

const moeda = new MoedaPipe();

/** Gráfico de rosca em SVG puro, com o total no centro. */
@Component({
  selector: 'app-donut-chart',
  imports: [MoedaPipe],
  templateUrl: './donut-chart.html',
  styleUrl: './donut-chart.scss',
})
export class DonutChart {
  readonly fatias = input.required<FatiaDonut[]>();
  /** Valor exibido no centro. Se omitido, usa a soma das fatias. */
  readonly total = input<number>();
  readonly rotuloTotal = input('Total');

  protected readonly raio = RAIO;

  private readonly fatiasValidas = computed(() => this.fatias().filter((f) => f.valor > 0));

  protected readonly valorTotal = computed(
    () => this.total() ?? this.fatiasValidas().reduce((acc, f) => acc + f.valor, 0),
  );

  protected readonly segmentos = computed<Segmento[]>(() => {
    const fatias = this.fatiasValidas();
    const soma = fatias.reduce((acc, f) => acc + f.valor, 0);
    if (soma <= 0) return [];

    let acumulado = 0;
    return fatias.map((f) => {
      const comprimento = (f.valor / soma) * CIRCUNFERENCIA;
      const segmento: Segmento = {
        label: f.label,
        cor: f.cor,
        dasharray: `${Math.max(comprimento - ESPACO, 0)} ${CIRCUNFERENCIA}`,
        dashoffset: -acumulado,
      };
      acumulado += comprimento;
      return segmento;
    });
  });

  protected readonly ariaLabel = computed(() => {
    const itens = this.fatiasValidas()
      .map((f) => `${f.label}: ${moeda.transform(f.valor)}`)
      .join('; ');
    return `${this.rotuloTotal()}: ${moeda.transform(this.valorTotal())}. ${itens}`;
  });
}
