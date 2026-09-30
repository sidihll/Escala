export type ProfessionalCategory = 'ENFERMEIRO' | 'TECNICO';

export type ProfessionalRegime = 
  | '12x36_DIURNO' 
  | '12x36_NOTURNO' 
  | '6x1_ASSISTENCIAL' 
  | '6x1_APOIO';

export type TurmaType = 'TURMA_A' | 'TURMA_B' | '6X1';

export type ShiftType = 
  | 'PD'   // Plantão 12h Diurno (07:00 às 19:00)
  | 'PN'   // Plantão 12h Noturno (19:00 às 07:00)
  | 'M'    // Manhã 6h (07:00 às 13:00)
  | 'T'    // Tarde 6h (13:00 às 19:00)
  | 'F'    // Folga / RSR (Repouso Semanal Remunerado)
  | 'FE'   // Férias
  | 'LM';  // Licença Médica / Atestado

export interface ShiftDefinition {
  code: ShiftType;
  label: string;
  shortLabel: string;
  hours: number;
  startTime: string; // "07:00"
  endTime: string;   // "19:00"
  colorBg: string;
  colorText: string;
  borderColor: string;
  isWork: boolean;
}

export interface Professional {
  id: string;
  orderNumber: number;
  name: string;
  role: 'Enfermeiro(a)' | 'Técnico(a) de Enfermagem';
  category: ProfessionalCategory;
  regime: ProfessionalRegime;
  turma: TurmaType;
  gender: 'F' | 'M';
  coren: string;
  defaultShift: ShiftType;
  horarioLabel: string;
}

export interface ScheduleDay {
  day: number;
  dateStr: string; // YYYY-MM-DD
  dayOfWeek: number; // 0 = Domingo, 1 = Segunda, ..., 6 = Sábado
  isSunday: boolean;
  isSaturday: boolean;
  shiftType: ShiftType;
  isCustomModified?: boolean;
  note?: string;
}

export interface MonthRoster {
  month: number; // 1-12 (ex: 10 para Outubro)
  year: number;  // ex: 2026
  totalDays: number;
  records: Record<string, ScheduleDay[]>; // professionalId -> array of 1..totalDays
  updatedAt: string;
}

export interface CLTViolation {
  id: string;
  article: 'Art. 59-A' | 'Art. 66' | 'Art. 67';
  severity: 'CRITICAL' | 'WARNING';
  professionalId: string;
  professionalName: string;
  day?: number;
  dateStr?: string;
  title: string;
  description: string;
  legalRef: string;
  recommendation: string;
}

export interface ProfessionalAuditStats {
  professionalId: string;
  professionalName: string;
  role: string;
  regime: ProfessionalRegime;
  turma: TurmaType;
  gender: 'F' | 'M';
  totalWorkHours: number;
  totalShiftsCount: number;
  totalRSRCount: number;
  totalSundayOffs: number;
  totalSundaysInMonth: number;
  sundayComplianceRate: number; // percentage
  maxConsecutiveDaysWorked: number;
  minInterjornadaHours: number;
  violationsCount: number;
  status: 'CONFORME' | 'ALERTA' | 'VIOLACAO';
}

export interface AuditReport {
  isFullyCompliant: boolean;
  compliancePercentage: number;
  totalViolations: number;
  criticalViolations: number;
  warningViolations: number;
  art59AStatus: 'CONFORME' | 'VIOLACAO';
  art66Status: 'CONFORME' | 'VIOLACAO';
  art67Status: 'CONFORME' | 'VIOLACAO';
  violations: CLTViolation[];
  statsByProfessional: Record<string, ProfessionalAuditStats>;
  coverageDaily: Record<number, {
    day: number;
    dayOfWeek: number;
    isSunday: boolean;
    diurnoEnfermeiros: number;
    diurnoTecnicos: number;
    noturnoEnfermeiros: number;
    noturnoTecnicos: number;
    manha6x1Enfermeiros: number;
    manha6x1Tecnicos: number;
    tarde6x1Enfermeiros: number;
    tarde6x1Tecnicos: number;
    totalPresente: number;
    status: 'OK' | 'DEFICIT';
  }>;
  generatedAt: string;
}

export interface SupabaseConfig {
  url: string;
  anonKey: string;
  tableNameSchedules: string;
  tableNameProfessionals: string;
  tableNameAudit: string;
  isConnected: boolean;
  lastSyncedAt?: string;
}
