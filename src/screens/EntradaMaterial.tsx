import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, ActivityIndicator, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Material } from '../types';
import { materialService } from '../services/material';
import { estoqueService } from '../services/estoque';
import MovimentacaoFormRN from '../components/MovimentacaoFormRN';

interface Movimentacao {
  materialId: number;
  quantidade: number;
  preco?: number;
}

const EntradaMaterial: React.FC = () => {
  const [materiais, setMateriais] = useState<Material[]>([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState('');
  const [sucesso, setSucesso] = useState(false);
  const navigation = useNavigation<any>();

  useEffect(() => {
    carregarMateriais();
  }, []);

  const carregarMateriais = async () => {
    try {
      const data = await materialService.listar();
      setMateriais(data);
    } catch {
      setErro('Falha ao carregar materiais');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (movimentacoes: Movimentacao[]) => {
    try {
      await estoqueService.registrarEntrada(
        movimentacoes.map(m => ({
          materialId: m.materialId,
          quantidade: m.quantidade,
          preco: m.preco || 0
        }))
      );
      setSucesso(true);
      setTimeout(() => {
        navigation.navigate('Estoque');
      }, 2000);
    } catch {
      setErro('Falha ao registrar entradas');
    }
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#2563EB" />
        <Text style={styles.loadingText}>Carregando...</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.card}>
        <View style={styles.header}>
          <Text style={styles.title}>Registrar Entrada de Material</Text>
        </View>

        <View style={styles.body}>
          {erro ? (
            <View style={styles.errorBox}>
              <Text style={styles.errorText}>{erro}</Text>
            </View>
          ) : null}

          {sucesso ? (
            <View style={styles.successBox}>
              <Text style={styles.successText}>Entradas registradas com sucesso!</Text>
            </View>
          ) : null}

          <MovimentacaoFormRN
            materiais={materiais}
            tipo="entrada"
            onSubmit={handleSubmit}
            onCancel={() => navigation.navigate('Estoque')}
          />
        </View>
      </View>
    </ScrollView>
  );
};

export default EntradaMaterial;

const styles = StyleSheet.create({
  container: {
    padding: 16,
    paddingBottom: 32,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  loadingText: {
    marginTop: 8,
    fontSize: 16,
    color: '#374151',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  header: {
    backgroundColor: '#ffffffff',
    padding: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000000ff',
  },
  body: {
    padding: 16,
  },
  errorBox: {
    backgroundColor: '#FEE2E2',
    borderLeftWidth: 4,
    borderLeftColor: '#EF4444',
    padding: 12,
    marginBottom: 12,
  },
  errorText: {
    color: '#B91C1C',
  },
  successBox: {
    backgroundColor: '#D1FAE5',
    borderLeftWidth: 4,
    borderLeftColor: '#10B981',
    padding: 12,
    marginBottom: 12,
  },
  successText: {
    color: '#047857',
  },
});
