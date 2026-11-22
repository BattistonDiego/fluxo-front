import { Categoria } from '../../interface/categoria.interface';

/** IDs das categorias, para deixar os mocks legíveis. */
export const CAT = {
  MORADIA: 1,
  ALIMENTACAO: 2,
  COMPRAS: 3,
  LAZER: 4,
  SAUDE: 5,
  TRANSPORTE: 6,
  ASSINATURAS: 7,
  OUTROS: 8,
  SALARIO: 9,
  FREELANCE: 10,
  OUTRAS_ENTRADAS: 11,
} as const;

/** Cor usada para transações do tipo GUARDADO (não têm categoria). */
export const COR_GUARDADO = '#B4A2FF';

export const CATEGORIAS_MOCK: Categoria[] = [
  // Gastos
  { id: CAT.MORADIA, nome: 'Moradia', cor: '#8B7CF6', icone: 'casa', tipo: 'GASTO' },
  { id: CAT.ALIMENTACAO, nome: 'Alimentação', cor: '#F97316', icone: 'carrinho', tipo: 'GASTO' },
  { id: CAT.COMPRAS, nome: 'Compras', cor: '#3B82F6', icone: 'sacola', tipo: 'GASTO' },
  { id: CAT.LAZER, nome: 'Lazer', cor: '#EC4899', icone: 'ingresso', tipo: 'GASTO' },
  { id: CAT.SAUDE, nome: 'Saúde', cor: '#A3E635', icone: 'coracao', tipo: 'GASTO' },
  { id: CAT.TRANSPORTE, nome: 'Transporte', cor: '#38BDF8', icone: 'carro', tipo: 'GASTO' },
  { id: CAT.ASSINATURAS, nome: 'Assinaturas', cor: '#14B8A6', icone: 'repetir', tipo: 'GASTO' },
  { id: CAT.OUTROS, nome: 'Outros', cor: '#94A3B8', icone: 'pontos', tipo: 'GASTO' },

  // Entradas
  { id: CAT.SALARIO, nome: 'Salário', cor: '#34D399', icone: 'maleta', tipo: 'ENTRADA' },
  { id: CAT.FREELANCE, nome: 'Freelance', cor: '#34D399', icone: 'notebook', tipo: 'ENTRADA' },
  { id: CAT.OUTRAS_ENTRADAS, nome: 'Outras entradas', cor: '#34D399', icone: 'mais', tipo: 'ENTRADA' },
];
