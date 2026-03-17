/**
 * Serviço de Compliance e LGPD
 * Gerencia consentimentos, privacidade e conformidade com a LGPD
 */

import { AuditService, AuditAction } from './auditService';
import { CryptoService } from './securityService';

export interface UserConsent {
  userId: string;
  timestamp: number;
  termsVersion: string;
  privacyVersion: string;
  dataProcessingConsent: boolean;
  marketingConsent: boolean;
  dataShareConsent: boolean;
  ipAddress?: string;
}

export interface DataAccessRequest {
  id: string;
  userId: string;
  requestDate: number;
  status: 'pending' | 'completed' | 'rejected';
  completedDate?: number;
  dataExported?: string;
}

export interface DataDeletionRequest {
  id: string;
  userId: string;
  requestDate: number;
  status: 'pending' | 'completed' | 'rejected';
  reason?: string;
  completedDate?: number;
}

export class ComplianceService {
  private static readonly CONSENT_KEY = 'user_consents';
  private static readonly ACCESS_REQUESTS_KEY = 'data_access_requests';
  private static readonly DELETION_REQUESTS_KEY = 'data_deletion_requests';
  private static readonly TERMS_VERSION = '1.0.0';
  private static readonly PRIVACY_VERSION = '1.0.0';

  /**
   * Registra consentimento do usuário
   */
  static async recordConsent(
    userId: string,
    dataProcessingConsent: boolean,
    marketingConsent: boolean = false,
    dataShareConsent: boolean = false
  ): Promise<void> {
    try {
      const consent: UserConsent = {
        userId,
        timestamp: Date.now(),
        termsVersion: this.TERMS_VERSION,
        privacyVersion: this.PRIVACY_VERSION,
        dataProcessingConsent,
        marketingConsent,
        dataShareConsent,
        ipAddress: 'unknown' // Em produção, obter do backend
      };

      const consents = await this.getConsents();
      consents.push(consent);
      await this.saveConsents(consents);

      await AuditService.log(
        AuditAction.CONSENT_GIVEN,
        userId,
        'Consentimento registrado',
        'info',
        { consent }
      );
    } catch (error) {
      console.error('Erro ao registrar consentimento:', error);
      throw error;
    }
  }

  /**
   * Revoga consentimento
   */
  static async revokeConsent(userId: string): Promise<void> {
    try {
      await AuditService.log(
        AuditAction.CONSENT_REVOKED,
        userId,
        'Consentimento revogado',
        'warning'
      );

      // Em produção, implementar lógica de desativação de conta
      // ou limitação de funcionalidades
    } catch (error) {
      console.error('Erro ao revogar consentimento:', error);
      throw error;
    }
  }

  /**
   * Obtém consentimento atual do usuário
   */
  static async getUserConsent(userId: string): Promise<UserConsent | null> {
    try {
      const consents = await this.getConsents();
      const userConsents = consents
        .filter(c => c.userId === userId)
        .sort((a, b) => b.timestamp - a.timestamp);

      return userConsents[0] || null;
    } catch (error) {
      console.error('Erro ao obter consentimento:', error);
      return null;
    }
  }

  /**
   * Verifica se usuário tem consentimento válido
   */
  static async hasValidConsent(userId: string): Promise<boolean> {
    const consent = await this.getUserConsent(userId);
    
    if (!consent) return false;

    // Verificar se as versões dos termos mudaram
    return (
      consent.termsVersion === this.TERMS_VERSION &&
      consent.privacyVersion === this.PRIVACY_VERSION &&
      consent.dataProcessingConsent === true
    );
  }

  /**
   * Solicita acesso aos dados (Direito de Portabilidade - LGPD Art. 18)
   */
  static async requestDataAccess(userId: string): Promise<string> {
    try {
      const request: DataAccessRequest = {
        id: CryptoService.generateSecureToken(16),
        userId,
        requestDate: Date.now(),
        status: 'pending'
      };

      const requests = await this.getAccessRequests();
      requests.push(request);
      await this.saveAccessRequests(requests);

      await AuditService.log(
        AuditAction.DATA_ACCESS,
        userId,
        'Solicitação de acesso aos dados',
        'info',
        { requestId: request.id }
      );

      return request.id;
    } catch (error) {
      console.error('Erro ao solicitar acesso aos dados:', error);
      throw error;
    }
  }

