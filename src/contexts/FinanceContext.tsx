import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {
  DadosSistema,
  MesFinanceiro,
  Caixinha,
  Renda,
  Gasto,
  ResumoMensal,
  Movimentacao,
  Configuracoes
} from '../types';
import { gerarId, obterChaveMesAtual } from '../utils/helpers';

// Contexto do sistema financeiro
interface FinanceContextType {
  dados: DadosSistema;
  mesAtual: MesFinanceiro;
  
  // Funções de Renda
  adicionarRenda: (renda: Omit<Renda, 'id'>) => void;
  
  // Funções de Gastos
  adicionarGasto: (gasto: Omit<Gasto, 'id'>) => void;
  removerGasto: (id: string) => void;
  
  // Funções de Caixinhas
  adicionarCaixinha: (caixinha: Omit<Caixinha, 'id' | 'saldo' | 'historico'>) => void;
  atualizarCaixinha: (id: string, dados: Partial<Caixinha>) => void;
  removerCaixinha: (id: string) => void;
  
  // Funções de Configuração
  atualizarConfiguracoes: (config: Partial<Configuracoes>) => void;
  
  // Funções de Navegação
  navegarParaMes: (chaveMes: string) => void;
  
  // Funções de Dados
  exportarDados: () => void;
  importarDados: (dados: DadosSistema) => void;
  limparDados: () => void;
}

const FinanceContext = createContext<FinanceContextType | undefined>(undefined);

// Dados iniciais padrão
const criarDadosIniciais = (): DadosSistema => {
  const chaveMesAtual = obterChaveMesAtual();
  const [ano, mes] = chaveMesAtual.split('-').map(Number);
  
  const caixinhasPadrao: Caixinha[] = [
    {
      id: gerarId(),
      nome: 'Gastos Essenciais',
      cor: '#f59e0b',
      saldo: 34.47,
      percentualPadrao: 50,
      historico: []
    },
    {
      id: gerarId(),
      nome: 'Reserva de Emergência',
      cor: '#10b981',
      saldo: 392.20,
      percentualPadrao: 16.67,
      historico: []
    },
    {
      id: gerarId(),
      nome: 'Objetivos Futuros',
      cor: '#3b82f6',
      saldo: 29.67,
      percentualPadrao: 16.67,
      historico: []
    },
    {
      id: gerarId(),
      nome: 'Investimento',
      cor: '#8b5cf6',
      saldo: 0.00,
      percentualPadrao: 16.67,
      historico: []
    }
  ];
  
  const mesInicial: MesFinanceiro = {
    id: chaveMesAtual,
    mes,
    ano,
    rendas: [],
    gastos: [],
    caixinhas: caixinhasPadrao,
    resumo: {
      totalRecebido: 0,
      totalGasto: 0,
      totalEconomizado: 0,
      categoriaComMaisGasto: { nome: '', valor: 0 },
      comparacaoMesAnterior: { gastouMais: false, diferenca: 0, percentual: 0 }
    }
  };
  
  return {
    meses: [mesInicial],
    mesAtual: chaveMesAtual,
    configuracoes: {
      divisaoAutomatica: caixinhasPadrao.map(c => ({
        caixinhaId: c.id,
        percentual: c.percentualPadrao
      })),
      moeda: 'BRL',
      tema: 'auto',
      notificacoes: true
    },
    versao: '1.0.0'
  };
};

