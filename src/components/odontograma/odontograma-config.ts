export interface DiagnosticoConfig {
  id: string;
  label: string;
  symbol: string;
  color: string;
  hasCondition?: boolean; // Buen estado / Mal estado
  hasDirection?: boolean; // Giroversión Izquierda / Derecha
  marcado?: 'line-red' | 'arrow' | 'initials' | 'parentheses' | 'caries' | 'cross-blue' | 'initials-conditional' | 'movilidad';
}

export interface ProcedimientoConfig {
  nombre: string;
  requierePieza: boolean;
  requiereCantidad: boolean;
  initials?: string;
  marcado?: 'sides' | 'fill-red' | 'cross' | 'endodoncia' | 'corona' | 'sellante' | 'initials' | 'amalgama' | 'resina';
}

export const DIAGNOSTICOS_CONFIG: DiagnosticoConfig[] = [
  { id: 'caries', label: 'Caries (por caras)', symbol: 'C', color: '#ef4444', marcado: 'caries' },
  { id: 'fractura', label: 'Fractura de pieza', symbol: 'FR', color: '#ef4444', marcado: 'line-red' },
  { id: 'giroversion', label: 'Giroversión', symbol: 'GV', color: '#0ea5e9', hasDirection: true, marcado: 'arrow' },
  { id: 'remanente', label: 'Remanente radicular', symbol: 'RR', color: '#dc2626', marcado: 'initials' },
  { id: 'diastema', label: 'Diastema (piezas separadas)', symbol: ')(', color: '#2563eb', marcado: 'parentheses' },
  { id: 'edentulo', label: 'Edéntulo (diente faltante)', symbol: 'ED', color: '#3b82f6', marcado: 'cross-blue' },
  { id: 'macrodoncia', label: 'Macrodoncia', symbol: 'MAC', color: '#2563eb', marcado: 'initials' },
  { id: 'microdoncia', label: 'Microdoncia', symbol: 'MIC', color: '#2563eb', marcado: 'initials' },
  { id: 'incrustacion', label: 'Incrustación', symbol: 'IM', color: '#2563eb', hasCondition: true, marcado: 'initials-conditional' },
  { id: 'incrustacion_estetica', label: 'Incrustación estética', symbol: 'IE', color: '#2563eb', hasCondition: true, marcado: 'initials-conditional' },
  { id: 'movilidad', label: 'Movilidad (M1)', symbol: 'M1', color: '#ea580c', marcado: 'movilidad' },
];

