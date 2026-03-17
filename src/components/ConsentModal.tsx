/**
 * Modal de Consentimento LGPD
 */

import React, { useState } from 'react';
import { Shield, CheckCircle, AlertCircle, FileText } from 'lucide-react';
import { ComplianceService } from '../services/complianceService';

interface ConsentModalProps {
  userId: string;
  onConsent: () => void;
}

const ConsentModal: React.FC<ConsentModalProps> = ({ userId, onConsent }) => {
  const [dataProcessingConsent, setDataProcessingConsent] = useState(false);
  const [marketingConsent, setMarketingConsent] = useState(false);
  const [dataShareConsent, setDataShareConsent] = useState(false);
  const [showTerms, setShowTerms] = useState(false);
  const [showPrivacy, setShowPrivacy] = useState(false);

  const handleAccept = async () => {
    if (!dataProcessingConsent) {
      alert('Você precisa aceitar o processamento de dados para usar o sistema');
      return;
    }

    await ComplianceService.recordConsent(
      userId,
      dataProcessingConsent,
      marketingConsent,
      dataShareConsent
    );

    onConsent();
  };

  if (showTerms) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <FileText className="h-6 w-6 text-white" />
              <h2 className="text-xl font-bold text-white">Termos de Uso</h2>
            </div>
            <button
              onClick={() => setShowTerms(false)}
              className="text-white hover:text-gray-200 text-2xl leading-none"
            >
              ×
            </button>
          </div>
          <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
            <pre className="whitespace-pre-wrap text-sm text-gray-700 dark:text-gray-300 font-sans">
              {ComplianceService.getTermsOfService()}
            </pre>
          </div>
        </div>
      </div>
    );
  }

  if (showPrivacy) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden">
          <div className="bg-gradient-to-r from-green-600 to-emerald-600 px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Shield className="h-6 w-6 text-white" />
              <h2 className="text-xl font-bold text-white">Política de Privacidade</h2>
            </div>
            <button
              onClick={() => setShowPrivacy(false)}
              className="text-white hover:text-gray-200 text-2xl leading-none"
            >
              ×
            </button>
          </div>
          <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
            <pre className="whitespace-pre-wrap text-sm text-gray-700 dark:text-gray-300 font-sans">
              {ComplianceService.getPrivacyPolicy()}
            </pre>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-2xl w-full">
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4">
          <div className="flex items-center gap-3">
            <Shield className="h-8 w-8 text-white" />
            <div>
              <h2 className="text-2xl font-bold text-white">Privacidade e Consentimento</h2>
              <p className="text-blue-100 text-sm">Conformidade com a LGPD</p>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-6">
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <p className="text-sm text-gray-700 dark:text-gray-300">
              Para usar o Sistema Financeiro, precisamos do seu consentimento para processar seus dados.
              Leia atentamente nossa Política de Privacidade e Termos de Uso.
            </p>
          </div>

          <div className="space-y-4">
            {/* Consentimento Obrigatório */}
            <div className="border border-gray-300 dark:border-gray-600 rounded-lg p-4">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={dataProcessingConsent}
                  onChange={(e) => setDataProcessingConsent(e.target.checked)}
                  className="mt-1 h-5 w-5 text-blue-600 rounded focus:ring-blue-500"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold text-gray-900 dark:text-white">
                      Processamento de Dados
                    </span>
                    <span className="text-xs bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 px-2 py-0.5 rounded-full">
                      Obrigatório
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Autorizo o processamento dos meus dados financeiros para o funcionamento do sistema.
                    Seus dados são criptografados e mantidos localmente no seu dispositivo.
                  </p>
                </div>
              </label>
            </div>

            {/* Consentimentos Opcionais */}
            <div className="border border-gray-300 dark:border-gray-600 rounded-lg p-4">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={marketingConsent}
                  onChange={(e) => setMarketingConsent(e.target.checked)}
                  className="mt-1 h-5 w-5 text-blue-600 rounded focus:ring-blue-500"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold text-gray-900 dark:text-white">
                      Comunicações e Novidades
                    </span>
                    <span className="text-xs bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 px-2 py-0.5 rounded-full">
                      Opcional
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Aceito receber notificações sobre atualizações, dicas e novos recursos do sistema.
                  </p>
                </div>
              </label>
            </div>

            <div className="border border-gray-300 dark:border-gray-600 rounded-lg p-4">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={dataShareConsent}
                  onChange={(e) => setDataShareConsent(e.target.checked)}
                  className="mt-1 h-5 w-5 text-blue-600 rounded focus:ring-blue-500"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold text-gray-900 dark:text-white">
                      Análises Anônimas
                    </span>
                    <span className="text-xs bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 px-2 py-0.5 rounded-full">
                      Opcional
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Compartilhar dados anônimos para melhorar o sistema (sem identificação pessoal).
                  </p>
                </div>
              </label>
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              onClick={() => setShowTerms(true)}
              className="flex-1 py-2 px-4 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              Ver Termos de Uso
            </button>
            <button
              onClick={() => setShowPrivacy(true)}
              className="flex-1 py-2 px-4 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              Ver Política de Privacidade
            </button>
          </div>

          <div className="space-y-3 pt-4">
            {!dataProcessingConsent && (
              <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-3 flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-amber-800 dark:text-amber-300">
                  O consentimento para processamento de dados é obrigatório para usar o sistema.
                </p>
              </div>
            )}

            <button
              onClick={handleAccept}
              disabled={!dataProcessingConsent}
              className="w-full py-3 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 font-medium transition-colors"
            >
              <CheckCircle className="h-5 w-5" />
              Aceitar e Continuar
            </button>

            <p className="text-xs text-center text-gray-500 dark:text-gray-400">
              Você pode revogar seu consentimento a qualquer momento nas configurações de privacidade.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConsentModal;
