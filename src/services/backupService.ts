/**
 * Serviço de Backup e Recuperação
 * Sistema de backup automático com criptografia
 */

import { CryptoService } from './securityService';
import { AuditService, AuditAction } from './auditService';
import { DadosSistema } from '../types';

export interface Backup {
  id: string;
  timestamp: number;
  userId: string;
  encrypted: boolean;
  data: string; // Dados criptografados
  checksum: string; // Para verificar integridade
  version: string;
  size: number;
}

export class BackupService {
  private static readonly BACKUPS_KEY = 'sistema_backups';
  private static readonly MAX_BACKUPS = 10;
  private static readonly AUTO_BACKUP_INTERVAL = 24 * 60 * 60 * 1000; // 24 horas
  private static readonly VERSION = '1.0.0';

  /**
   * Cria backup criptografado dos dados
   */
  static async createBackup(
    dados: DadosSistema,
    userId: string,
    password: string
  ): Promise<{ success: boolean; backupId?: string; error?: string }> {
    try {
      const dataJson = JSON.stringify(dados);
      
      // Criptografar dados
      const encryptedData = await CryptoService.encrypt(dataJson, password);
      
      // Gerar checksum para verificação de integridade
      const { hash: checksum } = await CryptoService.hashPassword(dataJson);

      const backup: Backup = {
        id: CryptoService.generateSecureToken(16),
        timestamp: Date.now(),
        userId,
        encrypted: true,
        data: encryptedData,
        checksum,
        version: this.VERSION,
        size: new Blob([encryptedData]).size
      };

      // Salvar backup
      const backups = await this.getBackups(userId);
      backups.unshift(backup);

      // Manter apenas os últimos N backups
      const limitedBackups = backups.slice(0, this.MAX_BACKUPS);
      await this.saveBackups(userId, limitedBackups);

      // Log de auditoria
      await AuditService.log(
        AuditAction.BACKUP_CREATED,
        userId,
        `Backup criado: ${backup.id}`,
        'info',
        { backupId: backup.id, size: backup.size }
      );

      return { success: true, backupId: backup.id };
    } catch (error) {
      console.error('Erro ao criar backup:', error);
      await AuditService.log(
        AuditAction.SUSPICIOUS_ACTIVITY,
        userId,
        'Erro ao criar backup',
        'error'
      );
      return { success: false, error: 'Erro ao criar backup' };
    }
  }

  /**
   * Restaura dados de um backup
   */
  static async restoreBackup(
    backupId: string,
    userId: string,
    password: string
  ): Promise<{ success: boolean; data?: DadosSistema; error?: string }> {
    try {
      const backups = await this.getBackups(userId);
      const backup = backups.find(b => b.id === backupId);

      if (!backup) {
        return { success: false, error: 'Backup não encontrado' };
      }

      // Descriptografar dados
      const decryptedData = await CryptoService.decrypt(backup.data, password);
      const dados: DadosSistema = JSON.parse(decryptedData);

      // Verificar integridade
      const { hash: checksum } = await CryptoService.hashPassword(decryptedData);
      if (checksum !== backup.checksum) {
        await AuditService.log(
          AuditAction.SUSPICIOUS_ACTIVITY,
          userId,
          'Backup corrompido detectado',
          'critical',
          { backupId }
        );
        return { success: false, error: 'Backup corrompido' };
      }

      // Log de auditoria
      await AuditService.log(
        AuditAction.BACKUP_RESTORED,
        userId,
        `Backup restaurado: ${backupId}`,
        'info',
        { backupId }
      );

      return { success: true, data: dados };
    } catch (error) {
      console.error('Erro ao restaurar backup:', error);
      return { success: false, error: 'Erro ao restaurar backup - senha incorreta ou dados corrompidos' };
    }
  }

  /**
   * Lista backups disponíveis
   */
  static async listBackups(userId: string): Promise<Array<{
    id: string;
    timestamp: number;
    size: number;
    version: string;
  }>> {
    try {
      const backups = await this.getBackups(userId);
      return backups.map(b => ({
        id: b.id,
        timestamp: b.timestamp,
        size: b.size,
        version: b.version
      }));
    } catch (error) {
      console.error('Erro ao listar backups:', error);
      return [];
    }
  }

