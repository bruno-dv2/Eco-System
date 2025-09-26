/**
 * Formata um valor em Real Brasileiro (R$)
 * @param value Valor numérico
 * @returns Valor formatado como string
 */
export const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value);
};

/**
 * Formata quantidade ou peso
 * @param value Valor numérico
 * @returns Valor formatado como string
 */
export const formatQuantity = (value: number): string => {
  return new Intl.NumberFormat('pt-BR', {
    minimumFractionDigits: Number.isInteger(value) ? 0 : 1,
    maximumFractionDigits: 3
  }).format(value);
};

/**
 * Converte input brasileiro (vírgula) para ponto
 * @param value Valor como string
 * @returns Valor normalizado como string
 */
export const normalizeInput = (value: string): string => {
  return value.replace(',', '.');
};

/**
 * Verifica se um valor é um número válido
 * @param value Valor como string
 * @returns true se for número válido, false caso contrário
 */
export const isValidNumber = (value: string): boolean => {
  const normalized = normalizeInput(value);
  return !isNaN(parseFloat(normalized)) && isFinite(parseFloat(normalized));
};
