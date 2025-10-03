import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, Button, ScrollView, TouchableOpacity } from 'react-native';

const AlterarSenha: React.FC = () => {
  const [novaSenha, setNovaSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [erro, setErro] = useState('');
  const [sucesso, setSucesso] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleAlterarSenha = async () => {
    setErro('');
    setSucesso(false);

    if (!novaSenha || !confirmarSenha) {
      setErro('Preencha todos os campos.');
      return;
    }
    if (novaSenha !== confirmarSenha) {
      setErro('As senhas não coincidem.');
      return;
    }
    setLoading(true);
    try {
      // Simulação de chamada de API
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setSucesso(true);
      setNovaSenha('');
      setConfirmarSenha('');
      setTimeout(() => setSucesso(false), 2000);
    } catch {
      setErro('Falha ao alterar senha.');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setErro('');
    setSucesso(false);
    setNovaSenha('');
    setConfirmarSenha('');
  };

  if (loading) {
    return <Text style={styles.loading}>Carregando...</Text>;
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Alterar Senha</Text>

      {erro ? (
        <View style={styles.errorBox}>
          <Text style={styles.errorText}>{erro}</Text>
        </View>
      ) : null}
      {sucesso ? <Text style={styles.sucesso}>Senha alterada com sucesso!</Text> : null}

      <View style={styles.card}>
        <Text style={styles.label}>Nova Senha</Text>
        <TextInput
          style={styles.input}
          secureTextEntry
          value={novaSenha}
          onChangeText={setNovaSenha}
          placeholder="Digite a nova senha"
        />

        <Text style={styles.label}>Confirmar Nova Senha</Text>
        <TextInput
          style={styles.input}
          secureTextEntry
          value={confirmarSenha}
          onChangeText={setConfirmarSenha}
          placeholder="Confirme a nova senha"
        />

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.actionButton, { marginRight: 4 }]}
            onPress={handleAlterarSenha}
            activeOpacity={0.8}
          >
            <Text style={styles.actionText}>Alterar Senha</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionButton, styles.cancelButton, { marginLeft: 4 }]}
            onPress={handleCancel}
            activeOpacity={0.8}
          >
            <Text style={[styles.actionText, styles.cancelText]}>Cancelar</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
};

export default AlterarSenha;

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
    textAlign: 'left',
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
  label: {
    fontSize: 16,
    marginBottom: 4,
    marginTop: 12,
    fontWeight: '500',
  },
  input: {
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 8,
    padding: 10,
    marginBottom: 4,
    backgroundColor: '#F9FAFB',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
    borderRadius: 8,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#2563EB',
    borderRadius: 999, // Borda bem curva
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  actionText: {
    color: '#2563EB',
    fontWeight: '500',
    fontSize: 16,
  },
  cancelButton: {
    borderColor: '#6B7280',
    backgroundColor: '#fff',
  },
  cancelText: {
    color: '#6B7280',
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
  errorBox: {
    backgroundColor: '#FEE2E2',
    borderColor: '#FCA5A5',
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
    marginBottom: 8,
  },
  errorText: {
    color: '#B91C1C',
    fontSize: 14,
    textAlign: 'center',
  },
});