import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { MonthRoster, AuditReport, SupabaseConfig, Professional } from '../types/escala';
import { PROFESSIONALS_LIST } from '../data/initialData';

const STORAGE_KEY_CONFIG = 'hospital_escala_supabase_config';
const STORAGE_KEY_LOCAL_ROSTER = 'hospital_escala_local_backup_';

// Default / fallback env variables if injected
const envUrl = (import.meta.env.VITE_SUPABASE_URL as string) || '';
const envKey = (import.meta.env.VITE_SUPABASE_ANON_KEY as string) || '';

let cachedClient: SupabaseClient | null = null;

export function getSavedSupabaseConfig(): SupabaseConfig {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_CONFIG);
    if (raw) {
      const parsed = JSON.parse(raw);
      return {
        url: parsed.url || envUrl,
        anonKey: parsed.anonKey || envKey,
        tableNameSchedules: parsed.tableNameSchedules || 'escala_mensal',
        tableNameProfessionals: parsed.tableNameProfessionals || 'escala_profissionais',
        tableNameAudit: parsed.tableNameAudit || 'escala_auditoria',
        isConnected: Boolean(parsed.isConnected),
        lastSyncedAt: parsed.lastSyncedAt,
      };
    }
  } catch (e) {
    console.warn('Error reading supabase config from storage:', e);
  }

  return {
    url: envUrl,
    anonKey: envKey,
    tableNameSchedules: 'escala_mensal',
    tableNameProfessionals: 'escala_profissionais',
    tableNameAudit: 'escala_auditoria',
    isConnected: Boolean(envUrl && envKey),
  };
}

export function saveSupabaseConfig(config: Partial<SupabaseConfig>): SupabaseConfig {
  const current = getSavedSupabaseConfig();
  const updated: SupabaseConfig = { ...current, ...config };
  try {
    localStorage.setItem(STORAGE_KEY_CONFIG, JSON.stringify(updated));
  } catch (e) {
    console.error('Failed to save supabase config:', e);
  }
  cachedClient = null; // reset client
  return updated;
}

export function getSupabaseClient(): SupabaseClient | null {
  if (cachedClient) return cachedClient;

  const config = getSavedSupabaseConfig();
  if (config.url && config.anonKey) {
    try {
      cachedClient = createClient(config.url, config.anonKey, {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
        },
      });
      return cachedClient;
    } catch (err) {
      console.error('Failed to create Supabase client:', err);
      return null;
    }
  }
  return null;
}

/**
 * Checks connection health to Supabase
 */
export async function testSupabaseConnection(url?: string, key?: string): Promise<{ success: boolean; message: string }> {
  const targetUrl = url || getSavedSupabaseConfig().url;
  const targetKey = key || getSavedSupabaseConfig().anonKey;

  if (!targetUrl || !targetKey) {
    return {
      success: false,
      message: 'URL do Supabase ou Anon Key não informados.',
    };
  }

  try {
    const tempClient = createClient(targetUrl, targetKey);
    // Ping with a lightweight request
    const { error } = await tempClient.from('escala_mensal').select('id').limit(1);

    if (error && error.code !== 'PGRST116') {
      // If table doesn't exist yet, it's still connected to Supabase
      if (error.message.includes('relation "public.escala_mensal" does not exist') || error.code === '42P01') {
        return {
          success: true,
          message: 'Conectado ao Supabase com sucesso! (Observação: Crie as tabelas executando o script SQL fornecido abaixo).',
        };
      }
      return {
        success: false,
        message: `Erro do Supabase: ${error.message}`,
      };
    }

    return {
      success: true,
      message: 'Conexão com o Supabase estabelecida com sucesso e tabelas verificadas!',
    };
  } catch (err: any) {
    return {
      success: false,
      message: err.message || 'Falha ao conectar com o Supabase. Verifique a URL e a Anon Key.',
    };
  }
}

/**
 * Synchronizes the monthly scale to Supabase (with automatic local storage fallback)
 */
