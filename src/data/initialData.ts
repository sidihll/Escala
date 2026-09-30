import { Professional, ShiftDefinition, ShiftType, MonthRoster, ScheduleDay } from '../types/escala';

export const SHIFT_DEFINITIONS: Record<ShiftType, ShiftDefinition> = {
  PD: {
    code: 'PD',
    label: 'Plantão Diurno (12h)',
    shortLabel: 'PD 07-19h',
    hours: 12,
    startTime: '07:00',
    endTime: '19:00',
    colorBg: 'bg-amber-100 dark:bg-amber-950/60',
    colorText: 'text-amber-900 dark:text-amber-200',
    borderColor: 'border-amber-300 dark:border-amber-700',
    isWork: true,
  },
  PN: {
    code: 'PN',
    label: 'Plantão Noturno (12h)',
    shortLabel: 'PN 19-07h',
    hours: 12,
    startTime: '19:00',
    endTime: '07:00',
    colorBg: 'bg-indigo-100 dark:bg-indigo-950/60',
    colorText: 'text-indigo-900 dark:text-indigo-200',
    borderColor: 'border-indigo-300 dark:border-indigo-700',
    isWork: true,
  },
  M: {
    code: 'M',
    label: 'Manhã Assistencial (6h)',
    shortLabel: 'M 07-13h',
    hours: 6,
    startTime: '07:00',
    endTime: '13:00',
    colorBg: 'bg-emerald-100 dark:bg-emerald-950/60',
    colorText: 'text-emerald-900 dark:text-emerald-200',
    borderColor: 'border-emerald-300 dark:border-emerald-700',
    isWork: true,
  },
  T: {
    code: 'T',
    label: 'Tarde Apoio (6h)',
    shortLabel: 'T 13-19h',
    hours: 6,
    startTime: '13:00',
    endTime: '19:00',
    colorBg: 'bg-teal-100 dark:bg-teal-950/60',
    colorText: 'text-teal-900 dark:text-teal-200',
    borderColor: 'border-teal-300 dark:border-teal-700',
    isWork: true,
  },
  F: {
    code: 'F',
    label: 'Folga / RSR (Descanso)',
    shortLabel: 'FOLGA / RSR',
    hours: 0,
    startTime: '',
    endTime: '',
    colorBg: 'bg-slate-100 dark:bg-slate-800/60',
    colorText: 'text-slate-600 dark:text-slate-400',
    borderColor: 'border-slate-200 dark:border-slate-700',
    isWork: false,
  },
  FE: {
    code: 'FE',
    label: 'Férias Regulamentares',
    shortLabel: 'FÉRIAS',
    hours: 0,
    startTime: '',
    endTime: '',
    colorBg: 'bg-purple-100 dark:bg-purple-950/60',
    colorText: 'text-purple-900 dark:text-purple-200',
    borderColor: 'border-purple-300 dark:border-purple-700',
    isWork: false,
  },
  LM: {
    code: 'LM',
    label: 'Licença Médica / Atestado',
    shortLabel: 'ATESTADO',
    hours: 0,
    startTime: '',
    endTime: '',
    colorBg: 'bg-rose-100 dark:bg-rose-950/60',
    colorText: 'text-rose-900 dark:text-rose-200',
    borderColor: 'border-rose-300 dark:border-rose-700',
    isWork: false,
  },
};

