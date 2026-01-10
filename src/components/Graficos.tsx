import React, { useMemo } from 'react';
import { useFinance } from '../contexts/FinanceContext';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import { formatarMoeda, obterNomeMes } from '../utils/helpers';
import { TrendingUp, TrendingDown, PieChart as PieChartIcon } from 'lucide-react';

const Graficos: React.FC = () => {
  const { dados, mesAtual } = useFinance();
  
  // Dados para gráfico de gastos por categoria
  const dadosGastosPorCategoria = useMemo(() => {
    return mesAtual.caixinhas.map(caixinha => {
      const totalGasto = mesAtual.gastos
        .filter(g => g.categoria === caixinha.id)
        .reduce((acc, g) => acc + g.valor, 0);
      
      return {
        nome: caixinha.nome,
        valor: totalGasto,
        cor: caixinha.cor
      };
    }).filter(item => item.valor > 0);
  }, [mesAtual]);
  
  // Dados para gráfico de evolução mensal
  const dadosEvolucaoMensal = useMemo(() => {
    return dados.meses.map(mes => {
      const totalRecebido = mes.rendas.reduce((acc, r) => acc + r.valor, 0);
      const totalGasto = mes.gastos.reduce((acc, g) => acc + g.valor, 0);
      const totalEconomizado = totalRecebido - totalGasto;
      
      return {
        mes: `${obterNomeMes(mes.mes).substring(0, 3)}/${mes.ano}`,
        recebido: totalRecebido,
        gasto: totalGasto,
        economizado: totalEconomizado
      };
    });
  }, [dados.meses]);
  
  // Dados para comparação mensal
  const dadosComparacaoMensal = useMemo(() => {
    return dados.meses.map(mes => {
      const totalGasto = mes.gastos.reduce((acc, g) => acc + g.valor, 0);
      
      return {
        mes: `${obterNomeMes(mes.mes).substring(0, 3)}/${mes.ano}`,
        gasto: totalGasto
      };
    });
  }, [dados.meses]);
  
  // Identificar mês que mais gastou e mais economizou
  const estatisticas = useMemo(() => {
    let mesQueMaisGastou = { nome: '', valor: 0 };
    let mesQueMaisEconomizou = { nome: '', valor: 0 };
    
    dados.meses.forEach(mes => {
      const totalRecebido = mes.rendas.reduce((acc, r) => acc + r.valor, 0);
      const totalGasto = mes.gastos.reduce((acc, g) => acc + g.valor, 0);
      const economizado = totalRecebido - totalGasto;
      const nomeMes = `${obterNomeMes(mes.mes)} ${mes.ano}`;
      
      if (totalGasto > mesQueMaisGastou.valor) {
        mesQueMaisGastou = { nome: nomeMes, valor: totalGasto };
      }
      
      if (economizado > mesQueMaisEconomizou.valor) {
        mesQueMaisEconomizou = { nome: nomeMes, valor: economizado };
      }
    });
    
    return { mesQueMaisGastou, mesQueMaisEconomizou };
  }, [dados.meses]);
  
  // Dados para distribuição de saldos nas caixinhas
  const dadosSaldosCaixinhas = useMemo(() => {
    return mesAtual.caixinhas
      .filter(c => c.saldo > 0)
      .map(caixinha => ({
        nome: caixinha.nome,
        valor: caixinha.saldo,
        cor: caixinha.cor
      }));
  }, [mesAtual]);
  
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-gray-800 p-3 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
          <p className="font-semibold text-gray-900 dark:text-white">
            {payload[0].payload.nome || payload[0].payload.mes}
          </p>
          {payload.map((entry: any, index: number) => (
            <p key={index} style={{ color: entry.color }}>
              {entry.name}: {formatarMoeda(entry.value)}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };
  
  return (
    <div className="space-y-6">
      {/* Cards de Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-xl shadow-lg p-6 text-white">
          <div className="flex items-center gap-3 mb-2">
            <TrendingUp size={24} />
            <h3 className="text-lg font-semibold">Mês que Mais Gastou</h3>
          </div>
          {estatisticas.mesQueMaisGastou.valor > 0 ? (
            <>
              <p className="text-3xl font-bold mt-2">
                {formatarMoeda(estatisticas.mesQueMaisGastou.valor)}
              </p>
              <p className="text-red-100 mt-1">
                {estatisticas.mesQueMaisGastou.nome}
              </p>
            </>
          ) : (
            <p className="text-red-100 mt-2">Nenhum dado disponível</p>
          )}
        </div>
        
        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-lg p-6 text-white">
          <div className="flex items-center gap-3 mb-2">
            <TrendingDown size={24} />
            <h3 className="text-lg font-semibold">Mês que Mais Economizou</h3>
          </div>
          {estatisticas.mesQueMaisEconomizou.valor > 0 ? (
            <>
              <p className="text-3xl font-bold mt-2">
                {formatarMoeda(estatisticas.mesQueMaisEconomizou.valor)}
              </p>
              <p className="text-green-100 mt-1">
                {estatisticas.mesQueMaisEconomizou.nome}
              </p>
            </>
          ) : (
            <p className="text-green-100 mt-2">Nenhum dado disponível</p>
          )}
        </div>
      </div>
      
      {/* Gráfico de Gastos por Categoria */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
        <div className="flex items-center gap-2 mb-4">
          <PieChartIcon size={24} className="text-blue-500" />
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">
            Gastos por Categoria (Mês Atual)
          </h3>
        </div>
        
        {dadosGastosPorCategoria.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={dadosGastosPorCategoria}
                  dataKey="valor"
                  nameKey="nome"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  label={({ nome, percent }) => `${nome} ${(percent * 100).toFixed(0)}%`}
                >
                  {dadosGastosPorCategoria.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.cor} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
            
            <div className="space-y-3">
              {dadosGastosPorCategoria.map((item, index) => {
                const total = dadosGastosPorCategoria.reduce((acc, d) => acc + d.valor, 0);
                const percent = (item.valor / total) * 100;
                
                return (
                  <div key={index} className="space-y-1">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-4 h-4 rounded"
                          style={{ backgroundColor: item.cor }}
                        />
                        <span className="text-gray-700 dark:text-gray-300 font-medium">
                          {item.nome}
                        </span>
                      </div>
                      <span className="font-bold text-gray-900 dark:text-white">
                        {formatarMoeda(item.valor)}
                      </span>
                    </div>
                    <div className="bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div 
                        className="h-2 rounded-full transition-all"
                        style={{ 
                          width: `${percent}%`,
                          backgroundColor: item.cor
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <p className="text-center text-gray-500 dark:text-gray-400 py-12">
            Nenhum gasto registrado no mês atual
          </p>
        )}
      </div>
      
      {/* Gráfico de Evolução do Patrimônio */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
          Evolução Financeira ao Longo dos Meses
        </h3>
        
        {dadosEvolucaoMensal.length > 0 ? (
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={dadosEvolucaoMensal}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.1} />
              <XAxis 
                dataKey="mes" 
                stroke="#6b7280"
                style={{ fontSize: '12px' }}
              />
              <YAxis 
                stroke="#6b7280"
                style={{ fontSize: '12px' }}
                tickFormatter={(value) => `R$ ${value}`}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="recebido" 
                stroke="#10b981" 
                strokeWidth={3}
                name="Recebido"
                dot={{ r: 5 }}
              />
              <Line 
                type="monotone" 
                dataKey="gasto" 
                stroke="#ef4444" 
                strokeWidth={3}
                name="Gasto"
                dot={{ r: 5 }}
              />
              <Line 
                type="monotone" 
                dataKey="economizado" 
                stroke="#3b82f6" 
                strokeWidth={3}
                name="Economizado"
                dot={{ r: 5 }}
              />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <p className="text-center text-gray-500 dark:text-gray-400 py-12">
            Nenhum dado disponível
          </p>
        )}
      </div>
      
      {/* Gráfico de Comparação de Gastos Entre Meses */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
          Comparação de Gastos Entre Meses
        </h3>
        
        {dadosComparacaoMensal.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={dadosComparacaoMensal}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.1} />
              <XAxis 
                dataKey="mes" 
                stroke="#6b7280"
                style={{ fontSize: '12px' }}
              />
              <YAxis 
                stroke="#6b7280"
                style={{ fontSize: '12px' }}
                tickFormatter={(value) => `R$ ${value}`}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Bar 
                dataKey="gasto" 
                fill="#f59e0b" 
                name="Gasto"
                radius={[8, 8, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <p className="text-center text-gray-500 dark:text-gray-400 py-12">
            Nenhum dado disponível
          </p>
        )}
      </div>
      
      {/* Distribuição de Saldos nas Caixinhas */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
          Distribuição de Saldos nas Caixinhas (Mês Atual)
        </h3>
        
        {dadosSaldosCaixinhas.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={dadosSaldosCaixinhas} layout="horizontal">
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.1} />
              <XAxis type="number" stroke="#6b7280" tickFormatter={(value) => `R$ ${value}`} />
              <YAxis dataKey="nome" type="category" stroke="#6b7280" width={150} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="valor" name="Saldo" radius={[0, 8, 8, 0]}>
                {dadosSaldosCaixinhas.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.cor} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <p className="text-center text-gray-500 dark:text-gray-400 py-12">
            Nenhum saldo nas caixinhas
          </p>
        )}
      </div>
    </div>
  );
};

export default Graficos;