export async function syncRosterToDatabase(
  roster: MonthRoster,
  auditReport?: AuditReport
): Promise<{ success: boolean; mode: 'supabase' | 'local'; message: string }> {
  // Always keep a local copy as backup
  try {
    localStorage.setItem(
      `${STORAGE_KEY_LOCAL_ROSTER}${roster.year}_${roster.month}`,
      JSON.stringify(roster)
    );
  } catch (e) {
    console.warn('Could not save local backup:', e);
  }

  const client = getSupabaseClient();
  const config = getSavedSupabaseConfig();

  if (!client || !config.url || !config.anonKey) {
    return {
      success: true,
      mode: 'local',
      message: 'Escala salva localmente no navegador! Insira as credenciais do Supabase para sincronizar na nuvem.',
    };
  }

  try {
    const monthYear = `${roster.year}-${String(roster.month).padStart(2, '0')}`;

    // 1. Ensure professionals exist in Supabase
    const profRows = PROFESSIONALS_LIST.map((p) => ({
      id: p.id,
      ordem: p.orderNumber,
      nome: p.name,
      cargo: p.role,
      categoria: p.category,
      regime: p.regime,
      turma: p.turma,
      genero: p.gender,
      coren: p.coren,
      turno_padrao: p.defaultShift,
      horario_label: p.horarioLabel,
    }));

    await client.from(config.tableNameProfessionals).upsert(profRows, { onConflict: 'id' });

    // 2. Prepare daily schedule records
    const scheduleRows: any[] = [];
    Object.entries(roster.records).forEach(([profId, days]) => {
      days.forEach((dayData) => {
        scheduleRows.push({
          mes_ano: monthYear,
          profissional_id: profId,
          dia: dayData.day,
          data_completa: dayData.dateStr,
          dia_da_semana: dayData.dayOfWeek,
          tipo_turno: dayData.shiftType,
          is_custom: dayData.isCustomModified || false,
          observacao: dayData.note || null,
          updated_at: new Date().toISOString(),
        });
      });
    });

    // Delete existing entries for this month/year and insert fresh
    await client
      .from(config.tableNameSchedules)
      .delete()
      .eq('mes_ano', monthYear);

    const { error: insertError } = await client
      .from(config.tableNameSchedules)
      .insert(scheduleRows);

    if (insertError) {
      throw insertError;
    }

    // 3. Save audit log if provided
    if (auditReport) {
      await client.from(config.tableNameAudit).upsert(
        {
          mes_ano: monthYear,
          status_geral: auditReport.isFullyCompliant ? '100% CONFORME' : 'IRREGULARIDADES DETECTADAS',
          score_conformidade: auditReport.compliancePercentage,
          total_violacoes: auditReport.totalViolations,
          violacoes_criticas: auditReport.criticalViolations,
          violacoes_advertencia: auditReport.warningViolations,
          art_59a_status: auditReport.art59AStatus,
          art_66_status: auditReport.art66Status,
          art_67_status: auditReport.art67Status,
          detalhes_json: auditReport.violations,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'mes_ano' }
      );
    }

    saveSupabaseConfig({ isConnected: true, lastSyncedAt: new Date().toISOString() });

    return {
      success: true,
      mode: 'supabase',
      message: `Escala de ${monthYear} gravada no Supabase com sucesso! (${scheduleRows.length} turnos sincronizados)`,
    };
  } catch (error: any) {
    console.error('Error syncing to Supabase:', error);
    return {
      success: false,
      mode: 'local',
      message: `Falha ao salvar no Supabase (${error.message || 'Erro desconhecido'}). Os dados estão seguros localmente.`,
    };
  }
}

/**
 * Loads schedule from Supabase or fallback to local storage
 */
