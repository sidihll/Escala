import { MonthRoster, CLTViolation, AuditReport, ProfessionalAuditStats, ShiftType } from '../types/escala';
import { PROFESSIONALS_LIST, SHIFT_DEFINITIONS } from '../data/initialData';

export function runCLTAudit(roster: MonthRoster): AuditReport {
  const violations: CLTViolation[] = [];
  const statsByProfessional: Record<string, ProfessionalAuditStats> = {};
  const totalDays = roster.totalDays;

  // Track daily coverage
  const coverageDaily: AuditReport['coverageDaily'] = {};
  for (let d = 1; d <= totalDays; d++) {
    const date = new Date(roster.year, roster.month - 1, d);
    const dayOfWeek = date.getDay();
    coverageDaily[d] = {
      day: d,
      dayOfWeek,
      isSunday: dayOfWeek === 0,
      diurnoEnfermeiros: 0,
      diurnoTecnicos: 0,
      noturnoEnfermeiros: 0,
      noturnoTecnicos: 0,
      manha6x1Enfermeiros: 0,
      manha6x1Tecnicos: 0,
      tarde6x1Enfermeiros: 0,
      tarde6x1Tecnicos: 0,
      totalPresente: 0,
      status: 'OK',
    };
  }

  // Count total sundays in the month
  let totalSundaysInMonth = 0;
  for (let d = 1; d <= totalDays; d++) {
    const date = new Date(roster.year, roster.month - 1, d);
    if (date.getDay() === 0) totalSundaysInMonth++;
  }

  // Iterate over each professional
  PROFESSIONALS_LIST.forEach((prof) => {
    const days = roster.records[prof.id] || [];
    let totalWorkHours = 0;
    let totalShiftsCount = 0;
    let totalRSRCount = 0;
    let totalSundayOffs = 0;
    let maxConsecutiveDaysWorked = 0;
    let currentConsecutiveDays = 0;
    let minInterjornadaHours = 999;
    let profViolationsCount = 0;

    const is12x36 = prof.regime === '12x36_DIURNO' || prof.regime === '12x36_NOTURNO';
    const is6x1 = prof.regime === '6x1_ASSISTENCIAL' || prof.regime === '6x1_APOIO';

    // Track sundays worked vs off
    const sundayRecords: { day: number; shift: ShiftType }[] = [];

    // Analyze day by day
    for (let i = 0; i < days.length; i++) {
      const dayData = days[i];
      const shiftDef = SHIFT_DEFINITIONS[dayData.shiftType];
      const isWork = shiftDef.isWork;

      if (isWork) {
        totalWorkHours += shiftDef.hours;
        totalShiftsCount++;
        currentConsecutiveDays++;
        if (currentConsecutiveDays > maxConsecutiveDaysWorked) {
          maxConsecutiveDaysWorked = currentConsecutiveDays;
        }

        // Tally coverage
        const dayCov = coverageDaily[dayData.day];
        if (dayCov) {
          dayCov.totalPresente++;
          if (prof.category === 'ENFERMEIRO') {
            if (dayData.shiftType === 'PD') dayCov.diurnoEnfermeiros++;
            else if (dayData.shiftType === 'PN') dayCov.noturnoEnfermeiros++;
            else if (dayData.shiftType === 'M') dayCov.manha6x1Enfermeiros++;
            else if (dayData.shiftType === 'T') dayCov.tarde6x1Enfermeiros++;
          } else {
            if (dayData.shiftType === 'PD') dayCov.diurnoTecnicos++;
            else if (dayData.shiftType === 'PN') dayCov.noturnoTecnicos++;
            else if (dayData.shiftType === 'M') dayCov.manha6x1Tecnicos++;
            else if (dayData.shiftType === 'T') dayCov.tarde6x1Tecnicos++;
          }
        }
      } else {
        totalRSRCount++;
        currentConsecutiveDays = 0;
      }

      if (dayData.isSunday) {
        sundayRecords.push({ day: dayData.day, shift: dayData.shiftType });
        if (!isWork) {
          totalSundayOffs++;
        }
      }

      // Check transition to next day for Interjornada (Art. 66) & 12x36 (Art. 59-A)
      if (i < days.length - 1) {
        const nextDayData = days[i + 1];
        const nextShiftDef = SHIFT_DEFINITIONS[nextDayData.shiftType];

        if (isWork && nextShiftDef.isWork) {
          // Both days worked!
          // Calculate rest hours between shifts:
          // Shift 1 end -> Shift 2 start
          let endHour = 19;
          if (dayData.shiftType === 'PN') endHour = 7 + 24; // 07:00 of next calendar day
          else if (dayData.shiftType === 'M') endHour = 13;
          else if (dayData.shiftType === 'T') endHour = 19;

          let nextStartHour = 7 + 24; // 07:00 next day
          if (nextDayData.shiftType === 'PN') nextStartHour = 19 + 24;
          else if (nextDayData.shiftType === 'T') nextStartHour = 13 + 24;

          const restHours = nextStartHour - endHour;
          if (restHours < minInterjornadaHours) {
            minInterjornadaHours = restHours;
          }

          // Art. 66: Minimum 11 hours between consecutive shifts
          if (restHours < 11) {
            profViolationsCount++;
            violations.push({
              id: `v-art66-${prof.id}-${dayData.day}`,
              article: 'Art. 66',
              severity: 'CRITICAL',
              professionalId: prof.id,
              professionalName: prof.name,
              day: dayData.day,
              dateStr: dayData.dateStr,
              title: `Violação do Intervalo Interjornada de 11h (Art. 66 CLT)`,
              description: `${prof.name} possui apenas ${restHours}h de descanso entre o plantão do dia ${dayData.day} (${dayData.shiftType}) e o dia ${nextDayData.day} (${nextDayData.shiftType}). O mínimo legal são 11 horas ininterruptas.`,
              legalRef: 'CLT, Art. 66: "Entre 2 jornadas de trabalho haverá um período mínimo de 11 horas consecutivas para descanso."',
              recommendation: 'Ajuste o turno ou conceda folga compensatória para assegurar no mínimo 11h consecutivas de repouso.',
            });
          }

          // Art. 59-A: 12x36 MUST have 36 consecutive hours of rest
          if (is12x36) {
            profViolationsCount++;
            violations.push({
              id: `v-art59a-${prof.id}-${dayData.day}`,
              article: 'Art. 59-A',
              severity: 'CRITICAL',
              professionalId: prof.id,
              professionalName: prof.name,
              day: dayData.day,
              dateStr: dayData.dateStr,
              title: `Desrespeito ao Repouso de 36 Horas da Escala 12x36 (Art. 59-A CLT)`,
              description: `${prof.name} está em regime 12x36 e foi escalado(a) em dias consecutivos (dias ${dayData.day} e ${nextDayData.day}), violando o descanso ininterrupto obrigatório de 36 horas.`,
              legalRef: 'CLT, Art. 59-A: "Jornada de trabalho de 12 horas seguidas por 36 horas ininterruptas de descanso."',
              recommendation: 'Mantenha a alternância estrita entre dias pares ou ímpares conforme a Turma.',
            });
          }
        } else if (isWork && !nextShiftDef.isWork) {
          // Day worked, followed by a rest day
          // For 12x36, if the day after rest is worked:
          if (i + 2 < days.length) {
            const dayAfterRest = days[i + 2];
            const dayAfterShiftDef = SHIFT_DEFINITIONS[dayAfterRest.shiftType];
            if (dayAfterShiftDef.isWork) {
              // 12x36 standard: 36h rest
              if (36 < minInterjornadaHours) {
                minInterjornadaHours = 36;
              }
            }
          } else {
            if (36 < minInterjornadaHours) minInterjornadaHours = 36;
          }
        }
      }
    }

    if (minInterjornadaHours === 999) {
      minInterjornadaHours = is12x36 ? 36 : 18;
    }

    // Art. 67 / OJ 410 TST: Max 6 consecutive days worked without weekly rest
    if (is6x1 && maxConsecutiveDaysWorked > 6) {
      profViolationsCount++;
      violations.push({
        id: `v-art67-consecutive-${prof.id}`,
        article: 'Art. 67',
        severity: 'CRITICAL',
        professionalId: prof.id,
        professionalName: prof.name,
        title: `Trabalho Consecutivo Excessivo (> 6 Dias) - Art. 67 CLT / OJ 410 TST`,
        description: `${prof.name} possui uma sequência contínua de ${maxConsecutiveDaysWorked} dias trabalhados sem a concessão do Repouso Semanal Remunerado (RSR). A lei veda trabalho por 7 dias ou mais sem RSR.`,
        legalRef: 'CLT, Art. 67 e Orientação Jurisprudencial 410 da SDI-1 do TST: "Viola o art. 7º, XV, da CF a concessão de repouso semanal remunerado após o sétimo dia consecutivo de trabalho."',
        recommendation: 'Insira uma folga (RSR) no 7º dia ou antes para não ultrapassar 6 dias consecutivos.',
      });
    }

    // Art. 67 & Art. 386: Sunday Rest Compliance for 6x1
    if (is6x1) {
      // For females: Art. 386 CLT (confirmed by STF Tema 1023) requires bi-weekly Sunday rest
      if (prof.gender === 'F') {
        // Must have at least 1 Sunday off every 2 Sundays (at least 2 Sundays off in a 4-Sunday month)
        if (totalSundayOffs < Math.floor(totalSundaysInMonth / 2)) {
          profViolationsCount++;
          violations.push({
            id: `v-art386-${prof.id}`,
            article: 'Art. 67',
            severity: 'WARNING',
            professionalId: prof.id,
            professionalName: prof.name,
            title: `Insuficiência de Folga Dominical Quinzenal (Art. 386 CLT / Tema 1023 STF)`,
            description: `${prof.name} teve apenas ${totalSundayOffs} domingo(s) de folga no mês de um total de ${totalSundaysInMonth} domingos. A legislação exige escala de revezamento quinzenal com repouso em domingo para trabalhadoras mulheres.`,
            legalRef: 'CLT, Art. 386 e STF Tema 1023: "Escala de revezamento quinzenal que favoreça o repouso dominical para as mulheres."',
            recommendation: 'Assegure pelo menos 2 domingos de folga no mês em semanas alternadas.',
          });
        }
      } else {
        // For males: Portaria MTP 671/2021 & Art. 67 requires periodic Sunday rest (at least 1 Sunday per month)
        if (totalSundayOffs < 1) {
          profViolationsCount++;
          violations.push({
            id: `v-art67-sunday-male-${prof.id}`,
            article: 'Art. 67',
            severity: 'WARNING',
            professionalId: prof.id,
            professionalName: prof.name,
            title: `Ausência de Folga Dominical no Mês (Art. 67 CLT / Portaria 671 MTP)`,
            description: `${prof.name} não possui nenhum domingo de folga no mês. Em regime 6x1 hospitalar, a folga semanal deve coincidir com o domingo periodicamente em escala de revezamento.`,
            legalRef: 'CLT, Art. 67, Parágrafo Único c/c Portaria 671 MTP: Revezamento mensal obrigatório para trabalho aos domingos.',
            recommendation: 'Conceda ao menos 1 domingo de folga por mês em revezamento.',
          });
        }
      }
    }

    const sundayComplianceRate = totalSundaysInMonth > 0
      ? Math.round((totalSundayOffs / totalSundaysInMonth) * 100)
      : 100;

    let status: ProfessionalAuditStats['status'] = 'CONFORME';
    if (profViolationsCount > 0) {
      status = violations.some(v => v.professionalId === prof.id && v.severity === 'CRITICAL')
        ? 'VIOLACAO'
        : 'ALERTA';
    }

    statsByProfessional[prof.id] = {
      professionalId: prof.id,
      professionalName: prof.name,
      role: prof.role,
      regime: prof.regime,
      turma: prof.turma,
      gender: prof.gender,
      totalWorkHours,
      totalShiftsCount,
      totalRSRCount,
      totalSundayOffs,
      totalSundaysInMonth,
      sundayComplianceRate,
      maxConsecutiveDaysWorked,
      minInterjornadaHours,
      violationsCount: profViolationsCount,
      status,
    };
  });

  const criticalViolations = violations.filter(v => v.severity === 'CRITICAL').length;
  const warningViolations = violations.filter(v => v.severity === 'WARNING').length;
  const totalViolations = violations.length;

  const art59AViolations = violations.filter(v => v.article === 'Art. 59-A').length;
  const art66Violations = violations.filter(v => v.article === 'Art. 66').length;
  const art67Violations = violations.filter(v => v.article === 'Art. 67').length;

  // Calculate compliance score
  const compliancePercentage = totalViolations === 0 
    ? 100 
    : Math.max(0, Math.round(100 - (criticalViolations * 15 + warningViolations * 5)));

  return {
    isFullyCompliant: criticalViolations === 0 && warningViolations === 0,
    compliancePercentage,
    totalViolations,
    criticalViolations,
    warningViolations,
    art59AStatus: art59AViolations === 0 ? 'CONFORME' : 'VIOLACAO',
    art66Status: art66Violations === 0 ? 'CONFORME' : 'VIOLACAO',
    art67Status: art67Violations === 0 ? 'CONFORME' : 'VIOLACAO',
    violations,
    statsByProfessional,
    coverageDaily,
    generatedAt: new Date().toISOString(),
  };
}
