import { Component } from '@angular/core';

/**
 * Botão de ação flutuante (só aparece no mobile).
 * Uso: `<button app-fab aria-label="Adicionar transação" (click)="…"></button>`
 */
@Component({
  selector: 'button[app-fab]',
  template: `
    <svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor"
         stroke-width="2.4" stroke-linecap="round" aria-hidden="true">
      <path d="M12 5v14" />
      <path d="M5 12h14" />
    </svg>
  `,
  styleUrl: './fab.scss',
  host: { type: 'button' },
})
export class Fab {}
