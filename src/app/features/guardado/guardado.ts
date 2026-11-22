import { Component, computed, inject, input, signal } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';

import { BarChart, BarraItem } from '../../components/bar-chart/bar-chart';
import { MoedaPipe } from '../../components/pipes/moeda.pipe';
import { StatCard } from '../../components/stat-card/stat-card';
import { TransacaoModal } from '../../components/transacao-modal/transacao-modal';
import { TransactionItem } from '../../components/transaction-item/transaction-item';
import {
  abreviacaoDoMes,
  mesAtual,
  nomeDoMes,
  nomeDoMesSemAno,
  somarMeses,
} from '../../core/utils/mes';
import { valorEstavel } from '../../core/utils/resource';
import { injetarSeletorMes } from '../../core/utils/seletor-mes';
import { TipoTransacao, Transacao } from '../../interface/transacao.interface';
import { TransacaoService } from '../../service/transacao.service';

/** Quantos meses o gráfico mostra (terminando no mês atual). */
const MESES_NO_GRAFICO = 6;

interface EstadoModal {
  transacao: Transacao | null;
}

@Component({
  selector: 'app-guardado',
  imports: [MoedaPipe, StatCard, BarChart, TransactionItem, TransacaoModal],
  templateUrl: './guardado.html',
  styleUrl: './guardado.scss',
})
export class Guardado {
  private readonly transacaoService = inject(TransacaoService);

  /** Query param ?mes=yyyy-MM (via withComponentInputBinding). */
  readonly mes = input<string>();

  /** Seleção limitada à janela do gráfico. */
  protected readonly seletor = injetarSeletorMes(this.mes, {
    minimo: somarMeses(mesAtual(), -(MESES_NO_GRAFICO - 1)),
  });

  protected readonly tiposPermitidos: TipoTransacao[] = ['GUARDADO'];

  // ───────────── Dados (todos recarregam com `versao`) ─────────────

  protected readonly totalResource = rxResource({
    params: () => this.transacaoService.versao(),
    stream: () => this.transacaoService.getTotalGuardado(),
  });

  protected readonly porMesResource = rxResource({
    params: () => this.transacaoService.versao(),
    stream: () => this.transacaoService.getGuardadoPorMes(MESES_NO_GRAFICO),
  });

  protected readonly registrosResource = rxResource({
    params: () => ({ mes: this.seletor.selecionado(), versao: this.transacaoService.versao() }),
    stream: ({ params }) => this.transacaoService.listarPorMes(params.mes, 'GUARDADO'),
  });

  protected readonly total = valorEstavel(this.totalResource, () => null);
  private readonly porMes = valorEstavel(this.porMesResource, () => null);
  protected readonly registros = valorEstavel(this.registrosResource, () =>
    this.seletor.selecionado(),
  );

  protected readonly erro = computed(
    () =>
      !!(this.totalResource.error() || this.porMesResource.error() || this.registrosResource.error()),
  );

  // ───────────── Derivados ─────────────

  protected readonly nomeMesSelecionado = computed(() => nomeDoMes(this.seletor.selecionado()));
  protected readonly nomeMesSemAno = computed(() => nomeDoMesSemAno(this.seletor.selecionado()));

  protected readonly barras = computed<BarraItem[]>(() =>
    (this.porMes() ?? []).map((g) => ({
      id: g.mes,
      rotulo: abreviacaoDoMes(g.mes),
      rotuloCompleto: nomeDoMes(g.mes),
      valor: g.valor,
    })),
  );

  /** Total guardado no mês selecionado (undefined enquanto carrega). */
  protected readonly totalDoMes = computed(() => {
    const porMes = this.porMes();
    if (!porMes) return undefined;
    return porMes.find((g) => g.mes === this.seletor.selecionado())?.valor ?? 0;
  });

  protected readonly placeholders = [1, 2];

  // ───────────── Modal ─────────────

  protected readonly modal = signal<EstadoModal | null>(null);

  protected abrirNovo(): void {
    this.modal.set({ transacao: null });
  }

  protected abrirEdicao(t: Transacao): void {
    this.modal.set({ transacao: t });
  }

  /** Salvo/excluído: os resources recarregam sozinhos via `versao` do service. */
  protected fecharModal(): void {
    this.modal.set(null);
  }

  protected tentarNovamente(): void {
    if (this.totalResource.error()) this.totalResource.reload();
    if (this.porMesResource.error()) this.porMesResource.reload();
    if (this.registrosResource.error()) this.registrosResource.reload();
  }
}