  /**
   * Processa solicitação de acesso aos dados
   */
  static async processDataAccessRequest(
    requestId: string,
    userData: any
  ): Promise<void> {
    try {
      const requests = await this.getAccessRequests();
      const request = requests.find(r => r.id === requestId);

      if (!request) {
        throw new Error('Solicitação não encontrada');
      }

      request.status = 'completed';
      request.completedDate = Date.now();
      request.dataExported = JSON.stringify(userData, null, 2);

      await this.saveAccessRequests(requests);

      await AuditService.log(
        AuditAction.DATA_EXPORTED,
        request.userId,
        'Solicitação de acesso processada',
        'info',
        { requestId }
      );
    } catch (error) {
      console.error('Erro ao processar solicitação:', error);
      throw error;
    }
  }

  /**
   * Solicita exclusão dos dados (Direito ao Esquecimento - LGPD Art. 18)
   */
  static async requestDataDeletion(
    userId: string,
    reason?: string
  ): Promise<string> {
    try {
      const request: DataDeletionRequest = {
        id: CryptoService.generateSecureToken(16),
        userId,
        requestDate: Date.now(),
        status: 'pending',
        reason
      };

      const requests = await this.getDeletionRequests();
      requests.push(request);
      await this.saveDeletionRequests(requests);

      await AuditService.log(
        AuditAction.DATA_DELETION_REQUEST,
        userId,
        'Solicitação de exclusão de dados',
        'warning',
        { requestId: request.id, reason }
      );

      return request.id;
    } catch (error) {
      console.error('Erro ao solicitar exclusão:', error);
      throw error;
    }
  }

  /**
   * Processa solicitação de exclusão de dados
   */
  static async processDataDeletionRequest(requestId: string): Promise<void> {
    try {
      const requests = await this.getDeletionRequests();
      const request = requests.find(r => r.id === requestId);

      if (!request) {
        throw new Error('Solicitação não encontrada');
      }

      request.status = 'completed';
      request.completedDate = Date.now();

      await this.saveDeletionRequests(requests);

      await AuditService.log(
        AuditAction.DATA_CLEARED,
        request.userId,
        'Dados do usuário excluídos conforme solicitação',
        'warning',
        { requestId }
      );

      // Em produção, implementar remoção completa dos dados
    } catch (error) {
      console.error('Erro ao processar exclusão:', error);
      throw error;
    }
  }

  /**
   * Gera relatório de conformidade LGPD
   */
  static async generateComplianceReport(userId: string): Promise<{
    consent: UserConsent | null;
    accessRequests: DataAccessRequest[];
    deletionRequests: DataDeletionRequest[];
    auditSummary: any;
  }> {
    try {
      const consent = await this.getUserConsent(userId);
      const accessRequests = (await this.getAccessRequests())
        .filter(r => r.userId === userId);
      const deletionRequests = (await this.getDeletionRequests())
        .filter(r => r.userId === userId);
      
      const auditSummary = await AuditService.generateReport(
        Date.now() - 90 * 24 * 60 * 60 * 1000, // Últimos 90 dias
        Date.now()
      );

      return {
        consent,
        accessRequests,
        deletionRequests,
        auditSummary
      };
    } catch (error) {
      console.error('Erro ao gerar relatório:', error);
      throw error;
    }
  }

