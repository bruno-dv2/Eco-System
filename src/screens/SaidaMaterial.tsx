import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Material, MovimentacaoSaida, SaldoMaterial } from '../types';
import { materialService } from '../services/material';
import { estoqueService } from '../services/estoque';
import MovimentacaoFormRN from '../components/MovimentacaoFormRN'; 

const SaidaMaterial: React.FC = () => {
  const [materiais, setMateriais] = useState<Material[]>([]);
  const [saldos, setSaldos] = useState<SaldoMaterial[]>([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState('');
  const [sucesso, setSucesso] = useState(false);

  useEffect(() => {
    carregarDados();
  }, []);

  const carregarDados = async () => {
    try {
      const [materiaisData, saldosData] = await Promise.all([
        materialService.listar(),
        estoqueService.consultarSaldo(),
      ]);

      const materiaisComSaldo = materiaisData.filter(material =>
        saldosData.some(s => s.material === material.nome && s.quantidade > 0)
      );

      setMateriais(materiaisComSaldo);
      setSaldos(saldosData);
    } catch {
      setErro('Falha ao carregar dados');
    } finally {
      setLoading(false);
    }
  };

  const getSaldoMaterial = (id: number) => {
    const material = materiais.find(m => m.id === id);
    if (!material) return null;
    return saldos.find(s => s.material === material.nome);
  };

  const handleSubmit = async (movimentacoes: MovimentacaoSaida[]) => {
    try {
      for (const mov of movimentacoes) {
        const saldoAtual = getSaldoMaterial(mov.materialId);
        if (!saldoAtual || saldoAtual.quantidade < mov.quantidade) {
          setErro('Quantidade insuficiente em estoque para uma ou mais saídas');
          return;
        }
      }

      await estoqueService.registrarSaida(movimentacoes);
      setSucesso(true);
      setTimeout(() => setSucesso(false), 2000);
      setErro('');
      carregarDados(); // atualiza os saldos após registrar saídas
    } catch {
      setErro('Falha ao registrar saídas');
    }
  };

  const handleCancel = () => {
    setErro('');
    setSucesso(false);
    // Aqui você pode adicionar qualquer lógica extra de cancelamento se precisar
  };

  if (loading) {
    return <Text style={styles.loading}>Carregando...</Text>;
  }

  if (materiais.length === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.card}>
          <Text style={styles.title}>Registrar Saída de Material</Text>
          <View style={styles.warningBox}>
            <Text style={styles.warningText}>
              Não há materiais com saldo disponível para saída.
            </Text>
          </View>
        </View>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Registrar Saída de Material</Text>

      {erro ? <Text style={styles.erro}>{erro}</Text> : null}
      {sucesso ? <Text style={styles.sucesso}>Saídas registradas com sucesso!</Text> : null}

      <MovimentacaoFormRN
        materiais={materiais}
        tipo="saida"
        onSubmit={handleSubmit}
        onCancel={handleCancel}
      />
    </ScrollView>
  );
};

export default SaidaMaterial;

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#EFF6FF',
    flexGrow: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  loading: {
    textAlign: 'center',
    marginTop: 20,
    fontSize: 16,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 10,
    marginBottom: 16,
  },
  warningBox: {
    backgroundColor: '#FEF3C7',
    padding: 12,
    borderRadius: 8,
    marginTop: 12,
  },
  warningText: {
    color: '#B45309',
    fontSize: 14,
  },
  erro: {
    color: '#B91C1C',
    marginBottom: 8,
    textAlign: 'center',
  },
  sucesso: {
    color: '#047857',
    marginBottom: 8,
    textAlign: 'center',
  },
});