export async function loadRosterFromDatabase(
  year: number,
  month: number
): Promise<{ roster: MonthRoster | null; source: 'supabase' | 'local' | 'none' }> {
  const client = getSupabaseClient();
  const config = getSavedSupabaseConfig();
  const monthYear = `${year}-${String(month).padStart(2, '0')}`;

  // Try Supabase first if configured
  if (client && config.url && config.anonKey) {
    try {
      const { data, error } = await client
        .from(config.tableNameSchedules)
        .select('*')
        .eq('mes_ano', monthYear)
        .order('dia', { ascending: true });

      if (!error && data && data.length > 0) {
        const records: MonthRoster['records'] = {};
        const totalDays = new Date(year, month, 0).getDate();

        // Group by professional_id
        data.forEach((row: any) => {
          if (!records[row.profissional_id]) {
            records[row.profissional_id] = [];
          }
          records[row.profissional_id].push({
            day: row.dia,
            dateStr: row.data_completa,
            dayOfWeek: row.dia_da_semana,
            isSunday: row.dia_da_semana === 0,
            isSaturday: row.dia_da_semana === 6,
            shiftType: row.tipo_turno,
            isCustomModified: row.is_custom,
            note: row.observacao,
          });
        });

        return {
          roster: {
            year,
            month,
            totalDays,
            records,
            updatedAt: new Date().toISOString(),
          },
          source: 'supabase',
        };
      }
    } catch (err) {
      console.warn('Could not load from Supabase:', err);
    }
  }

  // Fallback to local storage
  try {
    const raw = localStorage.getItem(`${STORAGE_KEY_LOCAL_ROSTER}${year}_${month}`);
    if (raw) {
      return {
        roster: JSON.parse(raw) as MonthRoster,
        source: 'local',
      };
    }
  } catch (err) {
    console.warn('Error reading local roster:', err);
  }

  return { roster: null, source: 'none' };
}

/**
 * Returns the ready-to-run PostgreSQL schema and storage script for Supabase
 */
