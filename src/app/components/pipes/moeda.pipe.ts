import { Pipe, PipeTransform } from '@angular/core';

const formatador = new Intl.NumberFormat('pt-BR', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

/**
 * Formata um número como euro no padrão pt-BR.
 * Ex: 1234.5 → "1.234,50 €"
 */
@Pipe({ name: 'moeda' })
export class MoedaPipe implements PipeTransform {
  transform(valor: number | null | undefined): string {
    if (valor == null || Number.isNaN(valor)) return '';
    return `${formatador.format(valor)} €`;
  }
}
