import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, ActivityIndicator, TouchableOpacity, StyleSheet, Modal } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { estoqueService } from '../services/estoque';
import { materialService } from '../services/material';
import { SaldoMaterial, Material } from '../types';
import { formatCurrency } from '../utils/currency';
import MateriaisScreen from './Materiais'; 
import Estoque from './Estoque';
import { Feather } from "@expo/vector-icons";
import { useAuth } from '../contexts/AuthContext';

const Dashboard: React.FC = () => {
  const { logout, usuario } = useAuth();
  const [saldos, setSaldos] = useState<SaldoMaterial[]>([]);
  const [materiais, setMateriais] = useState<Material[]>([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState('');
  const [activeTab, setActiveTab] = useState<'Painel' | 'Materiais' | 'Estoque'>('Painel');
  const [showUserMenu, setShowUserMenu] = useState(false);

  const navigation = useNavigation<any>();

  const handleLogout = async () => {
    setShowUserMenu(false);
    await logout();
    navigation.reset({
      index: 0,
      routes: [{ name: 'Welcome' }],
    });
  };

  const carregarDados = async () => {
    try {
      const [saldosData, materiaisData] = await Promise.all([
        estoqueService.consultarSaldo(),
        materialService.listar()
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
    carregarDados();
  }, []);

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#6366F1" />
        <Text style={styles.loadingText}>Carregando...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={{ paddingBottom: 120 }}>
        {/* Header com Avatar */}
        <View style={styles.header}>
          <Text style={styles.welcomeText}>Olá, {usuario?.nome || 'Usuário'}!</Text>
          <TouchableOpacity 
            style={styles.avatarButton}
            onPress={() => setShowUserMenu(true)}
          >
            <View style={styles.avatar}>
              <Feather name="user" size={20} color="#4F46E5" />
            </View>
          </TouchableOpacity>
        </View>
        
        {/* Modal Menu de Usuário */}
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

              <TouchableOpacity
                style={[styles.menuItem, styles.logoutItem]}
                onPress={handleLogout}
              >
                <Feather name="log-out" size={20} color="#EF4444" />
                <Text style={styles.logoutText}>Sair</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </Modal>

        {/* Tabs */}
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

        {/* Painel */}
        {activeTab === 'Painel' && (
          <>
            {/* Card Total de Materiais */}
            <View style={styles.card}>
              <View style={styles.rowBetween}>
                <Text style={styles.cardTitle}>Total de materiais</Text>
                <TouchableOpacity onPress={() => navigation.navigate('Materiais')}>
                  <Text style={styles.cardLink}>Ver todos →</Text>
                </TouchableOpacity>
              </View>
              <Text style={styles.cardValue}>{materiais.length}</Text>
            </View>

            {/* Ações Rápidas */}
            
            <View style={styles.actionsContainer}>
              <TouchableOpacity style={styles.actionButton} onPress={() => navigation.navigate('EntradaMaterial')}>
                <Text style={styles.actionText}>Nova Entrada</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.actionButton} onPress={() => navigation.navigate('SaidaMaterial')}>
                <Text style={styles.actionText}>Nova Saída</Text>
              </TouchableOpacity>
            </View>

            {/* Card Valor Total em Estoque */}
            <View style={styles.card}>
              <View style={styles.rowBetween}>
                <Text style={styles.cardTitle}>Valor total em estoque</Text>
                <TouchableOpacity onPress={() => navigation.navigate('Estoque')}>
                  <Text style={styles.cardLink}>Ver estoque →</Text>
                </TouchableOpacity>
              </View>
              <Text style={styles.cardValue}>
                {formatCurrency(saldos.reduce((total, saldo) => total + (saldo.quantidade * saldo.precoMedio), 0))}
              </Text>
            </View>

            {/* Botão Adicionar Material */}
            <TouchableOpacity style={styles.addButton} onPress={() => navigation.navigate('AdicionarMaterial')}>
              <Text style={styles.addButtonText}>Adicionar material ao sistema</Text>
            </TouchableOpacity>
          </>
        )}

        {/* Materiais */}
        {activeTab === 'Materiais' && <MateriaisScreen />}

        {/* Estoque */}
        {activeTab === 'Estoque' && <Estoque />}

      </ScrollView>

      {/* Navegação Inferior */}
      <View style={styles.bottomNav}>
        {[
          { name: "Entrada", icon: "log-in", action: () => navigation.navigate("EntradaMaterial") },
          { name: "Saída", icon: "log-out", action: () => navigation.navigate("SaidaMaterial") },
          { name: "Painel", icon: "layout", action: () => setActiveTab("Painel") },
          { name: "Materiais", icon: "archive", action: () => setActiveTab("Materiais") },
          { name: "Estoque", icon: "box", action: () => setActiveTab("Estoque") },
        ].map((item) => (
          <TouchableOpacity key={item.name} style={styles.navItem} onPress={item.action}>
            <Feather name={item.icon as any} size={20} color="#000" />
            <Text style={styles.navText}>{item.name}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

export default Dashboard;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 8,
    fontSize: 16,
    color: '#374151',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  welcomeText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  avatarButton: {
    padding: 4,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#EEF2FF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#C7D2FE',
  },
  tabs: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 16,
    backgroundColor: '#F3F4F6',
    borderRadius: 999,
    overflow: 'hidden',
  },
  tabButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
  },
  tabText: {
    color: '#6B7280',
    fontWeight: '500',
  },
  activeTab: {
    backgroundColor: '#C7D2FE',
  },
  activeTabText: {
    color: '#4F46E5',
  },
  card: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 4,
  },
  cardValue: {
    fontSize: 28,
    fontWeight: '600',
    color: '#111827',
    marginTop: 8,
  },
  cardLink: {
    color: '#4F46E5',
    fontWeight: '500',
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginHorizontal: 16,
    marginBottom: 16,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 12,
    marginHorizontal: 4,
    borderWidth: 1,
    borderColor: '#4F46E5',
    borderRadius: 999,
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  actionText: {
    color: '#4F46E5',
    fontWeight: '500',
  },
  addButton: {
    marginHorizontal: 16,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: '#4F46E5',
    borderRadius: 999,
    alignItems: 'center',
    marginBottom: 16,
    backgroundColor: '#FFFFFF',
  },
  addButtonText: {
    color: '#4F46E5',
    fontWeight: '500',
  },
  bottomNav: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    height: 80,
    width: '100%',
    justifyContent: 'space-around',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    paddingBottom: 10,
  },
  navItem: {
    alignItems: 'center',
  },
  navText: {
    color: '#6B7280',
    fontWeight: '500',
    fontSize: 12,
    marginTop: 4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-start',
    alignItems: 'flex-end',
    paddingTop: 60,
    paddingRight: 16,
  },
  menuModal: {
    width: 280,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 0,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  menuHeader: {
    alignItems: 'center',
    paddingVertical: 20,
    paddingHorizontal: 16,
  },
  menuAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#EEF2FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 3,
    borderColor: '#C7D2FE',
  },
  menuUserName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  menuUserEmail: {
    fontSize: 14,
    color: '#6B7280',
  },
  menuDivider: {
    height: 1,
    backgroundColor: '#E5E7EB',
    marginHorizontal: 16,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 20,
  },
  menuItemText: {
    fontSize: 16,
    color: '#374151',
    marginLeft: 12,
    fontWeight: '500',
  },
  logoutItem: {
    borderTopWidth: 1,
    borderTopColor: '#FEE2E2',
    backgroundColor: '#FEF2F2',
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
  },
  logoutText: {
    fontSize: 16,
    color: '#EF4444',
    marginLeft: 12,
    fontWeight: '600',
  },
});