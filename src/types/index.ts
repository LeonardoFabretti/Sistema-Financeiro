// Tipos principais do sistema
export interface Caixinha {
  id: string;
  nome: string;
  cor: string;
  saldo: number;
  percentualPadrao: number; // Porcentagem que recebe automaticamente da renda
  historico: Movimentacao[];
}

export interface Renda {
  id: string;
  valor: number;
  data: string;
  descricao: string;
  frequencia: 'semanal' | 'mensal' | 'quinzenal' | 'unica';
  divisaoAutomatica: boolean;
}

export interface Gasto {
  id: string;
  valor: number;
  categoria: string; // ID da caixinha
  descricao: string;
  data: string;
}

export interface Movimentacao {
  id: string;
  tipo: 'entrada' | 'saida';
  valor: number;
  descricao: string;
  data: string;
  origem?: string; // Para transferências entre caixinhas
}

export interface ConfiguracaoDivisao {
  caixinhaId: string;
  percentual: number;
}

export interface MesFinanceiro {
  id: string;
  mes: number; // 1-12
  ano: number;
  rendas: Renda[];
  gastos: Gasto[];
  caixinhas: Caixinha[];
  resumo: ResumoMensal;
}

export interface ResumoMensal {
  totalRecebido: number;
  totalGasto: number;
  totalEconomizado: number;
  categoriaComMaisGasto: {
    nome: string;
    valor: number;
  };
  comparacaoMesAnterior: {
    gastouMais: boolean;
    diferenca: number;
    percentual: number;
  };
}

export interface Configuracoes {
  divisaoAutomatica: ConfiguracaoDivisao[];
  moeda: string;
  tema: 'claro' | 'escuro' | 'auto';
  notificacoes: boolean;
}

export interface DadosSistema {
  meses: MesFinanceiro[];
  mesAtual: string; // formato: "YYYY-MM"
  configuracoes: Configuracoes;
  versao: string;
}
