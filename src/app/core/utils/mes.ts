/** Helpers para meses no formato yyyy-MM (comparáveis como string). */

const REGEX_MES = /^\d{4}-(0[1-9]|1[0-2])$/;

const formatadorMes = new Intl.DateTimeFormat('pt-BR', { month: 'long' });

function formatar(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

/** Mês atual no formato yyyy-MM. */
export function mesAtual(): string {
  return formatar(new Date());
}

/** true se o valor é um mês válido no formato yyyy-MM. */
export function isMes(valor: unknown): valor is string {
  return typeof valor === 'string' && REGEX_MES.test(valor);
}

/** Soma (ou subtrai) meses. Ex: somarMeses('2026-01', -1) → '2025-12'. */
export function somarMeses(mes: string, delta: number): string {
  const [ano, m] = mes.split('-').map(Number);
  return formatar(new Date(ano, m - 1 + delta, 1));
}

/** Meses de `inicio` até `fim` (inclusive), em ordem crescente. */
export function mesesEntre(inicio: string, fim: string): string[] {
  const meses: string[] = [];
  for (let mes = inicio; mes <= fim; mes = somarMeses(mes, 1)) {
    meses.push(mes);
  }
  return meses;
}

/** Nome do mês por extenso. Ex: '2026-11' → 'Novembro 2026'. */
export function nomeDoMes(mes: string): string {
  const [ano, m] = mes.split('-').map(Number);
  const nome = formatadorMes.format(new Date(ano, m - 1, 1));
  return `${nome.charAt(0).toUpperCase()}${nome.slice(1)} ${ano}`;
}
