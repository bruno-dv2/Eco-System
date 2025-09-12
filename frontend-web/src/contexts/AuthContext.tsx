import React, { createContext, useContext, useState, useEffect } from 'react';
import { Usuario } from '../types';
import authService from '../services/auth';
import api from '../services/api';

interface AuthContextData {
  usuario: Usuario | null;
  loading: boolean;
  login: (email: string, senha: string) => Promise<void>;
  registro: (nome: string, email: string, senha: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const usuarioSalvo = localStorage.getItem('usuario');

    if (token && usuarioSalvo) {
      setUsuario(JSON.parse(usuarioSalvo));
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }

    setLoading(false);
  }, []);

  const validarSenha = (senha: string): boolean => {
    return senha.length >= 8;
  };

  const login = async (email: string, senha: string) => {
    if (!validarSenha(senha)) {
      throw new Error('A senha deve ter no mínimo 8 caracteres');
    }

    const response = await authService.login(email, senha);
    setUsuario(response.usuario);
    localStorage.setItem('usuario', JSON.stringify(response.usuario));
    api.defaults.headers.common['Authorization'] = `Bearer ${response.token}`;
  };

  const registro = async (nome: string, email: string, senha: string) => {
    if (!validarSenha(senha)) {
      throw new Error('A senha deve ter no mínimo 8 caracteres');
    }

    const response = await authService.registro(nome, email, senha);
    setUsuario(response.usuario);
    localStorage.setItem('usuario', JSON.stringify(response.usuario));
    api.defaults.headers.common['Authorization'] = `Bearer ${response.token}`;
  };

  const logout = () => {
    authService.logout();
    setUsuario(null);
    localStorage.removeItem('usuario');
    delete api.defaults.headers.common['Authorization'];
  };

  return (
    <AuthContext.Provider value={{ usuario, loading, login, registro, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
};