// constants/theme.ts

export const COLORS = {
  // 🎨 Cores principais (único padrão azul)
  primary: "#2563EB", // Azul padrão unificado
  secondary: "#2563EB", // Mesmo tom de azul para consistência

  // 🧱 Fundos e superfícies
  background: "#F9FAFB", // Fundo geral leve
  surface: "#FFFFFF", // Cartões, abas, áreas elevadas

  // 🧾 Texto
  text: "#1E1E1E", // Texto principal
  textSecondary: "#6B7280", // Texto secundário, descrições e subtítulos
  textOnPrimary: "#FFFFFF", // Texto sobre botões azuis

  // ⚙️ Bordas e divisores
  border: "#E5E7EB", // Borda leve

  // 🚨 Estados
  error: "#EF4444", // Vermelho para erros
  success: "#22C55E", // Verde para sucesso
  warning: "#F59E0B", // Amarelo para alertas
};

export const SIZES = {
  // 📏 Espaçamentos e medidas
  padding: 16,
  radius: 12,

  // 🔤 Tipografia
  fontSmall: 14,
  fontMedium: 16,
  fontLarge: 20,
  fontXL: 28,
};

export const SHADOWS = {
  light: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  medium: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
  },
  heavy: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 8,
  },
};
