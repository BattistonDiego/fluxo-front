import { Component, effect, signal } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

interface NavLink {
  rota: string;
  label: string;
  /** Rótulo na barra inferior (mobile). */
  labelMobile: string;
  icone: 'dashboard' | 'transacoes' | 'guardado';
}

const STORAGE_KEY = 'fluxo.sidebarRecolhida';

@Component({
  selector: 'app-layout',
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './layout.html',
  styleUrl: './layout.scss',
})
export class Layout {
  protected readonly links: NavLink[] = [
    { rota: '/dashboard', label: 'Dashboard', labelMobile: 'Início', icone: 'dashboard' },
    { rota: '/transacoes', label: 'Transações', labelMobile: 'Transações', icone: 'transacoes' },
    { rota: '/guardado', label: 'Guardado', labelMobile: 'Guardado', icone: 'guardado' },
  ];

  protected readonly usuario = { nome: 'Diego' };
  protected readonly inicial = this.usuario.nome.charAt(0).toUpperCase();

  /**
   * Sidebar recolhida (escolha do usuário, persistida).
   * No mobile a sidebar some (CSS) e a navegação vai para a barra inferior.
   */
  protected readonly recolhida = signal(localStorage.getItem(STORAGE_KEY) === 'true');

  constructor() {
    effect(() => localStorage.setItem(STORAGE_KEY, String(this.recolhida())));
  }

  protected alternar(): void {
    this.recolhida.update((v) => !v);
  }
}
