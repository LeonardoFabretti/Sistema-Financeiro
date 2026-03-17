/**
 * Serviço de Autenticação
 * Gerencia login, registro e autorização de usuários
 */

import { CryptoService, ValidationService, SecurityService } from './securityService';
import { AuditService, AuditAction } from './auditService';

export interface User {
  id: string;
  email: string;
  name: string;
  passwordHash: string;
  passwordSalt: string; // CORREÇÃO: Salt único por usuário
  createdAt: number;
  lastLogin?: number;
  role: 'user' | 'admin';
  twoFactorEnabled: boolean;
  twoFactorSecret?: string;
  accountStatus: 'active' | 'locked' | 'suspended';
  dataEncryptionKey: string; // Chave para criptografar dados do usuário
}

export interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  sessionId: string | null;
  csrfToken: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
  twoFactorCode?: string;
}

export interface RegisterData {
  email: string;
  name: string;
  password: string;
  confirmPassword: string;
}

export class AuthService {
  private static readonly USERS_KEY = 'secure_users';
  private static readonly AUTH_STATE_KEY = 'auth_state';

  /**
   * Inicializa o sistema de autenticação
   */
  static async initialize(): Promise<AuthState> {
    try {
      const savedState = localStorage.getItem(this.AUTH_STATE_KEY);
      
      if (savedState) {
        const state: AuthState = JSON.parse(savedState);
        
        // CORREÇÃO: Validar sessão com await (verifica assinatura)
        const sessionValidation = await SecurityService.validateSession(state.sessionId || '');
        
        if (sessionValidation.valid && state.user) {
          return {
            ...state,
            csrfToken: SecurityService.generateCSRFToken()
          };
        }
      }

      // Estado não autenticado
      return {
        isAuthenticated: false,
        user: null,
        sessionId: null,
        csrfToken: SecurityService.generateCSRFToken()
      };
    } catch (error) {
      console.error('Erro ao inicializar autenticação:', error);
      return {
        isAuthenticated: false,
        user: null,
        sessionId: null,
        csrfToken: SecurityService.generateCSRFToken()
      };
    }
  }

  /**
   * Registra novo usuário
   */
  static async register(data: RegisterData): Promise<{ success: boolean; error?: string }> {
    try {
      // Validações
      if (!ValidationService.validateEmail(data.email)) {
        return { success: false, error: 'Email inválido' };
      }

      const passwordValidation = ValidationService.validatePassword(data.password);
      if (!passwordValidation.valid) {
        return { success: false, error: passwordValidation.errors.join(', ') };
      }

      if (data.password !== data.confirmPassword) {
        return { success: false, error: 'Senhas não conferem' };
      }

      // Verificar se usuário já existe
      const users = await this.getUsers();
      if (users.find(u => u.email === data.email)) {
        await AuditService.log(
          AuditAction.SUSPICIOUS_ACTIVITY,
          'unknown',
          `Tentativa de registro com email já existente: ${data.email}`,
          'warning'
        );
        return { success: false, error: 'Email já cadastrado' };
      }

      // CORREÇÃO: Criar hash com salt único
      const { hash, salt } = await CryptoService.hashPassword(data.password);
      
      // Criar usuário
      const user: User = {
        id: CryptoService.generateSecureToken(16),
        email: data.email,
        name: ValidationService.sanitizeString(data.name),
        passwordHash: hash,
        passwordSalt: salt,
        createdAt: Date.now(),
        role: users.length === 0 ? 'admin' : 'user', // Primeiro usuário é admin
        twoFactorEnabled: false,
        accountStatus: 'active',
        dataEncryptionKey: CryptoService.generateSecureToken(32)
      };

      // Salvar usuário
      users.push(user);
      await this.saveUsers(users);

      // Log de auditoria
      await AuditService.log(
        AuditAction.LOGIN_SUCCESS,
        user.id,
        `Novo usuário registrado: ${user.email}`,
        'info'
      );

      return { success: true };
    } catch (error) {
      console.error('Erro ao registrar usuário:', error);
      return { success: false, error: 'Erro ao registrar usuário' };
    }
  }

