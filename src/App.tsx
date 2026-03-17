import React, { useState, useEffect } from 'react';
import { FinanceProvider, useFinance } from './contexts/FinanceContext';
import Dashboard from './components/Dashboard';
import Login from './components/Login';
import Register from './components/Register';
import ConsentModal from './components/ConsentModal';
import SecuritySettings from './components/SecuritySettings';
import { Moon, Sun, Download, Upload, Trash2, Shield, LogOut } from 'lucide-react';
import { AuthService, AuthState } from './services/authService';
import { ComplianceService } from './services/complianceService';
import { BackupService } from './services/backupService';
import { AuditService, AuditAction } from './services/auditService';
import { SecureStorage } from './services/secureStorage';

const AppContent: React.FC = () => {
  const { dados, exportarDados, importarDados, limparDados, atualizarConfiguracoes } = useFinance();
  const [tema, setTema] = useState<'claro' | 'escuro'>(dados.configuracoes.tema === 'auto' ? 'claro' : dados.configuracoes.tema);
  const [authState, setAuthState] = useState<AuthState | null>(null);
  const [showLogin, setShowLogin] = useState(true);
  const [showConsent, setShowConsent] = useState(false);
  const [showSecuritySettings, setShowSecuritySettings] = useState(false);
  const [loading, setLoading] = useState(true);

  // Inicializar autenticação
  useEffect(() => {
    const initAuth = async () => {
      try {
        const state = await AuthService.initialize();
        setAuthState(state);
        
        if (state.isAuthenticated && state.user) {
          // Verificar consentimento
          const hasConsent = await ComplianceService.hasValidConsent(state.user.id);
          setShowConsent(!hasConsent);
          
          // Verificar se precisa de backup automático
          if (BackupService.shouldCreateAutoBackup(state.user.id)) {
            // Notificar usuário sobre backup
            console.log('Backup automático recomendado');
          }
          
          await AuditService.log(
            AuditAction.DATA_ACCESS,
            state.user.id,
            'Acesso ao sistema',
            'info'
          );
        }
      } catch (error) {
        console.error('Erro ao inicializar autenticação:', error);
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  // Validar sessão periodicamente
  useEffect(() => {
    if (!authState?.isAuthenticated) return;

    const interval = setInterval(async () => {
      const isValid = await AuthService.validateSession();
      if (!isValid) {
        handleLogout();
      }
    }, 60000); // Verificar a cada 1 minuto

    return () => clearInterval(interval);
  }, [authState]);
  
  useEffect(() => {
    // Aplicar tema
    if (tema === 'escuro') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [tema]);
  
  const alternarTema = () => {
    const novoTema = tema === 'claro' ? 'escuro' : 'claro';
    setTema(novoTema);
    atualizarConfiguracoes({ tema: novoTema });
  };

  const handleLoginSuccess = (newAuthState: AuthState) => {
    setAuthState(newAuthState);
    setShowLogin(false);
  };

  const handleRegisterSuccess = () => {
    setShowLogin(true);
    alert('Conta criada com sucesso! Faça login para continuar.');
  };

  const handleConsent = () => {
    setShowConsent(false);
  };

  const handleLogout = async () => {
    if (authState) {
      await AuthService.logout(authState);
    }
    // CORREÇÃO: Limpar chave de criptografia do SecureStorage
    SecureStorage.clear();
    setAuthState(null);
    setShowLogin(true);
  };
  
  const handleImportar = async () => {
    if (!authState?.user) return;

    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = async (e: any) => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = async (event: any) => {
          try {
            const dadosImportados = JSON.parse(event.target.result);
            importarDados(dadosImportados);
            
            await AuditService.log(
              AuditAction.DATA_IMPORTED,
              authState.user!.id,
              'Dados importados',
              'info'
            );
            
            alert('Dados importados com sucesso!');
          } catch (error) {
            alert('Erro ao importar dados. Verifique o arquivo.');
          }
        };
        reader.readAsText(file);
      }
    };
    input.click();
  };
  
  const handleLimpar = async () => {
    if (!authState?.user) return;

    if (confirm('Tem certeza que deseja limpar todos os dados? Esta ação não pode ser desfeita!')) {
      const confirmar = prompt('Digite "CONFIRMAR" para limpar todos os dados:');
      if (confirmar === 'CONFIRMAR') {
        limparDados();
        
        await AuditService.log(
          AuditAction.DATA_CLEARED,
          authState.user.id,
          'Todos os dados foram limpos',
          'warning'
        );
        
        alert('Todos os dados foram removidos!');
      }
    }
  };

  const handleExportarDados = async () => {
    if (!authState?.user) return;

    exportarDados();
    
    await AuditService.log(
      AuditAction.DATA_EXPORTED,
      authState.user.id,
      'Dados exportados',
      'info'
    );
  };

  // Tela de loading
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900">
        <div className="text-center">
          <Shield className="h-16 w-16 text-blue-600 animate-pulse mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Carregando sistema seguro...</p>
        </div>
      </div>
    );
  }

  // Tela de login/registro
  if (!authState?.isAuthenticated || !authState?.user) {
    return showLogin ? (
      <Login
        onLoginSuccess={handleLoginSuccess}
        onSwitchToRegister={() => setShowLogin(false)}
      />
    ) : (
      <Register
        onRegisterSuccess={handleRegisterSuccess}
        onSwitchToLogin={() => setShowLogin(true)}
      />
    );
  }

  // Modal de consentimento
  if (showConsent) {
    return <ConsentModal userId={authState.user.id} onConsent={handleConsent} />;
  }
  
  return (
    <div className="relative">
      {/* Header com informações do usuário */}
      <div className="fixed top-0 left-0 right-0 bg-white dark:bg-gray-800 shadow-md z-40 px-4 py-2">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Shield className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            <div>
              <p className="text-sm font-semibold text-gray-800 dark:text-white">
                {authState.user.name}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {authState.user.email}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowSecuritySettings(true)}
              className="p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              title="Configurações de Segurança"
            >
              <Shield className="h-5 w-5" />
            </button>
            <button
              onClick={handleLogout}
              className="p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
              title="Sair"
            >
              <LogOut className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Espaçamento para o header */}
      <div className="h-16"></div>

      {/* Botões Flutuantes */}
      <div className="fixed bottom-3 sm:bottom-6 right-3 sm:right-6 flex flex-col gap-2 z-50">
        {/* Tema */}
        <button
          onClick={alternarTema}
          className="bg-gray-800 dark:bg-gray-200 text-white dark:text-gray-800 p-2.5 sm:p-4 rounded-full shadow-2xl hover:scale-110 transition-transform active:scale-95"
          title={tema === 'claro' ? 'Modo Escuro' : 'Modo Claro'}
        >
          {tema === 'claro' ? <Moon size={18} className="sm:w-6 sm:h-6" /> : <Sun size={18} className="sm:w-6 sm:h-6" />}
        </button>
        
        {/* Backup */}
        <button
          onClick={handleExportarDados}
          className="bg-green-600 text-white p-2.5 sm:p-4 rounded-full shadow-2xl hover:scale-110 transition-transform active:scale-95"
          title="Fazer Backup"
        >
          <Download size={18} className="sm:w-6 sm:h-6" />
        </button>
        
        {/* Importar */}
        <button
          onClick={handleImportar}
          className="bg-blue-600 text-white p-2.5 sm:p-4 rounded-full shadow-2xl hover:scale-110 transition-transform active:scale-95"
          title="Importar Backup"
        >
          <Upload size={18} className="sm:w-6 sm:h-6" />
        </button>
        
        {/* Limpar */}
        <button
          onClick={handleLimpar}
          className="bg-red-600 text-white p-2.5 sm:p-4 rounded-full shadow-2xl hover:scale-110 transition-transform active:scale-95"
          title="Limpar Dados"
        >
          <Trash2 size={18} className="sm:w-6 sm:h-6" />
        </button>
      </div>

      {/* Modal de Configurações de Segurança */}
      {showSecuritySettings && (
        <SecuritySettings
          userId={authState.user.id}
          dados={dados}
          onClose={() => setShowSecuritySettings(false)}
        />
      )}
      
      {/* Dashboard Principal */}
      <Dashboard />
    </div>
  );
};

const App: React.FC = () => {
  return (
    <FinanceProvider>
      <AppContent />
    </FinanceProvider>
  );
};

export default App;
