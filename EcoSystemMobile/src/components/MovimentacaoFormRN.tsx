import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Alert, StyleSheet } from 'react-native';
import { Material } from '../types';
import { normalizeInput, isValidNumber } from '../utils/currency';

interface Movimentacao {
  materialId: number;
  quantidade: string;
  preco?: string;
}

interface MovimentacaoFormRNProps {
  materiais: Material[];
  tipo: 'entrada' | 'saida';
  onSubmit: (movimentacoes: { materialId: number; quantidade: number; preco?: number }[]) => Promise<void>;
  onCancel: () => void;
}

const MovimentacaoFormRN: React.FC<MovimentacaoFormRNProps> = ({
  materiais,
  tipo,
  onSubmit,
  onCancel
}) => {
  const [movimentacoes, setMovimentacoes] = useState<Movimentacao[]>([
    { materialId: 0, quantidade: '', preco: tipo === 'entrada' ? '' : undefined }
  ]);
  const [erro, setErro] = useState('');

  const handleAddMovimentacao = () => {
    setMovimentacoes([
      ...movimentacoes,
      { materialId: 0, quantidade: '', preco: tipo === 'entrada' ? '' : undefined }
    ]);
  };

  const handleRemoveMovimentacao = (index: number) => {
    if (movimentacoes.length > 1) {
      setMovimentacoes(movimentacoes.filter((_, i) => i !== index));
    }
  };

  const handleMovimentacaoChange = (index: number, field: keyof Movimentacao, value: string) => {
    const novasMovimentacoes = [...movimentacoes];
    novasMovimentacoes[index] = {
      ...novasMovimentacoes[index],
      [field]: field === 'materialId' ? Number(value) : value
    };
    setMovimentacoes(novasMovimentacoes);
  };

  const handleSubmit = async () => {
    setErro('');

    if (movimentacoes.some(m => m.materialId === 0)) {
      setErro('Selecione um material para todas as movimentações');
      return;
    }

    const movimentacoesNormalizadas = movimentacoes.map(m => ({
      ...m,
      quantidade: normalizeInput(m.quantidade),
      preco: m.preco ? normalizeInput(m.preco) : undefined
    }));

    if (movimentacoesNormalizadas.some(m => !m.quantidade || Number(m.quantidade) <= 0)) {
      setErro('Todas as quantidades devem ser maiores que zero');
      return;
    }

    if (tipo === 'entrada' && movimentacoesNormalizadas.some(m => !m.preco || Number(m.preco) <= 0)) {
      setErro('Todos os preços devem ser maiores que zero');
      return;
    }

    try {
      const movimentacoesNumeros = movimentacoesNormalizadas.map(m => ({
        materialId: m.materialId,
        quantidade: Number(m.quantidade),
        ...(tipo === 'entrada' ? { preco: Number(m.preco) } : {})
      }));

      await onSubmit(movimentacoesNumeros);
    } catch (error) {
      setErro(`Erro ao registrar movimentação: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    }
  };

  return (
    <ScrollView style={styles.container}>
      {erro ? (
        <View style={styles.erroContainer}>
          <Text style={styles.erroText}>{erro}</Text>
        </View>
      ) : null}

      {movimentacoes.map((movimentacao, index) => (
        <View key={index} style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Movimentação {index + 1}</Text>
            {movimentacoes.length > 1 && (
              <TouchableOpacity onPress={() => handleRemoveMovimentacao(index)}>
                <Text style={styles.removeText}>Remover</Text>
              </TouchableOpacity>
            )}
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Material</Text>
            <View style={styles.pickerContainer}>
              {materiais.map(material => (
                <TouchableOpacity
                  key={material.id}
                  style={[
                    styles.pickerItem,
                    movimentacao.materialId === material.id && styles.pickerItemSelected
                  ]}
                  onPress={() => handleMovimentacaoChange(index, 'materialId', String(material.id))}
                >
                  <Text>{material.nome} ({material.unidade})</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Quantidade</Text>
            <TextInput
              style={styles.input}
              value={movimentacao.quantidade}
              keyboardType="decimal-pad"
              onChangeText={(text) => handleMovimentacaoChange(index, 'quantidade', text)}
            />
          </View>

          {tipo === 'entrada' && (
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Preço Unitário (R$)</Text>
              <TextInput
                style={styles.input}
                value={movimentacao.preco}
                keyboardType="decimal-pad"
                onChangeText={(text) => handleMovimentacaoChange(index, 'preco', text)}
              />
            </View>
          )}
        </View>
      ))}

      <TouchableOpacity style={styles.addButton} onPress={handleAddMovimentacao}>
        <Text style={styles.addButtonText}>+ Adicionar movimentação</Text>
      </TouchableOpacity>

      <View style={styles.buttonsContainer}>
        <TouchableOpacity style={styles.cancelButton} onPress={onCancel}>
          <Text style={styles.buttonText}>Cancelar</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
          <Text style={styles.buttonText}>{tipo === 'entrada' ? 'Registrar Entradas' : 'Registrar Saídas'}</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { padding: 16 },
  card: { backgroundColor: '#f9fafb', padding: 16, borderRadius: 8, marginBottom: 12 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  cardTitle: { fontWeight: 'bold', fontSize: 16 },
  removeText: { color: 'red', fontWeight: 'bold' },
  inputGroup: { marginBottom: 12 },
  label: { marginBottom: 4, fontWeight: '600' },
  input: { borderWidth: 1, borderColor: '#ccc', borderRadius: 4, padding: 8 },
  pickerContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  pickerItem: { padding: 8, borderWidth: 1, borderColor: '#ccc', borderRadius: 4, marginBottom: 4 },
  pickerItemSelected: { backgroundColor: '#d1fae5', borderColor: '#10b981' },
  addButton: { marginVertical: 12, alignItems: 'center' },
  addButtonText: { color: '#2563eb', fontWeight: '600' },
  buttonsContainer: { flexDirection: 'row', justifyContent: 'flex-end', marginTop: 16 },
  cancelButton: { backgroundColor: '#f3f4f6', paddingVertical: 10, paddingHorizontal: 16, borderRadius: 4, marginRight: 8 },
  submitButton: { backgroundColor: '#2563eb', paddingVertical: 10, paddingHorizontal: 16, borderRadius: 4 },
  buttonText: { color: 'white', fontWeight: '600' },
  erroContainer: { backgroundColor: '#fee2e2', padding: 12, borderRadius: 4, marginBottom: 12 },
  erroText: { color: '#b91c1c' }
});

export default MovimentacaoFormRN;
