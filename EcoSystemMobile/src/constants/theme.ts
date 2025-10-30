// src/theme.ts

export const COLORS = {
  background: "#F5F5F5",
  primary: "#2196f3",
  secondary: "#2196f3",
  accent: "#FFC107",
  textPrimary: "#212121",
  textSecondary: "#757575",
  border: "#E0E0E0",
  danger: "#E53935",
  success: "#43A047",
  warning: "#FB8C00",
  white: "#FFFFFF",
  black: "#000000",
  surface: "#FFFFFF",
  error: "#E53935",
  text: "#212121", // Cores adicionadas para compatibilidade
  errorBackground: "#FFEBEE",
  successLight: "#E8F5E9",
  surfaceVariant: "#F0F0F0",
};

export const FONT_FAMILY = {
  regular: "System",
  medium: "System",
  bold: "System",
};

export const FONT_SIZE = {
  sm: 12,
  md: 16,
  lg: 20,
  XL: 28,
};

// 🌟 SIZES para espaçamento e raio
export const SIZES = {
  base: 8,
  small: 10,
  font: 14,
  medium: 12,
  large: 16,
  padding: 24,
  radius: 12,
  fontSmall: 12,
  fontMedium: 16,
  fontLarge: 20,
  fontXL: 28,
};

// 🎯 THEME final
export const THEME = {
  COLORS,
  FONT_FAMILY,
  FONT_SIZE,
  SIZES, // 🚨 CORREÇÃO ESSENCIAL: Adiciona o alias 'colors' para a compatibilidade com a sintaxe 'theme.colors.propriedade'

  colors: COLORS, // Estruturas para compatibilidade com MovimentacaoFormRN.tsx:
  spacing: {
    xs: SIZES.base, // 8
    sm: SIZES.medium, // 12
    md: SIZES.padding, // 24
    lg: SIZES.large, // 16
    xl: SIZES.large * 1.5,
  },

  radius: {
    sm: SIZES.base, // 8
    md: SIZES.radius, // 12
    lg: SIZES.large, // 16
  },

  fontSizes: {
    sm: FONT_SIZE.sm, // 12
    md: FONT_SIZE.md, // 16
    lg: FONT_SIZE.lg, // 20
  },
};

export default THEME;

//resolvido
