"use client";

import React, { useState, useEffect } from "react";
import { Plus, Trash2, DollarSign, Receipt, Tag, AlertCircle, CheckCircle2 } from "lucide-react";

export interface CatalogProcedure {
  id: string;
  nombre_procedimiento: string;
  costo_base: number;
}

export interface SelectedProcedure {
  id: string; // Identificador temporal/único de la fila
  procedimiento_id: string;
  nombre_procedimiento: string;
  diente_numero?: number;
  notas: string;
  costo_final: number;
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
}

export const PresupuestoCalculador: React.FC<PresupuestoCalculadorProps> = ({
  catalogo,
  initialProcedures = [],
  initialAdelanto = 0,
  onSubmit,
  onCancel,
}) => {
  const [selectedProcedures, setSelectedProcedures] = useState<SelectedProcedure[]>(initialProcedures);
  const [adelanto, setAdelanto] = useState<number>(initialAdelanto);
  
  // Variables locales del nuevo procedimiento que se va a agregar
  const [nuevoProcId, setNuevoProcId] = useState<string>("");
  const [nuevoDiente, setNuevoDiente] = useState<string>("");
  const [nuevoCosto, setNuevoCosto] = useState<number>(0);
  const [nuevasNotas, setNuevasNotas] = useState<string>("");

  // Actualizar costo sugerido al cambiar el procedimiento seleccionado en el selector
  useEffect(() => {
    if (nuevoProcId) {
      const proc = catalogo.find((p) => p.id === nuevoProcId);
      if (proc) {
        setNuevoCosto(proc.costo_base);
      }
    } else {
      setNuevoCosto(0);
    }
  }, [nuevoProcId, catalogo]);

  // Cálculos financieros reactivos
  const total = selectedProcedures.reduce((acc, curr) => acc + curr.costo_final, 0);
  const saldo = total - adelanto;

  // Agregar procedimiento a la lista
  const handleAgregarProcedimiento = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nuevoProcId) {
      alert("Por favor selecciona un procedimiento del catálogo.");
      return;
    }

    const procCatalog = catalogo.find((p) => p.id === nuevoProcId);
    if (!procCatalog) return;

    const nuevoItem: SelectedProcedure = {
      id: Math.random().toString(36).substring(2, 9),
      procedimiento_id: procCatalog.id,
      nombre_procedimiento: procCatalog.nombre_procedimiento,
      diente_numero: nuevoDiente ? parseInt(nuevoDiente) || undefined : undefined,
      notas: nuevasNotas.trim(),
      costo_final: nuevoCosto >= 0 ? nuevoCosto : 0,
    };

    setSelectedProcedures((prev) => [...prev, nuevoItem]);
    
    // Limpiar campos de inserción
    setNuevoProcId("");
    setNuevoDiente("");
    setNuevoCosto(0);
    setNuevasNotas("");
  };

  // Eliminar procedimiento de la lista
  const handleEliminarProcedimiento = (id: string) => {
    setSelectedProcedures((prev) => prev.filter((p) => p.id !== id));
  };

  // Cambiar el costo final de un procedimiento ya agregado
  const handleCostoFilaChange = (id: string, nuevoCosto: number) => {
    setSelectedProcedures((prev) =>
      prev.map((p) => (p.id === id ? { ...p, costo_final: nuevoCosto >= 0 ? nuevoCosto : 0 } : p))
    );
  };

  const handleGuardarPresupuesto = () => {
    if (selectedProcedures.length === 0) {
      alert("Por favor agrega al menos un procedimiento al presupuesto del tratamiento.");
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
    <div className="space-y-8 max-w-4xl mx-auto pb-12">
      
      {/* SECCIÓN 1: FORMULARIO DE AÑADIDURA DINÁMICA */}
      <div className="bg-slate-50/50 dark:bg-slate-950/20 border border-slate-200/80 dark:border-slate-850/80 rounded-2xl p-5 shadow-sm space-y-5">
        <div className="flex items-center gap-3 border-b border-slate-200/40 dark:border-slate-800 pb-4">
          <div className="p-2.5 bg-teal-500/10 rounded-xl text-teal-600 dark:text-teal-400">
            <Plus className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">Registrar Procedimiento Clínico</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">Selecciona procedimientos del catálogo y personaliza costos</p>
          </div>
        </div>

        <form onSubmit={handleAgregarProcedimiento} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
          {/* Selector de Procedimiento */}
          <div className="md:col-span-2 space-y-2">
            <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Procedimiento del Catálogo</label>
            <select
              value={nuevoProcId}
              onChange={(e) => setNuevoProcId(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl py-3 px-4 text-sm font-semibold text-slate-800 dark:text-slate-150 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/10"
            >
              <option value="">-- Selecciona un procedimiento --</option>
              {catalogo.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.nombre_procedimiento} (Base: s/. {p.costo_base})
                </option>
              ))}
            </select>
          </div>

          {/* Diente Específico */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Pieza Dental (Opcional)</label>
            <input
              type="number"
              placeholder="Ej. 18 o 46"
              value={nuevoDiente}
              onChange={(e) => setNuevoDiente(e.target.value)}
              min="11"
              max="85"
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl py-3 px-4 text-sm font-semibold text-slate-800 dark:text-slate-150 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/10"
            />
          </div>

          {/* Costo Acordado */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Costo Pactado (s/.)</label>
            <input
              type="number"
              placeholder="s/."
              value={nuevoCosto || ""}
              onChange={(e) => setNuevoCosto(parseFloat(e.target.value) || 0)}
              min="0"
              step="0.01"
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl py-3 px-4 text-sm font-semibold text-slate-800 dark:text-slate-150 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/10"
            />
          </div>

          {/* Notas */}
          <div className="md:col-span-3 space-y-2">
            <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Notas Clínicas o de Sesión</label>
            <input
              type="text"
              placeholder="Indicaciones adicionales (Ej: curación con resina 3M, endodoncia de urgencia)"
              value={nuevasNotas}
              onChange={(e) => setNuevasNotas(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl py-3 px-4 text-sm font-semibold text-slate-800 dark:text-slate-150 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/10"
            />
          </div>

          {/* Botón Agregar */}
          <div className="md:col-span-1">
            <button
              type="submit"
              className="w-full bg-teal-600 hover:bg-teal-700 text-white font-bold py-3 rounded-xl transition-all shadow-md flex items-center justify-center gap-1 hover:scale-[1.02] cursor-pointer"
            >
              <Plus className="h-4 w-4" /> Agregar Item
            </button>
          </div>
        </form>
      </div>

      {/* SECCIÓN 2: DETALLE DEL PRESUPUESTO ACTUAL Y CÁLCULOS */}
      <div className="bg-slate-50/50 dark:bg-slate-950/20 border border-slate-200/80 dark:border-slate-850/80 rounded-2xl p-5 shadow-sm space-y-5">
        <div className="flex items-center gap-3 border-b border-slate-200/40 dark:border-slate-800 pb-4">
          <div className="p-2.5 bg-teal-500/10 rounded-xl text-teal-600 dark:text-teal-400">
            <Receipt className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">Plan de Tratamiento y Presupuesto</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">Detalle financiero y estado de saldo actual</p>
          </div>
        </div>

        {selectedProcedures.length === 0 ? (
          <div className="text-center py-8 text-slate-400 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl">
            <AlertCircle className="h-10 w-10 mx-auto text-slate-300 mb-2 animate-bounce" />
            <p className="text-sm font-medium">No se han registrado procedimientos aún.</p>
            <p className="text-xs text-slate-450 mt-1">Selecciona un elemento arriba para comenzar a estructurar el presupuesto.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Tabla de Procedimientos Agregados */}
            <div className="overflow-x-auto rounded-2xl border border-slate-100 dark:border-slate-800">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-850 text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider">
                    <th className="p-4">Procedimiento</th>
                    <th className="p-4 text-center">Pieza Dental</th>
                    <th className="p-4">Notas</th>
                    <th className="p-4 text-right">Costo Pactado</th>
                    <th className="p-4 text-center w-12">Acción</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-sm">
                  {selectedProcedures.map((proc) => (
                    <tr key={proc.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-850/50 transition-colors">
                      <td className="p-4 font-bold text-slate-800 dark:text-slate-150">
                        {proc.nombre_procedimiento}
                      </td>
                      <td className="p-4 text-center font-extrabold text-teal-605 dark:text-teal-400">
                        {proc.diente_numero ? `# ${proc.diente_numero}` : "--"}
                      </td>
                      <td className="p-4 text-slate-500 dark:text-slate-400 font-medium">
                        {proc.notas || <span className="italic text-slate-300 dark:text-slate-700">Sin notas</span>}
                      </td>
                      <td className="p-4 text-right">
                        <div className="inline-flex items-center bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-2 py-1">
                          <span className="text-xs text-slate-400 mr-1 font-bold">s/.</span>
                          <input
                            type="number"
                            value={proc.costo_final}
                            onChange={(e) => handleCostoFilaChange(proc.id, parseFloat(e.target.value) || 0)}
                            min="0"
                            step="0.1"
                            className="w-20 text-right bg-transparent focus:outline-none font-bold text-slate-800 dark:text-slate-150 text-sm focus:border-teal-500 focus:ring-1 focus:ring-teal-500/10"
                          />
                        </div>
                      </td>
                      <td className="p-4 text-center">
                        <button
                          type="button"
                          onClick={() => handleEliminarProcedimiento(proc.id)}
                          className="text-slate-400 hover:text-red-500 p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Ficha Resumen de Costos y Balance de Saldo */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              
              {/* TOTAL COSTO GENERAL */}
              <div className="bg-gradient-to-br from-teal-50/50 to-teal-100/30 dark:from-emerald-950/20 dark:to-emerald-900/10 p-5 rounded-2xl border border-teal-100 dark:border-emerald-900/50 flex flex-col justify-between">
                <div>
                  <span className="text-xs font-bold text-teal-600 dark:text-emerald-400 uppercase tracking-widest">Total del Presupuesto</span>
                  <p className="text-[28px] font-black text-teal-700 dark:text-emerald-450 mt-1 flex items-baseline gap-1">
                    <span className="text-lg font-bold">s/.</span>
                    {total.toFixed(2)}
                  </p>
                </div>
                <div className="text-[10px] text-teal-600 dark:text-emerald-400 mt-2 font-medium flex items-center gap-1">
                  <Tag className="h-3 w-3" /> Suma total de procedimientos agregados.
                </div>
              </div>

              {/* ADELANTO RECIBIDO */}
              <div className="bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl flex flex-col justify-between">
                <div>
                  <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Adelanto / Pago a Cuenta</label>
                  <div className="relative mt-2">
                    <span className="absolute left-3.5 top-3.5 text-slate-400 font-bold text-sm">s/.</span>
                    <input
                      type="number"
                      value={adelanto || ""}
                      onChange={(e) => setAdelanto(parseFloat(e.target.value) || 0)}
                      placeholder="Monto de Adelanto"
                      min="0"
                      max={total}
                      step="0.01"
                      className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl py-3 pl-9 pr-4 text-lg font-extrabold text-slate-800 dark:text-slate-150 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/10"
                    />
                  </div>
                </div>
                <div className="text-[10px] text-slate-500 mt-2 font-medium">
                  Ingrese el pago parcial recibido en esta sesión.
                </div>
              </div>

              {/* SALDO PENDIENTE */}
              <div className="bg-gradient-to-br from-yellow-50/70 to-yellow-100/30 dark:from-yellow-950/10 dark:to-yellow-900/5 p-5 rounded-2xl border border-yellow-100 dark:border-yellow-900/30 flex flex-col justify-between">
                <div>
                  <span className="text-xs font-bold text-yellow-650 dark:text-yellow-450 uppercase tracking-widest">Saldo Pendiente (Deuda)</span>
                  <p className={`text-[28px] font-black mt-1 flex items-baseline gap-1 ${
                    saldo > 0 ? "text-yellow-600 dark:text-yellow-450" : "text-emerald-600 dark:text-emerald-400"
                  }`}>
                    <span className="text-lg font-bold">s/.</span>
                    {saldo.toFixed(2)}
                  </p>
                </div>
                <div className="text-[10px] mt-2 font-medium flex items-center gap-1 text-yellow-750 dark:text-yellow-450">
                  {saldo > 0 ? (
                    <>
                      <AlertCircle className="h-3 w-3" />
                      Debe ser cancelado al finalizar.
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="h-3 w-3 text-emerald-500" />
                      <span className="text-emerald-600">Presupuesto cancelado al 100%.</span>
                    </>
                  )}
                </div>
              </div>

            </div>
          </div>
        )}
      </div>

      {/* BOTONES DE CONTROL */}
      <div className="flex justify-end items-center gap-4">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-350 text-sm font-bold rounded-xl transition-all"
          >
            Cancelar
          </button>
        )}
        <button
          type="button"
          onClick={handleGuardarPresupuesto}
          disabled={selectedProcedures.length === 0}
          className="px-8 py-3 bg-teal-650 disabled:bg-slate-200 disabled:dark:bg-slate-850 disabled:text-slate-400 hover:bg-teal-700 text-white text-sm font-bold rounded-xl shadow-lg shadow-teal-500/10 hover:shadow-teal-500/20 transition-all hover:scale-[1.02] cursor-pointer"
        >
          Guardar Tratamiento y Costos
        </button>
      </div>

    </div>
  );
};
