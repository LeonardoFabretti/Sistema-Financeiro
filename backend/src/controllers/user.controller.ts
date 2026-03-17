/**
 * User Controller
 */

import { Response } from 'express';
import { query } from '../database/db';
import { AuthRequest } from '../middleware/auth';
import { AppError } from '../middleware/errorHandler';

/**
 * Obter perfil do usuário
 */
export const getProfile = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      throw new AppError('Usuário não autenticado', 401);
    }

    const result = await query(
      'SELECT id, email, name, role, created_at, last_login FROM users WHERE id = $1',
      [req.user.id]
    );

    res.json({
      success: true,
      user: result.rows[0]
    });
  } catch (error) {
    console.error('Erro ao buscar perfil:', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao buscar perfil'
    });
  }
};

/**
 * Atualizar perfil
 */
export const updateProfile = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      throw new AppError('Usuário não autenticado', 401);
    }

    const { name } = req.body;

    const result = await query(
      'UPDATE users SET name = $1, updated_at = NOW() WHERE id = $2 RETURNING id, email, name',
      [name, req.user.id]
    );

    res.json({
      success: true,
      user: result.rows[0]
    });
  } catch (error) {
    console.error('Erro ao atualizar perfil:', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao atualizar perfil'
    });
  }
};

/**
 * Deletar conta (LGPD)
 */
export const deleteAccount = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      throw new AppError('Usuário não autenticado', 401);
    }

    // Criar requisição de compliance
    await query(
      `INSERT INTO compliance_requests (user_id, type, status, details)
       VALUES ($1, $2, $3, $4)`,
      [req.user.id, 'DELETE_ACCOUNT', 'pending', JSON.stringify({ requestedAt: new Date() })]
    );

    // Em produção, processar assincronamente
    // Por enquanto, deletar diretamente
    await query('DELETE FROM users WHERE id = $1', [req.user.id]);

    res.json({
      success: true,
      message: 'Conta deletada com sucesso'
    });
  } catch (error) {
    console.error('Erro ao deletar conta:', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao deletar conta'
    });
  }
};

/**
 * Listar sessões ativas
 */
export const getSessions = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      throw new AppError('Usuário não autenticado', 401);
    }

    const result = await query(
      `SELECT id, ip_address, user_agent, created_at, last_activity, expires_at
       FROM sessions
       WHERE user_id = $1 AND expires_at > NOW()
       ORDER BY last_activity DESC`,
      [req.user.id]
    );

    res.json({
      success: true,
      sessions: result.rows
    });
  } catch (error) {
    console.error('Erro ao buscar sessões:', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao buscar sessões'
    });
  }
};

/**
 * Revogar sessão específica
 */
export const deleteSession = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      throw new AppError('Usuário não autenticado', 401);
    }

    const { id } = req.params;

    const result = await query(
      'DELETE FROM sessions WHERE id = $1 AND user_id = $2 RETURNING *',
      [id, req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Sessão não encontrada'
      });
    }

    res.json({
      success: true,
      message: 'Sessão revogada com sucesso'
    });
  } catch (error) {
    console.error('Erro ao revogar sessão:', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao revogar sessão'
    });
  }
};
