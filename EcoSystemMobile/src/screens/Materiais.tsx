import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, ActivityIndicator, TouchableOpacity, TextInput, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';

type Material = {
  id: number;
  descricao: string;
  unidade: string;
};

export default function Materiais() {
  const [materiais, setMateriais] = useState<Material[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [search, setSearch] = useState<string>('');

  useEffect(() => {
    carregarMateriais();
  }, []);

  const carregarMateriais = async () => {
    try {
      const dados: Material[] = [
        { id: 1, descricao: 'Ferro', unidade: 'Kg' },
        { id: 2, descricao: 'Cobre', unidade: 'Kg' },
        { id: 3, descricao: 'Aço', unidade: 'Kg' },
      ];
      setMateriais(dados);
    } catch (error) {
      console.log('Erro ao carregar materiais:', error);
    } finally {
      setLoading(false);
    }
  };

  const materiaisFiltrados = materiais.filter((mat) =>
    mat.descricao.toLowerCase().includes(search.toLowerCase())
  );

  const renderItem = ({ item }: { item: Material }) => (
    <View style={styles.item}>
      <Text style={styles.descricao}>{item.descricao}</Text>
      <Text style={styles.unidade}>{item.unidade}</Text>
      <View style={styles.botoes}>
        <TouchableOpacity style={styles.botaoIcon}>
          <Feather name="edit" size={20} color="#000" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.botaoIcon}>
          <Feather name="trash-2" size={20} color="#000" />
        </TouchableOpacity>
      </View>
    </View>
  );

  if (loading) {
    return <ActivityIndicator size="large" color="#000" style={{ flex: 1 }} />;
  }

  return (
    <View style={styles.container}>

      {/* Barra de pesquisa com ícone */}
      <View style={styles.barraPesquisa}>
        <Feather name="search" size={20} color="#000" style={{ marginRight: 8 }} />
        <TextInput
          style={styles.input}
          placeholder="Pesquisar"
          value={search}
          onChangeText={setSearch}
        />
      </View>

      <View style={styles.cabecalho}>
        <Text style={styles.colDescricao}>Descrição</Text>
        <Text style={styles.colUnidade}>Unidade</Text>
        <Text style={styles.colAcao}>Ação</Text>
      </View>

      <FlatList
        data={materiaisFiltrados}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderItem}
      />

      {/* Botão Novo Material */}
      <TouchableOpacity style={styles.novoMaterial}>
        <View style={styles.circulo}>
          <Text style={styles.plus}>+</Text>
        </View>
        <Text style={styles.textoBotao}>Novo Material</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#FFFFFF',
  },
  barraPesquisa: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#292626ff',
    borderRadius: 2,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginBottom: 16,
  },
  input: {
    flex: 1,
    height: 40,
  },
  novoMaterial: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ffffff',
    padding: 10,
    borderRadius: 8,
    marginTop: 16,
  },
  circulo: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#000',
  },
  plus: {
    color: '#2b32a0ff',
    fontWeight: 'bold',
    fontSize: 18,
    lineHeight: 24,
    textAlign: 'center',
  },
  textoBotao: {
    color: '#48479aff',
    fontSize: 17,
  },
  cabecalho: {
    flexDirection: 'row',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderColor: '#ccc',
  },
  colDescricao: {
    flex: 2,
    fontWeight: 'bold',
  },
  colUnidade: {
    flex: 1,
    fontWeight: 'bold',
  },
  colAcao: {
    flex: 1,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  item: {
    flexDirection: 'row',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderColor: '#eee',
    alignItems: 'center',
  },
  descricao: {
    flex: 2,
  },
  unidade: {
    flex: 1,
  },
  botoes: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  botaoIcon: {
    padding: 6,
    borderRadius: 4,
  },
});