  /**
   * Remove backup específico
   */
  static async deleteBackup(backupId: string, userId: string): Promise<boolean> {
    try {
      const backups = await this.getBackups(userId);
      const filteredBackups = backups.filter(b => b.id !== backupId);
      
      await this.saveBackups(userId, filteredBackups);

      await AuditService.log(
        AuditAction.DATA_CLEARED,
        userId,
        `Backup removido: ${backupId}`,
        'info'
      );

      return true;
    } catch (error) {
      console.error('Erro ao remover backup:', error);
      return false;
    }
  }

  /**
   * Verifica se é necessário criar backup automático
   */
  static shouldCreateAutoBackup(userId: string): boolean {
    try {
      const lastBackupKey = `last_backup_${userId}`;
      const lastBackup = localStorage.getItem(lastBackupKey);
      
      if (!lastBackup) return true;

      const lastBackupTime = parseInt(lastBackup);
      return Date.now() - lastBackupTime > this.AUTO_BACKUP_INTERVAL;
    } catch {
      return true;
    }
  }

  /**
   * Registra criação de backup automático
   */
  static recordAutoBackup(userId: string): void {
    const lastBackupKey = `last_backup_${userId}`;
    localStorage.setItem(lastBackupKey, Date.now().toString());
  }

  /**
   * Exporta backup para arquivo
   */
  static async exportBackup(backupId: string, userId: string): Promise<void> {
    try {
      const backups = await this.getBackups(userId);
      const backup = backups.find(b => b.id === backupId);

      if (!backup) {
        throw new Error('Backup não encontrado');
      }

      const backupData = JSON.stringify(backup, null, 2);
      const blob = new Blob([backupData], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = `backup_${new Date(backup.timestamp).toISOString().split('T')[0]}_${backupId.substring(0, 8)}.json`;
      link.click();
      
      URL.revokeObjectURL(url);

      await AuditService.log(
        AuditAction.DATA_EXPORTED,
        userId,
        `Backup exportado: ${backupId}`,
        'info'
      );
    } catch (error) {
      console.error('Erro ao exportar backup:', error);
      throw error;
    }
  }

  /**
   * Importa backup de arquivo
   */
  static async importBackup(
    file: File,
    userId: string
  ): Promise<{ success: boolean; backupId?: string; error?: string }> {
    return new Promise((resolve) => {
      const reader = new FileReader();
      
      reader.onload = async (event) => {
        try {
          const backupData = JSON.parse(event.target?.result as string) as Backup;
          
          // Validar estrutura
          if (!backupData.id || !backupData.data || !backupData.checksum) {
            resolve({ success: false, error: 'Arquivo de backup inválido' });
            return;
          }

          // Adicionar aos backups
          const backups = await this.getBackups(userId);
          backups.unshift(backupData);
          await this.saveBackups(userId, backups.slice(0, this.MAX_BACKUPS));

          await AuditService.log(
            AuditAction.DATA_IMPORTED,
            userId,
            `Backup importado: ${backupData.id}`,
            'info'
          );

          resolve({ success: true, backupId: backupData.id });
        } catch (error) {
          console.error('Erro ao importar backup:', error);
          resolve({ success: false, error: 'Erro ao processar arquivo de backup' });
        }
      };

      reader.onerror = () => {
        resolve({ success: false, error: 'Erro ao ler arquivo' });
      };

      reader.readAsText(file);
    });
  }

  /**
   * Obtém backups do localStorage
   */
  private static async getBackups(userId: string): Promise<Backup[]> {
    try {
      const key = `${this.BACKUPS_KEY}_${userId}`;
      const backupsJson = localStorage.getItem(key);
      return backupsJson ? JSON.parse(backupsJson) : [];
    } catch (error) {
      console.error('Erro ao obter backups:', error);
      return [];
    }
  }

  /**
   * Salva backups no localStorage
   */
  private static async saveBackups(userId: string, backups: Backup[]): Promise<void> {
    try {
      const key = `${this.BACKUPS_KEY}_${userId}`;
      localStorage.setItem(key, JSON.stringify(backups));
    } catch (error) {
      console.error('Erro ao salvar backups:', error);
      throw error;
    }
  }
}
