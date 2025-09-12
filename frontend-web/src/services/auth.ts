import api from './api';
import { AuthResponse } from '../types';

export const authService = {
  async login(email: string, senha: string): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>('/auth/login', { email, senha });
    localStorage.setItem('token', response.data.token);
    return response.data;
  },

  async registro(nome: string, email: string, senha: string): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>('/auth/registro', { 
      nome, 
      email, 
      senha 
    });
    localStorage.setItem('token', response.data.token);
    return response.data;
  },

  logout() {
    localStorage.removeItem('token');
  }
};

export default authService;