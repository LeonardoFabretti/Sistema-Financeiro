/**
 * Serviço de Segurança de Nível Empresarial
 * Implementa criptografia, validação e proteções contra ataques
 */

// Classe para gerenciar criptografia de dados sensíveis
export class CryptoService {
  private static readonly ALGORITHM = 'AES-GCM';
  private static readonly KEY_LENGTH = 256;
  private static readonly SALT_LENGTH = 16;
  private static readonly IV_LENGTH = 12;

  /**
   * Gera uma chave de criptografia a partir de uma senha
   */
  private static async deriveKey(password: string, salt: Uint8Array): Promise<CryptoKey> {
    const encoder = new TextEncoder();
    const passwordBuffer = encoder.encode(password);

    const keyMaterial = await crypto.subtle.importKey(
      'raw',
      passwordBuffer,
      'PBKDF2',
      false,
      ['deriveKey']
    );

    return crypto.subtle.deriveKey(
      {
        name: 'PBKDF2',
        salt: salt as BufferSource,
        iterations: 100000,
        hash: 'SHA-256'
      },
      keyMaterial,
      {
        name: this.ALGORITHM,
        length: this.KEY_LENGTH
      },
      false,
      ['encrypt', 'decrypt']
    );
  }

  /**
   * Criptografa dados sensíveis
   */
  static async encrypt(data: string, password: string): Promise<string> {
    try {
      const encoder = new TextEncoder();
      const dataBuffer = encoder.encode(data);

      // Gerar salt e IV aleatórios
      const salt = crypto.getRandomValues(new Uint8Array(this.SALT_LENGTH));
      const iv = crypto.getRandomValues(new Uint8Array(this.IV_LENGTH));

      // Derivar chave
      const key = await this.deriveKey(password, salt);

      // Criptografar
      const encryptedData = await crypto.subtle.encrypt(
        {
          name: this.ALGORITHM,
          iv
        },
        key,
        dataBuffer
      );

      // Combinar salt + iv + dados criptografados
      const result = new Uint8Array(salt.length + iv.length + encryptedData.byteLength);
      result.set(salt, 0);
      result.set(iv, salt.length);
      result.set(new Uint8Array(encryptedData), salt.length + iv.length);

      // Converter para Base64
      return this.arrayBufferToBase64(result);
    } catch (error) {
      console.error('Erro ao criptografar dados:', error);
      throw new Error('Falha na criptografia');
    }
  }

  /**
   * Descriptografa dados
   */
  static async decrypt(encryptedData: string, password: string): Promise<string> {
    try {
      // Converter de Base64
      const data = this.base64ToArrayBuffer(encryptedData);

      // Extrair salt, IV e dados criptografados
      const salt = data.slice(0, this.SALT_LENGTH);
      const iv = data.slice(this.SALT_LENGTH, this.SALT_LENGTH + this.IV_LENGTH);
      const encrypted = data.slice(this.SALT_LENGTH + this.IV_LENGTH);

      // Derivar chave
      const key = await this.deriveKey(password, salt);

      // Descriptografar
      const decryptedData = await crypto.subtle.decrypt(
        {
          name: this.ALGORITHM,
          iv
        },
        key,
        encrypted
      );

      const decoder = new TextDecoder();
      return decoder.decode(decryptedData);
    } catch (error) {
      console.error('Erro ao descriptografar dados:', error);
      throw new Error('Falha na descriptografia - senha incorreta ou dados corrompidos');
    }
  }

  /**
   * Gera hash seguro para senhas COM SALT ÚNICO
   * CORREÇÃO: Adiciona salt único por usuário para prevenir rainbow table attacks
   */
  static async hashPassword(password: string, salt?: string): Promise<{ hash: string; salt: string }> {
    // Gerar salt único se não fornecido
    const passwordSalt = salt || this.generateSecureToken(16);
    
    const encoder = new TextEncoder();
    const saltedPassword = password + passwordSalt;
    const data = encoder.encode(saltedPassword);
    
    // Usar PBKDF2 ao invés de SHA-256 simples
    const keyMaterial = await crypto.subtle.importKey(
      'raw',
      data,
      'PBKDF2',
      false,
      ['deriveBits']
    );
    
    const hashBuffer = await crypto.subtle.deriveBits(
      {
        name: 'PBKDF2',
        salt: encoder.encode(passwordSalt),
        iterations: 100000,
        hash: 'SHA-256'
      },
      keyMaterial,
      256
    );
    
    return {
      hash: this.arrayBufferToBase64(new Uint8Array(hashBuffer)),
      salt: passwordSalt
    };
  }

  /**
   * Verifica senha com timing constante para prevenir timing attacks
   */
  static async verifyPassword(
    password: string,
    storedHash: string,
    salt: string
  ): Promise<boolean> {
    const { hash } = await this.hashPassword(password, salt);
    
    // Comparação constant-time
    return this.constantTimeCompare(hash, storedHash);
  }

