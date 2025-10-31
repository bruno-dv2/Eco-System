import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";

import { useAuth } from "../contexts/AuthContext";
import { estoqueService } from "../services/estoque";
import { materialService } from "../services/material";
import { SaldoMaterial, Material } from "../types";
import { formatCurrency } from "../utils/currency";
import { COLORS, SIZES } from "../constants/theme";
import Materiais from "./Materiais";
import Estoque from "./Estoque";
import { DashboardCard } from "../components/common/card/DashboardCard";

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState<"Painel" | "Materiais" | "Estoque">("Painel");
  const [visitedTabs, setVisitedTabs] = useState(["Painel"]);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [saldos, setSaldos] = useState<SaldoMaterial[]>([]);
  const [materiais, setMateriais] = useState<Material[]>([]);
  const [loading, setLoading] = useState(true);
  const [reloading, setReloading] = useState(false);
  const [erro, setErro] = useState("");

  const { logout, usuario } = useAuth();
  const navigation = useNavigation<any>();

  const carregarDados = async () => {
    setReloading(true);
    try {
      const [saldosData, materiaisData] = await Promise.all([
        estoqueService.consultarSaldo(),
        materialService.listar(),
      ]);
      setSaldos(Array.isArray(saldosData) ? saldosData : []);
      setMateriais(Array.isArray(materiaisData) ? materiaisData : []);
      setErro("");
    } catch (error: any) {
      console.error("Erro ao carregar dados:", error);
      setErro(error.message || "Falha ao carregar dados");
    } finally {
      setLoading(false);
      setReloading(false);
    }
  };

  useEffect(() => {
    carregarDados();
  }, []);

  const handleTabChange = (tab: "Painel" | "Materiais" | "Estoque") => {
    setActiveTab(tab);
    if (!visitedTabs.includes(tab)) setVisitedTabs([...visitedTabs, tab]);
  };

  const handleLogout = async () => {
    setShowUserMenu(false);
    await logout();
    navigation.reset({ index: 0, routes: [{ name: "Welcome" }] });
  };

  const PainelContent = () => {
    if (loading)
      return (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Carregando...</Text>
        </View>
      );

    const valorTotalEstoque = formatCurrency(
      saldos.reduce(
        (total, s) => total + (s.quantidade || 0) * (s.precoMedio || 0),
        0
      )
    );

    const itensBaixa = saldos.filter((s) => (s.quantidade || 0) < 10).length;

    return (
      <ScrollView contentContainerStyle={{ paddingBottom: 120 }}>
        {erro ? (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>{erro}</Text>
          </View>
        ) : null}

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

        <DashboardCard
          title="Total de Materiais"
          value={materiais.length}
          iconName="box"
          iconBg={COLORS.surface}
          iconColor={COLORS.secondary}
          linkText="Ver todos →"
          onPressLink={() => handleTabChange("Materiais")}
        />

        <DashboardCard
          title="Valor Total em Estoque"
          value={valorTotalEstoque}
          iconName="dollar-sign"
          iconBg={COLORS.surface}
          iconColor={COLORS.success}
          linkText="Ver estoque →"
          onPressLink={() => handleTabChange("Estoque")}
        />

        <DashboardCard
          title="Itens em Baixa"
          value={itensBaixa}
          iconName="alert-triangle"
          iconBg={COLORS.surface}
          iconColor={COLORS.warning}
          linkText="Verificar →"
          onPressLink={() => handleTabChange("Estoque")}
        />

        <View style={styles.actionsContainer}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => navigation.navigate("EntradaMaterial")}
          >
            <Feather name="inbox" size={20} color={COLORS.secondary} />
            <Text style={styles.actionText}>Registrar Entrada</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => navigation.navigate("SaidaMaterial")}
          >
            <Feather name="arrow-up-right" size={20} color={COLORS.secondary} />
            <Text style={styles.actionText}>Registrar Saída</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    );
  };

  const renderContent = () => (
    <>
      <View style={{ display: activeTab === "Painel" ? "flex" : "none", flex: 1 }}>
        <PainelContent />
      </View>

      {visitedTabs.includes("Materiais") && (
        <View style={{ display: activeTab === "Materiais" ? "flex" : "none", flex: 1 }}>
          <Materiais />
        </View>
      )}

      {visitedTabs.includes("Estoque") && (
        <View style={{ display: activeTab === "Estoque" ? "flex" : "none", flex: 1 }}>
          <Estoque />
        </View>
      )}
    </>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <Text style={styles.welcomeText}>Olá, {usuario?.nome || "Usuário"}!</Text>
        <TouchableOpacity
          style={styles.avatarButton}
          onPress={() => setShowUserMenu(true)}
        >
          <View style={styles.avatar}>
            <Feather name="user" size={20} color={COLORS.primary} />
          </View>
        </TouchableOpacity>
      </View>

      <Modal
        visible={showUserMenu}
        transparent
        animationType="fade"
        onRequestClose={() => setShowUserMenu(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPressOut={() => setShowUserMenu(false)}
        >
          <View style={styles.menuModal}>
            <View style={styles.menuHeader}>
              <Feather name="user" size={48} color={COLORS.primary} />
              <Text style={styles.menuUserName}>{usuario?.nome}</Text>
              <Text style={styles.menuUserEmail}>{usuario?.email}</Text>
            </View>

            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => {
                setShowUserMenu(false);
                navigation.navigate("AlterarSenha");
              }}
            >
              <Feather name="lock" size={20} color={COLORS.textSecondary} />
              <Text style={styles.menuItemText}>Alterar senha</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.menuItem} onPress={handleLogout}>
              <Feather name="log-out" size={20} color={COLORS.error} />
              <Text style={[styles.menuItemText, { color: COLORS.error }]}>Sair</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      <View style={styles.content}>{renderContent()}</View>

      <View style={styles.tabs}>
        {["Painel", "Materiais", "Estoque"].map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[styles.tabButton, activeTab === tab && styles.activeTab]}
            onPress={() => handleTabChange(tab as any)}
          >
            <Text style={[styles.tabText, activeTab === tab && styles.activeTabText]}>
              {tab}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORS.background },
  header: {
    backgroundColor: COLORS.surface,
    paddingVertical: SIZES.padding,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: SIZES.padding,
    elevation: 4,
  },
  welcomeText: { color: COLORS.primary, fontSize: SIZES.fontLarge, fontWeight: "bold" },
  avatarButton: { padding: 4 },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.surface,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: COLORS.primary,
  },
  refreshContainer: {
    alignItems: "flex-end",
    marginHorizontal: SIZES.padding,
    marginBottom: 10,
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
  actionsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginHorizontal: SIZES.padding,
    marginBottom: SIZES.padding,
  },
  actionButton: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 12,
    marginHorizontal: 4,
    borderWidth: 1,
    borderColor: COLORS.primary,
    borderRadius: 999,
    backgroundColor: COLORS.background,
  },
  actionText: { color: COLORS.secondary, fontWeight: "500", marginLeft: 8 },
  tabs: {
    flexDirection: "row",
    marginHorizontal: SIZES.padding,
    marginBottom: SIZES.padding,
    backgroundColor: COLORS.surface,
    borderRadius: 999,
    overflow: "hidden",
  },
  tabButton: { flex: 1, paddingVertical: 10, alignItems: "center" },
  tabText: { color: COLORS.textSecondary },
  activeTab: { backgroundColor: COLORS.border },
  activeTabText: { color: COLORS.primary, fontWeight: "600" },
  content: { flex: 1 },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-start",
    alignItems: "flex-end",
    paddingTop: 60,
    paddingRight: SIZES.padding,
  },
  menuModal: {
    width: 280,
    backgroundColor: COLORS.background,
    borderRadius: SIZES.radius,
    paddingVertical: 20,
    paddingHorizontal: 16,
    elevation: 10,
  },
  menuHeader: { alignItems: "center", marginBottom: 10 },
  menuUserName: { fontSize: 18, fontWeight: "bold", color: COLORS.text },
  menuUserEmail: { color: COLORS.textSecondary },
  menuItem: { flexDirection: "row", alignItems: "center", paddingVertical: 10 },
  menuItemText: { marginLeft: 10, fontSize: 16, color: COLORS.text },
  errorBox: {
    backgroundColor: COLORS.surface,
    marginHorizontal: SIZES.padding,
    borderRadius: SIZES.radius,
    padding: SIZES.padding / 1.5,
    marginBottom: SIZES.padding,
  },
  errorText: { color: COLORS.error, fontWeight: "500" },
  centered: { flex: 1, justifyContent: "center", alignItems: "center" },
  loadingText: { marginTop: 8, color: COLORS.textSecondary },
});
