export interface Categoria {
  id: number;
  nome: string;
  /** Cor em hexadecimal (ex: #8B7CF6). */
  cor: string;
  /** Nome do ícone (mapeado para um SVG inline nos componentes). */
  icone: string;
  tipo: 'GASTO' | 'ENTRADA';
}
