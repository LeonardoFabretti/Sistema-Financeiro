import React, { useState } from 'react';
import { useFinance } from '../contexts/FinanceContext';
import { ShoppingCart, Calendar, Tag, Trash2, Filter } from 'lucide-react';
import { formatarMoeda } from '../utils/helpers';

const GastosForm: React.FC = () => {
  const { adicionarGasto, removerGasto, mesAtual } = useFinance();
  const [valor, setValor] = useState('');
  const [categoria, setCategoria] = useState('');
  const [descricao, setDescricao] = useState('');
  const [data, setData] = useState(new Date().toISOString().split('T')[0]);
  const [filtroCategoria, setFiltroCategoria] = useState('todas');
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!valor || !categoria || !descricao) {
      alert('Por favor, preencha todos os campos');
      return;
    }
    
    const caixinha = mesAtual.caixinhas.find(c => c.id === categoria);
    if (!caixinha) {
      alert('Categoria inválida');
      return;
    }
    
    if (caixinha.saldo < parseFloat(valor)) {
      const confirmar = confirm(
        `O saldo da caixinha "${caixinha.nome}" (${formatarMoeda(caixinha.saldo)}) é menor que o gasto. Deseja continuar?`
      );
      if (!confirmar) return;
    }
    
    adicionarGasto({
      valor: parseFloat(valor),
      categoria,
      descricao,
      data
    });
    
    // Limpar formulário
    setValor('');
    setDescricao('');
    setData(new Date().toISOString().split('T')[0]);
    
    alert('Gasto registrado com sucesso!');
  };
  
  const handleRemover = (id: string) => {
    if (confirm('Tem certeza que deseja remover este gasto?')) {
      removerGasto(id);
    }
  };
  
  // Filtrar gastos
  const gastosFiltrados = filtroCategoria === 'todas'
    ? mesAtual.gastos
    : mesAtual.gastos.filter(g => g.categoria === filtroCategoria);
  
  // Agrupar gastos por dia
  const gastosAgrupados = gastosFiltrados.reduce((acc, gasto) => {
    const dataGasto = gasto.data;
    if (!acc[dataGasto]) {
      acc[dataGasto] = [];
    }
    acc[dataGasto].push(gasto);
    return acc;
  }, {} as Record<string, typeof gastosFiltrados>);
  
  // Ordenar datas (mais recente primeiro)
  const datasOrdenadas = Object.keys(gastosAgrupados).sort((a, b) => 
    new Date(b).getTime() - new Date(a).getTime()
  );
  
  // Calcular gastos do dia e do mês
  const hoje = new Date().toISOString().split('T')[0];
  const gastosHoje = mesAtual.gastos.filter(g => g.data === hoje);
  const totalHoje = gastosHoje.reduce((acc, g) => acc + g.valor, 0);
  const totalMes = mesAtual.gastos.reduce((acc, g) => acc + g.valor, 0);
  
  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Cards de Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4">
        <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg p-3 sm:p-4 text-white">
          <p className="text-orange-100 text-xs sm:text-sm">Gastos Hoje</p>
          <p className="text-xl sm:text-2xl font-bold mt-1">{formatarMoeda(totalHoje)}</p>
          <p className="text-xs text-orange-100 mt-1">{gastosHoje.length} registro(s)</p>
        </div>
        
        <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-lg p-3 sm:p-4 text-white">
          <p className="text-red-100 text-xs sm:text-sm">Gastos do Mês</p>
          <p className="text-xl sm:text-2xl font-bold mt-1">{formatarMoeda(totalMes)}</p>
          <p className="text-xs text-red-100 mt-1">{mesAtual.gastos.length} registro(s)</p>
        </div>
        
        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg p-3 sm:p-4 text-white">
          <p className="text-purple-100 text-xs sm:text-sm">Média Diária</p>
          <p className="text-xl sm:text-2xl font-bold mt-1">
            {formatarMoeda(totalMes / new Date().getDate())}
          </p>
          <p className="text-xs text-purple-100 mt-1">Nos últimos {new Date().getDate()} dias</p>
        </div>
      </div>
      
      {/* Formulário de Novo Gasto */}
      <div className="bg-white dark:bg-gray-800 rounded-lg sm:rounded-xl shadow-lg p-4 sm:p-6">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-4 sm:mb-6">
          Registrar Gasto
        </h2>
        
        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            {/* Valor */}
            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Valor (R$)
              </label>
              <div className="relative">
                <ShoppingCart className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="number"
                  step="0.01"
                  value={valor}
                  onChange={(e) => setValor(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 sm:py-3 text-sm sm:text-base border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 dark:bg-gray-700 dark:text-white"
                  placeholder="50.00"
                  required
                />
              </div>
            </div>
            
            {/* Data */}
            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Data
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="date"
                  value={data}
                  onChange={(e) => setData(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 sm:py-3 text-sm sm:text-base border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 dark:bg-gray-700 dark:text-white"
                  required
                />
              </div>
            </div>
          </div>
          
          {/* Categoria */}
          <div>
            <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Categoria (Caixinha)
            </label>
            <div className="relative">
              <Tag className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              <select
                value={categoria}
                onChange={(e) => setCategoria(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 sm:py-3 text-sm sm:text-base border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 dark:bg-gray-700 dark:text-white"
                required
              >
                <option value="">Selecione uma categoria</option>
                {mesAtual.caixinhas.map((caixinha) => (
                  <option key={caixinha.id} value={caixinha.id}>
                    {caixinha.nome} (Saldo: {formatarMoeda(caixinha.saldo)})
                  </option>
                ))}
              </select>
            </div>
          </div>
          
          {/* Descrição */}
          <div>
            <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Descrição
            </label>
            <input
              type="text"
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              className="w-full px-4 py-2.5 sm:py-3 text-sm sm:text-base border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 dark:bg-gray-700 dark:text-white"
              placeholder="Ex: Almoço, Uber, Compras no mercado..."
              required
            />
          </div>
          
          {/* Botão Submit */}
          <button
            type="submit"
            className="w-full bg-gradient-to-r from-red-500 to-red-600 text-white py-3 sm:py-4 px-6 rounded-lg font-semibold text-base sm:text-lg shadow-lg hover:from-red-600 hover:to-red-700 transition-all transform hover:scale-105"
          >
            Registrar Gasto
          </button>
        </form>
      </div>
      
      {/* Lista de Gastos */}
      <div className="bg-white dark:bg-gray-800 rounded-lg sm:rounded-xl shadow-lg p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0 mb-4 sm:mb-6">
          <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">
            Histórico de Gastos
          </h3>
          
          {/* Filtro */}
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Filter size={16} className="text-gray-400 flex-shrink-0" />
            <select
              value={filtroCategoria}
              onChange={(e) => setFiltroCategoria(e.target.value)}
              className="flex-1 sm:flex-initial px-2 sm:px-3 py-1.5 sm:py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white text-xs sm:text-sm"
            >
              <option value="todas">Todas as categorias</option>
              {mesAtual.caixinhas.map((caixinha) => (
                <option key={caixinha.id} value={caixinha.id}>
                  {caixinha.nome}
                </option>
              ))}
            </select>
          </div>
        </div>
        
        {gastosFiltrados.length > 0 ? (
          <div className="space-y-4 sm:space-y-6">
            {datasOrdenadas.map((data) => {
              const gastosData = gastosAgrupados[data];
              const totalData = gastosData.reduce((acc, g) => acc + g.valor, 0);
              
              return (
                <div key={data}>
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-1 sm:gap-0 mb-2 sm:mb-3">
                    <h4 className="text-sm sm:text-base font-semibold text-gray-900 dark:text-white">
                      {new Date(data + 'T00:00:00').toLocaleDateString('pt-BR', { 
                        weekday: 'long', 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      })}
                    </h4>
                    <span className="text-sm font-semibold text-red-600 dark:text-red-400">
                      Total: {formatarMoeda(totalData)}
                    </span>
                  </div>
                  
                  <div className="space-y-2">
                    {gastosData.map((gasto) => {
                      const caixinha = mesAtual.caixinhas.find(c => c.id === gasto.categoria);
                      
                      return (
                        <div 
                          key={gasto.id}
                          className="flex items-center justify-between p-2 sm:p-3 bg-gray-50 dark:bg-gray-700 rounded-lg group hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                        >
                          <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                            <div 
                              className="w-2 h-2 sm:w-3 sm:h-3 rounded-full flex-shrink-0"
                              style={{ backgroundColor: caixinha?.cor || '#888' }}
                            />
                            <div className="flex-1 min-w-0">
                              <p className="text-sm sm:text-base font-medium text-gray-900 dark:text-white truncate">
                                {gasto.descricao}
                              </p>
                              <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 truncate">
                                {caixinha?.nome || 'Desconhecida'}
                              </p>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-2 sm:gap-3 ml-2">
                            <p className="text-base sm:text-lg font-semibold text-red-600 dark:text-red-400 whitespace-nowrap">
                              -{formatarMoeda(gasto.valor)}
                            </p>
                            <button
                              onClick={() => handleRemover(gasto.id)}
                              className="opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity text-red-500 hover:text-red-700 p-1 sm:p-2 flex-shrink-0"
                            >
                              <Trash2 size={16} className="sm:w-[18px] sm:h-[18px]" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-center text-gray-500 dark:text-gray-400 py-8">
            Nenhum gasto registrado ainda
          </p>
        )}
      </div>
    </div>
  );
};

export default GastosForm;
