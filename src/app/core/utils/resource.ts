import { linkedSignal, ResourceRef, Signal } from '@angular/core';

/**
 * Valor de um resource que só é "limpo" quando a `chave` muda.
 *
 * O resource zera o value() sempre que os params mudam. Quando a mudança é só
 * uma recarga (ex.: `versao` do service após salvar), queremos manter os dados
 * antigos na tela até os novos chegarem, em vez de piscar o skeleton.
 */
export function valorEstavel<T>(
  resource: ResourceRef<T | undefined>,
  chave: () => unknown,
): Signal<T | undefined> {
  return linkedSignal<{ chave: unknown; valor: T | undefined }, T | undefined>({
    source: () => ({
      chave: chave(),
      valor: resource.hasValue() ? resource.value() : undefined,
    }),
    computation: (atual, anterior) => {
      if (atual.valor !== undefined) return atual.valor;
      return anterior && Object.is(anterior.source.chave, atual.chave) ? anterior.value : undefined;
    },
  }).asReadonly();
}