export const FinanceProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [dados, setDados] = useState<DadosSistema>(() => {
    // Carregar dados do localStorage
    const dadosSalvos = localStorage.getItem('sistemaFinanceiro');
    if (dadosSalvos) {
      return JSON.parse(dadosSalvos);
    }
    return criarDadosIniciais();
  });
  
  // Salvar dados no localStorage sempre que houver mudanças
  useEffect(() => {
    localStorage.setItem('sistemaFinanceiro', JSON.stringify(dados));
  }, [dados]);
  
  // Verificar e criar novo mês automaticamente
  useEffect(() => {
    const chaveMesAtual = obterChaveMesAtual();
    if (dados.mesAtual !== chaveMesAtual) {
      criarNovoMes(chaveMesAtual);
    }
  }, []);
  
  // Obter mês atual
  const mesAtual = dados.meses.find(m => m.id === dados.mesAtual) || dados.meses[0];
  
  // Calcular resumo do mês
  const calcularResumo = (mes: MesFinanceiro): ResumoMensal => {
    const totalRecebido = mes.rendas.reduce((acc, r) => acc + r.valor, 0);
    const totalGasto = mes.gastos.reduce((acc, g) => acc + g.valor, 0);
    const totalEconomizado = totalRecebido - totalGasto;
    
    // Categoria com mais gasto
    const gastosPorCategoria = mes.gastos.reduce((acc, g) => {
      acc[g.categoria] = (acc[g.categoria] || 0) + g.valor;
      return acc;
    }, {} as Record<string, number>);
    
    const categoriaMaxId = Object.keys(gastosPorCategoria).reduce((a, b) => 
      gastosPorCategoria[a] > gastosPorCategoria[b] ? a : b, ''
    );
    
    const caixinhaMax = mes.caixinhas.find(c => c.id === categoriaMaxId);
    
    // Comparação com mês anterior
    const indiceMesAtual = dados.meses.findIndex(m => m.id === mes.id);
    const mesAnterior = indiceMesAtual > 0 ? dados.meses[indiceMesAtual - 1] : null;
    
    let comparacaoMesAnterior = {
      gastouMais: false,
      diferenca: 0,
      percentual: 0
    };
    
    if (mesAnterior) {
      const totalGastoAnterior = mesAnterior.gastos.reduce((acc, g) => acc + g.valor, 0);
      const diferenca = totalGasto - totalGastoAnterior;
      comparacaoMesAnterior = {
        gastouMais: diferenca > 0,
        diferenca: Math.abs(diferenca),
        percentual: totalGastoAnterior > 0 ? (diferenca / totalGastoAnterior) * 100 : 0
      };
    }
    
    return {
      totalRecebido,
      totalGasto,
      totalEconomizado,
      categoriaComMaisGasto: {
        nome: caixinhaMax?.nome || 'Nenhuma',
        valor: gastosPorCategoria[categoriaMaxId] || 0
      },
      comparacaoMesAnterior
    };
  };
  
  // Criar novo mês
  const criarNovoMes = (chaveMes: string) => {
    const [ano, mes] = chaveMes.split('-').map(Number);
    
    // Copiar saldos das caixinhas do mês anterior
    const caixinhasAntigas = mesAtual.caixinhas;
    const novasCaixinhas = caixinhasAntigas.map(c => ({
      ...c,
      historico: []
    }));
    
    const novoMes: MesFinanceiro = {
      id: chaveMes,
      mes,
      ano,
      rendas: [],
      gastos: [],
      caixinhas: novasCaixinhas,
      resumo: calcularResumo({
        id: chaveMes,
        mes,
        ano,
        rendas: [],
        gastos: [],
        caixinhas: novasCaixinhas,
        resumo: {} as ResumoMensal
      })
    };
    
    setDados(prev => ({
      ...prev,
      meses: [...prev.meses, novoMes],
      mesAtual: chaveMes
    }));
  };
  
  // Adicionar renda
  const adicionarRenda = (rendaData: Omit<Renda, 'id'>) => {
    const novaRenda: Renda = {
      ...rendaData,
      id: gerarId()
    };
    
    setDados(prev => {
      const novosMeses = prev.meses.map(mes => {
        if (mes.id === prev.mesAtual) {
          const rendas = [...mes.rendas, novaRenda];
          
          // Divisão automática se habilitada
          let caixinhas = mes.caixinhas;
          if (novaRenda.divisaoAutomatica) {
            caixinhas = mes.caixinhas.map(caixinha => {
              const config = prev.configuracoes.divisaoAutomatica.find(
                d => d.caixinhaId === caixinha.id
              );
              
              if (config) {
                const valorDivisao = (novaRenda.valor * config.percentual) / 100;
                const movimentacao: Movimentacao = {
                  id: gerarId(),
                  tipo: 'entrada',
                  valor: valorDivisao,
                  descricao: `Renda: ${novaRenda.descricao}`,
                  data: novaRenda.data
                };
                
                return {
                  ...caixinha,
                  saldo: caixinha.saldo + valorDivisao,
                  historico: [...caixinha.historico, movimentacao]
                };
              }
              return caixinha;
            });
          }
          
          const mesAtualizado = { ...mes, rendas, caixinhas };
          return {
            ...mesAtualizado,
            resumo: calcularResumo(mesAtualizado)
          };
        }
        return mes;
      });
      
      return { ...prev, meses: novosMeses };
    });
  };
  
  // Adicionar gasto
  const adicionarGasto = (gastoData: Omit<Gasto, 'id'>) => {
    const novoGasto: Gasto = {
      ...gastoData,
      id: gerarId()
    };
    
    setDados(prev => {
      const novosMeses = prev.meses.map(mes => {
        if (mes.id === prev.mesAtual) {
          const gastos = [...mes.gastos, novoGasto];
          
          // Atualizar saldo da caixinha
          const caixinhas = mes.caixinhas.map(caixinha => {
            if (caixinha.id === novoGasto.categoria) {
              const movimentacao: Movimentacao = {
                id: gerarId(),
                tipo: 'saida',
                valor: novoGasto.valor,
                descricao: novoGasto.descricao,
                data: novoGasto.data
              };
              
              return {
                ...caixinha,
                saldo: caixinha.saldo - novoGasto.valor,
                historico: [...caixinha.historico, movimentacao]
              };
            }
            return caixinha;
          });
          
          const mesAtualizado = { ...mes, gastos, caixinhas };
          return {
            ...mesAtualizado,
            resumo: calcularResumo(mesAtualizado)
          };
        }
        return mes;
      });
      
      return { ...prev, meses: novosMeses };
    });
  };
  
  // Remover gasto
  const removerGasto = (id: string) => {
    setDados(prev => {
      const novosMeses = prev.meses.map(mes => {
        if (mes.id === prev.mesAtual) {
          const gastoRemovido = mes.gastos.find(g => g.id === id);
          if (!gastoRemovido) return mes;
          
          const gastos = mes.gastos.filter(g => g.id !== id);
          
          // Restaurar saldo da caixinha
          const caixinhas = mes.caixinhas.map(caixinha => {
            if (caixinha.id === gastoRemovido.categoria) {
              return {
                ...caixinha,
                saldo: caixinha.saldo + gastoRemovido.valor,
                historico: caixinha.historico.filter(h => h.descricao !== gastoRemovido.descricao)
              };
            }
            return caixinha;
          });
          
          const mesAtualizado = { ...mes, gastos, caixinhas };
          return {
            ...mesAtualizado,
            resumo: calcularResumo(mesAtualizado)
          };
        }
        return mes;
      });
      
      return { ...prev, meses: novosMeses };
    });
  };
  
  // Adicionar caixinha
  const adicionarCaixinha = (caixinhaData: Omit<Caixinha, 'id' | 'saldo' | 'historico'>) => {
    const novaCaixinha: Caixinha = {
      ...caixinhaData,
      id: gerarId(),
      saldo: 0,
      historico: []
    };
    
    setDados(prev => {
      const novosMeses = prev.meses.map(mes => {
        if (mes.id === prev.mesAtual) {
          return {
            ...mes,
            caixinhas: [...mes.caixinhas, novaCaixinha]
          };
        }
        return mes;
      });
      
      // Adicionar à configuração de divisão automática
      const configuracoes = {
        ...prev.configuracoes,
        divisaoAutomatica: [
          ...prev.configuracoes.divisaoAutomatica,
          { caixinhaId: novaCaixinha.id, percentual: novaCaixinha.percentualPadrao }
        ]
      };
      
      return { ...prev, meses: novosMeses, configuracoes };
    });
  };
  
  // Atualizar caixinha
  const atualizarCaixinha = (id: string, dadosAtualizacao: Partial<Caixinha>) => {
    setDados(prev => {
      const novosMeses = prev.meses.map(mes => {
        if (mes.id === prev.mesAtual) {
          return {
            ...mes,
            caixinhas: mes.caixinhas.map(c => 
              c.id === id ? { ...c, ...dadosAtualizacao } : c
            )
          };
        }
        return mes;
      });
      
      return { ...prev, meses: novosMeses };
    });
  };
  
  // Remover caixinha
  const removerCaixinha = (id: string) => {
    setDados(prev => {
      const novosMeses = prev.meses.map(mes => {
        if (mes.id === prev.mesAtual) {
          return {
            ...mes,
            caixinhas: mes.caixinhas.filter(c => c.id !== id),
            gastos: mes.gastos.filter(g => g.categoria !== id)
          };
        }
        return mes;
      });
      
      const configuracoes = {
        ...prev.configuracoes,
        divisaoAutomatica: prev.configuracoes.divisaoAutomatica.filter(
          d => d.caixinhaId !== id
        )
      };
      
      return { ...prev, meses: novosMeses, configuracoes };
    });
  };
  
  // Atualizar configurações
  const atualizarConfiguracoes = (config: Partial<Configuracoes>) => {
    setDados(prev => ({
      ...prev,
      configuracoes: { ...prev.configuracoes, ...config }
    }));
  };
  
  // Navegar para mês
  const navegarParaMes = (chaveMes: string) => {
    setDados(prev => ({ ...prev, mesAtual: chaveMes }));
  };
  
  // Exportar dados
  const exportarDados = () => {
    const dataStr = JSON.stringify(dados, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `backup-financeiro-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };
  
  // Importar dados
  const importarDados = (novosDados: DadosSistema) => {
    setDados(novosDados);
  };
  
  // Limpar dados
  const limparDados = () => {
    setDados(criarDadosIniciais());
  };
  
  const value: FinanceContextType = {
    dados,
    mesAtual,
    adicionarRenda,
    adicionarGasto,
    removerGasto,
    adicionarCaixinha,
    atualizarCaixinha,
    removerCaixinha,
    atualizarConfiguracoes,
    navegarParaMes,
    exportarDados,
    importarDados,
    limparDados
  };
  
  return (
    <FinanceContext.Provider value={value}>
      {children}
    </FinanceContext.Provider>
  );
};

// Hook personalizado para usar o contexto
export const useFinance = () => {
  const context = useContext(FinanceContext);
  if (!context) {
    throw new Error('useFinance deve ser usado dentro de um FinanceProvider');
  }
  return context;
};
