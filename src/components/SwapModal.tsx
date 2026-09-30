import React, { useState } from 'react';
import { ArrowLeftRight, Check, X, AlertTriangle, ShieldCheck } from 'lucide-react';
import { MonthRoster, ShiftType, Professional } from '../types/escala';
import { PROFESSIONALS_LIST, MONTH_NAMES, SHIFT_DEFINITIONS } from '../data/initialData';

interface SwapModalProps {
  roster: MonthRoster;
  onExecuteSwap: (prof1Id: string, day1: number, prof2Id: string, day2: number) => void;
  onShowToast: (msg: string, type: 'success' | 'error' | 'info') => void;
}

export const SwapModal: React.FC<SwapModalProps> = ({
  roster,
  onExecuteSwap,
  onShowToast,
}) => {
  const [prof1Id, setProf1Id] = useState<string>(PROFESSIONALS_LIST[0].id);
  const [day1, setDay1] = useState<number>(1);

  const [prof2Id, setProf2Id] = useState<string>(PROFESSIONALS_LIST[1].id);
  const [day2, setDay2] = useState<number>(2);

  const prof1 = PROFESSIONALS_LIST.find(p => p.id === prof1Id);
  const prof2 = PROFESSIONALS_LIST.find(p => p.id === prof2Id);

  const shift1 = prof1 ? roster.records[prof1.id]?.[day1 - 1]?.shiftType : 'F';
  const shift2 = prof2 ? roster.records[prof2.id]?.[day2 - 1]?.shiftType : 'F';

  // Check compatibility
  const isSameCategory = prof1?.category === prof2?.category;

  const handleSwap = () => {
    if (!prof1 || !prof2) return;
    if (prof1Id === prof2Id && day1 === day2) {
      onShowToast('Selecione profissionais ou dias diferentes para permuta.', 'error');
      return;
    }

    onExecuteSwap(prof1Id, day1, prof2Id, day2);
    onShowToast(`Permuta realizada entre ${prof1.name} (Dia ${day1}) e ${prof2.name} (Dia ${day2})!`, 'success');
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs max-w-4xl mx-auto">
      
      <div className="flex items-center gap-3 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div className="w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-950 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
          <ArrowLeftRight className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-base font-bold text-slate-900 dark:text-white">
            Módulo de Permuta & Troca de Plantão
          </h2>
          <p className="text-xs text-slate-500">
            Realize permutas entre colaboradores com auditoria instantânea de viabilidade jurídica (CLT)
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 my-6">
        
        {/* Colaborador 1 */}
        <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/40 space-y-3">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Colaborador Cedente (1)
          </span>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Profissional:
            </label>
            <select
              value={prof1Id}
              onChange={(e) => setProf1Id(e.target.value)}
              className="w-full text-xs p-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 font-medium"
            >
              {PROFESSIONALS_LIST.map(p => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.role} - {p.turma})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Dia do Plantão a Ceder:
            </label>
            <select
              value={day1}
              onChange={(e) => setDay1(Number(e.target.value))}
              className="w-full text-xs p-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 font-medium"
            >
              {Array.from({ length: roster.totalDays }, (_, i) => i + 1).map(d => (
                <option key={d} value={d}>
                  Dia {d} ({roster.records[prof1Id]?.[d - 1]?.shiftType || 'F'})
                </option>
              ))}
            </select>
          </div>

          <div className="p-2.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs">
            <div className="text-slate-500 text-[11px]">Turno atual no Dia {day1}:</div>
            <div className="font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5 mt-0.5">
              <span className="w-5 h-5 rounded flex items-center justify-center font-bold text-[10px] bg-slate-100 border">
                {shift1}
              </span>
              <span>{SHIFT_DEFINITIONS[shift1 as ShiftType]?.label || 'Folga'}</span>
            </div>
          </div>
        </div>

        {/* Colaborador 2 */}
        <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/40 space-y-3">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Colaborador Receptores (2)
          </span>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Profissional:
            </label>
            <select
              value={prof2Id}
              onChange={(e) => setProf2Id(e.target.value)}
              className="w-full text-xs p-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 font-medium"
            >
              {PROFESSIONALS_LIST.map(p => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.role} - {p.turma})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Dia do Plantão a Trocar:
            </label>
            <select
              value={day2}
              onChange={(e) => setDay2(Number(e.target.value))}
              className="w-full text-xs p-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 font-medium"
            >
              {Array.from({ length: roster.totalDays }, (_, i) => i + 1).map(d => (
                <option key={d} value={d}>
                  Dia {d} ({roster.records[prof2Id]?.[d - 1]?.shiftType || 'F'})
                </option>
              ))}
            </select>
          </div>

          <div className="p-2.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs">
            <div className="text-slate-500 text-[11px]">Turno atual no Dia {day2}:</div>
            <div className="font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5 mt-0.5">
              <span className="w-5 h-5 rounded flex items-center justify-center font-bold text-[10px] bg-slate-100 border">
                {shift2}
              </span>
              <span>{SHIFT_DEFINITIONS[shift2 as ShiftType]?.label || 'Folga'}</span>
            </div>
          </div>
        </div>

      </div>

      {/* Warning if categories don't match */}
      {!isSameCategory && (
        <div className="p-3 mb-4 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-xs text-amber-900 dark:text-amber-200 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
          <span>
            <strong>Atenção COFEN/COREN:</strong> Você está permutando profissionais de categorias distintas ({prof1?.role} com {prof2?.role}).
            O dimensionamento de enfermagem exige a reposição na mesma qualificação.
          </span>
        </div>
      )}

      {/* Action Button */}
      <div className="flex items-center justify-between pt-4 border-t border-slate-200 dark:border-slate-800">
        <span className="text-xs text-slate-500">
          O Painel de Auditoria recalculará a conformidade dos Arts. 59-A, 66 e 67 imediatamente após a confirmação.
        </span>

        <button
          onClick={handleSwap}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs transition-colors"
        >
          <ArrowLeftRight className="w-4 h-4" />
          Efetivar Permuta
        </button>
      </div>

    </div>
  );
};
