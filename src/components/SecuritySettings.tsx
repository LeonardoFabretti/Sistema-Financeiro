/**
 * Componente de Configurações de Segurança
 */

import React, { useState } from 'react';
import { Shield, Key, Download, Lock, FileText, AlertTriangle, CheckCircle, Eye, EyeOff } from 'lucide-react';
import { AuthService } from '../services/authService';
import { BackupService } from '../services/backupService';
import { ComplianceService } from '../services/complianceService';
import { AuditService } from '../services/auditService';
import { DadosSistema } from '../types';

interface SecuritySettingsProps {
  userId: string;
  dados: DadosSistema;
  onClose: () => void;
}

const SecuritySettings: React.FC<SecuritySettingsProps> = ({ userId, dados, onClose }) => {
  const [activeTab, setActiveTab] = useState<'password' | 'backup' | 'privacy' | 'audit'>('password');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [backupPassword, setBackupPassword] = useState('');
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [showPasswords, setShowPasswords] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChangePassword = async () => {
    setMessage(null);
    setLoading(true);

    try {
      if (newPassword !== confirmPassword) {
        setMessage({ type: 'error', text: 'As senhas não conferem' });
        return;
      }

      const result = await AuthService.changePassword(userId, currentPassword, newPassword);

      if (result.success) {
        setMessage({ type: 'success', text: 'Senha alterada com sucesso!' });
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        setMessage({ type: 'error', text: result.error || 'Erro ao alterar senha' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Erro ao alterar senha' });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateBackup = async () => {
    setMessage(null);
    setLoading(true);

    try {
      if (!backupPassword) {
        setMessage({ type: 'error', text: 'Digite uma senha para o backup' });
        return;
      }

      const result = await BackupService.createBackup(dados, userId, backupPassword);

      if (result.success) {
        setMessage({ type: 'success', text: 'Backup criado com sucesso!' });
        setBackupPassword('');
      } else {
        setMessage({ type: 'error', text: result.error || 'Erro ao criar backup' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Erro ao criar backup' });
    } finally {
      setLoading(false);
    }
  };

  const handleExportData = async () => {
    setLoading(true);
    try {
      await ComplianceService.exportUserData(userId, dados);
      setMessage({ type: 'success', text: 'Dados exportados com sucesso!' });
    } catch (error) {
      setMessage({ type: 'error', text: 'Erro ao exportar dados' });
    } finally {
      setLoading(false);
    }
  };

  const handleRequestDeletion = async () => {
    if (!confirm('Tem certeza que deseja solicitar a exclusão dos seus dados? Esta ação é irreversível.')) {
      return;
    }

    setLoading(true);
    try {
      await ComplianceService.requestDataDeletion(userId, 'Solicitação do usuário');
      setMessage({ type: 'success', text: 'Solicitação de exclusão registrada. Processamento em até 30 dias.' });
    } catch (error) {
      setMessage({ type: 'error', text: 'Erro ao solicitar exclusão' });
    } finally {
      setLoading(false);
    }
  };

  const handleExportAuditLogs = async () => {
    setLoading(true);
    try {
      await AuditService.exportLogs({ userId });
      setMessage({ type: 'success', text: 'Logs exportados com sucesso!' });
    } catch (error) {
      setMessage({ type: 'error', text: 'Erro ao exportar logs' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Shield className="h-6 w-6 text-white" />
            <h2 className="text-xl font-bold text-white">Configurações de Segurança</h2>
          </div>
          <button
            onClick={onClose}
            className="text-white hover:text-gray-200 text-2xl leading-none"
          >
            ×
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200 dark:border-gray-700 px-6">
          <button
            onClick={() => setActiveTab('password')}
            className={`px-4 py-3 font-medium text-sm border-b-2 transition-colors ${
              activeTab === 'password'
                ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
            }`}
          >
            <Key className="h-4 w-4 inline mr-2" />
            Senha
          </button>
          <button
            onClick={() => setActiveTab('backup')}
            className={`px-4 py-3 font-medium text-sm border-b-2 transition-colors ${
              activeTab === 'backup'
                ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
            }`}
          >
            <Download className="h-4 w-4 inline mr-2" />
            Backup
          </button>
          <button
            onClick={() => setActiveTab('privacy')}
            className={`px-4 py-3 font-medium text-sm border-b-2 transition-colors ${
              activeTab === 'privacy'
                ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
            }`}
          >
            <Lock className="h-4 w-4 inline mr-2" />
            Privacidade
          </button>
          <button
            onClick={() => setActiveTab('audit')}
            className={`px-4 py-3 font-medium text-sm border-b-2 transition-colors ${
              activeTab === 'audit'
                ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
            }`}
          >
            <FileText className="h-4 w-4 inline mr-2" />
            Auditoria
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-180px)]">
          {message && (
            <div
              className={`mb-4 p-4 rounded-lg flex items-start gap-3 ${
                message.type === 'success'
                  ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800'
                  : 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800'
              }`}
            >
              {message.type === 'success' ? (
                <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
              ) : (
                <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
              )}
              <p
                className={`text-sm ${
                  message.type === 'success'
                    ? 'text-green-700 dark:text-green-300'
                    : 'text-red-700 dark:text-red-300'
                }`}
              >
                {message.text}
              </p>
            </div>
          )}

          {/* Password Tab */}
          {activeTab === 'password' && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Alterar Senha</h3>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Senha Atual
                </label>
                <input
                  type={showPasswords ? 'text' : 'password'}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Nova Senha
                </label>
                <input
                  type={showPasswords ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Confirmar Nova Senha
                </label>
                <input
                  type={showPasswords ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                />
              </div>

              <button
                onClick={() => setShowPasswords(!showPasswords)}
                className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
              >
                {showPasswords ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                {showPasswords ? 'Ocultar senhas' : 'Mostrar senhas'}
              </button>

              <button
                onClick={handleChangePassword}
                disabled={loading || !currentPassword || !newPassword || !confirmPassword}
                className="w-full py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Alterando...' : 'Alterar Senha'}
              </button>
            </div>
          )}

          {/* Backup Tab */}
          {activeTab === 'backup' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Criar Backup Criptografado</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  Crie um backup criptografado dos seus dados. Você precisará da senha para restaurá-lo.
                </p>
                
                <div className="space-y-3">
                  <input
                    type="password"
                    placeholder="Senha para o backup"
                    value={backupPassword}
                    onChange={(e) => setBackupPassword(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  />
                  <button
                    onClick={handleCreateBackup}
                    disabled={loading || !backupPassword}
                    className="w-full py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                  >
                    {loading ? 'Criando...' : 'Criar Backup'}
                  </button>
                </div>
              </div>

              <div className="pt-6 border-t border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Backups Recentes</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Mantemos automaticamente até 10 backups dos seus dados.
                </p>
              </div>
            </div>
          )}

          {/* Privacy Tab */}
          {activeTab === 'privacy' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Seus Direitos (LGPD)</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  De acordo com a Lei Geral de Proteção de Dados, você tem direito a:
                </p>
                
                <div className="space-y-3">
                  <button
                    onClick={handleExportData}
                    disabled={loading}
                    className="w-full py-3 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    <Download className="h-5 w-5" />
                    Exportar Meus Dados (Portabilidade)
                  </button>
                  
                  <button
                    onClick={handleRequestDeletion}
                    disabled={loading}
                    className="w-full py-3 px-4 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    <AlertTriangle className="h-5 w-5" />
                    Solicitar Exclusão dos Dados
                  </button>
                </div>
              </div>

              <div className="pt-6 border-t border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Documentos</h3>
                <div className="space-y-2">
                  <button className="w-full text-left px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Ver Termos de Uso
                  </button>
                  <button className="w-full text-left px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Ver Política de Privacidade
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Audit Tab */}
          {activeTab === 'audit' && (
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Logs de Auditoria</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  Todas as ações importantes são registradas para sua segurança e conformidade.
                </p>
                
                <button
                  onClick={handleExportAuditLogs}
                  disabled={loading}
                  className="w-full py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  <Download className="h-5 w-5" />
                  Exportar Logs
                </button>
              </div>

              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                <p className="text-sm text-blue-800 dark:text-blue-300">
                  <strong>Informação:</strong> Os logs são mantidos por 90 dias para fins de auditoria e segurança.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SecuritySettings;