export function getSupabaseSQLScript(): string {
  return `-- ==============================================================================
-- SISTEMA DE GESTÃO DE ESCALAS HOSPITALARES & AUDITORIA CLT
-- SCRIPT COMPLETO DE BANCO DE DADOS, POLÍTICAS DE RLS E POLÍTICAS DE STORAGE
-- Plataforma: Supabase (PostgreSQL 15+)
-- ==============================================================================

-- Habilitar extensões necessárias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ------------------------------------------------------------------------------
-- 1. TABELA DE PROFISSIONAIS (20 Profissionais: Enfermeiros e Técnicos)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.escala_profissionais (
    id TEXT PRIMARY KEY,
    ordem INT NOT NULL,
    nome TEXT NOT NULL,
    cargo TEXT NOT NULL,
    categoria TEXT NOT NULL CHECK (categoria IN ('ENFERMEIRO', 'TECNICO')),
    regime TEXT NOT NULL CHECK (regime IN ('12x36_DIURNO', '12x36_NOTURNO', '6x1_ASSISTENCIAL', '6x1_APOIO')),
    turma TEXT NOT NULL CHECK (turma IN ('TURMA_A', 'TURMA_B', '6X1')),
    genero CHAR(1) NOT NULL CHECK (genero IN ('F', 'M')),
    coren TEXT NOT NULL,
    turno_padrao TEXT NOT NULL,
    horario_label TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ------------------------------------------------------------------------------
-- 2. TABELA DE ESCALA MENSAL (Turnos e Plantões Dia a Dia)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.escala_mensal (
    id BIGSERIAL PRIMARY KEY,
    mes_ano TEXT NOT NULL, -- Formato 'YYYY-MM', ex: '2026-10'
    profissional_id TEXT NOT NULL REFERENCES public.escala_profissionais(id) ON DELETE CASCADE,
    dia INT NOT NULL CHECK (dia >= 1 AND dia <= 31),
    data_completa DATE NOT NULL,
    dia_da_semana INT NOT NULL CHECK (dia_da_semana >= 0 AND dia_da_semana <= 6), -- 0=Domingo, 6=Sábado
    tipo_turno TEXT NOT NULL CHECK (tipo_turno IN ('PD', 'PN', 'M', 'T', 'F', 'FE', 'LM')),
    is_custom BOOLEAN DEFAULT false,
    observacao TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    CONSTRAINT unq_escala_dia_prof UNIQUE(mes_ano, profissional_id, dia)
);

-- ------------------------------------------------------------------------------
-- 3. TABELA DE AUDITORIA CLT (Histórico e Laudos dos Arts. 59-A, 66 e 67)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.escala_auditoria (
    id BIGSERIAL PRIMARY KEY,
    mes_ano TEXT NOT NULL UNIQUE, -- Formato 'YYYY-MM', ex: '2026-10'
    status_geral TEXT NOT NULL,
    score_conformidade INT NOT NULL,
    total_violacoes INT NOT NULL,
    violacoes_criticas INT NOT NULL,
    violacoes_advertencia INT NOT NULL,
    art_59a_status TEXT NOT NULL,
    art_66_status TEXT NOT NULL,
    art_67_status TEXT NOT NULL,
    detalhes_json JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ------------------------------------------------------------------------------
-- 4. ÍNDICES DE ALTA PERFORMANCE
-- ------------------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_escala_mensal_mes_ano ON public.escala_mensal(mes_ano);
CREATE INDEX IF NOT EXISTS idx_escala_mensal_prof_id ON public.escala_mensal(profissional_id);
CREATE INDEX IF NOT EXISTS idx_escala_mensal_data ON public.escala_mensal(data_completa);
CREATE INDEX IF NOT EXISTS idx_escala_mensal_turno ON public.escala_mensal(tipo_turno);

-- ------------------------------------------------------------------------------
-- 5. TRIGGER AUTOMÁTICO DE ATUALIZAÇÃO (updated_at)
-- ------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_escala_profissionais_updated_at ON public.escala_profissionais;
CREATE TRIGGER trg_escala_profissionais_updated_at
BEFORE UPDATE ON public.escala_profissionais
FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS trg_escala_mensal_updated_at ON public.escala_mensal;
CREATE TRIGGER trg_escala_mensal_updated_at
BEFORE UPDATE ON public.escala_mensal
FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS trg_escala_auditoria_updated_at ON public.escala_auditoria;
CREATE TRIGGER trg_escala_auditoria_updated_at
BEFORE UPDATE ON public.escala_auditoria
FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ------------------------------------------------------------------------------
-- 6. POLÍTICAS DE ROW LEVEL SECURITY (RLS) NAS TABELAS
-- ------------------------------------------------------------------------------
ALTER TABLE public.escala_profissionais ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.escala_mensal ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.escala_auditoria ENABLE ROW LEVEL SECURITY;

-- Limpar políticas antigas se existirem
DROP POLICY IF EXISTS "Permitir leitura de profissionais" ON public.escala_profissionais;
DROP POLICY IF EXISTS "Permitir gravação de profissionais" ON public.escala_profissionais;
DROP POLICY IF EXISTS "Permitir leitura da escala" ON public.escala_mensal;
DROP POLICY IF EXISTS "Permitir inserção e alteração da escala" ON public.escala_mensal;
DROP POLICY IF EXISTS "Permitir exclusão da escala" ON public.escala_mensal;
DROP POLICY IF EXISTS "Permitir leitura da auditoria" ON public.escala_auditoria;
DROP POLICY IF EXISTS "Permitir gravação de auditoria" ON public.escala_auditoria;

-- Políticas para acesso público/anon e autenticado
CREATE POLICY "Permitir leitura de profissionais"
ON public.escala_profissionais FOR SELECT
USING (true);

CREATE POLICY "Permitir gravação de profissionais"
ON public.escala_profissionais FOR ALL
USING (true)
WITH CHECK (true);

CREATE POLICY "Permitir leitura da escala"
ON public.escala_mensal FOR SELECT
USING (true);

CREATE POLICY "Permitir inserção e alteração da escala"
ON public.escala_mensal FOR INSERT
WITH CHECK (true);

CREATE POLICY "Permitir atualização da escala"
ON public.escala_mensal FOR UPDATE
USING (true)
WITH CHECK (true);

CREATE POLICY "Permitir exclusão da escala"
ON public.escala_mensal FOR DELETE
USING (true);

CREATE POLICY "Permitir leitura da auditoria"
ON public.escala_auditoria FOR SELECT
USING (true);

CREATE POLICY "Permitir gravação de auditoria"
ON public.escala_auditoria FOR ALL
USING (true)
WITH CHECK (true);

-- ------------------------------------------------------------------------------
-- 7. SUPABASE STORAGE BUCKET & POLÍTICAS DE ARMAZENAMENTO (storage.objects)
-- Armazenamento de Laudos de Auditoria CLT, PDFs e Planilhas CSV exportadas
-- ------------------------------------------------------------------------------

-- Criar bucket de armazenamento público para documentos de escala caso não exista
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'escalas-documentos',
    'escalas-documentos',
    true,
    10485760, -- Limite de 10MB por arquivo
    ARRAY['application/pdf', 'text/csv', 'application/json', 'application/vnd.ms-excel', 'text/plain']
)
ON CONFLICT (id) DO UPDATE SET
    public = true,
    file_size_limit = 10485760,
    allowed_mime_types = ARRAY['application/pdf', 'text/csv', 'application/json', 'application/vnd.ms-excel', 'text/plain'];

-- Políticas de Armazenamento no storage.objects
DROP POLICY IF EXISTS "Permitir visualização e download de documentos" ON storage.objects;
CREATE POLICY "Permitir visualização e download de documentos"
ON storage.objects FOR SELECT
USING (bucket_id = 'escalas-documentos');

DROP POLICY IF EXISTS "Permitir upload de laudos e escalas" ON storage.objects;
CREATE POLICY "Permitir upload de laudos e escalas"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'escalas-documentos');

DROP POLICY IF EXISTS "Permitir atualização de laudos e escalas" ON storage.objects;
CREATE POLICY "Permitir atualização de laudos e escalas"
ON storage.objects FOR UPDATE
USING (bucket_id = 'escalas-documentos')
WITH CHECK (bucket_id = 'escalas-documentos');

DROP POLICY IF EXISTS "Permitir exclusão de laudos e escalas" ON storage.objects;
CREATE POLICY "Permitir exclusão de laudos e escalas"
ON storage.objects FOR DELETE
USING (bucket_id = 'escalas-documentos');

-- ------------------------------------------------------------------------------
-- 8. CARGA INICIAL (SEED) DOS 20 PROFISSIONAIS OFICIAIS
-- ------------------------------------------------------------------------------
INSERT INTO public.escala_profissionais (id, ordem, nome, cargo, categoria, regime, turma, genero, coren, turno_padrao, horario_label)
VALUES
  -- ENFERMEIROS (10)
  ('enf-1', 1, 'Camila Ribeiro', 'Enfermeiro(a)', 'ENFERMEIRO', '12x36_DIURNO', 'TURMA_A', 'F', 'COREN-SP 458.120-ENF', 'PD', '12x36 Diurno (07h-19h) • Turma A (Dias Ímpares)'),
  ('enf-2', 2, 'Bruno Silveira', 'Enfermeiro(a)', 'ENFERMEIRO', '12x36_DIURNO', 'TURMA_A', 'M', 'COREN-SP 392.481-ENF', 'PD', '12x36 Diurno (07h-19h) • Turma A (Dias Ímpares)'),
  ('enf-3', 3, 'Mariana Costa', 'Enfermeiro(a)', 'ENFERMEIRO', '12x36_DIURNO', 'TURMA_B', 'F', 'COREN-SP 512.903-ENF', 'PD', '12x36 Diurno (07h-19h) • Turma B (Dias Pares)'),
  ('enf-4', 4, 'Rafael Duarte', 'Enfermeiro(a)', 'ENFERMEIRO', '12x36_DIURNO', 'TURMA_B', 'M', 'COREN-SP 487.654-ENF', 'PD', '12x36 Diurno (07h-19h) • Turma B (Dias Pares)'),
  ('enf-5', 5, 'Juliana Martins', 'Enfermeiro(a)', 'ENFERMEIRO', '12x36_NOTURNO', 'TURMA_A', 'F', 'COREN-SP 423.771-ENF', 'PN', '12x36 Noturno (19h-07h) • Turma A (Dias Ímpares)'),
  ('enf-6', 6, 'Lucas Andrade', 'Enfermeiro(a)', 'ENFERMEIRO', '12x36_NOTURNO', 'TURMA_A', 'M', 'COREN-SP 461.328-ENF', 'PN', '12x36 Noturno (19h-07h) • Turma A (Dias Ímpares)'),
  ('enf-7', 7, 'Fernanda Gomes', 'Enfermeiro(a)', 'ENFERMEIRO', '12x36_NOTURNO', 'TURMA_B', 'F', 'COREN-SP 534.119-ENF', 'PN', '12x36 Noturno (19h-07h) • Turma B (Dias Pares)'),
  ('enf-8', 8, 'Thiago Meireles', 'Enfermeiro(a)', 'ENFERMEIRO', '12x36_NOTURNO', 'TURMA_B', 'M', 'COREN-SP 389.245-ENF', 'PN', '12x36 Noturno (19h-07h) • Turma B (Dias Pares)'),
  ('enf-9', 9, 'Patrícia Lima', 'Enfermeiro(a)', 'ENFERMEIRO', '6x1_ASSISTENCIAL', '6X1', 'F', 'COREN-SP 501.882-ENF', 'M', '6x1 Assistencial Manhã (07h-13h) • 6h/dia'),
  ('enf-10', 10, 'Diego Farias', 'Enfermeiro(a)', 'ENFERMEIRO', '6x1_ASSISTENCIAL', '6X1', 'M', 'COREN-SP 477.309-ENF', 'T', '6x1 Assistencial Tarde (13h-19h) • 6h/dia'),

  -- TÉCNICOS DE ENFERMAGEM (10)
  ('tec-1', 11, 'Aline Souza', 'Técnico(a) de Enfermagem', 'TECNICO', '12x36_DIURNO', 'TURMA_A', 'F', 'COREN-SP 982.114-TE', 'PD', '12x36 Diurno (07h-19h) • Turma A (Dias Ímpares)'),
  ('tec-2', 12, 'Gabriel Rocha', 'Técnico(a) de Enfermagem', 'TECNICO', '12x36_DIURNO', 'TURMA_A', 'M', 'COREN-SP 873.490-TE', 'PD', '12x36 Diurno (07h-19h) • Turma A (Dias Ímpares)'),
  ('tec-3', 13, 'Letícia Pires', 'Técnico(a) de Enfermagem', 'TECNICO', '12x36_DIURNO', 'TURMA_B', 'F', 'COREN-SP 912.834-TE', 'PD', '12x36 Diurno (07h-19h) • Turma B (Dias Pares)'),
  ('tec-4', 14, 'Marcelo Antunes', 'Técnico(a) de Enfermagem', 'TECNICO', '12x36_DIURNO', 'TURMA_B', 'M', 'COREN-SP 795.661-TE', 'PD', '12x36 Diurno (07h-19h) • Turma B (Dias Pares)'),
  ('tec-5', 15, 'Beatriz Mendes', 'Técnico(a) de Enfermagem', 'TECNICO', '12x36_NOTURNO', 'TURMA_A', 'F', 'COREN-SP 884.215-TE', 'PN', '12x36 Noturno (19h-07h) • Turma A (Dias Ímpares)'),
  ('tec-6', 16, 'Rodrigo Neves', 'Técnico(a) de Enfermagem', 'TECNICO', '12x36_NOTURNO', 'TURMA_A', 'M', 'COREN-SP 821.943-TE', 'PN', '12x36 Noturno (19h-07h) • Turma A (Dias Ímpares)'),
  ('tec-7', 17, 'Vanessa Toledo', 'Técnico(a) de Enfermagem', 'TECNICO', '12x36_NOTURNO', 'TURMA_B', 'F', 'COREN-SP 934.782-TE', 'PN', '12x36 Noturno (19h-07h) • Turma B (Dias Pares)'),
  ('tec-8', 18, 'Igor Carvalho', 'Técnico(a) de Enfermagem', 'TECNICO', '12x36_NOTURNO', 'TURMA_B', 'M', 'COREN-SP 763.504-TE', 'PN', '12x36 Noturno (19h-07h) • Turma B (Dias Pares)'),
  ('tec-9', 19, 'Sabrina Moraes', 'Técnico(a) de Enfermagem', 'TECNICO', '6x1_APOIO', '6X1', 'F', 'COREN-SP 950.412-TE', 'M', '6x1 Apoio Manhã (07h-13h) • 6h/dia'),
  ('tec-10', 20, 'Caio Batista', 'Técnico(a) de Enfermagem', 'TECNICO', '6x1_APOIO', '6X1', 'M', 'COREN-SP 849.123-TE', 'T', '6x1 Apoio Tarde (13h-19h) • 6h/dia')
ON CONFLICT (id) DO UPDATE SET
    ordem = EXCLUDED.ordem,
    nome = EXCLUDED.nome,
    cargo = EXCLUDED.cargo,
    categoria = EXCLUDED.categoria,
    regime = EXCLUDED.regime,
    turma = EXCLUDED.turma,
    genero = EXCLUDED.genero,
    coren = EXCLUDED.coren,
    turno_padrao = EXCLUDED.turno_padrao,
    horario_label = EXCLUDED.horario_label,
    updated_at = timezone('utc'::text, now());
`;
}
