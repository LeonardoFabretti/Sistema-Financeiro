/**
 * Validador de Schema para Imports
 * CORREÇÃO: Valida estrutura de dados importados para prevenir injection
 */

import { DadosSistema } from '../types';

export class SchemaValidator {
  /**
   * Valida estrutura de dados do sistema
   */
  static validateSystemData(data: any): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Verificar se é objeto
    if (typeof data !== 'object' || data === null) {
      errors.push('Dados devem ser um objeto');
      return { valid: false, errors };
    }

    // Verificar prototype pollution
    if ('__proto__' in data || 'constructor' in data || 'prototype' in data) {
      errors.push('Tentativa de prototype pollution detectada');
      return { valid: false, errors };
    }

    // Validar propriedades obrigatórias
    if (!Array.isArray(data.meses)) {
      errors.push('Propriedade "meses" deve ser um array');
    }

    if (typeof data.mesAtual !== 'string') {
      errors.push('Propriedade "mesAtual" deve ser uma string');
    }

    if (typeof data.configuracoes !== 'object') {
      errors.push('Propriedade "configuracoes" deve ser um objeto');
    }

    if (typeof data.versao !== 'string') {
      errors.push('Propriedade "versao" deve ser uma string');
    }

    // Validar cada mês
    if (Array.isArray(data.meses)) {
      data.meses.forEach((mes: any, index: number) => {
        if (!this.validateMes(mes)) {
          errors.push(`Mês ${index} inválido`);
        }
      });
    }

    // Limitar tamanho
    const jsonSize = JSON.stringify(data).length;
    if (jsonSize > 50 * 1024 * 1024) { // 50MB
      errors.push('Arquivo muito grande (máximo 50MB)');
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  /**
   * Valida estrutura de um mês
   */
  private static validateMes(mes: any): boolean {
    if (typeof mes !== 'object' || mes === null) return false;
    
    // Verificar propriedades necessárias
    if (typeof mes.id !== 'string') return false;
    if (typeof mes.mes !== 'number' || mes.mes < 1 || mes.mes > 12) return false;
    if (typeof mes.ano !== 'number' || mes.ano < 2000 || mes.ano > 2100) return false;
    if (!Array.isArray(mes.rendas)) return false;
    if (!Array.isArray(mes.gastos)) return false;
    if (!Array.isArray(mes.caixinhas)) return false;
    if (typeof mes.resumo !== 'object') return false;

    return true;
  }

  /**
   * Sanitiza dados importados
   */
  static sanitizeData(data: any): DadosSistema {
    // Remover propriedades perigosas
    const clean: any = {};
    
    const allowedProps = ['meses', 'mesAtual', 'configuracoes', 'versao'];
    for (const prop of allowedProps) {
      if (prop in data) {
        clean[prop] = data[prop];
      }
    }

    // Sanitizar arrays
    if (Array.isArray(clean.meses)) {
      clean.meses = clean.meses.map((mes: any) => this.sanitizeMes(mes));
    }

    return clean as DadosSistema;
  }

  /**
   * Sanitiza um mês
   */
  private static sanitizeMes(mes: any): any {
    const allowedProps = ['id', 'mes', 'ano', 'rendas', 'gastos', 'caixinhas', 'resumo'];
    const clean: any = {};
    
    for (const prop of allowedProps) {
      if (prop in mes) {
        clean[prop] = mes[prop];
      }
    }

    // Sanitizar strings em arrays
    if (Array.isArray(clean.gastos)) {
      clean.gastos = clean.gastos.map((g: any) => ({
        ...g,
        descricao: this.sanitizeString(g.descricao)
      }));
    }

    if (Array.isArray(clean.rendas)) {
      clean.rendas = clean.rendas.map((r: any) => ({
        ...r,
        descricao: this.sanitizeString(r.descricao)
      }));
    }

    return clean;
  }

  /**
   * Sanitiza string para prevenir XSS
   */
  private static sanitizeString(str: any): string {
    if (typeof str !== 'string') return '';
    
    const map: { [key: string]: string } = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#x27;',
      '/': '&#x2F;'
    };
    
    return str.replace(/[&<>"'/]/g, (match) => map[match]);
  }
}
