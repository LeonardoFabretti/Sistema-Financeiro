import React, { useState } from 'react';
import { useFinance } from '../contexts/FinanceContext';
import { PiggyBank, Plus, Edit, Trash2, TrendingUp, TrendingDown, Percent } from 'lucide-react';
import { formatarMoeda } from '../utils/helpers';

const Caixinhas: React.FC = () => {
  const { mesAtual, adicionarCaixinha, atualizarCaixinha, removerCaixinha } = useFinance();
  const [mostrarForm, setMostrarForm] = useState(false);
  const [editando, setEditando] = useState<string | null>(null);
  const [nome, setNome] = useState('');
  const [cor, setCor] = useState('#3b82f6');
  const [percentual, setPercentual] = useState('10');
  
  const cores = [
    '#ef4444', '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6', 
    '#ec4899', '#06b6d4', '#84cc16', '#f97316', '#6366f1'
  ];
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!nome || !percentual) {
      alert('Por favor, preencha todos os campos');
      return;
    }
    
    if (editando) {
      atualizarCaixinha(editando, {
        nome,
        cor,
        percentualPadrao: parseFloat(percentual)
      });
      setEditando(null);
    } else {
      adicionarCaixinha({
        nome,
        cor,
        percentualPadrao: parseFloat(percentual)
      });
    }
    
    // Limpar formulário
    setNome('');
    setCor('#3b82f6');
    setPercentual('10');
    setMostrarForm(false);
    
    alert(editando ? 'Caixinha atualizada!' : 'Caixinha criada com sucesso!');
  };
  
  const handleEditar = (caixinha: typeof mesAtual.caixinhas[0]) => {
    setEditando(caixinha.id);
    setNome(caixinha.nome);
    setCor(caixinha.cor);
    setPercentual(caixinha.percentualPadrao.toString());
    setMostrarForm(true);
  };
  
  const handleRemover = (id: string) => {
    if (confirm('Tem certeza que deseja remover esta caixinha? Todos os gastos relacionados serão removidos.')) {
      removerCaixinha(id);
    }
  };
  
  const totalSaldos = mesAtual.caixinhas.reduce((acc, c) => acc + c.saldo, 0);
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Minhas Caixinhas
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Total em caixinhas: <span className="font-semibold">{formatarMoeda(totalSaldos)}</span>
          </p>
        </div>
        
        <button
          onClick={() => {
            setMostrarForm(!mostrarForm);
            setEditando(null);
            setNome('');
            setCor('#3b82f6');
            setPercentual('10');
          }}
          className="flex items-center gap-2 bg-blue-500 text-white px-6 py-3 rounded-lg font-semibold shadow-lg hover:bg-blue-600 transition-all"
        >
          <Plus size={20} />
          Nova Caixinha
        </button>
      </div>
      
      {/* Formulário de Nova/Editar Caixinha */}
      {mostrarForm && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
            {editando ? 'Editar Caixinha' : 'Nova Caixinha'}
          </h3>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Nome da Caixinha
              </label>
              <input
                type="text"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                placeholder="Ex: Viagem, Investimentos, Lazer..."
                required
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Cor
                </label>
                <div className="grid grid-cols-5 gap-2">
                  {cores.map((corOpcao) => (
                    <button
                      key={corOpcao}
                      type="button"
                      onClick={() => setCor(corOpcao)}
                      className={`w-full h-12 rounded-lg transition-all ${
                        cor === corOpcao ? 'ring-4 ring-blue-500 scale-110' : ''
                      }`}
                      style={{ backgroundColor: corOpcao }}
                    />
                  ))}
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Percentual Padrão (%)
                </label>
                <div className="relative">
                  <Percent className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    type="number"
                    step="0.1"
                    value={percentual}
                    onChange={(e) => setPercentual(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    placeholder="10"
                    required
                  />
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Porcentagem automática da renda
                </p>
              </div>
            </div>
            
            <div className="flex gap-3">
              <button
                type="submit"
                className="flex-1 bg-blue-500 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-600 transition-all"
              >
                {editando ? 'Atualizar' : 'Criar'} Caixinha
              </button>
              <button
                type="button"
                onClick={() => {
                  setMostrarForm(false);
                  setEditando(null);
                }}
                className="px-6 py-3 border border-gray-300 dark:border-gray-600 rounded-lg font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all"
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}
      
      {/* Grid de Caixinhas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {mesAtual.caixinhas.map((caixinha) => {
          const totalEntradas = caixinha.historico
            .filter(h => h.tipo === 'entrada')
            .reduce((acc, h) => acc + h.valor, 0);
          const totalSaidas = caixinha.historico
            .filter(h => h.tipo === 'saida')
            .reduce((acc, h) => acc + h.valor, 0);
          
          return (
            <div
              key={caixinha.id}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden"
            >
              {/* Header da Caixinha */}
              <div 
                className="p-6 text-white"
                style={{ backgroundColor: caixinha.cor }}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <PiggyBank size={32} />
                    <div>
                      <h3 className="text-xl font-bold">{caixinha.nome}</h3>
                      <p className="text-sm opacity-90">{caixinha.percentualPadrao}% da renda</p>
                    </div>
                  </div>
                  
                  <div className="flex gap-1">
                    <button
                      onClick={() => handleEditar(caixinha)}
                      className="p-2 hover:bg-white hover:bg-opacity-20 rounded-lg transition-all"
                    >
                      <Edit size={18} />
                    </button>
                    <button
                      onClick={() => handleRemover(caixinha.id)}
                      className="p-2 hover:bg-white hover:bg-opacity-20 rounded-lg transition-all"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
                
                <div>
                  <p className="text-sm opacity-90">Saldo Atual</p>
                  <p className="text-3xl font-bold mt-1">
                    {formatarMoeda(caixinha.saldo)}
                  </p>
                </div>
              </div>
              
              {/* Corpo da Caixinha */}
              <div className="p-6">
                {/* Estatísticas */}
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="bg-green-50 dark:bg-green-900 dark:bg-opacity-20 rounded-lg p-3">
                    <div className="flex items-center gap-2 text-green-600 dark:text-green-400 mb-1">
                      <TrendingUp size={16} />
                      <span className="text-xs font-medium">Entradas</span>
                    </div>
                    <p className="text-lg font-bold text-green-700 dark:text-green-300">
                      {formatarMoeda(totalEntradas)}
                    </p>
                  </div>
                  
                  <div className="bg-red-50 dark:bg-red-900 dark:bg-opacity-20 rounded-lg p-3">
                    <div className="flex items-center gap-2 text-red-600 dark:text-red-400 mb-1">
                      <TrendingDown size={16} />
                      <span className="text-xs font-medium">Saídas</span>
                    </div>
                    <p className="text-lg font-bold text-red-700 dark:text-red-300">
                      {formatarMoeda(totalSaidas)}
                    </p>
                  </div>
                </div>
                
                {/* Histórico Recente */}
                <div>
                  <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Últimas Movimentações
                  </h4>
                  {caixinha.historico.length > 0 ? (
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {caixinha.historico.slice(-5).reverse().map((mov) => (
                        <div 
                          key={mov.id}
                          className="flex items-center justify-between text-sm p-2 bg-gray-50 dark:bg-gray-700 rounded"
                        >
                          <div className="flex items-center gap-2 flex-1 min-w-0">
                            {mov.tipo === 'entrada' ? (
                              <TrendingUp size={14} className="text-green-600 flex-shrink-0" />
                            ) : (
                              <TrendingDown size={14} className="text-red-600 flex-shrink-0" />
                            )}
                            <span className="text-gray-700 dark:text-gray-300 truncate">
                              {mov.descricao}
                            </span>
                          </div>
                          <span className={`font-semibold flex-shrink-0 ml-2 ${
                            mov.tipo === 'entrada' 
                              ? 'text-green-600 dark:text-green-400' 
                              : 'text-red-600 dark:text-red-400'
                          }`}>
                            {mov.tipo === 'entrada' ? '+' : '-'}{formatarMoeda(mov.valor)}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-gray-500 dark:text-gray-400 text-center py-4">
                      Nenhuma movimentação ainda
                    </p>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
      
      {mesAtual.caixinhas.length === 0 && (
        <div className="text-center py-12">
          <PiggyBank size={64} className="mx-auto text-gray-400 mb-4" />
          <p className="text-gray-500 dark:text-gray-400">
            Nenhuma caixinha criada ainda
          </p>
        </div>
      )}
    </div>
  );
};

export default Caixinhas;