  /**
   * Comparação constant-time para prevenir timing attacks
   */
  private static constantTimeCompare(a: string, b: string): boolean {
    if (a.length !== b.length) {
      return false;
    }
    
    let result = 0;
    for (let i = 0; i < a.length; i++) {
      result |= a.charCodeAt(i) ^ b.charCodeAt(i);
    }
    
    return result === 0;
  }

  /**
   * Gera token seguro aleatório
   */
  static generateSecureToken(length: number = 32): string {
    const array = new Uint8Array(length);
    crypto.getRandomValues(array);
    return this.arrayBufferToBase64(array);
  }

  private static arrayBufferToBase64(buffer: Uint8Array): string {
    let binary = '';
    for (let i = 0; i < buffer.byteLength; i++) {
      binary += String.fromCharCode(buffer[i]);
    }
    return btoa(binary);
  }

  private static base64ToArrayBuffer(base64: string): Uint8Array {
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    return bytes;
  }
}

// Classe para validação e sanitização de inputs
export class ValidationService {
  /**
   * Valida email
   */
  static validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Valida senha forte
   * Requisitos: mínimo 8 caracteres, letra maiúscula, minúscula, número e caractere especial
   */
  static validatePassword(password: string): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (password.length < 8) {
      errors.push('Senha deve ter no mínimo 8 caracteres');
    }

    if (!/[A-Z]/.test(password)) {
      errors.push('Senha deve conter pelo menos uma letra maiúscula');
    }

    if (!/[a-z]/.test(password)) {
      errors.push('Senha deve conter pelo menos uma letra minúscula');
    }

    if (!/[0-9]/.test(password)) {
      errors.push('Senha deve conter pelo menos um número');
    }

    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
      errors.push('Senha deve conter pelo menos um caractere especial');
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  /**
   * Sanitiza string para prevenir XSS
   */
  static sanitizeString(input: string): string {
    const map: { [key: string]: string } = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#x27;',
      '/': '&#x2F;'
    };
    const reg = /[&<>"'/]/gi;
    return input.replace(reg, (match) => map[match]);
  }

  /**
   * Valida valor monetário
   */
  static validateMonetaryValue(value: number): boolean {
    return !isNaN(value) && isFinite(value) && value >= 0;
  }

  /**
   * Valida data
   */
  static validateDate(dateString: string): boolean {
    const date = new Date(dateString);
    return date instanceof Date && !isNaN(date.getTime());
  }

  /**
   * Sanitiza objeto removendo propriedades perigosas
   */
  static sanitizeObject<T extends Record<string, any>>(obj: T): T {
    const sanitized = { ...obj };
    
    // Remove propriedades que podem ser usadas para prototype pollution
    delete (sanitized as any).__proto__;
    delete (sanitized as any).constructor;
    delete (sanitized as any).prototype;

    return sanitized;
  }
}

// Classe para proteção contra ataques
export class SecurityService {
  private static readonly MAX_LOGIN_ATTEMPTS = 5;
  private static readonly LOCKOUT_DURATION = 15 * 60 * 1000; // 15 minutos
  private static readonly SESSION_TIMEOUT = 30 * 60 * 1000; // 30 minutos
  private static readonly SESSION_SECRET = 'session_secret_key_v1'; // Em produção, usar variável de ambiente

  private static loginAttempts = new Map<string, { count: number; timestamp: number }>();
  private static sessions = new Map<string, { userId: string; lastActivity: number; signature: string }>();
  private static browserFingerprint: string | null = null;

  /**
   * Gera fingerprint do navegador para melhor identificação
   * CORREÇÃO: Usa características do navegador para rate limiting mais efetivo
   */
  static async getBrowserFingerprint(): Promise<string> {
    if (this.browserFingerprint) {
      return this.browserFingerprint;
    }

    const components = [
      navigator.userAgent,
      navigator.language,
      screen.colorDepth,
      screen.width,
      screen.height,
      new Date().getTimezoneOffset(),
      navigator.hardwareConcurrency || 0,
      (navigator as any).deviceMemory || 0
    ];
    const hash = await crypto.subtle.digest(
      'SHA-256',
      new TextEncoder().encode(components.join('|'))
    );
    
    this.browserFingerprint = Array.from(new Uint8Array(hash))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
    
    return this.browserFingerprint;
  }

  /**
   * Registra tentativa de login falhada
   * CORREÇÃO: Usa fingerprint do navegador
   */
  static async recordFailedLogin(identifier: string): Promise<void> {
    const fingerprint = await this.getBrowserFingerprint();
    const key = `${identifier}_${fingerprint}`;
    const current = this.loginAttempts.get(key);
    
    if (current) {
      this.loginAttempts.set(key, {
        count: current.count + 1,
        timestamp: Date.now()
      });
    } else {
      this.loginAttempts.set(key, {
        count: 1,
        timestamp: Date.now()
      });
    }
  }