  /**
   * Realiza login
   */
  static async login(credentials: LoginCredentials): Promise<{
    success: boolean;
    authState?: AuthState;
    error?: string;
    requiresTwoFactor?: boolean;
  }> {
    try {
      const { email, password } = credentials;

      // CORREÇÃO: Verificar rate limiting com await (usa fingerprint)
      if (!(await SecurityService.checkRateLimit(`login_${email}`, 5, 60000))) {
        await AuditService.log(
          AuditAction.RATE_LIMIT_EXCEEDED,
          'unknown',
          `Rate limit excedido para login: ${email}`,
          'warning'
        );
        return { success: false, error: 'Muitas tentativas. Tente novamente em 1 minuto.' };
      }

      // CORREÇÃO: Verificar se conta está bloqueada com await
      if (await SecurityService.isAccountLocked(email)) {
        await AuditService.log(
          AuditAction.ACCOUNT_LOCKED,
          'unknown',
          `Tentativa de login em conta bloqueada: ${email}`,
          'warning'
        );
        return { success: false, error: 'Conta temporariamente bloqueada. Tente novamente em 15 minutos.' };
      }

      // Buscar usuário
      const users = await this.getUsers();
      const user = users.find(u => u.email === email);

      // CORREÇÃO: Sempre executar hash mesmo se usuário não existe (timing constante)
      if (!user) {
        // Executar hash para manter timing constante
        await CryptoService.hashPassword(password, 'dummy_salt');
        
        await SecurityService.recordFailedLogin(email);
        await AuditService.log(
          AuditAction.LOGIN_FAILED,
          'unknown',
          `Tentativa de login`,
          'warning'
        );
        return { success: false, error: 'Email ou senha incorretos' };
      }

      // CORREÇÃO: Verificar senha com timing constante
      const passwordValid = await CryptoService.verifyPassword(
        password,
        user.passwordHash,
        user.passwordSalt
      );
      
      if (!passwordValid) {
        await SecurityService.recordFailedLogin(email);
        await AuditService.log(
          AuditAction.LOGIN_FAILED,
          user.id,
          `Tentativa de login com senha incorreta`,
          'warning'
        );
        return { success: false, error: 'Email ou senha incorretos' };
      }

      // Verificar status da conta
      if (user.accountStatus !== 'active') {
        await AuditService.log(
          AuditAction.LOGIN_FAILED,
          user.id,
          `Tentativa de login em conta ${user.accountStatus}: ${email}`,
          'warning'
        );
        return { success: false, error: `Conta ${user.accountStatus === 'locked' ? 'bloqueada' : 'suspensa'}` };
      }

      // Verificar 2FA se habilitado
      if (user.twoFactorEnabled && !credentials.twoFactorCode) {
        return { success: false, requiresTwoFactor: true };
      }

      // Limpar tentativas de login
      await SecurityService.clearLoginAttempts(email);

      // CORREÇÃO: Criar sessão com assinatura
      const sessionId = await SecurityService.createSession(user.id);

      // Atualizar último login
      user.lastLogin = Date.now();
      await this.updateUser(user);

      // Criar estado de autenticação
      const authState: AuthState = {
        isAuthenticated: true,
        user,
        sessionId,
        csrfToken: SecurityService.generateCSRFToken()
      };

      // Salvar estado
      this.saveAuthState(authState);

      // Log de auditoria
      await AuditService.log(
        AuditAction.LOGIN_SUCCESS,
        user.id,
        `Login realizado com sucesso: ${email}`,
        'info'
      );

      return { success: true, authState };
    } catch (error) {
      console.error('Erro ao realizar login:', error);
      return { success: false, error: 'Erro ao realizar login' };
    }
  }

