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

import Materiais from "./Materiais";
import Estoque from "./Estoque";

// 🎨 Importa o tema global
import { COLORS, SIZES } from "../constants/theme";

interface DashboardCardProps {
  title: string;
  value: string | number;
  iconName: string;
  iconBg: string;
  iconColor: string;
  onPressLink?: () => void;
  linkText?: string;
}

const DashboardCard: React.FC<DashboardCardProps> = ({
  title,
  value,
  iconName,
  iconBg,
  iconColor,
  onPressLink,
  linkText,
}) => (
  <View style={styles.card}>
    <View style={styles.rowBetween}>
      <Text style={styles.cardTitle}>{title}</Text>
      <View style={[styles.iconContainer, { backgroundColor: iconBg }]}>
        <Feather name={iconName as any} size={24} color={iconColor} />
      </View>
    </View>
    <Text style={styles.cardValue}>{value}</Text>
    {onPressLink && linkText && (
      <TouchableOpacity onPress={onPressLink}>
        <Text style={styles.cardLink}>{linkText}</Text>
      </TouchableOpacity>
    )}
  </View>
);

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState<
    "Painel" | "Materiais" | "Estoque"
  >("Painel");
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [saldos, setSaldos] = useState<SaldoMaterial[]>([]);
  const [materiais, setMateriais] = useState<Material[]>([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState("");

  const { logout, usuario } = useAuth();
  const navigation = useNavigation<any>();

  const carregarDados = async () => {
    try {
      const [saldosData, materiaisData] = await Promise.all([
        estoqueService.consultarSaldo(),
        materialService.listar(),
      ]);
      setSaldos(saldosData);
      setMateriais(materiaisData);
      setErro("");
    } catch {
      setErro("Falha ao carregar dados");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregarDados();
  }, []);

  const handleLogout = async () => {
    setShowUserMenu(false);
    await logout();
    navigation.reset({
      index: 0,
      routes: [{ name: "Welcome" }],
    });
  };

  const PainelContent = () => {
    if (loading) {
      return (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Carregando...</Text>
        </View>
      );
    }

  const saldosValidos = Array.isArray(saldos) ? saldos : [];

  const valorTotalEstoque = formatCurrency(
    saldosValidos.reduce(
      (total, saldo) => total + (saldo.quantidade || 0) * (saldo.precoMedio || 0),
      0
    )
  );

  const itensBaixa = saldosValidos.filter(
    (saldo) => (saldo.quantidade || 0) < 10
  ).length;

    return (
      <ScrollView contentContainerStyle={{ paddingBottom: 120 }}>
        {erro && (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>{erro}</Text>
          </View>
        )}

        <DashboardCard
          title="Total de Materiais"
          value={materiais.length}
          iconName="box"
          iconBg={COLORS.surface}
          iconColor={COLORS.secondary}
          onPressLink={() => setActiveTab("Materiais")}
          linkText="Ver todos →"
        />

        <DashboardCard
          title="Valor Total em Estoque"
          value={valorTotalEstoque}
          iconName="dollar-sign"
          iconBg={COLORS.surface}
          iconColor={COLORS.success}
          onPressLink={() => setActiveTab("Estoque")}
          linkText="Ver estoque →"
        />

        <DashboardCard
          title="Itens em Baixa"
          value={itensBaixa}
          iconName="alert-triangle"
          iconBg={COLORS.surface}
          iconColor={COLORS.warning}
          onPressLink={() => setActiveTab("Estoque")}
          linkText="Verificar →"
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
      <View style={{ display: activeTab === 'Painel' ? 'flex' : 'none', flex: 1 }}>
        <PainelContent />
      </View>
      <View style={{ display: activeTab === 'Materiais' ? 'flex' : 'none', flex: 1 }}>
        <Materiais />
      </View>
      <View style={{ display: activeTab === 'Estoque' ? 'flex' : 'none', flex: 1 }}>
        <Estoque />
      </View>
    </>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <Text style={styles.welcomeText}>
          Olá, {usuario?.nome || "Usuário"}!
        </Text>
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
              <View style={styles.menuAvatar}>
                <Feather name="user" size={24} color={COLORS.primary} />
              </View>
              <Text style={styles.menuUserName}>{usuario?.nome}</Text>
              <Text style={styles.menuUserEmail}>{usuario?.email}</Text>
            </View>

            <View style={styles.menuDivider} />

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

            <TouchableOpacity
              style={[styles.menuItem, styles.logoutItem]}
              onPress={handleLogout}
            >
              <Feather name="log-out" size={20} color={COLORS.error} />
              <Text style={styles.logoutText}>Sair</Text>
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
            onPress={() => setActiveTab(tab as any)}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === tab && styles.activeTabText,
              ]}
            >
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
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: SIZES.padding,
    shadowColor: "#000",
    shadowOffset: { width: 5, height: 5 },
    shadowOpacity: 0.05,
    elevation: 9,
  },
  welcomeText: {
    color: COLORS.primary,
    fontSize: SIZES.fontLarge,
    fontWeight: "bold",
  },
  avatarButton: {},
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
  content: { flex: 1 },
  tabs: {
    flexDirection: "row",
    marginHorizontal: SIZES.padding,
    marginBottom: SIZES.padding,
    backgroundColor: COLORS.surface,
    borderRadius: 999,
    overflow: "hidden",
  },
  tabButton: { flex: 1, paddingVertical: 10, alignItems: "center" },
  tabText: { color: COLORS.textSecondary, fontWeight: "500" },
  activeTab: { backgroundColor: COLORS.border },
  activeTabText: { color: COLORS.primary },
  rowBetween: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  card: {
    backgroundColor: COLORS.background,
    padding: SIZES.padding,
    marginHorizontal: SIZES.padding,
    marginBottom: SIZES.padding,
    borderRadius: SIZES.radius,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  cardTitle: {
    fontSize: SIZES.fontSmall,
    color: COLORS.textSecondary,
    marginBottom: 4,
  },
  cardValue: {
    fontSize: SIZES.fontXL,
    fontWeight: "600",
    color: COLORS.text,
    marginTop: 8,
  },
  cardLink: { color: COLORS.primary, fontWeight: "500", marginTop: 4 },
  iconContainer: { padding: 8, borderRadius: 999 },
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
  centered: { flex: 1, justifyContent: "center", alignItems: "center" },
  loadingText: {
    marginTop: 8,
    fontSize: SIZES.fontMedium,
    color: COLORS.textSecondary,
  },
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
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  menuHeader: {
    alignItems: "center",
    paddingVertical: 20,
    paddingHorizontal: SIZES.padding,
  },
  menuAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: COLORS.surface,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
    borderWidth: 3,
    borderColor: COLORS.primary,
  },
  menuUserName: {
    fontSize: SIZES.fontLarge,
    fontWeight: "600",
    color: COLORS.text,
    marginBottom: 4,
  },
  menuUserEmail: { fontSize: SIZES.fontSmall, color: COLORS.textSecondary },
  menuDivider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginHorizontal: SIZES.padding,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 20,
  },
  menuItemText: {
    fontSize: SIZES.fontMedium,
    color: COLORS.text,
    marginLeft: 12,
    fontWeight: "500",
  },
  logoutItem: {
    borderTopWidth: 1,
    borderTopColor: COLORS.error,
    backgroundColor: COLORS.surface,
    borderBottomLeftRadius: SIZES.radius,
    borderBottomRightRadius: SIZES.radius,
  },
  logoutText: {
    fontSize: SIZES.fontMedium,
    color: COLORS.error,
    marginLeft: 12,
    fontWeight: "600",
  },
  errorBox: {
    backgroundColor: COLORS.surface,
    marginHorizontal: SIZES.padding,
    borderRadius: SIZES.radius,
    padding: SIZES.padding / 1.5,
    marginBottom: SIZES.padding,
  },
  errorText: { color: COLORS.error, fontWeight: "500" },
});
