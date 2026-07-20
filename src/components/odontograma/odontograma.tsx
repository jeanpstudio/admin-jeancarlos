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
  Check,
  Maximize2,
  Minimize2,
  X
} from "lucide-react";
import { DienteSVG } from "./diente-svg";
import { DIAGNOSTICOS_CONFIG, PROCEDIMIENTOS_CONFIG } from "./odontograma-config";
import { createPortal } from "react-dom";

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

const getToothType = (numero: number) => {
  const digit = numero % 10;
  if ([8, 7, 6].includes(digit)) return "molar";
  if ([5, 4].includes(digit)) return "premolar";
  return "incisivo"; // 3, 2, 1 son incisivos/caninos
};

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
  const [diagnosticSearchQuery, setDiagnosticSearchQuery] = useState("");

  useEffect(() => {
    setDiagnosticSearchQuery("");
  }, [selectedDienteNum]);

  // Helper para listar los diagnósticos activos en un diente
  const getActiveDiagnostics = (tooth: ToothState) => {
    const active: { id: string; label: string; color: string; onRemove: () => void }[] = [];
    const diag = tooth.diagnosticos || {};
    
    if (diag.fractura) {
      active.push({
        id: "fractura",
        label: "Fractura",
        color: "bg-red-50 dark:bg-red-950/20 text-red-600 border-red-200 dark:border-red-900/30",
        onRemove: () => toggleDiagnosticoBool("fractura")
      });
    }
    if (diag.remanente) {
      active.push({
        id: "remanente",
        label: "Remanente Radicular",
        color: "bg-red-50 dark:bg-red-950/20 text-red-605 border-red-205 dark:border-red-900/30",
        onRemove: () => toggleDiagnosticoBool("remanente")
      });
    }
    if (diag.diastema) {
      active.push({
        id: "diastema",
        label: "Diastema )(",
        color: "bg-blue-50 dark:bg-blue-950/20 text-blue-600 border-blue-200 dark:border-blue-900/30",
        onRemove: () => toggleDiagnosticoBool("diastema")
      });
    }
    if (diag.edentulo) {
      active.push({
        id: "edentulo",
        label: "Edéntulo (Ausente)",
        color: "bg-blue-50 dark:bg-blue-950/20 text-blue-600 border-blue-200 dark:border-blue-900/30",
        onRemove: () => toggleDiagnosticoBool("edentulo")
      });
    }
    if (diag.macrodoncia) {
      active.push({
        id: "macrodoncia",
        label: "Macrodoncia",
        color: "bg-blue-50 dark:bg-blue-950/20 text-blue-600 border-blue-200 dark:border-blue-900/30",
        onRemove: () => toggleDiagnosticoBool("macrodoncia")
      });
    }
    if (diag.microdoncia) {
      active.push({
        id: "microdoncia",
        label: "Microdoncia",
        color: "bg-blue-50 dark:bg-blue-950/20 text-blue-600 border-blue-200 dark:border-blue-900/30",
        onRemove: () => toggleDiagnosticoBool("microdoncia")
      });
    }
    if (diag.movilidad) {
      active.push({
        id: "movilidad",
        label: "Movilidad",
        color: "bg-orange-50 dark:bg-orange-950/20 text-orange-600 border-orange-200 dark:border-orange-900/30",
        onRemove: () => toggleDiagnosticoBool("movilidad")
      });
    }
    if (diag.giroversion) {
      active.push({
        id: "giroversion",
        label: `Giroversión: ${diag.giroversion === "izquierda" ? "Izquierda" : "Derecha"}`,
        color: "bg-sky-50 dark:bg-sky-950/20 text-sky-600 border-sky-200 dark:border-sky-900/30",
        onRemove: () => setDiagnosticoVal("giroversion", undefined)
      });
    }
    if (diag.incrustacion) {
      active.push({
        id: "incrustacion",
        label: `Incrustación: ${diag.incrustacion === "bueno" ? "Buen Estado" : "Mal Estado"}`,
        color: diag.incrustacion === "bueno"
          ? "bg-blue-50 dark:bg-blue-950/20 text-blue-600 border-blue-200 dark:border-blue-900/30"
          : "bg-red-50 dark:bg-red-950/20 text-red-600 border-red-200 dark:border-red-900/30",
        onRemove: () => setDiagnosticoVal("incrustacion", undefined)
      });
    }
    if (diag.incrustacion_estetica) {
      active.push({
        id: "incrustacion_estetica",
        label: `Incrustación Estética: ${diag.incrustacion_estetica === "bueno" ? "Buen Estado" : "Mal Estado"}`,
        color: diag.incrustacion_estetica === "bueno"
          ? "bg-blue-50 dark:bg-blue-950/20 text-blue-600 border-blue-200 dark:border-blue-900/30"
          : "bg-red-50 dark:bg-red-950/20 text-red-600 border-red-200 dark:border-red-900/30",
        onRemove: () => setDiagnosticoVal("incrustacion_estetica", undefined)
      });
    }
    if (diag.endodoncia_inicial) {
      active.push({
        id: "endodoncia_inicial",
        label: `Endodoncia Previa: ${diag.endodoncia_inicial === "bueno" ? "Buena" : "Mala"}`,
        color: diag.endodoncia_inicial === "bueno"
          ? "bg-blue-50 dark:bg-blue-950/20 text-blue-600 border-blue-200 dark:border-blue-900/30"
          : "bg-red-50 dark:bg-red-950/20 text-red-600 border-red-200 dark:border-red-900/30",
        onRemove: () => setDiagnosticoVal("endodoncia_inicial", undefined)
      });
    }
    
    return active;
  };

  const optionsDeDiagnostico = [
    { label: "Fractura", action: () => toggleDiagnosticoBool("fractura") },
    { label: "Remanente Radicular (RR)", action: () => toggleDiagnosticoBool("remanente") },
    { label: "Diastema )(", action: () => toggleDiagnosticoBool("diastema") },
    { label: "Edéntulo (Diente Faltante / Ausente)", action: () => toggleDiagnosticoBool("edentulo") },
    { label: "Macrodoncia", action: () => toggleDiagnosticoBool("macrodoncia") },
    { label: "Microdoncia", action: () => toggleDiagnosticoBool("microdoncia") },
    { label: "Movilidad (M1)", action: () => toggleDiagnosticoBool("movilidad") },
    { label: "Giroversión Izquierda ↺", action: () => setDiagnosticoVal("giroversion", "izquierda") },
    { label: "Giroversión Derecha ↻", action: () => setDiagnosticoVal("giroversion", "derecha") },
    { label: "Incrustación - Buen Estado", action: () => setDiagnosticoVal("incrustacion", "bueno") },
    { label: "Incrustación - Mal Estado", action: () => setDiagnosticoVal("incrustacion", "malo") },
    { label: "Incrustación Estética - Buen Estado", action: () => setDiagnosticoVal("incrustacion_estetica", "bueno") },
    { label: "Incrustación Estética - Mal Estado", action: () => setDiagnosticoVal("incrustacion_estetica", "malo") },
    { label: "Endodoncia Previa (Ingreso) - Buena", action: () => setDiagnosticoVal("endodoncia_inicial", "bueno") },
    { label: "Endodoncia Previa (Ingreso) - Mala", action: () => setDiagnosticoVal("endodoncia_inicial", "malo") },
  ];

  const filteredDiagnosticOptions = optionsDeDiagnostico.filter(opt =>
    opt.label.toLowerCase().includes(diagnosticSearchQuery.toLowerCase())
  );

  // Estados de pantalla completa
  const [isMaximized, setIsMaximized] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => {
    setIsMounted(true);
  }, []);

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

  const innerContent = (
    <>
      {/* Cabecera y Controles */}
      {!hideHeader && (
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-100 dark:border-slate-800 pb-5">
          <div>
            <h2 className="text-xl font-black text-slate-800 dark:text-slate-100 flex items-center gap-2">
              <Activity className="h-6 w-6 text-emerald-655 dark:text-emerald-450" />
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
            {/* Botón de Pantalla Completa */}
            <button
              type="button"
              onClick={() => setIsMaximized(!isMaximized)}
              className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-900/60 text-slate-500 hover:text-slate-800 dark:hover:text-white transition-colors flex items-center gap-1.5 text-xs font-bold cursor-pointer"
              title={isMaximized ? "Salir de pantalla completa" : "Pantalla completa"}
            >
              {isMaximized ? (
                <>
                  <Minimize2 className="h-4 w-4 text-emerald-600 dark:text-emerald-455" />
                  <span>Reducir</span>
                </>
              ) : (
                <>
                  <Maximize2 className="h-4 w-4 text-emerald-650 dark:text-emerald-455" />
                  <span>Ampliar</span>
                </>
              )}
            </button>

            {!readOnly && mode === "diagnostic" && (
              <button
                type="button"
                onClick={limpiarTodoElOdontograma}
                className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-red-50 dark:hover:bg-red-950/20 text-slate-500 hover:text-red-500 transition-colors cursor-pointer"
                title="Limpiar todo el odontograma"
              >
                <RotateCcw className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
      )}

      {/* ARCADA DENTAL */}
      <div className="space-y-6">
        {/* Fila 1: Adulto Superior (si aplica) */}
        {(vista === "todos" || vista === "adulto") && (
          <div className="space-y-2">
            <div className="text-center text-[10px] font-extrabold uppercase tracking-widest text-slate-400">Superior - Permanente (Adulto)</div>
            <div className="overflow-x-auto pb-1 scrollbar-thin scrollbar-thumb-slate-200">
              <div className="flex flex-row gap-1 justify-start lg:justify-center items-center min-w-max bg-slate-50 dark:bg-slate-900/20 p-2 rounded-2xl border border-slate-100 dark:border-slate-850/80 shadow-inner">
                {renderFilaDientes(DIENTES_ADULTO_SUP_IZQ)}
                <div className="w-[1.5px] h-14 bg-teal-500/20 mx-1"></div>
                {renderFilaDientes(DIENTES_ADULTO_SUP_DER)}
              </div>
            </div>
          </div>
        )}

        {/* Fila 2: Infantil Superior (si aplica) */}
        {(vista === "todos" || vista === "infantil") && (
          <div className="space-y-2">
            <div className="text-center text-[10px] font-extrabold uppercase tracking-widest text-slate-400">Superior - Temporal (Infantil)</div>
            <div className="overflow-x-auto pb-1 scrollbar-thin scrollbar-thumb-slate-200">
              <div className="flex flex-row gap-1 justify-start lg:justify-center items-center min-w-max bg-slate-50 dark:bg-slate-900/20 p-2 rounded-2xl border border-slate-100 dark:border-slate-850/80 shadow-inner">
                {renderFilaDientes(DIENTES_NINO_SUP_IZQ)}
                <div className="w-[1.5px] h-14 bg-teal-500/20 mx-1"></div>
                {renderFilaDientes(DIENTES_NINO_SUP_DER)}
              </div>
            </div>
          </div>
        )}

        {/* Fila 3: Infantil Inferior (si aplica) */}
        {(vista === "todos" || vista === "infantil") && (
          <div className="space-y-2">
            <div className="text-center text-[10px] font-extrabold uppercase tracking-widest text-slate-400">Inferior - Temporal (Infantil)</div>
            <div className="overflow-x-auto pb-1 scrollbar-thin scrollbar-thumb-slate-200">
              <div className="flex flex-row gap-1 justify-start lg:justify-center items-center min-w-max bg-slate-50 dark:bg-slate-900/20 p-2 rounded-2xl border border-slate-100 dark:border-slate-850/80 shadow-inner">
                {renderFilaDientes(DIENTES_NINO_INF_IZQ)}
                <div className="w-[1.5px] h-14 bg-teal-500/20 mx-1"></div>
                {renderFilaDientes(DIENTES_NINO_INF_DER)}
              </div>
            </div>
          </div>
        )}

        {/* Fila 4: Adulto Inferior (si aplica) */}
        {(vista === "todos" || vista === "adulto") && (
          <div className="space-y-2">
            <div className="text-center text-[10px] font-extrabold uppercase tracking-widest text-slate-400">Inferior - Permanente (Adulto)</div>
            <div className="overflow-x-auto pb-1 scrollbar-thin scrollbar-thumb-slate-200">
              <div className="flex flex-row gap-1 justify-start lg:justify-center items-center min-w-max bg-slate-50 dark:bg-slate-900/20 p-2 rounded-2xl border border-slate-100 dark:border-slate-850/80 shadow-inner">
                {renderFilaDientes(DIENTES_ADULTO_INF_IZQ)}
                <div className="w-[1.5px] h-14 bg-teal-500/20 mx-1"></div>
                {renderFilaDientes(DIENTES_ADULTO_INF_DER)}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Panel de edición de pieza dental seleccionada */}
      {dienteSeleccionado && !readOnly && (
        <div className="fixed inset-0 bg-slate-950/40 dark:bg-slate-950/70 backdrop-blur-sm z-[999] flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            
            {/* Header del modal */}
            <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-950">
              <div>
                <h3 className="font-black text-slate-800 dark:text-slate-100 flex items-center gap-1.5 text-sm uppercase">
                  Pieza Dental {dienteSeleccionado.numero} ({getToothType(dienteSeleccionado.numero)})
                </h3>
                <p className="text-[10px] text-slate-500">Configuración clínica detallada de la pieza</p>
              </div>
              <button 
                type="button"
                onClick={() => setSelectedDienteNum(null)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Cuerpo del modal */}
            <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
              
              {/* Sección de caras del diente */}
              <div className="flex flex-col items-center p-4 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-100 dark:border-slate-850">
                <span className="text-[10px] font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-2">Visualización y Caras Individuales</span>
                <DienteSVG
                  diente={dienteSeleccionado}
                  isSelected={false}
                  onSelect={() => {}}
                  onFaceClick={(face) => handleFaceClick(dienteSeleccionado.numero, face)}
                  readOnly={readOnly}
                  mode={mode}
                />
                <span className="text-[10px] text-slate-400 mt-2 font-bold uppercase tracking-wider">
                  Haz clic en las caras del diente arriba para caries/curados
                </span>
              </div>

              {/* Variables de Diagnóstico Inicial (Reemplazadas por Barra de Búsqueda Dinámica) */}
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <h4 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest border-b pb-1.5 border-slate-100 dark:border-slate-800">
                    Búsqueda de Estados / Diagnósticos
                  </h4>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Escriba para buscar (ej: fractura, movilidad, endodoncia...)"
                      value={diagnosticSearchQuery}
                      onChange={(e) => setDiagnosticSearchQuery(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl py-2.5 px-3.5 text-xs font-bold text-slate-800 dark:text-slate-150 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/10"
                    />
                    {diagnosticSearchQuery && (
                      <button
                        type="button"
                        onClick={() => setDiagnosticSearchQuery("")}
                        className="absolute right-3.5 top-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-white text-xs font-bold"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                </div>

                {/* Lista de Sugerencias Filtradas */}
                {diagnosticSearchQuery.trim() !== "" && (
                  <div className="bg-slate-50 dark:bg-slate-950 border border-slate-150 dark:border-slate-800 rounded-xl max-h-48 overflow-y-auto divide-y divide-slate-100/80 dark:divide-slate-850 shadow-inner">
                    {filteredDiagnosticOptions.length === 0 ? (
                      <p className="p-3 text-xs text-slate-400 text-center font-bold">No se encontraron resultados.</p>
                    ) : (
                      filteredDiagnosticOptions.map((opt) => (
                        <button
                          key={opt.label}
                          type="button"
                          onClick={() => {
                            opt.action();
                            setDiagnosticSearchQuery("");
                          }}
                          className="w-full text-left px-3.5 py-2.5 text-xs font-bold text-slate-700 dark:text-slate-350 hover:bg-teal-50 dark:hover:bg-emerald-950/20 hover:text-teal-600 dark:hover:text-emerald-450 transition-colors cursor-pointer"
                        >
                          + {opt.label}
                        </button>
                      ))
                    )}
                  </div>
                )}

                {/* Listado de Diagnósticos Activos como Chips/Badges */}
                <div className="space-y-2">
                  <span className="text-[10px] font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-widest block">Estados Activos en la Pieza</span>
                  {dienteSeleccionado && getActiveDiagnostics(dienteSeleccionado).length === 0 ? (
                    <p className="text-xs text-slate-400 font-semibold italic">Pieza sana (sin patologías registradas).</p>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {dienteSeleccionado && getActiveDiagnostics(dienteSeleccionado).map((act) => (
                        <span
                          key={act.id}
                          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-[11px] font-bold shadow-sm transition-all ${act.color}`}
                        >
                          {act.label}
                          <button
                            type="button"
                            onClick={act.onRemove}
                            className="hover:scale-110 text-slate-400 hover:text-red-500 font-bold transition-transform cursor-pointer ml-0.5"
                          >
                            ✕
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Botón de Restaurar Pieza Sana (MANTENIDO) */}
                <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex justify-between">
                  <button
                    type="button"
                    onClick={resetearDiente}
                    className="px-4 py-2 text-xs font-bold bg-red-50 dark:bg-red-950/20 text-red-600 border border-red-200 dark:border-red-900/30 rounded-xl hover:bg-red-100 transition-colors cursor-pointer"
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
                className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-md transition-all hover:scale-[1.02] cursor-pointer"
              >
                Listo / Confirmar
              </button>
            </div>

          </div>
        </div>
      )}
    </>
  );

  if (isMaximized && isMounted) {
    return createPortal(
      <div className="fixed inset-0 bg-slate-950/75 backdrop-blur-md z-[9999] flex items-center justify-center p-4">
        <div className="w-full max-w-7xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-3xl p-6 shadow-2xl space-y-6 select-none transition-colors overflow-y-auto max-h-[95vh] relative">
          <button
            type="button"
            onClick={() => setIsMaximized(false)}
            className="absolute right-6 top-6 p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 hover:text-slate-750 transition-colors z-[1000] cursor-pointer"
            title="Cerrar pantalla completa"
          >
            <X className="h-5 w-5" />
          </button>
          {innerContent}
        </div>
      </div>,
      document.body
    );
  }

  return (
    <div className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-3xl p-6 shadow-xl space-y-6 select-none transition-colors">
      {innerContent}
    </div>
  );
};