export const PROCEDIMIENTOS_CONFIG: Record<string, ProcedimientoConfig> = {
  'Rx': { nombre: 'Rx', requierePieza: true, requiereCantidad: true },
  'Blanqueamiento ambulatorio': { nombre: 'Blanqueamiento ambulatorio', requierePieza: false, requiereCantidad: false },
  'Blanqueamiento con luz alogena': { nombre: 'Blanqueamiento con luz alogena', requierePieza: false, requiereCantidad: false },
  'Curación simple': { nombre: 'Curación simple', requierePieza: true, requiereCantidad: true, initials: 'PT', marcado: 'sides' },
  'Curación compuesta': { nombre: 'Curación compuesta', requierePieza: true, requiereCantidad: true, initials: 'CC', marcado: 'fill-red' },
  'Reconstrucción coronaria': { nombre: 'Reconstrucción coronaria', requierePieza: true, requiereCantidad: true, initials: 'RC', marcado: 'initials' },
  'Extracción simple': { nombre: 'Extracción simple', requierePieza: true, requiereCantidad: true, marcado: 'cross' },
  'Extracción compleja': { nombre: 'Extracción compleja', requierePieza: true, requiereCantidad: true, initials: 'EC', marcado: 'cross' },
  'Cirugía 3ra molar': { nombre: 'Cirugía 3ra molar', requierePieza: true, requiereCantidad: true, initials: '3M', marcado: 'cross' },
  'Endodoncia anterior': { nombre: 'Endodoncia anterior', requierePieza: true, requiereCantidad: true, initials: 'EA', marcado: 'endodoncia' },
  'Endodoncia posterior': { nombre: 'Endodoncia posterior', requierePieza: true, requiereCantidad: true, initials: 'EP', marcado: 'endodoncia' },
  'Corona de porcelana': { nombre: 'Corona de porcelana', requierePieza: true, requiereCantidad: true, initials: 'CP', marcado: 'corona' },
  'Corona de circonio': { nombre: 'Corona de circonio', requierePieza: true, requiereCantidad: true, initials: 'CC', marcado: 'corona' },
  'Corona tipo cerámica': { nombre: 'Corona tipo cerámica', requierePieza: true, requiereCantidad: true, initials: 'CC', marcado: 'corona' },
  'Corona venner ceramico': { nombre: 'Corona venner ceramico', requierePieza: true, requiereCantidad: true, initials: 'CVC', marcado: 'corona' },
  'Corona veneer ivocrom': { nombre: 'Corona veneer ivocrom', requierePieza: true, requiereCantidad: true, initials: 'CVI', marcado: 'corona' },
  'Corona Jacket': { nombre: 'Corona Jacket', requierePieza: true, requiereCantidad: true, marcado: 'corona' },
  'PPR acrilico (wipla)': { nombre: 'PPR acrilico (wipla)', requierePieza: false, requiereCantidad: true },
  'PPR Metalico': { nombre: 'PPR Metalico', requierePieza: false, requiereCantidad: true },
  'Prótesis total': { nombre: 'Prótesis total', requierePieza: false, requiereCantidad: true },
  'Prótesis flexible': { nombre: 'Prótesis flexible', requierePieza: false, requiereCantidad: true },
  'Perno muñón': { nombre: 'Perno muñón', requierePieza: true, requiereCantidad: true, initials: 'Pm', marcado: 'initials' },
  'Perno fibra de vidrio': { nombre: 'Perno fibra de vidrio', requierePieza: true, requiereCantidad: true, initials: 'Pv', marcado: 'initials' },
  'Perno de circonio': { nombre: 'Perno de circonio', requierePieza: true, requiereCantidad: true, initials: 'Pc', marcado: 'initials' },
  'Profilaxis': { nombre: 'Profilaxis', requierePieza: false, requiereCantidad: false },
  'Destartraje': { nombre: 'Destartraje', requierePieza: false, requiereCantidad: false },
  'Reparación de prótesis': { nombre: 'Reparación de prótesis', requierePieza: false, requiereCantidad: false },
  'Pulpotomia': { nombre: 'Pulpotomia', requierePieza: true, requiereCantidad: true, initials: 'PT', marcado: 'initials' },
  'Pulpectomia': { nombre: 'Pulpectomia', requierePieza: true, requiereCantidad: true, initials: 'PC', marcado: 'initials' },
  'Sellante': { nombre: 'Sellante', requierePieza: true, requiereCantidad: true, marcado: 'sellante' },
  'Fluorización': { nombre: 'Fluorización', requierePieza: false, requiereCantidad: false },
  'Cemento provisional': { nombre: 'Cemento provisional', requierePieza: true, requiereCantidad: true, initials: 'CP', marcado: 'initials' },
  'Cemento fijo': { nombre: 'Cemento fijo', requierePieza: true, requiereCantidad: true, initials: 'CF', marcado: 'initials' },
  'Carillas de circonio': { nombre: 'Carillas de circonio', requierePieza: true, requiereCantidad: true, initials: 'CC', marcado: 'initials' },
  'Carillas con resina': { nombre: 'Carillas con resina', requierePieza: true, requiereCantidad: true, initials: 'CR', marcado: 'initials' },
  'Carillas de silicato de litio': { nombre: 'Carillas de silicato de litio', requierePieza: true, requiereCantidad: true, initials: 'CS', marcado: 'initials' },
  'Implante': { nombre: 'Implante', requierePieza: true, requiereCantidad: true, initials: 'IMP', marcado: 'initials' },
  'Amalgama': { nombre: 'Amalgama', requierePieza: true, requiereCantidad: true, initials: 'AM', marcado: 'amalgama' },
  'Resina': { nombre: 'Resina', requierePieza: true, requiereCantidad: true, initials: 'R', marcado: 'resina' },
};
