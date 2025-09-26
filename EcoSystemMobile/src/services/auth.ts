import api from './api';
import { AuthResponse } from '../types';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const authService = {
  async login(email: string, senha: string): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>('/auth/login', { email, senha });
    await AsyncStorage.setItem('token', response.data.token);
    return response.data;
  },

  async registro(nome: string, email: string, senha: string): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>('/auth/registro', { 
      nome, 
      email, 
      senha 
    });
    await AsyncStorage.setItem('token', response.data.token);
    return response.data;
  },

  async logout() {
    await AsyncStorage.removeItem('token');
  }
};

export default authService;
