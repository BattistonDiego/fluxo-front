import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { defer, delay, Observable, of } from 'rxjs';

import { environment } from '../../environments/environment';
import { CATEGORIAS_MOCK } from '../core/mocks/categorias.mock';
import { TRANSACOES_MOCK } from '../core/mocks/transacoes.mock';
import { GuardadoMensal } from '../interface/guardado-mensal.interface';
import { GastoPorCategoria, ResumoMensal } from '../interface/resumo-mensal.interface';
import { NovaTransacao, Transacao } from '../interface/transacao.interface';

const MOCK_DELAY_MS = 300;

@Injectable({ providedIn: 'root' })
export class TransacaoService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/transacoes`;

  /**
   * Estado em memória usado só no modo mock.
   * Criar/editar/excluir funcionam até dar refresh na página.
   */
  private readonly transacoes = signal<Transacao[]>(TRANSACOES_MOCK.map((t) => ({ ...t })));

  // TODO backend: GET /api/transacoes?mes=2026-11
  listarPorMes(mes: string): Observable<Transacao[]> {
    if (!environment.useMock) {
      return this.http.get<Transacao[]>(this.baseUrl, { params: { mes } });
    }
    return this.mock(() =>
      this.doMes(mes)
        .sort((a, b) => b.data.localeCompare(a.data) || b.id - a.id)
        .map((t) => ({ ...t })),
    );
  }

  // TODO backend: POST /api/transacoes
  criar(t: NovaTransacao): Observable<Transacao> {
    if (!environment.useMock) {
      return this.http.post<Transacao>(this.baseUrl, t);
    }
    return this.mock(() => {
      const nova: Transacao = { ...t, id: this.proximoId() };
      this.transacoes.update((lista) => [...lista, nova]);
      return { ...nova };
    });
  }

  // TODO backend: PUT /api/transacoes/{id}
  atualizar(t: Transacao): Observable<Transacao> {
    if (!environment.useMock) {
      return this.http.put<Transacao>(`${this.baseUrl}/${t.id}`, t);
    }
    return this.mock(() => {
      if (!this.transacoes().some((x) => x.id === t.id)) {
        throw new Error(`Transação ${t.id} não encontrada`);
      }
      this.transacoes.update((lista) => lista.map((x) => (x.id === t.id ? { ...t } : x)));
      return { ...t };
    });
  }

  // TODO backend: DELETE /api/transacoes/{id}
  excluir(id: number): Observable<void> {
    if (!environment.useMock) {
      return this.http.delete<void>(`${this.baseUrl}/${id}`);
    }
    return this.mock(() => {
      this.transacoes.update((lista) => lista.filter((x) => x.id !== id));
    });
  }

  // TODO backend: GET /api/transacoes/resumo?mes=2026-11
  getResumoMensal(mes: string): Observable<ResumoMensal> {
    if (!environment.useMock) {
      return this.http.get<ResumoMensal>(`${this.baseUrl}/resumo`, { params: { mes } });
    }
    return this.mock(() => this.calcularResumo(mes));
  }

  /** Total guardado em cada um dos últimos N meses (do mais antigo ao atual). */
  // TODO backend: GET /api/transacoes/guardado?ultimosMeses=6
  getGuardadoPorMes(ultimosMeses: number): Observable<GuardadoMensal[]> {
    if (!environment.useMock) {
      return this.http.get<GuardadoMensal[]>(`${this.baseUrl}/guardado`, {
        params: { ultimosMeses },
      });
    }
    return this.mock(() =>
      ultimosMesesAte(mesAtual(), ultimosMeses).map((mes) => ({
        mes,
        valor: soma(this.doMes(mes).filter((t) => t.tipo === 'GUARDADO')),
      })),
    );
  }

  // ───────────────────────── helpers do mock ─────────────────────────

  /** Observable "frio" (executa só no subscribe), igual ao HttpClient. */
  private mock<T>(fn: () => T): Observable<T> {
    return defer(() => of(fn())).pipe(delay(MOCK_DELAY_MS));
  }

  private doMes(mes: string): Transacao[] {
    return this.transacoes().filter((t) => t.data.startsWith(mes));
  }

  private proximoId(): number {
    return this.transacoes().reduce((max, t) => Math.max(max, t.id), 0) + 1;
  }

  private calcularResumo(mes: string): ResumoMensal {
    const doMes = this.doMes(mes);
    const gastosLista = doMes.filter((t) => t.tipo === 'GASTO');

    const entradas = soma(doMes.filter((t) => t.tipo === 'ENTRADA'));
    const gastos = soma(gastosLista);
    const guardado = soma(doMes.filter((t) => t.tipo === 'GUARDADO'));

    const porCategoria = new Map<number, number>();
    for (const t of gastosLista) {
      if (t.categoriaId == null) continue;
      porCategoria.set(t.categoriaId, (porCategoria.get(t.categoriaId) ?? 0) + t.valor);
    }

    const gastosPorCategoria: GastoPorCategoria[] = [...porCategoria.entries()]
      .map(([categoriaId, valor]) => ({
        categoria: CATEGORIAS_MOCK.find((c) => c.id === categoriaId)!,
        valor: arred(valor),
        percentual: gastos > 0 ? arred((valor / gastos) * 100) : 0,
      }))
      .filter((g) => !!g.categoria)
      .sort((a, b) => b.valor - a.valor);

    return {
      mes,
      entradas,
      gastos,
      guardado,
      saldo: arred(entradas - gastos - guardado),
      gastosPorCategoria,
    };
  }
}

// ───────────────────────── funções utilitárias ─────────────────────────

function arred(v: number): number {
  return Math.round(v * 100) / 100;
}

function soma(lista: Transacao[]): number {
  return arred(lista.reduce((acc, t) => acc + t.valor, 0));
}

/** Mês atual no formato yyyy-MM. */
function mesAtual(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

/** Lista os N meses que terminam em `mes` (inclusive), do mais antigo ao mais recente. */
function ultimosMesesAte(mes: string, n: number): string[] {
  const [ano, m] = mes.split('-').map(Number);
  return Array.from({ length: n }, (_, i) => {
    const d = new Date(ano, m - 1 - (n - 1 - i), 1);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
  });
}
