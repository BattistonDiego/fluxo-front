import { Component, computed, effect, inject, input, signal, untracked } from '@angular/core';
import { rxResource, toObservable, toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';
import { debounceTime, distinctUntilChanged, map } from 'rxjs';

import { MoedaPipe } from '../../components/pipes/moeda.pipe';
import { TransacaoModal } from '../../components/transacao-modal/transacao-modal';
import { TransactionItem } from '../../components/transaction-item/transaction-item';
import { hojeIso, rotuloDoDia } from '../../core/utils/data';
import { nomeDoMes } from '../../core/utils/mes';
import { valorEstavel } from '../../core/utils/resource';
import { injetarSeletorMes } from '../../core/utils/seletor-mes';
import { normalizarTexto } from '../../core/utils/texto';
import { Categoria } from '../../interface/categoria.interface';
import { Transacao } from '../../interface/transacao.interface';
import { CategoriaService } from '../../service/categoria.service';
import { TransacaoService } from '../../service/transacao.service';

interface GrupoDia {
  data: string;
  rotulo: string;
  /** Entradas somam; gastos e guardados subtraem. */
  total: number;
  itens: Transacao[];
}

interface EstadoModal {
  transacao: Transacao | null;
}

const BUSCA_DEBOUNCE_MS = 200;

@Component({
  selector: 'app-transacoes',
  imports: [MoedaPipe, TransactionItem, TransacaoModal],
  templateUrl: './transacoes.html',
  styleUrl: './transacoes.scss',
})
export class Transacoes {
  private readonly transacaoService = inject(TransacaoService);
  private readonly categoriaService = inject(CategoriaService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  /** Query params (via withComponentInputBinding). */
  readonly mes = input<string>();
  readonly novo = input<string>();

  protected readonly seletor = injetarSeletorMes(this.mes);
  protected readonly nomeDoMes = nomeDoMes;

  private readonly categorias = toSignal(this.categoriaService.listar(), {
    initialValue: [] as Categoria[],
  });
  protected readonly categoriasPorId = computed(
    () => new Map(this.categorias().map((c) => [c.id, c])),
  );

  // ───────────── Busca ─────────────

  protected readonly busca = signal('');
  private readonly termo = toSignal(
    toObservable(this.busca).pipe(
      debounceTime(BUSCA_DEBOUNCE_MS),
      map(normalizarTexto),
      distinctUntilChanged(),
    ),
    { initialValue: '' },
  );

  // ───────────── Dados ─────────────

  protected readonly lista = rxResource({
    params: () => ({ mes: this.seletor.selecionado(), versao: this.transacaoService.versao() }),
    stream: ({ params }) => this.transacaoService.listarPorMes(params.mes),
  });

  /** Mantém a lista na tela enquanto recarrega após salvar/excluir. */
  protected readonly transacoes = valorEstavel(this.lista, () => this.seletor.selecionado());

  private readonly hoje = hojeIso();

  protected readonly grupos = computed<GrupoDia[]>(() => {
    const termo = this.termo();
    const categorias = this.categoriasPorId();
    const filtradas = (this.transacoes() ?? []).filter((t) => {
      if (!termo) return true;
      const categoria =
        t.tipo === 'GUARDADO' ? 'Guardado' : (categorias.get(t.categoriaId ?? -1)?.nome ?? '');
      return (
        normalizarTexto(t.descricao).includes(termo) || normalizarTexto(categoria).includes(termo)
      );
    });

    const porDia = new Map<string, Transacao[]>();
    for (const t of [...filtradas].sort((a, b) => b.data.localeCompare(a.data) || b.id - a.id)) {
      const dia = porDia.get(t.data);
      if (dia) dia.push(t);
      else porDia.set(t.data, [t]);
    }

    return [...porDia.entries()].map(([data, itens]) => ({
      data,
      rotulo: rotuloDoDia(data, this.hoje),
      total:
        Math.round(
          itens.reduce((acc, t) => acc + (t.tipo === 'ENTRADA' ? t.valor : -t.valor), 0) * 100,
        ) / 100,
      itens,
    }));
  });

  protected readonly placeholders = [1, 2, 3];

  // ───────────── Modal ─────────────

  protected readonly modal = signal<EstadoModal | null>(null);

  constructor() {
    // /transacoes?novo=1 (botão do dashboard) abre o modal e limpa o param.
    effect(() => {
      if (this.novo() !== '1') return;
      untracked(() => {
        this.abrirNovo();
        this.router.navigate([], {
          relativeTo: this.route,
          queryParams: { novo: null },
          queryParamsHandling: 'merge',
          replaceUrl: true,
        });
      });
    });
  }

  protected abrirNovo(): void {
    this.modal.set({ transacao: null });
  }

  protected abrirEdicao(t: Transacao): void {
    this.modal.set({ transacao: t });
  }

  /** Salvo/excluído: a lista recarrega sozinha via `versao` do service. */
  protected fecharModal(): void {
    this.modal.set(null);
  }

  protected aoMudarMes(e: Event): void {
    this.seletor.irPara((e.target as HTMLSelectElement).value);
  }

  protected aoBuscar(e: Event): void {
    this.busca.set((e.target as HTMLInputElement).value);
  }
}