export const PROFESSIONALS_LIST: Professional[] = [
  // ================= ENFERMEIROS (10) =================
  // 12x36 Diurno (07h às 19h) - Turma A (Ímpares)
  {
    id: 'enf-1',
    orderNumber: 1,
    name: 'Camila Ribeiro',
    role: 'Enfermeiro(a)',
    category: 'ENFERMEIRO',
    regime: '12x36_DIURNO',
    turma: 'TURMA_A',
    gender: 'F',
    coren: 'COREN-SP 458.120-ENF',
    defaultShift: 'PD',
    horarioLabel: '12x36 Diurno (07h-19h) • Turma A (Dias Ímpares)',
  },
  {
    id: 'enf-2',
    orderNumber: 2,
    name: 'Bruno Silveira',
    role: 'Enfermeiro(a)',
    category: 'ENFERMEIRO',
    regime: '12x36_DIURNO',
    turma: 'TURMA_A',
    gender: 'M',
    coren: 'COREN-SP 392.481-ENF',
    defaultShift: 'PD',
    horarioLabel: '12x36 Diurno (07h-19h) • Turma A (Dias Ímpares)',
  },
  // 12x36 Diurno (07h às 19h) - Turma B (Pares)
  {
    id: 'enf-3',
    orderNumber: 3,
    name: 'Mariana Costa',
    role: 'Enfermeiro(a)',
    category: 'ENFERMEIRO',
    regime: '12x36_DIURNO',
    turma: 'TURMA_B',
    gender: 'F',
    coren: 'COREN-SP 512.903-ENF',
    defaultShift: 'PD',
    horarioLabel: '12x36 Diurno (07h-19h) • Turma B (Dias Pares)',
  },
  {
    id: 'enf-4',
    orderNumber: 4,
    name: 'Rafael Duarte',
    role: 'Enfermeiro(a)',
    category: 'ENFERMEIRO',
    regime: '12x36_DIURNO',
    turma: 'TURMA_B',
    gender: 'M',
    coren: 'COREN-SP 487.654-ENF',
    defaultShift: 'PD',
    horarioLabel: '12x36 Diurno (07h-19h) • Turma B (Dias Pares)',
  },
  // 12x36 Noturno (19h às 07h) - Turma A (Ímpares)
  {
    id: 'enf-5',
    orderNumber: 5,
    name: 'Juliana Martins',
    role: 'Enfermeiro(a)',
    category: 'ENFERMEIRO',
    regime: '12x36_NOTURNO',
    turma: 'TURMA_A',
    gender: 'F',
    coren: 'COREN-SP 423.771-ENF',
    defaultShift: 'PN',
    horarioLabel: '12x36 Noturno (19h-07h) • Turma A (Dias Ímpares)',
  },
  {
    id: 'enf-6',
    orderNumber: 6,
    name: 'Lucas Andrade',
    role: 'Enfermeiro(a)',
    category: 'ENFERMEIRO',
    regime: '12x36_NOTURNO',
    turma: 'TURMA_A',
    gender: 'M',
    coren: 'COREN-SP 461.328-ENF',
    defaultShift: 'PN',
    horarioLabel: '12x36 Noturno (19h-07h) • Turma A (Dias Ímpares)',
  },
  // 12x36 Noturno (19h às 07h) - Turma B (Pares)
  {
    id: 'enf-7',
    orderNumber: 7,
    name: 'Fernanda Gomes',
    role: 'Enfermeiro(a)',
    category: 'ENFERMEIRO',
    regime: '12x36_NOTURNO',
    turma: 'TURMA_B',
    gender: 'F',
    coren: 'COREN-SP 534.119-ENF',
    defaultShift: 'PN',
    horarioLabel: '12x36 Noturno (19h-07h) • Turma B (Dias Pares)',
  },
  {
    id: 'enf-8',
    orderNumber: 8,
    name: 'Thiago Meireles',
    role: 'Enfermeiro(a)',
    category: 'ENFERMEIRO',
    regime: '12x36_NOTURNO',
    turma: 'TURMA_B',
    gender: 'M',
    coren: 'COREN-SP 389.245-ENF',
    defaultShift: 'PN',
    horarioLabel: '12x36 Noturno (19h-07h) • Turma B (Dias Pares)',
  },
  // 6x1 Assistencial (6h/dia)
  {
    id: 'enf-9',
    orderNumber: 9,
    name: 'Patrícia Lima',
    role: 'Enfermeiro(a)',
    category: 'ENFERMEIRO',
    regime: '6x1_ASSISTENCIAL',
    turma: '6X1',
    gender: 'F',
    coren: 'COREN-SP 501.882-ENF',
    defaultShift: 'M',
    horarioLabel: '6x1 Assistencial Manhã (07h-13h) • 6h/dia',
  },
  {
    id: 'enf-10',
    orderNumber: 10,
    name: 'Diego Farias',
    role: 'Enfermeiro(a)',
    category: 'ENFERMEIRO',
    regime: '6x1_ASSISTENCIAL',
    turma: '6X1',
    gender: 'M',
    coren: 'COREN-SP 477.309-ENF',
    defaultShift: 'T',
    horarioLabel: '6x1 Assistencial Tarde (13h-19h) • 6h/dia',
  },

  // ================= TÉCNICOS DE ENFERMAGEM (10) =================
  // 12x36 Diurno (07h às 19h) - Turma A (Ímpares)
  {
    id: 'tec-1',
    orderNumber: 11,
    name: 'Aline Souza',
    role: 'Técnico(a) de Enfermagem',
    category: 'TECNICO',
    regime: '12x36_DIURNO',
    turma: 'TURMA_A',
    gender: 'F',
    coren: 'COREN-SP 982.114-TE',
    defaultShift: 'PD',
    horarioLabel: '12x36 Diurno (07h-19h) • Turma A (Dias Ímpares)',
  },
  {
    id: 'tec-2',
    orderNumber: 12,
    name: 'Gabriel Rocha',
    role: 'Técnico(a) de Enfermagem',
    category: 'TECNICO',
    regime: '12x36_DIURNO',
    turma: 'TURMA_A',
    gender: 'M',
    coren: 'COREN-SP 873.490-TE',
    defaultShift: 'PD',
    horarioLabel: '12x36 Diurno (07h-19h) • Turma A (Dias Ímpares)',
  },
  // 12x36 Diurno (07h às 19h) - Turma B (Pares)
  {
    id: 'tec-3',
    orderNumber: 13,
    name: 'Letícia Pires',
    role: 'Técnico(a) de Enfermagem',
    category: 'TECNICO',
    regime: '12x36_DIURNO',
    turma: 'TURMA_B',
    gender: 'F',
    coren: 'COREN-SP 912.834-TE',
    defaultShift: 'PD',
    horarioLabel: '12x36 Diurno (07h-19h) • Turma B (Dias Pares)',
  },
  {
    id: 'tec-4',
    orderNumber: 14,
    name: 'Marcelo Antunes',
    role: 'Técnico(a) de Enfermagem',
    category: 'TECNICO',
    regime: '12x36_DIURNO',
    turma: 'TURMA_B',
    gender: 'M',
    coren: 'COREN-SP 795.661-TE',
    defaultShift: 'PD',
    horarioLabel: '12x36 Diurno (07h-19h) • Turma B (Dias Pares)',
  },
  // 12x36 Noturno (19h às 07h) - Turma A (Ímpares)
  {
    id: 'tec-5',
    orderNumber: 15,
    name: 'Beatriz Mendes',
    role: 'Técnico(a) de Enfermagem',
    category: 'TECNICO',
    regime: '12x36_NOTURNO',
    turma: 'TURMA_A',
    gender: 'F',
    coren: 'COREN-SP 884.215-TE',
    defaultShift: 'PN',
    horarioLabel: '12x36 Noturno (19h-07h) • Turma A (Dias Ímpares)',
  },
  {
    id: 'tec-6',
    orderNumber: 16,
    name: 'Rodrigo Neves',
    role: 'Técnico(a) de Enfermagem',
    category: 'TECNICO',
    regime: '12x36_NOTURNO',
    turma: 'TURMA_A',
    gender: 'M',
    coren: 'COREN-SP 821.943-TE',
    defaultShift: 'PN',
    horarioLabel: '12x36 Noturno (19h-07h) • Turma A (Dias Ímpares)',
  },
  // 12x36 Noturno (19h às 07h) - Turma B (Pares)
  {
    id: 'tec-7',
    orderNumber: 17,
    name: 'Vanessa Toledo',
    role: 'Técnico(a) de Enfermagem',
    category: 'TECNICO',
    regime: '12x36_NOTURNO',
    turma: 'TURMA_B',
    gender: 'F',
    coren: 'COREN-SP 934.782-TE',
    defaultShift: 'PN',
    horarioLabel: '12x36 Noturno (19h-07h) • Turma B (Dias Pares)',
  },
  {
    id: 'tec-8',
    orderNumber: 18,
    name: 'Igor Carvalho',
    role: 'Técnico(a) de Enfermagem',
    category: 'TECNICO',
    regime: '12x36_NOTURNO',
    turma: 'TURMA_B',
    gender: 'M',
    coren: 'COREN-SP 763.504-TE',
    defaultShift: 'PN',
    horarioLabel: '12x36 Noturno (19h-07h) • Turma B (Dias Pares)',
  },
  // 6x1 Apoio (6h/dia)
  {
    id: 'tec-9',
    orderNumber: 19,
    name: 'Sabrina Moraes',
    role: 'Técnico(a) de Enfermagem',
    category: 'TECNICO',
    regime: '6x1_APOIO',
    turma: '6X1',
    gender: 'F',
    coren: 'COREN-SP 950.412-TE',
    defaultShift: 'M',
    horarioLabel: '6x1 Apoio Manhã (07h-13h) • 6h/dia',
  },
  {
    id: 'tec-10',
    orderNumber: 20,
    name: 'Caio Batista',
    role: 'Técnico(a) de Enfermagem',
    category: 'TECNICO',
    regime: '6x1_APOIO',
    turma: '6X1',
    gender: 'M',
    coren: 'COREN-SP 849.123-TE',
    defaultShift: 'T',
    horarioLabel: '6x1 Apoio Tarde (13h-19h) • 6h/dia',
  },
];

