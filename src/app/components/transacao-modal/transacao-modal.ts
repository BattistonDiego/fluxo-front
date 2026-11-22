import {
  afterNextRender,
  Component,
  computed,
  DestroyRef,
  effect,
  ElementRef,
  inject,
  input,
  OnInit,
  output,
  signal,
  untracked,
  viewChild,
  DOCUMENT,
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  ValidatorFn,
  Validators,
} from '@angular/forms';
import { map } from 'rxjs';

import { hojeIso } from '../../core/utils/data';
import { parseValor, valorParaTexto } from '../../core/utils/valor';
import { NovaTransacao, TipoTransacao, Transacao } from '../../interface/transacao.interface';
import { CategoriaService } from '../../service/categoria.service';
import { TransacaoService } from '../../service/transacao.service';
import { CategoryIcon } from '../category-icon/category-icon';

const TIPOS: { tipo: TipoTransacao; label: string }[] = [
  { tipo: 'GASTO', label: 'Gasto' },
  { tipo: 'ENTRADA', label: 'Entrada' },
  { tipo: 'GUARDADO', label: 'Guardar' },
];

/** Categoria pré-selecionada ao escolher o tipo. */
const CATEGORIA_PADRAO: Record<'GASTO' | 'ENTRADA', string> = {
  GASTO: 'Alimentação',
  ENTRADA: 'Salário',
};

const DESCRICAO_PADRAO_GUARDADO = 'Reserva';

const SELETOR_FOCAVEIS =
  'button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), a[href], [tabindex]:not([tabindex="-1"])';

const valorPositivo: ValidatorFn = (c) => ((parseValor(c.value) ?? 0) > 0 ? null : { valor: true });
const textoObrigatorio: ValidatorFn = (c) =>
  String(c.value ?? '').trim() ? null : { required: true };

let sequencia = 0;

/**
 * Modal de criação/edição de transação.
 * Salva/exclui pelo TransacaoService e avisa o pai pelos outputs;
 * quem abriu o modal é responsável por removê-lo do DOM.
 */
@Component({
  selector: 'app-transacao-modal',
  imports: [ReactiveFormsModule, CategoryIcon],
  templateUrl: './transacao-modal.html',
  styleUrl: './transacao-modal.scss',
  host: {
    '(document:keydown)': 'aoTeclar($event)',
  },
})
export class TransacaoModal implements OnInit {
  private readonly transacaoService = inject(TransacaoService);
  private readonly categoriaService = inject(CategoriaService);
  private readonly document = inject(DOCUMENT);

  /** Transação a editar. Sem ela, o modal cria uma nova. */
  readonly transacao = input<Transacao | null>(null);
  readonly tipoInicial = input<TipoTransacao>('GASTO');
  readonly tiposPermitidos = input<TipoTransacao[]>(['GASTO', 'ENTRADA', 'GUARDADO']);

  readonly salvo = output<Transacao>();
  readonly excluido = output<number>();
  readonly fechado = output<void>();

  private readonly caixa = viewChild.required<ElementRef<HTMLElement>>('caixa');
  private readonly campoValor = viewChild.required<ElementRef<HTMLInputElement>>('campoValor');

  protected readonly ids = (() => {
    const n = ++sequencia;
    return {
      titulo: `tm-titulo-${n}`,
      valor: `tm-valor-${n}`,
      categoria: `tm-categoria-${n}`,
      data: `tm-data-${n}`,
      descricao: `tm-descricao-${n}`,
    };
  })();

  protected readonly form = new FormGroup({
    tipo: new FormControl<TipoTransacao>('GASTO', { nonNullable: true }),
    valor: new FormControl('', { nonNullable: true, validators: valorPositivo }),
    categoriaId: new FormControl<number | null>(null),
    data: new FormControl(hojeIso(), { nonNullable: true, validators: Validators.required }),
    descricao: new FormControl('', { nonNullable: true }),
  });

