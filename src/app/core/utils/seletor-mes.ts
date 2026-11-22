import { computed, inject, Signal } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';
import { catchError, of, switchMap } from 'rxjs';

import { TransacaoService } from '../../service/transacao.service';
import { isMes, mesAtual, mesesEntre, somarMeses } from './mes';

export interface SeletorMes {
  /** Mês exibido (yyyy-MM). */
  selecionado: Signal<string>;
  podeVoltar: Signal<boolean>;
  podeAvancar: Signal<boolean>;
  /** Meses navegáveis, do mais recente ao mais antigo. */
  opcoes: Signal<string[]>;
  irPara(mes: string): void;
  navegar(delta: number): void;
}

/**
 * Estado do mês selecionado, sincronizado com o query param ?mes=yyyy-MM.
 * Limita a navegação entre o primeiro mês com transações e o mês atual.
 *
 * Precisa ser chamado em contexto de injeção (ex.: inicializador de campo).
 */
export function injetarSeletorMes(mesDaUrl: Signal<string | undefined>): SeletorMes {
  const transacaoService = inject(TransacaoService);
  const router = inject(Router);
  const route = inject(ActivatedRoute);

  const limite = mesAtual();

  // Recarrega quando os dados mudam (ex.: transação criada num mês mais antigo).
  const primeiroMes = toSignal(
    toObservable(transacaoService.versao).pipe(
      switchMap(() => transacaoService.getPrimeiroMes().pipe(catchError(() => of(null)))),
    ),
    { initialValue: null },
  );

  const selecionado = computed(() => {
    const param = mesDaUrl();
    let mes = isMes(param) ? param : limite;
    if (mes > limite) mes = limite;
    const minimo = primeiroMes();
    if (minimo && mes < minimo) mes = minimo;
    return mes;
  });

  const podeVoltar = computed(() => {
    const minimo = primeiroMes();
    return !!minimo && selecionado() > minimo;
  });

  const podeAvancar = computed(() => selecionado() < limite);

  const opcoes = computed(() => {
    const minimo = primeiroMes();
    const inicio = minimo && minimo < selecionado() ? minimo : selecionado();
    return mesesEntre(inicio, limite).reverse();
  });

  const irPara = (mes: string) => {
    router.navigate([], {
      relativeTo: route,
      queryParams: { mes },
      queryParamsHandling: 'merge',
    });
  };

  return {
    selecionado,
    podeVoltar,
    podeAvancar,
    opcoes,
    irPara,
    navegar: (delta) => irPara(somarMeses(selecionado(), delta)),
  };
}
