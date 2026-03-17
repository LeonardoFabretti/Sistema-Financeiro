/**
 * Serviço de Auditoria e Logs
 * Registra todas as ações importantes para compliance e segurança
 */

import { CryptoService } from './securityService';

export enum AuditAction {
  // Autenticação
  LOGIN_SUCCESS = 'LOGIN_SUCCESS',
  LOGIN_FAILED = 'LOGIN_FAILED',
  LOGOUT = 'LOGOUT',
  PASSWORD_CHANGED = 'PASSWORD_CHANGED',
  ACCOUNT_LOCKED = 'ACCOUNT_LOCKED',
  
  // Operações Financeiras
  RENDA_ADDED = 'RENDA_ADDED',
  GASTO_ADDED = 'GASTO_ADDED',
  GASTO_REMOVED = 'GASTO_REMOVED',
  CAIXINHA_CREATED = 'CAIXINHA_CREATED',
  CAIXINHA_UPDATED = 'CAIXINHA_UPDATED',
  CAIXINHA_REMOVED = 'CAIXINHA_REMOVED',
  
  // Dados
  DATA_EXPORTED = 'DATA_EXPORTED',
  DATA_IMPORTED = 'DATA_IMPORTED',
  DATA_CLEARED = 'DATA_CLEARED',
  BACKUP_CREATED = 'BACKUP_CREATED',
  BACKUP_RESTORED = 'BACKUP_RESTORED',
  
  // Segurança
  SUSPICIOUS_ACTIVITY = 'SUSPICIOUS_ACTIVITY',
  RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED',
  INVALID_SESSION = 'INVALID_SESSION',
  
  // LGPD
  DATA_ACCESS = 'DATA_ACCESS',
  DATA_DELETION_REQUEST = 'DATA_DELETION_REQUEST',
  CONSENT_GIVEN = 'CONSENT_GIVEN',
  CONSENT_REVOKED = 'CONSENT_REVOKED'
}

export interface AuditLog {
  id: string;
  timestamp: number;
  action: AuditAction;
  userId: string;
  userEmail?: string;
  details: string;
  ipAddress?: string;
  userAgent?: string;
  severity: 'info' | 'warning' | 'error' | 'critical';
  metadata?: Record<string, any>;
}

export class AuditService {
  private static readonly STORAGE_KEY = 'audit_logs';
  private static readonly MAX_LOGS = 1000; // Manter apenas os últimos 1000 logs
  private static readonly LOG_RETENTION_DAYS = 90; // Manter logs por 90 dias

  /**
   * Registra uma ação no log de auditoria
   */
  static async log(
    action: AuditAction,
    userId: string,
    details: string,
    severity: 'info' | 'warning' | 'error' | 'critical' = 'info',
    metadata?: Record<string, any>
  ): Promise<void> {
    try {
      const log: AuditLog = {
        id: CryptoService.generateSecureToken(16),
        timestamp: Date.now(),
        action,
        userId,
        details,
        severity,
        metadata,
        ipAddress: await this.getClientIP(),
        userAgent: navigator.userAgent
      };

      const logs = await this.getLogs();
      logs.unshift(log); // Adicionar no início

      // Limpar logs antigos
      const filteredLogs = this.cleanOldLogs(logs);

      // Salvar
      await this.saveLogs(filteredLogs);

      // Se for crítico, também logar no console
      if (severity === 'critical' || severity === 'error') {
        console.error(`[AUDIT ${severity.toUpperCase()}]`, {
          action,
          userId,
          details,
          metadata
        });
      }
    } catch (error) {
      console.error('Erro ao registrar log de auditoria:', error);
    }
  }