  /**
   * Verifica se conta está bloqueada
   * CORREÇÃO: Usa fingerprint do navegador
   */
  static async isAccountLocked(identifier: string): Promise<boolean> {
    const fingerprint = await this.getBrowserFingerprint();
    const key = `${identifier}_${fingerprint}`;
    const attempts = this.loginAttempts.get(key);

    if (!attempts) {
      return false;
    }

    // Verificar se ainda está dentro do período de lockout
    if (attempts.count >= this.MAX_LOGIN_ATTEMPTS) {
      const timeSinceLastAttempt = Date.now() - attempts.timestamp;
      if (timeSinceLastAttempt < this.LOCKOUT_DURATION) {
        return true;
      }
      // Período de lockout expirou, limpar tentativas
      this.loginAttempts.delete(key);
    }

    return false;
  }

  /**
   * Limpa tentativas de login
   * CORREÇÃO: Usa fingerprint do navegador
   */
  static async clearLoginAttempts(identifier: string): Promise<void> {
    const fingerprint = await this.getBrowserFingerprint();
    const key = `${identifier}_${fingerprint}`;
    this.loginAttempts.delete(key);
  }

  /**
   * Cria assinatura para sessão (JWT-like)
   * CORREÇÃO: Adiciona assinatura para prevenir forjamento de sessões
   */
  private static async signSession(sessionId: string, userId: string): Promise<string> {
    const data = `${sessionId}:${userId}:${this.SESSION_SECRET}`;
    const hash = await crypto.subtle.digest(
      'SHA-256',
      new TextEncoder().encode(data)
    );
    return Array.from(new Uint8Array(hash))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
  }

  /**
   * Verifica assinatura da sessão
   */
  private static async verifySessionSignature(
    sessionId: string,
    userId: string,
    signature: string
  ): Promise<boolean> {
    const expectedSignature = await this.signSession(sessionId, userId);
    return CryptoService['constantTimeCompare'](signature, expectedSignature);
  }

  /**
   * Cria nova sessão
   * CORREÇÃO: Adiciona assinatura criptográfica
   */
  static async createSession(userId: string): Promise<string> {
    const sessionId = CryptoService.generateSecureToken();
    const signature = await this.signSession(sessionId, userId);
    
    this.sessions.set(sessionId, {
      userId,
      lastActivity: Date.now(),
      signature
    });
    
    return sessionId;
  }

  /**
   * Valida sessão
   * CORREÇÃO: Verifica assinatura para prevenir forjamento
   */
  static async validateSession(sessionId: string): Promise<{ valid: boolean; userId?: string }> {
    const session = this.sessions.get(sessionId);
    
    if (!session) {
      return { valid: false };
    }

    // CORREÇÃO: Verificar assinatura
    const isValidSignature = await this.verifySessionSignature(sessionId, session.userId, session.signature);
    if (!isValidSignature) {
      this.sessions.delete(sessionId);
      return { valid: false };
    }

    // Verificar timeout
    if (Date.now() - session.lastActivity > this.SESSION_TIMEOUT) {
      this.sessions.delete(sessionId);
      return { valid: false };
    }

    // Atualizar última atividade
    session.lastActivity = Date.now();
    
    return {
      valid: true,
      userId: session.userId
    };
  }

  /**
   * Invalida sessão (logout)
   */
  static invalidateSession(sessionId: string): void {
    this.sessions.delete(sessionId);
  }

  /**
   * Implementa rate limiting com fingerprint do navegador
   * CORREÇÃO: Usa fingerprint para prevenir bypass via refresh
   */
  private static rateLimitMap = new Map<string, number[]>();

  static async checkRateLimit(identifier: string, maxRequests: number = 10, windowMs: number = 60000): Promise<boolean> {
    const fingerprint = await this.getBrowserFingerprint();
    const key = `${identifier}_${fingerprint}`;
    const now = Date.now();
    const requests = this.rateLimitMap.get(key) || [];
    
    // Filtrar requisições dentro da janela de tempo
    const recentRequests = requests.filter(timestamp => now - timestamp < windowMs);
    
    if (recentRequests.length >= maxRequests) {
      return false; // Rate limit excedido
    }

    recentRequests.push(now);
    this.rateLimitMap.set(key, recentRequests);
    
    return true;
  }

  /**
   * Gera CSRF token
   */
  static generateCSRFToken(): string {
    return CryptoService.generateSecureToken(32);
  }

  /**
   * Valida CSRF token
   */
  static validateCSRFToken(token: string, storedToken: string): boolean {
    return token === storedToken && token.length > 0;
  }
}