  /**
   * Realiza logout
   */
  static async logout(authState: AuthState): Promise<void> {
    try {
      if (authState.sessionId) {
        SecurityService.invalidateSession(authState.sessionId);
      }

      if (authState.user) {
        await AuditService.log(
          AuditAction.LOGOUT,
          authState.user.id,
          `Logout realizado: ${authState.user.email}`,
          'info'
        );
      }

      localStorage.removeItem(this.AUTH_STATE_KEY);
    } catch (error) {
      console.error('Erro ao realizar logout:', error);
    }
  }

  /**
   * Altera senha do usuário
   */
  static async changePassword(
    userId: string,
    currentPassword: string,
    newPassword: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const users = await this.getUsers();
      const user = users.find(u => u.id === userId);

      if (!user) {
        return { success: false, error: 'Usuário não encontrado' };
      }

      // CORREÇÃO: Verificar senha atual com timing constante
      const passwordValid = await CryptoService.verifyPassword(
        currentPassword,
        user.passwordHash,
        user.passwordSalt
      );
      
      if (!passwordValid) {
        await AuditService.log(
          AuditAction.SUSPICIOUS_ACTIVITY,
          userId,
          'Tentativa de alteração de senha com senha atual incorreta',
          'warning'
        );
        return { success: false, error: 'Senha atual incorreta' };
      }

      // Validar nova senha
      const passwordValidation = ValidationService.validatePassword(newPassword);
      if (!passwordValidation.valid) {
        return { success: false, error: passwordValidation.errors.join(', ') };
      }

      // CORREÇÃO: Atualizar senha com novo salt
      const { hash, salt } = await CryptoService.hashPassword(newPassword);
      user.passwordHash = hash;
      user.passwordSalt = salt;
      await this.updateUser(user);

      await AuditService.log(
        AuditAction.PASSWORD_CHANGED,
        userId,
        'Senha alterada com sucesso',
        'info'
      );

      return { success: true };
    } catch (error) {
      console.error('Erro ao alterar senha:', error);
      return { success: false, error: 'Erro ao alterar senha' };
    }
  }

  /**
   * Obtém lista de usuários (apenas para admin)
   */
  private static async getUsers(): Promise<User[]> {
    try {
      const usersJson = localStorage.getItem(this.USERS_KEY);
      return usersJson ? JSON.parse(usersJson) : [];
    } catch (error) {
      console.error('Erro ao obter usuários:', error);
      return [];
    }
  }

  /**
   * Salva lista de usuários
   */
  private static async saveUsers(users: User[]): Promise<void> {
    try {
      localStorage.setItem(this.USERS_KEY, JSON.stringify(users));
    } catch (error) {
      console.error('Erro ao salvar usuários:', error);
      throw error;
    }
  }

  /**
   * Atualiza usuário
   */
  private static async updateUser(user: User): Promise<void> {
    const users = await this.getUsers();
    const index = users.findIndex(u => u.id === user.id);
    
    if (index !== -1) {
      users[index] = user;
      await this.saveUsers(users);
    }
  }

  /**
   * Salva estado de autenticação
   */
  private static saveAuthState(state: AuthState): void {
    try {
      localStorage.setItem(this.AUTH_STATE_KEY, JSON.stringify(state));
    } catch (error) {
      console.error('Erro ao salvar estado de autenticação:', error);
    }
  }

  /**
   * Obtém estado atual de autenticação
   */
  static getAuthState(): AuthState | null {
    try {
      const stateJson = localStorage.getItem(this.AUTH_STATE_KEY);
      return stateJson ? JSON.parse(stateJson) : null;
    } catch (error) {
      return null;
    }
  }

  /**
   * Verifica se sessão ainda é válida
   */
  static async validateSession(): Promise<boolean> {
    const state = this.getAuthState();
    
    if (!state || !state.sessionId) {
      return false;
    }

    const validation = await SecurityService.validateSession(state.sessionId);
    
    if (!validation.valid) {
      await this.logout(state);
      return false;
    }

    return true;
  }
}
