"use client";

import React from "react";
import { FaceState, ToothState } from "./odontograma";
import { DIAGNOSTICOS_CONFIG, PROCEDIMIENTOS_CONFIG } from "./odontograma-config";

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
  // Determinar colores de caras
  const getFaceColorClass = (cara: keyof ToothState["caras"]) => {
    // Si estamos en modo final (proyectado), la caries del inicial
    // que tenga asignada una curación (compuesta o simple) debe verse curada (azul).
    const estadoInicial = diente.caras[cara];
    const hasCuracionSimple = diente.procedimientoMarkings?.curacion_simple;
    const hasCuracionCompuesta = diente.procedimientoMarkings?.curacion_compuesta;

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
        return "fill-white dark:fill-slate-900 stroke-slate-200 dark:stroke-slate-800 hover:fill-slate-100 dark:hover:fill-slate-800";
    }
  };

  const handleFaceClick = (e: React.MouseEvent, face: keyof ToothState["caras"]) => {
    e.stopPropagation();
    if (readOnly) return;
    if (diente.ausente || diente.diagnosticos?.edentulo) return;
    if (onFaceClick) onFaceClick(face);
  };

  // --- VARIABLES CLÍNICAS (DIAGNÓSTICO INICIAL Y PROCEDIMIENTOS) ---
  const diag = diente.diagnosticos || {};
  const proc = diente.procedimientoMarkings || {};

  // 1. Edéntulo / Ausente Inicial
  const esEdentuloInicial = diag.edentulo || diente.ausente;
  
  // 2. Extracciones planificadas (Procedimiento)
  const esExtraccionPlanificada = proc.extraccion_simple || proc.extraccion_compleja || proc.cirugia_3m;

  // 3. Amalgama (pinta de azulino el diente en el odontograma final o de tratamiento)
  const esAmalgama = proc.amalgama || (diag.incrustacion === "bueno" ? false : false); // custom checks
  const esCompuestaRojo = proc.curacion_compuesta;

  // Fondo del diente según procedimientos de cobertura completa
  let toothBackgroundClass = "";
  if (esCompuestaRojo) {
    toothBackgroundClass = "fill-red-500/20";
  } else if (esAmalgama) {
    toothBackgroundClass = "fill-blue-200/50 dark:fill-blue-950/30";
  }

  // Colección de iniciales a mostrar en el centro del diente
  const initialsList: string[] = [];

  // Diagnósticos iniciales
  if (diag.remanente) initialsList.push("RR");
  if (diag.macrodoncia) initialsList.push("MAC");
  if (diag.microdoncia) initialsList.push("MIC");
  if (diag.incrustacion) initialsList.push("IM");
  if (diag.incrustacion_estetica) initialsList.push("IE");
  if (diag.movilidad) initialsList.push("M1");

  // Procedimientos aplicados (solo en modo tratamiento o final)
  if (mode !== "diagnostic") {
    if (proc.curacion_simple) initialsList.push("PT");
    if (proc.curacion_compuesta) initialsList.push("CC");
    if (proc.reconstruccion_coronaria) initialsList.push("RC");
    if (proc.extraccion_compleja) initialsList.push("EC");
    if (proc.cirugia_3m) initialsList.push("3M");
    if (proc.endodoncia_anterior) initialsList.push("EA");
    if (proc.endodoncia_posterior) initialsList.push("EP");
    if (proc.corona_porcelana) initialsList.push("CP");
    if (proc.corona_circonio) initialsList.push("CC");
    if (proc.corona_ceramica) initialsList.push("CC");
    if (proc.corona_venner_ceramico) initialsList.push("CVC");
    if (proc.corona_venner_ivocrom) initialsList.push("CVI");
    if (proc.perno_munon) initialsList.push("Pm");
    if (proc.perno_fibra_vidrio) initialsList.push("Pv");
    if (proc.perno_circonio) initialsList.push("Pc");
    if (proc.pulpotomia) initialsList.push("PT");
    if (proc.pulpectomia) initialsList.push("PC");
    if (proc.implante) initialsList.push("IMP");
    if (proc.amalgama) initialsList.push("AM");
    if (proc.resina) initialsList.push("R");
  }

  return (
    <div
      onClick={onSelect}
      className={`relative flex flex-col items-center p-2.5 rounded-2xl border transition-all duration-200 cursor-pointer ${
        isSelected
          ? "bg-teal-50 dark:bg-emerald-950/40 border-teal-500 ring-2 ring-teal-500/20 shadow-md scale-105"
          : "bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-850 hover:border-teal-500/30 dark:hover:border-emerald-500/30 hover:shadow-sm"
      } ${esEdentuloInicial ? "opacity-60" : ""}`}
    >
      {/* Número del Diente */}
      <span className="text-[11px] font-extrabold text-slate-500 dark:text-slate-400 mb-1">
        {diente.numero}
      </span>

      {/* SVG de la pieza dental (60x60) */}
      <div className="relative w-14 h-14 overflow-visible">
        <svg viewBox="0 0 60 60" className="w-full h-full select-none overflow-visible">
          {/* Fondo por amalgama o curación compuesta */}
          {toothBackgroundClass && (
            <rect x="0" y="0" width="60" height="60" className={toothBackgroundClass} rx="4" />
          )}

          {/* Diente Ausente Inicial (Aspa Azul) */}
          {esEdentuloInicial ? (
            <>
              <line x1="5" y1="5" x2="55" y2="55" stroke="#2563eb" strokeWidth="4" strokeLinecap="round" />
              <line x1="55" y1="5" x2="5" y2="55" stroke="#2563eb" strokeWidth="4" strokeLinecap="round" />
            </>
          ) : (
            <>
              {/* Dibujo de Caras si NO está ausente */}
              {/* Cara Vestibular (V) - Arriba */}
              <polygon
                points="5,5 55,5 40,20 20,20"
                className={`transition-all duration-150 cursor-pointer stroke-[1.5] ${getFaceColorClass("V")}`}
                onClick={(e) => handleFaceClick(e, "V")}
              />

              {/* Cara Distal (D) - Derecha */}
              <polygon
                points="55,5 55,55 40,40 40,20"
                className={`transition-all duration-150 cursor-pointer stroke-[1.5] ${getFaceColorClass("D")}`}
                onClick={(e) => handleFaceClick(e, "D")}
              />

              {/* Cara Lingual (L) - Abajo */}
              <polygon
                points="20,40 40,40 55,55 5,55"
                className={`transition-all duration-150 cursor-pointer stroke-[1.5] ${getFaceColorClass("L")}`}
                onClick={(e) => handleFaceClick(e, "L")}
              />

              {/* Cara Mesial (M) - Izquierda */}
              <polygon
                points="5,5 20,20 20,40 5,55"
                className={`transition-all duration-150 cursor-pointer stroke-[1.5] ${getFaceColorClass("M")}`}
                onClick={(e) => handleFaceClick(e, "M")}
              />

              {/* Cara Oclusal (O) - Centro */}
              <rect
                x="20"
                y="20"
                width="20"
                height="20"
                className={`transition-all duration-150 cursor-pointer stroke-[1.5] ${getFaceColorClass("O")}`}
                onClick={(e) => handleFaceClick(e, "O")}
              />
            </>
          )}

          {/* --- CAPAS DE DIAGNÓSTICOS ADICIONALES --- */}

          {/* 1. Fractura de Pieza (Línea roja diagonal en zigzag) */}
          {diag.fractura && (
            <path
              d="M 5,12 L 20,25 L 35,15 L 55,30"
              fill="none"
              stroke="#ef4444"
              strokeWidth="3.5"
              strokeLinecap="round"
            />
          )}

          {/* 2. Giroversión (Se dibuja al final para estar al frente) */}

          {/* 3. Diastema (Paréntesis azules a los lados) */}
          {diag.diastema && (
            <>
              {/* Paréntesis izquierdo */}
              <path
                d="M 1,15 A 25,25 0 0,0 1,45"
                fill="none"
                stroke="#2563eb"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
              {/* Paréntesis derecho */}
              <path
                d="M 59,15 A 25,25 0 0,1 59,45"
                fill="none"
                stroke="#2563eb"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
            </>
          )}

          {/* --- CAPAS DE PROCEDIMIENTOS (Sólo modo tratamiento/final) --- */}
          {mode !== "diagnostic" && (
            <>
              {/* A. Extracción Planificada (Aspa Roja) */}
              {esExtraccionPlanificada && (
                <>
                  <line x1="2" y1="2" x2="58" y2="58" stroke="#ef4444" strokeWidth="4.5" strokeLinecap="round" />
                  <line x1="58" y1="2" x2="2" y2="58" stroke="#ef4444" strokeWidth="4.5" strokeLinecap="round" />
                </>
              )}

              {/* B. Endodoncia (Línea central vertical por la raíz) */}
              {(proc.endodoncia_anterior || proc.endodoncia_posterior) && (
                <line
                  x1="30"
                  y1="5"
                  x2="30"
                  y2="55"
                  stroke={proc.endodoncia_anterior === "buena" ? "#2563eb" : "#ef4444"}
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  strokeDasharray="2,2"
                />
              )}

              {/* C. Corona (Círculo segmentado amarillo/naranja alrededor) */}
              {(proc.corona_porcelana || proc.corona_circonio || proc.corona_ceramica || proc.corona_venner_ceramico || proc.corona_venner_ivocrom || proc.corona_jacket) && (
                <circle
                  cx="30"
                  cy="30"
                  r="27"
                  fill="transparent"
                  stroke="#ea580c"
                  strokeWidth="2.5"
                  strokeDasharray="4,4"
                />
              )}

              {/* D. Sellante (Llena el centro y coloca una S) */}
              {proc.sellante && (
                <g>
                  <rect x="21" y="21" width="18" height="18" fill="#3b82f6" rx="2" opacity="0.85" />
                  <text x="30" y="34" textAnchor="middle" fontSize="13" fontWeight="900" fill="#ffffff">S</text>
                </g>
              )}
            </>
          )}

          {/* Giroversión dibujada al final para estar en primer plano */}
          {diag.giroversion && (
            <>
              {diag.giroversion === "derecha" ? (
                <g>
                  <path
                    d="M 15,4 A 18,18 0 0,1 45,4"
                    fill="none"
                    stroke="#0ea5e9"
                    strokeWidth="3.5"
                    strokeLinecap="round"
                  />
                  <polygon points="45,4 40,0 42,7" fill="#0ea5e9" />
                </g>
              ) : (
                <g>
                  <path
                    d="M 45,4 A 18,18 0 0,0 15,4"
                    fill="none"
                    stroke="#0ea5e9"
                    strokeWidth="3.5"
                    strokeLinecap="round"
                  />
                  <polygon points="15,4 20,0 18,7" fill="#0ea5e9" />
                </g>
              )}
            </>
          )}
        </svg>
      </div>

      {/* Mini etiquetas de texto debajo de la pieza (para diagnósticos múltiples) */}
      <div className="flex flex-wrap gap-0.5 mt-1 min-h-[14px] items-center justify-center max-w-[70px]">
        {diag.fractura && <span className="text-[7px] font-extrabold text-red-500 bg-red-50 dark:bg-red-950/20 px-0.5 rounded leading-none">FR</span>}
        {diag.giroversion && <span className="text-[7px] font-extrabold text-sky-500 bg-sky-50 dark:bg-sky-950/20 px-0.5 rounded leading-none">GV</span>}
        {diag.diastema && <span className="text-[7px] font-extrabold text-blue-600 bg-blue-50 dark:bg-blue-950/20 px-0.5 rounded leading-none">DI</span>}
        {esEdentuloInicial && <span className="text-[7px] font-extrabold text-blue-500 bg-blue-50 dark:bg-blue-950/20 px-0.5 rounded leading-none">AUS</span>}
        {mode !== "diagnostic" && esExtraccionPlanificada && <span className="text-[7px] font-extrabold text-red-600 bg-red-50 dark:bg-red-950/20 px-0.5 rounded leading-none">EXT</span>}
        {initialsList.map((initial, idx) => (
          <span
            key={idx}
            className={`text-[7px] font-extrabold px-0.5 rounded leading-none ${
              initial === "IM" && diag.incrustacion === "malo" ? "text-red-650 bg-red-50 dark:bg-red-950/20" :
              initial === "IE" && diag.incrustacion_estetica === "malo" ? "text-red-650 bg-red-50 dark:bg-red-950/20" :
              initial === "AM" && proc.amalgama === "malo" ? "text-red-650 bg-red-50 dark:bg-red-950/20" :
              initial === "R" && proc.resina === "malo" ? "text-red-655 bg-red-50 dark:bg-red-950/20" :
              ["IM", "IE", "AM", "R", "MAC", "MIC", "ED"].includes(initial) ? "text-blue-650 bg-blue-50 dark:bg-blue-950/20" :
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
