import React, { useState } from 'react';
import { useFinance } from '../contexts/FinanceContext';
import { DollarSign, Calendar, RepeatIcon, ToggleLeft, ToggleRight } from 'lucide-react';
import { formatarMoeda } from '../utils/helpers';

const RendaForm: React.FC = () => {
  const { adicionarRenda, mesAtual, dados } = useFinance();
  const [valor, setValor] = useState('');
  const [descricao, setDescricao] = useState('');
  const [data, setData] = useState(new Date().toISOString().split('T')[0]);
  const [frequencia, setFrequencia] = useState<'semanal' | 'mensal' | 'quinzenal' | 'unica'>('semanal');
  const [divisaoAutomatica, setDivisaoAutomatica] = useState(true);
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!valor || !descricao) {
      alert('Por favor, preencha todos os campos');
      return;
    }
    
    adicionarRenda({
      valor: parseFloat(valor),
      descricao,
      data,
      frequencia,
      divisaoAutomatica
    });
    
    // Limpar formulário
    setValor('');
    setDescricao('');
    setData(new Date().toISOString().split('T')[0]);
    
    alert('Renda adicionada com sucesso!');
  };
  
  return (
    <div className="space-y-6">
      {/* Formulário de Nova Renda */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
          Adicionar Renda
        </h2>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Valor */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Valor (R$)
              </label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="number"
                  step="0.01"
                  value={valor}
                  onChange={(e) => setValor(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  placeholder="300.00"
                  required
                />
              </div>
            </div>
            
            {/* Data */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Data
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="date"
                  value={data}
                  onChange={(e) => setData(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  required
                />
              </div>
            </div>
          </div>
          
          {/* Descrição */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Descrição
            </label>
            <input
              type="text"
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              placeholder="Ex: Mesada semanal, Freela, Salário..."
              required
            />
          </div>
          
          {/* Frequência */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Frequência
            </label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { valor: 'unica', label: 'Única' },
                { valor: 'semanal', label: 'Semanal' },
                { valor: 'quinzenal', label: 'Quinzenal' },
                { valor: 'mensal', label: 'Mensal' }
              ].map((freq) => (
                <button
                  key={freq.valor}
                  type="button"
                  onClick={() => setFrequencia(freq.valor as any)}
                  className={`
                    py-3 px-4 rounded-lg font-medium transition-all
                    ${frequencia === freq.valor
                      ? 'bg-blue-500 text-white shadow-lg'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                    }
                  `}
                >
                  {freq.label}
                </button>
              ))}
            </div>
          </div>
          
          {/* Divisão Automática */}
          <div className="bg-blue-50 dark:bg-blue-900 dark:bg-opacity-20 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <RepeatIcon size={20} className="text-blue-600 dark:text-blue-400" />
                <span className="font-medium text-gray-900 dark:text-white">
                  Divisão Automática
                </span>
              </div>
              <button
                type="button"
                onClick={() => setDivisaoAutomatica(!divisaoAutomatica)}
                className="focus:outline-none"
              >
                {divisaoAutomatica ? (
                  <ToggleRight size={32} className="text-blue-600" />
                ) : (
                  <ToggleLeft size={32} className="text-gray-400" />
                )}
              </button>
            </div>
            
            {divisaoAutomatica && (
              <div className="space-y-2">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  O valor será dividido automaticamente entre suas caixinhas:
                </p>
                {dados.configuracoes.divisaoAutomatica.map((config) => {
                  const caixinha = mesAtual.caixinhas.find(c => c.id === config.caixinhaId);
                  if (!caixinha) return null;
                  
                  const valorDivisao = valor ? (parseFloat(valor) * config.percentual) / 100 : 0;
                  
                  return (
                    <div key={config.caixinhaId} className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: caixinha.cor }}
                        />
                        <span className="text-gray-700 dark:text-gray-300">
                          {caixinha.nome}
                        </span>
                      </div>
                      <span className="font-semibold text-gray-900 dark:text-white">
                        {config.percentual}% ({formatarMoeda(valorDivisao)})
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
          
          {/* Botão Submit */}
          <button
            type="submit"
            className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white py-4 px-6 rounded-lg font-semibold text-lg shadow-lg hover:from-green-600 hover:to-green-700 transition-all transform hover:scale-105"
          >
            Adicionar Renda
          </button>
        </form>
      </div>
      
      {/* Lista de Rendas */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
          Rendas do Mês
        </h3>
        
        {mesAtual.rendas.length > 0 ? (
          <div className="space-y-3">
            {mesAtual.rendas.map((renda) => (
              <div 
                key={renda.id}
                className="flex items-center justify-between p-4 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-gray-700 dark:to-gray-600 rounded-lg"
              >
                <div>
                  <p className="font-semibold text-gray-900 dark:text-white">
                    {renda.descricao}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {new Date(renda.data).toLocaleDateString('pt-BR')} • {renda.frequencia}
                    {renda.divisaoAutomatica && ' • Divisão automática ativada'}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                    {formatarMoeda(renda.valor)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center text-gray-500 dark:text-gray-400 py-8">
            Nenhuma renda registrada ainda
          </p>
        )}
      </div>
    </div>
  );
};

export default RendaForm;
