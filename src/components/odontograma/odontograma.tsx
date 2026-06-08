/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import React, { useState, useEffect } from "react";
import { 
  Activity, 
  Trash2, 
  RotateCcw,
  Sparkles,
  Info,
  Check
} from "lucide-react";
import { DienteSVG } from "./diente-svg";
import { DIAGNOSTICOS_CONFIG, PROCEDIMIENTOS_CONFIG } from "./odontograma-config";

// =========================================================================
// TIPOS EXPORTADOS
// =========================================================================
export type FaceState = "limpio" | "caries" | "curado";

export interface ToothState {
  numero: number;
  ausente: boolean;
  corona: boolean;
  endodoncia: boolean;
  caras: {
    V: FaceState; // Vestibular
    O: FaceState; // Oclusal
    M: FaceState; // Mesial
    D: FaceState; // Distal
    L: FaceState; // Lingual
  };
  diagnosticos?: {
    caries?: boolean; // caras mapeadas
    fractura?: boolean;
    giroversion?: "izquierda" | "derecha";
    remanente?: boolean;
    diastema?: boolean;
    edentulo?: boolean;
    macrodoncia?: boolean;
    microdoncia?: boolean;
    incrustacion?: "bueno" | "malo";
    incrustacion_estetica?: "bueno" | "malo";
    movilidad?: boolean;
    endodoncia_inicial?: "bueno" | "malo"; // Endodoncia con la que viene el paciente
  };
  procedimientoMarkings?: {
    curacion_simple?: boolean;
    curacion_compuesta?: boolean;
    reconstruccion_coronaria?: boolean;
    extraccion_simple?: boolean;
    extraccion_compleja?: boolean;
    cirugia_3m?: boolean;
    endodoncia_anterior?: "buena" | "mala";
    endodoncia_posterior?: boolean;
    corona_porcelana?: boolean;
    corona_circonio?: boolean;
    corona_ceramica?: boolean;
    corona_venner_ceramico?: boolean;
    corona_venner_ivocrom?: boolean;
    corona_jacket?: boolean;
    perno_munon?: boolean;
    perno_fibra_vidrio?: boolean;
    perno_circonio?: boolean;
    pulpotomia?: boolean;
    pulpectomia?: boolean;
    sellante?: boolean;
    cemento_provisional?: boolean;
    cemento_fijo?: boolean;
    implante?: boolean;
    amalgama?: "bueno" | "malo";
    resina?: "bueno" | "malo";
  };
}

export type OdontogramaState = Record<number, ToothState>;

interface OdontogramaProps {
  initialState?: OdontogramaState;
  onChange?: (state: OdontogramaState) => void;
  readOnly?: boolean;
  mode?: "diagnostic" | "treatment" | "final";
  forceVista?: "adulto" | "infantil"; // Habilitado automáticamente por edad
  procedimientosPlanteados?: any[]; // Procedimientos de la calculadora
  onToothClick?: (numero: number) => void; // Al hacer click en un diente en modo tratamiento
  hideHeader?: boolean;
}

