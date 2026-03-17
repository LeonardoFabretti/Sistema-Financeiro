/**
 * Auth Controller
 * Implementa todas as correções de segurança:
 * - Salt único por usuário
 * - Timing-constant comparison
 * - Rate limiting com fingerprint
 * - Session signing
 */

import { Response } from 'express';
import { validationResult } from 'express-validator';
import bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { query } from '../database/db';
import { AuthRequest } from '../middleware/auth';
import { AppError } from '../middleware/errorHandler';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '30m';
const BCRYPT_ROUNDS = parseInt(process.env.BCRYPT_ROUNDS || '12');

/**
 * Registrar novo usuário
 */
export const register = async (req: AuthRequest, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const { email, password, name } = req.body;

    // Verificar se email já existe
    const existingUser = await query(
      'SELECT id FROM users WHERE email = $1',
      [email]
    );

    if (existingUser.rows.length > 0) {
      return res.status(400).json({
        success: false,
        error: 'Email já cadastrado'
      });
    }

    // Gerar salt único e hash da senha
    const salt = await bcrypt.genSalt(BCRYPT_ROUNDS);
    const passwordHash = await bcrypt.hash(password, salt);

    // Criar usuário
    const result = await query(
      `INSERT INTO users (email, password_hash, password_salt, name)
       VALUES ($1, $2, $3, $4)
       RETURNING id, email, name, created_at`,
      [email, passwordHash, salt, name]
    );

    const user = result.rows[0];

    // Log auditoria
    await query(
      `INSERT INTO audit_logs (user_id, action, severity, details)
       VALUES ($1, $2, $3, $4)`,
      [user.id, 'USER_REGISTERED', 'info', JSON.stringify({ email })]
    );

    res.status(201).json({
      success: true,
      message: 'Usuário criado com sucesso',
      user: {
        id: user.id,
        email: user.email,
        name: user.name
      }
    });
  } catch (error) {
    console.error('Erro no registro:', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao criar usuário'
    });
  }
};

/**
 * Login com rate limiting e fingerprint
 */
export const login = async (req: AuthRequest, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const { email, password } = req.body;
    const fingerprint = req.headers['x-fingerprint'] as string || 'unknown';
    const ipAddress = req.ip;

    // Verificar rate limiting
    const lockResult = await query(
      `SELECT attempts, locked_until FROM login_attempts
       WHERE identifier = $1 AND fingerprint = $2`,
      [email, fingerprint]
    );

    if (lockResult.rows.length > 0) {
      const { attempts, locked_until } = lockResult.rows[0];
      
      if (locked_until && new Date(locked_until) > new Date()) {
        return res.status(429).json({
          success: false,
          error: 'Conta temporariamente bloqueada. Tente novamente em 15 minutos'
        });
      }
    }

    // Buscar usuário
    const userResult = await query(
      'SELECT * FROM users WHERE email = $1 AND is_active = true',
      [email]
    );

    // Timing-constant: executar hash mesmo se usuário não existir
    let isValidPassword = false;
    if (userResult.rows.length > 0) {
      const user = userResult.rows[0];
      isValidPassword = await bcrypt.compare(password, user.password_hash);
    } else {
      // Hash fake para timing constante
      await bcrypt.compare(password, '$2b$12$fake.hash.to.prevent.timing.attacks.here');
    }

    if (!isValidPassword || userResult.rows.length === 0) {
      // Registrar falha
      await query(
        `INSERT INTO login_attempts (identifier, fingerprint, attempts, locked_until)
         VALUES ($1, $2, 1, CASE WHEN 1 >= 5 THEN NOW() + INTERVAL '15 minutes' ELSE NULL END)
         ON CONFLICT (identifier, fingerprint)
         DO UPDATE SET
           attempts = login_attempts.attempts + 1,
           locked_until = CASE 
             WHEN login_attempts.attempts + 1 >= 5 
             THEN NOW() + INTERVAL '15 minutes' 
             ELSE NULL 
           END,
           updated_at = NOW()`,
        [email, fingerprint]
      );

      return res.status(401).json({
        success: false,
        error: 'Email ou senha incorretos'
      });
    }

    const user = userResult.rows[0];

    // Limpar tentativas de login
    await query(
      'DELETE FROM login_attempts WHERE identifier = $1 AND fingerprint = $2',
      [email, fingerprint]
    );

    // Criar JWT token
    const token = jwt.sign(
      {
        userId: user.id,
        email: user.email,
        role: user.role
      },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN } as jwt.SignOptions
    );

    // Salvar sessão
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 30);

    await query(
      `INSERT INTO sessions (user_id, token, ip_address, user_agent, expires_at)
       VALUES ($1, $2, $3, $4, $5)`,
      [user.id, token, ipAddress, req.headers['user-agent'], expiresAt]
    );

    // Atualizar last login
    await query(
      'UPDATE users SET last_login = NOW() WHERE id = $1',
      [user.id]
    );

    // Log auditoria
    await query(
      `INSERT INTO audit_logs (user_id, action, ip_address, severity, details)
       VALUES ($1, $2, $3, $4, $5)`,
      [user.id, 'USER_LOGIN', ipAddress, 'info', JSON.stringify({ email })]
    );

    res.json({
      success: true,
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Erro no login:', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao fazer login'
    });
  }
};

