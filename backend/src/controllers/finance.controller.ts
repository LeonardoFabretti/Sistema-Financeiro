/**
 * Finance Controller
 */

import { Response } from 'express';
import { query } from '../database/db';
import { AuthRequest } from '../middleware/auth';
import { AppError } from '../middleware/errorHandler';

/**
 * Listar todos os meses do usuário
 */
export const getMonths = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      throw new AppError('Usuário não autenticado', 401);
    }

    const result = await query(
      `SELECT id, month, year, data, created_at, updated_at
       FROM financial_months
       WHERE user_id = $1
       ORDER BY year DESC, month DESC`,
      [req.user.id]
    );

    res.json({
      success: true,
      months: result.rows
    });
  } catch (error) {
    console.error('Erro ao buscar meses:', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao buscar dados financeiros'
    });
  }
};

/**
 * Buscar mês específico
 */
export const getMonth = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      throw new AppError('Usuário não autenticado', 401);
    }

    const { year, month } = req.params;

    const result = await query(
      `SELECT * FROM financial_months
       WHERE user_id = $1 AND year = $2 AND month = $3`,
      [req.user.id, parseInt(year), parseInt(month)]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Mês não encontrado'
      });
    }

    res.json({
      success: true,
      month: result.rows[0]
    });
  } catch (error) {
    console.error('Erro ao buscar mês:', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao buscar mês'
    });
  }
};

/**
 * Criar/Atualizar mês
 */
export const createMonth = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      throw new AppError('Usuário não autenticado', 401);
    }

    const { month, year, data } = req.body;

    // Validar dados
    if (!data || typeof data !== 'object') {
      return res.status(400).json({
        success: false,
        error: 'Dados inválidos'
      });
    }

    // Inserir ou atualizar
    const result = await query(
      `INSERT INTO financial_months (user_id, month, year, data)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (user_id, month, year)
       DO UPDATE SET data = $4, updated_at = NOW()
       RETURNING *`,
      [req.user.id, month, year, JSON.stringify(data)]
    );

    // Log auditoria
    await query(
      `INSERT INTO audit_logs (user_id, action, resource, severity, details)
       VALUES ($1, $2, $3, $4, $5)`,
      [req.user.id, 'DATA_MODIFIED', `month_${year}_${month}`, 'info', JSON.stringify({ month, year })]
    );

    res.status(201).json({
      success: true,
      month: result.rows[0]
    });
  } catch (error) {
    console.error('Erro ao criar mês:', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao salvar dados'
    });
  }
};

/**
 * Atualizar mês
 */
export const updateMonth = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      throw new AppError('Usuário não autenticado', 401);
    }

    const { id } = req.params;
    const { data } = req.body;

    const result = await query(
      `UPDATE financial_months
       SET data = $1, updated_at = NOW()
       WHERE id = $2 AND user_id = $3
       RETURNING *`,
      [JSON.stringify(data), id, req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Mês não encontrado'
      });
    }

    res.json({
      success: true,
      month: result.rows[0]
    });
  } catch (error) {
    console.error('Erro ao atualizar mês:', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao atualizar dados'
    });
  }
};

/**
 * Deletar mês
 */
export const deleteMonth = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      throw new AppError('Usuário não autenticado', 401);
    }

    const { id } = req.params;

    const result = await query(
      'DELETE FROM financial_months WHERE id = $1 AND user_id = $2 RETURNING *',
      [id, req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Mês não encontrado'
      });
    }

    res.json({
      success: true,
      message: 'Mês deletado com sucesso'
    });
  } catch (error) {
    console.error('Erro ao deletar mês:', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao deletar dados'
    });
  }
};

/**
 * Exportar todos os dados
 */
export const exportData = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      throw new AppError('Usuário não autenticado', 401);
    }

    const result = await query(
      'SELECT * FROM financial_months WHERE user_id = $1 ORDER BY year, month',
      [req.user.id]
    );

    // Log auditoria
    await query(
      `INSERT INTO audit_logs (user_id, action, severity)
       VALUES ($1, $2, $3)`,
      [req.user.id, 'DATA_EXPORTED', 'info']
    );

    res.json({
      success: true,
      data: {
        meses: result.rows,
        exportedAt: new Date().toISOString(),
        version: '2.0.0'
      }
    });
  } catch (error) {
    console.error('Erro ao exportar dados:', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao exportar dados'
    });
  }
};

/**
 * Importar dados
 */
export const importData = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      throw new AppError('Usuário não autenticado', 401);
    }

    const { data } = req.body;

    if (!data || !Array.isArray(data.meses)) {
      return res.status(400).json({
        success: false,
        error: 'Dados inválidos'
      });
    }

    // Importar cada mês
    for (const mes of data.meses) {
      await query(
        `INSERT INTO financial_months (user_id, month, year, data)
         VALUES ($1, $2, $3, $4)
         ON CONFLICT (user_id, month, year)
         DO UPDATE SET data = $4, updated_at = NOW()`,
        [req.user.id, mes.month, mes.year, JSON.stringify(mes.data)]
      );
    }

    // Log auditoria
    await query(
      `INSERT INTO audit_logs (user_id, action, severity, details)
       VALUES ($1, $2, $3, $4)`,
      [req.user.id, 'DATA_IMPORTED', 'warning', JSON.stringify({ count: data.meses.length })]
    );

    res.json({
      success: true,
      message: `${data.meses.length} meses importados com sucesso`
    });
  } catch (error) {
    console.error('Erro ao importar dados:', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao importar dados'
    });
  }
};
