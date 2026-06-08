/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import React, { useState, useEffect } from "react";
import { Plus, Trash2, Receipt, Tag, AlertCircle, CheckCircle2 } from "lucide-react";
import { PROCEDIMIENTOS_CONFIG } from "@/components/odontograma/odontograma-config";

export interface CatalogProcedure {
  id: string;
  nombre_procedimiento: string;
  costo_base: number;
}

export interface SelectedProcedure {
  id: string;
  procedimiento_id: string;
  nombre_procedimiento: string;
  piezas: string;       // Piezas seleccionadas, ej: "14, 15"
  cantidad: number;      // Cantidad de piezas u operaciones
  notas: string;
  costo_final: number;   // Costo total pactado para la línea
}

interface PresupuestoCalculadorProps {
  catalogo: CatalogProcedure[];
  initialProcedures?: SelectedProcedure[];
  initialAdelanto?: number;
  onSubmit: (data: {
    procedimientos: SelectedProcedure[];
    total: number;
    adelanto: number;
    saldo: number;
  }) => void;
  onCancel?: () => void;
  activeSelectedTeeth?: number[];
  onActiveSelectedTeethChange?: (teeth: number[]) => void;
  onProceduresChange?: (procs: SelectedProcedure[]) => void;
  onActiveProcedureChange?: (nombre: string | null) => void;
}

