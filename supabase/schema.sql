-- =========================================================================
-- ESQUEMA DE BASE DE DATOS PARA DASHBOARD CLÍNICO ODONTOLÓGICO (SUPABASE)
-- =========================================================================

-- Habilitar extensión para generar UUIDs si no está activa
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. TABLA: PACIENTES
-- Almacena los datos personales e historial clínico (antecedentes médicos)
CREATE TABLE IF NOT EXISTS pacientes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nombre_completo VARCHAR(255) NOT NULL,
    edad INTEGER CHECK (edad >= 0),
    sexo VARCHAR(50),
    dni VARCHAR(20) UNIQUE,
    telefono VARCHAR(50),
    email VARCHAR(100),
    direccion TEXT,
    ocupacion VARCHAR(100),
    fecha_registro TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    es_antiguo BOOLEAN DEFAULT false,
    
    -- Antecedentes Médicos (Historia Clínica Física - Foto 1)
    alergias TEXT,                  -- Alergias a medicamentos, alimentos, anestésicos, etc.
    hemorragias TEXT,               -- Problemas de coagulación o sangrados anormales
    enfermedades TEXT,              -- Diabetes, hipertensión, problemas cardiacos, etc.
    medicamentos_actuales TEXT,     -- Qué medicamentos está tomando al momento de la consulta
    motivo_consulta TEXT            -- ¿Por qué acude al consultorio dental?
);

-- Indexar DNI y Nombre para búsquedas rápidas
CREATE INDEX IF NOT EXISTS idx_pacientes_dni ON pacientes(dni);
CREATE INDEX IF NOT EXISTS idx_pacientes_nombre ON pacientes(nombre_completo);


-- 2. TABLA: PROCEDIMIENTOS_CATALOGO
-- Catálogo de procedimientos odontológicos con sus costos de referencia
CREATE TABLE IF NOT EXISTS procedimientos_catalogo (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nombre_procedimiento VARCHAR(255) NOT NULL UNIQUE,
    costo_base NUMERIC(10, 2) NOT NULL DEFAULT 0.00 CHECK (costo_base >= 0)
);


-- 3. TABLA: TRATAMIENTOS_PACIENTE
-- Representa la cabecera de la consulta, almacena el estado completo del odontograma y el balance general financiero
CREATE TABLE IF NOT EXISTS tratamientos_paciente (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    paciente_id UUID NOT NULL REFERENCES pacientes(id) ON DELETE CASCADE,
    fecha TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- Estado completo del odontograma interactivo representado en JSONB.
    -- Estructura sugerida por pieza dental: 
    -- { "numero": 18, "ausente": false, "caras": { "V": "limpio", "O": "caries", "D": "curado" }, "diagnosticos": {}, "procedimientoMarkings": {}, "observacion": "Notas de observación clínica" }
    odontograma_estado JSONB NOT NULL DEFAULT '{}'::jsonb,
    
    -- Resumen financiero (Ficha de Costos - Foto 2)
    total_costo NUMERIC(10, 2) NOT NULL DEFAULT 0.00 CHECK (total_costo >= 0),
    adelanto NUMERIC(10, 2) NOT NULL DEFAULT 0.00 CHECK (adelanto >= 0),
    saldo NUMERIC(10, 2) GENERATED ALWAYS AS (total_costo - adelanto) STORED,
    estado VARCHAR(50) DEFAULT 'presupuesto_pendiente',
    sesiones JSONB DEFAULT '[]'::jsonb
);

-- Indexar por paciente para cargar su historial clínico rápidamente
CREATE INDEX IF NOT EXISTS idx_tratamientos_paciente_id ON tratamientos_paciente(paciente_id);


-- 4. TABLA: DETALLES_TRATAMIENTO
-- Detalle de los procedimientos aplicados específicos en el plan de tratamiento actual
CREATE TABLE IF NOT EXISTS detalles_treatment (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tratamiento_paciente_id UUID NOT NULL REFERENCES tratamientos_paciente(id) ON DELETE CASCADE,
    procedimiento_id UUID NOT NULL REFERENCES procedimientos_catalogo(id) ON DELETE RESTRICT,
    diente_numero INTEGER NULL CHECK ((diente_numero >= 11 AND diente_numero <= 48) OR (diente_numero >= 51 AND diente_numero <= 85)),
    piezas VARCHAR(100) DEFAULT '',
    cantidad INTEGER DEFAULT 1,
    notas TEXT,                     -- Indicaciones específicas para este procedimiento
    costo_final NUMERIC(10, 2) NOT NULL CHECK (costo_final >= 0)
);

-- Indexar los detalles del tratamiento
CREATE INDEX IF NOT EXISTS idx_detalles_tratamiento_cabecera ON detalles_treatment(tratamiento_paciente_id);


-- =========================================================================
-- SEED DE PROCEDIMIENTOS CLÍNICOS COMUNES (CATÁLOGO INICIAL)
-- =========================================================================
INSERT INTO procedimientos_catalogo (nombre_procedimiento, costo_base) VALUES
('Examen Clínico + Diagnóstico', 30.00),
('Profilaxis Dental (Limpieza)', 100.00),
('Restauración de Resina Simple (Curación)', 120.00),
('Restauración de Resina Compleja', 180.00),
('Endodoncia Unirradicular', 350.00),
('Endodoncia Multirradicular', 550.00),
('Extracción Dental Simple', 150.00),
('Extracción de Tercera Molar (Cirugía)', 450.00),
('Gingivectomía + Osteotomía (Por Mapeo)', 250.00),
('Corona de Metal Porcelana', 600.00),
('Corona de Zirconio', 1200.00),
('Blanqueamiento LED', 400.00),
('Ortodoncia (Instalación Brackets)', 1500.00)
ON CONFLICT (nombre_procedimiento) DO UPDATE 
SET costo_base = EXCLUDED.costo_base;
