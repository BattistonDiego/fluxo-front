export type TipoTransacao = 'GASTO' | 'ENTRADA' | 'GUARDADO';

export interface Transacao {
  id: number;
  tipo: TipoTransacao;
  /** Sempre positivo — o sinal é dado pelo tipo. */
  valor: number;
  /** null quando o tipo é GUARDADO. */
  categoriaId: number | null;
  descricao: string;
  /** Data ISO (yyyy-MM-dd). */
  data: string;
}

/** Payload de criação: o id é gerado pelo backend (ou pelo mock). */
export type NovaTransacao = Omit<Transacao, 'id'>;
