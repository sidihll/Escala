import React from 'react';
import { X, Printer, Download, FileSpreadsheet, FileText, CheckCircle2 } from 'lucide-react';
import { MonthRoster, AuditReport } from '../types/escala';
import { PROFESSIONALS_LIST, MONTH_NAMES, SHIFT_DEFINITIONS, DAY_NAMES_SHORT } from '../data/initialData';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  roster: MonthRoster;
  auditReport: AuditReport;
  onShowToast: (msg: string, type: 'success' | 'error' | 'info') => void;
}

export const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  onClose,
  roster,
  auditReport,
  onShowToast,
}) => {
  if (!isOpen) return null;

  const monthYearStr = `${MONTH_NAMES[roster.month - 1]}_${roster.year}`;

  const handlePrint = () => {
    window.print();
    onShowToast('Janela de impressão/PDF aberta!', 'info');
  };

  const handleExportCSV = () => {
    const totalDays = roster.totalDays;
    
    // Header row
    const headers = [
      'Ordem',
      'Nome',
      'Categoria',
      'Cargo',
      'COREN',
      'Regime',
      'Turma',
      'Genero',
      ...Array.from({ length: totalDays }, (_, i) => `Dia_${i + 1}`),
      'Total_Plantoes',
      'Total_Horas',
      'Total_Folgas',
      'Folgas_Domingo',
      'Status_CLT'
    ];

    const rows = PROFESSIONALS_LIST.map((prof) => {
      const days = roster.records[prof.id] || [];
      const stats = auditReport.statsByProfessional[prof.id];

      const dayCols = Array.from({ length: totalDays }, (_, i) => {
        return days[i]?.shiftType || 'F';
      });

      return [
        prof.orderNumber,
        `"${prof.name}"`,
        prof.category,
        `"${prof.role}"`,
        `"${prof.coren}"`,
        prof.regime,
        prof.turma,
        prof.gender,
        ...dayCols,
        stats?.totalShiftsCount || 0,
        stats?.totalWorkHours || 0,
        stats?.totalRSRCount || 0,
        stats?.totalSundayOffs || 0,
        stats?.status || 'CONFORME'
      ].join(';');
    });

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(';'), ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Escala_Enfermagem_${monthYearStr}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    onShowToast('Planilha CSV gerada com sucesso!', 'success');
  };

  const handleExportJSON = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify({
      roster,
      auditReport,
      exportDate: new Date().toISOString()
    }, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `Escala_Hospitalar_${monthYearStr}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();

    onShowToast('Arquivo de backup JSON baixado!', 'success');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-lg w-full shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-900/50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-teal-100 dark:bg-teal-950 flex items-center justify-center text-teal-600">
              <Download className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Exportar Escala e Laudo de Auditoria
              </h3>
              <p className="text-xs text-slate-500">
                {MONTH_NAMES[roster.month - 1]} de {roster.year} • 20 Profissionais
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-3">
          
          {/* Print button */}
          <div 
            onClick={handlePrint}
            className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-teal-500 bg-white dark:bg-slate-900 hover:bg-teal-50/40 dark:hover:bg-teal-950/20 cursor-pointer transition-all flex items-center justify-between group"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-700 dark:text-slate-200 group-hover:bg-teal-600 group-hover:text-white transition-colors">
                <Printer className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs font-bold text-slate-900 dark:text-slate-100">
                  Imprimir / Salvar em PDF
                </div>
                <div className="text-[11px] text-slate-500">
                  Layout oficial formatado para fixação no posto de enfermagem e RH
                </div>
              </div>
            </div>
            <span className="text-xs font-bold text-teal-600">Imprimir</span>
          </div>

          {/* CSV Export */}
          <div 
            onClick={handleExportCSV}
            className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-emerald-500 bg-white dark:bg-slate-900 hover:bg-emerald-50/40 dark:hover:bg-emerald-950/20 cursor-pointer transition-all flex items-center justify-between group"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-700 dark:text-slate-200 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                <FileSpreadsheet className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs font-bold text-slate-900 dark:text-slate-100">
                  Exportar Planilha Excel (.CSV)
                </div>
                <div className="text-[11px] text-slate-500">
                  Compatível com Microsoft Excel, Google Sheets e sistemas de RH
                </div>
              </div>
            </div>
            <span className="text-xs font-bold text-emerald-600">Baixar CSV</span>
          </div>

          {/* JSON Backup */}
          <div 
            onClick={handleExportJSON}
            className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-indigo-500 bg-white dark:bg-slate-900 hover:bg-indigo-50/40 dark:hover:bg-indigo-950/20 cursor-pointer transition-all flex items-center justify-between group"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-700 dark:text-slate-200 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs font-bold text-slate-900 dark:text-slate-100">
                  Backup Completo de Dados (.JSON)
                </div>
                <div className="text-[11px] text-slate-500">
                  Grade de turnos, registros diários e laudo de auditoria consolidado
                </div>
              </div>
            </div>
            <span className="text-xs font-bold text-indigo-600">Baixar JSON</span>
          </div>

        </div>

        <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 flex items-center justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg text-xs font-medium text-slate-600 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
          >
            Fechar
          </button>
        </div>

      </div>
    </div>
  );
};
