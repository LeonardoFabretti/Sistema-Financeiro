import React, { useState } from 'react';
import { useFinance } from '../contexts/FinanceContext';
import { Calendar, ChevronLeft, ChevronRight, Download, FileText } from 'lucide-react';
import { formatarMoeda, obterNomeMes, exportarParaCSV } from '../utils/helpers';

const Historico: React.FC = () => {
  const { dados, mesAtual } = useFinance();
  const [mesVisualizado, setMesVisualizado] = useState(dados.mesAtual);
  
  const mesAtualVisualizado = dados.meses.find(m => m.id === mesVisualizado) || mesAtual;
  const indiceMes = dados.meses.findIndex(m => m.id === mesVisualizado);
  
  const handleMesAnterior = () => {
    if (indiceMes > 0) {
      setMesVisualizado(dados.meses[indiceMes - 1].id);
    }
  };
  
  const handleProximoMes = () => {
    if (indiceMes < dados.meses.length - 1) {
      setMesVisualizado(dados.meses[indiceMes + 1].id);
    }
  };
  
  const exportarRelatorioMensal = () => {
    const dadosExportacao = mesAtualVisualizado.gastos.map(gasto => {
      const caixinha = mesAtualVisualizado.caixinhas.find(c => c.id === gasto.categoria);
      return {
        Data: new Date(gasto.data).toLocaleDateString('pt-BR'),
        Descricao: gasto.descricao,
        Categoria: caixinha?.nome || 'Desconhecida',
        Valor: gasto.valor
      };
    });
    
    exportarParaCSV(
      dadosExportacao,
      `relatorio-${obterNomeMes(mesAtualVisualizado.mes)}-${mesAtualVisualizado.ano}`
    );
  };
  
  return (
    <div className="space-y-6">
      {/* Navegação entre Meses */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-0">
          <button
            onClick={handleMesAnterior}
            disabled={indiceMes === 0}
            className={`w-full sm:w-auto flex items-center justify-center gap-2 px-3 sm:px-4 py-2 rounded-lg font-medium transition-all text-sm sm:text-base ${
              indiceMes === 0
                ? 'bg-gray-200 dark:bg-gray-700 text-gray-400 cursor-not-allowed'
                : 'bg-blue-500 text-white hover:bg-blue-600 active:scale-95'
            }`}
          >
            <ChevronLeft size={18} className="sm:w-5 sm:h-5" />
            <span className="hidden sm:inline">Mês Anterior</span>
            <span className="sm:hidden">Anterior</span>
          </button>
          
          <div className="text-center">
            <div className="flex items-center gap-2 justify-center text-gray-500 dark:text-gray-400 mb-1">
              <Calendar size={16} className="sm:w-[18px] sm:h-[18px]" />
              <span className="text-xs sm:text-sm">Visualizando</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
              {obterNomeMes(mesAtualVisualizado.mes)} {mesAtualVisualizado.ano}
            </h2>
          </div>
          
          <button
            onClick={handleProximoMes}
            disabled={indiceMes === dados.meses.length - 1}
            className={`w-full sm:w-auto flex items-center justify-center gap-2 px-3 sm:px-4 py-2 rounded-lg font-medium transition-all text-sm sm:text-base ${
              indiceMes === dados.meses.length - 1
                ? 'bg-gray-200 dark:bg-gray-700 text-gray-400 cursor-not-allowed'
                : 'bg-blue-500 text-white hover:bg-blue-600 active:scale-95'
            }`}
          >
            <span className="hidden sm:inline">Próximo Mês</span>
            <span className="sm:hidden">Próximo</span>
            <ChevronRight size={18} className="sm:w-5 sm:h-5" />
          </button>
        </div>
        
        {/* Botão de Exportar */}
        <div className="mt-4 flex justify-end">
          <button
            onClick={exportarRelatorioMensal}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-3 sm:px-4 py-2 bg-green-500 text-white rounded-lg font-medium hover:bg-green-600 transition-all active:scale-95 text-sm sm:text-base"
          >
            <Download size={16} className="sm:w-[18px] sm:h-[18px]" />
            <span className="hidden sm:inline">Exportar Relatório CSV</span>
            <span className="sm:hidden">Exportar CSV</span>
          </button>
        </div>
      </div>
      
      {/* Resumo Mensal */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
        <div className="flex items-center gap-2 mb-6">
          <FileText size={24} className="text-blue-500" />
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">
            Resumo Mensal
          </h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900 dark:to-green-800 rounded-lg p-4">
            <p className="text-sm text-green-700 dark:text-green-300 font-medium">Total Recebido</p>
            <p className="text-2xl font-bold text-green-800 dark:text-green-200 mt-1">
              {formatarMoeda(mesAtualVisualizado.resumo.totalRecebido)}
            </p>
            <p className="text-xs text-green-600 dark:text-green-400 mt-1">
              {mesAtualVisualizado.rendas.length} entrada(s)
            </p>
          </div>
          
          <div className="bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900 dark:to-red-800 rounded-lg p-4">
            <p className="text-sm text-red-700 dark:text-red-300 font-medium">Total Gasto</p>
            <p className="text-2xl font-bold text-red-800 dark:text-red-200 mt-1">
              {formatarMoeda(mesAtualVisualizado.resumo.totalGasto)}
            </p>
            <p className="text-xs text-red-600 dark:text-red-400 mt-1">
              {mesAtualVisualizado.gastos.length} gasto(s)
            </p>
          </div>
          
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900 dark:to-blue-800 rounded-lg p-4">
            <p className="text-sm text-blue-700 dark:text-blue-300 font-medium">Total Economizado</p>
            <p className="text-2xl font-bold text-blue-800 dark:text-blue-200 mt-1">
              {formatarMoeda(mesAtualVisualizado.resumo.totalEconomizado)}
            </p>
            <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
              {mesAtualVisualizado.resumo.totalRecebido > 0
                ? `${((mesAtualVisualizado.resumo.totalEconomizado / mesAtualVisualizado.resumo.totalRecebido) * 100).toFixed(1)}%`
                : '0%'
              } da renda
            </p>
          </div>
          
          <div className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900 dark:to-orange-800 rounded-lg p-4">
            <p className="text-sm text-orange-700 dark:text-orange-300 font-medium">Maior Gasto</p>
            <p className="text-lg font-bold text-orange-800 dark:text-orange-200 mt-1">
              {mesAtualVisualizado.resumo.categoriaComMaisGasto.nome || 'N/A'}
            </p>
            <p className="text-xs text-orange-600 dark:text-orange-400 mt-1">
              {formatarMoeda(mesAtualVisualizado.resumo.categoriaComMaisGasto.valor)}
            </p>
          </div>
        </div>
        
        {/* Comparação com Mês Anterior */}
        {mesAtualVisualizado.resumo.comparacaoMesAnterior.diferenca > 0 && (
          <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
              Comparação com mês anterior:
            </p>
            <div className="flex items-center gap-3">
              {mesAtualVisualizado.resumo.comparacaoMesAnterior.gastouMais ? (
                <span className="text-red-600 dark:text-red-400 font-semibold">
                  ↑ Gastou {formatarMoeda(mesAtualVisualizado.resumo.comparacaoMesAnterior.diferenca)} a mais
                </span>
              ) : (
                <span className="text-green-600 dark:text-green-400 font-semibold">
                  ↓ Economizou {formatarMoeda(mesAtualVisualizado.resumo.comparacaoMesAnterior.diferenca)} a mais
                </span>
              )}
              <span className="text-sm text-gray-500 dark:text-gray-400">
                ({mesAtualVisualizado.resumo.comparacaoMesAnterior.percentual.toFixed(1)}%)
              </span>
            </div>
          </div>
        )}
      </div>
      
      {/* Lista de Todos os Meses */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
          Todos os Meses
        </h3>
        
        <div className="space-y-3">
          {dados.meses.slice().reverse().map((mes) => {
            const totalRecebido = mes.resumo.totalRecebido;
            const totalGasto = mes.resumo.totalGasto;
            const totalEconomizado = mes.resumo.totalEconomizado;
            const ehMesAtual = mes.id === dados.mesAtual;
            
            return (
              <button
                key={mes.id}
                onClick={() => setMesVisualizado(mes.id)}
                className={`w-full text-left p-4 rounded-lg transition-all ${
                  mesVisualizado === mes.id
                    ? 'bg-blue-50 dark:bg-blue-900 dark:bg-opacity-20 border-2 border-blue-500'
                    : 'bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 border-2 border-transparent'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <h4 className="font-bold text-gray-900 dark:text-white">
                      {obterNomeMes(mes.mes)} {mes.ano}
                    </h4>
                    {ehMesAtual && (
                      <span className="px-2 py-1 bg-blue-500 text-white text-xs rounded-full">
                        Atual
                      </span>
                    )}
                  </div>
                  <span className={`font-semibold ${
                    totalEconomizado >= 0 
                      ? 'text-green-600 dark:text-green-400' 
                      : 'text-red-600 dark:text-red-400'
                  }`}>
                    {totalEconomizado >= 0 ? '+' : ''}{formatarMoeda(totalEconomizado)}
                  </span>
                </div>
                
                <div className="grid grid-cols-3 gap-2 text-sm">
                  <div>
                    <p className="text-gray-500 dark:text-gray-400">Recebido</p>
                    <p className="text-green-600 dark:text-green-400 font-semibold">
                      {formatarMoeda(totalRecebido)}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500 dark:text-gray-400">Gasto</p>
                    <p className="text-red-600 dark:text-red-400 font-semibold">
                      {formatarMoeda(totalGasto)}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500 dark:text-gray-400">Gastos</p>
                    <p className="text-gray-700 dark:text-gray-300 font-semibold">
                      {mes.gastos.length} registro(s)
                    </p>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Historico;
