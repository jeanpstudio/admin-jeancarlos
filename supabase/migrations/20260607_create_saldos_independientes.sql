-- =========================================================================
-- MIGRACIÓN: CREACIÓN DE TABLA DE SALDOS INDEPENDIENTES
-- =========================================================================

CREATE TABLE IF NOT EXISTS saldos_independientes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    paciente_id UUID NOT NULL REFERENCES pacientes(id) ON DELETE CASCADE,
    fecha TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    procedimiento TEXT NOT NULL,
    saldo NUMERIC(10, 2) NOT NULL DEFAULT 0.00 CHECK (saldo >= 0)
);

CREATE INDEX IF NOT EXISTS idx_saldos_independientes_paciente ON saldos_independientes(paciente_id);
