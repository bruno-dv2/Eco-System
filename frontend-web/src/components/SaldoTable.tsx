import React from 'react';
import { SaldoMaterial } from '../types';
import { formatCurrency, formatQuantity } from '../utils/currency';

interface SaldoTableProps {
  saldos: SaldoMaterial[];
}

const SaldoTable: React.FC<SaldoTableProps> = ({ saldos }) => {
  return (
    <div className="bg-white shadow-md rounded my-6">
      <table className="min-w-full">
        <thead>
          <tr className="bg-gray-200 text-gray-700 uppercase text-sm">
            <th className="py-3 px-6 text-left">Material</th>
            <th className="py-3 px-6 text-right">Quantidade</th>
            <th className="py-3 px-6 text-left">Unidade</th>
            <th className="py-3 px-6 text-right">Preço Médio</th>
            <th className="py-3 px-6 text-right">Valor Total</th>
          </tr>
        </thead>
        <tbody className="text-gray-600">
          {saldos.map((saldo, index) => (
            <tr key={index} className="border-b border-gray-200 hover:bg-gray-50">
              <td className="py-4 px-6">{saldo.material}</td>
              <td className="py-4 px-6 text-right">
                {formatQuantity(saldo.quantidade)}
              </td>
              <td className="py-4 px-6">{saldo.unidade}</td>
              <td className="py-4 px-6 text-right">
                {formatCurrency(saldo.precoMedio)}
              </td>
              <td className="py-4 px-6 text-right">
                {formatCurrency(saldo.quantidade * saldo.precoMedio)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default SaldoTable;