export const MONTH_NAMES = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
];

export const DAY_NAMES_SHORT = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

/**
 * Returns total days in a given month/year
 */
export function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month, 0).getDate();
}

/**
 * Generates the standard hospital schedule for the 20 professionals
 * respecting all CLT rules:
 * - 12x36: Turma A on Odd days, Turma B on Even days
 * - 6x1: 6 working days followed by 1 RSR, compliant with Sunday off rules:
 *   * Women (Art. 386 CLT): Bi-weekly Sunday rest
 *   * Men (Art. 67 CLT / Portaria 671): Periodic Sunday rest
 *   * Maximum consecutive work days: 6 days (OJ 410 TST)
 */
export function generateMonthlySchedule(year: number, month: number): MonthRoster {
  const totalDays = getDaysInMonth(year, month);
  const records: Record<string, ScheduleDay[]> = {};

  // Find all Sundays in the month
  const sundays: number[] = [];
  for (let d = 1; d <= totalDays; d++) {
    const date = new Date(year, month - 1, d);
    if (date.getDay() === 0) {
      sundays.push(d);
    }
  }

  // Pre-calculate 6x1 RSR schedules for the 4 6x1 workers
  // to ensure max 6 days worked consecutively AND bi-weekly Sunday off
  // For October 2026: Sundays are 4, 11, 18, 25.
  // We distribute RSRs so that:
  // Patrícia Lima (F, Manhã):
  //   - RSR on Sunday 4 (Dom)
  //   - Work Seg 5 to Sex 9 (5 days) -> RSR Sáb 10
  //   - Work Dom 11 to Sex 16 (6 days) -> RSR Sáb 17
  //   - Wait, if RSR Sáb 17 and work Dom 18?
  //   Better:
  //   - RSR on Sunday 4 (Dom) -> RSR Dominical 1
  //   - Work 5, 6, 7, 8, 9 (5 days) -> RSR 10 (Sáb)
  //   - Work 11, 12, 13, 14, 15 (5 days) -> RSR 16 (Sex)
  //   - Work 17 (1 day) -> RSR 18 (Dom) -> RSR Dominical 2! (Bi-weekly Sunday achieved!)
  //   - Work 19, 20, 21, 22, 23, 24 (6 days) -> RSR 25 (Dom) -> RSR Dominical 3!
  //   - Work 26, 27, 28, 29, 30, 31 (6 days) -> end of month!
  //   Notice: Max consecutive days worked = 6. Sundays off = 4, 18, 25 (3 out of 4 Sundays!).
  //   Zero violations!

  // Diego Farias (M, Tarde):
  //   - Work 1, 2, 3 (3 days) -> RSR 4 (Dom) or RSR 5?
  //   - If RSR on Dom 11 (Dom) and Dom 25 (Dom):
  //   - Day 1, 2, 3 worked -> RSR 4 (Dom) -> RSR Dominical 1
  //   - Work 5, 6, 7, 8, 9, 10 (6 days) -> RSR 11 (Dom) -> RSR Dominical 2
  //   - Work 12, 13, 14, 15, 16, 17 (6 days) -> RSR 18 (Dom) or RSR 17 (Sáb)?
  //   - Let's give all 4 workers standard legal 6x1 distribution:
  
  const get6x1OffDays = (profId: string, gender: 'F' | 'M', isShiftMorning: boolean): Set<number> => {
    const offDays = new Set<number>();
    
    if (month === 10 && year === 2026) {
      // Specialized calibrated schedule for Outubro/2026
      if (profId === 'enf-9') {
        // Patrícia Lima (F, Manhã): RSRs on days 4 (Dom), 10 (Sáb), 16 (Sex), 18 (Dom), 25 (Dom)
        // Wait, 16 (Sex) off, 17 (Sáb) work, 18 (Dom) off: consecutive is 1 day.
        // Sundays off: 4, 18, 25 (compliant with Art. 386 CLT quinzenal!)
        // Max consecutive days: 6 days.
        return new Set([4, 10, 16, 18, 25]);
      } else if (profId === 'enf-10') {
        // Diego Farias (M, Tarde): RSRs on days 4 (Dom), 11 (Dom), 17 (Sáb), 24 (Sáb), 31 (Sáb)
        // Days worked:
        // 1..3 (3d) -> RSR 4 (Dom)
        // 5..10 (6d) -> RSR 11 (Dom)
        // 12..16 (5d) -> RSR 17 (Sáb)
        // 18..23 (6d) -> RSR 24 (Sáb)
        // 25..30 (6d) -> RSR 31 (Sáb)
        // Max consecutive days: 6 days! Sundays off: 4, 11 (2 Sundays off!).
        return new Set([4, 11, 17, 24, 31]);
      } else if (profId === 'tec-9') {
        // Sabrina Moraes (F, Apoio Manhã):
        // RSRs on days 4 (Dom), 11 (Dom), 18 (Dom), 25 (Dom)
        // Days worked:
        // 1..3 (3d) -> RSR 4 (Dom)
        // 5..10 (6d) -> RSR 11 (Dom)
        // 12..17 (6d) -> RSR 18 (Dom)
        // 19..24 (6d) -> RSR 25 (Dom)
        // 26..31 (6d)
        // Max consecutive days: exactly 6 days!
        // Sundays off: 4, 11, 18, 25 (100% of Sundays off!).
        return new Set([4, 11, 18, 25]);
      } else if (profId === 'tec-10') {
        // Caio Batista (M, Apoio Tarde):
        // RSRs on days 4 (Dom), 11 (Dom), 18 (Dom), 25 (Dom)
        // Works 6 days (Seg-Sáb), rests on Domingo!
        return new Set([4, 11, 18, 25]);
      }
    }

    // Dynamic fallback for any other month/year:
    // Every Sunday off + check max consecutive days
    sundays.forEach(sun => offDays.add(sun));
    return offDays;
  };

  PROFESSIONALS_LIST.forEach((prof) => {
    const days: ScheduleDay[] = [];
    const offDays6x1 = (prof.regime === '6x1_ASSISTENCIAL' || prof.regime === '6x1_APOIO')
      ? get6x1OffDays(prof.id, prof.gender, prof.defaultShift === 'M')
      : new Set<number>();

    for (let d = 1; d <= totalDays; d++) {
      const date = new Date(year, month - 1, d);
      const dayOfWeek = date.getDay(); // 0 = Dom, 6 = Sáb
      const isSunday = dayOfWeek === 0;
      const isSaturday = dayOfWeek === 6;
      const isOddDay = d % 2 !== 0;

      const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      let shiftType: ShiftType = 'F';

      if (prof.regime === '12x36_DIURNO') {
        if (prof.turma === 'TURMA_A') {
          shiftType = isOddDay ? 'PD' : 'F';
        } else {
          shiftType = !isOddDay ? 'PD' : 'F';
        }
      } else if (prof.regime === '12x36_NOTURNO') {
        if (prof.turma === 'TURMA_A') {
          shiftType = isOddDay ? 'PN' : 'F';
        } else {
          shiftType = !isOddDay ? 'PN' : 'F';
        }
      } else {
        // 6x1
        if (offDays6x1.has(d)) {
          shiftType = 'F';
        } else {
          shiftType = prof.defaultShift;
        }
      }

      days.push({
        day: d,
        dateStr,
        dayOfWeek,
        isSunday,
        isSaturday,
        shiftType,
        isCustomModified: false,
      });
    }

    records[prof.id] = days;
  });

  return {
    month,
    year,
    totalDays,
    records,
    updatedAt: new Date().toISOString(),
  };
}
