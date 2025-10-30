import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';

import { useAuth } from '../contexts/AuthContext';
import { estoqueService } from '../services/estoque';
import { materialService } from '../services/material';
import { SaldoMaterial, Material } from '../types';
import { formatCurrency } from '../utils/currency';

import Materiais from './Materiais';
import Estoque from './Estoque';

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
  const [activeTab, setActiveTab] = useState<'Painel' | 'Materiais' | 'Estoque'>('Painel');
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [saldos, setSaldos] = useState<SaldoMaterial[]>([]);
  const [materiais, setMateriais] = useState<Material[]>([]);
  const [loading, setLoading] = useState(true);
  const [manualLoading, setManualLoading] = useState(false);
  const [erro, setErro] = useState('');

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
      setErro('');
    } catch {
      setErro('Falha ao carregar dados');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregarDados(); // primeira carga

    const interval = setInterval(() => {
      carregarDados(); // recarrega a cada 10s
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  const handleLogout = async () => {
    setShowUserMenu(false);
    await logout();
    navigation.reset({
      index: 0,
      routes: [{ name: 'Welcome' }],
    });
  };

  const handleManualRefresh = async () => {
    try {
      setManualLoading(true);
      await carregarDados();
    } finally {
      setManualLoading(false);
    }
  };

  const PainelContent = () => {
    if (loading && !manualLoading) {
      return (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#6366F1" />
          <Text style={styles.loadingText}>Carregando...</Text>
        </View>
      );
    }

    const saldosValidos = Array.isArray(saldos) ? saldos : [];

    const valorTotalEstoque = formatCurrency(
      saldosValidos.reduce((total, saldo) => total + (saldo.quantidade || 0) * (saldo.precoMedio || 0), 0)
    );

    const itensBaixa = saldosValidos.filter(saldo => (saldo.quantidade || 0) < 10).length;

    return (
      <ScrollView contentContainerStyle={{ paddingBottom: 120 }}>
        {erro && (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>{erro}</Text>
          </View>
        )}

        {/* Botão de atualizar */}
        <View style={styles.refreshContainer}>
          <TouchableOpacity
            style={[styles.refreshButton, manualLoading && styles.refreshButtonDisabled]}
            onPress={handleManualRefresh}
            disabled={manualLoading}
          >
            {manualLoading ? (
              <ActivityIndicator color="#3B82F6" size="small" />
            ) : (
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Feather name="refresh-ccw" size={18} color="#3B82F6" />
                <Text style={styles.refreshText}>Atualizar agora</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        <DashboardCard
          title="Total de Materiais"
          value={materiais.length}
          iconName="box"
          iconBg="#DBEAFE"
          iconColor="#3B82F6"
          onPressLink={() => setActiveTab('Materiais')}
          linkText="Ver todos →"
        />

        <DashboardCard
          title="Valor Total em Estoque"
          value={valorTotalEstoque}
          iconName="dollar-sign"
          iconBg="#DCFCE7"
          iconColor="#22C55E"
          onPressLink={() => setActiveTab('Estoque')}
          linkText="Ver estoque →"
        />

        <DashboardCard
          title="Itens em Baixa"
          value={itensBaixa}
          iconName="alert-triangle"
          iconBg="#FEF9C3"
          iconColor="#CA8A04"
          onPressLink={() => setActiveTab('Estoque')}
          linkText="Verificar →"
        />

        <View style={styles.actionsContainer}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => navigation.navigate('EntradaMaterial')}
          >
            <Feather name="inbox" size={20} color="#3B82F6" />
            <Text style={styles.actionText}>Registrar Entrada</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => navigation.navigate('SaidaMaterial')}
          >
            <Feather name="arrow-up-right" size={20} color="#3B82F6" />
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
        <Text style={styles.welcomeText}>Olá, {usuario?.nome || 'Usuário'}!</Text>
        <TouchableOpacity style={styles.avatarButton} onPress={() => setShowUserMenu(true)}>
          <View style={styles.avatar}>
            <Feather name="user" size={20} color="#4F46E5" />
          </View>
        </TouchableOpacity>
      </View>

      {/* Modal de usuário */}
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
                <Feather name="user" size={24} color="#4F46E5" />
              </View>
              <Text style={styles.menuUserName}>{usuario?.nome}</Text>
              <Text style={styles.menuUserEmail}>{usuario?.email}</Text>
            </View>

            <View style={styles.menuDivider} />

            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => {
                setShowUserMenu(false);
                navigation.navigate('AlterarSenha');
              }}
            >
              <Feather name="lock" size={20} color="#6B7280" />
              <Text style={styles.menuItemText}>Alterar senha</Text>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.menuItem, styles.logoutItem]} onPress={handleLogout}>
              <Feather name="log-out" size={20} color="#EF4444" />
              <Text style={styles.logoutText}>Sair</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      <View style={styles.content}>{renderContent()}</View>

      {/* Abas inferiores */}
      <View style={styles.tabs}>
        {['Painel', 'Materiais', 'Estoque'].map(tab => (
          <TouchableOpacity
            key={tab}
            style={[styles.tabButton, activeTab === tab && styles.activeTab]}
            onPress={() => setActiveTab(tab as any)}
          >
            <Text style={[styles.tabText, activeTab === tab && styles.activeTabText]}>{tab}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#ffffffff' },
  header: { backgroundColor: '#f3f5ffff', paddingVertical: 18, alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 16, shadowColor: '#000', shadowOffset: { width: 5, height: 5 }, shadowOpacity: 0.05, elevation: 9 },
  welcomeText: { color: '#4F46E5', fontSize: 18, fontWeight: 'bold' },
  avatarButton: {},
  avatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#EEF2FF', justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: '#C7D2FE' },
  content: { flex: 1 },
  tabs: { flexDirection: 'row', marginHorizontal: 16, marginBottom: 18, backgroundColor: '#F3F4F6', borderRadius: 999, overflow: 'hidden' },
  tabButton: { flex: 1, paddingVertical: 10, alignItems: 'center' },
  tabText: { color: '#6B7280', fontWeight: '500' },
  activeTab: { backgroundColor: '#C7D2FE' },
  activeTabText: { color: '#4F46E5' },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  card: { backgroundColor: '#FFFFFF', padding: 16, marginHorizontal: 16, marginBottom: 16, borderRadius: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2, elevation: 2 },
  cardTitle: { fontSize: 14, color: '#6B7280', marginBottom: 4 },
  cardValue: { fontSize: 28, fontWeight: '600', color: '#111827', marginTop: 8 },
  cardLink: { color: '#4F46E5', fontWeight: '500', marginTop: 4 },
  iconContainer: { padding: 8, borderRadius: 999 },
  actionsContainer: { flexDirection: 'row', justifyContent: 'space-between', marginHorizontal: 16, marginBottom: 16 },
  actionButton: { flex: 1, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', paddingVertical: 12, marginHorizontal: 4, borderWidth: 1, borderColor: '#4F46E5', borderRadius: 999, backgroundColor: '#FFFFFF' },
  actionText: { color: '#3B82F6', fontWeight: '500', marginLeft: 8 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: 8, fontSize: 16, color: '#374151' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-start', alignItems: 'flex-end', paddingTop: 60, paddingRight: 16 },
  menuModal: { width: 280, backgroundColor: '#FFFFFF', borderRadius: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.15, shadowRadius: 12, elevation: 8 },
  menuHeader: { alignItems: 'center', paddingVertical: 20, paddingHorizontal: 16 },
  menuAvatar: { width: 60, height: 60, borderRadius: 30, backgroundColor: '#EEF2FF', justifyContent: 'center', alignItems: 'center', marginBottom: 12, borderWidth: 3, borderColor: '#C7D2FE' },
  menuUserName: { fontSize: 18, fontWeight: '600', color: '#111827', marginBottom: 4 },
  menuUserEmail: { fontSize: 14, color: '#6B7280' },
  menuDivider: { height: 1, backgroundColor: '#E5E7EB', marginHorizontal: 16 },
  menuItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 14, paddingHorizontal: 20 },
  menuItemText: { fontSize: 16, color: '#374151', marginLeft: 12, fontWeight: '500' },
  logoutItem: { borderTopWidth: 1, borderTopColor: '#FEE2E2', backgroundColor: '#FEF2F2', borderBottomLeftRadius: 16, borderBottomRightRadius: 16 },
  logoutText: { fontSize: 16, color: '#EF4444', marginLeft: 12, fontWeight: '600' },
  errorBox: { backgroundColor: '#FEE2E2', marginHorizontal: 16, borderRadius: 12, padding: 12, marginBottom: 16 },
  errorText: { color: '#B91C1C', fontWeight: '500' },
  refreshContainer: { alignItems: 'flex-end', marginHorizontal: 16, marginBottom: 8, marginTop: 10 },
  refreshButton: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#EFF6FF', borderWidth: 1, borderColor: '#3B82F6', paddingVertical: 6, paddingHorizontal: 10, borderRadius: 999 },
  refreshButtonDisabled: { opacity: 0.6 },
  refreshText: { color: '#3B82F6', fontWeight: '500', marginLeft: 6, fontSize: 14 },
});
