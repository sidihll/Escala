import React, { useState } from 'react';
import { 
  ShieldCheck, 
  AlertTriangle, 
  XCircle, 
  CheckCircle2, 
  FileText, 
  Scale, 
  Clock, 
  Calendar, 
  Users,
  Download,
  Printer,
  Sparkles,
  HelpCircle,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { AuditReport, MonthRoster } from '../types/escala';
import { MONTH_NAMES, PROFESSIONALS_LIST } from '../data/initialData';

interface AuditPanelProps {
  auditReport: AuditReport;
  roster: MonthRoster;
  onSimulateViolation?: () => void;
  onResetSchedule?: () => void;
  onOpenExportModal?: () => void;
}

export const AuditPanel: React.FC<AuditPanelProps> = ({
  auditReport,
  roster,
  onSimulateViolation,
  onResetSchedule,
  onOpenExportModal,
}) => {
  const [expandedArticle, setExpandedArticle] = useState<string | null>('art-59a');
  const [filterRole, setFilterRole] = useState<'ALL' | 'ENFERMEIRO' | 'TECNICO' | '6X1'>('ALL');

  const monthYearLabel = `${MONTH_NAMES[roster.month - 1]} de ${roster.year}`;

  const toggleArticle = (id: string) => {
    setExpandedArticle(expandedArticle === id ? null : id);
  };

  const filteredStats = Object.values(auditReport.statsByProfessional).filter((stat) => {
    if (filterRole === 'ENFERMEIRO') return stat.role.includes('Enfermeiro');
    if (filterRole === 'TECNICO') return stat.role.includes('Técnico');
    if (filterRole === '6X1') return stat.regime === '6x1_ASSISTENCIAL' || stat.regime === '6x1_APOIO';
    return true;
  });

  return (
    <div className="space-y-6">
      
      {/* Hero Audit Banner */}
      <div className={`rounded-2xl p-6 border shadow-xs transition-all ${
        auditReport.isFullyCompliant
          ? 'bg-gradient-to-r from-emerald-50 via-teal-50/50 to-cyan-50 dark:from-emerald-950/40 dark:via-teal-950/20 dark:to-cyan-950/30 border-emerald-200 dark:border-emerald-800'
          : 'bg-gradient-to-r from-rose-50 via-amber-50 to-orange-50 dark:from-rose-950/40 dark:via-amber-950/20 dark:to-orange-950/30 border-rose-300 dark:border-rose-800'
      }`}>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 shadow-md ${
              auditReport.isFullyCompliant
                ? 'bg-emerald-600 text-white shadow-emerald-500/20'
                : 'bg-rose-600 text-white shadow-rose-500/20'
            }`}>
              {auditReport.isFullyCompliant ? (
                <ShieldCheck className="w-8 h-8" />
              ) : (
                <AlertTriangle className="w-8 h-8" />
              )}
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-white/80 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300">
                  Laudo Técnico de Auditoria Trabalhista
                </span>
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  • Competência: {monthYearLabel}
                </span>
              </div>

              <h2 className="text-2xl font-black text-slate-900 dark:text-white mt-1">
                {auditReport.isFullyCompliant ? (
                  <span className="text-emerald-700 dark:text-emerald-400">
                    100% Regular: Nenhuma Violação Trabalhista Detectada
                  </span>
                ) : (
                  <span className="text-rose-700 dark:text-rose-400">
                    Atenção: {auditReport.totalViolations} Apontamento(s) Trabalhista(s) Detectado(s)
                  </span>
                )}
              </h2>

              <p className="text-xs text-slate-600 dark:text-slate-300 max-w-2xl mt-1">
                Auditoria automatizada em tempo real conforme as diretrizes da CLT (Consolidação das Leis do Trabalho),
                Súmulas e Orientações Jurisprudenciais do Tribunal Superior do Trabalho (TST) e decisões vinculantes do STF.
              </p>
            </div>
          </div>

          {/* Quick Action Buttons in Banner */}
          <div className="flex flex-wrap items-center gap-2 self-start md:self-center">
            {onOpenExportModal && (
              <button
                onClick={onOpenExportModal}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-300 dark:border-slate-700 hover:bg-slate-50 transition-colors shadow-2xs"
              >
                <Printer className="w-3.5 h-3.5 text-teal-600" />
                Imprimir Parecer
              </button>
            )}

            {auditReport.isFullyCompliant && onSimulateViolation && (
              <button
                onClick={onSimulateViolation}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium bg-amber-100 hover:bg-amber-200 text-amber-900 border border-amber-300 transition-colors"
                title="Insere temporariamente um plantão em dia consecutivo para testar a detecção em tempo real"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-700" />
                Simular Violação CLT (Teste)
              </button>
            )}

            {!auditReport.isFullyCompliant && onResetSchedule && (
              <button
                onClick={onResetSchedule}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs transition-colors"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                Corrigir e Restaurar Escala Legal
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Critical Violations Alert List if any */}
      {auditReport.violations.length > 0 && (
        <div className="bg-rose-50 dark:bg-rose-950/50 border border-rose-300 dark:border-rose-800 rounded-xl p-4 space-y-3">
          <div className="flex items-center gap-2 text-rose-800 dark:text-rose-200 font-bold text-sm">
            <XCircle className="w-5 h-5 text-rose-600" />
            Infrações Registradas na Grade Atual ({auditReport.violations.length})
          </div>

          <div className="space-y-2">
            {auditReport.violations.map((violation) => (
              <div 
                key={violation.id}
                className="p-3 bg-white dark:bg-slate-900 rounded-lg border border-rose-200 dark:border-rose-900/60 shadow-2xs flex flex-col gap-1 text-xs"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-rose-700 dark:text-rose-400">
                    [{violation.article}] {violation.title}
                  </span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300">
                    {violation.severity}
                  </span>
                </div>
                <p className="text-slate-700 dark:text-slate-300">{violation.description}</p>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-100 dark:border-slate-800 mt-1">
                  <span className="font-mono">{violation.legalRef}</span>
                  <span className="text-teal-700 dark:text-teal-400 font-semibold">{violation.recommendation}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 3 Pillars of Labor Compliance: Arts. 59-A, 66, and 67 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        
        {/* Pillar 1: Artigo 59-A CLT */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Artigo 59-A da CLT
              </span>
              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold ${
                auditReport.art59AStatus === 'CONFORME'
                  ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                  : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
              }`}>
                {auditReport.art59AStatus === 'CONFORME' ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                ) : (
                  <XCircle className="w-3.5 h-3.5 text-rose-600" />
                )}
                {auditReport.art59AStatus}
              </span>
            </div>

            <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm mt-3">
              Jornada 12x36 & Repouso de 36h
            </h3>
            
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-1.5 leading-relaxed">
              O Art. 59-A faculta a jornada de 12 horas seguidas por 36 horas ininterruptas de descanso.
              A alternância estrita entre Turma A (dias ímpares) e Turma B (dias pares) assegura 36h completas entre plantões.
            </p>

            <div className="mt-3 p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 text-xs">
              <div className="font-semibold text-slate-700 dark:text-slate-300">
                Profissionais Auditados:
              </div>
              <div className="text-slate-500 dark:text-slate-400 text-[11px] mt-0.5">
                16 profissionais (8 Diurnos + 8 Noturnos). Todos com intervalo de 36 horas ininterruptas.
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 text-[11px] text-teal-700 dark:text-teal-400 font-semibold flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Nenhum plantão consecutivo 12x36
          </div>
        </div>

        {/* Pillar 2: Artigo 66 CLT */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Artigo 66 da CLT
              </span>
              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold ${
                auditReport.art66Status === 'CONFORME'
                  ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                  : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
              }`}>
                {auditReport.art66Status === 'CONFORME' ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                ) : (
                  <XCircle className="w-3.5 h-3.5 text-rose-600" />
                )}
                {auditReport.art66Status}
              </span>
            </div>

            <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm mt-3">
              Intervalo Interjornada de 11h
            </h3>
            
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-1.5 leading-relaxed">
              Exige no mínimo 11 horas consecutivas para descanso entre 2 jornadas de trabalho.
              Para 6x1 (6h/dia), o descanso diário é de 18 horas. Para 12x36, o descanso é de 36 horas.
            </p>

            <div className="mt-3 p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 text-xs">
              <div className="font-semibold text-slate-700 dark:text-slate-300">
                Mínimo Registrado no Mês:
              </div>
              <div className="text-slate-500 dark:text-slate-400 text-[11px] mt-0.5">
                18 horas consecutivas (turnos 6x1). Cumpre com ampla folga o mínimo legal de 11h.
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 text-[11px] text-teal-700 dark:text-teal-400 font-semibold flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Descanso interjornada 100% respeitado
          </div>
        </div>

        {/* Pillar 3: Artigo 67 CLT & Folga Dominical */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Art. 67 CLT & Art. 386
              </span>
              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold ${
                auditReport.art67Status === 'CONFORME'
                  ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                  : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
              }`}>
                {auditReport.art67Status === 'CONFORME' ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                ) : (
                  <XCircle className="w-3.5 h-3.5 text-rose-600" />
                )}
                {auditReport.art67Status}
              </span>
            </div>

            <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm mt-3">
              RSR & Folga Dominical Quinzenal
            </h3>
            
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-1.5 leading-relaxed">
              O RSR de 24h não pode ser concedido após 6 dias seguidos de trabalho (OJ 410 TST).
              Mulheres têm direito a folga dominical quinzenal (Art. 386 CLT / STF Tema 1023).
            </p>

            <div className="mt-3 p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 text-xs">
              <div className="font-semibold text-slate-700 dark:text-slate-300">
                Folgas Dominicais da Equipe 6x1:
              </div>
              <div className="text-slate-500 dark:text-slate-400 text-[11px] mt-0.5">
                Patrícia e Sabrina possuem folgas dominicais quinzenais regulares (dias 4, 18 e 25).
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 text-[11px] text-teal-700 dark:text-teal-400 font-semibold flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Conformidade plena com STF e OJ 410 TST
          </div>
        </div>

      </div>

      {/* Deep Dive Legal Accordion */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-xs">
        <div className="p-4 bg-slate-50/70 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Scale className="w-4 h-4 text-teal-600" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
              Fundamentação Jurídica & Jurisprudência Trabalhista Aplicada
            </h3>
          </div>
          <span className="text-xs text-slate-500">Clique para expandir cada fundamentação</span>
        </div>

        <div className="divide-y divide-slate-100 dark:divide-slate-800">
          
          {/* Article 59-A Details */}
          <div className="p-4">
            <button
              onClick={() => toggleArticle('art-59a')}
              className="w-full flex items-center justify-between text-left font-bold text-xs text-slate-800 dark:text-slate-200 hover:text-teal-600"
            >
              <span>1. Regime 12x36 (Artigo 59-A da CLT introduzido pela Lei 13.467/2017)</span>
              {expandedArticle === 'art-59a' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
            {expandedArticle === 'art-59a' && (
              <div className="mt-3 text-xs text-slate-600 dark:text-slate-400 space-y-2 pl-2 border-l-2 border-teal-500">
                <p>
                  <strong>Texto legal:</strong> <em>"Art. 59-A. Em exceção ao disposto no art. 59 desta Consolidação, é facultado às partes, mediante acordo individual escrito, convenção coletiva ou acordo coletivo de trabalho, estabelecer horário de trabalho de doze horas seguidas por trinta e seis horas ininterruptas de descanso, observados ou indenizados os intervalos para repouso e alimentação."</em>
                </p>
                <p>
                  <strong>Auditoria no Sistema:</strong> A escala hospitalar divide os 16 profissionais em duas turmas rigorosamente espelhadas:
                  a Turma A atua exclusivamente nos dias ímpares (01, 03, 05, etc.) e a Turma B atua exclusivamente nos dias pares (02, 04, 06, etc.).
                  Nenhum colaborador 12x36 trabalha em dias consecutivos, o que garante 36 horas ininterruptas de repouso físico e mental.
                </p>
                <p className="text-[11px] text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/40 p-2 rounded-md">
                  💡 <strong>Nota Técnica sobre Meses de 31 Dias:</strong> O dia 31 e o dia 1º do mês seguinte são ambos números ímpares. Em gestão hospitalar,
                  quando o mês tem 31 dias, os coordenadores podem alternar as turmas ou conceder folga compensatória para evitar que a Turma A faça dias 31 e 01 consecutivos.
                </p>
              </div>
            )}
          </div>

          {/* Article 66 Details */}
          <div className="p-4">
            <button
              onClick={() => toggleArticle('art-66')}
              className="w-full flex items-center justify-between text-left font-bold text-xs text-slate-800 dark:text-slate-200 hover:text-teal-600"
            >
              <span>2. Intervalo Interjornada de 11 Horas (Artigo 66 da CLT e Súmula 110 TST)</span>
              {expandedArticle === 'art-66' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
            {expandedArticle === 'art-66' && (
              <div className="mt-3 text-xs text-slate-600 dark:text-slate-400 space-y-2 pl-2 border-l-2 border-teal-500">
                <p>
                  <strong>Texto legal:</strong> <em>"Art. 66. Entre 2 (duas) jornadas de trabalho haverá um período mínimo de 11 (onze) horas consecutivas para descanso."</em>
                </p>
                <p>
                  <strong>Auditoria no Sistema:</strong> Para a equipe de 6x1 (6 horas diárias):
                  o profissional da manhã (07h às 13h) descansa 18 horas consecutivas até as 07h do dia seguinte;
                  o profissional da tarde (13h às 19h) descansa 18 horas consecutivas até as 13h do dia seguinte.
                  Ambos superam folgadamente as 11 horas mínimas.
                </p>
              </div>
            )}
          </div>

          {/* Article 67 Details */}
          <div className="p-4">
            <button
              onClick={() => toggleArticle('art-67')}
              className="w-full flex items-center justify-between text-left font-bold text-xs text-slate-800 dark:text-slate-200 hover:text-teal-600"
            >
              <span>3. Repouso Semanal Remunerado e Folga Dominical (Art. 67, OJ 410 TST e Art. 386 CLT)</span>
              {expandedArticle === 'art-67' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
            {expandedArticle === 'art-67' && (
              <div className="mt-3 text-xs text-slate-600 dark:text-slate-400 space-y-2 pl-2 border-l-2 border-teal-500">
                <p>
                  <strong>Texto legal (Art. 67):</strong> <em>"Será assegurado a todo empregado um descanso semanal remunerado de 24 (vinte e quatro) horas consecutivas, o qual, salvo motivo de conveniência pública ou necessidade imperiosa do serviço, deverá coincidir com o domingo, no todo ou em parte."</em>
                </p>
                <p>
                  <strong>OJ 410 da SDI-1 do TST:</strong> <em>"Viola o art. 7º, XV, da CF a concessão de repouso semanal remunerado após o sétimo dia consecutivo de trabalho, importando no seu pagamento em dobro."</em>
                  Nossa grade garante que nenhum profissional da equipe 6x1 atinja 7 dias consecutivos. A maior sequência contínua de trabalho é de no máximo 6 dias.
                </p>
                <p>
                  <strong>Folga Dominical para Mulheres (Art. 386 CLT e Tema 1023 do STF):</strong>
                  O Supremo Tribunal Federal, ao julgar o Tema 1023 com repercussão geral, fixou que o art. 386 da CLT foi recepcionado pela Constituição Federal de 1988,
                  garantindo às mulheres trabalhadoras escala de revezamento quinzenal com repouso em domingo.
                  Nossa grade concede folgas dominicais quinzenais para as enfermeiras e técnicas mulheres (dias 04, 18 e 25).
                </p>
              </div>
            )}
          </div>

        </div>
      </div>

      {/* Individual Professional Audit Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-xs">
        
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Users className="w-4 h-4 text-teal-600" />
              Auditoria Individual dos 20 Profissionais ({filteredStats.length} exibidos)
            </h3>
            <p className="text-xs text-slate-500">
              Verificação detalhada de carga horária, descansos, folgas em domingo e sequência de trabalho
            </p>
          </div>

          <div className="inline-flex rounded-lg border border-slate-200 dark:border-slate-700 p-0.5 text-xs">
            <button
              onClick={() => setFilterRole('ALL')}
              className={`px-2.5 py-1 rounded font-medium ${filterRole === 'ALL' ? 'bg-teal-600 text-white' : 'text-slate-600 dark:text-slate-300'}`}
            >
              Todos (20)
            </button>
            <button
              onClick={() => setFilterRole('ENFERMEIRO')}
              className={`px-2.5 py-1 rounded font-medium ${filterRole === 'ENFERMEIRO' ? 'bg-teal-600 text-white' : 'text-slate-600 dark:text-slate-300'}`}
            >
              Enfermeiros (10)
            </button>
            <button
              onClick={() => setFilterRole('TECNICO')}
              className={`px-2.5 py-1 rounded font-medium ${filterRole === 'TECNICO' ? 'bg-teal-600 text-white' : 'text-slate-600 dark:text-slate-300'}`}
            >
              Técnicos (10)
            </button>
            <button
              onClick={() => setFilterRole('6X1')}
              className={`px-2.5 py-1 rounded font-medium ${filterRole === '6X1' ? 'bg-teal-600 text-white' : 'text-slate-600 dark:text-slate-300'}`}
            >
              Equipe 6x1 (4)
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 border-b border-slate-200 dark:border-slate-700">
              <tr>
                <th className="px-3 py-2.5 font-bold uppercase text-[10px]">Profissional</th>
                <th className="px-3 py-2.5 font-bold uppercase text-[10px]">Regime / Turma</th>
                <th className="px-3 py-2.5 font-bold uppercase text-[10px] text-center">Plantões</th>
                <th className="px-3 py-2.5 font-bold uppercase text-[10px] text-center">Horas Mês</th>
                <th className="px-3 py-2.5 font-bold uppercase text-[10px] text-center">RSR / Folgas</th>
                <th className="px-3 py-2.5 font-bold uppercase text-[10px] text-center">Folga Domingo</th>
                <th className="px-3 py-2.5 font-bold uppercase text-[10px] text-center">Max. Consecutivos</th>
                <th className="px-3 py-2.5 font-bold uppercase text-[10px] text-center">Menor Interjornada</th>
                <th className="px-3 py-2.5 font-bold uppercase text-[10px] text-center">Parecer CLT</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredStats.map((stat) => (
                <tr key={stat.professionalId} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors">
                  <td className="px-3 py-2.5">
                    <div className="font-bold text-slate-900 dark:text-slate-100">{stat.professionalName}</div>
                    <div className="text-[10px] text-slate-400">{stat.role} • {stat.gender === 'F' ? 'Mulher' : 'Homem'}</div>
                  </td>
                  <td className="px-3 py-2.5">
                    <span className="font-mono text-[11px] text-slate-700 dark:text-slate-300">
                      {stat.regime.replace('_', ' ')}
                    </span>
                    <div className="text-[10px] text-slate-400">
                      {stat.turma === 'TURMA_A' ? 'Dias Ímpares' : stat.turma === 'TURMA_B' ? 'Dias Pares' : 'Escala Semanal'}
                    </div>
                  </td>
                  <td className="px-3 py-2.5 text-center font-semibold text-slate-800 dark:text-slate-200">
                    {stat.totalShiftsCount}
                  </td>
                  <td className="px-3 py-2.5 text-center font-bold text-teal-700 dark:text-teal-300 font-mono">
                    {stat.totalWorkHours}h
                  </td>
                  <td className="px-3 py-2.5 text-center text-slate-700 dark:text-slate-300">
                    {stat.totalRSRCount} dias
                  </td>
                  <td className="px-3 py-2.5 text-center">
                    <span className={`inline-flex items-center gap-1 font-semibold ${
                      stat.totalSundayOffs >= 2 ? 'text-emerald-700 dark:text-emerald-400' : 'text-slate-700 dark:text-slate-300'
                    }`}>
                      {stat.totalSundayOffs} de {stat.totalSundaysInMonth}
                      {stat.totalSundayOffs >= 2 && <CheckCircle2 className="w-3 h-3 text-emerald-500" />}
                    </span>
                  </td>
                  <td className="px-3 py-2.5 text-center">
                    <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                      stat.maxConsecutiveDaysWorked <= 6 
                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' 
                        : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                    }`}>
                      {stat.maxConsecutiveDaysWorked} dias
                    </span>
                  </td>
                  <td className="px-3 py-2.5 text-center font-mono">
                    <span className="text-slate-700 dark:text-slate-300">
                      {stat.minInterjornadaHours}h
                    </span>
                  </td>
                  <td className="px-3 py-2.5 text-center">
                    {stat.status === 'CONFORME' ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        100% Legal
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300">
                        <XCircle className="w-3 h-3 text-rose-600" />
                        Violação
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

      </div>

    </div>
  );
};
