import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { estoqueService } from '../services/estoque';
import { SaldoMaterial } from '../types';
import { formatCurrency } from '../utils/currency';
import { useNavigation } from '@react-navigation/native';

const Estoque: React.FC = () => {
  const [saldos, setSaldos] = useState<SaldoMaterial[]>([]);
  const [filtro, setFiltro] = useState('');
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation<any>();

  useEffect(() => {
    const carregar = async () => {
      try {
        const data = await estoqueService.consultarSaldo();
        setSaldos(data);
      } catch (e) {
        console.log(e);
      } finally {
        setLoading(false);
      }
    };
    carregar();
  }, []);

  const valorTotal = saldos.reduce(
    (total, item) => total + item.quantidade * item.precoMedio,
    0
  );

  const materiaisFiltrados = saldos.filter(item =>
    item.material.toLowerCase().includes(filtro.toLowerCase())
  );

  const renderItem = ({ item }: { item: SaldoMaterial }) => (
    <View style={styles.row}>
      <View style={styles.cellMaterial}>
        <Text style={styles.materialNome}>{item.material}</Text>
        <Text style={styles.materialQtd}>{item.quantidade}</Text>
      </View>
      <Text style={styles.cell}>{formatCurrency(item.precoMedio)}</Text>
      <Text style={styles.cell}>
        {formatCurrency(item.quantidade * item.precoMedio)}
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Card Resumo */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Resumo do estoque</Text>
        <Text style={styles.cardValue}>Valor Total: {formatCurrency(valorTotal)}</Text>
      </View>

      {/* Campo pesquisa */}
      <View style={styles.searchBox}>
        <Feather name="search" size={18} color="#6B7280" />
        <TextInput
          style={styles.searchInput}
          placeholder="Pesquisar"
          value={filtro}
          onChangeText={setFiltro}
        />
      </View>

      {/* Cabeçalho tabela */}
      <View style={styles.tableHeader}>
        <TouchableOpacity style={styles.headerCell}>
          <Text style={styles.headerText}>Quant.</Text>
          <Feather name="arrow-up" size={14} color="#6B7280" />
          <Feather name="arrow-down" size={14} color="#6B7280" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.headerCell}>
          <Text style={styles.headerText}>Preço méd.</Text>
           <Feather name="arrow-up" size={14} color="#6B7280" />
          <Feather name="arrow-down" size={14} color="#6B7280" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.headerCell}>
          <Text style={styles.headerText}>Valor total</Text>
          <Feather name="arrow-up" size={14} color="#6B7280" />
          <Feather name="arrow-down" size={14} color="#6B7280" />
        </TouchableOpacity>
      </View>

      {/* Lista */}
      <FlatList
        data={materiaisFiltrados}
        keyExtractor={(item, index) => index.toString()}
        renderItem={renderItem}
        ListEmptyComponent={
          <Text style={styles.emptyText}>Nenhum material encontrado</Text>
        }
      />

      {/* Botões rodapé */}
      <View style={styles.footerButtons}>
        <TouchableOpacity
          style={styles.footerButton}
          onPress={() => navigation.navigate('EntradaMaterial')}
        >
          <Text style={styles.footerButtonText}>Nova entrada</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.footerButton}
          onPress={() => navigation.navigate('SaidaMaterial')}
        >
          <Text style={styles.footerButtonText}>Nova saída</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default Estoque;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff',
  },
  card: {
    backgroundColor: '#fff',
    padding: 16,
    marginBottom: 16,
    borderRadius: 8,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 4,
  },
  cardValue: {
    fontSize: 20,
    fontWeight: '600',
    color: '#111827',
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    paddingHorizontal: 8,
    marginBottom: 12,
    height: 40,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
  },
  tableHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  headerCell: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  headerText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#6B7280',
    marginRight: 4,
  },
  row: {
    flexDirection: 'row',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  cellMaterial: {
    flex: 2,
  },
  materialNome: {
    fontSize: 14,
    fontWeight: '500',
    color: '#111827',
  },
  materialQtd: {
    fontSize: 12,
    color: '#6B7280',
  },
  cell: {
    flex: 1,
    fontSize: 14,
    textAlign: 'right',
    color: '#111827',
  },
  emptyText: {
    textAlign: 'center',
    color: '#6B7280',
    marginTop: 16,
  },
  footerButtons: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    marginTop: 16,
  },
  footerButton: {
    borderWidth: 1,
    borderColor: '#6366F1',
    borderRadius: 999,
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  footerButtonText: {
    color: '#4F46E5',
    fontWeight: '500',
  },
});
