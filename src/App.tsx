import React, { useState, useEffect } from 'react';
import { FinanceProvider, useFinance } from './contexts/FinanceContext';
import Dashboard from './components/Dashboard';
import { Moon, Sun, Download, Upload, Trash2 } from 'lucide-react';

const AppContent: React.FC = () => {
  const { dados, exportarDados, importarDados, limparDados, atualizarConfiguracoes } = useFinance();
  const [tema, setTema] = useState<'claro' | 'escuro'>(dados.configuracoes.tema === 'auto' ? 'claro' : dados.configuracoes.tema);
  
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
  
  const handleImportar = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e: any) => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (event: any) => {
          try {
            const dadosImportados = JSON.parse(event.target.result);
            importarDados(dadosImportados);
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
  
  const handleLimpar = () => {
    if (confirm('Tem certeza que deseja limpar todos os dados? Esta ação não pode ser desfeita!')) {
      const confirmar = prompt('Digite "CONFIRMAR" para limpar todos os dados:');
      if (confirmar === 'CONFIRMAR') {
        limparDados();
        alert('Todos os dados foram removidos!');
      }
    }
  };
  
  return (
    <div className="relative">
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
          onClick={exportarDados}
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
