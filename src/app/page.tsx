"use client";

import React, { useState, useEffect } from "react";
import { 
  Home, 
  User,
  Users, 
  Activity, 
  Printer, 
  Plus, 
  RotateCcw,
  Sparkles,
  ArrowLeft,
  ChevronRight,
  ClipboardCheck,
  Edit3,
  Trash2,
  DollarSign,
  Search,
  PlusCircle,
  FileText,
  Calendar,
  ShieldAlert,
  ArrowUpRight,
  UserCheck2,
  Stethoscope,
  TrendingUp,
  HeartPulse,
  Mail,
  Phone,
  Briefcase,
  MapPin,
  CheckCircle2,
  AlertCircle,
  Sun,
  Moon,
  Save,
  Tag
} from "lucide-react";

import { Odontograma, OdontogramaState, ToothState, FaceState } from "@/components/odontograma/odontograma";
import { PresupuestoCalculador, CatalogProcedure, SelectedProcedure } from "@/components/tratamientos/presupuesto-calculador";
import { HistoriaClinicaForm, PacienteData } from "@/components/pacientes/historia-clinica-form";
import { createClient } from "@/utils/supabase/client";

export interface TreatmentSession {
  id: string;
  fecha: string;
  odontograma_estado: OdontogramaState;
  procedimientos: SelectedProcedure[];
  total: number;
  adelanto: number;
  saldo: number;
}

interface DienteImpresionProps {
  diente: ToothState;
}

const DienteImpresion: React.FC<DienteImpresionProps> = ({ diente }) => {
  const getFaceBg = (estado: FaceState) => {
    switch (estado) {
      case "caries":
        return "bg-red-500";
      case "curado":
        return "bg-blue-500";
      default:
        return "bg-white";
    }
  };

  return (
    <div className={`relative flex flex-col items-center p-0.5 border border-slate-200 w-9 h-11 rounded text-[7px] text-center select-none ${diente.ausente ? "bg-red-50/50" : "bg-white"}`}>
      <span className="font-extrabold text-slate-800 leading-none mb-0.5">{diente.numero}</span>
      {!diente.ausente ? (
        <div className="relative w-5 h-5 border border-slate-200 flex items-center justify-center">
          {/* Un mini-odontograma para imprimir: 5 cajitas de caras */}
          {/* Vestibular (Arriba) */}
          <span className={`absolute top-0 inset-x-0 h-1.5 border-b border-slate-200 ${getFaceBg(diente.caras.V)}`}></span>
          {/* Distal (Derecha) */}
          <span className={`absolute right-0 inset-y-0 w-1.5 border-l border-slate-200 ${getFaceBg(diente.caras.D)}`}></span>
          {/* Lingual (Abajo) */}
          <span className={`absolute bottom-0 inset-x-0 h-1.5 border-t border-slate-200 ${getFaceBg(diente.caras.L)}`}></span>
          {/* Mesial (Izquierda) */}
          <span className={`absolute left-0 inset-y-0 w-1.5 border-r border-slate-200 ${getFaceBg(diente.caras.M)}`}></span>
          {/* Oclusal (Centro) */}
          <span className={`w-2 h-2 border border-slate-200 ${getFaceBg(diente.caras.O)}`}></span>
        </div>
      ) : (
        <div className="relative w-5 h-5 flex items-center justify-center font-black text-red-650 text-[10px] leading-none">X</div>
      )}
      <div className="flex gap-0.5 text-[6px] font-bold leading-none mt-0.5">
        {diente.ausente && <span className="text-red-500 font-bold">A</span>}
        {diente.corona && <span className="text-yellow-600 font-bold">C</span>}
        {diente.endodoncia && <span className="text-purple-600 font-bold">E</span>}
      </div>
    </div>
  );
};