/**
 * Logout
 */
export const logout = async (req: AuthRequest, res: Response) => {
  try {
    const token = req.headers.authorization?.substring(7);

    if (token) {
      await query('DELETE FROM sessions WHERE token = $1', [token]);
    }

    res.json({
      success: true,
      message: 'Logout realizado com sucesso'
    });
  } catch (error) {
    console.error('Erro no logout:', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao fazer logout'
    });
  }
};

/**
 * Refresh token
 */
export const refreshToken = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      throw new AppError('Usuário não autenticado', 401);
    }

    const newToken = jwt.sign(
      {
        userId: req.user.id,
        email: req.user.email,
        role: req.user.role
      },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN } as jwt.SignOptions
    );

    res.json({
      success: true,
      token: newToken
    });
  } catch (error) {
    console.error('Erro ao renovar token:', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao renovar token'
    });
  }
};

/**
 * Trocar senha
 */
export const changePassword = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      throw new AppError('Usuário não autenticado', 401);
    }

    const { currentPassword, newPassword } = req.body;

    // Buscar usuário
    const result = await query(
      'SELECT password_hash FROM users WHERE id = $1',
      [req.user.id]
    );

    if (result.rows.length === 0) {
      throw new AppError('Usuário não encontrado', 404);
    }

    const user = result.rows[0];

    // Verificar senha atual
    const isValid = await bcrypt.compare(currentPassword, user.password_hash);
    if (!isValid) {
      return res.status(401).json({
        success: false,
        error: 'Senha atual incorreta'
      });
    }

    // Gerar novo hash
    const salt = await bcrypt.genSalt(BCRYPT_ROUNDS);
    const newHash = await bcrypt.hash(newPassword, salt);

    // Atualizar senha
    await query(
      'UPDATE users SET password_hash = $1, password_salt = $2 WHERE id = $3',
      [newHash, salt, req.user.id]
    );

    // Log auditoria
    await query(
      `INSERT INTO audit_logs (user_id, action, severity)
       VALUES ($1, $2, $3)`,
      [req.user.id, 'PASSWORD_CHANGED', 'info']
    );

    res.json({
      success: true,
      message: 'Senha alterada com sucesso'
    });
  } catch (error) {
    console.error('Erro ao trocar senha:', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao trocar senha'
    });
  }
};

/**
 * Obter usuário atual
 */
export const getCurrentUser = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      throw new AppError('Usuário não autenticado', 401);
    }

    const result = await query(
      'SELECT id, email, name, role, created_at, last_login FROM users WHERE id = $1',
      [req.user.id]
    );

    if (result.rows.length === 0) {
      throw new AppError('Usuário não encontrado', 404);
    }

    res.json({
      success: true,
      user: result.rows[0]
    });
  } catch (error) {
    console.error('Erro ao buscar usuário:', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao buscar usuário'
    });
  }
};
