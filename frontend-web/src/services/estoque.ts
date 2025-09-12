import api from './api';
import { MovimentacaoEntrada, MovimentacaoSaida, SaldoMaterial } from '../types';

export const estoqueService = {
  async registrarEntrada(entradas: MovimentacaoEntrada[]) {
    const response = await api.post<{ mensagem: string }>('/estoque/entrada', entradas);
    return response.data;
  },

  async registrarSaida(saidas: MovimentacaoSaida[]) {
    const response = await api.post<{ mensagem: string }>('/estoque/saida', saidas);
    return response.data;
  },

  async consultarSaldo() {
    const response = await api.get<SaldoMaterial[]>('/estoque/saldo');
    return response.data;
  }
};

export default estoqueService;