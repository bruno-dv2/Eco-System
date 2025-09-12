import React, { useState } from 'react';
import { Material } from '../types';
import { normalizeInput } from '../utils/currency';

interface Movimentacao {
  materialId: number;
  quantidade: string;
  preco?: string;
}

interface MovimentacaoFormProps {
  materiais: Material[];
  tipo: 'entrada' | 'saida';
  onSubmit: (movimentacoes: { materialId: number; quantidade: number; preco?: number }[]) => Promise<void>;
  onCancel: () => void;
}

const MovimentacaoForm: React.FC<MovimentacaoFormProps> = ({
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErro('');

    if (movimentacoes.some(m => m.materialId === 0)) {
      setErro('Por favor, selecione o material para todas as movimentações');
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
    <form onSubmit={handleSubmit} className="space-y-4">
      {erro && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {erro}
        </div>
      )}

      {movimentacoes.map((movimentacao, index) => (
        <div key={index} className="p-4 border rounded-lg bg-gray-50">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium">Movimentação {index + 1}</h3>
            {movimentacoes.length > 1 && (
              <button
                type="button"
                onClick={() => handleRemoveMovimentacao(index)}
                className="text-red-600 hover:text-red-800"
              >
                Remover
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            <div>
              <label htmlFor={`material-${index}`} className="form-label">
                Material
              </label>
              <select
                id={`material-${index}`}
                value={movimentacao.materialId}
                onChange={(e) => handleMovimentacaoChange(index, 'materialId', e.target.value)}
                className="input-field"
                required
              >
                <option value={0}>Selecione um material</option>
                {materiais.map((material) => (
                  <option key={material.id} value={material.id}>
                    {material.nome} ({material.unidade})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor={`quantidade-${index}`} className="form-label">
                Quantidade
              </label>
              <input
                type="text"
                id={`quantidade-${index}`}
                value={movimentacao.quantidade}
                onChange={(e) => handleMovimentacaoChange(index, 'quantidade', e.target.value)}
                placeholder=""
                inputMode="decimal"
                pattern="[0-9,\.]*"
                className="input-field"
                required
              />
            </div>

            {tipo === 'entrada' && (
              <div>
                <label htmlFor={`preco-${index}`} className="form-label">
                  Preço Unitário (R$)
                </label>
                <input
                  type="text"
                  id={`preco-${index}`}
                  value={movimentacao.preco}
                  onChange={(e) => handleMovimentacaoChange(index, 'preco', e.target.value)}
                  placeholder="0,00"
                  inputMode="decimal"
                  pattern="[0-9,\.]*"
                  className="input-field"
                  required
                />
              </div>
            )}
          </div>
        </div>
      ))}

      <div className="flex justify-center mt-4">
        <button
          type="button"
          onClick={handleAddMovimentacao}
          className="text-blue-600 hover:text-blue-800 font-medium"
        >
          + Adicionar mais uma movimentação
        </button>
      </div>

      <div className="flex justify-end space-x-4 mt-6">
        <button type="button" onClick={onCancel} className="btn-secondary">
          Cancelar
        </button>
        <button type="submit" className="btn-primary">
          {tipo === 'entrada' ? 'Registrar Entradas' : 'Registrar Saídas'}
        </button>
      </div>
    </form>
  );
};

export default MovimentacaoForm;