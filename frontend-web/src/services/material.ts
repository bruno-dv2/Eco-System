import api from './api';
import { Material } from '../types';

export const materialService = {
  async listar() {
    const response = await api.get<Material[]>('/materiais');
    return response.data;
  },

  async criar(material: Omit<Material, 'id'>) {
    const response = await api.post<Material>('/materiais', material);
    return response.data;
  },

  async atualizar(id: number, material: Omit<Material, 'id'>) {
    const response = await api.put<Material>(`/materiais/${id}`, material);
    return response.data;
  },

  async excluir(id: number) {
    await api.delete(`/materiais/${id}`);
  }
};

export default materialService;