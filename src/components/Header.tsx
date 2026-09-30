import React from 'react';
import { 
  Calendar, 
  ShieldCheck, 
  Database, 
  ArrowLeftRight, 
  Printer, 
  RotateCcw, 
  Sparkles,
  Save,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { MONTH_NAMES } from '../data/initialData';
import { SupabaseConfig } from '../types/escala';

interface HeaderProps {
  currentMonth: number;
  currentYear: number;
  onMonthChange: (month: number, year: number) => void;
  activeTab: 'grid' | 'daily' | 'audit' | 'swap';
  onTabChange: (tab: 'grid' | 'daily' | 'audit' | 'swap') => void;
  supabaseConfig: SupabaseConfig;
  onOpenSupabaseModal: () => void;
  onSaveToSupabase: () => void;
  isSaving: boolean;
  onResetToDefault: () => void;
  onOpenExportModal: () => void;
  isFullyCompliant: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  currentMonth,
  currentYear,
  onMonthChange,
  activeTab,
  onTabChange,
  supabaseConfig,
  onOpenSupabaseModal,
  onSaveToSupabase,
  isSaving,
  onResetToDefault,
  onOpenExportModal,
  isFullyCompliant,
}) => {
  const handlePrevMonth = () => {
    if (currentMonth === 1) {
      onMonthChange(12, currentYear - 1);
    } else {
      onMonthChange(currentMonth - 1, currentYear);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 12) {
      onMonthChange(1, currentYear + 1);
    } else {
      onMonthChange(currentMonth + 1, currentYear);
    }
  };

  return (
    <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-30 shadow-xs">
      {/* Top Banner */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        
        {/* Logo & Title */}
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-cyan-600 via-teal-500 to-emerald-400 flex items-center justify-center text-white shadow-md shadow-teal-500/20">
            <Calendar className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
                Escala Hospitalar Pro
              </h1>
              <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-teal-100 text-teal-800 dark:bg-teal-950/80 dark:text-teal-300 border border-teal-200 dark:border-teal-800">
                20 Profissionais
              </span>
              {isFullyCompliant ? (
                <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  100% CLT Conforme
                </span>
              ) : (
                <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-full bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                  <AlertCircle className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                  Alerta CLT
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Enfermagem (12x36 e 6x1) • Auditoria CLT Arts. 59-A, 66 e 67 • Supabase Ready
            </p>
          </div>
        </div>

        {/* Month Selector & Controls */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          
          {/* Month / Year Navigator */}
          <div className="inline-flex items-center rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 p-1 shadow-xs">
            <button
              onClick={handlePrevMonth}
              title="Mês Anterior"
              className="p-1.5 rounded-md hover:bg-white dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>

            <div className="px-3 py-0.5 text-center min-w-[140px]">
              <span className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                {MONTH_NAMES[currentMonth - 1]} {currentYear}
              </span>
            </div>

            <button
              onClick={handleNextMonth}
              title="Próximo Mês"
              className="p-1.5 rounded-md hover:bg-white dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>

          {/* Supabase Status Button */}
          <button
            onClick={onOpenSupabaseModal}
            className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
              supabaseConfig.isConnected
                ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-700 hover:bg-emerald-100'
                : 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border-amber-300 dark:border-amber-700 hover:bg-amber-100'
            }`}
            title="Gerenciar conexão Supabase"
          >
            <Database className="w-3.5 h-3.5" />
            <span className="hidden lg:inline">
              {supabaseConfig.isConnected ? 'Supabase Conectado' : 'Conectar Supabase'}
            </span>
            <span className={`w-2 h-2 rounded-full ${supabaseConfig.isConnected ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
          </button>

          {/* Quick Action: Save to Supabase */}
          <button
            onClick={onSaveToSupabase}
            disabled={isSaving}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-teal-600 hover:bg-teal-700 text-white shadow-xs transition-colors disabled:opacity-50"
            title="Salvar escala no banco de dados"
          >
            <Save className={`w-3.5 h-3.5 ${isSaving ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">{isSaving ? 'Salvando...' : 'Salvar'}</span>
          </button>

          {/* Print / Export */}
          <button
            onClick={onOpenExportModal}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 transition-colors"
            title="Imprimir ou exportar escala"
          >
            <Printer className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Exportar / Imprimir</span>
          </button>

          {/* Reset button */}
          <button
            onClick={onResetToDefault}
            className="p-1.5 rounded-lg text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title="Restaurar escala padrão de Outubro de 2026"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 border-t border-slate-100 dark:border-slate-800/80">
        <nav className="flex space-x-2 sm:space-x-4 overflow-x-auto py-2">
          
          <button
            onClick={() => onTabChange('grid')}
            className={`inline-flex items-center gap-2 px-3.5 py-1.5 text-xs sm:text-sm font-semibold rounded-lg transition-colors whitespace-nowrap ${
              activeTab === 'grid'
                ? 'bg-teal-500/10 text-teal-700 dark:text-teal-300 border border-teal-500/30'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Calendar className="w-4 h-4 text-teal-600 dark:text-teal-400" />
            Grade Mensal Completa (1 a 31)
          </button>

          <button
            onClick={() => onTabChange('daily')}
            className={`inline-flex items-center gap-2 px-3.5 py-1.5 text-xs sm:text-sm font-semibold rounded-lg transition-colors whitespace-nowrap ${
              activeTab === 'daily'
                ? 'bg-cyan-500/10 text-cyan-700 dark:text-cyan-300 border border-cyan-500/30'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Sparkles className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
            Visão Diária & Cobertura
          </button>

          <button
            onClick={() => onTabChange('audit')}
            className={`inline-flex items-center gap-2 px-3.5 py-1.5 text-xs sm:text-sm font-semibold rounded-lg transition-colors whitespace-nowrap ${
              activeTab === 'audit'
                ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            Painel de Auditoria CLT (Art. 59-A, 66 e 67)
            {isFullyCompliant ? (
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
            ) : (
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
            )}
          </button>

          <button
            onClick={() => onTabChange('swap')}
            className={`inline-flex items-center gap-2 px-3.5 py-1.5 text-xs sm:text-sm font-semibold rounded-lg transition-colors whitespace-nowrap ${
              activeTab === 'swap'
                ? 'bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 border border-indigo-500/30'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <ArrowLeftRight className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            Troca de Plantão (Permuta)
          </button>

        </nav>
      </div>
    </header>
  );
};