export default function HomeSPA() {
  // --- TEMAS Y PREFERENCIAS ---
  const [isDarkMode, setIsDarkMode] = useState(false);

  // --- ESTADOS GENERALES DE LA APLICACIÓN ---
  const [pacientes, setPacientes] = useState<PacienteData[]>([]);
  const [activeTab, setActiveTab] = useState<"inicio" | "pacientes" | "expediente">("inicio");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPacienteId, setSelectedPacienteId] = useState<string | null>(null);
  
  // Catálogo clínico dinámico
  const [catalogo, setCatalogo] = useState<CatalogProcedure[]>([]);
  
  // Modos de Ficha Paciente
  const [isEditingHistory, setIsEditingHistory] = useState(false);
  const [isRegisteringNewPaciente, setIsRegisteringNewPaciente] = useState(false);

  // Estados de Tratamientos del Paciente seleccionado
  const [tratamientos, setTratamientos] = useState<TreatmentSession[]>([]);
  
  // Odontograma y Calculador activos directamente en la Ficha
  const [nuevoOdontograma, setNuevoOdontograma] = useState<OdontogramaState>({});
  const [selectedTratamientoDetalle, setSelectedTratamientoDetalle] = useState<TreatmentSession | null>(null);
  
  // Estado Especial para Odontograma durante registro inicial
  const [registroOdontograma, setRegistroOdontograma] = useState<OdontogramaState>({});
  
  // Estado Especial de Impresión
  const [printingTratamiento, setPrintingTratamiento] = useState<TreatmentSession | null>(null);

  // =========================================================================
  // OPERACIONES CON SUPABASE (CONEXIÓN REAL A LA BASE DE DATOS)
  // =========================================================================
  const supabase = createClient();

  // 1. Obtener listado de pacientes desde Supabase
  const fetchPacientes = async () => {
    try {
      const { data, error } = await supabase
        .from("pacientes")
        .select("*")
        .order("nombre_completo", { ascending: true });
        
      if (!error && data) {
        setPacientes(data);
      } else {
        console.warn("Error al cargar pacientes de Supabase, recurriendo a localStorage:", error);
        loadLocalPacientesFallback();
      }
    } catch (e) {
      console.warn("Fallo de red al conectar con Supabase:", e);
      loadLocalPacientesFallback();
    }
  };

  // Cargar de LocalStorage si Supabase no está configurada aún o falla
  const loadLocalPacientesFallback = () => {
    const saved = localStorage.getItem("clinident_pacientes");
    if (saved) {
      setPacientes(JSON.parse(saved));
    } else {
      setPacientes([]); // Sin pacientes hardcodeados
    }
  };

  // 2. Obtener catálogo de procedimientos
  const fetchCatalogo = async () => {
    try {
      const { data, error } = await supabase
        .from("procedimientos_catalogo")
        .select("*")
        .order("nombre_procedimiento", { ascending: true });
      if (!error && data && data.length > 0) {
        setCatalogo(data);
      } else {
        // Fallback local con valores base
        setCatalogo([
          { id: "1", nombre_procedimiento: "Profilaxis Dental (Limpieza)", costo_base: 100.00 },
          { id: "2", nombre_procedimiento: "Restauración de Resina Simple (Curación)", costo_base: 120.00 },
          { id: "3", nombre_procedimiento: "Restauración de Resina Compleja", costo_base: 180.00 },
          { id: "4", nombre_procedimiento: "Endodoncia Unirradicular", costo_base: 350.00 },
          { id: "5", nombre_procedimiento: "Endodoncia Multirradicular", costo_base: 550.00 },
          { id: "6", nombre_procedimiento: "Extracción Dental Simple", costo_base: 150.00 },
          { id: "7", nombre_procedimiento: "Gingivectomía + Osteotomía (Por Mapeo)", costo_base: 250.00 },
          { id: "8", nombre_procedimiento: "Corona de Metal Porcelana", costo_base: 600.00 },
          { id: "9", nombre_procedimiento: "Corona de Zirconio", costo_base: 1200.00 },
          { id: "10", nombre_procedimiento: "Blanqueamiento LED", costo_base: 400.00 }
        ]);
      }
    } catch (e) {
      console.warn("Fallo de red al obtener catálogo de Supabase:", e);
    }
  };

  // 3. Obtener tratamientos por Paciente
  const fetchTratamientos = async (pacienteId: string) => {
    try {
      const { data, error } = await supabase
        .from("tratamientos_paciente")
        .select("*")
        .eq("paciente_id", pacienteId)
        .order("fecha", { ascending: false });

      if (!error && data) {
        const listadoConProcedimientos: TreatmentSession[] = [];
        for (const tr of data) {
          // Obtener los detalles asociados
          const { data: detalles } = await supabase
            .from("detalles_treatment")
            .select(`
              id,
              procedimiento_id,
              diente_numero,
              notas,
              costo_final,
              procedimientos_catalogo(nombre_procedimiento)
            `)
            .eq("tratamiento_paciente_id", tr.id);

          const procedimientosMapeados: SelectedProcedure[] = detalles ? detalles.map((d: any) => ({
            id: d.id,
            procedimiento_id: d.procedimiento_id,
            nombre_procedimiento: d.procedimientos_catalogo?.nombre_procedimiento || "Procedimiento",
            diente_numero: d.diente_numero || undefined,
            notas: d.notas || "",
            costo_final: Number(d.costo_final)
          })) : [];

          listadoConProcedimientos.push({
            id: tr.id,
            fecha: tr.fecha,
            odontograma_estado: tr.odontograma_estado as OdontogramaState,
            procedimientos: procedimientosMapeados,
            total: Number(tr.total_costo),
            adelanto: Number(tr.adelanto),
            saldo: Number(tr.saldo)
          });
        }
        setTratamientos(listadoConProcedimientos);
      } else {
        loadLocalTratamientosFallback(pacienteId);
      }
    } catch (e) {
      loadLocalTratamientosFallback(pacienteId);
    }
  };

  const loadLocalTratamientosFallback = (pacienteId: string) => {
    const saved = localStorage.getItem(`clinident_tratamientos_${pacienteId}`);
    if (saved) {
      setTratamientos(JSON.parse(saved));
    } else {
      setTratamientos([]);
    }
  };

  // Cargar catálogos y pacientes al iniciar
  useEffect(() => {
    fetchPacientes();
    fetchCatalogo();
  }, []);

  // Cargar tratamientos y sincronizar odontograma activo al cambiar el paciente seleccionado
  useEffect(() => {
    if (selectedPacienteId) {
      fetchTratamientos(selectedPacienteId);

      // Cargar el último odontograma guardado del paciente para que esté siempre activo y visible
      const ultimo = localStorage.getItem(`clinident_ultimo_odontograma_${selectedPacienteId}`);
      setNuevoOdontograma(ultimo ? JSON.parse(ultimo) : {});

      setSelectedTratamientoDetalle(null);
      setIsEditingHistory(false);
    }
  }, [selectedPacienteId]);

  // Sincronizar copias locales de historias en localStorage para robustez
  const syncLocalPacientes = (listado: PacienteData[]) => {
    localStorage.setItem("clinident_pacientes", JSON.stringify(listado));
  };

  // 4. Crear nuevo paciente (incluyendo su odontograma inicial)
  const handleCreatePaciente = async (data: PacienteData) => {
    try {
      const { data: newPatient, error } = await supabase
        .from("pacientes")
        .insert([data])
        .select()
        .single();

      if (!error && newPatient) {
        // Si el doctor mapeó un odontograma inicial de registro, guardamos esa sesión
        if (Object.keys(registroOdontograma).length > 0) {
          localStorage.setItem(`clinident_ultimo_odontograma_${newPatient.id}`, JSON.stringify(registroOdontograma));
          
          // Crear primer tratamiento de registro
          await supabase
            .from("tratamientos_paciente")
            .insert([{
              paciente_id: newPatient.id,
              odontograma_estado: registroOdontograma,
              total_costo: 0.00,
              adelanto: 0.00
            }]);
        }

        await fetchPacientes();
        setSelectedPacienteId(newPatient.id);
        setActiveTab("expediente");
      } else {
        console.warn("Fallo al insertar en Supabase, recurriendo a guardado local:", error);
        createPacienteLocalFallback(data);
      }
    } catch (e) {
      console.warn("Fallo de red al crear paciente:", e);
      createPacienteLocalFallback(data);
    }

    setIsRegisteringNewPaciente(false);
    setRegistroOdontograma({}); // Resetear
  };

  const createPacienteLocalFallback = (data: PacienteData) => {
    const nuevoPaciente: PacienteData = {
      ...data,
      id: Math.random().toString(36).substring(2, 9),
      fecha_registro: new Date().toISOString(),
    };
    const nuevoListado = [nuevoPaciente, ...pacientes];
    setPacientes(nuevoListado);
    syncLocalPacientes(nuevoListado);

    if (Object.keys(registroOdontograma).length > 0) {
      localStorage.setItem(`clinident_ultimo_odontograma_${nuevoPaciente.id!}`, JSON.stringify(registroOdontograma));
    }

    setSelectedPacienteId(nuevoPaciente.id!);
    setActiveTab("expediente");
  };

  // 5. Actualizar historia clínica en Supabase
  const handleUpdateHistory = async (updatedData: PacienteData) => {
    if (!selectedPacienteId) return;
    try {
      const { error } = await supabase
        .from("pacientes")
        .update(updatedData)
        .eq("id", selectedPacienteId);

      if (!error) {
        await fetchPacientes();
        setIsEditingHistory(false);
      } else {
        updateHistoryLocalFallback(updatedData);
      }
    } catch (e) {
      updateHistoryLocalFallback(updatedData);
    }
  };

  const updateHistoryLocalFallback = (updatedData: PacienteData) => {
    const nuevoListado = pacientes.map((p) => (p.id === selectedPacienteId ? { ...updatedData, id: selectedPacienteId } : p));
    setPacientes(nuevoListado);
    syncLocalPacientes(nuevoListado);
    setIsEditingHistory(false);
  };

  // 6. Eliminar un paciente
  const handleDeletePaciente = async (id: string) => {
    if (window.confirm("¿Seguro que deseas eliminar permanentemente a este paciente de la base de datos de Supabase y todas sus sesiones?")) {
      try {
        const { error } = await supabase
          .from("pacientes")
          .delete()
          .eq("id", id);

        if (!error) {
          await fetchPacientes();
          if (selectedPacienteId === id) {
            setSelectedPacienteId(null);
            setActiveTab("pacientes");
          }
        } else {
          deletePacienteLocalFallback(id);
        }
      } catch (e) {
        deletePacienteLocalFallback(id);
      }
    }
  };

  const deletePacienteLocalFallback = (id: string) => {
    const nuevoListado = pacientes.filter((p) => p.id !== id);
    setPacientes(nuevoListado);
    syncLocalPacientes(nuevoListado);
    localStorage.removeItem(`clinident_tratamientos_${id}`);
    localStorage.removeItem(`clinident_ultimo_odontograma_${id}`);
    if (selectedPacienteId === id) {
      setSelectedPacienteId(null);
      setActiveTab("pacientes");
    }
  };

  // 7. Guardar sesión clínica (Odontograma + Procedimientos con Supabase)
  const handleSaveTreatment = async (costos: {
    procedimientos: SelectedProcedure[];
    total: number;
    adelanto: number;
    saldo: number;
  }) => {
    if (!selectedPacienteId) return;

    try {
      // A. Insertar cabecera de tratamiento
      const { data: newTr, error } = await supabase
        .from("tratamientos_paciente")
        .insert([{
          paciente_id: selectedPacienteId,
          odontograma_estado: nuevoOdontograma,
          total_costo: costos.total,
          adelanto: costos.adelanto
        }])
        .select()
        .single();

      if (!error && newTr) {
        // B. Insertar los procedimientos detallados asociados
        if (costos.procedimientos.length > 0) {
          const detallesParaInsertar = costos.procedimientos.map((p) => ({
            tratamiento_paciente_id: newTr.id,
            procedimiento_id: p.procedimiento_id,
            diente_numero: p.diente_numero || null,
            notas: p.notas || null,
            costo_final: p.costo_final
          }));

          const { error: errorDetalles } = await supabase
            .from("detalles_treatment")
            .insert(detallesParaInsertar);

          if (errorDetalles) {
            console.error("Error al insertar procedimientos detallados:", errorDetalles);
          }
        }

        // C. Actualizar y refrescar historial
        await fetchTratamientos(selectedPacienteId);
        localStorage.setItem(`clinident_ultimo_odontograma_${selectedPacienteId}`, JSON.stringify(nuevoOdontograma));
        alert("¡Ficha dental guardada con éxito en la base de datos de Supabase!");
      } else {
        console.warn("Fallo al registrar tratamiento en Supabase, recurriendo a offline fallback:", error);
        saveTreatmentLocalFallback(costos);
      }
    } catch (e) {
      console.warn("Fallo de red al registrar tratamiento:", e);
      saveTreatmentLocalFallback(costos);
    }
  };

  const saveTreatmentLocalFallback = (costos: {
    procedimientos: SelectedProcedure[];
    total: number;
    adelanto: number;
    saldo: number;
  }) => {
    const nuevaSesion: TreatmentSession = {
      id: Math.random().toString(36).substring(2, 9),
      fecha: new Date().toISOString(),
      odontograma_estado: nuevoOdontograma,
      procedimientos: [...costos.procedimientos],
      total: costos.total,
      adelanto: costos.adelanto,
      saldo: costos.saldo,
    };

    const nuevosTratamientos = [nuevaSesion, ...tratamientos];
    setTratamientos(nuevosTratamientos);
    localStorage.setItem(`clinident_tratamientos_${selectedPacienteId}`, JSON.stringify(nuevosTratamientos));
    localStorage.setItem(`clinident_ultimo_odontograma_${selectedPacienteId}`, JSON.stringify(nuevoOdontograma));
    alert("¡Sesión clínica guardada localmente (Modo Offline)!");
  };

  // 8. Eliminar tratamiento
  const handleDeleteTreatment = async (trId: string) => {
    if (!selectedPacienteId) return;
    if (window.confirm("¿Seguro que deseas eliminar permanentemente este tratamiento?")) {
      try {
        const { error } = await supabase
          .from("tratamientos_paciente")
          .delete()
          .eq("id", trId);

        if (!error) {
          await fetchTratamientos(selectedPacienteId);
          if (selectedTratamientoDetalle?.id === trId) {
            setSelectedTratamientoDetalle(null);
          }
        } else {
          deleteTreatmentLocalFallback(trId);
        }
      } catch (e) {
        deleteTreatmentLocalFallback(trId);
      }
    }
  };

  const deleteTreatmentLocalFallback = (trId: string) => {
    const filtrados = tratamientos.filter((t) => t.id !== trId);
    setTratamientos(filtrados);
    localStorage.setItem(`clinident_tratamientos_${selectedPacienteId}`, JSON.stringify(filtrados));
    if (selectedTratamientoDetalle?.id === trId) {
      setSelectedTratamientoDetalle(null);
    }
  };

  // Iniciar la vista de impresión del navegador
  const triggerPrintWindow = (tr: TreatmentSession) => {
    setPrintingTratamiento(tr);
    setTimeout(() => {
      window.print();
    }, 400);
  };

  // Filtrado de pacientes
  const filteredPacientes = pacientes.filter((p) =>
    p.nombre_completo.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.dni.includes(searchQuery)
  );

  const selectedPaciente = pacientes.find((p) => p.id === selectedPacienteId) || null;

  // --- RENDERING VISTA DE IMPRESIÓN ---
  if (printingTratamiento && selectedPaciente) {
    const tr = printingTratamiento;
    const dientesAdultoSup = [18, 17, 16, 15, 14, 13, 12, 11, 21, 22, 23, 24, 25, 26, 27, 28];
    const dientesAdultoInf = [48, 47, 46, 45, 44, 43, 42, 41, 31, 32, 33, 34, 35, 36, 37, 38];
    const dientesNinoSup = [55, 54, 53, 52, 51, 61, 62, 63, 64, 65];
    const dientesNinoInf = [85, 84, 83, 82, 81, 71, 72, 73, 74, 75];

    const tieneDenticionInfantil = Object.keys(tr.odontograma_estado).some((key) => {
      const num = parseInt(key);
      const d = tr.odontograma_estado[num];
      const esInfantil = (num >= 51 && num <= 65) || (num >= 71 && num <= 85);
      return esInfantil && (d.ausente || d.corona || d.endodoncia || d.caras.V !== "limpio" || d.caras.O !== "limpio" || d.caras.M !== "limpio" || d.caras.D !== "limpio" || d.caras.L !== "limpio");
    });

    return (
      <div className="min-h-screen bg-white text-slate-900 p-8 font-sans max-w-[800px] mx-auto space-y-6">
        {/* Panel de control de salida de impresión (se oculta automáticamente en el papel con print:hidden) */}
        <div className="print:hidden flex justify-between items-center bg-slate-50 border border-slate-200 p-4 rounded-2xl mb-8">
          <button
            onClick={() => setPrintingTratamiento(null)}
            className="flex items-center gap-1 text-xs font-bold text-slate-650 hover:text-slate-900 transition-colors uppercase"
          >
            <ArrowLeft className="h-4 w-4" /> Volver al Dashboard
          </button>
          <button
            onClick={() => window.print()}
            className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-4 py-2 rounded-xl shadow-md"
          >
            <Printer className="h-4.5 w-4.5" /> Volver a Imprimir
          </button>
        </div>

        {/* Membrete Clínico */}
        <div className="flex justify-between items-start border-b-2 border-slate-900 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-slate-900 rounded-xl text-white">
              <Stethoscope className="h-8 w-8" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-slate-900 tracking-tight">Clínica Dental Zúñiga</h1>
              <span className="text-[9px] font-extrabold text-slate-500 uppercase tracking-widest block">Estética & Cirugía Dental Premium</span>
              <span className="text-[9px] font-semibold text-slate-450 block">Dr. Jean Carlos Zúñiga &bull; COP: 123456</span>
            </div>
          </div>
          <div className="text-right text-[10px] text-slate-500">
            <p className="font-bold text-slate-800 uppercase">Ficha de Plan de Tratamiento</p>
            <p>Fecha: {new Date(tr.fecha).toLocaleDateString("es-ES")}</p>
            <p>Hora: {new Date(tr.fecha).toLocaleTimeString("es-ES", {hour: '2-digit', minute:'2-digit'})}</p>
          </div>
        </div>

        {/* Datos Paciente */}
        <div className="border border-slate-900 p-4 rounded-xl space-y-3">
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider border-b border-slate-200 pb-1 flex items-center gap-1">
            <User className="h-3.5 w-3.5" /> Datos del Paciente e Historia Médica
          </h3>
          <div className="grid grid-cols-3 gap-2 text-[11px]">
            <div><span className="font-bold text-slate-400 block">Paciente:</span><span className="font-bold text-slate-800 text-xs">{selectedPaciente.nombre_completo}</span></div>
            <div><span className="font-bold text-slate-400 block">DNI:</span><span className="font-bold text-slate-800">{selectedPaciente.dni}</span></div>
            <div><span className="font-bold text-slate-400 block">Edad / Sexo:</span><span className="font-bold text-slate-800">{selectedPaciente.edad} años &bull; {selectedPaciente.sexo}</span></div>
            <div className="col-span-2"><span className="font-bold text-slate-400 block">Domicilio:</span><span className="font-semibold text-slate-700">{selectedPaciente.direccion || "No registrada"}</span></div>
            <div><span className="font-bold text-slate-400 block">Teléfono:</span><span className="font-semibold text-slate-700">{selectedPaciente.telefono || "No registrado"}</span></div>
          </div>
          {selectedPaciente.alergias && selectedPaciente.alergias.toLowerCase() !== "ninguna" && selectedPaciente.alergias.toLowerCase() !== "ninguno" && (
            <div className="p-2 bg-red-50 border border-red-200 rounded text-red-700 text-[10px] font-bold flex items-center gap-2">
              <ShieldAlert className="h-4 w-4 text-red-600" />
              <span>ALERTA MÉDICA: Reacciones de alergia severa a: {selectedPaciente.alergias}</span>
            </div>
          )}
        </div>

        {/* Odontograma Impresion */}
        <div className="border border-slate-900 p-4 rounded-xl space-y-4">
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider border-b border-slate-200 pb-1 flex items-center gap-1.5">
            <Activity className="h-3.5 w-3.5" /> Odontograma Clínico
          </h3>
          <div className="flex gap-4 text-[9px] font-bold justify-center border-b border-slate-100 pb-2">
            <div className="flex items-center gap-1"><span className="w-3.5 h-3.5 rounded border border-slate-400 bg-white"></span> Limpio</div>
            <div className="flex items-center gap-1 text-red-650"><span className="w-3.5 h-3.5 rounded border border-red-700 bg-red-500"></span> Caries</div>
            <div className="flex items-center gap-1 text-blue-650"><span className="w-3.5 h-3.5 rounded border border-blue-600 bg-blue-400"></span> Curado</div>
            <div className="flex items-center gap-1 text-red-500"><span className="w-3.5 h-3.5 rounded border border-red-200 bg-red-50 flex items-center justify-center font-bold text-[8px]">X</span> Ausente</div>
          </div>
          <div className="space-y-4">
            <div className="space-y-1">
              <span className="text-[8px] font-black text-slate-400 uppercase text-center block">Dentición Adulto</span>
              <div className="flex justify-center gap-0.5 border-b border-dashed border-slate-250 pb-2">
                {dientesAdultoSup.map((num) => (
                  <DienteImpresion key={num} diente={tr.odontograma_estado[num] || { numero: num, caras: { V: "limpio", O: "limpio", M: "limpio", D: "limpio", L: "limpio" }, ausente: false, corona: false, endodoncia: false }} />
                ))}
              </div>
              <div className="flex justify-center gap-0.5 pt-1.5">
                {dientesAdultoInf.map((num) => (
                  <DienteImpresion key={num} diente={tr.odontograma_estado[num] || { numero: num, caras: { V: "limpio", O: "limpio", M: "limpio", D: "limpio", L: "limpio" }, ausente: false, corona: false, endodoncia: false }} />
                ))}
              </div>
            </div>
            {tieneDenticionInfantil && (
              <div className="space-y-1 pt-3 border-t border-slate-200">
                <span className="text-[8px] font-black text-slate-400 uppercase text-center block">Dentición Infantil</span>
                <div className="flex justify-center gap-0.5 border-b border-dashed border-slate-250 pb-2">
                  {dientesNinoSup.map((num) => (
                    <DienteImpresion key={num} diente={tr.odontograma_estado[num] || { numero: num, caras: { V: "limpio", O: "limpio", M: "limpio", D: "limpio", L: "limpio" }, ausente: false, corona: false, endodoncia: false }} />
                  ))}
                </div>
                <div className="flex justify-center gap-0.5 pt-1.5">
                  {dientesNinoInf.map((num) => (
                    <DienteImpresion key={num} diente={tr.odontograma_estado[num] || { numero: num, caras: { V: "limpio", O: "limpio", M: "limpio", D: "limpio", L: "limpio" }, ausente: false, corona: false, endodoncia: false }} />
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Detalle Presupuesto */}
        <div className="border border-slate-900 rounded-xl overflow-hidden text-[10px]">
          <h3 className="text-xs font-bold text-white bg-slate-900 p-2 uppercase tracking-wider flex items-center gap-1">
            <FileText className="h-3.5 w-3.5" /> Tratamientos y Tarifas Pactadas
          </h3>
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-100 font-bold border-b border-slate-900">
                <th className="p-2">Procedimiento</th>
                <th className="p-2 text-center">Diente</th>
                <th className="p-2">Indicaciones</th>
                <th className="p-2 text-right">Costo</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-350">
              {tr.procedimientos.map((p: any, i: number) => (
                <tr key={i}>
                  <td className="p-2 font-bold">{p.nombre_procedimiento}</td>
                  <td className="p-2 text-center font-bold">{p.diente_numero ? `# ${p.diente_numero}` : "--"}</td>
                  <td className="p-2 text-slate-555">{p.notas || "--"}</td>
                  <td className="p-2 text-right font-bold">s/. {p.costo_final.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Resumen Balance */}
        <div className="flex justify-end">
          <div className="w-64 border border-slate-900 rounded-xl overflow-hidden text-xs">
            <div className="flex justify-between p-2 border-b border-slate-350"><span>Costo Total:</span><span className="font-bold">s/. {tr.total.toFixed(2)}</span></div>
            <div className="flex justify-between p-2 border-b border-slate-350 bg-slate-50"><span className="text-emerald-700">Adelantó:</span><span className="font-bold">s/. {tr.adelanto.toFixed(2)}</span></div>
            <div className="flex justify-between p-2 font-black bg-slate-100"><span>Saldo Restante:</span><span>s/. {tr.saldo.toFixed(2)}</span></div>
          </div>
        </div>

        {/* Firmas Consentimiento */}
        <div className="space-y-6 pt-6 border-t border-dashed border-slate-350 text-[9px] leading-tight text-slate-500">
          <p className="font-bold text-slate-800 uppercase">Consentimiento Informado:</p>
          <p>He sido informado detalladamente de las operaciones dentales, costos y balances pendientes. Expreso mi conformidad firmando a continuación.</p>
          <div className="grid grid-cols-2 gap-12 pt-8 text-[10px]">
            <div className="flex flex-col items-center justify-end h-20 text-center">
              <div className="w-40 border-b border-slate-900"></div>
              <span className="font-bold text-slate-800 mt-1">{selectedPaciente.nombre_completo}</span>
              <span className="text-slate-400 text-[8px]">Firma Paciente (DNI: {selectedPaciente.dni})</span>
            </div>
            <div className="flex flex-col items-center justify-end h-20 text-center">
              <div className="w-40 border-b border-slate-900"></div>
              <span className="font-bold text-slate-800 mt-1">Dr. Jean Carlos Zúñiga</span>
              <span className="text-slate-400 text-[8px]">Odontólogo Tratante (COP: 123456)</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // --- RENDERING APLICACIÓN PRINCIPAL (TABLERO) ---
  return (
    <div className={`min-h-screen flex font-sans select-none overflow-x-hidden transition-colors duration-250 ${
      isDarkMode 
        ? "bg-slate-950 text-slate-100 dark" 
        : "bg-slate-50 text-slate-800"
    }`}>
      
      {/* 1. SIDEBAR INCORPORADO (ZONA OPERATIVA CON COLOR CLINICO VERDE MEDICO) */}
      <aside className={`fixed inset-y-0 left-0 w-64 border-r p-6 flex flex-col justify-between z-20 transition-colors duration-250 ${
        isDarkMode 
          ? "bg-slate-900 border-slate-800 text-slate-300" 
          : "bg-teal-900 border-teal-955 text-teal-100"
      }`}>
        <div className="space-y-8">
          
          {/* Logo y Cabecera */}
          <div className="flex items-center justify-between px-2">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-xl shadow-lg transition-colors ${
                isDarkMode 
                  ? "bg-emerald-500/10 text-emerald-400" 
                  : "bg-amber-50 text-teal-950"
              }`}>
                <Stethoscope className="h-6 w-6" />
              </div>
              <div>
                <h1 className="font-extrabold text-white text-md tracking-tight leading-none">Clinident</h1>
                <span className={`text-[9px] font-bold uppercase tracking-widest block mt-0.5 ${isDarkMode ? "text-slate-500" : "text-teal-350"}`}>Ficha Clínica</span>
              </div>
            </div>
          </div>

          {/* Selector de Tema Claro / Oscuro */}
          <div className={`flex justify-between items-center p-2 rounded-xl ${
            isDarkMode ? "bg-slate-950 border border-slate-800" : "bg-teal-950/40 border border-teal-800/40"
          }`}>
            <span className="text-xs font-bold">Modo de pantalla</span>
            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              className={`p-1.5 rounded-lg transition-all ${
                isDarkMode ? "bg-slate-800 text-amber-400" : "bg-teal-800 text-amber-350 hover:bg-teal-750"
              }`}
              title="Cambiar tema de pantalla"
            >
              {isDarkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>
          </div>

          {/* Menú Operativo */}
          <nav className="space-y-1">
            <span className={`px-3 text-[10px] font-bold uppercase tracking-wider block mb-2 ${isDarkMode ? "text-slate-500" : "text-teal-350"}`}>Navegación</span>
            
            <button
              onClick={() => { setActiveTab("inicio"); setSelectedPacienteId(null); }}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all w-full text-left cursor-pointer ${
                activeTab === "inicio"
                  ? isDarkMode 
                    ? "bg-emerald-600 text-white shadow-lg" 
                    : "bg-yellow-400 text-teal-955 shadow-md font-black hover:bg-yellow-350"
                  : isDarkMode
                    ? "text-slate-400 hover:bg-slate-850 hover:text-slate-200"
                    : "text-teal-200 hover:bg-teal-850/80 hover:text-white"
              }`}
            >
              <Home className="h-4.5 w-4.5" /> Panel Principal
            </button>

            <button
              onClick={() => { setActiveTab("pacientes"); setSelectedPacienteId(null); }}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all w-full text-left cursor-pointer ${
                activeTab === "pacientes"
                  ? isDarkMode 
                    ? "bg-emerald-600 text-white shadow-lg" 
                    : "bg-yellow-400 text-teal-955 shadow-md font-black hover:bg-yellow-350"
                  : isDarkMode
                    ? "text-slate-400 hover:bg-slate-850 hover:text-slate-200"
                    : "text-teal-200 hover:bg-teal-850/80 hover:text-white"
              }`}
            >
              <Users className="h-4.5 w-4.5" /> Historias Clínicas
            </button>

            {selectedPaciente && (
              <button
                onClick={() => setActiveTab("expediente")}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all w-full text-left cursor-pointer ${
                  activeTab === "expediente"
                    ? isDarkMode 
                      ? "bg-emerald-600 text-white shadow-lg" 
                      : "bg-yellow-400 text-teal-955 shadow-md font-black hover:bg-yellow-350"
                    : isDarkMode
                      ? "text-slate-400 hover:bg-slate-850 hover:text-slate-200"
                      : "text-teal-200 hover:bg-teal-850/80 hover:text-white"
                }`}
              >
                <Activity className={`h-4.5 w-4.5 animate-pulse ${isDarkMode ? "text-emerald-400" : "text-teal-950"}`} /> Ficha: {selectedPaciente.nombre_completo.split(" ")[0]}
              </button>
            )}
          </nav>
        </div>

        {/* Footer Sidebar */}
        <div className={`space-y-4 pt-6 border-t ${isDarkMode ? "border-slate-800" : "border-teal-800"}`}>
          <div className="flex items-center gap-2.5 px-2">
            <div className={`h-9 w-9 rounded-full border flex items-center justify-center font-bold text-xs ${
              isDarkMode 
                ? "bg-slate-800 border-slate-700 text-emerald-400" 
                : "bg-teal-950 border-teal-800 text-amber-300"
            }`}>
              CD
            </div>
            <div>
              <p className="text-xs font-bold text-white leading-none">Jean Carlos Zúñiga</p>
              <span className={`text-[9px] font-semibold uppercase ${isDarkMode ? "text-slate-550":"text-teal-300"}`}>Odontólogo Tratante</span>
            </div>
          </div>
          <p className={`text-[9px] font-medium text-center ${isDarkMode ? "text-slate-600" : "text-teal-400"}`}>Ficha Clínica Zúñiga &copy; 2026</p>
        </div>
      </aside>

      {/* 2. AREA DE CONTENIDO PRINCIPAL */}
      <main className="flex-1 pl-64 min-h-screen flex flex-col relative">
        
        {/* Gradientes decorativos médicos */}
        <div className={`absolute top-0 -left-4 w-96 h-96 rounded-full mix-blend-multiply filter blur-[128px] opacity-10 transition-colors ${
          isDarkMode ? "bg-emerald-600" : "bg-teal-500"
        }`}></div>
        <div className={`absolute top-0 -right-4 w-96 h-96 rounded-full mix-blend-multiply filter blur-[128px] opacity-10 transition-colors ${
          isDarkMode ? "bg-amber-600" : "bg-emerald-400"
        }`}></div>

        <div className="p-8 max-w-7xl w-full mx-auto space-y-8 flex-1 z-10">
          
          {/* =============================================================== */}
          {/* VISTA 1: INICIO (CON COLORES VERDES MEDICOS Y AMARILLO) */}
          {/* =============================================================== */}
          {activeTab === "inicio" && (
            <div className="space-y-8 animate-[fadeIn_0.2s_ease-out]">
              
              {/* Tarjeta Bienvenida */}
              <div className={`p-8 rounded-3xl border shadow-xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 relative overflow-hidden transition-all duration-250 ${
                isDarkMode 
                  ? "bg-slate-900 border-slate-800 text-slate-100" 
                  : "bg-gradient-to-r from-teal-900 via-teal-850 to-emerald-950 border-teal-955 text-white shadow-2xl"
              }`}>
                <div className="space-y-2 z-10">
                  <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
                    isDarkMode 
                      ? "bg-emerald-500/20 border border-emerald-500/30 text-emerald-400" 
                      : "bg-yellow-400/20 border border-yellow-400/30 text-yellow-300"
                  }`}>
                    <Sparkles className="h-3 w-3 animate-pulse" /> Clínica Dental Zúñiga
                  </div>
                  <h2 className="text-3xl font-extrabold tracking-tight text-white dark:text-slate-100">¡Bienvenido, Dr. Jean Carlos Zúñiga!</h2>
                  <p className={`text-xs max-w-xl ${isDarkMode ? "text-slate-400" : "text-teal-150"}`}>
                    Sistema de expediente técnico para odontólogos. Modifique el odontograma de sus pacientes y genere presupuestos clínicos de forma fluida.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => { setActiveTab("pacientes"); setIsRegisteringNewPaciente(true); }}
                  className={`flex items-center justify-center gap-2 text-xs font-bold px-5 py-3 rounded-xl shadow-lg transition-all hover:scale-[1.03] cursor-pointer ${
                    isDarkMode 
                      ? "bg-emerald-600 hover:bg-emerald-500 text-white" 
                      : "bg-yellow-400 hover:bg-yellow-350 text-teal-955 font-black shadow-yellow-400/20"
                  }`}
                >
                  <PlusCircle className="h-4.5 w-4.5" /> Registrar Historia Clínica
                </button>
              </div>

              {/* Estadísticas */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                  { label: "Historias Clínicas", value: pacientes.length, icon: Users, color: isDarkMode ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/10" : "bg-teal-50 border-teal-100 text-teal-700" },
                  { label: "Tratamientos Activos", value: "14", icon: Activity, color: isDarkMode ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/10" : "bg-emerald-50 border-emerald-100 text-emerald-700" },
                  { label: "Cobros del Mes", value: "s/. 4,500.00", icon: DollarSign, color: isDarkMode ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/10" : "bg-teal-50 border-teal-100 text-teal-700" },
                  { label: "Saldo por Cobrar", value: "s/. 1,840.00", icon: TrendingUp, color: isDarkMode ? "bg-amber-500/10 text-amber-400 border-amber-500/10" : "bg-amber-50 border-amber-100 text-amber-700" }
                ].map((stat, i) => (
                  <div key={i} className={`p-6 border rounded-2xl flex flex-col justify-between shadow-md transition-colors ${
                    isDarkMode ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"
                  }`}>
                    <div className="flex justify-between items-start">
                      <div className={`p-3 rounded-xl border ${stat.color}`}><stat.icon className="h-5 w-5" /></div>
                      <span className={`text-[9px] font-bold uppercase tracking-widest ${isDarkMode ? "text-slate-500" : "text-slate-400"}`}>Admin <ArrowUpRight className="h-3 w-3" /></span>
                    </div>
                    <div className="mt-6 space-y-1">
                      <span className={`text-[10px] font-bold uppercase tracking-widest ${isDarkMode ? "text-slate-500" : "text-slate-450"}`}>{stat.label}</span>
                      <p className={`text-xl font-black ${isDarkMode ? "text-white" : "text-slate-850"}`}>{stat.value}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Agenda y Consultas */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className={`border rounded-3xl p-6 shadow-xl lg:col-span-2 space-y-6 transition-colors ${
                  isDarkMode ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"
                }`}>
                  <div className="flex justify-between items-center border-b pb-4 transition-colors border-slate-200/80 dark:border-slate-850">
                    <div>
                      <h3 className={`text-md font-bold flex items-center gap-2 ${isDarkMode ? "text-white" : "text-slate-800"}`}>
                        <Calendar className="h-5 w-5 text-teal-600 dark:text-emerald-500" /> Consultas de Hoy
                      </h3>
                      <p className="text-xs text-slate-500">Pacientes agendados y su motivo de consulta</p>
                    </div>
                    <span className={`text-[10px] font-bold px-3 py-1.5 rounded-full border ${
                      isDarkMode ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/10" : "bg-teal-50 text-teal-700 border-teal-100"
                    }`}>
                      Citas Agendadas
                    </span>
                  </div>
                  <div className="divide-y divide-slate-200 dark:divide-slate-850">
                    {pacientes.length === 0 ? (
                      <div className="py-8 text-center text-xs text-slate-450">No hay consultas registradas en Supabase aún.</div>
                    ) : (
                      pacientes.slice(0, 2).map((cita, i) => (
                        <div key={i} className={`py-4 flex justify-between items-center rounded-xl px-2 transition-colors ${
                          isDarkMode ? "hover:bg-slate-850/30" : "hover:bg-slate-50/50"
                        }`}>
                          <div className="flex gap-4 items-center">
                            <span className={`text-xs font-black px-2.5 py-1.5 rounded-lg border text-center min-w-[75px] ${
                              isDarkMode ? "text-emerald-400 bg-emerald-500/5 border-emerald-500/10" : "text-teal-750 bg-teal-500/5 border-teal-500/10"
                            }`}>{i === 0 ? "09:00 AM" : "11:30 AM"}</span>
                            <div>
                              <p className={`text-sm font-bold ${isDarkMode ? "text-slate-200" : "text-slate-800"}`}>{cita.nombre_completo}</p>
                              <p className="text-xs text-slate-550 truncate max-w-[320px]">{cita.motivo_consulta}</p>
                            </div>
                          </div>
                          <span className={`text-[9px] font-bold px-2 py-1 rounded-full border ${isDarkMode ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" : "bg-teal-50 text-teal-700 border-teal-100"}`}>{i === 0 ? "Tratamiento":"Limpieza"}</span>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* Pacientes Recientes */}
                <div className={`border rounded-3xl p-6 shadow-xl space-y-6 transition-colors ${
                  isDarkMode ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"
                }`}>
                  <div>
                    <h3 className={`text-md font-bold flex items-center gap-2 ${isDarkMode ? "text-white" : "text-slate-800"}`}>
                      <Sparkles className="h-5 w-5 text-teal-600 dark:text-emerald-500" /> Pacientes Recientes
                    </h3>
                    <p className="text-xs text-slate-500">Expedientes técnicos de acceso rápido</p>
                  </div>
                  <div className="space-y-3">
                    {pacientes.length === 0 ? (
                      <div className="py-6 text-center text-xs text-slate-450">Registra un paciente para comenzar.</div>
                    ) : (
                      pacientes.slice(0, 3).map((p) => (
                        <button
                          key={p.id}
                          onClick={() => { setSelectedPacienteId(p.id!); setActiveTab("expediente"); }}
                          className={`flex items-center justify-between p-3.5 border rounded-2xl w-full transition-all text-left group ${
                            isDarkMode 
                              ? "bg-slate-950 hover:bg-slate-850 border-slate-850" 
                              : "bg-slate-50 hover:bg-slate-100/80 border-slate-200"
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-lg ${isDarkMode ? "bg-emerald-500/10 text-emerald-400" : "bg-teal-500/10 text-teal-600"}`}><User className="h-4.5 w-4.5" /></div>
                            <div>
                              <h4 className={`text-xs font-bold group-hover:text-teal-600 dark:group-hover:text-emerald-400 transition-colors ${isDarkMode ? "text-slate-200" : "text-slate-850"}`}>{p.nombre_completo}</h4>
                              <p className="text-[9px] text-slate-550 truncate max-w-[150px]">DNI: {p.dni}</p>
                            </div>
                          </div>
                          <ChevronRight className="h-4 w-4 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
                        </button>
                      ))
                    )}
                  </div>
                </div>
              </div>

            </div>
          )}

          {/* =============================================================== */}
          {/* VISTA 2: LISTA DE PACIENTES (HISTORIAS CLINICAS) */}
          {/* =============================================================== */}
          {activeTab === "pacientes" && (
            <div className="space-y-8 animate-[fadeIn_0.2s_ease-out]">
              
              {/* Formulario Registro Nuevo Paciente (Con Odontograma Inicial Integrado) */}
              {isRegisteringNewPaciente ? (
                <div className={`border rounded-3xl p-6 shadow-xl space-y-6 animate-[scaleUp_0.18s_ease-out] transition-colors ${
                  isDarkMode ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"
                }`}>
                  <div className="flex justify-between items-center border-b pb-4 border-slate-200 dark:border-slate-850">
                    <div>
                      <h3 className={`text-lg font-bold flex items-center gap-2 ${isDarkMode ? "text-white" : "text-slate-800"}`}><User className="h-5 w-5 text-teal-600 dark:text-emerald-500" /> Registro Integrado de Ficha Médica</h3>
                      <p className="text-xs text-slate-500">Completa la historia clínica de filiación y dibuja el odontograma diagnóstico de ingreso</p>
                    </div>
                    <button onClick={() => { setIsRegisteringNewPaciente(false); setRegistroOdontograma({}); }} className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      isDarkMode ? "bg-slate-800 text-slate-350 hover:bg-slate-700" : "bg-slate-100 text-slate-650 hover:bg-slate-200"
                    }`}>Cancelar</button>
                  </div>
                  
                  {/* Grid de Creación: Formulario a la izquierda, Odontograma Inicial a la derecha */}
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                    
                    {/* Formulario Historia Clínica */}
                    <div className="lg:col-span-5">
                      <HistoriaClinicaForm onSubmit={handleCreatePaciente} onCancel={() => { setIsRegisteringNewPaciente(false); setRegistroOdontograma({}); }} />
                    </div>

                    {/* Odontograma Diagnóstico Inicial */}
                    <div className="lg:col-span-7 space-y-4">
                      <div className="p-4 bg-teal-500/5 dark:bg-emerald-500/5 border border-teal-500/10 dark:border-emerald-500/10 rounded-2xl">
                        <h4 className="text-xs font-bold text-teal-700 dark:text-emerald-400 flex items-center gap-1.5 uppercase tracking-wider">
                          <Activity className="h-4 w-4" /> Odontograma Diagnóstico de Ingreso
                        </h4>
                        <p className="text-[10px] text-slate-500 mt-1">
                          Mapee las caries y curaciones existentes descubiertas en el examen clínico inicial. Se guardará como el estado cero del paciente.
                        </p>
                      </div>
                      
                      <Odontograma 
                        key="odontograma-registro"
                        initialState={registroOdontograma} 
                        onChange={(s) => setRegistroOdontograma(s)} 
                      />
                    </div>

                  </div>
                </div>
              ) : (
                <>
                  {/* Cabecera */}
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                      <h2 className={`text-3xl font-extrabold flex items-center gap-2.5 ${isDarkMode ? "text-white" : "text-slate-800"}`}>
                        <Users className="h-7 w-7 text-teal-600 dark:text-emerald-500" /> Historias Clínicas
                      </h2>
                      <p className="text-xs text-slate-500">Pacientes clínicos y resumen de alergias médicas registradas</p>
                    </div>
                    <button
                      onClick={() => { setIsRegisteringNewPaciente(true); setRegistroOdontograma({}); }}
                      className={`flex items-center justify-center gap-2 text-xs font-bold px-5 py-3 rounded-xl shadow-lg transition-all hover:scale-[1.02] w-full sm:w-auto cursor-pointer ${
                        isDarkMode 
                          ? "bg-emerald-600 hover:bg-emerald-500 text-white" 
                          : "bg-yellow-400 hover:bg-yellow-350 text-teal-955 font-black shadow-yellow-400/20"
                      }`}
                    >
                      <PlusCircle className="h-4.5 w-4.5" /> Registrar Historia Clínica
                    </button>
                  </div>

                  {/* Buscador */}
                  <div className={`flex p-4 border rounded-2xl items-center gap-3 shadow-md transition-colors ${
                    isDarkMode ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"
                  }`}>
                    <Search className="h-5 w-5 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Buscar paciente por nombre completo o DNI..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className={`w-full bg-transparent text-sm font-semibold focus:outline-none placeholder-slate-450 ${
                        isDarkMode ? "text-slate-200" : "text-slate-700"
                      }`}
                    />
                  </div>

                  {/* Fichas */}
                  {filteredPacientes.length === 0 ? (
                    <div className={`text-center py-16 border rounded-3xl transition-colors ${
                      isDarkMode ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"
                    }`}>
                      <Users className="h-12 w-12 mx-auto text-slate-350 mb-2 animate-bounce" />
                      <p className="text-sm font-bold text-slate-450">No se encontraron pacientes en la base de datos</p>
                      <p className="text-xs text-slate-400 mt-1">Crea un paciente o inserta las semillas mediante SQL en Supabase.</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {filteredPacientes.map((p) => (
                        <div
                          key={p.id}
                          onClick={() => { setSelectedPacienteId(p.id!); setActiveTab("expediente"); }}
                          className={`group border rounded-3xl p-6 shadow-md hover:shadow-xl transition-all duration-200 cursor-pointer flex flex-col justify-between ${
                            isDarkMode 
                              ? "bg-slate-900 border-slate-800 hover:border-slate-700" 
                              : "bg-white border-slate-200 hover:border-slate-350"
                          }`}
                        >
                          <div className="space-y-4">
                            <div className="flex justify-between items-start">
                              <div>
                                <h3 className={`font-extrabold transition-colors text-sm group-hover:text-teal-600 dark:group-hover:text-emerald-400 ${
                                  isDarkMode ? "text-slate-200" : "text-slate-850"
                                }`}>{p.nombre_completo}</h3>
                                <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest block mt-0.5">DNI: {p.dni} &bull; {p.edad} años &bull; {p.sexo}</span>
                              </div>
                              {p.alergias && p.alergias.toLowerCase() !== "ninguna" && p.alergias.toLowerCase() !== "ninguno" && (
                                <span className="p-1 bg-red-500/10 text-red-500 rounded-lg border border-red-500/15" title={p.alergias}>
                                  <ShieldAlert className="h-4 w-4" />
                                </span>
                              )}
                            </div>
                            <div className="space-y-1.5 text-[10px] border-t pt-3 border-slate-200/60 dark:border-slate-850">
                              <div className="flex items-start gap-1"><span className="font-bold text-slate-500 min-w-[50px]">Motivo:</span><p className={`font-medium truncate ${isDarkMode ? "text-slate-350":"text-slate-650"}`}>{p.motivo_consulta}</p></div>
                              {p.alergias && <div className="flex items-start gap-1"><span className="font-bold text-red-500 min-w-[50px]">Alergias:</span><p className="text-red-650 dark:text-red-400 font-bold truncate">{p.alergias}</p></div>}
                            </div>
                          </div>
                          <div className="flex justify-between items-center border-t pt-3 mt-4 border-slate-200/60 dark:border-slate-850">
                            <span className="text-[9px] font-bold text-slate-400 flex items-center gap-1"><Calendar className="h-3 w-3" /> Reg: {new Date(p.fecha_registro || "").toLocaleDateString("es-ES")}</span>
                            <div className="flex gap-1.5 items-center">
                              <button
                                onClick={(e) => { e.stopPropagation(); handleDeletePaciente(p.id!); }}
                                className="p-1 rounded text-slate-450 hover:text-red-500 hover:bg-red-500/5 transition-colors"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                              <span className="text-[10px] font-black text-teal-600 dark:text-emerald-400 group-hover:translate-x-0.5 transition-transform flex items-center gap-0.5">Ficha <ChevronRight className="h-3 w-3" /></span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}

            </div>
          )}

          {/* =============================================================== */}
          {/* VISTA 3: EXPEDIENTE CLÍNICO - ¡ODONTOGRAMA AL FRENTE Y AL CENTRO! */}
          {/* =============================================================== */}
          {activeTab === "expediente" && selectedPaciente && (
            <div className="space-y-8 animate-[fadeIn_0.2s_ease-out]">
              
              {/* Cabecera del Paciente */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b pb-5 border-slate-200/80 dark:border-slate-800">
                <div className="space-y-1">
                  <div className="flex items-center gap-3">
                    <h2 className={`text-2xl font-black ${isDarkMode ? "text-white" : "text-slate-850"}`}>{selectedPaciente.nombre_completo}</h2>
                    <span className={`text-[10px] font-extrabold px-2.5 py-1 rounded-full border uppercase ${
                      isDarkMode 
                        ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/10" 
                        : "bg-teal-50 border-teal-100 text-teal-750 font-bold"
                    }`}>DNI: {selectedPaciente.dni}</span>
                  </div>
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{selectedPaciente.edad} años &bull; {selectedPaciente.sexo} &bull; Ocupación: {selectedPaciente.ocupacion || "No registrada"}</p>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setSelectedPacienteId(null);
                      setActiveTab("pacientes");
                    }}
                    className={`flex items-center gap-1.5 text-xs font-bold px-4 py-2.5 rounded-xl border transition-all ${
                      isDarkMode 
                        ? "bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700" 
                        : "bg-white border-slate-200 text-slate-650 hover:bg-slate-100"
                    }`}
                  >
                    <ArrowLeft className="h-4 w-4" /> Volver a Lista
                  </button>
                </div>
              </div>

              {/* RENDER DEL DISEÑO CLINICO INTEGRADO (2 COLUMNAS) */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                
                {/* COLUMNA IZQUIERDA (4 COLUMNAS EN DESKTOP): ANTECEDENTES Y HISTORIAL */}
                <div className="lg:col-span-4 space-y-6">
                  
                  {/* Ficha Médica e Historia Clínica */}
                  <div className={`border rounded-3xl p-6 shadow-md space-y-6 transition-colors ${
                    isDarkMode ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"
                  }`}>
                    {isEditingHistory ? (
                      <div className="space-y-4">
                        <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400">Editar Antecedentes</h3>
                        <HistoriaClinicaForm initialData={selectedPaciente} onSubmit={handleUpdateHistory} onCancel={() => setIsEditingHistory(false)} />
                      </div>
                    ) : (
                      <div className="space-y-6">
                        <div className="flex justify-between items-center border-b pb-3 border-slate-200/60 dark:border-slate-850">
                          <div>
                            <h3 className={`text-sm font-bold ${isDarkMode ? "text-white" : "text-slate-800"}`}>Historia y Filiación</h3>
                            <p className="text-[10px] text-slate-500">Información del paciente</p>
                          </div>
                          <button 
                            onClick={() => setIsEditingHistory(true)} 
                            className={`flex items-center gap-1 text-[9px] font-extrabold px-3 py-2 rounded-lg border transition-colors ${
                              isDarkMode 
                                ? "bg-slate-800 border-slate-750 text-slate-355 hover:bg-slate-750" 
                                : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
                            }`}
                          >
                            <Edit3 className="h-3 w-3" /> Editar
                          </button>
                        </div>
                        
                        {/* Alerta Médica Crítica */}
                        <div className={`p-4 border rounded-2xl ${
                          selectedPaciente.alergias && selectedPaciente.alergias.toLowerCase() !== "ninguna" && selectedPaciente.alergias.toLowerCase() !== "ninguno"
                            ? "bg-red-500/10 text-red-500 border-red-500/15"
                            : "bg-slate-50 dark:bg-slate-950 text-slate-500 border-slate-200 dark:border-slate-850"
                        }`}>
                          <span className="text-[9px] font-bold uppercase tracking-wider block mb-1 flex items-center gap-1">
                            <ShieldAlert className="h-3.5 w-3.5" /> Alergias Clínicas:
                          </span>
                          <p className="text-xs font-bold leading-tight">
                            {selectedPaciente.alergias || "Ninguna registrada."}
                          </p>
                        </div>

                        {/* Ficha demográfica resumida */}
                        <div className="space-y-3.5 text-xs">
                          <div className="grid grid-cols-2 gap-4">
                            <div><span className="text-[10px] text-slate-450 block font-bold">DNI:</span><span className={`font-semibold ${isDarkMode ? "text-slate-200" : "text-slate-750"}`}>{selectedPaciente.dni}</span></div>
                            <div><span className="text-[10px] text-slate-450 block font-bold">Teléfono:</span><span className={`font-semibold ${isDarkMode ? "text-slate-200" : "text-slate-750"}`}>{selectedPaciente.telefono || "No registrado"}</span></div>
                            <div className="col-span-2"><span className="text-[10px] text-slate-450 block font-bold">Ocupación:</span><span className={`font-semibold ${isDarkMode ? "text-slate-200" : "text-slate-750"}`}>{selectedPaciente.ocupacion || "No especificada"}</span></div>
                          </div>
                          
                          <div className="pt-4 border-t border-slate-200/60 dark:border-slate-850 space-y-3.5">
                            <div><span className="text-[10px] text-slate-450 block font-bold">Motivo de Consulta:</span><p className={`font-medium leading-snug mt-0.5 ${isDarkMode ? "text-slate-355":"text-slate-650"}`}>{selectedPaciente.motivo_consulta}</p></div>
                            <div><span className="text-[10px] text-slate-450 block font-bold">Hemorragias / Sangrado:</span><p className={`font-medium leading-snug mt-0.5 ${isDarkMode ? "text-slate-300" : "text-slate-650"}`}>{selectedPaciente.hemorragias || "Ninguna."}</p></div>
                            <div><span className="text-[10px] text-slate-450 block font-bold">Enfermedades Sistémicas:</span><p className={`font-medium leading-snug mt-0.5 ${isDarkMode ? "text-slate-300" : "text-slate-650"}`}>{selectedPaciente.enfermedades || "Ninguna."}</p></div>
                            <div><span className="text-[10px] text-slate-450 block font-bold">Medicamentos Actuales:</span><p className={`font-medium leading-snug mt-0.5 ${isDarkMode ? "text-slate-300" : "text-slate-650"}`}>{selectedPaciente.medicamentos_actuales || "Ninguno."}</p></div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Expediente Histórico de Sesiones Realizadas */}
                  <div className={`border rounded-3xl p-6 shadow-md space-y-6 transition-colors ${
                    isDarkMode ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"
                  }`}>
                    <div>
                      <h3 className={`text-sm font-bold ${isDarkMode ? "text-white" : "text-slate-800"}`}>Historial de Sesiones</h3>
                      <p className="text-[10px] text-slate-500">Planes e impresiones anteriores de cobranza</p>
                    </div>

                    {tratamientos.length === 0 ? (
                      <div className={`text-center py-8 border-2 border-dashed rounded-2xl transition-colors ${
                        isDarkMode ? "border-slate-800 text-slate-500" : "border-slate-200 text-slate-400"
                      }`}>
                        <Activity className="h-8 w-8 mx-auto text-slate-300 mb-1 animate-pulse" />
                        <p className="text-xs font-semibold">No registra tratamientos aún.</p>
                      </div>
                    ) : (
                      <div className="space-y-3.5 max-h-80 overflow-y-auto pr-1">
                        {tratamientos.map((tr) => (
                          <div
                            key={tr.id}
                            onClick={() => setSelectedTratamientoDetalle(tr)}
                            className={`p-3.5 rounded-xl border transition-all cursor-pointer flex justify-between items-center ${
                              selectedTratamientoDetalle?.id === tr.id
                                ? "bg-emerald-500/5 border-emerald-500"
                                : isDarkMode 
                                  ? "bg-slate-955 border-slate-850 hover:bg-slate-900" 
                                  : "bg-slate-50 border-slate-200 hover:bg-slate-100/50"
                            }`}
                          >
                            <div className="space-y-0.5 overflow-hidden">
                              <span className="text-[10px] font-black text-teal-650 dark:text-teal-400">{new Date(tr.fecha).toLocaleDateString("es-ES")}</span>
                              <p className={`text-[9px] font-bold truncate max-w-[120px] ${isDarkMode ? "text-slate-400":"text-slate-550"}`}>{tr.procedimientos.map((p: any)=>p.nombre_procedimiento).join(", ")}</p>
                            </div>
                            <div className="flex gap-2 items-center">
                              <div className="text-right text-[10px] font-black min-w-[50px]">
                                <span className="block text-[8px] text-slate-500 font-bold uppercase leading-none">Saldo</span>
                                <span className={tr.saldo > 0 ? "text-amber-500" : "text-emerald-600"}>s/. {tr.saldo.toFixed(0)}</span>
                              </div>
                              <button 
                                onClick={(e) => { e.stopPropagation(); triggerPrintWindow(tr); }} 
                                className={`p-1.5 rounded border transition-colors ${
                                  isDarkMode 
                                    ? "bg-slate-900 border-slate-800 text-slate-550 hover:text-white" 
                                    : "bg-white border-slate-200 text-slate-500 hover:text-slate-800"
                                }`} 
                                title="Imprimir"
                              >
                                <Printer className="h-3.5 w-3.5" />
                              </button>
                              <button 
                                onClick={(e) => { e.stopPropagation(); handleDeleteTreatment(tr.id); }} 
                                className={`p-1.5 rounded border transition-colors ${
                                  isDarkMode 
                                    ? "bg-slate-900 border-slate-800 text-slate-555 hover:text-red-450" 
                                    : "bg-white border-slate-200 text-slate-500 hover:text-red-500"
                                }`} 
                                title="Eliminar"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                </div>

                {/* COLUMNA DERECHA (8 COLUMNAS EN DESKTOP): DENTAL WORKSPACE - ¡ODONTOGRAMA AL FRENTE! */}
                <div className="lg:col-span-8 space-y-8">
                  
                  {/* Visualizador de Tratamiento Histórico Seleccionado (Al hacer click en el historial) */}
                  {selectedTratamientoDetalle && (
                    <div className={`border rounded-3xl p-6 shadow-xl space-y-6 animate-[scaleUp_0.15s_ease-out] transition-all duration-200 ${
                      isDarkMode 
                        ? "bg-slate-900 border-emerald-950" 
                        : "bg-white border-teal-150"
                    }`}>
                      <div className="flex justify-between items-center border-b pb-3 border-slate-200/60 dark:border-slate-850">
                        <div>
                          <span className={`text-[9px] font-bold px-2 py-0.5 rounded border uppercase block w-max mb-1 ${
                            isDarkMode ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/10" : "bg-teal-50 text-teal-700 border-teal-100"
                          }`}>Detalle Ficha Histórica</span>
                          <h3 className={`text-sm font-bold ${isDarkMode ? "text-white" : "text-slate-850"}`}>Sesión Guardada: {new Date(selectedTratamientoDetalle.fecha).toLocaleDateString("es-ES")} &bull; {new Date(selectedTratamientoDetalle.fecha).toLocaleTimeString("es-ES", {hour: '2-digit', minute:'2-digit'})}</h3>
                        </div>
                        <div className="flex gap-2">
                          <button onClick={() => triggerPrintWindow(selectedTratamientoDetalle)} className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                            isDarkMode ? "bg-slate-850 hover:bg-slate-800 text-slate-200" : "bg-slate-100 hover:bg-slate-200 text-slate-700"
                          }`}><Printer className="h-3.5 w-3.5" /> Imprimir Documento</button>
                          <button onClick={() => setSelectedTratamientoDetalle(null)} className={`text-xs px-2.5 py-1.5 rounded-lg transition-all border ${
                            isDarkMode ? "border-slate-800 text-slate-400 hover:text-white" : "border-slate-200 text-slate-500 hover:text-slate-850"
                          }`}>Cerrar</button>
                        </div>
                      </div>
                      
                      <div className="space-y-4">
                        <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Odontograma Capturado</h4>
                        <Odontograma 
                          key={selectedTratamientoDetalle.id}
                          initialState={selectedTratamientoDetalle.odontograma_estado} 
                          readOnly={true} 
                        />
                      </div>

                      <div className="pt-4 border-t space-y-4 border-slate-200/60 dark:border-slate-850">
                        <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Detalle Presupuestario</h4>
                        <div className="overflow-x-auto rounded-xl border text-xs border-slate-200/60 dark:border-slate-850">
                          <table className="w-full text-left">
                            <thead>
                              <tr className="bg-slate-50 dark:bg-slate-950 text-slate-500 uppercase font-bold border-b border-slate-200/60 dark:border-slate-850">
                                <th className="p-2.5">Procedimiento</th>
                                <th className="p-2.5 text-center">Pieza</th>
                                <th className="p-2.5">Notas</th>
                                <th className="p-2.5 text-right">Monto</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200/60 dark:divide-slate-850">
                              {selectedTratamientoDetalle.procedimientos.map((p: any, idx: number) => (
                                <tr key={idx}>
                                  <td className="p-2.5 font-bold">{p.nombre_procedimiento}</td>
                                  <td className="p-2.5 text-center font-extrabold text-teal-605 dark:text-teal-400">{p.diente_numero ? `# ${p.diente_numero}` : "--"}</td>
                                  <td className="p-2.5 text-slate-450">{p.notas || "--"}</td>
                                  <td className="p-2.5 text-right font-black">s/. {p.costo_final.toFixed(2)}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                        <div className="grid grid-cols-3 gap-3 text-xs pt-1">
                          <div className={`p-3 rounded-lg text-center border ${isDarkMode ? "bg-slate-950 border-slate-850":"bg-slate-50 border-slate-200"}`}><span className="text-[9px] text-slate-500 block uppercase">Total</span><span className="font-black text-slate-850 dark:text-slate-200">s/. {selectedTratamientoDetalle.total.toFixed(2)}</span></div>
                          <div className={`p-3 rounded-lg text-center border text-emerald-600 ${isDarkMode ? "bg-slate-950 border-slate-850":"bg-slate-50 border-slate-200"}`}><span className="text-[9px] block uppercase">Adelantó</span><span className="font-black">s/. {selectedTratamientoDetalle.adelanto.toFixed(2)}</span></div>
                          <div className={`p-3 rounded-lg text-center border text-amber-500 ${isDarkMode ? "bg-slate-950 border-slate-850":"bg-slate-50 border-slate-200"}`}><span className="text-[9px] block uppercase">Saldo</span><span className="font-black">s/. {selectedTratamientoDetalle.saldo.toFixed(2)}</span></div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* FICHA TÉCNICA PRINCIPAL DENTAL (ODONTOGRAMA + PRESUPUESTO ACTIVOS SIEMPRE EN PRIMER PLANO) */}
                  <div className="space-y-8">
                    
                    {/* Odontograma Clínico Interactivo */}
                    <div className="relative">
                      <div className="absolute top-4 right-4 z-10">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border shadow-sm ${
                          isDarkMode 
                            ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/15" 
                            : "bg-teal-50 text-teal-700 border-teal-100 font-extrabold"
                        }`}>
                          <Sparkles className="h-3 w-3 animate-pulse" /> Ficha Técnica Activa
                        </span>
                      </div>
                      <Odontograma 
                        key={selectedPacienteId || "nuevo-odontograma"}
                        initialState={nuevoOdontograma} 
                        onChange={(nuevoEstado) => {
                          setNuevoOdontograma(nuevoEstado);
                        }} 
                      />
                    </div>

                    {/* Presupuesto y Cobranza de la Sesión en el mismo plano */}
                    <div className={`border rounded-3xl p-6 shadow-xl space-y-6 transition-colors ${
                      isDarkMode ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"
                    }`}>
                      <div className="flex justify-between items-center border-b pb-4 border-slate-200/60 dark:border-slate-850">
                        <div>
                          <h3 className={`text-md font-bold ${isDarkMode ? "text-white" : "text-slate-800"}`}>Calculadora de Sesión Activa</h3>
                          <p className="text-xs text-slate-500">Agrega procedimientos clínicos a esta consulta odontológica</p>
                        </div>
                        
                        {/* Botón rápido para guardar la sesión completa */}
                        <div className="text-xs font-bold text-slate-450 italic flex items-center gap-1.5">
                          Edición en vivo habilitada
                        </div>
                      </div>

                      {/* PresupuestoCalculador integrado y sincronizado con el odontograma interactivo */}
                      <PresupuestoCalculador 
                        catalogo={catalogo} 
                        onSubmit={handleSaveTreatment} 
                        onCancel={() => {
                          if (window.confirm("¿Seguro que deseas reiniciar los cambios del odontograma activo?")) {
                            const ultimo = localStorage.getItem(`clinident_ultimo_odontograma_${selectedPacienteId}`);
                            setNuevoOdontograma(ultimo ? JSON.parse(ultimo) : {});
                          }
                        }} 
                      />
                    </div>

                  </div>

                </div>

              </div>
            </div>
          )}

          </div>
      </main>

    </div>
  );
}
