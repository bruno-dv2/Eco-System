import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ScrollView
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { estoqueService } from "../services/estoque";
import { SaldoMaterial } from "../types";
import { formatCurrency, formatQuantity } from "../utils/currency";
import { DashboardCard } from "../components/common/card/DashboardCard";
import { COLORS } from "../constants/theme";

export default function Estoque() {
  const [saldos, setSaldos] = useState<SaldoMaterial[]>([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState("");
  const [search, setSearch] = useState("");
  const [reloading, setReloading] = useState(false);
  const listRef = useRef<FlatList>(null);

  const carregarDados = async () => {
    try {
      setReloading(true);
      const saldosData = await estoqueService.consultarSaldo();
      const listaValida = Array.isArray(saldosData)
        ? saldosData.filter((s) => s.quantidade > 0)
        : [];
      setSaldos(listaValida);
      setErro("");
    } catch (error: any) {
      console.error("Erro ao carregar estoque:", error);
      setErro(error.message || "Falha ao carregar dados do estoque");
    } finally {
      setLoading(false);
      setReloading(false);
    }
  };

  useEffect(() => {
    carregarDados();
  }, []);

  const valorTotalEstoque = saldos.reduce(
    (total, s) => total + (s.quantidade || 0) * (s.precoMedio || 0),
    0
  );

  const saldosFiltrados = saldos.filter((s) =>
    s.material.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={{ marginTop: 8, color: COLORS.textSecondary }}>Carregando...</Text>
      </View>
    );
  }

  const renderItem = ({ item }: { item: SaldoMaterial }) => {
    const lowStock = (item.quantidade || 0) < 10;
    return (
      <View style={[styles.item, lowStock && styles.lowStock]}>
        <Text style={[styles.col, { flex: 3 }]}>{item.material}</Text>
        <Text style={[styles.col, { flex: 1, textAlign: "right" }]}>
          {formatQuantity(item.quantidade)}
        </Text>
        <Text style={[styles.col, { flex: 1 }]}>{item.unidade}</Text>
        <Text style={[styles.col, { flex: 2, textAlign: "right" }]}>
          {formatCurrency(item.precoMedio)}
        </Text>
        <Text style={[styles.col, { flex: 2, textAlign: "right" }]}>
          {formatCurrency(item.quantidade * item.precoMedio)}
        </Text>
      </View>
    );
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Controle de Estoque</Text>

      <View style={styles.refreshContainer}>
        <TouchableOpacity
          style={[styles.refreshButton, reloading && { opacity: 0.6 }]}
          onPress={carregarDados}
          disabled={reloading}
        >
          <Feather
            name={reloading ? "loader" : "refresh-ccw"}
            size={20}
            color={COLORS.primary}
          />
          <Text style={styles.refreshText}>
            {reloading ? "Atualizando..." : "Atualizar Dados"}
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.searchContainer}>
        <Feather name="search" size={20} color="#000" style={{ marginRight: 8 }} />
        <TextInput
          style={styles.searchInput}
          placeholder="Pesquisar material"
          value={search}
          onChangeText={setSearch}
        />
      </View>

      {erro ? <Text style={styles.msgErro}>{erro}</Text> : null}

      <DashboardCard variant="estoque" title="Resumo do Estoque">
        <Text style={styles.valorTotal}>
          Valor Total: {formatCurrency(valorTotalEstoque)}
        </Text>
      </DashboardCard>

      <DashboardCard variant="estoque" title="Saldo Atual">
        <View style={[styles.item, styles.header]}>
          <Text style={[styles.col, { flex: 3 }]}>Material</Text>
          <Text style={[styles.col, { flex: 1, textAlign: "right" }]}>Qtd</Text>
          <Text style={[styles.col, { flex: 1 }]}>Uni</Text>
          <Text style={[styles.col, { flex: 2, textAlign: "right" }]}>Preço</Text>
          <Text style={[styles.col, { flex: 2, textAlign: "right" }]}>Total</Text>
        </View>

        {saldosFiltrados.length === 0 ? (
          <View style={styles.item}>
            <Text style={{ flex: 9, textAlign: "center", color: "#6b7280" }}>
              Nenhum material em estoque
            </Text>
          </View>
        ) : (
          <FlatList
            ref={listRef}
            data={saldosFiltrados}
            keyExtractor={(_, index) => index.toString()}
            renderItem={renderItem}
          />
        )}

        {saldosFiltrados.length > 0 && (
          <View style={[styles.item, styles.header]}>
            <Text style={{ flex: 8, textAlign: "right", fontWeight: "bold" }}>
              Valor Total do Estoque:
            </Text>
            <Text style={{ flex: 2, textAlign: "right", fontWeight: "bold" }}>
              {formatCurrency(valorTotalEstoque)}
            </Text>
          </View>
        )}
      </DashboardCard>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: "#f9fafb" },
  centered: { flex: 1, justifyContent: "center", alignItems: "center" },
  title: { fontSize: 22, fontWeight: "bold", marginBottom: 12 },
  refreshContainer: {
    alignItems: "flex-end",
    marginBottom: 12,
  },
  refreshButton: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: COLORS.primary,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  refreshText: { color: COLORS.primary, fontWeight: "500", marginLeft: 6 },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#292626",
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginBottom: 12,
    backgroundColor: "#fff",
  },
  searchInput: { flex: 1, height: 40 },
  msgErro: {
    backgroundColor: "#fee2e2",
    color: "#b91c1c",
    padding: 8,
    borderRadius: 4,
    marginBottom: 8,
  },
  valorTotal: {
    fontSize: 22,
    fontWeight: "bold",
    marginTop: 8,
    color: "#16a34a",
  },
  item: {
    flexDirection: "row",
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderColor: "#ddd",
    alignItems: "center",
  },
  header: {
    backgroundColor: "#f3f4f6",
    borderBottomWidth: 1,
    borderColor: "#ccc",
  },
  col: { paddingHorizontal: 4, fontSize: 14, color: "#111827" },
  lowStock: { backgroundColor: "#fee2e2" },
});
