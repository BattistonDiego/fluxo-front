/**
 * Converte o texto digitado num campo de valor para número.
 * Aceita vírgula ou ponto como decimal ("46,32", "46.32") e ponto de milhar
 * quando há vírgula ("1.234,56"). Retorna null se o texto não for um valor válido.
 */
export function parseValor(texto: string | null | undefined): number | null {
  const s = (texto ?? '').replace(/\s/g, '');
  if (!s) return null;

  const normalizado = s.includes(',') ? s.replace(/\./g, '').replace(',', '.') : s;
  if (!/^\d+(\.\d{0,2})?$/.test(normalizado)) return null;

  return Math.round(Number(normalizado) * 100) / 100;
}

/** Formata um número para edição no campo de valor. Ex: 46.3 → "46,30". */
export function valorParaTexto(valor: number): string {
  return valor.toFixed(2).replace('.', ',');
}
