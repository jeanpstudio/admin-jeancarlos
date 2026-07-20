"use client";

import React from "react";
import { FaceState, ToothState } from "./odontograma";
import { DEFAULT_TOOTH_PATHS, TOOTH_PATHS_OVERRIDES } from "./tooth-paths-config";

interface DienteSVGProps {
  diente: ToothState;
  isSelected: boolean;
  onSelect: () => void;
  onFaceClick?: (face: keyof ToothState["caras"]) => void;
  readOnly?: boolean;
  mode?: "diagnostic" | "treatment" | "final";
}

export const DienteSVG: React.FC<DienteSVGProps> = ({
  diente,
  isSelected,
  onSelect,
  onFaceClick,
  readOnly = false,
  mode = "treatment",
}) => {
  // --- VARIABLES CLÍNICAS (DIAGNÓSTICO INICIAL Y PROCEDIMIENTOS) ---
  const diag = diente.diagnosticos || {};
  const proc = diente.procedimientoMarkings || {};

  // 1. Edéntulo / Ausente Inicial
  const esEdentuloInicial = diag.edentulo || diente.ausente;
  
  // 2. Extracciones planificadas (Procedimiento)
  const esExtraccionPlanificada = proc.extraccion_simple || proc.extraccion_compleja || proc.cirugia_3m;

  // Determinar si es diente superior (isUpper)
  // Superior si el primer dígito es 1, 2, 5 o 6
  const isUpper = [1, 2, 5, 6].includes(Math.floor(diente.numero / 10));

  // Determinar tipo de diente por anatomía dental
  const getToothType = (numero: number) => {
    const digit = numero % 10;
    if ([8, 7, 6].includes(digit)) return "molar";
    if ([5, 4].includes(digit)) return "premolar";
    return "incisivo"; // 3, 2, 1 son incisivos/caninos
  };

  // Determinar colores de caras para el control interactivo
  const getFaceColorClass = (cara: keyof ToothState["caras"]) => {
    const estadoInicial = diente.caras[cara];
    const hasCuracionSimple = proc.curacion_simple;
    const hasCuracionCompuesta = proc.curacion_compuesta;

    if (mode === "final" && (hasCuracionSimple || hasCuracionCompuesta)) {
      if (estadoInicial === "caries") {
        return "fill-blue-500 stroke-blue-700 hover:fill-blue-600";
      }
    }

    switch (estadoInicial) {
      case "caries":
        return "fill-red-500 stroke-red-700 hover:fill-red-600";
      case "curado":
        return "fill-blue-500 stroke-blue-700 hover:fill-blue-600";
      default:
        // Aumentamos la visibilidad de los bordes por defecto (stroke-slate-400 / dark:stroke-slate-500)
        return "fill-white dark:fill-slate-900 stroke-slate-400 dark:stroke-slate-500 hover:fill-slate-100 dark:hover:fill-slate-800";
    }
  };

  const handleFaceClick = (e: React.MouseEvent, face: keyof ToothState["caras"]) => {
    e.stopPropagation();
    if (readOnly) return;
    if (esEdentuloInicial) return;
    if (onFaceClick) onFaceClick(face);
  };

  // Dibujar el diente anatómico
  const renderAnatomicalTooth = () => {
    const type = getToothType(diente.numero);
    const hasCrown = !!(
      proc.corona_porcelana ||
      proc.corona_circonio ||
      proc.corona_ceramica ||
      proc.corona_venner_ceramico ||
      proc.corona_venner_ivocrom ||
      proc.corona_jacket
    );
    const hasEndo = !!(proc.endodoncia_anterior || proc.endodoncia_posterior || diag.endodoncia_inicial);
    const hasImplant = !!proc.implante;
    
    // Colores
    const outlineColor = isSelected 
      ? "stroke-teal-600 dark:stroke-emerald-400" 
      : "stroke-slate-400 dark:stroke-slate-500";
      
    const crownFill = hasCrown
      ? "fill-amber-400 dark:fill-amber-500 stroke-amber-600"
      : "fill-slate-50 dark:fill-slate-900";

    const rootFill = "fill-slate-50 dark:fill-slate-900";

    const endoColor = diag.endodoncia_inicial === "bueno" ? "#2563eb" : "#ef4444";

    // Cargar los trazados SVG desde la configuración configurable externa
    let toothPath = "";
    let crownPath = "";

    if (TOOTH_PATHS_OVERRIDES[diente.numero]) {
      toothPath = TOOTH_PATHS_OVERRIDES[diente.numero].toothPath;
      crownPath = TOOTH_PATHS_OVERRIDES[diente.numero].crownPath;
    } else {
      const key = `${isUpper ? 'upper' : 'lower'}_${type}` as keyof typeof DEFAULT_TOOTH_PATHS;
      toothPath = DEFAULT_TOOTH_PATHS[key].toothPath;
      crownPath = DEFAULT_TOOTH_PATHS[key].crownPath;
    }

    // Trazados para canales radiculares (endodoncias)
    let canals: React.ReactNode = null;
    if (hasEndo) {
      if (isUpper) {
        if (type === "molar") {
          canals = (
            <>
              <line x1="14" y1="20" x2="14" y2="35" stroke={endoColor} strokeWidth="3.2" strokeLinecap="round" />
              <line x1="20" y1="10" x2="20" y2="35" stroke={endoColor} strokeWidth="3.2" strokeLinecap="round" />
              <line x1="26" y1="16" x2="26" y2="35" stroke={endoColor} strokeWidth="3.2" strokeLinecap="round" />
            </>
          );
        } else if (type === "premolar") {
          canals = (
            <>
              <line x1="16" y1="13" x2="16" y2="35" stroke={endoColor} strokeWidth="3.2" strokeLinecap="round" />
              <line x1="22" y1="13" x2="22" y2="35" stroke={endoColor} strokeWidth="3.2" strokeLinecap="round" />
            </>
          );
        } else {
          canals = <line x1="20" y1="8" x2="20" y2="32" stroke={endoColor} strokeWidth="3.2" strokeLinecap="round" />;
        }
      } else {
        if (type === "molar") {
          canals = (
            <>
              <line x1="14" y1="18" x2="14" y2="35" stroke={endoColor} strokeWidth="3.2" strokeLinecap="round" />
              <line x1="20" y1="18" x2="20" y2="38" stroke={endoColor} strokeWidth="3.2" strokeLinecap="round" />
              <line x1="26" y1="18" x2="26" y2="35" stroke={endoColor} strokeWidth="3.2" strokeLinecap="round" />
            </>
          );
        } else if (type === "premolar") {
          canals = (
            <>
              <line x1="16" y1="16" x2="16" y2="35" stroke={endoColor} strokeWidth="3.2" strokeLinecap="round" />
              <line x1="22" y1="16" x2="22" y2="35" stroke={endoColor} strokeWidth="3.2" strokeLinecap="round" />
            </>
          );
        } else {
          canals = <line x1="20" y1="18" x2="20" y2="38" stroke={endoColor} strokeWidth="3.2" strokeLinecap="round" />;
        }
      }
    }

    let scaleClass = "";
    if (diag.macrodoncia) {
      scaleClass = " scale-110 origin-center transition-all duration-200";
    } else if (diag.microdoncia) {
      scaleClass = " scale-90 origin-center transition-all duration-200";
    }

    const overlayTexts: React.ReactNode[] = [];
    if (diag.remanente) {
      overlayTexts.push(
        <g key="rr-text" transform={isUpper ? "translate(20, 26) scale(1, -1)" : "translate(20, 26)"}>
          <text x="0" y="0" textAnchor="middle" dominantBaseline="middle" fill="#ef4444" fontSize="11" fontWeight="950" className="select-none pointer-events-none font-black">
            RR
          </text>
        </g>
      );
    }
    if (proc.rx) {
      overlayTexts.push(
        <g key="rx-text" transform={isUpper ? "translate(20, 26) scale(1, -1)" : "translate(20, 26)"}>
          <text x="0" y="0" textAnchor="middle" dominantBaseline="middle" fill="#2563eb" fontSize="11" fontWeight="950" className="select-none pointer-events-none font-black">
            RX
          </text>
        </g>
      );
    }

    return (
      <svg viewBox="0 0 40 52" className={`w-[32px] h-[41.6px] overflow-visible select-none my-0 transform transition-all duration-200 ${scaleClass} ${isUpper ? "scale-y-[-1]" : ""}`}>
        {hasImplant ? (
          <g>
            {/* Corona del implante */}
            <path d={crownPath} className={`${crownFill} ${outlineColor} stroke-[1.5]`} />
            {/* Tornillo metálico del implante */}
            {isUpper ? (
              <g>
                <rect x="16" y="8" width="8" height="24" fill="#94a3b8" className="stroke-slate-600 stroke-[1.5]" rx="1" />
                <line x1="16" y1="13" x2="24" y2="13" stroke="#475569" strokeWidth="1.5" />
                <line x1="16" y1="18" x2="24" y2="18" stroke="#475569" strokeWidth="1.5" />
                <line x1="16" y1="23" x2="24" y2="23" stroke="#475569" strokeWidth="1.5" />
                <line x1="16" y1="28" x2="24" y2="28" stroke="#475569" strokeWidth="1.5" />
              </g>
            ) : (
              <g>
                <rect x="16" y="18" width="8" height="24" fill="#94a3b8" className="stroke-slate-600 stroke-[1.5]" rx="1" />
                <line x1="16" y1="23" x2="24" y2="23" stroke="#475569" strokeWidth="1.5" />
                <line x1="16" y1="28" x2="24" y2="28" stroke="#475569" strokeWidth="1.5" />
                <line x1="16" y1="33" x2="24" y2="33" stroke="#475569" strokeWidth="1.5" />
                <line x1="16" y1="38" x2="24" y2="38" stroke="#475569" strokeWidth="1.5" />
              </g>
            )}
          </g>
        ) : (
          <g>
            {/* Silueta completa del diente (raíz + corona) */}
            <path d={toothPath} className={`${rootFill} ${outlineColor} stroke-[1.5]`} />
            
            {/* Si tiene corona protésica o amalgama (proyectado) pintamos la corona de dorado */}
            {hasCrown && (
              <path d={crownPath} className="fill-amber-400 dark:fill-amber-500 stroke-amber-600 stroke-[1.5]" />
            )}
            
            {/* Líneas de la endodoncia */}
            {canals}
          </g>
        )}

        {/* Fractura Straight Diagonal Line */}
        {diag.fractura && (
          <line
            x1="8"
            y1="2"
            x2="32"
            y2="50"
            stroke="#ef4444"
            strokeWidth="3.5"
            strokeLinecap="round"
          />
        )}

        {/* Diastema Side brackets */}
        {diag.diastema && (
          <>
            <path d="M 1,12 A 12,12 0 0,0 1,38" fill="none" stroke="#2563eb" strokeWidth="2.2" strokeLinecap="round" />
            <path d="M 39,12 A 12,12 0 0,1 39,38" fill="none" stroke="#2563eb" strokeWidth="2.2" strokeLinecap="round" />
          </>
        )}

        {/* Textos Superpuestos */}
        {overlayTexts}

        {/* Edéntulo inicial o Extracción planificada (Gran aspa azul o roja) */}
        {(esEdentuloInicial || esExtraccionPlanificada) && (
          <g>
            <line x1="2" y1="2" x2="38" y2="50" stroke={esExtraccionPlanificada ? "#ef4444" : "#2563eb"} strokeWidth="3.5" strokeLinecap="round" />
            <line x1="38" y1="2" x2="2" y2="50" stroke={esExtraccionPlanificada ? "#ef4444" : "#2563eb"} strokeWidth="3.5" strokeLinecap="round" />
          </g>
        )}

        {/* Giroversión Arrow */}
        {diag.giroversion && (
          <g fill="#0ea5e9">
            {diag.giroversion === "derecha" ? (
              <>
                <path d="M 10,25 A 10,10 0 0,1 30,25" fill="none" stroke="#0ea5e9" strokeWidth="2.5" strokeLinecap="round" />
                <polygon points="30,25 25,21 27,29" />
              </>
            ) : (
              <>
                <path d="M 30,25 A 10,10 0 0,0 10,25" fill="none" stroke="#0ea5e9" strokeWidth="2.5" strokeLinecap="round" />
                <polygon points="10,25 15,21 13,29" />
              </>
            )}
          </g>
        )}
      </svg>
    );
  };

  // Dibujar el control interactivo de caras (Cuadradito de 5 sectores con bordes bien visibles stroke-[1.5])
  const renderInteractiveCross = () => {
    if (esEdentuloInicial) {
      // Si el diente está ausente, mostramos una caja vacía para mantener la alineación vertical
      return <div className="w-8 h-8 opacity-0" />;
    }
    
    return (
      <svg viewBox="0 0 36 36" className="w-8 h-8 overflow-visible select-none">
        {/* Cara Vestibular (V) - Arriba */}
        <polygon
          points="2,2 34,2 25,11 11,11"
          className={`transition-all duration-150 cursor-pointer stroke-[1.5] ${getFaceColorClass("V")}`}
          onClick={(e) => handleFaceClick(e, "V")}
        />

        {/* Cara Distal (D) - Derecha */}
        <polygon
          points="34,2 34,34 25,25 25,11"
          className={`transition-all duration-150 cursor-pointer stroke-[1.5] ${getFaceColorClass("D")}`}
          onClick={(e) => handleFaceClick(e, "D")}
        />

        {/* Cara Lingual (L) - Abajo */}
        <polygon
          points="11,25 25,25 34,34 2,34"
          className={`transition-all duration-150 cursor-pointer stroke-[1.5] ${getFaceColorClass("L")}`}
          onClick={(e) => handleFaceClick(e, "L")}
        />

        {/* Cara Mesial (M) - Izquierda */}
        <polygon
          points="2,2 11,11 11,25 2,34"
          className={`transition-all duration-150 cursor-pointer stroke-[1.5] ${getFaceColorClass("M")}`}
          onClick={(e) => handleFaceClick(e, "M")}
        />

        {/* Cara Oclusal (O) - Centro */}
        <rect
          x="11"
          y="11"
          width="14"
          height="14"
          className={`transition-all duration-150 cursor-pointer stroke-[1.5] ${getFaceColorClass("O")}`}
          onClick={(e) => handleFaceClick(e, "O")}
        />
      </svg>
    );
  };

  // Colección de iniciales de diagnóstico a mostrar debajo
  const initialsList: string[] = [];
  if (diag.macrodoncia) initialsList.push("MAC");
  if (diag.microdoncia) initialsList.push("MIC");
  if (diag.incrustacion) initialsList.push("IM");
  if (diag.incrustacion_estetica) initialsList.push("IE");
  if (diag.movilidad) initialsList.push("M1");

  if (mode !== "diagnostic") {
    const procInitials: string[] = [];
    if (proc.curacion_simple) procInitials.push("PT");
    if (proc.curacion_compuesta) procInitials.push("CC");
    if (proc.reconstruccion_coronaria) procInitials.push("RC");
    if (proc.extraccion_compleja) procInitials.push("EC");
    if (proc.cirugia_3m) procInitials.push("3M");
    if (proc.endodoncia_anterior) procInitials.push("EA");
    if (proc.endodoncia_posterior) procInitials.push("EP");
    if (proc.corona_porcelana) procInitials.push("CP");
    if (proc.corona_circonio) procInitials.push("CC");
    if (proc.corona_ceramica) procInitials.push("CC");
    if (proc.corona_venner_ceramico) procInitials.push("CVC");
    if (proc.corona_venner_ivocrom) procInitials.push("CVI");
    if (proc.perno_munon) procInitials.push("PM");
    if (proc.perno_fibra_vidrio) procInitials.push("Pv");
    if (proc.perno_circonio) procInitials.push("Pc");
    if (proc.pulpotomia) procInitials.push("PT");
    if (proc.pulpectomia) procInitials.push("PC");
    if (proc.amalgama) procInitials.push("AM");
    if (proc.resina) procInitials.push("R");
    if (proc.sellante) procInitials.push("S");
    if (proc.carillas) procInitials.push("C");

    if (procInitials.length > 0) {
      initialsList.push(procInitials[0]);
    }
  }

  return (
    <div
      onClick={onSelect}
      className={`relative flex flex-col items-center p-2 rounded-2xl border transition-all duration-200 cursor-pointer ${
        isSelected
          ? "bg-teal-50 dark:bg-emerald-950/40 border-teal-500 ring-2 ring-teal-500/20 shadow-md scale-105"
          : "bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-850 hover:border-teal-500/30 dark:hover:border-emerald-500/30 hover:shadow-sm"
      } ${esEdentuloInicial ? "opacity-60" : ""}`}
    >
      {/* 1. Número del diente superior */}
      {isUpper && (
        <span className="text-[11px] font-extrabold text-slate-500 dark:text-slate-400 mb-1">
          {diente.numero}
        </span>
      )}

      {/* 2. Cuerpo del diente (Corona/Cruz siempre arriba, Raíz/Dibujo siempre abajo) */}
      <div className="flex flex-col items-center gap-0 w-[32px] select-none relative">
        {proc.corona_metalica && (
          <div className="absolute -top-3.5 bg-white dark:bg-slate-900 border border-slate-450 dark:border-slate-500 rounded px-0.5 text-[8px] font-black leading-none text-slate-800 dark:text-slate-200 z-10 shadow-sm">
            CM
          </div>
        )}
        {renderInteractiveCross()}
        <div className="-mt-[1px]">
          {renderAnatomicalTooth()}
        </div>
      </div>

      {/* 3. Número del diente inferior */}
      {!isUpper && (
        <span className="text-[11px] font-extrabold text-slate-500 dark:text-slate-400 mt-1">
          {diente.numero}
        </span>
      )}

      {/* 4. Mini etiquetas de diagnóstico/procedimientos */}
      <div className="flex flex-wrap gap-0.5 mt-1.5 min-h-[18px] items-center justify-center max-w-[80px]">
        {diag.fractura && <span className="text-[10px] font-extrabold text-red-500 bg-red-50 dark:bg-red-950/20 px-0.5 rounded leading-none">FR</span>}
        {diag.giroversion && <span className="text-[10px] font-extrabold text-sky-500 bg-sky-50 dark:bg-sky-950/20 px-0.5 rounded leading-none">GV</span>}
        {diag.diastema && <span className="text-[10px] font-extrabold text-blue-600 bg-blue-50 dark:bg-blue-950/20 px-0.5 rounded leading-none">DI</span>}
        {esEdentuloInicial && <span className="text-[10px] font-extrabold text-blue-500 bg-blue-50 dark:bg-blue-950/20 px-0.5 rounded leading-none">AUS</span>}
        {mode !== "diagnostic" && esExtraccionPlanificada && <span className="text-[10px] font-extrabold text-red-600 bg-red-50 dark:bg-red-950/20 px-0.5 rounded leading-none">EXT</span>}
        {initialsList.map((initial, idx) => (
          <span
            key={idx}
            className={`text-[10px] font-extrabold px-0.5 rounded leading-none ${
              initial === "IM" && diag.incrustacion === "malo" ? "text-red-600 bg-red-50 dark:bg-red-950/20" :
              initial === "IE" && diag.incrustacion_estetica === "malo" ? "text-red-600 bg-red-50 dark:bg-red-950/20" :
              initial === "AM" && proc.amalgama === "malo" ? "text-red-600 bg-red-50 dark:bg-red-950/20" :
              initial === "R" && proc.resina === "malo" ? "text-red-600 bg-red-50 dark:bg-red-950/20" :
              ["IM", "IE", "AM", "R", "MAC", "MIC", "ED", "S", "C", "PM", "Pv", "Pc", "PT", "PC"].includes(initial) ? "text-blue-600 bg-blue-50 dark:bg-blue-950/20" :
              "text-red-500 bg-red-50 dark:bg-red-950/20"
            }`}
          >
            {initial}
          </span>
        ))}
      </div>
    </div>
  );
};
