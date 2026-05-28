"use client";

import React, { useState } from "react";
import { 
  Activity, 
  Trash2, 
  Sparkles, 
  Check, 
  Smile, 
  ShieldAlert, 
  Layers, 
  Info, 
  Printer, 
  RotateCcw,
  Plus
} from "lucide-react";

// =========================================================================
// TIPOS Y ENUMS
// =========================================================================
export type FaceState = "limpio" | "caries" | "curado";

export interface ToothState {
  numero: number;
  ausente: boolean;
  corona: boolean;
  endodoncia: boolean;
  caras: {
    V: FaceState; // Vestibular (Arriba)
    O: FaceState; // Oclusal/Incisal (Centro)
    M: FaceState; // Mesial (Hacia el centro)
    D: FaceState; // Distal (Hacia afuera)
    L: FaceState; // Lingual/Palatino (Abajo)
  };
}

export type OdontogramaState = Record<number, ToothState>;

interface OdontogramaProps {
  initialState?: OdontogramaState;
  onChange?: (state: OdontogramaState) => void;
  readOnly?: boolean;
}

// Inicialización de un diente vacío
const crearDienteVacio = (numero: number): ToothState => ({
  numero,
  ausente: false,
  corona: false,
  endodoncia: false,
  caras: {
    V: "limpio",
    O: "limpio",
    M: "limpio",
    D: "limpio",
    L: "limpio",
  },
});

// Grupos de dientes según anatomía clínica
const DIENTES_ADULTO_SUP_IZQ = [18, 17, 16, 15, 14, 13, 12, 11];
const DIENTES_ADULTO_SUP_DER = [21, 22, 23, 24, 25, 26, 27, 28];
const DIENTES_ADULTO_INF_IZQ = [48, 47, 46, 45, 44, 43, 42, 41];
const DIENTES_ADULTO_INF_DER = [31, 32, 33, 34, 35, 36, 37, 38];

const DIENTES_NINO_SUP_IZQ = [55, 54, 53, 52, 51];
const DIENTES_NINO_SUP_DER = [61, 62, 63, 64, 65];
const DIENTES_NINO_INF_IZQ = [85, 84, 83, 82, 81];
const DIENTES_NINO_INF_DER = [71, 72, 73, 74, 75];

// =========================================================================
// COMPONENTE: DIENTE SVG (Renderizador de un diente individual)
// =========================================================================
interface DienteSVGProps {
  diente: ToothState;
  isSelected: boolean;
  onSelect: () => void;
  onFaceClick?: (face: keyof ToothState["caras"]) => void;
  readOnly?: boolean;
}

