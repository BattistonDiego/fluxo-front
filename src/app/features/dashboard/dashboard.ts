import { DecimalPipe } from '@angular/common';
import { Component, computed, inject, input, signal } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';

import { DonutChart, FatiaDonut } from '../../components/donut-chart/donut-chart';
import { Fab } from '../../components/fab/fab';
import { MoedaPipe } from '../../components/pipes/moeda.pipe';
import { StatCard } from '../../components/stat-card/stat-card';
import { TransacaoModal } from '../../components/transacao-modal/transacao-modal';
import { nomeDoMes } from '../../core/utils/mes';
import { valorEstavel } from '../../core/utils/resource';
import { injetarSeletorMes } from '../../core/utils/seletor-mes';
import { TransacaoService } from '../../service/transacao.service';

@Component({
  selector: 'app-dashboard',
  imports: [RouterLink, DecimalPipe, MoedaPipe, StatCard, DonutChart, Fab, TransacaoModal],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
})
export class Dashboard {
  private readonly transacaoService = inject(TransacaoService);

  /** Query param ?mes=yyyy-MM (ligado via withComponentInputBinding). */
  readonly mes = input<string>();

  protected readonly seletor = injetarSeletorMes(this.mes);

  protected readonly titulo = computed(() => nomeDoMes(this.seletor.selecionado()));

  /** Recarrega ao trocar de mês e sempre que uma transação é criada/editada/excluída. */
  protected readonly resumo = rxResource({
    params: () => ({ mes: this.seletor.selecionado(), versao: this.transacaoService.versao() }),
    stream: ({ params }) => this.transacaoService.getResumoMensal(params.mes),
  });

  /** Resumo do mês selecionado; undefined (skeleton) só ao trocar de mês ou em erro. */
  protected readonly dados = valorEstavel(this.resumo, () => this.seletor.selecionado());

  protected readonly saldo = computed(() => {
    const saldo = this.dados()?.saldo ?? 0;
    return { negativo: saldo < 0, valor: Math.abs(saldo) };
  });

  /** Categorias com gasto, do maior para o menor valor. */
  protected readonly categorias = computed(() =>
    [...(this.dados()?.gastosPorCategoria ?? [])]
      .filter((g) => g.valor > 0)
      .sort((a, b) => b.valor - a.valor),
  );

  protected readonly fatias = computed<FatiaDonut[]>(() =>
    this.categorias().map((g) => ({
      label: g.categoria.nome,
      valor: g.valor,
      cor: g.categoria.cor,
    })),
  );

  protected readonly placeholdersLegenda = [1, 2, 3, 4, 5];

  // ───────────── Modal (aberto pelo FAB no mobile) ─────────────

  protected readonly modalAberto = signal(false);

  protected abrirModal(): void {
    this.modalAberto.set(true);
  }

  /** O resumo recarrega sozinho via `versao` do service. */
  protected fecharModal(): void {
    this.modalAberto.set(false);
  }
}
