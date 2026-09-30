/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo, useTransition } from 'react';
import { Header } from './components/Header';
import { CoverageStats } from './components/CoverageStats';
import { MonthlyGrid } from './components/MonthlyGrid';
import { DailyView } from './components/DailyView';
import { AuditPanel } from './components/AuditPanel';
import { SwapModal } from './components/SwapModal';
import { ShiftEditModal } from './components/ShiftEditModal';
import { SupabaseModal } from './components/SupabaseModal';
import { ExportModal } from './components/ExportModal';

import { MonthRoster, ShiftType, SupabaseConfig, Professional } from './types/escala';
import { generateMonthlySchedule, PROFESSIONALS_LIST, MONTH_NAMES } from './data/initialData';
import { runCLTAudit } from './utils/cltAudit';
import { 
  getSavedSupabaseConfig, 
  syncRosterToDatabase, 
  loadRosterFromDatabase 
} from './lib/supabase';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
}

export default function App() {
  // State: Default is October 2026 as requested in prompt
  const [currentMonth, setCurrentMonth] = useState<number>(10);
  const [currentYear, setCurrentYear] = useState<number>(2026);
  const [activeTab, setActiveTab] = useState<'grid' | 'daily' | 'audit' | 'swap'>('grid');

  // Supabase Configuration State
  const [supabaseConfig, setSupabaseConfig] = useState<SupabaseConfig>(getSavedSupabaseConfig());
  const [isSaving, setIsSaving] = useState(false);

  // Month Roster State
  const [roster, setRoster] = useState<MonthRoster>(() => {
    return generateMonthlySchedule(2026, 10);
  });

  // Modal States
  const [isSupabaseModalOpen, setIsSupabaseModalOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);

  // Cell Edit Modal
  const [editingCell, setEditingCell] = useState<{
    professional: Professional | null;
    day: number;
    currentShift: ShiftType;
  } | null>(null);

  // Toasts
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    const id = `${Date.now()}-${Math.random()}`;
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4500);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Run CLT Audit automatically whenever the roster changes
  const auditReport = useMemo(() => {
    return runCLTAudit(roster);
  }, [roster]);

  // Load from database/storage when month/year changes
  useEffect(() => {
    let isMounted = true;
    loadRosterFromDatabase(currentYear, currentMonth).then(({ roster: loadedRoster, source }) => {
      if (!isMounted) return;
      if (loadedRoster) {
        setRoster(loadedRoster);
        if (source === 'supabase') {
          addToast(`Escala de ${MONTH_NAMES[currentMonth - 1]}/${currentYear} carregada do Supabase!`, 'success');
        }
      } else {
        setRoster(generateMonthlySchedule(currentYear, currentMonth));
      }
    });
    return () => {
      isMounted = false;
    };
  }, [currentMonth, currentYear]);

  // Handle Month Change
  const handleMonthChange = (month: number, year: number) => {
    setCurrentMonth(month);
    setCurrentYear(year);
  };

  // Open Edit Cell
  const handleCellClick = (profId: string, day: number) => {
    const prof = PROFESSIONALS_LIST.find((p) => p.id === profId) || null;
    const currentShift = roster.records[profId]?.[day - 1]?.shiftType || 'F';
    setEditingCell({
      professional: prof,
      day,
      currentShift,
    });
  };

  // Save Shift Edit
  const handleSaveShift = (profId: string, day: number, newShift: ShiftType, note?: string) => {
    setRoster((prev) => {
      const records = { ...prev.records };
      const days = [...(records[profId] || [])];
      if (days[day - 1]) {
        days[day - 1] = {
          ...days[day - 1],
          shiftType: newShift,
          isCustomModified: true,
          note: note || days[day - 1].note,
        };
        records[profId] = days;
      }
      return {
        ...prev,
        records,
        updatedAt: new Date().toISOString(),
      };
    });

    const prof = PROFESSIONALS_LIST.find((p) => p.id === profId);
    addToast(`Turno de ${prof?.name} no Dia ${day} alterado para ${newShift}`, 'info');
  };

  // Execute Swap between two professionals
  const handleExecuteSwap = (prof1Id: string, day1: number, prof2Id: string, day2: number) => {
    setRoster((prev) => {
      const records = { ...prev.records };
      const days1 = [...(records[prof1Id] || [])];
      const days2 = [...(records[prof2Id] || [])];

      const shift1 = days1[day1 - 1]?.shiftType || 'F';
      const shift2 = days2[day2 - 1]?.shiftType || 'F';

      if (days1[day1 - 1]) {
        days1[day1 - 1] = {
          ...days1[day1 - 1],
          shiftType: shift2,
          isCustomModified: true,
          note: 'Permuta de plantão',
        };
      }

      if (days2[day2 - 1]) {
        days2[day2 - 1] = {
          ...days2[day2 - 1],
          shiftType: shift1,
          isCustomModified: true,
          note: 'Permuta de plantão',
        };
      }

      records[prof1Id] = days1;
      records[prof2Id] = days2;

      return {
        ...prev,
        records,
        updatedAt: new Date().toISOString(),
      };
    });
  };

  // Save to Supabase action
  const handleSaveToSupabase = async () => {
    setIsSaving(true);
    try {
      const result = await syncRosterToDatabase(roster, auditReport);
      if (result.mode === 'supabase') {
        addToast(result.message, 'success');
      } else {
        addToast(result.message, 'info');
      }
    } catch (e: any) {
      addToast(`Erro: ${e.message}`, 'error');
    } finally {
      setIsSaving(false);
    }
  };

  // Reset to legal standard schedule
  const handleResetToDefault = () => {
    const cleanRoster = generateMonthlySchedule(currentYear, currentMonth);
    setRoster(cleanRoster);
    addToast(`Escala padrão de ${MONTH_NAMES[currentMonth - 1]}/${currentYear} restaurada com 100% de conformidade CLT!`, 'success');
  };

  // Simulate CLT violation for demonstration
  const handleSimulateViolation = () => {
    setRoster((prev) => {
      const records = { ...prev.records };
      // Assign an extra shift to Camila Ribeiro (enf-1, 12x36 Diurno Turma A) on Day 2 (even day)
      // This violates Art. 59-A (no 36h rest) and creates 2 consecutive 12h shifts!
      const days = [...(records['enf-1'] || [])];
      if (days[1]) {
        days[1] = {
          ...days[1],
          shiftType: 'PD',
          isCustomModified: true,
          note: 'Simulação de troca irregular',
        };
        records['enf-1'] = days;
      }
      return {
        ...prev,
        records,
        updatedAt: new Date().toISOString(),
      };
    });
    addToast('Simulação aplicada: Camila Ribeiro escalada em dias consecutivos (D1 e D2). Observe o alerta no Painel de Auditoria!', 'error');
    setActiveTab('audit');
  };

  return (
    <div className="min-h-screen bg-slate-100/70 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col antialiased selection:bg-teal-500 selection:text-white">
      
      {/* App Header */}
      <Header
        currentMonth={currentMonth}
        currentYear={currentYear}
        onMonthChange={handleMonthChange}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        supabaseConfig={supabaseConfig}
        onOpenSupabaseModal={() => setIsSupabaseModalOpen(true)}
        onSaveToSupabase={handleSaveToSupabase}
        isSaving={isSaving}
        onResetToDefault={handleResetToDefault}
        onOpenExportModal={() => setIsExportModalOpen(true)}
        isFullyCompliant={auditReport.isFullyCompliant}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-5">
        
        {/* Top Coverage Key Metrics */}
        <CoverageStats auditReport={auditReport} totalDays={roster.totalDays} />

        {/* Tab 1: Grade Mensal Completa */}
        {activeTab === 'grid' && (
          <MonthlyGrid
            roster={roster}
            auditReport={auditReport}
            onCellClick={handleCellClick}
          />
        )}

        {/* Tab 2: Visão Diária & Cobertura */}
        {activeTab === 'daily' && (
          <DailyView
            roster={roster}
            onEditCell={handleCellClick}
          />
        )}

        {/* Tab 3: Painel de Auditoria CLT */}
        {activeTab === 'audit' && (
          <AuditPanel
            auditReport={auditReport}
            roster={roster}
            onSimulateViolation={handleSimulateViolation}
            onResetSchedule={handleResetToDefault}
            onOpenExportModal={() => setIsExportModalOpen(true)}
          />
        )}

        {/* Tab 4: Módulo de Permuta */}
        {activeTab === 'swap' && (
          <SwapModal
            roster={roster}
            onExecuteSwap={handleExecuteSwap}
            onShowToast={addToast}
          />
        )}

      </main>

      {/* Footer */}
      <footer className="bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 py-4 px-4 text-center text-xs text-slate-500 dark:text-slate-400">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <div>
            <strong>Sistema de Gestão de Escalas de Enfermagem</strong> • Conforme CLT Arts. 59-A, 66 e 67 • STF Tema 1023 • OJ 410 TST
          </div>
          <div className="flex items-center gap-3 text-[11px]">
            <button
              onClick={() => setIsSupabaseModalOpen(true)}
              className="hover:text-teal-600 underline font-medium"
            >
              Configurar Supabase
            </button>
            <span>•</span>
            <button
              onClick={handleResetToDefault}
              className="hover:text-teal-600 underline font-medium"
            >
              Restaurar Outubro/2026
            </button>
            <span>•</span>
            <span>20 Profissionais Hospitalares</span>
          </div>
        </div>
      </footer>

      {/* Cell Edit Modal */}
      {editingCell && (
        <ShiftEditModal
          isOpen={Boolean(editingCell)}
          onClose={() => setEditingCell(null)}
          professional={editingCell.professional}
          day={editingCell.day}
          month={currentMonth}
          year={currentYear}
          currentShift={editingCell.currentShift}
          onSaveShift={handleSaveShift}
        />
      )}

      {/* Supabase Connection Modal */}
      <SupabaseModal
        isOpen={isSupabaseModalOpen}
        onClose={() => setIsSupabaseModalOpen(false)}
        config={supabaseConfig}
        onConfigUpdated={(cfg) => setSupabaseConfig(cfg)}
        roster={roster}
        auditReport={auditReport}
        onShowToast={addToast}
      />

      {/* Export / Print Modal */}
      <ExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        roster={roster}
        auditReport={auditReport}
        onShowToast={addToast}
      />

      {/* Floating Toast Notifications */}
      <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`pointer-events-auto p-3 rounded-xl shadow-lg border text-xs flex items-center justify-between gap-3 animate-in slide-in-from-bottom-2 ${
              toast.type === 'success'
                ? 'bg-emerald-900 text-emerald-100 border-emerald-700'
                : toast.type === 'error'
                ? 'bg-rose-900 text-rose-100 border-rose-700'
                : 'bg-slate-900 text-slate-100 border-slate-700'
            }`}
          >
            <div className="flex items-center gap-2">
              {toast.type === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />}
              {toast.type === 'error' && <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />}
              {toast.type === 'info' && <Info className="w-4 h-4 text-teal-400 shrink-0" />}
              <span>{toast.message}</span>
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="text-slate-400 hover:text-white p-0.5"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>

    </div>
  );
}
