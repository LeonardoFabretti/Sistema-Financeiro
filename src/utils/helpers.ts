// Utilitários e funções auxiliares

/**
 * Formata valor para moeda brasileira
 */
export const formatarMoeda = (valor: number): string => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(valor);
};

/**
 * Formata data para exibição
 */
export const formatarData = (data: string): string => {
  const date = new Date(data);
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  }).format(date);
};

/**
 * Formata data para exibição curta (ex: 17/12)
 */
export const formatarDataCurta = (data: string): string => {
  const date = new Date(data);
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit'
  }).format(date);
};

/**
 * Gera ID único
 */
export const gerarId = (): string => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * Obtém chave do mês atual (formato: YYYY-MM)
 */
export const obterChaveMesAtual = (): string => {
  const agora = new Date();
  const ano = agora.getFullYear();
  const mes = String(agora.getMonth() + 1).padStart(2, '0');
  return `${ano}-${mes}`;
};

/**
 * Obtém nome do mês em português
 */
export const obterNomeMes = (mes: number): string => {
  const meses = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];
  return meses[mes - 1] || '';
};

/**
 * Calcula porcentagem
 */
export const calcularPercentual = (valor: number, total: number): number => {
  if (total === 0) return 0;
  return (valor / total) * 100;
};

/**
 * Valida se a data está no mês atual
 */
export const estaNoMesAtual = (data: string): boolean => {
  const dataObj = new Date(data);
  const agora = new Date();
  return dataObj.getMonth() === agora.getMonth() && 
         dataObj.getFullYear() === agora.getFullYear();
};

/**
 * Obtém primeiro e último dia do mês
 */
export const obterRangeDoMes = (ano: number, mes: number) => {
  const primeiroDia = new Date(ano, mes - 1, 1);
  const ultimoDia = new Date(ano, mes, 0);
  return { primeiroDia, ultimoDia };
};

/**
 * Exporta dados para JSON (backup)
 */
export const exportarParaJSON = (dados: any, nomeArquivo: string) => {
  const dataStr = JSON.stringify(dados, null, 2);
  const blob = new Blob([dataStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${nomeArquivo}.json`;
  link.click();
  URL.revokeObjectURL(url);
};

/**
 * Exporta dados para CSV
 */
export const exportarParaCSV = (dados: any[], nomeArquivo: string) => {
  if (dados.length === 0) return;
  
  const headers = Object.keys(dados[0]);
  const csv = [
    headers.join(','),
    ...dados.map(row => headers.map(header => {
      const value = row[header];
      return typeof value === 'string' && value.includes(',') 
        ? `"${value}"` 
        : value;
    }).join(','))
  ].join('\n');
  
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${nomeArquivo}.csv`;
  link.click();
  URL.revokeObjectURL(url);
};
