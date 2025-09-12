import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Material } from '../types';
import { materialService } from '../services/material';
import { estoqueService } from '../services/estoque';
import MovimentacaoForm from '../components/MovimentacaoForm';

interface Movimentacao {
  materialId: number;
  quantidade: number;
  preco?: number;
}

const EntradaMaterial: React.FC = () => {
  const [materiais, setMateriais] = useState<Material[]>([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState('');
  const [sucesso, setSucesso] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    carregarMateriais();
  }, []);

  const carregarMateriais = async () => {
    try {
      const data = await materialService.listar();
      setMateriais(data);
    } catch {
      setErro('Falha ao carregar materiais');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (movimentacoes: Movimentacao[]) => {
    try {
      await estoqueService.registrarEntrada(
        movimentacoes.map(m => ({
          materialId: m.materialId,
          quantidade: m.quantidade,
          preco: m.preco || 0
        }))
      );
      setSucesso(true);
      setTimeout(() => {
        navigate('/estoque');
      }, 2000);
    } catch {
      setErro('Falha ao registrar entradas');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg font-medium text-gray-700">Carregando...</div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4">
          <h1 className="text-2xl font-bold text-white">Registrar Entrada de Material</h1>
        </div>

        <div className="p-6">
          {erro && (
            <div className="mb-4 bg-red-50 border-l-4 border-red-500 p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-red-700">{erro}</p>
                </div>
              </div>
            </div>
          )}

          {sucesso && (
            <div className="mb-4 bg-green-50 border-l-4 border-green-500 p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-green-700">Entradas registradas com sucesso!</p>
                </div>
              </div>
            </div>
          )}

          <MovimentacaoForm
            materiais={materiais}
            tipo="entrada"
            onSubmit={handleSubmit}
            onCancel={() => navigate('/estoque')}
          />
        </div>
      </div>
    </div>
  );
};

export default EntradaMaterial;