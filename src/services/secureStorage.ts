/**
 * Secure Storage - Armazenamento Criptografado
 * CORREÇÃO CRÍTICA: Criptografa TODOS os dados no localStorage
 */

import { CryptoService } from './securityService';

export class SecureStorage {
  private static encryptionKey: string | null = null;

  /**
   * Inicializa o storage com chave de criptografia do usuário
   */
  static initialize(userPassword: string, userId: string): void {
    // Derivar chave de criptografia do usuário
    this.encryptionKey = `${userId}:${userPassword}`;
  }

  /**
   * Limpa a chave ao fazer logout
   */
  static clear(): void {
    this.encryptionKey = null;
  }

  /**
   * Salva item criptografado
   */
  static async setItem(key: string, value: any): Promise<void> {
    if (!this.encryptionKey) {
      throw new Error('SecureStorage não inicializado. Faça login primeiro.');
    }

    try {
      const jsonData = JSON.stringify(value);
      const encrypted = await CryptoService.encrypt(jsonData, this.encryptionKey);
      localStorage.setItem(`secure_${key}`, encrypted);
    } catch (error) {
      console.error('Erro ao salvar item criptografado:', error);
      throw error;
    }
  }

  /**
   * Recupera item descriptografado
   */
  static async getItem<T>(key: string): Promise<T | null> {
    if (!this.encryptionKey) {
      throw new Error('SecureStorage não inicializado. Faça login primeiro.');
    }

    try {
      const encrypted = localStorage.getItem(`secure_${key}`);
      if (!encrypted) return null;

      const decrypted = await CryptoService.decrypt(encrypted, this.encryptionKey);
      return JSON.parse(decrypted) as T;
    } catch (error) {
      console.error('Erro ao recuperar item criptografado:', error);
      return null;
    }
  }

  /**
   * Remove item
   */
  static removeItem(key: string): void {
    localStorage.removeItem(`secure_${key}`);
  }

  /**
   * Verifica se item existe
   */
  static hasItem(key: string): boolean {
    return localStorage.getItem(`secure_${key}`) !== null;
  }

  /**
   * Salva item NÃO criptografado (apenas para dados públicos)
   */
  static setPublicItem(key: string, value: any): void {
    localStorage.setItem(`public_${key}`, JSON.stringify(value));
  }

  /**
   * Recupera item NÃO criptografado
   */
  static getPublicItem<T>(key: string): T | null {
    try {
      const data = localStorage.getItem(`public_${key}`);
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  }
}
