import React, { useState } from 'react';
import { 
  Database, 
  X, 
  Check, 
  Copy, 
  Server, 
  ShieldCheck, 
  KeyRound, 
  Link, 
  RefreshCw,
  ExternalLink,
  Code2,
  AlertCircle
} from 'lucide-react';
import { SupabaseConfig, MonthRoster, AuditReport } from '../types/escala';
import { 
  getSavedSupabaseConfig, 
  saveSupabaseConfig, 
  testSupabaseConnection, 
  syncRosterToDatabase, 
  getSupabaseSQLScript 
} from '../lib/supabase';

interface SupabaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: SupabaseConfig;
  onConfigUpdated: (newConfig: SupabaseConfig) => void;
  roster: MonthRoster;
  auditReport: AuditReport;
  onShowToast: (msg: string, type: 'success' | 'error' | 'info') => void;
}

export const SupabaseModal: React.FC<SupabaseModalProps> = ({
  isOpen,
  onClose,
  config,
  onConfigUpdated,
  roster,
  auditReport,
  onShowToast,
}) => {
  if (!isOpen) return null;

  const [url, setUrl] = useState(config.url || '');
  const [anonKey, setAnonKey] = useState(config.anonKey || '');
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [copiedSQL, setCopiedSQL] = useState(false);
  const [activeTab, setActiveTab] = useState<'config' | 'sql'>('config');

  const sqlScript = getSupabaseSQLScript();

  const handleTestConnection = async () => {
    setIsTesting(true);
    setTestResult(null);
    try {
      const result = await testSupabaseConnection(url.trim(), anonKey.trim());
      setTestResult(result);
      if (result.success) {
        onShowToast('Conexão com o Supabase bem-sucedida!', 'success');
      } else {
        onShowToast(result.message, 'error');
      }
    } catch (e: any) {
      setTestResult({ success: false, message: e.message || 'Erro ao conectar' });
    } finally {
      setIsTesting(false);
    }
  };

  const handleSaveAndSync = async () => {
    setIsSaving(true);
    try {
      const updatedConfig = saveSupabaseConfig({
        url: url.trim(),
        anonKey: anonKey.trim(),
        isConnected: Boolean(url.trim() && anonKey.trim()),
      });
      onConfigUpdated(updatedConfig);

      // Now sync the current roster
      const syncResult = await syncRosterToDatabase(roster, auditReport);
      if (syncResult.success) {
        onShowToast(syncResult.message, 'success');
        onClose();
      } else {
        onShowToast(syncResult.message, 'error');
      }
    } catch (err: any) {
      onShowToast(`Erro ao sincronizar: ${err.message}`, 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCopySQL = () => {
    navigator.clipboard.writeText(sqlScript);
    setCopiedSQL(true);
    onShowToast('Script SQL copiado para a área de transferência!', 'success');
    setTimeout(() => setCopiedSQL(false), 3000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-2xl w-full shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Modal Header */}
        <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-900/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-100 dark:bg-teal-950 flex items-center justify-center text-teal-600 dark:text-teal-400">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                Conexão com Banco de Dados Supabase
              </h3>
              <p className="text-xs text-slate-500">
                Pronto para persistir e guardar as escalas e auditorias na nuvem
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Tabs */}
        <div className="flex border-b border-slate-200 dark:border-slate-800 px-5 bg-slate-50/50 dark:bg-slate-900/30">
          <button
            onClick={() => setActiveTab('config')}
            className={`py-2.5 px-3 text-xs font-bold border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'config'
                ? 'border-teal-600 text-teal-600 dark:text-teal-400'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <KeyRound className="w-3.5 h-3.5" />
            Configuração da Conexão
          </button>
          <button
            onClick={() => setActiveTab('sql')}
            className={`py-2.5 px-3 text-xs font-bold border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'sql'
                ? 'border-teal-600 text-teal-600 dark:text-teal-400'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Code2 className="w-3.5 h-3.5" />
            Script SQL do Supabase (Tabelas)
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto space-y-4 flex-1">
          {activeTab === 'config' ? (
            <div className="space-y-4">
              
              <div className="p-3 bg-teal-50/70 dark:bg-teal-950/30 border border-teal-200 dark:border-teal-800 rounded-xl text-xs text-teal-900 dark:text-teal-200 flex items-start gap-2.5">
                <ShieldCheck className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="font-semibold">O sistema já está 100% pronto para se comunicar com o Supabase.</p>
                  <p className="text-[11px] text-teal-800 dark:text-teal-300">
                    Insira as chaves do seu projeto abaixo para guardar todos os turnos dos 20 profissionais e o histórico de auditoria CLT diretamente no seu banco de dados PostgreSQL.
                  </p>
                </div>
              </div>

              {/* Supabase URL */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center justify-between">
                  <span>URL do Projeto Supabase (Project URL)</span>
                  <span className="text-[11px] font-normal text-slate-400">ex: https://xyz.supabase.co</span>
                </label>
                <div className="relative">
                  <Link className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder="https://seu-projeto.supabase.co"
                    className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-teal-500 font-mono"
                  />
                </div>
              </div>

              {/* Supabase Anon Key */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center justify-between">
                  <span>Chave Pública Anon (Project Anon Key)</span>
                  <span className="text-[11px] font-normal text-slate-400">Settings &gt; API &gt; Project API keys</span>
                </label>
                <div className="relative">
                  <KeyRound className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="password"
                    value={anonKey}
                    onChange={(e) => setAnonKey(e.target.value)}
                    placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                    className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-teal-500 font-mono"
                  />
                </div>
              </div>

              {/* Status Feedback */}
              {testResult && (
                <div className={`p-3 rounded-lg text-xs flex items-center gap-2 ${
                  testResult.success 
                    ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border border-emerald-200' 
                    : 'bg-rose-50 dark:bg-rose-950/40 text-rose-800 dark:text-rose-300 border border-rose-200'
                }`}>
                  {testResult.success ? <Check className="w-4 h-4 text-emerald-600" /> : <AlertCircle className="w-4 h-4 text-rose-600" />}
                  <span>{testResult.message}</span>
                </div>
              )}

              {/* Instructions */}
              <div className="p-3 bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/60 rounded-xl space-y-2 text-xs">
                <span className="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                  <Server className="w-3.5 h-3.5 text-teal-600" />
                  Como conectar em 3 passos:
                </span>
                <ol className="list-decimal list-inside text-slate-600 dark:text-slate-400 space-y-1 text-[11px]">
                  <li>Crie um projeto gratuito em <strong>supabase.com</strong>.</li>
                  <li>Copie o <strong>Script SQL</strong> na aba acima e execute no <strong>SQL Editor</strong> do Supabase para criar as tabelas.</li>
                  <li>Cole aqui a URL e a Anon Key fornecidas em <strong>Settings &gt; API</strong> e clique em <em>Salvar e Sincronizar</em>.</li>
                </ol>
              </div>

            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                    Script DDL de Criação de Tabelas (PostgreSQL)
                  </h4>
                  <p className="text-[11px] text-slate-500">
                    Cria as tabelas <code>escala_profissionais</code>, <code>escala_mensal</code> e <code>escala_auditoria</code>.
                  </p>
                </div>

                <button
                  onClick={handleCopySQL}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-teal-600 hover:bg-teal-700 text-white transition-colors"
                >
                  {copiedSQL ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedSQL ? 'Copiado!' : 'Copiar Script'}</span>
                </button>
              </div>

              <pre className="p-3 bg-slate-950 text-slate-200 rounded-xl text-[11px] font-mono overflow-x-auto max-h-80 border border-slate-800 leading-relaxed scrollbar-thin">
                {sqlScript}
              </pre>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 flex flex-wrap items-center justify-between gap-3">
          <button
            onClick={handleTestConnection}
            disabled={isTesting || !url || !anonKey}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition-colors disabled:opacity-40"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isTesting ? 'animate-spin' : ''}`} />
            <span>{isTesting ? 'Testando...' : 'Testar Conexão'}</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-3.5 py-2 rounded-lg text-xs font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={handleSaveAndSync}
              disabled={isSaving}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold bg-teal-600 hover:bg-teal-700 text-white shadow-xs transition-colors disabled:opacity-50"
            >
              <Check className="w-3.5 h-3.5" />
              <span>{isSaving ? 'Gravando no Supabase...' : 'Salvar e Sincronizar'}</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