  /**
   * Obtém logs de auditoria
   */
  static async getLogs(filter?: {
    userId?: string;
    action?: AuditAction;
    startDate?: number;
    endDate?: number;
    severity?: string;
  }): Promise<AuditLog[]> {
    try {
      const logsJson = localStorage.getItem(this.STORAGE_KEY);
      if (!logsJson) return [];

      let logs: AuditLog[] = JSON.parse(logsJson);

      // Aplicar filtros
      if (filter) {
        if (filter.userId) {
          logs = logs.filter(log => log.userId === filter.userId);
        }
        if (filter.action) {
          logs = logs.filter(log => log.action === filter.action);
        }
        if (filter.startDate) {
          logs = logs.filter(log => log.timestamp >= filter.startDate!);
        }
        if (filter.endDate) {
          logs = logs.filter(log => log.timestamp <= filter.endDate!);
        }
        if (filter.severity) {
          logs = logs.filter(log => log.severity === filter.severity);
        }
      }

      return logs;
    } catch (error) {
      console.error('Erro ao obter logs:', error);
      return [];
    }
  }

  /**
   * Exporta logs para arquivo
   */
  static async exportLogs(filter?: any): Promise<void> {
    try {
      const logs = await this.getLogs(filter);
      const dataStr = JSON.stringify(logs, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `audit_logs_${new Date().toISOString().split('T')[0]}.json`;
      link.click();
      
      URL.revokeObjectURL(url);

      await this.log(
        AuditAction.DATA_EXPORTED,
        'system',
        'Logs de auditoria exportados'
      );
    } catch (error) {
      console.error('Erro ao exportar logs:', error);
      throw error;
    }
  }

  /**
   * Limpa logs antigos
   */
  private static cleanOldLogs(logs: AuditLog[]): AuditLog[] {
    const cutoffDate = Date.now() - (this.LOG_RETENTION_DAYS * 24 * 60 * 60 * 1000);
    
    // Filtrar por data e manter máximo de logs
    return logs
      .filter(log => log.timestamp > cutoffDate)
      .slice(0, this.MAX_LOGS);
  }

  /**
   * Salva logs
   */
  private static async saveLogs(logs: AuditLog[]): Promise<void> {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(logs));
    } catch (error) {
      // Se localStorage estiver cheio, remover logs mais antigos
      const reducedLogs = logs.slice(0, Math.floor(this.MAX_LOGS / 2));
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(reducedLogs));
    }
  }

  /**
   * Obtém IP do cliente (simulado - em produção usar backend)
   */
  private static async getClientIP(): Promise<string> {
    try {
      // Em produção, isso seria obtido do backend
      return 'unknown';
    } catch {
      return 'unknown';
    }
  }

  /**
   * Gera relatório de auditoria
   */
  static async generateReport(startDate: number, endDate: number): Promise<{
    totalActions: number;
    actionsByType: Record<string, number>;
    actionsByUser: Record<string, number>;
    actionsBySeverity: Record<string, number>;
    suspiciousActivities: AuditLog[];
  }> {
    const logs = await this.getLogs({ startDate, endDate });

    const report = {
      totalActions: logs.length,
      actionsByType: {} as Record<string, number>,
      actionsByUser: {} as Record<string, number>,
      actionsBySeverity: {} as Record<string, number>,
      suspiciousActivities: logs.filter(log => 
        log.action === AuditAction.SUSPICIOUS_ACTIVITY ||
        log.action === AuditAction.RATE_LIMIT_EXCEEDED ||
        log.severity === 'critical'
      )
    };

    // Contar por tipo
    logs.forEach(log => {
      report.actionsByType[log.action] = (report.actionsByType[log.action] || 0) + 1;
      report.actionsByUser[log.userId] = (report.actionsByUser[log.userId] || 0) + 1;
      report.actionsBySeverity[log.severity] = (report.actionsBySeverity[log.severity] || 0) + 1;
    });

    return report;
  }

  /**
   * Limpa todos os logs (apenas para administradores)
   */
  static async clearAllLogs(userId: string): Promise<void> {
    await this.log(
      AuditAction.DATA_CLEARED,
      userId,
      'Todos os logs de auditoria foram limpos',
      'warning'
    );
    
    localStorage.removeItem(this.STORAGE_KEY);
  }
}
