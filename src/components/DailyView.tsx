import React, { useState } from 'react';
import { 
  Sun, 
  Moon, 
  Sunrise, 
  Sunset, 
  Coffee, 
  ShieldCheck, 
  AlertCircle,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Clock
} from 'lucide-react';
import { MonthRoster, ShiftType, Professional } from '../types/escala';
import { PROFESSIONALS_LIST, MONTH_NAMES, DAY_NAMES_SHORT, SHIFT_DEFINITIONS } from '../data/initialData';

interface DailyViewProps {
  roster: MonthRoster;
  onEditCell: (profId: string, day: number) => void;
}

export const DailyView: React.FC<DailyViewProps> = ({ roster, onEditCell }) => {
  const [selectedDay, setSelectedDay] = useState(1);

  const totalDays = roster.totalDays;
  const date = new Date(roster.year, roster.month - 1, selectedDay);
  const dayOfWeek = date.getDay();
  const isSunday = dayOfWeek === 0;
  const isSaturday = dayOfWeek === 6;

  // Group professionals by shift on selected day
  const diurno12h: Professional[] = [];
  const noturno12h: Professional[] = [];
  const manha6h: Professional[] = [];
  const tarde6h: Professional[] = [];
  const folgas: Professional[] = [];

  PROFESSIONALS_LIST.forEach((prof) => {
    const dayData = roster.records[prof.id]?.[selectedDay - 1];
    const shiftType: ShiftType = dayData ? dayData.shiftType : 'F';

    if (shiftType === 'PD') diurno12h.push(prof);
    else if (shiftType === 'PN') noturno12h.push(prof);
    else if (shiftType === 'M') manha6h.push(prof);
    else if (shiftType === 'T') tarde6h.push(prof);
    else folgas.push(prof);
  });

  const diurnoEnfermeiros = diurno12h.filter(p => p.category === 'ENFERMEIRO');
  const diurnoTecnicos = diurno12h.filter(p => p.category === 'TECNICO');

  const noturnoEnfermeiros = noturno12h.filter(p => p.category === 'ENFERMEIRO');
  const noturnoTecnicos = noturno12h.filter(p => p.category === 'TECNICO');

  const manhaEnfermeiros = manha6h.filter(p => p.category === 'ENFERMEIRO');
  const manhaTecnicos = manha6h.filter(p => p.category === 'TECNICO');

  const tardeEnfermeiros = tarde6h.filter(p => p.category === 'ENFERMEIRO');
  const tardeTecnicos = tarde6h.filter(p => p.category === 'TECNICO');

  return (
    <div className="space-y-6">
      
      {/* Day Picker Toolbar */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1">
            <button
              onClick={() => setSelectedDay(Math.max(1, selectedDay - 1))}
              disabled={selectedDay === 1}
              className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 transition-colors"
              title="Dia anterior"
            >
              <ChevronLeft className="w-5 h-5 text-slate-700 dark:text-slate-300" />
            </button>
            <button
              onClick={() => setSelectedDay(Math.min(totalDays, selectedDay + 1))}
              disabled={selectedDay === totalDays}
              className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 transition-colors"
              title="Próximo dia"
            >
              <ChevronRight className="w-5 h-5 text-slate-700 dark:text-slate-300" />
            </button>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                Dia {selectedDay} de {MONTH_NAMES[roster.month - 1]} de {roster.year}
              </h2>
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                isSunday 
                  ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300' 
                  : isSaturday 
                  ? 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300' 
                  : 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300'
              }`}>
                {DAY_NAMES_SHORT[dayOfWeek]}feira {isSunday ? '• Domingo' : ''}
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Distribuição de postos de trabalho da equipe de 20 profissionais no plantão
            </p>
          </div>
        </div>

        {/* Quick Day Chips Slider */}
        <div className="flex items-center gap-1 overflow-x-auto py-1 max-w-full sm:max-w-md scrollbar-thin">
          {Array.from({ length: totalDays }, (_, i) => i + 1).map((d) => {
            const curDate = new Date(roster.year, roster.month - 1, d);
            const isSun = curDate.getDay() === 0;
            return (
              <button
                key={d}
                onClick={() => setSelectedDay(d)}
                className={`w-8 h-8 shrink-0 rounded-lg text-xs font-bold transition-all ${
                  selectedDay === d
                    ? 'bg-teal-600 text-white shadow-xs scale-105'
                    : isSun
                    ? 'bg-rose-50 text-rose-700 dark:bg-rose-950/50 dark:text-rose-300 hover:bg-rose-100'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
                }`}
              >
                {d}
              </button>
            );
          })}
        </div>

      </div>

      {/* Shifts Breakdown Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* 1. Plantão Diurno 12x36 */}
        <div className="bg-white dark:bg-slate-900 border border-amber-200 dark:border-amber-900/60 rounded-xl p-4 shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-amber-100 dark:border-amber-950">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-amber-100 dark:bg-amber-950 flex items-center justify-center text-amber-600">
                <Sun className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                  Plantão Diurno 12h
                </h3>
                <span className="text-[11px] text-amber-700 dark:text-amber-400 font-mono">
                  07:00 às 19:00
                </span>
              </div>
            </div>
            <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200">
              {diurno12h.length} presentes
            </span>
          </div>

          <div className="mt-3 space-y-2">
            <div className="text-[11px] font-semibold uppercase text-slate-400 tracking-wider">
              Enfermeiros (2):
            </div>
            {diurnoEnfermeiros.map(p => (
              <div 
                key={p.id} 
                onClick={() => onEditCell(p.id, selectedDay)}
                className="p-2 rounded-lg bg-amber-50/60 dark:bg-amber-950/30 border border-amber-200/60 dark:border-amber-800/40 flex items-center justify-between cursor-pointer hover:bg-amber-100/60 transition-colors"
              >
                <div>
                  <div className="text-xs font-bold text-slate-900 dark:text-slate-100">{p.name}</div>
                  <div className="text-[10px] text-slate-500 font-mono">{p.coren}</div>
                </div>
                <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-amber-200/60 text-amber-900 dark:bg-amber-800 dark:text-amber-100">
                  {p.turma === 'TURMA_A' ? 'Turma A' : 'Turma B'}
                </span>
              </div>
            ))}

            <div className="text-[11px] font-semibold uppercase text-slate-400 tracking-wider pt-2">
              Técnicos (2):
            </div>
            {diurnoTecnicos.map(p => (
              <div 
                key={p.id} 
                onClick={() => onEditCell(p.id, selectedDay)}
                className="p-2 rounded-lg bg-amber-50/60 dark:bg-amber-950/30 border border-amber-200/60 dark:border-amber-800/40 flex items-center justify-between cursor-pointer hover:bg-amber-100/60 transition-colors"
              >
                <div>
                  <div className="text-xs font-bold text-slate-900 dark:text-slate-100">{p.name}</div>
                  <div className="text-[10px] text-slate-500 font-mono">{p.coren}</div>
                </div>
                <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-amber-200/60 text-amber-900 dark:bg-amber-800 dark:text-amber-100">
                  {p.turma === 'TURMA_A' ? 'Turma A' : 'Turma B'}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* 2. Manhã 6x1 */}
        <div className="bg-white dark:bg-slate-900 border border-emerald-200 dark:border-emerald-900/60 rounded-xl p-4 shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-emerald-100 dark:border-emerald-950">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-950 flex items-center justify-center text-emerald-600">
                <Sunrise className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                  Assistencial Manhã 6h
                </h3>
                <span className="text-[11px] text-emerald-700 dark:text-emerald-400 font-mono">
                  07:00 às 13:00
                </span>
              </div>
            </div>
            <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200">
              {manha6h.length} presentes
            </span>
          </div>

          <div className="mt-3 space-y-2">
            <div className="text-[11px] font-semibold uppercase text-slate-400 tracking-wider">
              Enfermeira Assistencial:
            </div>
            {manhaEnfermeiros.length > 0 ? (
              manhaEnfermeiros.map(p => (
                <div 
                  key={p.id} 
                  onClick={() => onEditCell(p.id, selectedDay)}
                  className="p-2 rounded-lg bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-200/60 dark:border-emerald-800/40 flex items-center justify-between cursor-pointer hover:bg-emerald-100/60 transition-colors"
                >
                  <div>
                    <div className="text-xs font-bold text-slate-900 dark:text-slate-100">{p.name}</div>
                    <div className="text-[10px] text-slate-500 font-mono">{p.coren}</div>
                  </div>
                  <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-emerald-200 text-emerald-900 dark:bg-emerald-800 dark:text-emerald-100">
                    6h Manhã
                  </span>
                </div>
              ))
            ) : (
              <div className="p-2 text-xs text-slate-400 italic bg-slate-50 dark:bg-slate-800 rounded-lg">
                Em folga semanal (RSR)
              </div>
            )}

            <div className="text-[11px] font-semibold uppercase text-slate-400 tracking-wider pt-2">
              Técnica de Apoio:
            </div>
            {manhaTecnicos.length > 0 ? (
              manhaTecnicos.map(p => (
                <div 
                  key={p.id} 
                  onClick={() => onEditCell(p.id, selectedDay)}
                  className="p-2 rounded-lg bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-200/60 dark:border-emerald-800/40 flex items-center justify-between cursor-pointer hover:bg-emerald-100/60 transition-colors"
                >
                  <div>
                    <div className="text-xs font-bold text-slate-900 dark:text-slate-100">{p.name}</div>
                    <div className="text-[10px] text-slate-500 font-mono">{p.coren}</div>
                  </div>
                  <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-emerald-200 text-emerald-900 dark:bg-emerald-800 dark:text-emerald-100">
                    6h Manhã
                  </span>
                </div>
              ))
            ) : (
              <div className="p-2 text-xs text-slate-400 italic bg-slate-50 dark:bg-slate-800 rounded-lg">
                Em folga semanal (RSR)
              </div>
            )}
          </div>
        </div>

        {/* 3. Tarde 6x1 */}
        <div className="bg-white dark:bg-slate-900 border border-teal-200 dark:border-teal-900/60 rounded-xl p-4 shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-teal-100 dark:border-teal-950">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-teal-100 dark:bg-teal-950 flex items-center justify-center text-teal-600">
                <Sunset className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                  Assistencial Tarde 6h
                </h3>
                <span className="text-[11px] text-teal-700 dark:text-teal-400 font-mono">
                  13:00 às 19:00
                </span>
              </div>
            </div>
            <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-200">
              {tarde6h.length} presentes
            </span>
          </div>

          <div className="mt-3 space-y-2">
            <div className="text-[11px] font-semibold uppercase text-slate-400 tracking-wider">
              Enfermeiro Assistencial:
            </div>
            {tardeEnfermeiros.length > 0 ? (
              tardeEnfermeiros.map(p => (
                <div 
                  key={p.id} 
                  onClick={() => onEditCell(p.id, selectedDay)}
                  className="p-2 rounded-lg bg-teal-50/60 dark:bg-teal-950/30 border border-teal-200/60 dark:border-teal-800/40 flex items-center justify-between cursor-pointer hover:bg-teal-100/60 transition-colors"
                >
                  <div>
                    <div className="text-xs font-bold text-slate-900 dark:text-slate-100">{p.name}</div>
                    <div className="text-[10px] text-slate-500 font-mono">{p.coren}</div>
                  </div>
                  <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-teal-200 text-teal-900 dark:bg-teal-800 dark:text-teal-100">
                    6h Tarde
                  </span>
                </div>
              ))
            ) : (
              <div className="p-2 text-xs text-slate-400 italic bg-slate-50 dark:bg-slate-800 rounded-lg">
                Em folga semanal (RSR)
              </div>
            )}

            <div className="text-[11px] font-semibold uppercase text-slate-400 tracking-wider pt-2">
              Técnico de Apoio:
            </div>
            {tardeTecnicos.length > 0 ? (
              tardeTecnicos.map(p => (
                <div 
                  key={p.id} 
                  onClick={() => onEditCell(p.id, selectedDay)}
                  className="p-2 rounded-lg bg-teal-50/60 dark:bg-teal-950/30 border border-teal-200/60 dark:border-teal-800/40 flex items-center justify-between cursor-pointer hover:bg-teal-100/60 transition-colors"
                >
                  <div>
                    <div className="text-xs font-bold text-slate-900 dark:text-slate-100">{p.name}</div>
                    <div className="text-[10px] text-slate-500 font-mono">{p.coren}</div>
                  </div>
                  <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-teal-200 text-teal-900 dark:bg-teal-800 dark:text-teal-100">
                    6h Tarde
                  </span>
                </div>
              ))
            ) : (
              <div className="p-2 text-xs text-slate-400 italic bg-slate-50 dark:bg-slate-800 rounded-lg">
                Em folga semanal (RSR)
              </div>
            )}
          </div>
        </div>

        {/* 4. Plantão Noturno 12x36 */}
        <div className="bg-white dark:bg-slate-900 border border-indigo-200 dark:border-indigo-900/60 rounded-xl p-4 shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-indigo-100 dark:border-indigo-950">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-indigo-100 dark:bg-indigo-950 flex items-center justify-center text-indigo-600">
                <Moon className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                  Plantão Noturno 12h
                </h3>
                <span className="text-[11px] text-indigo-700 dark:text-indigo-400 font-mono">
                  19:00 às 07:00
                </span>
              </div>
            </div>
            <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200">
              {noturno12h.length} presentes
            </span>
          </div>

          <div className="mt-3 space-y-2">
            <div className="text-[11px] font-semibold uppercase text-slate-400 tracking-wider">
              Enfermeiros (2):
            </div>
            {noturnoEnfermeiros.map(p => (
              <div 
                key={p.id} 
                onClick={() => onEditCell(p.id, selectedDay)}
                className="p-2 rounded-lg bg-indigo-50/60 dark:bg-indigo-950/30 border border-indigo-200/60 dark:border-indigo-800/40 flex items-center justify-between cursor-pointer hover:bg-indigo-100/60 transition-colors"
              >
                <div>
                  <div className="text-xs font-bold text-slate-900 dark:text-slate-100">{p.name}</div>
                  <div className="text-[10px] text-slate-500 font-mono">{p.coren}</div>
                </div>
                <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-indigo-200 text-indigo-900 dark:bg-indigo-800 dark:text-indigo-100">
                  {p.turma === 'TURMA_A' ? 'Turma A' : 'Turma B'}
                </span>
              </div>
            ))}

            <div className="text-[11px] font-semibold uppercase text-slate-400 tracking-wider pt-2">
              Técnicos (2):
            </div>
            {noturnoTecnicos.map(p => (
              <div 
                key={p.id} 
                onClick={() => onEditCell(p.id, selectedDay)}
                className="p-2 rounded-lg bg-indigo-50/60 dark:bg-indigo-950/30 border border-indigo-200/60 dark:border-indigo-800/40 flex items-center justify-between cursor-pointer hover:bg-indigo-100/60 transition-colors"
              >
                <div>
                  <div className="text-xs font-bold text-slate-900 dark:text-slate-100">{p.name}</div>
                  <div className="text-[10px] text-slate-500 font-mono">{p.coren}</div>
                </div>
                <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-indigo-200 text-indigo-900 dark:bg-indigo-800 dark:text-indigo-100">
                  {p.turma === 'TURMA_A' ? 'Turma A' : 'Turma B'}
                </span>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Off-duty Professionals Card */}
      <div className="bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-xl p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Coffee className="w-4 h-4 text-slate-500" />
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">
              Profissionais em Folga / Repouso Semanal ({folgas.length} ausentes no dia)
            </h4>
          </div>
          <span className="text-xs text-slate-500">
            Descanso assegurado pelos Arts. 59-A, 66 e 67 da CLT
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
          {folgas.map(p => (
            <div 
              key={p.id}
              onClick={() => onEditCell(p.id, selectedDay)}
              className="p-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/80 text-xs cursor-pointer hover:border-slate-400 transition-colors"
            >
              <div className="font-semibold text-slate-700 dark:text-slate-300 truncate">{p.name}</div>
              <div className="text-[10px] text-slate-400">{p.role}</div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
