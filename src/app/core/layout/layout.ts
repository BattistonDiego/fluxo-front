import { Component, computed, effect, signal } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

interface NavLink {
  rota: string;
  label: string;
  icone: 'dashboard' | 'transacoes' | 'guardado';
}

const STORAGE_KEY = 'fluxo.sidebarRecolhida';
const MQ_PEQUENA = '(max-width: 768px)';

@Component({
  selector: 'app-layout',
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './layout.html',
  styleUrl: './layout.scss',
})
export class Layout {
  protected readonly links: NavLink[] = [
    { rota: '/dashboard', label: 'Dashboard', icone: 'dashboard' },
    { rota: '/transacoes', label: 'Transações', icone: 'transacoes' },
    { rota: '/guardado', label: 'Guardado', icone: 'guardado' },
  ];

  protected readonly usuario = { nome: 'Diego' };
  protected readonly inicial = this.usuario.nome.charAt(0).toUpperCase();

  /** Escolha manual do usuário (persistida). */
  private readonly preferenciaRecolhida = signal(localStorage.getItem(STORAGE_KEY) === 'true');

  /** Em telas pequenas a sidebar fica sempre recolhida. */
  protected readonly telaPequena = signal(false);

  protected readonly recolhida = computed(() => this.telaPequena() || this.preferenciaRecolhida());

  constructor() {
    const mq = window.matchMedia(MQ_PEQUENA);
    this.telaPequena.set(mq.matches);
    mq.addEventListener('change', (e) => this.telaPequena.set(e.matches));

    effect(() => localStorage.setItem(STORAGE_KEY, String(this.preferenciaRecolhida())));
  }

  protected alternar(): void {
    this.preferenciaRecolhida.update((v) => !v);
  }
}
