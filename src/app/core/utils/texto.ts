/** Minúsculas e sem acentos, para buscas ("Alimentação" → "alimentacao"). */
export function normalizarTexto(texto: string): string {
  return texto
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .trim();
}
