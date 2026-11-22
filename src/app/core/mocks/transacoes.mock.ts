import { Transacao } from '../../interface/transacao.interface';
import { CAT } from './categorias.mock';

let seq = 0;

const entrada = (data: string, valor: number, categoriaId: number, descricao: string): Transacao => ({
  id: ++seq,
  tipo: 'ENTRADA',
  valor,
  categoriaId,
  descricao,
  data,
});

const gasto = (data: string, valor: number, categoriaId: number, descricao: string): Transacao => ({
  id: ++seq,
  tipo: 'GASTO',
  valor,
  categoriaId,
  descricao,
  data,
});

const guardado = (data: string, valor: number, descricao = 'Reserva'): Transacao => ({
  id: ++seq,
  tipo: 'GUARDADO',
  valor,
  categoriaId: null,
  descricao,
  data,
});

export const TRANSACOES_MOCK: Transacao[] = [
  // ── Junho a agosto/2026: apenas o guardado, para o histórico da tela Guardado ──
  guardado('2026-06-30', 180),
  guardado('2026-07-31', 220),
  guardado('2026-08-31', 160),

  // ── Setembro/2026 ── entradas 2.400 €
  entrada('2026-09-01', 2150, CAT.SALARIO, 'Salário'),
  entrada('2026-09-18', 250, CAT.FREELANCE, 'Projeto landing page'),
  gasto('2026-09-01', 750, CAT.MORADIA, 'Aluguel'),
  gasto('2026-09-02', 10.99, CAT.ASSINATURAS, 'Spotify'),
  gasto('2026-09-03', 64.32, CAT.ALIMENTACAO, 'Mercadona'),
  gasto('2026-09-05', 21.8, CAT.TRANSPORTE, 'Abono transporte'),
  gasto('2026-09-06', 23.4, CAT.ALIMENTACAO, 'Uber Eats'),
  gasto('2026-09-09', 41.17, CAT.ALIMENTACAO, 'Lidl'),
  gasto('2026-09-11', 17.8, CAT.LAZER, 'Cine Yelmo'),
  gasto('2026-09-12', 49.95, CAT.COMPRAS, 'Zara'),
  gasto('2026-09-14', 13.99, CAT.ASSINATURAS, 'Netflix'),
  gasto('2026-09-15', 12.45, CAT.SAUDE, 'Farmácia'),
  gasto('2026-09-16', 72.58, CAT.ALIMENTACAO, 'Mercadona'),
  gasto('2026-09-19', 19.9, CAT.ALIMENTACAO, 'Uber Eats'),
  gasto('2026-09-20', 34, CAT.LAZER, 'Tapas com amigos'),
  gasto('2026-09-23', 38.64, CAT.ALIMENTACAO, 'Lidl'),
  gasto('2026-09-25', 14.3, CAT.TRANSPORTE, 'Uber'),
  gasto('2026-09-26', 29.99, CAT.COMPRAS, 'Amazon'),
  gasto('2026-09-28', 25, CAT.OUTROS, 'Presente de aniversário'),
  gasto('2026-09-29', 39.9, CAT.SAUDE, 'Academia'),
  guardado('2026-09-30', 200),

  // ── Outubro/2026 ── entradas 2.230 €
  entrada('2026-10-01', 2150, CAT.SALARIO, 'Salário'),
  entrada('2026-10-24', 80, CAT.OUTRAS_ENTRADAS, 'Venda no Wallapop'),
  gasto('2026-10-01', 750, CAT.MORADIA, 'Aluguel'),
  gasto('2026-10-02', 10.99, CAT.ASSINATURAS, 'Spotify'),
  gasto('2026-10-04', 58.71, CAT.ALIMENTACAO, 'Mercadona'),
  gasto('2026-10-05', 21.8, CAT.TRANSPORTE, 'Abono transporte'),
  gasto('2026-10-07', 27.5, CAT.ALIMENTACAO, 'Uber Eats'),
  gasto('2026-10-10', 44.23, CAT.ALIMENTACAO, 'Lidl'),
  gasto('2026-10-12', 79.9, CAT.COMPRAS, 'Zara'),
  gasto('2026-10-14', 13.99, CAT.ASSINATURAS, 'Netflix'),
  gasto('2026-10-15', 19.6, CAT.LAZER, 'Cine Yelmo'),
  gasto('2026-10-17', 66.05, CAT.ALIMENTACAO, 'Mercadona'),
  gasto('2026-10-18', 18.4, CAT.ALIMENTACAO, 'Uber Eats'),
  gasto('2026-10-20', 8.75, CAT.SAUDE, 'Farmácia'),
  gasto('2026-10-22', 35.89, CAT.ALIMENTACAO, 'Lidl'),
  gasto('2026-10-25', 32, CAT.COMPRAS, 'Primark'),
  gasto('2026-10-26', 11.2, CAT.TRANSPORTE, 'Uber'),
  gasto('2026-10-29', 39.9, CAT.SAUDE, 'Academia'),
  gasto('2026-10-30', 15, CAT.OUTROS, 'Corte de cabelo'),
  guardado('2026-10-31', 150),

  // ── Novembro/2026 ── entradas 2.450 €
  entrada('2026-11-01', 2150, CAT.SALARIO, 'Salário'),
  entrada('2026-11-14', 300, CAT.FREELANCE, 'Ajustes no site de cliente'),
  gasto('2026-11-01', 750, CAT.MORADIA, 'Aluguel'),
  guardado('2026-11-02', 250),
  gasto('2026-11-02', 10.99, CAT.ASSINATURAS, 'Spotify'),
  gasto('2026-11-03', 61.48, CAT.ALIMENTACAO, 'Mercadona'),
  gasto('2026-11-05', 21.8, CAT.TRANSPORTE, 'Abono transporte'),
  gasto('2026-11-06', 24.9, CAT.ALIMENTACAO, 'Uber Eats'),
  gasto('2026-11-08', 39.56, CAT.ALIMENTACAO, 'Lidl'),
  gasto('2026-11-10', 13.99, CAT.ASSINATURAS, 'Netflix'),
  gasto('2026-11-11', 59.95, CAT.COMPRAS, 'Zara'),
  gasto('2026-11-13', 17.8, CAT.LAZER, 'Cine Yelmo'),
  gasto('2026-11-15', 70.12, CAT.ALIMENTACAO, 'Mercadona'),
  gasto('2026-11-16', 21.3, CAT.ALIMENTACAO, 'Uber Eats'),
  gasto('2026-11-18', 15.2, CAT.SAUDE, 'Farmácia'),
  gasto('2026-11-19', 42.07, CAT.ALIMENTACAO, 'Lidl'),
  gasto('2026-11-20', 45, CAT.LAZER, 'Show no WiZink Center'),
];