  /**
   * Exporta dados do usuário para portabilidade
   */
  static async exportUserData(userId: string, userData: any): Promise<void> {
    try {
      const exportData = {
        userId,
        exportDate: new Date().toISOString(),
        termsVersion: this.TERMS_VERSION,
        privacyVersion: this.PRIVACY_VERSION,
        data: userData,
        consent: await this.getUserConsent(userId)
      };

      const dataStr = JSON.stringify(exportData, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `meus_dados_${new Date().toISOString().split('T')[0]}.json`;
      link.click();
      
      URL.revokeObjectURL(url);

      await AuditService.log(
        AuditAction.DATA_EXPORTED,
        userId,
        'Dados do usuário exportados (Portabilidade LGPD)',
        'info'
      );
    } catch (error) {
      console.error('Erro ao exportar dados:', error);
      throw error;
    }
  }

  /**
   * Obtém texto dos termos de uso
   */
  static getTermsOfService(): string {
    return `
# Termos de Uso - Sistema Financeiro
Versão: ${this.TERMS_VERSION}

## 1. Aceitação dos Termos
Ao usar este sistema, você concorda com estes termos.

## 2. Uso do Serviço
Este sistema é fornecido para gestão financeira pessoal.

## 3. Responsabilidades do Usuário
- Manter credenciais seguras
- Não compartilhar acesso com terceiros
- Usar o sistema de forma legal e ética

## 4. Limitações de Responsabilidade
O sistema é fornecido "como está", sem garantias.

## 5. Modificações
Podemos atualizar estes termos periodicamente.
    `.trim();
  }

  /**
   * Obtém política de privacidade
   */
  static getPrivacyPolicy(): string {
    return `
# Política de Privacidade - Sistema Financeiro
Versão: ${this.PRIVACY_VERSION}
Última atualização: ${new Date().toLocaleDateString('pt-BR')}

## 1. Coleta de Dados (LGPD Art. 7)
Coletamos:
- Dados de cadastro (nome, email)
- Dados financeiros (rendas, gastos, caixinhas)
- Dados de uso (logs de auditoria)

## 2. Base Legal (LGPD Art. 7, I)
O processamento é baseado no seu consentimento expresso.

## 3. Finalidade (LGPD Art. 6, I)
Os dados são usados exclusivamente para:
- Fornecimento do serviço de gestão financeira
- Segurança e prevenção de fraudes
- Melhorias no sistema

## 4. Armazenamento e Segurança (LGPD Art. 46)
- Dados criptografados com AES-256
- Armazenamento local no navegador
- Backups criptografados

## 5. Seus Direitos (LGPD Art. 18)
Você tem direito a:
- Confirmar existência de tratamento de dados
- Acessar seus dados
- Corrigir dados incompletos ou inexatos
- Solicitar anonimização, bloqueio ou eliminação
- Portabilidade dos dados
- Revogar consentimento

## 6. Retenção de Dados
Mantemos seus dados enquanto sua conta estiver ativa ou conforme necessário para cumprimento legal.

## 7. Compartilhamento (LGPD Art. 7, VII)
Não compartilhamos seus dados com terceiros sem seu consentimento.

## 8. Contato
Para exercer seus direitos, entre em contato através do sistema.

## 9. Mudanças nesta Política
Notificaremos sobre mudanças significativas.
    `.trim();
  }

  // Métodos auxiliares de armazenamento
  private static async getConsents(): Promise<UserConsent[]> {
    try {
      const json = localStorage.getItem(this.CONSENT_KEY);
      return json ? JSON.parse(json) : [];
    } catch {
      return [];
    }
  }

  private static async saveConsents(consents: UserConsent[]): Promise<void> {
    localStorage.setItem(this.CONSENT_KEY, JSON.stringify(consents));
  }

  private static async getAccessRequests(): Promise<DataAccessRequest[]> {
    try {
      const json = localStorage.getItem(this.ACCESS_REQUESTS_KEY);
      return json ? JSON.parse(json) : [];
    } catch {
      return [];
    }
  }

  private static async saveAccessRequests(requests: DataAccessRequest[]): Promise<void> {
    localStorage.setItem(this.ACCESS_REQUESTS_KEY, JSON.stringify(requests));
  }

  private static async getDeletionRequests(): Promise<DataDeletionRequest[]> {
    try {
      const json = localStorage.getItem(this.DELETION_REQUESTS_KEY);
      return json ? JSON.parse(json) : [];
    } catch {
      return [];
    }
  }

  private static async saveDeletionRequests(requests: DataDeletionRequest[]): Promise<void> {
    localStorage.setItem(this.DELETION_REQUESTS_KEY, JSON.stringify(requests));
  }
}
