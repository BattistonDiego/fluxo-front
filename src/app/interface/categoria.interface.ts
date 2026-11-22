export interface Categoria {
  id: number;
  nome: string;
  /** Cor em hexadecimal (ex: #8B7CF6). */
  cor: string;
  /** Nome do ícone renderizado por components/category-icon (house, cart, bus, game…). */
  icone: string;
  tipo: 'GASTO' | 'ENTRADA';
}