  protected readonly tipo = toSignal(this.form.controls.tipo.valueChanges, {
    initialValue: this.form.controls.tipo.value,
  });
  protected readonly categoriaSelecionada = toSignal(this.form.controls.categoriaId.valueChanges, {
    initialValue: null,
  });
  protected readonly valido = toSignal(this.form.statusChanges.pipe(map((s) => s === 'VALID')), {
    initialValue: false,
  });

  private readonly categorias = toSignal(this.categoriaService.listar(), { initialValue: null });

  protected readonly categoriasDoTipo = computed(() => {
    const tipo = this.tipo();
    return (this.categorias() ?? []).filter((c) => c.tipo === tipo);
  });
  protected readonly carregandoCategorias = computed(() => this.categorias() === null);

  protected readonly tiposVisiveis = computed(() =>
    TIPOS.filter((t) => this.tiposPermitidos().includes(t.tipo)),
  );

  protected readonly editando = computed(() => !!this.transacao());

  protected readonly titulo = computed(() => {
    if (this.tipo() === 'GUARDADO') return this.editando() ? 'Editar guardado' : 'Guardar dinheiro';
    return this.editando() ? 'Editar transação' : 'Nova transação';
  });

  protected readonly ocupado = signal(false);
  protected readonly confirmandoExclusao = signal(false);
  protected readonly erro = signal<string | null>(null);

  /** Para clicar no overlay só fechar se o clique começou nele (evita fechar ao arrastar seleção). */
  private cliqueComecouNoOverlay = false;

  constructor() {
    // Foco: guarda quem abriu o modal e devolve ao fechar. Trava o scroll do body.
    const focoAnterior = this.document.activeElement as HTMLElement | null;
    const body = this.document.body;
    const overflowAnterior = body.style.overflow;
    body.style.overflow = 'hidden';

    inject(DestroyRef).onDestroy(() => {
      body.style.overflow = overflowAnterior;
      if (focoAnterior?.isConnected) focoAnterior.focus();
    });

    afterNextRender(() => this.campoValor().nativeElement.focus());

    // Categorias chegam de forma assíncrona: pré-seleciona quando carregarem.
    effect(() => {
      this.categorias();
      untracked(() => this.preSelecionarCategoria());
    });
  }

  ngOnInit(): void {
    const t = this.transacao();
    const permitidos = this.tiposPermitidos();
    const tipo =
      t?.tipo ?? (permitidos.includes(this.tipoInicial()) ? this.tipoInicial() : permitidos[0]);

    this.form.setValue({
      tipo,
      valor: t ? valorParaTexto(t.valor) : '',
      categoriaId: t?.categoriaId ?? null,
      data: t?.data ?? hojeIso(),
      descricao: t?.descricao ?? '',
    });
    this.aplicarRegrasDoTipo(tipo);
    this.preSelecionarCategoria();
  }

  protected selecionarTipo(tipo: TipoTransacao): void {
    if (tipo === this.form.controls.tipo.value) return;
    this.form.controls.tipo.setValue(tipo);
    this.aplicarRegrasDoTipo(tipo);
    this.preSelecionarCategoria();
  }

  protected selecionarCategoria(id: number): void {
    this.form.controls.categoriaId.setValue(id);
  }

  /** Mantém só dígitos e separadores no campo de valor. */
  protected sanitizarValor(): void {
    const controle = this.form.controls.valor;
    const limpo = controle.value.replace(/[^\d.,]/g, '');
    if (limpo !== controle.value) controle.setValue(limpo);
  }

