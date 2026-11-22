import { Component, computed, input } from '@angular/core';

import { Categoria } from '../../interface/categoria.interface';
import { Transacao } from '../../interface/transacao.interface';
import { CategoryIcon } from '../category-icon/category-icon';
import { MoedaPipe } from '../pipes/moeda.pipe';

/**
 * Linha de transação. Usada como atributo num <button>:
 * `<button app-transaction-item [transacao]="t" [categoria]="c" (click)="…">`
 */
@Component({
  selector: 'button[app-transaction-item]',
  imports: [CategoryIcon, MoedaPipe],
  templateUrl: './transaction-item.html',
  styleUrl: './transaction-item.scss',
  host: {
    type: 'button',
    '[attr.aria-label]': `'Editar ' + transacao().descricao`,
    '[style.--cor]': 'visual().cor',
  },
})
export class TransactionItem {
  readonly transacao = input.required<Transacao>();
  /** Categoria da transação (ignorada quando o tipo é GUARDADO). */
  readonly categoria = input<Categoria | undefined>();

  protected readonly visual = computed(() => {
    const t = this.transacao();
    if (t.tipo === 'GUARDADO') {
      return { nome: 'Guardado', icone: 'piggy', cor: 'var(--cat-guardado)' };
    }
    const c = this.categoria();
    return {
      nome: c?.nome ?? 'Sem categoria',
      icone: c?.icone ?? 'dots',
      cor: c?.cor ?? 'var(--cat-outros)',
    };
  });

  protected readonly sinal = computed(() => (this.transacao().tipo === 'ENTRADA' ? '+' : '−'));
}
