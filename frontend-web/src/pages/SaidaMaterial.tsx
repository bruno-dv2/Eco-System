import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Material, MovimentacaoSaida, SaldoMaterial } from '../types';
import { materialService } from '../services/material';
import { estoqueService } from '../services/estoque';
import MovimentacaoForm from '../components/MovimentacaoForm';

const SaidaMaterial: React.FC = () => {
  const [materiais, setMateriais] = useState<Material[]>([]);
  const [saldos, setSaldos] = useState<SaldoMaterial[]>([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState('');
  const [sucesso, setSucesso] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    carregarDados();
  }, []);

  const carregarDados = async () => {
    try {
      const [materiaisData, saldosData] = await Promise.all([
        materialService.listar(),
        estoqueService.consultarSaldo()
      ]);
      
      const materiaisComSaldo = materiaisData.filter(material => 
        saldosData.some(saldo => 
          saldo.material === material.nome && saldo.quantidade > 0
        )
      );
      
      setMateriais(materiaisComSaldo);
      setSaldos(saldosData);
    } catch {
      setErro('Falha ao carregar dados');
    } finally {
      setLoading(false);
    }
  };

  const getSaldoMaterial = (id: number) => {
    const material = materiais.find(m => m.id === id);
    if (!material) return null;
    return saldos.find(s => s.material === material.nome);
  };

  const handleSubmit = async (movimentacoes: MovimentacaoSaida[]) => {
    try {
      for (const movimentacao of movimentacoes) {
        const saldoAtual = getSaldoMaterial(movimentacao.materialId);
        if (!saldoAtual || saldoAtual.quantidade < movimentacao.quantidade) {
          setErro('Quantidade insuficiente em estoque para uma ou mais saídas');
          return;
        }
      }

      await estoqueService.registrarSaida(movimentacoes);
      setSucesso(true);
      setTimeout(() => {
        navigate('/estoque');
      }, 2000);
    } catch {
      setErro('Falha ao registrar saídas');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg font-medium text-gray-700">Carregando...</div>
      </div>
    );
  }

  if (materiais.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Registrar Saída de Material</h1>
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-yellow-700">
                  Não há materiais com saldo disponível para saída.
                </p>
              </div>
            </div>
          </div>
          <div className="mt-4">
            <button
              onClick={() => navigate('/estoque')}
              className="btn-secondary"
            >
              Voltar para Estoque
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="bg-gradient-to-r from-red-600 to-red-700 px-6 py-4">
          <h1 className="text-2xl font-bold text-white">Registrar Saída de Material</h1>
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
                  <p className="text-sm text-green-700">Saídas registradas com sucesso!</p>
                </div>
              </div>
            </div>
          )}

          <MovimentacaoForm
            materiais={materiais}
            tipo="saida"
            onSubmit={handleSubmit}
            onCancel={() => navigate('/estoque')}
          />
        </div>
      </div>
    </div>
  );
};

export default SaidaMaterial;