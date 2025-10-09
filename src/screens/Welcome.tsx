import React, { useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import { RootStackParamList } from '../../App';

type WelcomeScreenProp = NativeStackNavigationProp<RootStackParamList, 'Welcome'>;

const WelcomeScreen: React.FC = () => {
  const { usuario } = useAuth();
  const navigation = useNavigation<WelcomeScreenProp>();

  useEffect(() => {
    if (usuario) {
      navigation.replace('Dashboard');
    }
  }, [usuario]);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.main}>
        <Text style={styles.logo}>EcoSystem</Text>
        <Text style={styles.subtitle}>Sistema de reciclagem</Text>

        <Text style={styles.title}>
          Gerencie o estoque da{"\n"}
          <Text style={styles.titleHighlight}>sua empresa</Text>
        </Text>

        <Text style={styles.description}>
          Controle entradas, saídas e saldo de materiais recicláveis de forma simples e eficiente.
          Organize seus materiais e acompanhe o histórico de movimentações.
        </Text>

        <View style={styles.buttonsContainer}>
          <TouchableOpacity style={styles.primaryBtn} onPress={() => navigation.navigate('Login')}>
            <Text style={styles.primaryText}>Começar agora</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.secondaryBtn} onPress={() => navigation.navigate('Registro')}>
            <Text style={styles.secondaryText}>Criar conta</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
};

export default WelcomeScreen;

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F4F9FF',
    paddingHorizontal: 20,
    paddingVertical: 40,
  },
  main: {
    alignItems: 'center',
  },
  logo: {
    fontSize: 52,
    fontWeight: 'bold',
    color: '#0011D2',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 16,
    color: '#0011D2',
    marginBottom: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
  },
  titleHighlight: {
    color: '#2563EB',
  },
  description: {
    textAlign: 'center',
    color: '#6B7280',
    fontSize: 16,
    marginBottom: 30,
    lineHeight: 22,
  },
  buttonsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  primaryBtn: {
    backgroundColor: '#2563EB',
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 8,
    marginRight: 10,
  },
  primaryText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  secondaryBtn: {
    borderColor: '#2563EB',
    borderWidth: 1,
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 8,
  },
  secondaryText: {
    color: '#2563EB',
    fontWeight: 'bold',
  },
});
