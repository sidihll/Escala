import React, { useState } from 'react';
import { X, Check, AlertTriangle, ShieldCheck } from 'lucide-react';
import { Professional, ShiftType } from '../types/escala';
import { SHIFT_DEFINITIONS, MONTH_NAMES, DAY_NAMES_SHORT } from '../data/initialData';

interface ShiftEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  professional: Professional | null;
  day: number;
  month: number;
  year: number;
  currentShift: ShiftType;
  onSaveShift: (profId: string, day: number, newShift: ShiftType, note?: string) => void;
}

export const ShiftEditModal: React.FC<ShiftEditModalProps> = ({
  isOpen,
  onClose,
  professional,
  day,
  month,
  year,
  currentShift,
  onSaveShift,
}) => {
  if (!isOpen || !professional) return null;

  const [selectedShift, setSelectedShift] = useState<ShiftType>(currentShift);
  const [note, setNote] = useState('');

  const date = new Date(year, month - 1, day);
  const dayOfWeek = date.getDay();

  const handleSave = () => {
    onSaveShift(professional.id, day, selectedShift, note);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-md w-full shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-900/50">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Alterar Turno do Profissional
            </h3>
            <p className="text-xs text-slate-500">
              Dia {day} de {MONTH_NAMES[month - 1]} ({DAY_NAMES_SHORT[dayOfWeek]})
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Professional Info */}
        <div className="p-4 bg-teal-50/50 dark:bg-teal-950/20 border-b border-teal-100 dark:border-teal-950 flex items-center justify-between">
          <div>
            <div className="text-xs font-bold text-slate-900 dark:text-slate-100">
              {professional.name}
            </div>
            <div className="text-[11px] text-slate-500">
              {professional.role} • {professional.horarioLabel}
            </div>
          </div>
          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
            {professional.coren}
          </span>
        </div>

        {/* Shift Options */}
        <div className="p-4 space-y-3">
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
            Selecione o Turno ou Status:
          </label>

          <div className="grid grid-cols-1 gap-2">
            {(Object.keys(SHIFT_DEFINITIONS) as ShiftType[]).map((code) => {
              const def = SHIFT_DEFINITIONS[code];
              const isSelected = selectedShift === code;

              return (
                <div
                  key={code}
                  onClick={() => setSelectedShift(code)}
                  className={`p-2.5 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${
                    isSelected
                      ? 'border-teal-600 bg-teal-50/70 dark:bg-teal-950/40 ring-2 ring-teal-500/20'
                      : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 bg-white dark:bg-slate-900'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs border ${def.colorBg} ${def.colorText} ${def.borderColor}`}>
                      {def.code}
                    </span>
                    <div>
                      <div className="text-xs font-bold text-slate-900 dark:text-slate-100">
                        {def.label}
                      </div>
                      <div className="text-[10px] text-slate-500">
                        {def.isWork ? `${def.startTime} às ${def.endTime} (${def.hours}h)` : 'Sem cômputo de horas de trabalho'}
                      </div>
                    </div>
                  </div>

                  {isSelected && (
                    <Check className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                  )}
                </div>
              );
            })}
          </div>

          {/* Optional Note */}
          <div className="pt-2">
            <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
              Observação / Justificativa (Opcional):
            </label>
            <input
              type="text"
              placeholder="Ex: Troca acordada com colega, atestado apresentado..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full px-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-teal-500"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 flex items-center justify-end gap-2">
          <button
            onClick={onClose}
            className="px-3 py-1.5 rounded-lg text-xs font-medium text-slate-600 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-1.5 rounded-lg text-xs font-bold bg-teal-600 hover:bg-teal-700 text-white transition-colors flex items-center gap-1.5 shadow-xs"
          >
            <Check className="w-3.5 h-3.5" />
            Confirmar Alteração
          </button>
        </div>

      </div>
    </div>
  );
};
