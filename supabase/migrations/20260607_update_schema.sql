-- =========================================================================
-- MIGRACIÓN DE ACTUALIZACIÓN: ODONTOGRAMA Y PRESUPUESTOS EXTENDIDOS
-- =========================================================================

-- Agregar columnas a la tabla de pacientes
ALTER TABLE pacientes ADD COLUMN IF NOT EXISTS odontograma_inicial JSONB DEFAULT '{}'::jsonb;

-- Agregar estado de presupuesto/tratamiento a tratamientos_paciente
ALTER TABLE tratamientos_paciente ADD COLUMN IF NOT EXISTS estado VARCHAR(50) DEFAULT 'presupuesto_pendiente';
ALTER TABLE tratamientos_paciente ADD COLUMN IF NOT EXISTS sesiones JSONB DEFAULT '[]'::jsonb;

-- Actualizar detalles del tratamiento para permitir cantidad y listado de piezas (ej. "14, 15")
ALTER TABLE detalles_treatment ADD COLUMN IF NOT EXISTS cantidad INTEGER DEFAULT 1;
ALTER TABLE detalles_treatment ADD COLUMN IF NOT EXISTS piezas TEXT;
ALTER TABLE detalles_treatment ALTER COLUMN diente_numero DROP NOT NULL;

-- Truncar y repoblar el catálogo de procedimientos con los requeridos
TRUNCATE TABLE procedimientos_catalogo CASCADE;

INSERT INTO procedimientos_catalogo (nombre_procedimiento, costo_base) VALUES
('Rx', 50.00),
('Blanqueamiento ambulatorio', 300.00),
('Blanqueamiento con luz alogena', 450.00),
('Curación simple', 120.00),
('Curación compuesta', 180.00),
('Reconstrucción coronaria', 220.00),
('Extracción simple', 150.00),
('Extracción compleja', 250.00),
('Cirugía 3ra molar', 450.00),
('Endodoncia anterior', 350.00),
('Endodoncia posterior', 550.00),
('Corona de porcelana', 600.00),
('Corona de circonio', 1200.00),
('Corona tipo cerámica', 900.00),
('Corona venner ceramico', 1000.00),
('Corona veneer ivocrom', 800.00),
('Corona Jacket', 500.00),
('PPR acrilico (wipla)', 700.00),
('PPR Metalico', 950.00),
('Prótesis total', 1200.00),
('Prótesis flexible', 1100.00),
('Perno muñón', 250.00),
('Perno fibra de vidrio', 300.00),
('Perno de circonio', 450.00),
('Profilaxis', 100.00),
('Destartraje', 150.00),
('Reparación de prótesis', 120.00),
('Pulpotomia', 180.00),
('Pulpectomia', 220.00),
('Sellante', 80.00),
('Fluorización', 85.00),
('Cemento provisional', 50.00),
('Cemento fijo', 100.00),
('Carillas de circonio', 1200.00),
('Carillas con resina', 400.00),
('Carillas de silicato de litio', 1500.00),
('Implante', 2500.00),
('Amalgama', 120.00),
('Resina', 150.00)
ON CONFLICT (nombre_procedimiento) DO UPDATE 
SET costo_base = EXCLUDED.costo_base;
