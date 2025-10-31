import api from "./api";
import { Material } from "../types";

/**
 * Serviço de Materiais
 * Responsável pelas operações de CRUD na API de materiais.
 */
export const materialService = {
  /**
   * Lista todos os materiais.
   * Retorna um array de Material[].
   */
  async listar(): Promise<Material[]> {
    const response = await api.get<Material[]>("/materiais");

    // ✅ Garante que sempre será um array
    const data = response.data;
    return Array.isArray(data) ? data : [];
  },

  /**
   * Cria um novo material.
   * @param material - objeto contendo nome, descrição e unidade.
   * Retorna o material criado com ID.
   */
  async criar(material: Omit<Material, "id">): Promise<Material> {
    const response = await api.post<Material>("/materiais", material);
    return response.data;
  },

  /**
   * Atualiza um material existente.
   * @param id - ID do material a ser atualizado
   * @param material - campos a atualizar
   * Retorna o material atualizado.
   */
  async atualizar(id: number, material: Omit<Material, "id">): Promise<Material> {
    const response = await api.put<Material>(`/materiais/${id}`, material);
    return response.data;
  },

  /**
   * Exclui um material pelo ID.
   * @param id - ID do material a ser excluído.
   * Retorna void.
   */
  async excluir(id: number): Promise<void> {
    await api.delete(`/materiais/${id}`);
  },
};

export default materialService;