  protected salvar(): void {
    if (this.form.invalid || this.ocupado()) return;

    const v = this.form.getRawValue();
    const guardado = v.tipo === 'GUARDADO';
    const dados: NovaTransacao = {
      tipo: v.tipo,
      valor: parseValor(v.valor)!,
      categoriaId: guardado ? null : v.categoriaId,
      data: v.data,
      descricao: v.descricao.trim() || (guardado ? DESCRICAO_PADRAO_GUARDADO : ''),
    };

    const atual = this.transacao();
    const req = atual
      ? this.transacaoService.atualizar({ ...dados, id: atual.id })
      : this.transacaoService.criar(dados);

    this.ocupado.set(true);
    this.erro.set(null);
    req.subscribe({
      next: (t) => this.salvo.emit(t),
      error: () => {
        this.ocupado.set(false);
        this.erro.set('Não foi possível salvar. Tente novamente.');
      },
    });
  }

  /** Primeiro clique pede confirmação; o segundo exclui. */
  protected excluir(): void {
    const atual = this.transacao();
    if (!atual || this.ocupado()) return;

    if (!this.confirmandoExclusao()) {
      this.confirmandoExclusao.set(true);
      return;
    }

    this.ocupado.set(true);
    this.erro.set(null);
    this.transacaoService.excluir(atual.id).subscribe({
      next: () => this.excluido.emit(atual.id),
      error: () => {
        this.ocupado.set(false);
        this.confirmandoExclusao.set(false);
        this.erro.set('Não foi possível excluir. Tente novamente.');
      },
    });
  }

  protected fechar(): void {
    // Enquanto salva/exclui, não deixa fechar (a requisição precisa terminar).
    if (this.ocupado()) return;
    this.fechado.emit();
  }

  protected aoPressionarOverlay(e: MouseEvent): void {
    this.cliqueComecouNoOverlay = e.target === e.currentTarget;
  }

  protected aoClicarOverlay(e: MouseEvent): void {
    if (this.cliqueComecouNoOverlay && e.target === e.currentTarget) this.fechar();
    this.cliqueComecouNoOverlay = false;
  }

  protected aoTeclar(e: KeyboardEvent): void {
    if (e.key === 'Escape') {
      e.preventDefault();
      this.fechar();
    } else if (e.key === 'Tab') {
      this.prenderFoco(e);
    }
  }

  /** Mantém o Tab circulando dentro do modal. */
  private prenderFoco(e: KeyboardEvent): void {
    const caixa = this.caixa().nativeElement;
    const focaveis = Array.from(caixa.querySelectorAll<HTMLElement>(SELETOR_FOCAVEIS)).filter(
      (el) => el.getClientRects().length > 0,
    );
    if (!focaveis.length) return;

    const primeiro = focaveis[0];
    const ultimo = focaveis[focaveis.length - 1];
    const ativo = this.document.activeElement;

    if (!caixa.contains(ativo)) {
      e.preventDefault();
      primeiro.focus();
    } else if (e.shiftKey && ativo === primeiro) {
      e.preventDefault();
      ultimo.focus();
    } else if (!e.shiftKey && ativo === ultimo) {
      e.preventDefault();
      primeiro.focus();
    }
  }

  private aplicarRegrasDoTipo(tipo: TipoTransacao): void {
    const { categoriaId, descricao } = this.form.controls;
    if (tipo === 'GUARDADO') {
      categoriaId.clearValidators();
      descricao.clearValidators();
      categoriaId.setValue(null, { emitEvent: true });
    } else {
      categoriaId.setValidators(Validators.required);
      descricao.setValidators(textoObrigatorio);
    }
    categoriaId.updateValueAndValidity();
    descricao.updateValueAndValidity();
  }

  /** Se a categoria atual não pertence ao tipo, seleciona a padrão (Alimentação / Salário). */
  private preSelecionarCategoria(): void {
    const tipo = this.form.controls.tipo.value;
    if (tipo === 'GUARDADO') return;

    const lista = (this.categorias() ?? []).filter((c) => c.tipo === tipo);
    if (!lista.length) return;

    const atual = this.form.controls.categoriaId.value;
    if (lista.some((c) => c.id === atual)) return;

    const padrao = lista.find((c) => c.nome === CATEGORIA_PADRAO[tipo]) ?? lista[0];
    this.form.controls.categoriaId.setValue(padrao.id);
  }
}
