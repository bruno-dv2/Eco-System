/**
 * Formata valor em Real Brasileiro
 */
export const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value);
};

/**
 * Formata quantidade/peso (sem vírgula para inteiros)
 */
export const formatQuantity = (value: number): string => {
  return new Intl.NumberFormat('pt-BR', {
    minimumFractionDigits: Number.isInteger(value) ? 0 : 1,
    maximumFractionDigits: 3
  }).format(value);
};

/**
 * Converte input brasileiro (vírgula) para formato JS (ponto)
 */
export const normalizeInput = (value: string): string => {
  return value.replace(',', '.');
};

/**
 * Valida se é um número válido
 */
export const isValidNumber = (value: string): boolean => {
  const normalized = normalizeInput(value);
  return !isNaN(parseFloat(normalized)) && isFinite(parseFloat(normalized));
};