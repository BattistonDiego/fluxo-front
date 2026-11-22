import { Injectable, signal } from '@angular/core';

/** Abaixo de 768px é "mobile". Manter em sincronia com src/styles/_breakpoints.scss. */
export const MQ_MOBILE = '(max-width: 767.98px)';

/**
 * Breakpoint como signal. Use só quando a estrutura/texto precisar mudar
 * (ex.: rótulos curtos); para estilo, prefira o mixin `mobile` do SCSS.
 */
@Injectable({ providedIn: 'root' })
export class BreakpointService {
  private readonly _mobile = signal(false);
  readonly mobile = this._mobile.asReadonly();

  constructor() {
    const mq = window.matchMedia(MQ_MOBILE);
    this._mobile.set(mq.matches);
    mq.addEventListener('change', (e) => this._mobile.set(e.matches));
  }
}