// Inicialización de un diente vacío
export const crearDienteVacio = (numero: number): ToothState => ({
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
  diagnosticos: {},
  procedimientoMarkings: {}
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

export const Odontograma: React.FC<OdontogramaProps> = ({
  initialState = {},
  onChange,
  readOnly = false,
  mode = "treatment",
  forceVista,
  procedimientosPlanteados = [],
  onToothClick,
  hideHeader = false,
}) => {
  // Estado local de los dientes
  const [dientes, setDientes] = useState<OdontogramaState>(() => {
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

  // Ajustar la vista si se fuerza externamente (por edad)
  useEffect(() => {
    if (forceVista) {
      setTimeout(() => {
        setVista(forceVista);
      }, 0);
    }
  }, [forceVista]);

  // Sincronizar reactivamente cuando el estado inicial cambia
  useEffect(() => {
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

    // Mapear procedimientos planteados sobre el estado de los dientes
    if (mode !== "diagnostic" && procedimientosPlanteados.length > 0) {
      todosLosNumeros.forEach((num) => {
        if (!state[num].procedimientoMarkings) {
          state[num].procedimientoMarkings = {};
        } else {
          state[num].procedimientoMarkings = {}; // Reset para recalcular
        }

        // Buscar qué procedimientos aplican a esta pieza
        procedimientosPlanteados.forEach((procItem: any) => {
          // Las piezas pueden estar en un string separado por comas
          const piezasStr = procItem.piezas || (procItem.diente_numero ? String(procItem.diente_numero) : "");
          const piezasArr = piezasStr.split(",").map((s: string) => parseInt(s.trim())).filter(Boolean);

          if (piezasArr.includes(num)) {
            const nombre = procItem.nombre_procedimiento;
            const pm = state[num].procedimientoMarkings!;

            if (nombre === "Curación simple") pm.curacion_simple = true;
            else if (nombre === "Curación compuesta") pm.curacion_compuesta = true;
            else if (nombre === "Reconstrucción coronaria") pm.reconstruccion_coronaria = true;
            else if (nombre === "Extracción simple") pm.extraccion_simple = true;
            else if (nombre === "Extracción compleja") pm.extraccion_compleja = true;
            else if (nombre === "Cirugía 3ra molar") pm.cirugia_3m = true;
            else if (nombre === "Endodoncia anterior") pm.endodoncia_anterior = procItem.notas?.toLowerCase().includes("mala") ? "mala" : "buena";
            else if (nombre === "Endodoncia posterior") pm.endodoncia_posterior = true;
            else if (nombre === "Corona de porcelana") pm.corona_porcelana = true;
            else if (nombre === "Corona de circonio") pm.corona_circonio = true;
            else if (nombre === "Corona tipo cerámica") pm.corona_ceramica = true;
            else if (nombre === "Corona venner ceramico") pm.corona_venner_ceramico = true;
            else if (nombre === "Corona veneer ivocrom") pm.corona_venner_ivocrom = true;
            else if (nombre === "Corona Jacket") pm.corona_jacket = true;
            else if (nombre === "Perno muñón") pm.perno_munon = true;
            else if (nombre === "Perno fibra de vidrio") pm.perno_fibra_vidrio = true;
            else if (nombre === "Perno de circonio") pm.perno_circonio = true;
            else if (nombre === "Pulpotomia") pm.pulpotomia = true;
            else if (nombre === "Pulpectomia") pm.pulpectomia = true;
            else if (nombre === "Sellante") pm.sellante = true;
            else if (nombre === "Cemento provisional") pm.cemento_provisional = true;
            else if (nombre === "Cemento fijo") pm.cemento_fijo = true;
            else if (nombre.startsWith("Carillas de circonio")) pm.implante = true; // mapped to initials
            else if (nombre === "Implante") pm.implante = true;
            else if (nombre === "Amalgama") pm.amalgama = procItem.notas?.toLowerCase().includes("mal") ? "malo" : "bueno";
            else if (nombre === "Resina") pm.resina = procItem.notas?.toLowerCase().includes("mal") ? "malo" : "bueno";
          }
        });
      });
    }

    setTimeout(() => {
      setDientes(state);
    }, 0);
  }, [JSON.stringify(initialState), JSON.stringify(procedimientosPlanteados), mode]);

  // Notificar cambios al padre
  const notificarCambio = (nuevoEstado: OdontogramaState) => {
    setDientes(nuevoEstado);
    if (onChange) {
      onChange(nuevoEstado);
    }
  };

  // Click en cara de diente (Para marcar Caries/Curado rápido)
  const handleFaceClick = (numero: number, face: keyof ToothState["caras"]) => {
    if (readOnly) return;
    
    // Si estamos en modo de tratamiento, el click al diente debe asociar la pieza, no pintar caras
    if (mode === "treatment" && onToothClick) {
      onToothClick(numero);
      return;
    }

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
      diagnosticos: {
        ...diente.diagnosticos,
        caries: true, // Se marca como caries/curación existente
      }
    };

    notificarCambio({
      ...dientes,
      [numero]: nuevoDiente,
    });
  };

  // Seleccionar diente
  const handleToothSelect = (numero: number) => {
    if (readOnly) return;

    if (mode === "treatment") {
      // Si estamos agregando procedimientos en la calculadora, clic en diente agrega/quita la pieza
      if (onToothClick) {
        onToothClick(numero);
      } else {
        setSelectedDienteNum(numero);
      }
    } else {
      // Modo Diagnóstico / Registro: abre configuración
      setSelectedDienteNum(numero);
    }
  };

  // Modificadores globales para el diente seleccionado (Modo Diagnóstico)
  const toggleDiagnosticoBool = (diagnosticoKey: keyof NonNullable<ToothState["diagnosticos"]>) => {
    if (selectedDienteNum === null) return;
    const num = selectedDienteNum;
    const currentDiag = dientes[num].diagnosticos || {};
    
    const nuevoDiente = {
      ...dientes[num],
      diagnosticos: {
        ...currentDiag,
        [diagnosticoKey]: !currentDiag[diagnosticoKey],
      },
    };

    // Ajustar flags de la pieza principal si aplica
    if (diagnosticoKey === "edentulo") {
      nuevoDiente.ausente = !currentDiag.edentulo;
      nuevoDiente.caras = crearDienteVacio(num).caras;
    }

    notificarCambio({ ...dientes, [num]: nuevoDiente });
  };

  const setDiagnosticoVal = (diagnosticoKey: keyof NonNullable<ToothState["diagnosticos"]>, val: any) => {
    if (selectedDienteNum === null) return;
    const num = selectedDienteNum;
    const currentDiag = dientes[num].diagnosticos || {};
    
    const nuevoDiente = {
      ...dientes[num],
      diagnosticos: {
        ...currentDiag,
        [diagnosticoKey]: val,
      },
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
      diagnosticos: {
        ...dientes[num].diagnosticos,
        caries: true
      }
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

  const renderFilaDientes = (numeros: number[]) => {
    return (
      <div className="flex flex-wrap gap-2 justify-center items-center">
        {numeros.map((num) => (
          <DienteSVG
            key={num}
            diente={dientes[num]}
            isSelected={selectedDienteNum === num}
            onSelect={() => handleToothSelect(num)}
            onFaceClick={(face) => handleFaceClick(num, face)}
            readOnly={readOnly}
            mode={mode}
          />
        ))}
      </div>
    );
  };

  const dienteSeleccionado = selectedDienteNum !== null ? dientes[selectedDienteNum] : null;

  return (
    <div className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-3xl p-6 shadow-xl space-y-6 select-none transition-colors">
      
      {/* Cabecera y Controles */}
      {!hideHeader && (
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-100 dark:border-slate-800 pb-5">
          <div>
            <h2 className="text-xl font-black text-slate-800 dark:text-slate-100 flex items-center gap-2">
              <Activity className="h-6 w-6 text-teal-650 dark:text-emerald-450" />
              {mode === "diagnostic" 
                ? "Odontograma Diagnóstico Inicial (Ingreso)" 
                : mode === "final" 
                  ? "Odontograma Proyectado Final"
                  : "Odontograma Plan de Tratamiento"
              }
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {mode === "diagnostic" 
                ? "Seleccione una pieza dental para marcar patologías y estados de ingreso." 
                : "Seleccione piezas dentales para asociarlas al procedimiento en edición."
              }
            </p>
          </div>

          {/* Botones de acción */}
          <div className="flex flex-wrap gap-2 w-full sm:w-auto items-center">
            {/* Selector de Dentición (Sólo se muestra si no está forzado por edad) */}
            {!forceVista && (
              <div className="bg-slate-150/60 dark:bg-slate-800 p-0.5 rounded-xl flex gap-1 text-[11px] font-bold">
                <button
                  type="button"
                  onClick={() => setVista("todos")}
                  className={`px-3 py-1.5 rounded-lg transition-all ${
                    vista === "todos" 
                      ? "bg-white dark:bg-slate-900 text-teal-655 dark:text-emerald-455 shadow-sm" 
                      : "text-slate-500 hover:text-slate-850"
                  }`}
                >
                  Completo
                </button>
                <button
                  type="button"
                  onClick={() => setVista("adulto")}
                  className={`px-3 py-1.5 rounded-lg transition-all ${
                    vista === "adulto" 
                      ? "bg-white dark:bg-slate-900 text-teal-655 dark:text-emerald-455 shadow-sm" 
                      : "text-slate-500 hover:text-slate-850"
                  }`}
                >
                  Adultos
                </button>
                <button
                  type="button"
                  onClick={() => setVista("infantil")}
                  className={`px-3 py-1.5 rounded-lg transition-all ${
                    vista === "infantil" 
                      ? "bg-white dark:bg-slate-900 text-teal-655 dark:text-emerald-455 shadow-sm" 
                      : "text-slate-500 hover:text-slate-850"
                  }`}
                >
                  Infantil
                </button>
              </div>
            )}

            {forceVista && (
              <span className="text-[10px] font-extrabold uppercase px-3 py-1.5 bg-slate-100 dark:bg-slate-900 text-slate-500 border border-slate-200 dark:border-slate-800 rounded-xl">
                Vista: {forceVista === "adulto" ? "Adultos (Dentición Permanente)" : "Infantil (Dentición Temporal)"}
              </span>
            )}

            {!readOnly && mode === "diagnostic" && (
              <button
                type="button"
                onClick={limpiarTodoElOdontograma}
                className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-red-50 dark:hover:bg-red-950/20 text-slate-500 hover:text-red-500 transition-colors"
                title="Limpiar todo el odontograma"
              >
                <RotateCcw className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
      )}

      {/* Leyenda de Estados Clave */}
      <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-2 p-3 bg-slate-50 dark:bg-slate-900/40 rounded-2xl border border-slate-150 dark:border-slate-850 text-[10px] font-semibold text-slate-500">
        <div className="flex items-center gap-1.5"><span className="w-3.5 h-3.5 rounded border bg-white dark:bg-slate-950"></span> Sano</div>
        <div className="flex items-center gap-1.5 text-red-500"><span className="w-3.5 h-3.5 rounded border border-red-700 bg-red-500"></span> Caries</div>
        <div className="flex items-center gap-1.5 text-blue-600"><span className="w-3.5 h-3.5 rounded border border-blue-600 bg-blue-500"></span> Curado</div>
        <div className="flex items-center gap-1.5 text-red-600"><span className="w-3.5 h-3.5 font-bold text-center leading-none text-red-600">X</span> Extracción</div>
        <div className="flex items-center gap-1.5 text-orange-600"><span className="w-3.5 h-3.5 rounded-full border-2 border-dashed border-orange-500"></span> Corona</div>
        <div className="flex items-center gap-1.5 text-blue-500"><span className="w-3.5 h-3.5 font-bold text-center text-blue-600">)(</span> Diastema</div>
      </div>

      {/* ARCADA DENTAL */}
      <div className="space-y-10">
        {/* Dentición Adulto */}
        {(vista === "todos" || vista === "adulto") && (
          <div className="space-y-4">
            <div className="text-center text-[10px] font-extrabold uppercase tracking-widest text-slate-400">Dentición Permanente (Adulto)</div>
            
            <div className="space-y-4">
              <div className="flex flex-col md:flex-row justify-center items-center gap-4">
                <div className="flex gap-1.5 bg-slate-50 dark:bg-slate-900/20 p-2.5 rounded-2xl border border-slate-100 dark:border-slate-850/80 shadow-inner">
                  {renderFilaDientes(DIENTES_ADULTO_SUP_IZQ)}
                </div>
                <div className="hidden md:block w-[1.5px] h-14 bg-teal-500/20"></div>
                <div className="flex gap-1.5 bg-slate-50 dark:bg-slate-900/20 p-2.5 rounded-2xl border border-slate-100 dark:border-slate-850/80 shadow-inner">
                  {renderFilaDientes(DIENTES_ADULTO_SUP_DER)}
                </div>
              </div>

              <div className="flex flex-col md:flex-row justify-center items-center gap-4 pt-1">
                <div className="flex gap-1.5 bg-slate-50 dark:bg-slate-900/20 p-2.5 rounded-2xl border border-slate-100 dark:border-slate-850/80 shadow-inner">
                  {renderFilaDientes(DIENTES_ADULTO_INF_IZQ)}
                </div>
                <div className="hidden md:block w-[1.5px] h-14 bg-teal-500/20"></div>
                <div className="flex gap-1.5 bg-slate-50 dark:bg-slate-900/20 p-2.5 rounded-2xl border border-slate-100 dark:border-slate-850/80 shadow-inner">
                  {renderFilaDientes(DIENTES_ADULTO_INF_DER)}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Dentición Infantil */}
        {(vista === "todos" || vista === "infantil") && (
          <div className="space-y-4 pt-6 border-t border-slate-100 dark:border-slate-850">
            <div className="text-center text-[10px] font-extrabold uppercase tracking-widest text-slate-400">Dentición Temporal (Infantil)</div>
            
            <div className="space-y-4">
              <div className="flex flex-col md:flex-row justify-center items-center gap-4">
                <div className="flex gap-1.5 bg-slate-50 dark:bg-slate-900/20 p-2.5 rounded-2xl border border-slate-100 dark:border-slate-850/80 shadow-inner">
                  {renderFilaDientes(DIENTES_NINO_SUP_IZQ)}
                </div>
                <div className="hidden md:block w-[1.5px] h-14 bg-teal-500/20"></div>
                <div className="flex gap-1.5 bg-slate-50 dark:bg-slate-900/20 p-2.5 rounded-2xl border border-slate-100 dark:border-slate-850/80 shadow-inner">
                  {renderFilaDientes(DIENTES_NINO_SUP_DER)}
                </div>
              </div>

              <div className="flex flex-col md:flex-row justify-center items-center gap-4 pt-1">
                <div className="flex gap-1.5 bg-slate-50 dark:bg-slate-900/20 p-2.5 rounded-2xl border border-slate-100 dark:border-slate-850/80 shadow-inner">
                  {renderFilaDientes(DIENTES_NINO_INF_IZQ)}
                </div>
                <div className="hidden md:block w-[1.5px] h-14 bg-teal-500/20"></div>
                <div className="flex gap-1.5 bg-slate-50 dark:bg-slate-900/20 p-2.5 rounded-2xl border border-slate-100 dark:border-slate-850/80 shadow-inner">
                  {renderFilaDientes(DIENTES_NINO_INF_DER)}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* MODAL CONFIGURACIÓN DIAGNÓSTICO PIEZA (MODO DIAGNÓSTICO) */}
      {dienteSeleccionado && mode === "diagnostic" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/50 backdrop-blur-sm animate-[fadeIn_0.2s_ease-out]">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden animate-[scaleUp_0.18s_ease-out]">
            
            {/* Header */}
            <div className="bg-gradient-to-r from-teal-800 to-emerald-800 px-6 py-4 text-white flex justify-between items-center">
              <div>
                <h3 className="text-md font-bold flex items-center gap-1.5">
                  <Sparkles className="h-4.5 w-4.5 text-amber-300" />
                  Diagnóstico Inicial de Pieza Dental
                </h3>
                <p className="text-xs text-teal-100">Diente número: #{dienteSeleccionado.numero}</p>
              </div>
              <button 
                onClick={() => setSelectedDienteNum(null)}
                className="bg-white/10 hover:bg-white/20 text-white rounded-full p-1.5 text-xs font-bold transition-colors"
              >
                ✕
              </button>
            </div>

            {/* Contenido */}
            <div className="p-6 space-y-5 max-h-[70vh] overflow-y-auto">
              
              {/* Vista previa SVG */}
              <div className="flex flex-col items-center justify-center py-3 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-100 dark:border-slate-850/85">
                <DienteSVG
                  diente={dienteSeleccionado}
                  isSelected={false}
                  onSelect={() => {}}
                  onFaceClick={(face) => handleFaceClick(dienteSeleccionado.numero, face)}
                  readOnly={false}
                  mode="diagnostic"
                />
                <span className="text-[10px] text-slate-400 mt-2 font-bold uppercase tracking-wider">
                  Haz clic en las caras del diente arriba para caries/curados individuales
                </span>
              </div>

              {/* Selector de patologías / variables */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest border-b pb-1.5 border-slate-100 dark:border-slate-800">
                  Variables de Diagnóstico Inicial
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  
                  {/* Fractura */}
                  <button
                    type="button"
                    onClick={() => toggleDiagnosticoBool("fractura")}
                    className={`flex justify-between items-center p-3 rounded-xl border text-xs font-bold transition-all ${
                      dienteSeleccionado.diagnosticos?.fractura
                        ? "bg-red-50 dark:bg-red-950/20 border-red-500 text-red-600"
                        : "bg-slate-50 dark:bg-slate-850 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-350 hover:bg-slate-100"
                    }`}
                  >
                    <span>Fractura</span>
                    {dienteSeleccionado.diagnosticos?.fractura && <Check className="h-4 w-4" />}
                  </button>

                  {/* Remanente Radicular */}
                  <button
                    type="button"
                    onClick={() => toggleDiagnosticoBool("remanente")}
                    className={`flex justify-between items-center p-3 rounded-xl border text-xs font-bold transition-all ${
                      dienteSeleccionado.diagnosticos?.remanente
                        ? "bg-red-50 dark:bg-red-950/20 border-red-500 text-red-650"
                        : "bg-slate-50 dark:bg-slate-855 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-350 hover:bg-slate-100"
                    }`}
                  >
                    <span>Remanente Radicular (RR)</span>
                    {dienteSeleccionado.diagnosticos?.remanente && <Check className="h-4 w-4" />}
                  </button>

                  {/* Diastema */}
                  <button
                    type="button"
                    onClick={() => toggleDiagnosticoBool("diastema")}
                    className={`flex justify-between items-center p-3 rounded-xl border text-xs font-bold transition-all ${
                      dienteSeleccionado.diagnosticos?.diastema
                        ? "bg-blue-50 dark:bg-blue-950/20 border-blue-500 text-blue-600"
                        : "bg-slate-50 dark:bg-slate-850 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-355 hover:bg-slate-100"
                    }`}
                  >
                    <span>Diastema )(</span>
                    {dienteSeleccionado.diagnosticos?.diastema && <Check className="h-4 w-4" />}
                  </button>

                  {/* Ausente / Edéntulo */}
                  <button
                    type="button"
                    onClick={() => toggleDiagnosticoBool("edentulo")}
                    className={`flex justify-between items-center p-3 rounded-xl border text-xs font-bold transition-all ${
                      dienteSeleccionado.diagnosticos?.edentulo
                        ? "bg-blue-50 dark:bg-blue-950/20 border-blue-500 text-blue-600"
                        : "bg-slate-50 dark:bg-slate-850 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-350 hover:bg-slate-100"
                    }`}
                  >
                    <span>Edéntulo Total (Aspa Azul)</span>
                    {dienteSeleccionado.diagnosticos?.edentulo && <Check className="h-4 w-4" />}
                  </button>

                  {/* Macrodoncia */}
                  <button
                    type="button"
                    onClick={() => toggleDiagnosticoBool("macrodoncia")}
                    className={`flex justify-between items-center p-3 rounded-xl border text-xs font-bold transition-all ${
                      dienteSeleccionado.diagnosticos?.macrodoncia
                        ? "bg-blue-50 dark:bg-blue-950/20 border-blue-500 text-blue-600"
                        : "bg-slate-50 dark:bg-slate-850 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-350 hover:bg-slate-100"
                    }`}
                  >
                    <span>Macrodoncia (MAC)</span>
                    {dienteSeleccionado.diagnosticos?.macrodoncia && <Check className="h-4 w-4" />}
                  </button>

                  {/* Microdoncia */}
                  <button
                    type="button"
                    onClick={() => toggleDiagnosticoBool("microdoncia")}
                    className={`flex justify-between items-center p-3 rounded-xl border text-xs font-bold transition-all ${
                      dienteSeleccionado.diagnosticos?.microdoncia
                        ? "bg-blue-50 dark:bg-blue-950/20 border-blue-500 text-blue-600"
                        : "bg-slate-50 dark:bg-slate-850 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-350 hover:bg-slate-100"
                    }`}
                  >
                    <span>Microdoncia (MIC)</span>
                    {dienteSeleccionado.diagnosticos?.microdoncia && <Check className="h-4 w-4" />}
                  </button>

                  {/* Movilidad */}
                  <button
                    type="button"
                    onClick={() => toggleDiagnosticoBool("movilidad")}
                    className={`flex justify-between items-center p-3 rounded-xl border text-xs font-bold transition-all ${
                      dienteSeleccionado.diagnosticos?.movilidad
                        ? "bg-orange-50 dark:bg-orange-950/20 border-orange-500 text-orange-600"
                        : "bg-slate-50 dark:bg-slate-850 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-350 hover:bg-slate-100"
                    }`}
                  >
                    <span>Movilidad (M1)</span>
                    {dienteSeleccionado.diagnosticos?.movilidad && <Check className="h-4 w-4" />}
                  </button>

                </div>

                {/* Selectores Avanzados */}
                <div className="space-y-4 pt-3 border-t border-slate-100 dark:border-slate-800">
                  
                  {/* Giroversión */}
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-3 bg-slate-50 dark:bg-slate-850 rounded-2xl border border-slate-150 dark:border-slate-800 gap-2">
                    <div className="text-xs font-bold text-slate-700 dark:text-slate-300">Giroversión (Orientación)</div>
                    <div className="flex gap-1 w-full sm:w-auto">
                      <button
                        type="button"
                        onClick={() => setDiagnosticoVal("giroversion", dienteSeleccionado.diagnosticos?.giroversion === "izquierda" ? undefined : "izquierda")}
                        className={`px-3 py-1.5 text-[10px] font-extrabold uppercase rounded-lg border w-1/2 sm:w-auto ${
                          dienteSeleccionado.diagnosticos?.giroversion === "izquierda"
                            ? "bg-sky-500 border-sky-600 text-white"
                            : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-850 text-slate-400 hover:text-slate-650"
                        }`}
                      >
                        Izquierda ↺
                      </button>
                      <button
                        type="button"
                        onClick={() => setDiagnosticoVal("giroversion", dienteSeleccionado.diagnosticos?.giroversion === "derecha" ? undefined : "derecha")}
                        className={`px-3 py-1.5 text-[10px] font-extrabold uppercase rounded-lg border w-1/2 sm:w-auto ${
                          dienteSeleccionado.diagnosticos?.giroversion === "derecha"
                            ? "bg-sky-500 border-sky-600 text-white"
                            : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-850 text-slate-400 hover:text-slate-650"
                        }`}
                      >
                        Derecha ↻
                      </button>
                    </div>
                  </div>

                  {/* Incrustación */}
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-3 bg-slate-50 dark:bg-slate-850 rounded-2xl border border-slate-150 dark:border-slate-800 gap-2">
                    <div className="text-xs font-bold text-slate-700 dark:text-slate-300">Incrustación (Buen/Mal estado)</div>
                    <div className="flex gap-1 w-full sm:w-auto">
                      <button
                        type="button"
                        onClick={() => setDiagnosticoVal("incrustacion", dienteSeleccionado.diagnosticos?.incrustacion === "bueno" ? undefined : "bueno")}
                        className={`px-3 py-1.5 text-[10px] font-extrabold uppercase rounded-lg border w-1/2 sm:w-auto ${
                          dienteSeleccionado.diagnosticos?.incrustacion === "bueno"
                            ? "bg-blue-600 border-blue-700 text-white"
                            : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-850 text-slate-400 hover:text-slate-600"
                        }`}
                      >
                        Buen Estado (IM Azul)
                      </button>
                      <button
                        type="button"
                        onClick={() => setDiagnosticoVal("incrustacion", dienteSeleccionado.diagnosticos?.incrustacion === "malo" ? undefined : "malo")}
                        className={`px-3 py-1.5 text-[10px] font-extrabold uppercase rounded-lg border w-1/2 sm:w-auto ${
                          dienteSeleccionado.diagnosticos?.incrustacion === "malo"
                            ? "bg-red-500 border-red-655 text-white"
                            : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-850 text-slate-400 hover:text-slate-600"
                        }`}
                      >
                        Mal Estado (IM Rojo)
                      </button>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-3 bg-slate-50 dark:bg-slate-855 rounded-2xl border border-slate-150 dark:border-slate-800 gap-2">
                    <div className="text-xs font-bold text-slate-700 dark:text-slate-300">Incrustación Estética (IE)</div>
                    <div className="flex gap-1 w-full sm:w-auto">
                      <button
                        type="button"
                        onClick={() => setDiagnosticoVal("incrustacion_estetica", dienteSeleccionado.diagnosticos?.incrustacion_estetica === "bueno" ? undefined : "bueno")}
                        className={`px-3 py-1.5 text-[10px] font-extrabold uppercase rounded-lg border w-1/2 sm:w-auto ${
                          dienteSeleccionado.diagnosticos?.incrustacion_estetica === "bueno"
                            ? "bg-blue-600 border-blue-700 text-white"
                            : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-850 text-slate-400 hover:text-slate-600"
                        }`}
                      >
                        Buen Estado (IE Azul)
                      </button>
                      <button
                        type="button"
                        onClick={() => setDiagnosticoVal("incrustacion_estetica", dienteSeleccionado.diagnosticos?.incrustacion_estetica === "malo" ? undefined : "malo")}
                        className={`px-3 py-1.5 text-[10px] font-extrabold uppercase rounded-lg border w-1/2 sm:w-auto ${
                          dienteSeleccionado.diagnosticos?.incrustacion_estetica === "malo"
                            ? "bg-red-500 border-red-650 text-white"
                            : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-850 text-slate-400 hover:text-slate-600"
                        }`}
                      >
                        Mal Estado (IE Rojo)
                      </button>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-3 bg-slate-50 dark:bg-slate-850 rounded-2xl border border-slate-150 dark:border-slate-800 gap-2">
                    <div className="text-xs font-bold text-slate-700 dark:text-slate-300">Endodoncia previa (Ingreso)</div>
                    <div className="flex gap-1 w-full sm:w-auto">
                      <button
                        type="button"
                        onClick={() => setDiagnosticoVal("endodoncia_inicial", dienteSeleccionado.diagnosticos?.endodoncia_inicial === "bueno" ? undefined : "bueno")}
                        className={`px-3 py-1.5 text-[10px] font-extrabold uppercase rounded-lg border w-1/2 sm:w-auto ${
                          dienteSeleccionado.diagnosticos?.endodoncia_inicial === "bueno"
                            ? "bg-blue-600 border-blue-700 text-white"
                            : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-850 text-slate-400 hover:text-slate-600"
                        }`}
                      >
                        Buena (Línea Azul)
                      </button>
                      <button
                        type="button"
                        onClick={() => setDiagnosticoVal("endodoncia_inicial", dienteSeleccionado.diagnosticos?.endodoncia_inicial === "malo" ? undefined : "malo")}
                        className={`px-3 py-1.5 text-[10px] font-extrabold uppercase rounded-lg border w-1/2 sm:w-auto ${
                          dienteSeleccionado.diagnosticos?.endodoncia_inicial === "malo"
                            ? "bg-red-500 border-red-650 text-white"
                            : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-850 text-slate-400 hover:text-slate-600"
                        }`}
                      >
                        Mala (Línea Roja)
                      </button>
                    </div>
                  </div>

                </div>

                {/* Limpiar pieza */}
                <div className="pt-3 flex justify-between">
                  <button
                    type="button"
                    onClick={resetearDiente}
                    className="px-4 py-2 text-xs font-bold bg-red-50 dark:bg-red-950/20 text-red-600 border border-red-200 dark:border-red-900/30 rounded-xl hover:bg-red-100 transition-colors"
                  >
                    Restaurar Pieza Sana
                  </button>
                </div>

              </div>

            </div>

            {/* Footer */}
            <div className="bg-slate-50 dark:bg-slate-950 px-6 py-4 border-t border-slate-100 dark:border-slate-800 flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedDienteNum(null)}
                className="px-6 py-2.5 bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold rounded-xl shadow-md transition-all hover:scale-[1.02]"
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
