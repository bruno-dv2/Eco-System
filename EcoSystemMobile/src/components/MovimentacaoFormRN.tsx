import Input from "./common/Input";

import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Alert,
  StyleSheet,
} from "react-native";
import { Material } from "../types";
import { normalizeInput } from "../utils/currency";

// 🚀 CORREÇÃO 1: Importa o objeto THEME completo
// Assumindo que o caminho correto para theme.ts é '../theme' ou '../constants/theme'.
// Se o seu arquivo tema estiver em 'src/theme.ts' e este componente em 'src/components', use '../theme'.
import THEME from "../constants/theme";
// 🚨 IMPORTANTE: O componente <Input> deve ser importado aqui se estiver em outro arquivo.
// Exemplo: import Input from "./Input";

interface Movimentacao {
  materialId: number;
  quantidade: string;
  preco?: string;
}

interface MovimentacaoFormRNProps {
  materiais: Material[];
  tipo: "entrada" | "saida";
  onSubmit: (
    movimentacoes: { materialId: number; quantidade: number; preco?: number }[]
  ) => Promise<void>;
  onCancel: () => void;
}

const MovimentacaoFormRN: React.FC<MovimentacaoFormRNProps> = ({
  materiais,
  tipo,
  onSubmit,
  onCancel,
}) => {
  const [movimentacoes, setMovimentacoes] = useState<Movimentacao[]>([
    {
      materialId: 0,
      quantidade: "",
      preco: tipo === "entrada" ? "" : undefined,
    },
  ]);
  const [erro, setErro] = useState("");

  const handleAddMovimentacao = () => {
    setMovimentacoes([
      ...movimentacoes,
      {
        materialId: 0,
        quantidade: "",
        preco: tipo === "entrada" ? "" : undefined,
      },
    ]);
  };

  const handleRemoveMovimentacao = (index: number) => {
    if (movimentacoes.length > 1) {
      setMovimentacoes(movimentacoes.filter((_, i) => i !== index));
    }
  };

  const handleMovimentacaoChange = (
    index: number,
    field: keyof Movimentacao,
    value: string
  ) => {
    const novas = [...movimentacoes];
    novas[index] = {
      ...novas[index],
      [field]: field === "materialId" ? Number(value) : value,
    };
    setMovimentacoes(novas);
  };

  const handleSubmit = async () => {
    setErro("");

    if (movimentacoes.some((m) => m.materialId === 0)) {
      setErro("Selecione um material para todas as movimentações");
      return;
    }

    const normalizadas = movimentacoes.map((m) => ({
      ...m,
      quantidade: normalizeInput(m.quantidade),
      preco: m.preco ? normalizeInput(m.preco) : undefined,
    }));

    if (normalizadas.some((m) => !m.quantidade || Number(m.quantidade) <= 0)) {
      setErro("Todas as quantidades devem ser maiores que zero");
      return;
    }

    if (
      tipo === "entrada" &&
      normalizadas.some((m) => !m.preco || Number(m.preco) <= 0)
    ) {
      setErro("Todos os preços devem ser maiores que zero");
      return;
    }

    try {
      const movimentacoesNum = normalizadas.map((m) => ({
        materialId: m.materialId,
        quantidade: Number(m.quantidade),
        ...(tipo === "entrada" ? { preco: Number(m.preco) } : {}),
      }));
      await onSubmit(movimentacoesNum);
    } catch (error) {
      setErro(
        `Erro ao registrar movimentação: ${
          error instanceof Error ? error.message : "Erro desconhecido"
        }`
      );
    }
  };

  return (
    <ScrollView style={styles.container}>
      {erro ? (
        <View style={styles.errorBox}>
          <Text style={styles.errorText}>{erro}</Text>
        </View>
      ) : null}

      {movimentacoes.map((movimentacao, index) => (
        <View key={index} style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Movimentação {index + 1}</Text>
            {movimentacoes.length > 1 && (
              <TouchableOpacity onPress={() => handleRemoveMovimentacao(index)}>
                <Text style={styles.removeText}>Remover</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Campo Material */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Material</Text>
            <View style={styles.pickerContainer}>
              {materiais.map((material) => (
                <TouchableOpacity
                  key={material.id}
                  style={[
                    styles.pickerItem,
                    movimentacao.materialId === material.id &&
                      styles.pickerItemSelected,
                  ]}
                  onPress={() =>
                    handleMovimentacaoChange(
                      index,
                      "materialId",
                      String(material.id)
                    )
                  }
                >
                  <Text style={styles.pickerText}>
                    {material.nome} ({material.unidade})
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Campo Quantidade */}
          {/* Este componente deve ser importado. Preservado o código original. */}
          <Input
            label="Quantidade"
            placeholder="Digite a quantidade"
            keyboardType="decimal-pad"
            value={movimentacao.quantidade}
            onChangeText={(text) =>
              handleMovimentacaoChange(index, "quantidade", text)
            }
          />

          {/* Campo Preço (somente em entrada) */}
          {tipo === "entrada" && (
            <Input
              label="Preço Unitário (R$)"
              placeholder="Digite o preço unitário"
              keyboardType="decimal-pad"
              value={movimentacao.preco}
              onChangeText={(text) =>
                handleMovimentacaoChange(index, "preco", text)
              }
            />
          )}
        </View>
      ))}

      <TouchableOpacity
        style={styles.addButton}
        onPress={handleAddMovimentacao}
      >
        <Text style={styles.addButtonText}>+ Adicionar movimentação</Text>
      </TouchableOpacity>

      <View style={styles.buttonsContainer}>
        <TouchableOpacity style={styles.cancelButton} onPress={onCancel}>
          <Text style={styles.cancelText}>Cancelar</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
          <Text style={styles.submitText}>
            {tipo === "entrada" ? "Registrar Entradas" : "Registrar Saídas"}
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

export default MovimentacaoFormRN;

// 🚀 CORREÇÃO 2: Define 'theme' (minúsculo) para uso nos estilos
const theme = THEME;

const styles = StyleSheet.create({
  // ATENÇÃO: Corrigido o erro de digitação de theme.colors.surfaace -> theme.colors.surface
  // e alterado o prefixo de acesso para usar o alias que foi adicionado no THEME.
  // Assumindo que você adicionou { colors: COLORS } no seu THEME no theme.ts.

  container: {
    padding: theme.spacing.md,
  },
  card: {
    backgroundColor: theme.colors.surface, // Corrigido 'surfaace' para 'surface'
    borderRadius: theme.radius.md,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: theme.spacing.sm,
  },
  cardTitle: {
    fontWeight: "700",
    fontSize: theme.fontSizes.md,
    color: theme.colors.textPrimary,
  },
  removeText: {
    color: theme.colors.error,
    fontWeight: "600",
  },
  inputGroup: {
    marginBottom: theme.spacing.md,
  },
  label: {
    fontWeight: "600",
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.xs,
  },
  pickerContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: theme.spacing.xs,
  },
  pickerItem: {
    padding: theme.spacing.sm,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.sm,
    marginBottom: theme.spacing.xs,
  },
  pickerItemSelected: {
    backgroundColor: theme.colors.successLight,
    borderColor: theme.colors.success,
  },
  pickerText: {
    color: theme.colors.textPrimary,
  },
  addButton: {
    marginVertical: theme.spacing.md,
    alignItems: "center",
  },
  addButtonText: {
    color: theme.colors.primary,
    fontWeight: "600",
  },
  buttonsContainer: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: theme.spacing.md,
  },
  cancelButton: {
    backgroundColor: theme.colors.surfaceVariant,
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    borderRadius: theme.radius.sm,
    marginRight: theme.spacing.sm,
  },
  cancelText: {
    color: theme.colors.textSecondary,
    fontWeight: "600",
  },
  submitButton: {
    backgroundColor: theme.colors.primary,
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    borderRadius: theme.radius.sm,
  },
  submitText: {
    color: theme.colors.white, // Alterado de "#FFF" para usar a constante do tema
    fontWeight: "600",
  },
  errorBox: {
    backgroundColor: theme.colors.errorBackground,
    padding: theme.spacing.sm,
    borderRadius: theme.radius.sm,
    marginBottom: theme.spacing.md,
  },
  errorText: {
    color: theme.colors.error,
    fontSize: theme.fontSizes.sm,
  },
});

//resolvido
