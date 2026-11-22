/** Helpers para datas ISO no formato yyyy-MM-dd (sempre no fuso local). */

const formatadorDiaSemana = new Intl.DateTimeFormat('pt-BR', { weekday: 'long' });
const formatadorMes = new Intl.DateTimeFormat('pt-BR', { month: 'long' });

function paraIso(d: Date): string {
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${mm}-${dd}`;
}

function paraDate(iso: string): Date {
  const [ano, mes, dia] = iso.split('-').map(Number);
  return new Date(ano, mes - 1, dia);
}

/** Data de hoje no formato yyyy-MM-dd. */
export function hojeIso(): string {
  return paraIso(new Date());
}

export function somarDias(iso: string, dias: number): string {
  const d = paraDate(iso);
  d.setDate(d.getDate() + dias);
  return paraIso(d);
}

/**
 * Rótulo amigável de um dia: "Hoje", "Ontem" ou "Sexta, 20 de novembro"
 * (com o ano no final quando não for o ano corrente).
 */
export function rotuloDoDia(iso: string, hoje = hojeIso()): string {
  if (iso === hoje) return 'Hoje';
  if (iso === somarDias(hoje, -1)) return 'Ontem';

  const d = paraDate(iso);
  const semana = formatadorDiaSemana.format(d).split('-')[0];
  const rotulo = `${semana.charAt(0).toUpperCase()}${semana.slice(1)}, ${d.getDate()} de ${formatadorMes.format(d)}`;
  return iso.slice(0, 4) === hoje.slice(0, 4) ? rotulo : `${rotulo} de ${d.getFullYear()}`;
}
