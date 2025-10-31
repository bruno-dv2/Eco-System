import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TextInput,
  StyleSheet,
  ScrollView,
  RefreshControl,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { estoqueService } from '../services/estoque';
import { SaldoMaterial } from '../types';
import { formatCurrency, formatQuantity } from '../utils/currency';
import Loading from '../components/common/Loading';
import { COLORS, SIZES } from '../constants/theme';

export default function Estoque() {
  const [saldos, setSaldos] = useState<SaldoMaterial[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [erro, setErro] = useState('');
  const [search, setSearch] = useState('');

  const carregarDados = async () => {
    try {
      const saldosData = await estoqueService.consultarSaldo();
      setSaldos(saldosData.filter(saldo => saldo.quantidade > 0));
      setErro('');
    } catch {
      setErro('Falha ao carregar dados do estoque');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    carregarDados();
  }, []);

  useEffect(() => {
    carregarDados();
  }, []);

  const valorTotalEstoque = saldos.reduce(
    (total, saldo) => total + saldo.quantidade * saldo.precoMedio,
    0
  );

  const saldosFiltrados = saldos.filter(s =>
    s.material.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return <Loading message="Carregando estoque..." fullScreen />;
  }

  const renderItem = ({ item }: { item: SaldoMaterial }) => {
    const lowStock = item.quantidade < 10;
    return (
      <View style={[styles.item, lowStock && styles.lowStock]}>
        <Text style={[styles.col, { flex: 3 }]}>{item.material}</Text>
        <Text style={[styles.col, { flex: 1, textAlign: 'right' }]}>
          {formatQuantity(item.quantidade)}
        </Text>
        <Text style={[styles.col, { flex: 1 }]}>{item.unidade}</Text>
        <Text style={[styles.col, { flex: 2, textAlign: 'right' }]}>
          {formatCurrency(item.precoMedio)}
        </Text>
        <Text style={[styles.col, { flex: 2, textAlign: 'right' }]}>
          {formatCurrency(item.quantidade * item.precoMedio)}
        </Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <ScrollView
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[COLORS.primary]}
            tintColor={COLORS.primary}
          />
        }
      >
        {/* Cabeçalho */}
        <Text style={styles.title}>Controle de Estoque</Text>

        {/* Barra de pesquisa */}
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

        {/* Resumo do estoque */}
        <View style={styles.card}>
          <Text style={styles.subtitle}>Resumo do Estoque</Text>
          <Text style={styles.valorTotal}>Valor Total: {formatCurrency(valorTotalEstoque)}</Text>
        </View>

        {/* Lista de saldo */}
        <View style={styles.card}>
          <Text style={styles.subtitle}>Saldo Atual</Text>

          {/* Cabeçalho da lista */}
          <View style={[styles.item, styles.header]}>
            <Text style={[styles.col, { flex: 3 }]}>Material</Text>
            <Text style={[styles.col, { flex: 1, textAlign: 'right' }]}>Qtd</Text>
            <Text style={[styles.col, { flex: 1 }]}>Uni</Text>
            <Text style={[styles.col, { flex: 2, textAlign: 'right' }]}>Preço</Text>
            <Text style={[styles.col, { flex: 2, textAlign: 'right' }]}>Total</Text>
          </View>

          {saldosFiltrados.length === 0 ? (
            <View style={[styles.item]}>
              <Text style={{ flex: 9, textAlign: 'center', color: '#6b7280' }}>
                Nenhum material em estoque
              </Text>
            </View>
          ) : (
            <FlatList
              data={saldosFiltrados}
              keyExtractor={(item, index) => index.toString()}
              renderItem={renderItem}
              scrollEnabled={false}
            />
          )}

          {/* Total */}
          {saldosFiltrados.length > 0 && (
            <View style={[styles.item, styles.header]}>
              <Text style={{ flex: 8, textAlign: 'right', fontWeight: 'bold' }}>
                Valor Total do Estoque:
              </Text>
              <Text style={{ flex: 2, textAlign: 'right', fontWeight: 'bold' }}>
                {formatCurrency(valorTotalEstoque)}
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#f9fafb' },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 12 },
  subtitle: { fontSize: 18, fontWeight: '600', marginBottom: 8 },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#292626',
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginBottom: 12,
    backgroundColor: '#fff',
  },
  searchInput: { flex: 1, height: 40 },
  msgErro: { backgroundColor: '#fee2e2', color: '#b91c1c', padding: 8, borderRadius: 4, marginBottom: 8 },
  card: { backgroundColor: '#fff', borderRadius: 8, padding: 16, marginBottom: 16, elevation: 2 },
  valorTotal: { fontSize: 22, fontWeight: 'bold', marginTop: 8 },
  item: { flexDirection: 'row', paddingVertical: 12, paddingHorizontal: 8, borderBottomWidth: 1, borderColor: '#ddd', alignItems: 'center' },
  header: { backgroundColor: '#f3f4f6', borderBottomWidth: 1, borderColor: '#ccc' },
  col: {
    paddingHorizontal: 4,
    fontSize: 14,
    color: '#111827',
  },
  lowStock: { backgroundColor: '#fee2e2' },
});