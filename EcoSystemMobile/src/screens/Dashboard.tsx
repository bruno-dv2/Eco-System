import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, ActivityIndicator, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { estoqueService } from '../services/estoque';
import { materialService } from '../services/material';
import { SaldoMaterial, Material } from '../types';
import { formatCurrency } from '../utils/currency';
import MateriaisScreen from './Materiais'; 
import Estoque from './Estoque';
import { Feather } from "@expo/vector-icons";

const Dashboard: React.FC = () => {
  const [saldos, setSaldos] = useState<SaldoMaterial[]>([]);
  const [materiais, setMateriais] = useState<Material[]>([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState('');
  const [activeTab, setActiveTab] = useState<'Painel' | 'Materiais' | 'Estoque'>('Painel');

  const navigation = useNavigation<any>();

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
        {/* Header Usuário */}
        <View style={styles.header}>
          <Text style={styles.userText}>Usuário</Text>
        </View>

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
        {activeTab === 'Estoque' &&  <Estoque />}

      </ScrollView>

     {/* Navegação */}
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
    backgroundColor: '#FFFFFF',
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
    padding: 16,
  },
  userText: {
    fontSize: 16,
    color: '#111827',
  },
  tabs: {
    flexDirection: 'row',
    marginHorizontal: 16,
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
    borderWidth: 1,
    borderColor: '#E5E7EB',
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
  },
  addButtonText: {
    color: '#4F46E5',
    fontWeight: '500',
  },
  bottomNav: {
    flexDirection: 'row',
    backgroundColor: '#0022ce51',
    height: 80,
    width: '100%',
    justifyContent: 'space-around',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  navItem: {
    alignItems: 'center',
     marginTop: -10,
  },
  navText: {
    color: '#000000ff',
    fontWeight: '500',
  },
});
