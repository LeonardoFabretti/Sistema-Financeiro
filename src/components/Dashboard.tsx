import React, { useState } from 'react';
import { useFinance } from '../contexts/FinanceContext';
import { 
  TrendingUp, 
  TrendingDown, 
  Wallet, 
  PiggyBank,
  Calendar
} from 'lucide-react';
import { formatarMoeda, obterNomeMes } from '../utils/helpers';
import RendaForm from './RendaForm';
import GastosForm from './GastosForm';
import Caixinhas from './Caixinhas';
import Graficos from './Graficos';
import Historico from './Historico';

const Dashboard: React.FC = () => {
  const { mesAtual } = useFinance();
  const [abaAtiva, setAbaAtiva] = useState<'resumo' | 'renda' | 'gastos' | 'caixinhas' | 'graficos' | 'historico'>('resumo');
  
  const resumo = mesAtual.resumo;
  const mesNome = obterNomeMes(mesAtual.mes);
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-lg sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-3">
            <div>
              <h1 className="text-xl sm:text-3xl font-bold text-gray-900 dark:text-white">
                💰 Sistema Financeiro
              </h1>
              <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-0.5 sm:mt-1">
                Controle completo das suas finanças
              </p>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="text-left sm:text-right">
                <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">Período Atual</p>
                <p className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">
                  {mesNome} {mesAtual.ano}
                </p>
              </div>
            </div>
          </div>
        </div>
      </header>
      
      {/* Navigation Tabs */}
      <div className="bg-white dark:bg-gray-800 shadow sticky top-[64px] sm:top-[88px] z-30">
        <div className="max-w-7xl mx-auto px-2 sm:px-6 lg:px-8">
          <nav className="flex space-x-1 sm:space-x-8 overflow-x-auto scrollbar-hide -mx-2 px-2">
            {[
              { id: 'resumo', nome: 'Resumo', icone: Calendar },
              { id: 'renda', nome: 'Renda', icone: TrendingUp },
              { id: 'gastos', nome: 'Gastos', icone: TrendingDown },
              { id: 'caixinhas', nome: 'Caixinhas', icone: PiggyBank },
              { id: 'graficos', nome: 'Gráficos', icone: Wallet },
              { id: 'historico', nome: 'Histórico', icone: Calendar }
            ].map((aba) => {
              const Icone = aba.icone;
              return (
                <button
                  key={aba.id}
                  onClick={() => setAbaAtiva(aba.id as any)}
                  className={`
                    flex items-center gap-1.5 sm:gap-2 py-2.5 sm:py-4 px-3 sm:px-1 border-b-2 font-medium text-[11px] sm:text-sm whitespace-nowrap transition-all
                    ${abaAtiva === aba.id
                      ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                    }
                  `}
                >
                  <Icone size={14} className="sm:w-[18px] sm:h-[18px]" />
                  <span>{aba.nome}</span>
                </button>
              );
            })}
          </nav>
        </div>
      </div>
      
      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-8 pb-20 sm:pb-8">
        {abaAtiva === 'resumo' && (
          <div className="space-y-6">
            {/* Cards de Resumo */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-6">
              {/* Total Recebido */}
              <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg sm:rounded-xl shadow-lg p-4 sm:p-6 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-green-100 text-xs sm:text-sm font-medium">Total Recebido</p>
                    <p className="text-2xl sm:text-3xl font-bold mt-1 sm:mt-2">{formatarMoeda(resumo.totalRecebido)}</p>
                  </div>
                  <div className="bg-white bg-opacity-20 rounded-full p-2 sm:p-3">
                    <TrendingUp size={24} className="sm:w-8 sm:h-8" />
                  </div>
                </div>
                <div className="mt-2 sm:mt-4 text-xs sm:text-sm text-green-100">
                  {mesAtual.rendas.length} entrada(s) registrada(s)
                </div>
              </div>
              
              {/* Total Gasto */}
              <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-lg sm:rounded-xl shadow-lg p-4 sm:p-6 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-red-100 text-xs sm:text-sm font-medium">Total Gasto</p>
                    <p className="text-2xl sm:text-3xl font-bold mt-1 sm:mt-2">{formatarMoeda(resumo.totalGasto)}</p>
                  </div>
                  <div className="bg-white bg-opacity-20 rounded-full p-2 sm:p-3">
                    <TrendingDown size={24} className="sm:w-8 sm:h-8" />
                  </div>
                </div>
                <div className="mt-2 sm:mt-4 text-xs sm:text-sm text-red-100">
                  {mesAtual.gastos.length} gasto(s) registrado(s)
                </div>
              </div>
              
              {/* Total Economizado */}
              <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg sm:rounded-xl shadow-lg p-4 sm:p-6 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-blue-100 text-xs sm:text-sm font-medium">Total Economizado</p>
                    <p className="text-2xl sm:text-3xl font-bold mt-1 sm:mt-2">{formatarMoeda(resumo.totalEconomizado)}</p>
                  </div>
                  <div className="bg-white bg-opacity-20 rounded-full p-2 sm:p-3">
                    <PiggyBank size={24} className="sm:w-8 sm:h-8" />
                  </div>
                </div>
                <div className="mt-2 sm:mt-4 text-xs sm:text-sm text-blue-100">
                  {resumo.totalRecebido > 0 
                    ? `${((resumo.totalEconomizado / resumo.totalRecebido) * 100).toFixed(1)}% da renda`
                    : 'Nenhuma renda registrada'
                  }
                </div>
              </div>
            </div>
            
            {/* Gráfico de Pizza - Gastos por Categoria */}
            <div className="bg-white dark:bg-gray-800 rounded-lg sm:rounded-xl shadow-lg p-4 sm:p-6">
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-3 sm:mb-4">
                Distribuição de Gastos por Categoria
              </h3>
              {mesAtual.gastos.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Gráfico de Pizza SVG */}
                  <div className="flex items-center justify-center">
                    <svg viewBox="0 0 240 240" className="w-full max-w-xs h-auto">
                      {(() => {
                        const gastosPorCaixinha = mesAtual.caixinhas.map(caixinha => {
                          const total = mesAtual.gastos
                            .filter(g => g.categoria === caixinha.id)
                            .reduce((sum, g) => sum + g.valor, 0);
                          return { ...caixinha, totalGasto: total };
                        }).filter(c => c.totalGasto > 0);
                        
                        const totalGeral = gastosPorCaixinha.reduce((sum, c) => sum + c.totalGasto, 0);
                        
                        // Se houver apenas uma categoria com 100%, mostrar círculo completo
                        if (gastosPorCaixinha.length === 1) {
                          const caixinha = gastosPorCaixinha[0];
                          return (
                            <g key={caixinha.id}>
                              <circle
                                cx="120"
                                cy="120"
                                r="100"
                                fill={caixinha.cor}
                                stroke="white"
                                strokeWidth="3"
                                className="transition-all hover:opacity-80 cursor-pointer"
                              />
                              <text
                                x="120"
                                y="80"
                                textAnchor="middle"
                                dominantBaseline="middle"
                                className="fill-white font-bold text-xl pointer-events-none"
                              >
                                100%
                              </text>
                            </g>
                          );
                        }
                        
                        // Múltiplas categorias - desenhar fatias
                        let currentAngle = 0;
                        
                        return gastosPorCaixinha.map((caixinha, index) => {
                          const percentage = (caixinha.totalGasto / totalGeral) * 100;
                          const angle = (percentage / 100) * 360;
                          const startAngle = currentAngle;
                          const endAngle = currentAngle + angle;
                          
                          // Converter ângulos para coordenadas (centro 120, raio 100)
                          const startRad = (startAngle - 90) * (Math.PI / 180);
                          const endRad = (endAngle - 90) * (Math.PI / 180);
                          
                          const x1 = 120 + 100 * Math.cos(startRad);
                          const y1 = 120 + 100 * Math.sin(startRad);
                          const x2 = 120 + 100 * Math.cos(endRad);
                          const y2 = 120 + 100 * Math.sin(endRad);
                          
                          const largeArc = angle > 180 ? 1 : 0;
                          
                          const path = `M 120 120 L ${x1} ${y1} A 100 100 0 ${largeArc} 1 ${x2} ${y2} Z`;
                          
                          // Calcular posição do texto (no meio da fatia)
                          const midAngle = (startAngle + endAngle) / 2;
                          const midRad = (midAngle - 90) * (Math.PI / 180);
                          const textX = 120 + 65 * Math.cos(midRad);
                          const textY = 120 + 65 * Math.sin(midRad);
                          
                          currentAngle = endAngle;
                          
                          return (
                            <g key={caixinha.id}>
                              <path
                                d={path}
                                fill={caixinha.cor}
                                stroke="white"
                                strokeWidth="3"
                                className="transition-all hover:opacity-80 cursor-pointer"
                              />
                              {percentage > 5 && (
                                <text
                                  x={textX}
                                  y={textY}
                                  textAnchor="middle"
                                  dominantBaseline="middle"
                                  className="fill-white font-bold text-sm pointer-events-none"
                                  style={{ fontSize: '14px' }}
                                >
                                  {percentage.toFixed(0)}%
                                </text>
                              )}
                            </g>
                          );
                        });
                      })()}
                      {/* Círculo branco no centro para efeito donut */}
                      <circle cx="120" cy="120" r="50" fill="white" className="dark:fill-gray-800" />
                      <text
                        x="120"
                        y="115"
                        textAnchor="middle"
                        className="fill-gray-900 dark:fill-white font-bold text-lg"
                      >
                        Total
                      </text>
                      <text
                        x="120"
                        y="135"
                        textAnchor="middle"
                        className="fill-gray-700 dark:fill-gray-300 font-semibold text-sm"
                      >
                        {formatarMoeda(resumo.totalGasto)}
                      </text>
                    </svg>
                  </div>
                  
                  {/* Legenda */}
                  <div className="space-y-2">
                    {mesAtual.caixinhas.map(caixinha => {
                      const totalGasto = mesAtual.gastos
                        .filter(g => g.categoria === caixinha.id)
                        .reduce((sum, g) => sum + g.valor, 0);
                      
                      if (totalGasto === 0) return null;
                      
                      const percentual = resumo.totalGasto > 0 
                        ? (totalGasto / resumo.totalGasto) * 100 
                        : 0;
                      
                      return (
                        <div key={caixinha.id} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-700 rounded-lg">
                          <div className="flex items-center gap-2">
                            <div 
                              className="w-4 h-4 rounded-full"
                              style={{ backgroundColor: caixinha.cor }}
                            />
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                              {caixinha.nome}
                            </span>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-bold text-gray-900 dark:text-white">
                              {formatarMoeda(totalGasto)}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              {percentual.toFixed(1)}%
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <p className="text-gray-500 dark:text-gray-400 text-center py-8">
                  Nenhum gasto registrado ainda
                </p>
              )}
            </div>

            {/* Informações Adicionais */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-6">
              {/* Categoria com Mais Gasto */}
              <div className="bg-white dark:bg-gray-800 rounded-lg sm:rounded-xl shadow-lg p-4 sm:p-6">
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-3 sm:mb-4">
                  Categoria com Mais Gasto
                </h3>
                {resumo.categoriaComMaisGasto.valor > 0 ? (
                  <div>
                    <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
                      {resumo.categoriaComMaisGasto.nome}
                    </p>
                    <p className="text-base sm:text-lg text-gray-600 dark:text-gray-400 mt-1 sm:mt-2">
                      {formatarMoeda(resumo.categoriaComMaisGasto.valor)}
                    </p>
                    <div className="mt-4 bg-gray-100 dark:bg-gray-700 rounded-full h-2">
                      <div 
                        className="bg-orange-500 h-2 rounded-full"
                        style={{ 
                          width: `${resumo.totalGasto > 0 
                            ? (resumo.categoriaComMaisGasto.valor / resumo.totalGasto) * 100 
                            : 0}%` 
                        }}
                      />
                    </div>
                  </div>
                ) : (
                  <p className="text-gray-500 dark:text-gray-400">
                    Nenhum gasto registrado ainda
                  </p>
                )}
              </div>
              
              {/* Comparação com Mês Anterior */}
              <div className="bg-white dark:bg-gray-800 rounded-lg sm:rounded-xl shadow-lg p-4 sm:p-6">
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-3 sm:mb-4">
                  Comparação com Mês Anterior
                </h3>
                {resumo.comparacaoMesAnterior.diferenca > 0 ? (
                  <div>
                    <div className="flex items-center gap-2">
                      {resumo.comparacaoMesAnterior.gastouMais ? (
                        <>
                          <TrendingUp className="text-red-500" size={24} />
                          <span className="text-red-500 font-semibold">Gastou Mais</span>
                        </>
                      ) : (
                        <>
                          <TrendingDown className="text-green-500" size={24} />
                          <span className="text-green-500 font-semibold">Gastou Menos</span>
                        </>
                      )}
                    </div>
                    <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mt-2">
                      {formatarMoeda(resumo.comparacaoMesAnterior.diferenca)}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      {resumo.comparacaoMesAnterior.percentual.toFixed(1)}% de diferença
                    </p>
                  </div>
                ) : (
                  <p className="text-gray-500 dark:text-gray-400">
                    Primeiro mês de registro
                  </p>
                )}
              </div>
            </div>
            
            {/* Últimos Gastos */}
            <div className="bg-white dark:bg-gray-800 rounded-lg sm:rounded-xl shadow-lg p-4 sm:p-6">
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-3 sm:mb-4">
                Últimos Gastos
              </h3>
              {mesAtual.gastos.length > 0 ? (
                <div className="space-y-3">
                  {mesAtual.gastos.slice(-5).reverse().map((gasto) => {
                    const caixinha = mesAtual.caixinhas.find(c => c.id === gasto.categoria);
                    return (
                      <div key={gasto.id} className="flex items-center justify-between p-2 sm:p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                          <div 
                            className="w-2 h-2 sm:w-3 sm:h-3 rounded-full flex-shrink-0"
                            style={{ backgroundColor: caixinha?.cor || '#888' }}
                          />
                          <div className="min-w-0 flex-1">
                            <p className="font-medium text-sm sm:text-base text-gray-900 dark:text-white truncate">
                              {gasto.descricao}
                            </p>
                            <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 truncate">
                              {caixinha?.nome || 'Desconhecida'} • {new Date(gasto.data).toLocaleDateString('pt-BR')}
                            </p>
                          </div>
                        </div>
                        <p className="text-base sm:text-lg font-semibold text-red-600 dark:text-red-400 ml-2 flex-shrink-0">
                          -{formatarMoeda(gasto.valor)}
                        </p>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-gray-500 dark:text-gray-400 text-center py-8">
                  Nenhum gasto registrado ainda
                </p>
              )}
            </div>
          </div>
        )}
        
        {abaAtiva === 'renda' && <RendaForm />}
        {abaAtiva === 'gastos' && <GastosForm />}
        {abaAtiva === 'caixinhas' && <Caixinhas />}
        {abaAtiva === 'graficos' && <Graficos />}
        {abaAtiva === 'historico' && <Historico />}
      </main>
    </div>
  );
};

export default Dashboard;