const DienteSVG: React.FC<DienteSVGProps> = ({
  diente,
  isSelected,
  onSelect,
  onFaceClick,
  readOnly = false,
}) => {
  const getFaceColor = (estado: FaceState) => {
    switch (estado) {
      case "caries":
        return "fill-red-500 hover:fill-red-600 stroke-red-700";
      case "curado":
        return "fill-blue-500 hover:fill-blue-600 stroke-blue-700";
      default:
        return "fill-white dark:fill-slate-900 hover:fill-slate-100 dark:hover:fill-slate-800 stroke-slate-200 dark:stroke-slate-800";
    }
  };

  const handleFaceClick = (e: React.MouseEvent, face: keyof ToothState["caras"]) => {
    e.stopPropagation();
    if (readOnly) return;
    if (diente.ausente) return; // Si no está el diente, no se marcan las caras
    if (onFaceClick) onFaceClick(face);
  };

  // Posiciones de los polígonos del diente (Cuadrado de 60x60)
  // V (Vestibular) - Trapecio Superior
  // D (Distal) - Trapecio Derecho
  // L (Lingual/Palatino) - Trapecio Inferior
  // M (Mesial) - Trapecio Izquierdo
  // O (Oclusal) - Cuadrado Central
  return (
    <div 
      onClick={onSelect}
      className={`relative flex flex-col items-center p-2 rounded-xl border transition-all duration-200 cursor-pointer ${
        isSelected 
          ? "bg-teal-50 dark:bg-emerald-950/40 border-teal-500 ring-2 ring-teal-500/20 shadow-md scale-105" 
          : "bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-850 hover:border-teal-500/30 dark:hover:border-emerald-500/30 hover:shadow-sm"
      } ${diente.ausente ? "opacity-60" : ""}`}
    >
      {/* Número del Diente */}
      <span className="text-xs font-bold text-slate-500 dark:text-slate-400 mb-1">
        {diente.numero}
      </span>

      {/* SVG del Diente */}
      <div className="relative w-12 h-12">
        <svg viewBox="0 0 60 60" className="w-full h-full select-none">
          {/* Si el diente es ausente, dibujamos una gran Cruz Roja (X) detrás/delante */}
          {!diente.ausente ? (
            <>
              {/* Cara Vestibular (V) - Superior */}
              <polygon
                points="5,5 55,5 40,20 20,20"
                className={`transition-all duration-150 cursor-pointer stroke-[1.5] ${getFaceColor(diente.caras.V)}`}
                onClick={(e) => handleFaceClick(e, "V")}
              />

              {/* Cara Distal (D) - Derecha */}
              <polygon
                points="55,5 55,55 40,40 40,20"
                className={`transition-all duration-150 cursor-pointer stroke-[1.5] ${getFaceColor(diente.caras.D)}`}
                onClick={(e) => handleFaceClick(e, "D")}
              />

              {/* Cara Lingual (L) - Inferior */}
              <polygon
                points="20,40 40,40 55,55 5,55"
                className={`transition-all duration-150 cursor-pointer stroke-[1.5] ${getFaceColor(diente.caras.L)}`}
                onClick={(e) => handleFaceClick(e, "L")}
              />

              {/* Cara Mesial (M) - Izquierda */}
              <polygon
                points="5,5 20,20 20,40 5,55"
                className={`transition-all duration-150 cursor-pointer stroke-[1.5] ${getFaceColor(diente.caras.M)}`}
                onClick={(e) => handleFaceClick(e, "M")}
              />

              {/* Cara Oclusal (O) - Centro */}
              <rect
                x="20"
                y="20"
                width="20"
                height="20"
                className={`transition-all duration-150 cursor-pointer stroke-[1.5] ${getFaceColor(diente.caras.O)}`}
                onClick={(e) => handleFaceClick(e, "O")}
              />
            </>
          ) : (
            // Diente Ausente / Extraído
            <>
              <rect x="0" y="0" width="60" height="60" fill="transparent" />
              <line x1="5" y1="5" x2="55" y2="55" stroke="#ef4444" strokeWidth="4" strokeLinecap="round" />
              <line x1="55" y1="5" x2="5" y2="55" stroke="#ef4444" strokeWidth="4" strokeLinecap="round" />
            </>
          )}

          {/* Indicador visual de Corona */}
          {diente.corona && (
            <circle
              cx="30"
              cy="30"
              r="26"
              fill="transparent"
              stroke="#f59e0b"
              strokeWidth="3"
              strokeDasharray="4,4"
              className="animate-[spin_40s_linear_infinite]"
            />
          )}

          {/* Indicador visual de Endodoncia */}
          {diente.endodoncia && !diente.ausente && (
            <line
              x1="30"
              y1="5"
              x2="30"
              y2="55"
              stroke="#8b5cf6"
              strokeWidth="3"
              strokeLinecap="round"
              strokeDasharray="2,2"
            />
          )}
        </svg>
      </div>

      {/* Etiquetas / Diagnóstico rápido */}
      <div className="flex gap-0.5 mt-1 h-3">
        {diente.ausente && <span className="text-[9px] font-extrabold text-red-500 uppercase">AUS</span>}
        {diente.corona && <span className="text-[9px] font-extrabold text-amber-500 uppercase">CRN</span>}
        {diente.endodoncia && <span className="text-[9px] font-extrabold text-purple-500 uppercase">END</span>}
      </div>
    </div>
  );
};

