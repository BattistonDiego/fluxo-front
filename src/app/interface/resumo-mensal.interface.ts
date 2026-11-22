import { Categoria } from './categoria.interface';

export interface GastoPorCategoria {
  categoria: Categoria;
  valor: number;
  /** Percentual sobre o total de gastos do mês (0–100). */
  percentual: number;
}

export interface ResumoMensal {
  /** Mês no formato yyyy-MM. */
  mes: string;
  entradas: number;
  gastos: number;
  guardado: number;
  /** entradas − gastos − guardado */
  saldo: number;
  gastosPorCategoria: GastoPorCategoria[];
}
