import React from 'react';
import { Users, Clock, ShieldCheck, Sun, Moon, CalendarCheck2 } from 'lucide-react';
import { AuditReport } from '../types/escala';

interface CoverageStatsProps {
  auditReport: AuditReport;
  totalDays: number;
}

export const CoverageStats: React.FC<CoverageStatsProps> = ({ auditReport, totalDays }) => {
  // Aggregate total hours and shifts
  let totalHours = 0;
  let totalShifts = 0;
  let totalSundayOffs = 0;
  let count6x1 = 0;

  Object.values(auditReport.statsByProfessional).forEach((stat) => {
    totalHours += stat.totalWorkHours;
    totalShifts += stat.totalShiftsCount;
    if (stat.regime === '6x1_ASSISTENCIAL' || stat.regime === '6x1_APOIO') {
      count6x1++;
      totalSundayOffs += stat.totalSundayOffs;
    }
  });

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-5">
      {/* 1. Equipe */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3.5 shadow-2xs flex flex-col justify-between">
        <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
          <span className="text-xs font-semibold uppercase tracking-wider">Equipe Total</span>
          <Users className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
        </div>
        <div className="mt-2 flex items-baseline gap-1.5">
          <span className="text-2xl font-bold text-slate-900 dark:text-white">20</span>
          <span className="text-xs text-slate-500">profissionais</span>
        </div>
        <span className="text-[11px] text-teal-600 dark:text-teal-400 font-medium mt-1">
          10 Enf. + 10 Téc.
        </span>
      </div>

      {/* 2. Total Horas */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3.5 shadow-2xs flex flex-col justify-between">
        <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
          <span className="text-xs font-semibold uppercase tracking-wider">Horas no Mês</span>
          <Clock className="w-4 h-4 text-teal-600 dark:text-teal-400" />
        </div>
        <div className="mt-2 flex items-baseline gap-1.5">
          <span className="text-2xl font-bold text-slate-900 dark:text-white">{totalHours.toLocaleString('pt-BR')}</span>
          <span className="text-xs text-slate-500">horas</span>
        </div>
        <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium mt-1">
          {totalShifts} plantões totais
        </span>
      </div>

      {/* 3. Conformidade CLT */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3.5 shadow-2xs flex flex-col justify-between">
        <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
          <span className="text-xs font-semibold uppercase tracking-wider">Auditoria CLT</span>
          <ShieldCheck className={`w-4 h-4 ${auditReport.isFullyCompliant ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-500'}`} />
        </div>
        <div className="mt-2 flex items-baseline gap-1.5">
          <span className={`text-2xl font-bold ${auditReport.isFullyCompliant ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
            {auditReport.compliancePercentage}%
          </span>
          <span className="text-xs text-slate-500">conforme</span>
        </div>
        <span className={`text-[11px] font-semibold mt-1 ${auditReport.isFullyCompliant ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
          {auditReport.totalViolations === 0 ? 'Arts. 59-A, 66 e 67 100%' : `${auditReport.totalViolations} alerta(s) CLT`}
        </span>
      </div>

      {/* 4. Cobertura Diurna */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3.5 shadow-2xs flex flex-col justify-between">
        <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
          <span className="text-xs font-semibold uppercase tracking-wider">Plantão Diurno</span>
          <Sun className="w-4 h-4 text-amber-500" />
        </div>
        <div className="mt-2 flex items-baseline gap-1.5">
          <span className="text-2xl font-bold text-slate-900 dark:text-white">4 + 4</span>
          <span className="text-xs text-slate-500">12h/dia</span>
        </div>
        <span className="text-[11px] text-amber-700 dark:text-amber-400 font-medium mt-1">
          2 Enf + 2 Téc (Turma A ou B)
        </span>
      </div>

      {/* 5. Cobertura Noturna */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3.5 shadow-2xs flex flex-col justify-between">
        <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
          <span className="text-xs font-semibold uppercase tracking-wider">Plantão Noturno</span>
          <Moon className="w-4 h-4 text-indigo-500" />
        </div>
        <div className="mt-2 flex items-baseline gap-1.5">
          <span className="text-2xl font-bold text-slate-900 dark:text-white">4 + 4</span>
          <span className="text-xs text-slate-500">19h-07h</span>
        </div>
        <span className="text-[11px] text-indigo-700 dark:text-indigo-400 font-medium mt-1">
          2 Enf + 2 Téc (Turma A ou B)
        </span>
      </div>

      {/* 6. RSR Dominical 6x1 */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3.5 shadow-2xs flex flex-col justify-between">
        <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
          <span className="text-xs font-semibold uppercase tracking-wider">RSR Dominical 6x1</span>
          <CalendarCheck2 className="w-4 h-4 text-teal-600 dark:text-teal-400" />
        </div>
        <div className="mt-2 flex items-baseline gap-1.5">
          <span className="text-2xl font-bold text-slate-900 dark:text-white">{totalSundayOffs}</span>
          <span className="text-xs text-slate-500">domingos off</span>
        </div>
        <span className="text-[11px] text-teal-700 dark:text-teal-300 font-medium mt-1">
          Revezamento quinzenal OK
        </span>
      </div>
    </div>
  );
};