// =========================================================================
// COMPONENTE PRINCIPAL: ODONTOGRAMA INTERACTIVO
// =========================================================================
export const Odontograma: React.FC<OdontogramaProps> = ({
  initialState = {},
  onChange,
  readOnly = false,
}) => {
  const [dientes, setDientes] = useState<OdontogramaState>(() => {
    // Rellenamos el estado con todos los dientes posibles si no vienen definidos
    const todosLosNumeros = [
      ...DIENTES_ADULTO_SUP_IZQ, ...DIENTES_ADULTO_SUP_DER,
      ...DIENTES_ADULTO_INF_IZQ, ...DIENTES_ADULTO_INF_DER,
      ...DIENTES_NINO_SUP_IZQ, ...DIENTES_NINO_SUP_DER,
      ...DIENTES_NINO_INF_IZQ, ...DIENTES_NINO_INF_DER
    ];
    
    const state: OdontogramaState = { ...initialState };
    todosLosNumeros.forEach((num) => {
      if (!state[num]) {
        state[num] = crearDienteVacio(num);
      }
    });
    return state;
  });

  const [selectedDienteNum, setSelectedDienteNum] = useState<number | null>(null);
  const [vista, setVista] = useState<"todos" | "adulto" | "infantil">("todos");

  // Sincronizar reactivamente cuando el estado inicial cambia (por ejemplo, al cambiar de paciente)
  React.useEffect(() => {
    const todosLosNumeros = [
      ...DIENTES_ADULTO_SUP_IZQ, ...DIENTES_ADULTO_SUP_DER,
      ...DIENTES_ADULTO_INF_IZQ, ...DIENTES_ADULTO_INF_DER,
      ...DIENTES_NINO_SUP_IZQ, ...DIENTES_NINO_SUP_DER,
      ...DIENTES_NINO_INF_IZQ, ...DIENTES_NINO_INF_DER
    ];
    
    const state: OdontogramaState = { ...initialState };
    todosLosNumeros.forEach((num) => {
      if (!state[num]) {
        state[num] = crearDienteVacio(num);
      }
    });
    setDientes(state);
    setSelectedDienteNum(null);
  }, [JSON.stringify(initialState)]);

  // Notificar cambios al padre
  const notificarCambio = (nuevoEstado: OdontogramaState) => {
    setDientes(nuevoEstado);
    if (onChange) {
      onChange(nuevoEstado);
    }
  };

  // Manejar click en una cara directamente en el diagrama
  const handleFaceClick = (numero: number, face: keyof ToothState["caras"]) => {
    if (readOnly) return;
    const diente = dientes[numero];
    const siguienteEstado: Record<FaceState, FaceState> = {
      limpio: "caries",
      caries: "curado",
      curado: "limpio",
    };

    const nuevoDiente = {
      ...diente,
      caras: {
        ...diente.caras,
        [face]: siguienteEstado[diente.caras[face]],
      },
    };

    const nuevoEstado = {
      ...dientes,
      [numero]: nuevoDiente,
    };
    notificarCambio(nuevoEstado);
  };

  // Modificadores globales para el diente seleccionado
  const toggleDienteAusente = () => {
    if (selectedDienteNum === null) return;
    const num = selectedDienteNum;
    const nuevoDiente = {
      ...dientes[num],
      ausente: !dientes[num].ausente,
      // Al estar ausente, limpiamos caras y otros tratamientos por coherencia
      caras: crearDienteVacio(num).caras,
      corona: false,
      endodoncia: false,
    };
    notificarCambio({ ...dientes, [num]: nuevoDiente });
  };

  const toggleDienteCorona = () => {
    if (selectedDienteNum === null) return;
    const num = selectedDienteNum;
    const nuevoDiente = {
      ...dientes[num],
      corona: !dientes[num].corona,
      ausente: false, // Una corona requiere que el diente esté presente
    };
    notificarCambio({ ...dientes, [num]: nuevoDiente });
  };

  const toggleDienteEndodoncia = () => {
    if (selectedDienteNum === null) return;
    const num = selectedDienteNum;
    const nuevoDiente = {
      ...dientes[num],
      endodoncia: !dientes[num].endodoncia,
      ausente: false,
    };
    notificarCambio({ ...dientes, [num]: nuevoDiente });
  };

  const cambiarEstadoCaraSeleccionada = (face: keyof ToothState["caras"], estado: FaceState) => {
    if (selectedDienteNum === null) return;
    const num = selectedDienteNum;
    const nuevoDiente = {
      ...dientes[num],
      caras: {
        ...dientes[num].caras,
        [face]: estado,
      },
      ausente: false, // Al tratar caras, el diente no puede estar ausente
    };
    notificarCambio({ ...dientes, [num]: nuevoDiente });
  };

  const resetearDiente = () => {
    if (selectedDienteNum === null) return;
    const num = selectedDienteNum;
    notificarCambio({ ...dientes, [num]: crearDienteVacio(num) });
  };

  const limpiarTodoElOdontograma = () => {
    if (window.confirm("¿Seguro que deseas limpiar todo el odontograma? Se perderán todos los datos marcados.")) {
      const nuevoEstado: OdontogramaState = {};
      Object.keys(dientes).forEach((k) => {
        const num = parseInt(k);
        nuevoEstado[num] = crearDienteVacio(num);
      });
      notificarCambio(nuevoEstado);
      setSelectedDienteNum(null);
    }
  };

  // Renderizador de una fila de dientes
  const renderFilaDientes = (numeros: number[]) => {
    return (
      <div className="flex flex-wrap gap-2 justify-center items-center">
        {numeros.map((num) => (
          <DienteSVG
            key={num}
            diente={dientes[num]}
            isSelected={selectedDienteNum === num}
            onSelect={() => setSelectedDienteNum(num)}
            onFaceClick={(face) => handleFaceClick(num, face)}
            readOnly={readOnly}
          />
        ))}
      </div>
    );
  };

  const dienteSeleccionado = selectedDienteNum !== null ? dientes[selectedDienteNum] : null;

  return (
    <div className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-3xl p-6 shadow-xl space-y-8 select-none">
      
      {/* Cabecera y Controles */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-100 dark:border-slate-800 pb-6">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-850 dark:text-slate-100 flex items-center gap-2">
            <Activity className="h-6 w-6 text-teal-600 dark:text-emerald-455" />
            Odontograma Clínico Interactivo
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Haz clic en una cara para alternar Caries/Curado, o selecciona el diente para opciones avanzadas.
          </p>
        </div>

        {/* Botones de acción */}
        <div className="flex flex-wrap gap-2 w-full sm:w-auto">
          {/* Selector de Dentición */}
          <div className="bg-slate-100 dark:bg-slate-800 p-1 rounded-full flex gap-1 text-xs font-semibold">
            <button
              onClick={() => setVista("todos")}
              className={`px-3 py-1.5 rounded-full transition-all ${
                vista === "todos" 
                  ? "bg-white dark:bg-slate-900 text-teal-600 dark:text-emerald-400 shadow-sm font-bold" 
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-800"
              }`}
            >
              Completo
            </button>
            <button
              onClick={() => setVista("adulto")}
              className={`px-3 py-1.5 rounded-full transition-all ${
                vista === "adulto" 
                  ? "bg-white dark:bg-slate-900 text-teal-600 dark:text-emerald-400 shadow-sm font-bold" 
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-800"
              }`}
            >
              Adultos
            </button>
            <button
              onClick={() => setVista("infantil")}
              className={`px-3 py-1.5 rounded-full transition-all ${
                vista === "infantil" 
                  ? "bg-white dark:bg-slate-900 text-teal-600 dark:text-emerald-400 shadow-sm font-bold" 
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-800"
              }`}
            >
              Infantil
            </button>
          </div>

          {!readOnly && (
            <button
              onClick={limpiarTodoElOdontograma}
              className="p-2 rounded-full border border-slate-200 dark:border-slate-700 hover:bg-red-50 dark:hover:bg-red-950/30 text-slate-500 hover:text-red-500 transition-colors tooltip"
              title="Limpiar todo el odontograma"
            >
              <RotateCcw className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {/* Leyenda de Estados */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 p-4 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-100 dark:border-slate-800/60 text-xs">
        <div className="flex items-center gap-2 font-medium text-slate-600 dark:text-slate-300">
          <span className="w-5 h-5 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950"></span>
          Limpio / Sano
        </div>
        <div className="flex items-center gap-2 font-medium text-slate-600 dark:text-slate-300">
          <span className="w-5 h-5 rounded border border-red-700 bg-red-500"></span>
          Caries (Rojo)
        </div>
        <div className="flex items-center gap-2 font-medium text-slate-600 dark:text-slate-300">
          <span className="w-5 h-5 rounded border border-blue-700 bg-blue-500"></span>
          Curado (Azul)
        </div>
        <div className="flex items-center gap-2 font-medium text-slate-600 dark:text-slate-300">
          <span className="relative w-5 h-5 rounded border border-red-200 dark:border-red-900 bg-red-100 dark:bg-red-950/20 flex items-center justify-center font-bold text-red-500 text-[10px]">
            X
          </span>
          Ausente / Extraído
        </div>
        <div className="flex items-center gap-2 font-medium text-slate-600 dark:text-slate-300">
          <span className="w-5 h-5 rounded border-2 border-dashed border-amber-500 bg-transparent flex items-center justify-center text-amber-500 text-[8px] font-bold">
            CRN
          </span>
          Corona / Endodoncia
        </div>
      </div>

      {/* RENDER DEL ODONTOGRAMA */}
      <div className="space-y-12">
        {/* ========================================== */}
        {/* DENTICIÓN ADULTO */}
        {/* ========================================== */}
        {(vista === "todos" || vista === "adulto") && (
          <div className="space-y-6">
            <h3 className="text-sm font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest text-center">
              Dentición Adulto
            </h3>
            
            {/* ARCADA SUPERIOR ADULTO */}
            <div className="space-y-2">
              <div className="text-center text-xs font-semibold text-slate-400">Arcada Superior</div>
              <div className="flex flex-col md:flex-row justify-center items-center gap-4">
                {/* Cuadrante 1 (Superior Izquierdo de la pantalla - Superior Derecho Clínico) */}
                <div className="flex gap-1.5 bg-slate-50 dark:bg-slate-800/20 p-3 rounded-2xl border border-slate-100 dark:border-slate-800/40 shadow-inner">
                  {renderFilaDientes(DIENTES_ADULTO_SUP_IZQ)}
                </div>
                {/* Línea Divisoria de la Línea Media */}
                <div className="hidden md:block w-[2px] h-16 bg-teal-500/30"></div>
                {/* Cuadrante 2 (Superior Derecho de la pantalla - Superior Izquierdo Clínico) */}
                <div className="flex gap-1.5 bg-slate-50 dark:bg-slate-800/20 p-3 rounded-2xl border border-slate-100 dark:border-slate-800/40 shadow-inner">
                  {renderFilaDientes(DIENTES_ADULTO_SUP_DER)}
                </div>
              </div>
            </div>

            {/* ARCADA INFERIOR ADULTO */}
            <div className="space-y-2 pt-4">
              <div className="flex flex-col md:flex-row justify-center items-center gap-4">
                {/* Cuadrante 4 (Inferior Izquierdo de la pantalla - Inferior Derecho Clínico) */}
                <div className="flex gap-1.5 bg-slate-50 dark:bg-slate-800/20 p-3 rounded-2xl border border-slate-100 dark:border-slate-800/40 shadow-inner">
                  {renderFilaDientes(DIENTES_ADULTO_INF_IZQ)}
                </div>
                {/* Línea Divisoria de la Línea Media */}
                <div className="hidden md:block w-[2px] h-16 bg-teal-500/30"></div>
                {/* Cuadrante 3 (Inferior Derecho de la pantalla - Inferior Izquierdo Clínico) */}
                <div className="flex gap-1.5 bg-slate-50 dark:bg-slate-800/20 p-3 rounded-2xl border border-slate-100 dark:border-slate-800/40 shadow-inner">
                  {renderFilaDientes(DIENTES_ADULTO_INF_DER)}
                </div>
              </div>
              <div className="text-center text-xs font-semibold text-slate-400">Arcada Inferior</div>
            </div>
          </div>
        )}

        {/* ========================================== */}
        {/* DENTICIÓN INFANTIL */}
        {/* ========================================== */}
        {(vista === "todos" || vista === "infantil") && (
          <div className="space-y-6 pt-4 border-t border-slate-100 dark:border-slate-800/80">
            <h3 className="text-sm font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest text-center">
              Dentición Infantil / Temporal
            </h3>
            
            {/* ARCADA SUPERIOR INFANTIL */}
            <div className="space-y-2">
              <div className="text-center text-xs font-semibold text-slate-400">Arcada Superior Infantil</div>
              <div className="flex flex-col md:flex-row justify-center items-center gap-4">
                <div className="flex gap-1.5 bg-slate-50 dark:bg-slate-800/20 p-3 rounded-2xl border border-slate-100 dark:border-slate-800/40 shadow-inner">
                  {renderFilaDientes(DIENTES_NINO_SUP_IZQ)}
                </div>
                <div className="hidden md:block w-[2px] h-16 bg-teal-500/30"></div>
                <div className="flex gap-1.5 bg-slate-50 dark:bg-slate-800/20 p-3 rounded-2xl border border-slate-100 dark:border-slate-800/40 shadow-inner">
                  {renderFilaDientes(DIENTES_NINO_SUP_DER)}
                </div>
              </div>
            </div>

            {/* ARCADA INFERIOR INFANTIL */}
            <div className="space-y-2 pt-4">
              <div className="flex flex-col md:flex-row justify-center items-center gap-4">
                <div className="flex gap-1.5 bg-slate-50 dark:bg-slate-800/20 p-3 rounded-2xl border border-slate-100 dark:border-slate-800/40 shadow-inner">
                  {renderFilaDientes(DIENTES_NINO_INF_IZQ)}
                </div>
                <div className="hidden md:block w-[2px] h-16 bg-teal-500/30"></div>
                <div className="flex gap-1.5 bg-slate-50 dark:bg-slate-800/20 p-3 rounded-2xl border border-slate-100 dark:border-slate-800/40 shadow-inner">
                  {renderFilaDientes(DIENTES_NINO_INF_DER)}
                </div>
              </div>
              <div className="text-center text-xs font-semibold text-slate-400">Arcada Inferior Infantil</div>
            </div>
          </div>
        )}
      </div>

      {/* PANEL FLOTANTE / MODAL DE DETALLE DIENTE SELECCIONADO */}
      {dienteSeleccionado && !readOnly && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-[fadeIn_0.2s_ease-out]">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-md shadow-2xl overflow-hidden animate-[scaleUp_0.2s_ease-out]">
            
            {/* Header del Modal */}
            <div className="bg-gradient-to-r from-teal-700 to-emerald-800 px-6 py-4 text-white flex justify-between items-center">
              <div>
                <h3 className="text-lg font-bold">Configuración Dental</h3>
                <p className="text-xs text-teal-100">Diente número: {dienteSeleccionado.numero}</p>
              </div>
              <button 
                onClick={() => setSelectedDienteNum(null)}
                className="bg-white/10 hover:bg-white/20 text-white rounded-full p-1.5 transition-colors"
              >
                ✕
              </button>
            </div>

            {/* Contenido del Modal */}
            <div className="p-6 space-y-6">
              {/* Representación visual gigante interactiva en el modal */}
              <div className="flex flex-col items-center justify-center py-4 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-100 dark:border-slate-800/40">
                <DienteSVG
                  diente={dienteSeleccionado}
                  isSelected={false}
                  onSelect={() => {}}
                  onFaceClick={(face) => handleFaceClick(dienteSeleccionado.numero, face)}
                  readOnly={false}
                />
                <span className="text-xs text-slate-400 mt-2">
                  Haz click en las caras del diente de arriba para cambiar sus estados directamente.
                </span>
              </div>

              {/* Controles de Estado Completo */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                  Tratamientos de Pieza Completa
                </h4>
                
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={toggleDienteAusente}
                    className={`flex items-center justify-center gap-2 p-3 rounded-xl border font-semibold text-sm transition-all cursor-pointer ${
                      dienteSeleccionado.ausente
                        ? "bg-red-500 border-red-600 text-white shadow-md shadow-red-500/20"
                        : "bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"
                    }`}
                  >
                    Ausente / Extraído
                  </button>

                  <button
                    type="button"
                    onClick={toggleDienteCorona}
                    className={`flex items-center justify-center gap-2 p-3 rounded-xl border font-black text-sm transition-all cursor-pointer ${
                      dienteSeleccionado.corona
                        ? "bg-yellow-400 border-yellow-500 text-teal-950 shadow-md shadow-yellow-400/25"
                        : "bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"
                    }`}
                  >
                    Corona Dental
                  </button>

                  <button
                    type="button"
                    onClick={toggleDienteEndodoncia}
                    className={`flex items-center justify-center gap-2 p-3 rounded-xl border font-semibold text-sm transition-all cursor-pointer ${
                      dienteSeleccionado.endodoncia
                        ? "bg-purple-600 border-purple-700 text-white shadow-md shadow-purple-600/20"
                        : "bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"
                    }`}
                  >
                    Endodoncia
                  </button>

                  <button
                    type="button"
                    onClick={resetearDiente}
                    className="flex items-center justify-center gap-2 p-3 rounded-xl border border-red-200 dark:border-red-900/30 bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-450 hover:bg-red-100 dark:hover:bg-red-900/30 font-semibold text-sm transition-all cursor-pointer"
                  >
                    <Trash2 className="h-4 w-4" />
                    Limpiar Pieza
                  </button>
                </div>
              </div>

              {/* Selector de Caras Individuales (Opcional por lista si es más cómodo) */}
              {!dienteSeleccionado.ausente && (
                <div className="space-y-3 pt-2 border-t border-slate-100 dark:border-slate-800">
                  <h4 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                    Detalle por Caras del Diente
                  </h4>
                  
                  <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                    {[
                      { code: "V", label: "Vestibular / Bucal (Exterior)" },
                      { code: "O", label: "Oclusal / Incisal (Centro)" },
                      { code: "M", label: "Mesial (Interno / Línea Media)" },
                      { code: "D", label: "Distal (Externo / Posterior)" },
                      { code: "L", label: "Lingual / Palatino (Interior)" }
                    ].map(({ code, label }) => {
                      const caraCode = code as keyof ToothState["caras"];
                      const caraState = dienteSeleccionado.caras[caraCode];
                      
                      return (
                        <div key={code} className="flex justify-between items-center bg-slate-50 dark:bg-slate-850 p-2 rounded-xl border border-slate-100 dark:border-slate-800/80">
                          <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                            {code} - <span className="font-normal text-slate-500">{label}</span>
                          </span>
                          
                          <div className="flex gap-1">
                            {["limpio", "caries", "curado"].map((est) => (
                              <button
                                key={est}
                                onClick={() => cambiarEstadoCaraSeleccionada(caraCode, est as FaceState)}
                                className={`px-2 py-1 text-[10px] font-extrabold uppercase rounded border transition-all ${
                                  caraState === est
                                    ? est === "caries"
                                      ? "bg-red-500 border-red-600 text-white"
                                      : est === "curado"
                                        ? "bg-blue-500 border-blue-600 text-white"
                                        : "bg-slate-300 border-slate-400 dark:bg-slate-700 dark:border-slate-600 text-slate-800 dark:text-slate-100"
                                    : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-350"
                                }`}
                              >
                                {est === "limpio" ? "Sano" : est === "caries" ? "Car" : "Cur"}
                              </button>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Footer del Modal */}
            <div className="bg-slate-50 dark:bg-slate-950 px-6 py-4 border-t border-slate-100 dark:border-slate-800 flex justify-end">
              <button
                onClick={() => setSelectedDienteNum(null)}
                className="px-6 py-2 bg-teal-600 hover:bg-teal-700 text-white text-sm font-bold rounded-xl shadow-md transition-all duration-150 hover:scale-[1.02]"
              >
                Listo / Confirmar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