export const PresupuestoCalculador: React.FC<PresupuestoCalculadorProps> = ({
  catalogo,
  initialProcedures = [],
  initialAdelanto = 0,
  onSubmit,
  onCancel,
  activeSelectedTeeth = [],
  onActiveSelectedTeethChange,
  onProceduresChange,
  onActiveProcedureChange,
}) => {
  const [selectedProcedures, setSelectedProcedures] = useState<SelectedProcedure[]>(initialProcedures);
  const [adelanto, setAdelanto] = useState<number>(initialAdelanto);
  
  // Variables locales del procedimiento en edición
  const [nuevoProcId, setNuevoProcId] = useState<string>("");
  const [nuevoCostoUnitario, setNuevoCostoUnitario] = useState<number>(0);
  const [nuevoCostoTotal, setNuevoCostoTotal] = useState<number>(0);
  const [cantidad, setCantidad] = useState<number>(1);
  const [piezasTexto, setPiezasTexto] = useState<string>("");
  const [nuevasNotas, setNuevasNotas] = useState<string>("");

  // Obtener la configuración del procedimiento seleccionado
  const selectedCatalogItem = catalogo.find((p) => p.id === nuevoProcId);
  const selectedConfig = selectedCatalogItem 
    ? PROCEDIMIENTOS_CONFIG[selectedCatalogItem.nombre_procedimiento]
    : null;

  // Notificar al padre cuando cambian los procedimientos agregados
  useEffect(() => {
    if (onProceduresChange) {
      onProceduresChange(selectedProcedures);
    }
  }, [selectedProcedures, onProceduresChange]);

  // Notificar al padre cuando cambia el procedimiento seleccionado en el dropdown
  useEffect(() => {
    if (onActiveProcedureChange) {
      onActiveProcedureChange(selectedCatalogItem?.nombre_procedimiento || null);
    }
  }, [selectedCatalogItem, onActiveProcedureChange]);

  // Reactivamente actualizar costo unitario y habilitar campos al cambiar procedimiento
  useEffect(() => {
    if (selectedCatalogItem) {
      setTimeout(() => {
        setNuevoCostoUnitario(selectedCatalogItem.costo_base);
        
        // Si el procedimiento NO requiere pieza ni cantidad (costo único)
        if (selectedConfig && !selectedConfig.requierePieza && !selectedConfig.requiereCantidad) {
          setCantidad(1);
          if (onActiveSelectedTeethChange) onActiveSelectedTeethChange([]);
          setPiezasTexto("");
        } else if (selectedConfig && selectedConfig.requierePieza) {
          // Inicializar cantidad con las piezas seleccionadas activamente
          setCantidad(activeSelectedTeeth.length > 0 ? activeSelectedTeeth.length : 1);
        }
      }, 0);
    } else {
      setTimeout(() => {
        setNuevoCostoUnitario(0);
        setCantidad(1);
        setPiezasTexto("");
        if (onActiveSelectedTeethChange) onActiveSelectedTeethChange([]);
      }, 0);
    }
  }, [nuevoProcId, selectedCatalogItem]);

  // Sincronizar piezas del odontograma hacia el input de texto de piezas y cantidad
  useEffect(() => {
    if (selectedConfig && selectedConfig.requierePieza) {
      setTimeout(() => {
        setPiezasTexto(activeSelectedTeeth.join(", "));
        setCantidad(activeSelectedTeeth.length > 0 ? activeSelectedTeeth.length : 1);
      }, 0);
    }
  }, [activeSelectedTeeth, selectedConfig]);

  // Recalcular costo total reactivamente
  useEffect(() => {
    setTimeout(() => {
      setNuevoCostoTotal(nuevoCostoUnitario * cantidad);
    }, 0);
  }, [nuevoCostoUnitario, cantidad]);

  // Manejar cambio manual en el input de piezas dentales
  const handlePiezasManualChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setPiezasTexto(value);
    
    if (onActiveSelectedTeethChange) {
      // Parsear texto (ej: "14, 15" -> [14, 15])
      const parsedTeeth = value
        .split(",")
        .map((s) => parseInt(s.trim()))
        .filter((num) => !isNaN(num) && num >= 11 && num <= 85);
      onActiveSelectedTeethChange(parsedTeeth);
    }
  };

  // Cálculos financieros globales
  const total = selectedProcedures.reduce((acc, curr) => acc + curr.costo_final, 0);
  const saldo = total - adelanto;

  // Agregar item
  const handleAgregarProcedimiento = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nuevoProcId || !selectedCatalogItem) {
      alert("Por favor selecciona un procedimiento del catálogo.");
      return;
    }

    const nuevoItem: SelectedProcedure = {
      id: Math.random().toString(36).substring(2, 9),
      procedimiento_id: selectedCatalogItem.id,
      nombre_procedimiento: selectedCatalogItem.nombre_procedimiento,
      piezas: selectedConfig?.requierePieza ? piezasTexto.trim() : "",
      cantidad: selectedConfig?.requiereCantidad || selectedConfig?.requierePieza ? cantidad : 1,
      notas: nuevasNotas.trim(),
      costo_final: nuevoCostoTotal >= 0 ? nuevoCostoTotal : 0,
    };

    setSelectedProcedures((prev) => [...prev, nuevoItem]);
    
    // Limpiar campos
    setNuevoProcId("");
    setNuevasNotas("");
    setCantidad(1);
    setPiezasTexto("");
    if (onActiveSelectedTeethChange) onActiveSelectedTeethChange([]);
  };

  // Eliminar item
  const handleEliminarProcedimiento = (id: string) => {
    setSelectedProcedures((prev) => prev.filter((p) => p.id !== id));
  };

  // Editar costo final de una fila
  const handleCostoFilaChange = (id: string, nuevoCosto: number) => {
    setSelectedProcedures((prev) =>
      prev.map((p) => (p.id === id ? { ...p, costo_final: nuevoCosto >= 0 ? nuevoCosto : 0 } : p))
    );
  };

  // Enviar presupuesto al padre
  const handleGuardarPresupuesto = () => {
    if (selectedProcedures.length === 0) {
      alert("Por favor agrega al menos un procedimiento al presupuesto.");
      return;
    }
    onSubmit({
      procedimientos: selectedProcedures,
      total,
      adelanto,
      saldo,
    });
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-6">
      
      {/* SECCIÓN 1: FORMULARIO DE INSERCIÓN */}
      <div className="bg-slate-50/50 dark:bg-slate-900/10 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
        <div className="flex items-center gap-3 border-b border-slate-200/50 dark:border-slate-800 pb-3">
          <div className="p-2 bg-teal-500/10 rounded-lg text-teal-600 dark:text-teal-400">
            <Plus className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">Registrar Procedimiento Clínico</h3>
            <p className="text-[11px] text-slate-500">Seleccione un procedimiento y asigne sus piezas y cantidades correspondientes.</p>
          </div>
        </div>

        <form onSubmit={handleAgregarProcedimiento} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
            {/* Selector de Procedimiento */}
            <div className="md:col-span-2 space-y-1.5">
              <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Procedimiento Clínico</label>
              <select
                value={nuevoProcId}
                onChange={(e) => setNuevoProcId(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl py-2.5 px-3 text-xs font-bold text-slate-800 dark:text-slate-150 focus:border-teal-500 focus:outline-none"
              >
                <option value="">-- Seleccione un procedimiento --</option>
                {catalogo.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.nombre_procedimiento} (Base: s/. {p.costo_base})
                  </option>
                ))}
              </select>
            </div>

            {/* Dientes / Piezas (Sólo si requierePieza es true) */}
            {(!selectedConfig || selectedConfig.requierePieza) && (
              <div className="space-y-1.5 transition-all">
                <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Piezas Dentales {selectedConfig?.requierePieza && "*"}
                </label>
                <input
                  type="text"
                  placeholder="Ej: 18, 46 o marque arriba"
                  value={piezasTexto}
                  onChange={handlePiezasManualChange}
                  disabled={!nuevoProcId}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl py-2.5 px-3 text-xs font-bold text-slate-800 dark:text-slate-150 focus:border-teal-500 focus:outline-none disabled:opacity-50"
                />
              </div>
            )}

            {/* Cantidad (Sólo si requiereCantidad o requierePieza es true) */}
            {(!selectedConfig || selectedConfig.requiereCantidad || selectedConfig.requierePieza) && (
              <div className="space-y-1.5 transition-all">
                <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Cantidad</label>
                <input
                  type="number"
                  value={cantidad}
                  onChange={(e) => setCantidad(Math.max(1, parseInt(e.target.value) || 1))}
                  min="1"
                  disabled={!nuevoProcId}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl py-2.5 px-3 text-xs font-bold text-slate-800 dark:text-slate-150 focus:border-teal-500 focus:outline-none disabled:opacity-50"
                />
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
            {/* Notas Clínicas */}
            <div className="md:col-span-2 space-y-1.5">
              <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Notas o Indicaciones</label>
              <input
                type="text"
                placeholder="Notas específicas para esta sesión..."
                value={nuevasNotas}
                onChange={(e) => setNuevasNotas(e.target.value)}
                disabled={!nuevoProcId}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl py-2.5 px-3 text-xs font-bold text-slate-800 dark:text-slate-150 focus:border-teal-500 focus:outline-none disabled:opacity-50"
              />
            </div>

            {/* Costo Calculado */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Costo Estimado (s/.)</label>
              <input
                type="number"
                value={nuevoCostoTotal || ""}
                onChange={(e) => setNuevoCostoTotal(Math.max(0, parseFloat(e.target.value) || 0))}
                min="0"
                step="0.1"
                disabled={!nuevoProcId}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl py-2.5 px-3 text-xs font-extrabold text-slate-850 dark:text-slate-150 focus:border-teal-500 focus:outline-none disabled:opacity-50"
              />
            </div>

            <button
              type="submit"
              disabled={!nuevoProcId}
              className="w-full bg-teal-600 hover:bg-teal-700 disabled:bg-slate-200 disabled:dark:bg-slate-800 disabled:text-slate-400 text-white font-bold py-2.5 rounded-xl transition-all shadow-sm flex items-center justify-center gap-1 cursor-pointer hover:scale-[1.01]"
            >
              <Plus className="h-4 w-4" /> Agregar Item
            </button>
          </div>
        </form>
      </div>

      {/* SECCIÓN 2: DETALLE DEL PRESUPUESTO */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
        <div className="flex items-center gap-3 border-b border-slate-200/50 dark:border-slate-800 pb-3">
          <div className="p-2 bg-teal-500/10 rounded-lg text-teal-600 dark:text-teal-400">
            <Receipt className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">Presupuesto del Plan de Tratamiento</h3>
            <p className="text-[11px] text-slate-500 font-medium">Conceptos médicos y balances financieros acordados</p>
          </div>
        </div>

        {selectedProcedures.length === 0 ? (
          <div className="text-center py-8 text-slate-400 border border-dashed border-slate-200 dark:border-slate-800 rounded-xl">
            <AlertCircle className="h-9 w-9 mx-auto text-slate-300 mb-1 animate-pulse" />
            <p className="text-xs font-semibold">No se han registrado procedimientos aún.</p>
            <p className="text-[10px] text-slate-450 mt-0.5">Seleccione un elemento arriba para comenzar.</p>
          </div>
        ) : (
          <div className="space-y-5">
            {/* Tabla */}
            <div className="overflow-x-auto rounded-xl border border-slate-150 dark:border-slate-800">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-850 text-slate-500 font-bold uppercase tracking-wider">
                    <th className="p-3">Procedimiento</th>
                    <th className="p-3 text-center">Piezas</th>
                    <th className="p-3 text-center">Cant.</th>
                    <th className="p-3">Notas</th>
                    <th className="p-3 text-right">Costo Final</th>
                    <th className="p-3 text-center w-10">Eliminar</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-150 dark:divide-slate-800">
                  {selectedProcedures.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-850/50 transition-colors">
                      <td className="p-3 font-bold text-slate-800 dark:text-slate-150">{item.nombre_procedimiento}</td>
                      <td className="p-3 text-center font-extrabold text-teal-600 dark:text-teal-400">{item.piezas || "--"}</td>
                      <td className="p-3 text-center font-bold text-slate-600 dark:text-slate-400">{item.cantidad}</td>
                      <td className="p-3 text-slate-500 dark:text-slate-450 font-medium">{item.notas || "--"}</td>
                      <td className="p-3 text-right">
                        <div className="inline-flex items-center bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-2 py-1">
                          <span className="text-[10px] text-slate-400 mr-1 font-bold">s/.</span>
                          <input
                            type="number"
                            value={item.costo_final}
                            onChange={(e) => handleCostoFilaChange(item.id, parseFloat(e.target.value) || 0)}
                            min="0"
                            step="1"
                            className="w-16 text-right bg-transparent focus:outline-none font-bold text-slate-800 dark:text-slate-150"
                          />
                        </div>
                      </td>
                      <td className="p-3 text-center">
                        <button
                          type="button"
                          onClick={() => handleEliminarProcedimiento(item.id)}
                          className="text-slate-400 hover:text-red-500 p-1 rounded hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Balances */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              
              {/* Total */}
              <div className="bg-teal-500/5 dark:bg-emerald-950/10 p-4 rounded-xl border border-teal-500/10 flex flex-col justify-between">
                <div>
                  <span className="text-[10px] font-bold text-teal-600 dark:text-emerald-450 uppercase tracking-widest">Total Presupuestado</span>
                  <p className="text-xl font-black text-teal-700 dark:text-emerald-400 mt-1">s/. {total.toFixed(2)}</p>
                </div>
                <span className="text-[9px] text-slate-400 font-bold block mt-1"><Tag className="h-3 w-3 inline mr-1" /> Costo total estimado del plan.</span>
              </div>

              {/* Adelanto */}
              <div className="bg-slate-50 dark:bg-slate-850 p-4 rounded-xl border border-slate-200 dark:border-slate-800 flex flex-col justify-between">
                <div>
                  <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Adelanto Recibido</label>
                  <input
                    type="number"
                    value={adelanto || ""}
                    onChange={(e) => setAdelanto(Math.min(total, parseFloat(e.target.value) || 0))}
                    placeholder="Monto adelanto"
                    min="0"
                    max={total}
                    step="0.01"
                    className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl py-2 px-3 text-sm font-extrabold text-slate-800 dark:text-slate-150 mt-1 focus:border-teal-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Saldo */}
              <div className={`p-4 rounded-xl border flex flex-col justify-between ${
                saldo > 0 ? "bg-yellow-500/5 border-yellow-500/10" : "bg-emerald-500/5 border-emerald-500/10"
              }`}>
                <div>
                  <span className={`text-[10px] font-bold uppercase tracking-widest ${
                    saldo > 0 ? "text-yellow-600 dark:text-yellow-450" : "text-emerald-600 dark:text-emerald-450"
                  }`}>Saldo Restante</span>
                  <p className={`text-xl font-black mt-1 ${
                    saldo > 0 ? "text-yellow-600 dark:text-yellow-450" : "text-emerald-600 dark:text-emerald-400"
                  }`}>s/. {saldo.toFixed(2)}</p>
                </div>
                <span className="text-[9px] text-slate-400 font-bold block mt-1">
                  {saldo > 0 ? "✓ Saldo a liquidar en citas." : "✓ Pago completado al 100%."}
                </span>
              </div>

            </div>
          </div>
        )}
      </div>

      {/* Controles de Envío */}
      <div className="flex justify-end gap-3 items-center">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="px-5 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-250 text-slate-700 dark:text-slate-350 text-xs font-bold rounded-xl transition-all"
          >
            Cancelar
          </button>
        )}
        <button
          type="button"
          onClick={handleGuardarPresupuesto}
          disabled={selectedProcedures.length === 0}
          className="px-6 py-2.5 bg-teal-600 hover:bg-teal-700 disabled:bg-slate-200 disabled:dark:bg-slate-800 disabled:text-slate-400 text-white text-xs font-bold rounded-xl transition-all shadow-md cursor-pointer"
        >
          Guardar Tratamiento y Costos
        </button>
      </div>

    </div>
  );
};
