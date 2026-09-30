import React, { useState } from 'react';
import { 
  Search, 
  Filter, 
  Info, 
  CheckCircle2, 
  AlertTriangle,
  XCircle,
  Edit3
} from 'lucide-react';
import { MonthRoster, ProfessionalCategory, ProfessionalRegime, TurmaType, ShiftType } from '../types/escala';
import { PROFESSIONALS_LIST, SHIFT_DEFINITIONS, DAY_NAMES_SHORT } from '../data/initialData';
import { AuditReport } from '../types/escala';

interface MonthlyGridProps {
  roster: MonthRoster;
  auditReport: AuditReport;
  onCellClick: (profId: string, day: number) => void;
}

export const MonthlyGrid: React.FC<MonthlyGridProps> = ({
  roster,
  auditReport,
  onCellClick,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<'ALL' | ProfessionalCategory>('ALL');
  const [regimeFilter, setRegimeFilter] = useState<'ALL' | ProfessionalRegime>('ALL');
  const [turmaFilter, setTurmaFilter] = useState<'ALL' | TurmaType>('ALL');

  // Filter professionals
  const filteredProfessionals = PROFESSIONALS_LIST.filter((prof) => {
    if (categoryFilter !== 'ALL' && prof.category !== categoryFilter) return false;
    if (regimeFilter !== 'ALL' && prof.regime !== regimeFilter) return false;
    if (turmaFilter !== 'ALL' && prof.turma !== turmaFilter) return false;
    if (searchTerm.trim() !== '') {
      const term = searchTerm.toLowerCase();
      const matchName = prof.name.toLowerCase().includes(term);
      const matchCoren = prof.coren.toLowerCase().includes(term);
      const matchRole = prof.role.toLowerCase().includes(term);
      if (!matchName && !matchCoren && !matchRole) return false;
    }
    return true;
  });

  // Days range [1..totalDays]
  const daysArray = Array.from({ length: roster.totalDays }, (_, i) => i + 1);

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xs overflow-hidden">
      
      {/* Control Bar: Filters & Search */}
      <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex flex-wrap items-center justify-between gap-3">
        
        {/* Search */}
        <div className="relative min-w-[240px] flex-1 max-w-sm">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar por nome, COREN ou cargo..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-teal-500"
          />
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center gap-2">
          
          {/* Categoria */}
          <div className="inline-flex items-center rounded-lg border border-slate-200 dark:border-slate-700 p-0.5 bg-white dark:bg-slate-800 text-xs">
            <button
              onClick={() => setCategoryFilter('ALL')}
              className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                categoryFilter === 'ALL'
                  ? 'bg-teal-600 text-white'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
              }`}
            >
              Todos ({PROFESSIONALS_LIST.length})
            </button>
            <button
              onClick={() => setCategoryFilter('ENFERMEIRO')}
              className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                categoryFilter === 'ENFERMEIRO'
                  ? 'bg-teal-600 text-white'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
              }`}
            >
              Enfermeiros (10)
            </button>
            <button
              onClick={() => setCategoryFilter('TECNICO')}
              className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                categoryFilter === 'TECNICO'
                  ? 'bg-teal-600 text-white'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
              }`}
            >
              Técnicos (10)
            </button>
          </div>

          {/* Turma / Regime */}
          <select
            value={regimeFilter}
            onChange={(e) => setRegimeFilter(e.target.value as any)}
            className="text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-700 dark:text-slate-300 focus:outline-hidden focus:ring-2 focus:ring-teal-500"
          >
            <option value="ALL">Todos os Regimes</option>
            <option value="12x36_DIURNO">12x36 Diurno (07h-19h)</option>
            <option value="12x36_NOTURNO">12x36 Noturno (19h-07h)</option>
            <option value="6x1_ASSISTENCIAL">6x1 Assistencial (6h)</option>
            <option value="6x1_APOIO">6x1 Apoio (6h)</option>
          </select>

          <select
            value={turmaFilter}
            onChange={(e) => setTurmaFilter(e.target.value as any)}
            className="text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-700 dark:text-slate-300 focus:outline-hidden focus:ring-2 focus:ring-teal-500"
          >
            <option value="ALL">Todas as Turmas</option>
            <option value="TURMA_A">Turma A (Dias Ímpares)</option>
            <option value="TURMA_B">Turma B (Dias Pares)</option>
            <option value="6X1">Equipe 6x1</option>
          </select>

        </div>
      </div>

      {/* Main Matrix Scrollable Container */}
      <div className="overflow-x-auto max-h-[720px] scrollbar-thin">
        <table className="w-full border-collapse text-left text-xs">
          
          {/* Table Header */}
          <thead className="bg-slate-100 dark:bg-slate-800/90 text-slate-700 dark:text-slate-200 sticky top-0 z-20 shadow-xs">
            <tr>
              
              {/* Sticky Professional info columns */}
              <th className="sticky left-0 z-20 bg-slate-100 dark:bg-slate-800 px-3 py-2.5 font-bold uppercase tracking-wider text-[11px] border-r border-b border-slate-200 dark:border-slate-700 w-10 text-center">
                #
              </th>
              
              <th className="sticky left-10 z-20 bg-slate-100 dark:bg-slate-800 px-3 py-2.5 font-bold uppercase tracking-wider text-[11px] border-r border-b border-slate-200 dark:border-slate-700 min-w-[210px]">
                Profissional & Regime
              </th>

              {/* Day Columns (1..31) */}
              {daysArray.map((dayNum) => {
                const date = new Date(roster.year, roster.month - 1, dayNum);
                const dayOfWeek = date.getDay();
                const isSunday = dayOfWeek === 0;
                const isSaturday = dayOfWeek === 6;

                return (
                  <th
                    key={dayNum}
                    className={`text-center px-1 py-1.5 border-r border-b border-slate-200 dark:border-slate-700 min-w-[38px] ${
                      isSunday
                        ? 'bg-rose-100/70 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 font-bold'
                        : isSaturday
                        ? 'bg-blue-50/70 dark:bg-blue-950/30 text-blue-700 dark:text-blue-300'
                        : ''
                    }`}
                  >
                    <div className="text-[10px] font-semibold tracking-tighter">
                      {DAY_NAMES_SHORT[dayOfWeek]}
                    </div>
                    <div className={`text-xs font-bold ${isSunday ? 'text-rose-600 dark:text-rose-400' : ''}`}>
                      {dayNum}
                    </div>
                  </th>
                );
              })}

              {/* Metric Summary Headers */}
              <th className="text-center px-2 py-2 font-bold uppercase tracking-wider text-[10px] border-r border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 min-w-[55px]">
                Plantões
              </th>
              <th className="text-center px-2 py-2 font-bold uppercase tracking-wider text-[10px] border-r border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 min-w-[55px]">
                Horas
              </th>
              <th className="text-center px-2 py-2 font-bold uppercase tracking-wider text-[10px] border-r border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 min-w-[55px]">
                Folgas
              </th>
              <th className="text-center px-2 py-2 font-bold uppercase tracking-wider text-[10px] border-r border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 min-w-[65px]">
                Dom. Off
              </th>
              <th className="text-center px-2 py-2 font-bold uppercase tracking-wider text-[10px] border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 min-w-[75px]">
                CLT
              </th>

            </tr>
          </thead>

          {/* Table Body */}
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {filteredProfessionals.map((prof, idx) => {
              const days = roster.records[prof.id] || [];
              const stats = auditReport.statsByProfessional[prof.id];

              const isNurse = prof.category === 'ENFERMEIRO';
              const is12x36 = prof.regime === '12x36_DIURNO' || prof.regime === '12x36_NOTURNO';

              return (
                <tr 
                  key={prof.id}
                  className="hover:bg-teal-50/30 dark:hover:bg-teal-950/20 transition-colors group"
                >
                  {/* Order Number */}
                  <td className="sticky left-0 z-10 bg-white dark:bg-slate-900 group-hover:bg-teal-50/40 dark:group-hover:bg-slate-800/80 px-2 py-2 text-center font-mono font-medium text-slate-400 border-r border-slate-200 dark:border-slate-700">
                    {prof.orderNumber}
                  </td>

                  {/* Professional Info */}
                  <td className="sticky left-10 z-10 bg-white dark:bg-slate-900 group-hover:bg-teal-50/40 dark:group-hover:bg-slate-800/80 px-3 py-2 border-r border-slate-200 dark:border-slate-700">
                    <div className="flex flex-col">
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-slate-900 dark:text-slate-100 truncate max-w-[150px]">
                          {prof.name}
                        </span>
                        {prof.gender === 'F' ? (
                          <span className="text-[10px] text-pink-600 dark:text-pink-400 font-semibold" title="Mulher (Art. 386 CLT)">♀</span>
                        ) : (
                          <span className="text-[10px] text-blue-600 dark:text-blue-400 font-semibold" title="Homem (Portaria 671 MTP)">♂</span>
                        )}
                      </div>

                      <div className="flex items-center gap-1 mt-0.5">
                        <span className={`text-[10px] px-1.5 py-0.2 rounded-sm font-semibold ${
                          isNurse 
                            ? 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300' 
                            : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                        }`}>
                          {isNurse ? 'ENF' : 'TÉC'}
                        </span>
                        
                        <span className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
                          {prof.turma === 'TURMA_A' ? 'Turma A (Ímpares)' : prof.turma === 'TURMA_B' ? 'Turma B (Pares)' : '6x1 Escala'}
                        </span>
                      </div>
                      
                      <span className="text-[9px] text-slate-400 dark:text-slate-500 font-mono mt-0.5">
                        {prof.coren}
                      </span>
                    </div>
                  </td>

                  {/* Day Cells (1..31) */}
                  {daysArray.map((dayNum) => {
                    const dayData = days[dayNum - 1];
                    const shiftDef = dayData ? SHIFT_DEFINITIONS[dayData.shiftType] : SHIFT_DEFINITIONS.F;
                    const isSunday = dayData ? dayData.isSunday : false;
                    const isSaturday = dayData ? dayData.isSaturday : false;

                    return (
                      <td
                        key={dayNum}
                        onClick={() => onCellClick(prof.id, dayNum)}
                        className={`text-center px-0.5 py-1.5 border-r border-slate-200/70 dark:border-slate-800 cursor-pointer select-none transition-transform hover:scale-105 ${
                          isSunday ? 'bg-rose-50/40 dark:bg-rose-950/20' : isSaturday ? 'bg-blue-50/30 dark:bg-blue-950/15' : ''
                        }`}
                        title={`${prof.name} - Dia ${dayNum}: ${shiftDef.label} (${shiftDef.startTime || 'Livre'}${shiftDef.endTime ? ` às ${shiftDef.endTime}` : ''}) • Clique para editar turno`}
                      >
                        <div
                          className={`w-7 h-7 mx-auto rounded-md flex items-center justify-center font-bold text-[11px] border transition-all ${shiftDef.colorBg} ${shiftDef.colorText} ${shiftDef.borderColor} ${
                            dayData?.isCustomModified ? 'ring-2 ring-amber-500 ring-offset-1 dark:ring-offset-slate-900' : ''
                          }`}
                        >
                          {dayData?.shiftType}
                        </div>
                      </td>
                    );
                  })}

                  {/* Metrics Columns */}
                  <td className="text-center px-2 py-2 font-semibold text-slate-800 dark:text-slate-200 border-r border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/40">
                    {stats?.totalShiftsCount || 0}
                  </td>
                  <td className="text-center px-2 py-2 font-bold text-teal-700 dark:text-teal-300 border-r border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/40 font-mono">
                    {stats?.totalWorkHours || 0}h
                  </td>
                  <td className="text-center px-2 py-2 text-slate-600 dark:text-slate-400 border-r border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/40">
                    {stats?.totalRSRCount || 0}
                  </td>
                  <td className="text-center px-2 py-2 font-semibold border-r border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/40">
                    <span className="inline-flex items-center gap-1 text-slate-800 dark:text-slate-200">
                      {stats?.totalSundayOffs || 0}/{stats?.totalSundaysInMonth || 4}
                      {(stats?.totalSundayOffs || 0) >= 2 && (
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" title="Folga dominical quinzenal cumprida" />
                      )}
                    </span>
                  </td>
                  
                  {/* CLT Status */}
                  <td className="text-center px-2 py-2 border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/40">
                    {stats?.status === 'CONFORME' ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 dark:text-emerald-400">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                        100% OK
                      </span>
                    ) : stats?.status === 'ALERTA' ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-700 dark:text-amber-400" title="Ver no Painel de Auditoria">
                        <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
                        Alerta
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-rose-700 dark:text-rose-400" title="Infração da CLT detectada">
                        <XCircle className="w-3.5 h-3.5 text-rose-500" />
                        Violação
                      </span>
                    )}
                  </td>

                </tr>
              );
            })}
          </tbody>

        </table>
      </div>

      {/* Legend Footer */}
      <div className="p-4 bg-slate-50 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-4 text-xs">
        <div className="flex flex-wrap items-center gap-3">
          <span className="font-semibold text-slate-700 dark:text-slate-300">Legenda de Turnos:</span>
          
          {Object.values(SHIFT_DEFINITIONS).map((shift) => (
            <div key={shift.code} className="flex items-center gap-1.5">
              <span className={`w-5 h-5 rounded-md flex items-center justify-center font-bold text-[10px] border ${shift.colorBg} ${shift.colorText} ${shift.borderColor}`}>
                {shift.code}
              </span>
              <span className="text-slate-600 dark:text-slate-400">
                {shift.shortLabel}
              </span>
            </div>
          ))}
        </div>

        <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 text-[11px]">
          <Edit3 className="w-3.5 h-3.5 text-teal-600" />
          <span>Dica: Dê um clique em qualquer dia da grade para alterar o turno ou permutar.</span>
        </div>
      </div>

    </div>
  );
};
