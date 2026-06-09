/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import React, { useState, useEffect } from "react";
import { 
  Home, 
  User,
  Users, 
  Activity, 
  Printer, 
  Plus, 
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
  CheckSquare,
  Clock,
  Send,
  Menu
} from "lucide-react";

import { Odontograma, OdontogramaState, ToothState, crearDienteVacio } from "@/components/odontograma/odontograma";
import { PresupuestoCalculador, CatalogProcedure, SelectedProcedure } from "@/components/tratamientos/presupuesto-calculador";
import { HistoriaClinicaForm, PacienteData } from "@/components/pacientes/historia-clinica-form";
import { createClient } from "@/utils/supabase/client";

// =========================================================================
// INTERFACES EXTENDIDAS
// =========================================================================
export interface ClinicalSessionLog {
  fecha: string;
  nota: string;
  procedimientosTratados: string[]; // Nombres de los procedimientos realizados
  pago?: number;
  doctor?: string;
  piezasTratadas?: string[];
}

export interface SaldoIndependiente {
  id?: string;
  paciente_id?: string;
  fecha: string;
  procedimiento: string;
  saldo: number;
}

export interface TreatmentSession {
  id: string;
  fecha: string;
  odontograma_estado: OdontogramaState;
  procedimientos: SelectedProcedure[];
  total: number;
  adelanto: number;
  saldo: number;
  estado: "presupuesto_pendiente" | "presupuesto_aceptado";
  sesiones: ClinicalSessionLog[];
}

export default function HomeSPA() {
  // --- TEMAS Y PREFERENCIAS ---
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // --- ESTADOS GENERALES ---
  const [pacientes, setPacientes] = useState<PacienteData[]>([]);
  const [activeTab, setActiveTab] = useState<"inicio" | "pacientes" | "expediente">("inicio");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPacienteId, setSelectedPacienteId] = useState<string | null>(null);
  
  // Catálogo clínico dinámico
  const [catalogo, setCatalogo] = useState<CatalogProcedure[]>([]);
  
  // Modos de Ficha Paciente
  const [isEditingHistory, setIsEditingHistory] = useState(false);
  const [isRegisteringNewPaciente, setIsRegisteringNewPaciente] = useState(false);

  // Sub-pestaña activa dentro de la ficha del paciente
  const [activeSubTab, setActiveSubTab] = useState<"historia" | "evaluacion" | "presupuesto" | "sesiones">("historia");

  // Estado del paciente activo
  const [odontogramaInicial, setOdontogramaInicial] = useState<OdontogramaState>({});
  const [activeSelectedTeeth, setActiveSelectedTeeth] = useState<number[]>([]);
  const [activePlanProcedures, setActivePlanProcedures] = useState<SelectedProcedure[]>([]);
  const [activeProcedureName, setActiveProcedureName] = useState<string | null>(null);
  const [tratamientos, setTratamientos] = useState<TreatmentSession[]>([]);
  const [selectedTratamientoDetalle, setSelectedTratamientoDetalle] = useState<TreatmentSession | null>(null);
  
  // Para registrar nuevo paciente
  const [registroOdontograma, setRegistroOdontograma] = useState<OdontogramaState>({});
  const [registroEdad, setRegistroEdad] = useState<number>(0);

  // Estado de Impresión
  const [printingTratamiento, setPrintingTratamiento] = useState<TreatmentSession | null>(null);
  const [printingHistory, setPrintingHistory] = useState<boolean>(false);
  const [consultasHoy, setConsultasHoy] = useState<any[]>([]);

  // Estados para Procedimientos y Saldos Independientes
  const [saldosIndependientes, setSaldosIndependientes] = useState<SaldoIndependiente[]>([]);
  const [nuevoSaldoFecha, setNuevoSaldoFecha] = useState<string>(new Date().toISOString().substring(0, 10));
  const [nuevoSaldoProcedimiento, setNuevoSaldoProcedimiento] = useState<string>("");
  const [nuevoSaldoMonto, setNuevoSaldoMonto] = useState<number>(0);

  // Para el registro de nuevas sesiones clínicas
  const [nuevaSesionNota, setNuevaSesionNota] = useState("");
  const [nuevaSesionProcs, setNuevaSesionProcs] = useState<string[]>([]);
  const [nuevaSesionPago, setNuevaSesionPago] = useState<number>(0);
  const [nuevaSesionDoctor, setNuevaSesionDoctor] = useState<string>("Jean Carlos Zúñiga");
  const [nuevaSesionPiezas, setNuevaSesionPiezas] = useState<string[]>([]);

  // Conexión Supabase
  const supabase = createClient();

  // =========================================================================
  // CARGAS Y CONSULTAS DE BASE DE DATOS (CON FALLBACK LOCALSTORAGE)
  // =========================================================================

  const fetchConsultasHoy = async () => {
    try {
      const { data, error } = await supabase
        .from("tratamientos_paciente")
        .select(`
          id,
          fecha,
          total_costo,
          paciente:pacientes(nombre_completo, motivo_consulta)
        `)
        .order("fecha", { ascending: false })
        .limit(3);

      if (!error && data) {
        setConsultasHoy(data);
      } else {
        console.warn("Error al cargar consultas hoy de Supabase:", error);
      }
    } catch (e) {
      console.warn("Fallo de red al conectar con Supabase para consultas:", e);
    }
  };

  const fetchPacientes = async () => {
    try {
      const { data, error } = await supabase
        .from("pacientes")
        .select("*")
        .order("nombre_completo", { ascending: true });
        
      if (!error && data) {
        setPacientes(data);
      } else {
        loadLocalPacientesFallback();
      }
    } catch (e) {
      loadLocalPacientesFallback();
    }
  };

  const loadLocalPacientesFallback = () => {
    const saved = localStorage.getItem("clinica_dental_zuniga_pacientes");
    setTimeout(() => {
      if (saved) {
        setPacientes(JSON.parse(saved));
      } else {
        setPacientes([]);
      }
    }, 0);
  };

  const fetchCatalogo = async () => {
    try {
      const { data, error } = await supabase
        .from("procedimientos_catalogo")
        .select("*")
        .order("nombre_procedimiento", { ascending: true });
      if (!error && data && data.length > 0) {
        setCatalogo(data);
      } else {
        // Fallback local robusto con los nuevos procedimientos paramétricos
        setCatalogo([
          { id: "1", nombre_procedimiento: "Rx", costo_base: 50.00 },
          { id: "2", nombre_procedimiento: "Blanqueamiento ambulatorio", costo_base: 300.00 },
          { id: "3", nombre_procedimiento: "Blanqueamiento con luz alogena", costo_base: 450.00 },
          { id: "4", nombre_procedimiento: "Curación simple", costo_base: 120.00 },
          { id: "5", nombre_procedimiento: "Curación compuesta", costo_base: 180.00 },
          { id: "6", nombre_procedimiento: "Reconstrucción coronaria", costo_base: 220.00 },
          { id: "7", nombre_procedimiento: "Extracción simple", costo_base: 150.00 },
          { id: "8", nombre_procedimiento: "Extracción compleja", costo_base: 250.00 },
          { id: "9", nombre_procedimiento: "Cirugía 3ra molar", costo_base: 450.00 },
          { id: "10", nombre_procedimiento: "Endodoncia anterior", costo_base: 350.00 },
          { id: "11", nombre_procedimiento: "Endodoncia posterior", costo_base: 550.00 },
          { id: "12", nombre_procedimiento: "Corona de porcelana", costo_base: 600.00 },
          { id: "13", nombre_procedimiento: "Corona de circonio", costo_base: 1200.00 },
          { id: "14", nombre_procedimiento: "Corona tipo cerámica", costo_base: 900.00 },
          { id: "15", nombre_procedimiento: "Corona venner ceramico", costo_base: 1000.00 },
          { id: "16", nombre_procedimiento: "Corona veneer ivocrom", costo_base: 800.00 },
          { id: "17", nombre_procedimiento: "Corona Jacket", costo_base: 500.00 },
          { id: "18", nombre_procedimiento: "PPR acrilico (wipla)", costo_base: 700.00 },
          { id: "19", nombre_procedimiento: "PPR Metalico", costo_base: 950.00 },
          { id: "20", nombre_procedimiento: "Prótesis total", costo_base: 1200.00 },
          { id: "21", nombre_procedimiento: "Prótesis flexible", costo_base: 1100.00 },
          { id: "22", nombre_procedimiento: "Perno muñón", costo_base: 250.00 },
          { id: "23", nombre_procedimiento: "Perno fibra de vidrio", costo_base: 300.00 },
          { id: "24", nombre_procedimiento: "Perno de circonio", costo_base: 450.00 },
          { id: "25", nombre_procedimiento: "Profilaxis", costo_base: 100.00 },
          { id: "26", nombre_procedimiento: "Destartraje", costo_base: 150.00 },
          { id: "27", nombre_procedimiento: "Reparación de prótesis", costo_base: 120.00 },
          { id: "28", nombre_procedimiento: "Pulpotomia", costo_base: 180.00 },
          { id: "29", nombre_procedimiento: "Pulpectomia", costo_base: 220.00 },
          { id: "30", nombre_procedimiento: "Sellante", costo_base: 80.00 },
          { id: "31", nombre_procedimiento: "Fluorización", costo_base: 85.00 },
          { id: "32", nombre_procedimiento: "Cemento provisional", costo_base: 50.00 },
          { id: "33", nombre_procedimiento: "Cemento fijo", costo_base: 100.00 },
          { id: "34", nombre_procedimiento: "Carillas de circonio", costo_base: 1200.00 },
          { id: "35", nombre_procedimiento: "Carillas con resina", costo_base: 400.00 },
          { id: "36", nombre_procedimiento: "Carillas de silicato de litio", costo_base: 1500.00 },
          { id: "37", nombre_procedimiento: "Implante", costo_base: 2500.00 },
          { id: "38", nombre_procedimiento: "Amalgama", costo_base: 120.00 },
          { id: "39", nombre_procedimiento: "Resina", costo_base: 150.00 }
        ]);
      }
    } catch (e) {
      console.warn("Fallo de red al obtener catálogo:", e);
    }
  };

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
          const { data: detalles, error: detError } = await supabase
            .from("detalles_treatment")
            .select(`
              id,
              procedimiento_id,
              piezas,
              cantidad,
              notas,
              costo_final,
              procedimientos_catalogo(nombre_procedimiento)
            `)
            .eq("tratamiento_paciente_id", tr.id);

          if (detError) {
            console.error("Error al obtener detalles del tratamiento:", detError);
          }

          const procedimientosMapeados: SelectedProcedure[] = detalles ? detalles.map((d: any) => ({
            id: d.id,
            procedimiento_id: d.procedimiento_id,
            nombre_procedimiento: d.procedimientos_catalogo?.nombre_procedimiento || "Procedimiento",
            piezas: d.piezas || "",
            cantidad: d.cantidad || 1,
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
            saldo: Number(tr.saldo),
            estado: (tr.estado as any) || "presupuesto_pendiente",
            sesiones: (tr.sesiones as any) || []
          });
        }
        setTratamientos(listadoConProcedimientos);
      } else {
        console.error("Error en fetchTratamientos de Supabase:", error);
        loadLocalTratamientosFallback(pacienteId);
      }
    } catch (e) {
      console.error("Excepción en fetchTratamientos:", e);
      loadLocalTratamientosFallback(pacienteId);
    }
  };

  const loadLocalTratamientosFallback = (pacienteId: string) => {
    const saved = localStorage.getItem(`clinica_dental_zuniga_tratamientos_${pacienteId}`);
    setTimeout(() => {
      if (saved) {
        setTratamientos(JSON.parse(saved));
      } else {
        setTratamientos([]);
      }
    }, 0);
  };

  const fetchSaldosIndependientes = async (pacienteId: string) => {
    try {
      const { data, error } = await supabase
        .from("saldos_independientes")
        .select("*")
        .eq("paciente_id", pacienteId)
        .order("fecha", { ascending: false });
      if (!error && data) {
        setSaldosIndependientes(data);
      } else {
        console.error("Error en fetchSaldosIndependientes:", error);
        loadLocalSaldosFallback(pacienteId);
      }
    } catch (e) {
      console.error("Excepción en fetchSaldosIndependientes:", e);
      loadLocalSaldosFallback(pacienteId);
    }
  };

  const loadLocalSaldosFallback = (pacienteId: string) => {
    const saved = localStorage.getItem(`clinica_dental_zuniga_saldos_${pacienteId}`);
    setTimeout(() => {
      if (saved) {
        setSaldosIndependientes(JSON.parse(saved));
      } else {
        setSaldosIndependientes([]);
      }
    }, 0);
  };

  const handleCreateSaldoIndependiente = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPacienteId) return;
    if (!nuevoSaldoProcedimiento.trim()) {
      alert("Por favor ingrese el procedimiento.");
      return;
    }

    const item: SaldoIndependiente = {
      paciente_id: selectedPacienteId,
      fecha: nuevoSaldoFecha ? new Date(nuevoSaldoFecha + "T12:00:00").toISOString() : new Date().toISOString(),
      procedimiento: nuevoSaldoProcedimiento.trim(),
      saldo: Number(nuevoSaldoMonto) || 0
    };

    try {
      const { data, error } = await supabase
        .from("saldos_independientes")
        .insert([item])
        .select()
        .single();
      if (!error && data) {
        setSaldosIndependientes(prev => [data, ...prev]);
        setNuevoSaldoProcedimiento("");
        setNuevoSaldoMonto(0);
        setNuevoSaldoFecha(new Date().toISOString().substring(0, 10));
      } else {
        createSaldoLocalFallback(item);
      }
    } catch (e) {
      createSaldoLocalFallback(item);
    }
  };

  const createSaldoLocalFallback = (item: SaldoIndependiente) => {
    const nuevoItem = {
      ...item,
      id: Math.random().toString(36).substring(2, 9)
    };
    const listado = [nuevoItem, ...saldosIndependientes];
    setSaldosIndependientes(listado);
    localStorage.setItem(`clinica_dental_zuniga_saldos_${selectedPacienteId}`, JSON.stringify(listado));
    setNuevoSaldoProcedimiento("");
    setNuevoSaldoMonto(0);
    setNuevoSaldoFecha(new Date().toISOString().substring(0, 10));
  };

  const handleDeleteSaldoIndependiente = async (id: string) => {
    if (window.confirm("¿Seguro que deseas eliminar este registro de saldo?")) {
      try {
        const { error } = await supabase
          .from("saldos_independientes")
          .delete()
          .eq("id", id);
        if (!error) {
          setSaldosIndependientes(prev => prev.filter(x => x.id !== id));
        } else {
          deleteSaldoLocalFallback(id);
        }
      } catch (e) {
        deleteSaldoLocalFallback(id);
      }
    }
  };

  const deleteSaldoLocalFallback = (id: string) => {
    const listado = saldosIndependientes.filter(x => x.id !== id);
    setSaldosIndependientes(listado);
    localStorage.setItem(`clinica_dental_zuniga_saldos_${selectedPacienteId}`, JSON.stringify(listado));
  };

  // Cargar catálogos y pacientes al iniciar
  useEffect(() => {
    fetchPacientes();
    fetchCatalogo();
    fetchConsultasHoy();
  }, []);

  // Cargar tratamientos y sincronizar odontograma activo al cambiar el paciente seleccionado
  useEffect(() => {
    if (selectedPacienteId) {
      // Limpiar datos del paciente anterior de inmediato para evitar visualización temporal de datos ajenos
      setTratamientos([]);
      setSaldosIndependientes([]);
      setSelectedTratamientoDetalle(null);

      fetchTratamientos(selectedPacienteId);
      fetchSaldosIndependientes(selectedPacienteId);
      
      const pac = pacientes.find((p) => p.id === selectedPacienteId);
      setTimeout(() => {
        if (pac) {
          setOdontogramaInicial(pac.odontograma_inicial || {});
        }
        setIsEditingHistory(false);
        setActiveSubTab("historia");
        setActivePlanProcedures([]);
        setActiveProcedureName(null);
        setActiveSelectedTeeth([]);
      }, 0);
    }
  }, [selectedPacienteId]);

  // Limpiar estados de planificación cuando cambia el tratamiento seleccionado
  useEffect(() => {
    if (selectedTratamientoDetalle) {
      setTimeout(() => {
        setActivePlanProcedures([]);
        setActiveProcedureName(null);
        setActiveSelectedTeeth([]);
      }, 0);
    }
  }, [selectedTratamientoDetalle]);

  // Seleccionar automáticamente el primer tratamiento aceptado al entrar al tab de sesiones o cargarse los tratamientos
  useEffect(() => {
    if (activeSubTab === "sesiones") {
      const accepted = tratamientos.filter(t => t.estado === "presupuesto_aceptado");
      if (accepted.length > 0) {
        if (!selectedTratamientoDetalle || 
            selectedTratamientoDetalle.estado !== "presupuesto_aceptado" || 
            !accepted.some(t => t.id === selectedTratamientoDetalle.id)) {
          setSelectedTratamientoDetalle(accepted[0]);
        }
      } else {
        setSelectedTratamientoDetalle(null);
      }
    }
  }, [activeSubTab, tratamientos, selectedTratamientoDetalle]);

  const syncLocalPacientes = (listado: PacienteData[]) => {
    localStorage.setItem("clinica_dental_zuniga_pacientes", JSON.stringify(listado));
  };

  // =========================================================================
  // OPERACIONES DE ESCRITURA (CON ONLINE/OFFLINE ROBUSTEZ)
  // =========================================================================

  // Crear Paciente con Odontograma Inicial de Ingreso
  const handleCreatePaciente = async (data: PacienteData) => {
    const dataConOdontograma = {
      ...data,
      odontograma_inicial: registroOdontograma
    };

    try {
      const { data: newPatient, error } = await supabase
        .from("pacientes")
        .insert([dataConOdontograma])
        .select()
        .single();

      if (!error && newPatient) {
        await fetchPacientes();
        await fetchConsultasHoy();
        setSelectedPacienteId(newPatient.id);
        setActiveTab("expediente");
      } else {
        createPacienteLocalFallback(dataConOdontograma);
      }
    } catch (e) {
      createPacienteLocalFallback(dataConOdontograma);
    }

    setIsRegisteringNewPaciente(false);
    setRegistroOdontograma({});
    setRegistroEdad(0);
  };

  const createPacienteLocalFallback = (data: any) => {
    const nuevoPaciente: PacienteData = {
      ...data,
      id: Math.random().toString(36).substring(2, 9),
      fecha_registro: new Date().toISOString(),
    };
    const nuevoListado = [nuevoPaciente, ...pacientes];
    setPacientes(nuevoListado);
    syncLocalPacientes(nuevoListado);

    setSelectedPacienteId(nuevoPaciente.id!);
    setActiveTab("expediente");
  };

  // Guardar Odontograma Inicial de Diagnóstico (Paso 1 del expediente)
  const handleSaveOdontogramaInicial = async (nuevoEstado: OdontogramaState) => {
    if (!selectedPacienteId) return;

    try {
      const { error } = await supabase
        .from("pacientes")
        .update({ odontograma_inicial: nuevoEstado })
        .eq("id", selectedPacienteId);

      if (!error) {
        setPacientes(prev => prev.map(p => p.id === selectedPacienteId ? { ...p, odontograma_inicial: nuevoEstado } : p));
        setOdontogramaInicial(nuevoEstado);
        alert("¡Odontograma de diagnóstico inicial guardado con éxito!");
      } else {
        saveOdontogramaInicialLocalFallback(nuevoEstado);
      }
    } catch (e) {
      saveOdontogramaInicialLocalFallback(nuevoEstado);
    }
  };

  const saveOdontogramaInicialLocalFallback = (nuevoEstado: OdontogramaState) => {
    const listado = pacientes.map(p => {
      if (p.id === selectedPacienteId) {
        return { ...p, odontograma_inicial: nuevoEstado };
      }
      return p;
    });
    setPacientes(listado);
    syncLocalPacientes(listado);
    setOdontogramaInicial(nuevoEstado);
    alert("¡Odontograma de diagnóstico inicial guardado localmente (Offline)!");
  };

  // Modificar Datos Clínicos de Filiación
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
    const nuevoListado = pacientes.map((p) => (p.id === selectedPacienteId ? { ...p, ...updatedData, id: selectedPacienteId } : p));
    setPacientes(nuevoListado);
    syncLocalPacientes(nuevoListado);
    setIsEditingHistory(false);
  };

  // Eliminar Paciente
  const handleDeletePaciente = async (id: string) => {
    if (window.confirm("¿Seguro que deseas eliminar permanentemente a este paciente y todas sus sesiones?")) {
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
    localStorage.removeItem(`clinica_dental_zuniga_tratamientos_${id}`);
    if (selectedPacienteId === id) {
      setSelectedPacienteId(null);
      setActiveTab("pacientes");
    }
  };

  // Guardar Plan de Tratamiento y Presupuesto
  const handleSaveTreatment = async (costos: {
    procedimientos: SelectedProcedure[];
    total: number;
    adelanto: number;
    saldo: number;
  }) => {
    if (!selectedPacienteId) return;

    try {
      const { data: newTr, error } = await supabase
        .from("tratamientos_paciente")
        .insert([{
          paciente_id: selectedPacienteId,
          odontograma_estado: odontogramaInicial, // Tomar estado inicial como base de la cabecera
          total_costo: costos.total,
          adelanto: costos.adelanto,
          estado: "presupuesto_pendiente",
          sesiones: []
        }])
        .select()
        .single();

      if (!error && newTr) {
        if (costos.procedimientos.length > 0) {
          const detallesParaInsertar = costos.procedimientos.map((p) => ({
            tratamiento_paciente_id: newTr.id,
            procedimiento_id: p.procedimiento_id,
            piezas: p.piezas,
            cantidad: p.cantidad,
            notas: p.notas || null,
            costo_final: p.costo_final
          }));

          const { error: errorDetalles } = await supabase
            .from("detalles_treatment")
            .insert(detallesParaInsertar);

          if (errorDetalles) console.error("Error detalles:", errorDetalles);
        }

        await fetchTratamientos(selectedPacienteId);
        await fetchConsultasHoy();
        alert("¡Presupuesto guardado en estado PENDIENTE!");
        setActivePlanProcedures([]);
        setActiveProcedureName(null);
        setActiveSelectedTeeth([]);
      } else {
        saveTreatmentLocalFallback(costos);
      }
    } catch (e) {
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
      odontograma_estado: odontogramaInicial,
      procedimientos: [...costos.procedimientos],
      total: costos.total,
      adelanto: costos.adelanto,
      saldo: costos.saldo,
      estado: "presupuesto_pendiente",
      sesiones: []
    };

    const nuevosTratamientos = [nuevaSesion, ...tratamientos];
    setTratamientos(nuevosTratamientos);
    localStorage.setItem(`clinica_dental_zuniga_tratamientos_${selectedPacienteId}`, JSON.stringify(nuevosTratamientos));
    alert("¡Presupuesto guardado localmente (Offline)!");
    setActivePlanProcedures([]);
    setActiveProcedureName(null);
    setActiveSelectedTeeth([]);
  };

  // Aceptar Presupuesto para Iniciar Sesiones Clínicas
  const handleAceptarPresupuesto = async (trId: string) => {
    try {
      const { error } = await supabase
        .from("tratamientos_paciente")
        .update({ estado: "presupuesto_aceptado" })
        .eq("id", trId);

      if (!error) {
        setTratamientos(prev => prev.map(t => t.id === trId ? { ...t, estado: "presupuesto_aceptado" } : t));
        setSelectedTratamientoDetalle(prev => prev && prev.id === trId ? { ...prev, estado: "presupuesto_aceptado" } : prev);
        alert("¡Presupuesto ACEPTADO! Ahora puede registrar las sesiones clínicas.");
      } else {
        console.error("Error en handleAceptarPresupuesto:", error);
        aceptarPresupuestoLocalFallback(trId);
      }
    } catch (e) {
      console.error("Excepción en handleAceptarPresupuesto:", e);
      aceptarPresupuestoLocalFallback(trId);
    }
  };

  const aceptarPresupuestoLocalFallback = (trId: string) => {
    const actualizados = tratamientos.map(t => t.id === trId ? { ...t, estado: "presupuesto_aceptado" as const } : t);
    setTratamientos(actualizados);
    setSelectedTratamientoDetalle(prev => prev && prev.id === trId ? { ...prev, estado: "presupuesto_aceptado" as const } : prev);
    localStorage.setItem(`clinica_dental_zuniga_tratamientos_${selectedPacienteId}`, JSON.stringify(actualizados));
    alert("¡Presupuesto Aceptado localmente (Offline)!");
  };

  // Registrar Cita / Sesión Clínica de Trabajo
  const handleAddSessionLog = async (trId: string) => {
    if (!nuevaSesionNota.trim()) {
      alert("Por favor escriba una descripción de lo realizado en la sesión.");
      return;
    }

    const tr = tratamientos.find(t => t.id === trId);
    if (!tr) return;

    const montoPago = Number(nuevaSesionPago) || 0;
    const nuevoAdelanto = Number(tr.adelanto) + montoPago;
    const nuevoSaldo = Math.max(0, Number(tr.total) - nuevoAdelanto);

    const nuevoLog: ClinicalSessionLog = {
      fecha: new Date().toISOString(),
      nota: nuevaSesionNota,
      procedimientosTratados: [...nuevaSesionProcs],
      pago: montoPago,
      doctor: nuevaSesionDoctor,
      piezasTratadas: [...nuevaSesionPiezas]
    };

    const nuevasSesiones = [...(tr.sesiones || []), nuevoLog];

    try {
      const { error } = await supabase
        .from("tratamientos_paciente")
        .update({ 
          sesiones: nuevasSesiones,
          adelanto: nuevoAdelanto
        })
        .eq("id", trId);

      if (!error) {
        setTratamientos(prev => prev.map(t => t.id === trId ? { 
          ...t, 
          sesiones: nuevasSesiones,
          adelanto: nuevoAdelanto,
          saldo: nuevoSaldo
        } : t));

        if (selectedTratamientoDetalle?.id === trId) {
          setSelectedTratamientoDetalle(prev => prev ? {
            ...prev,
            sesiones: nuevasSesiones,
            adelanto: nuevoAdelanto,
            saldo: nuevoSaldo
          } : null);
        }

        setNuevaSesionNota("");
        setNuevaSesionProcs([]);
        setNuevaSesionPago(0);
        setNuevaSesionDoctor("Jean Carlos Zúñiga");
        setNuevaSesionPiezas([]);
        alert("¡Sesión de trabajo registrada con éxito!");
      } else {
        addSessionLogLocalFallback(trId, nuevasSesiones, nuevoAdelanto, nuevoSaldo);
      }
    } catch (e) {
      addSessionLogLocalFallback(trId, nuevasSesiones, nuevoAdelanto, nuevoSaldo);
    }
  };

  const addSessionLogLocalFallback = (trId: string, nuevasSesiones: ClinicalSessionLog[], nuevoAdelanto: number, nuevoSaldo: number) => {
    const actualizados = tratamientos.map(t => t.id === trId ? { 
      ...t, 
      sesiones: nuevasSesiones,
      adelanto: nuevoAdelanto,
      saldo: nuevoSaldo
    } : t);
    setTratamientos(actualizados);
    localStorage.setItem(`clinica_dental_zuniga_tratamientos_${selectedPacienteId}`, JSON.stringify(actualizados));

    if (selectedTratamientoDetalle?.id === trId) {
      setSelectedTratamientoDetalle(prev => prev ? {
        ...prev,
        sesiones: nuevasSesiones,
        adelanto: nuevoAdelanto,
        saldo: nuevoSaldo
      } : null);
    }

    setNuevaSesionNota("");
    setNuevaSesionProcs([]);
    setNuevaSesionPago(0);
    setNuevaSesionDoctor("Jean Carlos Zúñiga");
    setNuevaSesionPiezas([]);
    alert("¡Sesión registrada localmente (Offline)!");
  };

  // Eliminar Tratamiento
  const handleDeleteTreatment = async (trId: string) => {
    if (window.confirm("¿Seguro que deseas eliminar permanentemente este plan de tratamiento?")) {
      try {
        const { error } = await supabase
          .from("tratamientos_paciente")
          .delete()
          .eq("id", trId);

        if (!error) {
          await fetchTratamientos(selectedPacienteId!);
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
    localStorage.setItem(`clinica_dental_zuniga_tratamientos_${selectedPacienteId}`, JSON.stringify(filtrados));
    if (selectedTratamientoDetalle?.id === trId) {
      setSelectedTratamientoDetalle(null);
    }
  };

  // Iniciar la vista de impresión
  const triggerPrintWindow = (tr: TreatmentSession) => {
    setPrintingTratamiento(tr);
    setTimeout(() => {
      window.print();
    }, 450);
  };

  // Iniciar la vista de impresión del historial clínico
  const triggerPrintHistory = () => {
    setPrintingHistory(true);
    setTimeout(() => {
      window.print();
    }, 450);
  };

  // Sincronizar clicks del odontograma en la calculadora de presupuesto
  const handleToothClickInPlan = (num: number) => {
    if (activeSelectedTeeth.includes(num)) {
      setActiveSelectedTeeth(prev => prev.filter(n => n !== num));
    } else {
      setActiveSelectedTeeth(prev => [...prev, num]);
    }
  };

  // Filtrado de pacientes
  const filteredPacientes = pacientes.filter((p) =>
    p.nombre_completo.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.dni.includes(searchQuery)
  );

  const selectedPaciente = pacientes.find((p) => p.id === selectedPacienteId) || null;

  // Determinar si la dentición es infantil o de adulto según edad
  const getVistaPorEdad = (edad: number): "adulto" | "infantil" => {
    return edad < 12 ? "infantil" : "adulto";
  };

  // =========================================================================
  // RENDERING VISTA DE IMPRESIÓN / EXPORTACIÓN PRESUPUESTO
  // =========================================================================
  if (printingTratamiento && selectedPaciente) {
    const tr = printingTratamiento;
    const forceVistaPrint = getVistaPorEdad(selectedPaciente.edad);

    return (
      <div className="min-h-screen bg-white text-slate-900 p-8 font-sans max-w-[850px] mx-auto space-y-6">
        
        {/* Panel de control de salida de impresión */}
        <div className="print:hidden flex justify-between items-center bg-slate-50 border border-slate-200 p-4 rounded-2xl mb-8">
          <button
            onClick={() => setPrintingTratamiento(null)}
            className="flex items-center gap-1 text-xs font-bold text-slate-600 hover:text-slate-900 transition-colors uppercase"
          >
            <ArrowLeft className="h-4 w-4" /> Volver al Dashboard
          </button>
          <button
            onClick={() => window.print()}
            className="flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs px-4 py-2 rounded-xl shadow-md"
          >
            <Printer className="h-4.5 w-4.5" /> Imprimir Documento
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
            <p className="font-bold text-slate-800 uppercase">Presupuesto del Plan de Tratamiento</p>
            <p>Fecha: {new Date(tr.fecha).toLocaleDateString("es-ES")}</p>
            <p>Estado: <span className="font-bold text-emerald-700">{tr.estado === "presupuesto_aceptado" ? "ACEPTADO" : "PENDIENTE DE APROBACIÓN"}</span></p>
          </div>
        </div>

        {/* Datos Paciente */}
        <div className="border border-slate-950 p-4 rounded-xl space-y-3">
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

        {/* Dos Odontogramas en una Sola Columna (Verticales) */}
        <div className="grid grid-cols-1 gap-4 max-w-[650px] mx-auto w-full">
          {/* Inicial */}
          <div className="border border-slate-950 p-3 rounded-xl space-y-2">
            <h4 className="text-[10px] font-bold uppercase text-center text-slate-500 border-b pb-1">Odontograma Inicial (Diagnóstico)</h4>
            <div className="scale-[0.8] origin-top">
              <Odontograma
                initialState={selectedPaciente.odontograma_inicial || {}}
                readOnly={true}
                mode="diagnostic"
                forceVista={forceVistaPrint}
                hideHeader={true}
              />
            </div>
          </div>

          {/* Final Proyectado */}
          <div className="border border-slate-950 p-3 rounded-xl space-y-2">
            <h4 className="text-[10px] font-bold uppercase text-center text-slate-500 border-b pb-1">Odontograma Final (Proyectado)</h4>
            <div className="scale-[0.8] origin-top">
              <Odontograma
                initialState={selectedPaciente.odontograma_inicial || {}}
                readOnly={true}
                mode="final"
                forceVista={forceVistaPrint}
                procedimientosPlanteados={tr.procedimientos}
                hideHeader={true}
              />
            </div>
          </div>
        </div>

        {/* Detalle Presupuesto, Resumen Balance y Firmas en la segunda página */}
        <div className="print:break-before-page pt-4 space-y-6" style={{ pageBreakBefore: "always", breakBefore: "page" }}>
          {/* Detalle Presupuesto */}
          <div className="border border-slate-950 rounded-xl overflow-hidden text-[10px]">
            <h3 className="text-xs font-bold text-white bg-slate-955 p-2.5 uppercase tracking-wider flex items-center gap-1">
              <FileText className="h-3.5 w-3.5" /> Procedimientos Clínicos y Costos
            </h3>
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-100 font-bold border-b border-slate-900">
                  <th className="p-2.5">Procedimiento</th>
                  <th className="p-2.5 text-center">Piezas</th>
                  <th className="p-2.5 text-center">Cant.</th>
                  <th className="p-2.5">Notas / Indicaciones</th>
                  <th className="p-2.5 text-right font-black">Costo Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-250">
                {tr.procedimientos.map((p, idx) => (
                  <tr key={idx}>
                    <td className="p-2.5 font-bold">{p.nombre_procedimiento}</td>
                    <td className="p-2.5 text-center font-extrabold text-teal-700">{p.piezas || "--"}</td>
                    <td className="p-2.5 text-center font-bold">{p.cantidad}</td>
                    <td className="p-2.5 text-slate-550">{p.notas || "--"}</td>
                    <td className="p-2.5 text-right font-bold">s/. {p.costo_final.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Resumen Balance */}
          <div className="flex justify-end">
            <div className="w-64 border border-slate-950 rounded-xl overflow-hidden text-xs">
              <div className="flex justify-between p-2.5 border-b border-slate-300"><span>Costo Total:</span><span className="font-bold">s/. {tr.total.toFixed(2)}</span></div>
              <div className="flex justify-between p-2.5 border-b border-slate-300 bg-slate-50"><span className="text-emerald-700">Adelanto:</span><span className="font-bold">s/. {tr.adelanto.toFixed(2)}</span></div>
              <div className="flex justify-between p-2.5 font-black bg-slate-150"><span>Saldo Restante:</span><span>s/. {tr.saldo.toFixed(2)}</span></div>
            </div>
          </div>

          {/* Firmas Consentimiento */}
          <div className="space-y-6 pt-6 border-t border-dashed border-slate-350 text-[9px] leading-tight text-slate-500">
            <p className="font-bold text-slate-800 uppercase">Consentimiento Informado del Tratamiento:</p>
            <p>He sido informado en detalle de los procedimientos a realizarse, del costo de los mismos y de las facilidades de pago. Expreso mi conformidad firmando a continuación.</p>
            <div className="grid grid-cols-2 gap-12 pt-8 text-[10px]">
              <div className="flex flex-col items-center justify-end h-20 text-center">
                <div className="w-40 border-b border-slate-900"></div>
                <span className="font-bold text-slate-850 mt-1">{selectedPaciente.nombre_completo}</span>
                <span className="text-slate-400 text-[8px]">Firma Paciente (DNI: {selectedPaciente.dni})</span>
              </div>
              <div className="flex flex-col items-center justify-end h-20 text-center">
                <div className="w-40 border-b border-slate-900"></div>
                <span className="font-bold text-slate-850 mt-1">Dr. Jean Carlos Zúñiga</span>
                <span className="text-slate-400 text-[8px]">Odontólogo Tratante (COP: 123456)</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // =========================================================================
  // RENDERING VISTA DE IMPRESIÓN / EXPORTACIÓN HISTORIAL CLÍNICO
  // =========================================================================
  if (printingHistory && selectedPaciente) {
    const todasLasSesiones = tratamientos.flatMap((tr) => 
      (tr.sesiones || []).map((ses) => ({
        ...ses,
        tratamientoFecha: tr.fecha,
        tratamientoId: tr.id
      }))
    ).sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime());

    return (
      <div className="min-h-screen bg-white text-slate-900 p-8 font-sans max-w-[850px] mx-auto space-y-6">
        {/* Panel de control de salida de impresión */}
        <div className="print:hidden flex justify-between items-center bg-slate-50 border border-slate-200 p-4 rounded-2xl mb-8">
          <button
            onClick={() => setPrintingHistory(false)}
            className="flex items-center gap-1 text-xs font-bold text-slate-600 hover:text-slate-900 transition-colors uppercase cursor-pointer"
          >
            <ArrowLeft className="h-4 w-4" /> Volver al Dashboard
          </button>
          <button
            onClick={() => window.print()}
            className="flex items-center gap-2 bg-teal-650 hover:bg-teal-700 text-white font-bold text-xs px-4 py-2 rounded-xl shadow-md cursor-pointer"
          >
            <Printer className="h-4.5 w-4.5" /> Imprimir Documento
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
            <p className="font-bold text-slate-800 uppercase">Historial de Evoluciones Clínicas</p>
            <p>Fecha de Reporte: {new Date().toLocaleDateString("es-ES")}</p>
          </div>
        </div>

        {/* Datos Paciente */}
        <div className="border border-slate-950 p-4 rounded-xl space-y-3">
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider border-b border-slate-200 pb-1 flex items-center gap-1">
            <User className="h-3.5 w-3.5" /> Datos del Paciente
          </h3>
          <div className="grid grid-cols-3 gap-2 text-[11px]">
            <div><span className="font-bold text-slate-400 block">Paciente:</span><span className="font-bold text-slate-800 text-xs">{selectedPaciente.nombre_completo}</span></div>
            <div><span className="font-bold text-slate-400 block">DNI:</span><span className="font-bold text-slate-800">{selectedPaciente.dni}</span></div>
            <div><span className="font-bold text-slate-400 block">Edad / Sexo:</span><span className="font-bold text-slate-800">{selectedPaciente.edad} años &bull; {selectedPaciente.sexo}</span></div>
            <div className="col-span-2"><span className="font-bold text-slate-400 block">Domicilio:</span><span className="font-semibold text-slate-700">{selectedPaciente.direccion || "No registrada"}</span></div>
            <div><span className="font-bold text-slate-400 block">Teléfono:</span><span className="font-semibold text-slate-700">{selectedPaciente.telefono || "No registrado"}</span></div>
          </div>
        </div>

        {/* Listado de Evoluciones */}
        <div className="border border-slate-950 rounded-xl overflow-hidden text-[10px]">
          <h3 className="text-xs font-bold text-white bg-slate-955 p-2.5 uppercase tracking-wider flex items-center gap-1">
            <Clock className="h-3.5 w-3.5" /> Historial de Atenciones Clínicas
          </h3>
          {todasLasSesiones.length === 0 ? (
            <p className="p-4 text-center font-bold text-slate-500">No hay atenciones registradas para este paciente.</p>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-100 font-bold border-b border-slate-900">
                  <th className="p-2.5">Fecha</th>
                  <th className="p-2.5">Odontólogo</th>
                  <th className="p-2.5">Procedimientos / Piezas</th>
                  <th className="p-2.5">Notas / Evolución</th>
                  <th className="p-2.5 text-right">Monto Pagado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-250">
                {todasLasSesiones.map((ses, idx) => (
                  <tr key={idx} className="align-top animate-none">
                    <td className="p-2.5 font-bold whitespace-nowrap">
                      {new Date(ses.fecha).toLocaleDateString("es-ES")}
                      <div className="text-[8px] text-slate-450 font-normal">
                        {new Date(ses.fecha).toLocaleTimeString("es-ES", {hour: '2-digit', minute:'2-digit'})}
                      </div>
                    </td>
                    <td className="p-2.5 font-semibold">Dr. {ses.doctor || "Jean Carlos Zúñiga"}</td>
                    <td className="p-2.5 space-y-1">
                      <div className="flex flex-wrap gap-1">
                        {ses.procedimientosTratados && ses.procedimientosTratados.map((proc, pIdx) => (
                          <span key={pIdx} className="text-[8px] font-bold uppercase bg-slate-100 border border-slate-350 rounded px-1 py-0.2">
                            {proc}
                          </span>
                        ))}
                      </div>
                      {ses.piezasTratadas && ses.piezasTratadas.length > 0 && (
                        <div className="text-[8px] text-teal-700 font-bold">
                          Piezas: {ses.piezasTratadas.join(", ")}
                        </div>
                      )}
                    </td>
                    <td className="p-2.5 text-slate-700 max-w-xs break-words">{ses.nota}</td>
                    <td className="p-2.5 text-right font-bold text-emerald-700">
                      {ses.pago && ses.pago > 0 ? `s/. ${ses.pago.toFixed(2)}` : "--"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Firmas Consentimiento / Conformidad */}
        <div className="space-y-6 pt-6 border-t border-dashed border-slate-350 text-[9px] leading-tight text-slate-500">
          <div className="grid grid-cols-2 gap-12 pt-8 text-[10px]">
            <div className="flex flex-col items-center justify-end h-20 text-center">
              <div className="w-40 border-b border-slate-900"></div>
              <span className="font-bold text-slate-850 mt-1">{selectedPaciente.nombre_completo}</span>
              <span className="text-slate-400 text-[8px]">Firma Paciente (DNI: {selectedPaciente.dni})</span>
            </div>
            <div className="flex flex-col items-center justify-end h-20 text-center">
              <div className="w-40 border-b border-slate-900"></div>
              <span className="font-bold text-slate-850 mt-1">Firma del Odontólogo</span>
              <span className="text-slate-400 text-[8px]">Clínica Dental Zúñiga</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // =========================================================================
  // RENDERING PANEL PRINCIPAL DE LA SPA
  // =========================================================================
  return (
    <div className={`min-h-screen flex relative transition-colors duration-250 ${
      isDarkMode 
        ? "bg-slate-950 text-slate-100 dark" 
        : "bg-slate-50 text-slate-800"
    }`}>
      
      {/* 1. SIDEBAR */}
      <aside className={`fixed inset-y-0 left-0 w-64 border-r p-6 flex flex-col justify-between z-30 transition-all duration-300 ${
        isSidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
      } ${
        isDarkMode 
          ? "bg-slate-900 border-slate-800 text-slate-300" 
          : "bg-teal-900 border-teal-800 text-teal-100"
      }`}>
        <div className="space-y-8">
          {/* Logo */}
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
                <h1 className="font-extrabold text-white text-sm tracking-tight leading-none">C.D. Zúñiga</h1>
                <span className={`text-[9px] font-bold uppercase tracking-widest block mt-0.5 ${isDarkMode ? "text-slate-500" : "text-teal-300"}`}>Ficha Clínica</span>
              </div>
            </div>
          </div>

          {/* Theme selector */}
          <div className={`flex justify-between items-center p-2.5 rounded-xl ${
            isDarkMode ? "bg-slate-950 border border-slate-800" : "bg-teal-950/40 border border-teal-800/40"
          }`}>
            <span className="text-xs font-bold">Pantalla</span>
            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              className={`p-1.5 rounded-lg transition-all ${
                isDarkMode ? "bg-slate-800 text-amber-400" : "bg-teal-800 text-amber-300 hover:bg-teal-700"
              }`}
              title="Cambiar tema de pantalla"
            >
              {isDarkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>
          </div>

          {/* Menú de Navegación */}
          <nav className="space-y-1">
            <span className={`px-3 text-[10px] font-bold uppercase tracking-wider block mb-2 ${isDarkMode ? "text-slate-500" : "text-teal-350"}`}>Navegación</span>
            
            <button
              onClick={() => { setActiveTab("inicio"); setSelectedPacienteId(null); setIsSidebarOpen(false); }}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all w-full text-left cursor-pointer ${
                activeTab === "inicio"
                  ? isDarkMode 
                    ? "bg-emerald-650 text-white shadow-lg" 
                    : "bg-teal-750 text-white shadow-md font-bold"
                  : isDarkMode
                    ? "text-slate-400 hover:bg-slate-850 hover:text-slate-200"
                    : "text-white hover:bg-teal-850/80 hover:text-white"
              }`}
            >
              <Home className="h-4.5 w-4.5" /> Panel Principal
            </button>

            <button
              onClick={() => { setActiveTab("pacientes"); setSelectedPacienteId(null); setIsSidebarOpen(false); }}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all w-full text-left cursor-pointer ${
                activeTab === "pacientes"
                  ? isDarkMode 
                    ? "bg-emerald-650 text-white shadow-lg" 
                    : "bg-teal-750 text-white shadow-md font-bold"
                  : isDarkMode
                    ? "text-slate-400 hover:bg-slate-850 hover:text-slate-200"
                    : "text-white hover:bg-teal-850/80 hover:text-white"
              }`}
            >
              <Users className="h-4.5 w-4.5" /> Historias Clínicas
            </button>

            {selectedPaciente && (
              <button
                onClick={() => { setActiveTab("expediente"); setIsSidebarOpen(false); }}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all w-full text-left cursor-pointer ${
                  activeTab === "expediente"
                    ? isDarkMode 
                      ? "bg-emerald-655 text-white shadow-lg" 
                      : "bg-teal-750 text-white shadow-md font-bold"
                    : isDarkMode
                      ? "text-slate-400 hover:bg-slate-850 hover:text-slate-200"
                      : "text-white hover:bg-teal-850/80 hover:text-white"
                }`}
              >
                <Activity className={`h-4.5 w-4.5 animate-pulse ${isDarkMode ? "text-emerald-400" : "text-white"}`} /> Ficha: {selectedPaciente.nombre_completo.split(" ")[0]}
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
              <span className={`text-[9px] font-semibold uppercase ${isDarkMode ? "text-slate-500":"text-teal-300"}`}>Odontólogo Tratante</span>
            </div>
          </div>
          <p className={`text-[9px] font-medium text-center ${isDarkMode ? "text-slate-600" : "text-teal-400"}`}>Ficha Clínica Zúñiga &copy; 2026</p>
        </div>
      </aside>

      {/* Overlay backdrop for tablet/mobile sidebar */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-slate-950/50 backdrop-blur-sm z-20 lg:hidden cursor-pointer"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* 2. AREA DE CONTENIDO PRINCIPAL */}
      <main className="flex-1 lg:pl-64 min-h-screen flex flex-col relative">
        {/* Header Responsivo para Tablet/Móvil */}
        <header className={`lg:hidden flex items-center justify-between px-6 py-4 border-b sticky top-0 z-20 transition-all duration-200 ${
          isDarkMode 
            ? "bg-slate-900 border-slate-800 text-slate-105" 
            : "bg-teal-900 border-teal-850 text-white shadow-md"
        }`}>
          <button
            onClick={() => setIsSidebarOpen(true)}
            className={`p-2 rounded-xl transition-all cursor-pointer ${
              isDarkMode 
                ? "bg-slate-800 hover:bg-slate-700 text-slate-200" 
                : "bg-teal-955/40 hover:bg-teal-850/60 text-white"
            }`}
            aria-label="Abrir menú"
          >
            <Menu className="h-5 w-5" />
          </button>
          <span className="font-extrabold text-sm tracking-tight flex items-center gap-2">
            <Stethoscope className="h-4 w-4" /> C.D. Zúñiga
          </span>
          <div className="w-9" />
        </header>
        {/* Gradientes decorativos */}
        <div className="absolute top-0 -left-4 w-96 h-96 rounded-full mix-blend-multiply filter blur-[128px] opacity-10 bg-teal-500"></div>
        <div className="absolute top-0 -right-4 w-96 h-96 rounded-full mix-blend-multiply filter blur-[128px] opacity-10 bg-emerald-400"></div>

        <div className="p-8 max-w-7xl w-full mx-auto space-y-8 flex-1 z-10">
          
          {/* =============================================================== */}
          {/* VISTA 1: INICIO */}
          {/* =============================================================== */}
          {activeTab === "inicio" && (
            <div className="space-y-8 animate-[fadeIn_0.2s_ease-out]">
              {/* Tarjeta Bienvenida */}
              <div className={`p-8 rounded-3xl border shadow-xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 relative overflow-hidden transition-all duration-200 ${
                isDarkMode 
                  ? "bg-slate-900 border-slate-800 text-slate-100" 
                  : "bg-gradient-to-r from-teal-950 via-teal-900 to-emerald-950 border-teal-850 text-white shadow-2xl"
              }`}>
                <div className="space-y-2 z-10">
                  <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
                    isDarkMode 
                      ? "bg-emerald-500/20 border border-emerald-500/30 text-emerald-400" 
                      : "bg-yellow-400/20 border border-yellow-400/30 text-yellow-300"
                  }`}>
                    <Sparkles className="h-3 w-3 animate-pulse" /> Clínica Dental Zúñiga
                  </div>
                  <h2 className="text-3xl font-extrabold tracking-tight text-white">¡Bienvenido, Dr. Jean Carlos Zúñiga!</h2>
                  <p className={`text-xs max-w-xl ${isDarkMode ? "text-slate-400" : "text-teal-150"}`}>
                    Auditoría de expedientes técnicos clínicos habilitada. Registre historias de filiación, dibuje diagnósticos iniciales y planifique cobros de tratamientos.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => { setActiveTab("pacientes"); setIsRegisteringNewPaciente(true); }}
                  className={`flex items-center justify-center gap-2 text-xs font-bold px-5 py-3 rounded-xl shadow-lg transition-all hover:scale-[1.03] cursor-pointer ${
                    isDarkMode 
                      ? "bg-emerald-600 hover:bg-emerald-500 text-white" 
                      : "bg-yellow-400 hover:bg-yellow-350 text-teal-950 font-black shadow-yellow-400/20"
                  }`}
                >
                  <PlusCircle className="h-4.5 w-4.5" /> Registrar Historia Clínica
                </button>
              </div>

              {/* Estadísticas */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                  { label: "Historias Clínicas", value: pacientes.length, icon: Users, color: isDarkMode ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/10" : "bg-teal-50 border-teal-100 text-teal-700" },
                  { label: "Tratamientos Activos", value: tratamientos.filter(t => t.estado === "presupuesto_aceptado").length || "0", icon: Activity, color: isDarkMode ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/10" : "bg-emerald-50 border-emerald-100 text-emerald-700" },
                  { label: "Presupuestos Pendientes", value: tratamientos.filter(t => t.estado === "presupuesto_pendiente").length || "0", icon: FileText, color: isDarkMode ? "bg-amber-500/10 text-amber-450 border-amber-500/10" : "bg-amber-50 border-amber-100 text-amber-700" },
                  { label: "Saldo por Cobrar", value: `s/. ${tratamientos.reduce((acc, c) => acc + c.saldo, 0).toFixed(2)}`, icon: DollarSign, color: isDarkMode ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/10" : "bg-teal-50 border-teal-100 text-teal-700" }
                ].map((stat, i) => (
                  <div key={i} className={`p-6 border rounded-2xl flex flex-col justify-between shadow-md transition-colors ${
                    isDarkMode ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"
                  }`}>
                    <div className="flex justify-between items-start">
                      <div className={`p-3 rounded-xl border ${stat.color}`}><stat.icon className="h-5 w-5" /></div>
                      <span className={`text-[9px] font-bold uppercase tracking-widest ${isDarkMode ? "text-slate-550" : "text-slate-400"}`}>Admin <ArrowUpRight className="h-3 w-3" /></span>
                    </div>
                    <div className="mt-6 space-y-1">
                      <span className={`text-[10px] font-bold uppercase tracking-widest ${isDarkMode ? "text-slate-500" : "text-slate-450"}`}>{stat.label}</span>
                      <p className={`text-xl font-black ${isDarkMode ? "text-white" : "text-slate-800"}`}>{stat.value}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pacientes recientes */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className={`border rounded-3xl p-6 shadow-xl md:col-span-2 space-y-5 transition-colors ${
                  isDarkMode ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"
                }`}>
                  <div className="flex justify-between items-center border-b pb-4 border-slate-200 dark:border-slate-800">
                    <div>
                      <h3 className={`text-md font-bold flex items-center gap-2 ${isDarkMode ? "text-white" : "text-slate-800"}`}>
                        <Calendar className="h-5 w-5 text-teal-650" /> Consultas / Movimientos Recientes
                      </h3>
                      <p className="text-xs text-slate-500">Últimos tratamientos registrados en el consultorio</p>
                    </div>
                  </div>
                  <div className="divide-y divide-slate-200 dark:divide-slate-850">
                    {consultasHoy.length === 0 ? (
                      <div className="py-8 text-center text-xs text-slate-450">No hay movimientos registrados hoy.</div>
                    ) : (
                      consultasHoy.map((cita) => (
                        <div key={cita.id} className="py-4 flex justify-between items-center rounded-xl px-2">
                          <div className="flex gap-4 items-center">
                            <span className="text-xs font-black px-2.5 py-1.5 rounded-lg border text-center text-teal-655 bg-teal-50 border-teal-100 dark:bg-slate-950 dark:border-slate-850">
                              {new Date(cita.fecha).toLocaleDateString("es-ES")}
                            </span>
                            <div>
                              <p className={`text-sm font-bold ${isDarkMode ? "text-slate-200" : "text-slate-800"}`}>{cita.paciente?.nombre_completo}</p>
                              <p className="text-xs text-slate-500 truncate max-w-[320px]">{cita.paciente?.motivo_consulta || "Consulta de tratamiento"}</p>
                            </div>
                          </div>
                          <span className="text-[10px] font-bold px-2 py-1 rounded-full border bg-emerald-50 text-emerald-700 border-emerald-100 dark:bg-emerald-950/20 dark:text-emerald-400">
                            s/. {Number(cita.total_costo).toFixed(2)}
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                <div className={`border rounded-3xl p-6 shadow-xl space-y-6 transition-colors ${
                  isDarkMode ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"
                }`}>
                  <div>
                    <h3 className={`text-md font-bold flex items-center gap-2 ${isDarkMode ? "text-white" : "text-slate-800"}`}>
                      <Sparkles className="h-5 w-5 text-teal-650" /> Pacientes Recientes
                    </h3>
                    <p className="text-xs text-slate-500">Expedientes técnicos de acceso rápido</p>
                  </div>
                  <div className="space-y-3">
                    {pacientes.slice(0, 3).map((p) => (
                      <button
                        key={p.id}
                        onClick={() => { setSelectedPacienteId(p.id!); setActiveTab("expediente"); }}
                        className={`flex items-center justify-between p-3.5 border rounded-2xl w-full transition-all text-left group cursor-pointer ${
                          isDarkMode 
                            ? "bg-slate-950 hover:bg-slate-850 border-slate-850" 
                            : "bg-slate-50 hover:bg-slate-100 border-slate-200"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-lg ${isDarkMode ? "bg-emerald-500/10 text-emerald-400" : "bg-teal-500/10 text-teal-650"}`}><User className="h-4.5 w-4.5" /></div>
                          <div>
                            <h4 className={`text-xs font-bold group-hover:text-teal-600 dark:group-hover:text-emerald-400 transition-colors ${isDarkMode ? "text-slate-200" : "text-slate-850"}`}>{p.nombre_completo}</h4>
                            <p className="text-[9px] text-slate-500 truncate max-w-[150px]">DNI: {p.dni}</p>
                          </div>
                        </div>
                        <ChevronRight className="h-4 w-4 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* =============================================================== */}
          {/* VISTA 2: LISTA DE PACIENTES */}
          {/* =============================================================== */}
          {activeTab === "pacientes" && (
            <div className="space-y-8 animate-[fadeIn_0.2s_ease-out]">
              
              {isRegisteringNewPaciente ? (
                <div className={`border rounded-3xl p-6 shadow-xl space-y-6 transition-colors ${
                  isDarkMode ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"
                }`}>
                  <div className="flex justify-between items-center border-b pb-4 border-slate-200 dark:border-slate-800">
                    <div>
                      <h3 className={`text-lg font-bold flex items-center gap-2 ${isDarkMode ? "text-white" : "text-slate-800"}`}><User className="h-5 w-5 text-teal-655" /> Registro de Ficha e Historia Clínica</h3>
                      <p className="text-xs text-slate-500">Registre la filiación y dibuje el odontograma diagnóstico correspondiente</p>
                    </div>
                    <button onClick={() => { setIsRegisteringNewPaciente(false); setRegistroOdontograma({}); setRegistroEdad(0); }} className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                      isDarkMode ? "bg-slate-800 text-slate-350 hover:bg-slate-700" : "bg-slate-100 text-slate-655 hover:bg-slate-200"
                    }`}>Cancelar</button>
                  </div>
                  
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                    {/* Formulario */}
                    <div className="lg:col-span-5">
                      <HistoriaClinicaForm 
                        onSubmit={handleCreatePaciente} 
                        onCancel={() => { setIsRegisteringNewPaciente(false); setRegistroOdontograma({}); setRegistroEdad(0); }} 
                        onAgeChange={(age) => setRegistroEdad(age)}
                      />
                    </div>

                    {/* Odontograma Diagnóstico de Ingreso */}
                    <div className="lg:col-span-7 space-y-4">
                      <div className="p-4 bg-teal-500/5 dark:bg-emerald-500/5 border border-teal-500/10 dark:border-emerald-500/10 rounded-2xl">
                        <h4 className="text-xs font-bold text-teal-700 dark:text-emerald-450 flex items-center gap-1.5 uppercase tracking-wider">
                          <Activity className="h-4 w-4" /> Odontograma de Ingreso Reactivo
                        </h4>
                        <p className="text-[10px] text-slate-500 mt-1">
                          Dependiendo de la edad especificada (edad registrada: <span className="font-bold text-teal-600">{registroEdad} años</span>), se forzará la dentición correspondiente (adulto o infantil).
                        </p>
                      </div>
                      
                      <Odontograma 
                        key="odontograma-registro"
                        initialState={registroOdontograma} 
                        onChange={(s) => setRegistroOdontograma(s)} 
                        mode="diagnostic"
                        forceVista={getVistaPorEdad(registroEdad)}
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
                        <Users className="h-7 w-7 text-teal-655" /> Historias Clínicas
                      </h2>
                      <p className="text-xs text-slate-500">Búsqueda rápida de pacientes y consulta de alergias médicas</p>
                    </div>
                    <button
                      onClick={() => { setIsRegisteringNewPaciente(true); setRegistroOdontograma({}); setRegistroEdad(0); }}
                      className={`flex items-center justify-center gap-2 text-xs font-bold px-5 py-3 rounded-xl shadow-lg transition-all hover:scale-[1.02] w-full sm:w-auto cursor-pointer ${
                        isDarkMode 
                          ? "bg-emerald-600 hover:bg-emerald-500 text-white" 
                          : "bg-yellow-400 hover:bg-yellow-350 text-teal-950 font-black shadow-yellow-400/20"
                      }`}
                    >
                      <PlusCircle className="h-4.5 w-4.5" /> Registrar Historia Clínica
                    </button>
                  </div>

                  {/* Buscador */}
                  <div className={`flex p-4 border rounded-2xl items-center gap-3 shadow-md transition-colors ${
                    isDarkMode ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"
                  }`}>
                    <Search className="h-5 w-5 text-slate-450" />
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
                              : "bg-white border-slate-200 hover:border-slate-300"
                          }`}
                        >
                          <div className="space-y-4">
                            <div className="flex justify-between items-start">
                              <div>
                                <h3 className={`font-extrabold transition-colors text-sm group-hover:text-teal-650 dark:group-hover:text-emerald-450 ${
                                  isDarkMode ? "text-slate-200" : "text-slate-850"
                                }`}>{p.nombre_completo}</h3>
                                <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest block mt-0.5">DNI: {p.dni} &bull; {p.edad} años &bull; {p.sexo}</span>
                              </div>
                              {p.alergias && p.alergias.toLowerCase() !== "ninguna" && p.alergias.toLowerCase() !== "ninguno" && p.alergias.trim() !== "" && (
                                <span className="p-1 bg-red-500/10 text-red-500 rounded-lg border border-red-500/15" title={p.alergias}>
                                  <ShieldAlert className="h-4 w-4" />
                                </span>
                              )}
                            </div>
                            <div className="space-y-1.5 text-[10px] border-t pt-3 border-slate-200/60 dark:border-slate-800">
                              <div className="flex items-start gap-1"><span className="font-bold text-slate-500 min-w-[50px]">Motivo:</span><p className={`font-semibold truncate ${isDarkMode ? "text-slate-400":"text-slate-600"}`}>{p.motivo_consulta}</p></div>
                              {p.alergias && <div className="flex items-start gap-1"><span className="font-bold text-red-500 min-w-[50px]">Alergias:</span><p className="text-red-550 font-bold truncate">{p.alergias}</p></div>}
                            </div>
                          </div>
                          <div className="flex justify-between items-center border-t pt-3 mt-4 border-slate-200/60 dark:border-slate-800">
                            <span className="text-[9px] font-bold text-slate-400 flex items-center gap-1"><Calendar className="h-3 w-3" /> Registro: {new Date(p.fecha_registro || "").toLocaleDateString("es-ES")}</span>
                            <div className="flex gap-1.5 items-center">
                              <button
                                onClick={(e) => { e.stopPropagation(); handleDeletePaciente(p.id!); }}
                                className="p-1 rounded text-slate-400 hover:text-red-500 hover:bg-red-500/5 transition-colors"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                              <span className="text-[10px] font-black text-teal-650 group-hover:translate-x-0.5 transition-transform flex items-center gap-0.5">Expediente <ChevronRight className="h-3 w-3" /></span>
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
          {/* VISTA 3: EXPEDIENTE CLÍNICO */}
          {/* =============================================================== */}
          {activeTab === "expediente" && selectedPaciente && (
            <div className="space-y-6 animate-[fadeIn_0.2s_ease-out]">
              {/* Cabecera del Paciente */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b pb-4 border-slate-200 dark:border-slate-800">
                <div className="space-y-1">
                  <div className="flex items-center gap-3">
                    <h2 className={`text-2xl font-black ${isDarkMode ? "text-white" : "text-slate-850"}`}>{selectedPaciente.nombre_completo}</h2>
                    <span className="text-[10px] font-extrabold px-2.5 py-1 rounded-full border uppercase bg-teal-50 border-teal-100 text-teal-700 dark:bg-slate-900 dark:border-slate-800">DNI: {selectedPaciente.dni}</span>
                  </div>
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{selectedPaciente.edad} años &bull; {selectedPaciente.sexo} &bull; Ocupación: {selectedPaciente.ocupacion || "No registrada"}</p>
                </div>
                <button
                  onClick={() => { setSelectedPacienteId(null); setActiveTab("pacientes"); }}
                  className={`flex items-center gap-1.5 text-xs font-bold px-4 py-2 rounded-xl border transition-all ${
                    isDarkMode 
                      ? "bg-slate-850 border-slate-750 text-slate-300 hover:bg-slate-750" 
                      : "bg-white border-slate-200 text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  <ArrowLeft className="h-4 w-4" /> Volver a Lista
                </button>
              </div>

              {/* TABS DE EXPEDIENTE: Historia, Diagnóstico Inicial, Presupuesto, Sesiones */}
              <div className="flex border-b border-slate-200 dark:border-slate-800 text-xs font-bold gap-2">
                <button
                  onClick={() => setActiveSubTab("historia")}
                  className={`py-3 px-4 border-b-2 transition-all ${
                    activeSubTab === "historia" 
                      ? "border-teal-600 text-teal-650 dark:text-emerald-450 font-black" 
                      : "border-transparent text-slate-500 hover:text-slate-750"
                  }`}
                >
                  1. Filiación y Alergias
                </button>
                <button
                  onClick={() => setActiveSubTab("evaluacion")}
                  className={`py-3 px-4 border-b-2 transition-all ${
                    activeSubTab === "evaluacion" 
                      ? "border-teal-600 text-teal-650 dark:text-emerald-450 font-black" 
                      : "border-transparent text-slate-500 hover:text-slate-750"
                  }`}
                >
                  2. Evaluación Inicial (Diagnóstico)
                </button>
                <button
                  onClick={() => setActiveSubTab("presupuesto")}
                  className={`py-3 px-4 border-b-2 transition-all ${
                    activeSubTab === "presupuesto" 
                      ? "border-teal-600 text-teal-650 dark:text-emerald-450 font-black" 
                      : "border-transparent text-slate-500 hover:text-slate-750"
                  }`}
                >
                  3. Plan de Tratamiento (Presupuesto)
                </button>
                <button
                  onClick={() => setActiveSubTab("sesiones")}
                  className={`py-3 px-4 border-b-2 transition-all ${
                    activeSubTab === "sesiones" 
                      ? "border-teal-600 text-teal-650 dark:text-emerald-450 font-black" 
                      : "border-transparent text-slate-500 hover:text-slate-750"
                  }`}
                >
                  4. Control de Sesiones
                </button>
              </div>

              {/* CONTENIDO SUB-TABS */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                
                {/* SUB-TAB 1: FILIACIÓN */}
                {activeSubTab === "historia" && (
                  <div className="lg:col-span-12 space-y-6">
                    {/* Cuadro Simple de Saldos Independientes */}
                    <div className={`border rounded-3xl p-6 shadow-md transition-colors ${
                      isDarkMode ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"
                    }`}>
                      <div className="border-b pb-3 mb-4 border-slate-250 dark:border-slate-800">
                        <h3 className={`text-md font-bold flex items-center gap-2 ${isDarkMode ? "text-white" : "text-slate-850"}`}>
                          <DollarSign className="h-5 w-5 text-emerald-650 dark:text-emerald-400" /> Registro de Procedimiento y Saldo Independiente
                        </h3>
                        <p className="text-xs text-slate-500">Procedimientos y saldos independientes asociados al paciente</p>
                      </div>

                      {/* Formulario de Registro */}
                      <form onSubmit={handleCreateSaldoIndependiente} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end mb-6 bg-slate-50 dark:bg-slate-950 p-4 rounded-2xl border border-slate-150 dark:border-slate-850">
                        <div>
                          <label className="block text-[10px] font-bold text-slate-450 uppercase mb-1 flex items-center gap-1">
                            <Calendar className="h-3 w-3" /> Fecha
                          </label>
                          <input
                            type="date"
                            value={nuevoSaldoFecha}
                            onChange={(e) => setNuevoSaldoFecha(e.target.value)}
                            className={`w-full px-3 py-2 rounded-xl text-xs border focus:outline-none focus:ring-1 focus:ring-emerald-500 transition-colors ${
                              isDarkMode ? "bg-slate-900 border-slate-800 text-white" : "bg-white border-slate-200 text-slate-800"
                            }`}
                          />
                        </div>
                        <div className="md:col-span-2">
                          <label className="block text-[10px] font-bold text-slate-450 uppercase mb-1 flex items-center gap-1">
                            <FileText className="h-3 w-3" /> Procedimiento
                          </label>
                          <input
                            type="text"
                            placeholder="Ej: Radiografía, Consulta de Emergencia, etc."
                            value={nuevoSaldoProcedimiento}
                            onChange={(e) => setNuevoSaldoProcedimiento(e.target.value)}
                            className={`w-full px-3 py-2 rounded-xl text-xs border focus:outline-none focus:ring-1 focus:ring-emerald-500 transition-colors ${
                              isDarkMode ? "bg-slate-900 border-slate-800 text-white" : "bg-white border-slate-200 text-slate-800"
                            }`}
                          />
                        </div>
                        <div className="flex gap-2 items-end">
                          <div className="flex-1">
                            <label className="block text-[10px] font-bold text-slate-450 uppercase mb-1 flex items-center gap-1">
                              <DollarSign className="h-3 w-3" /> Saldo (s/.)
                            </label>
                            <input
                              type="number"
                              step="0.01"
                              placeholder="0.00"
                              value={nuevoSaldoMonto || ""}
                              onChange={(e) => setNuevoSaldoMonto(parseFloat(e.target.value) || 0)}
                              className={`w-full px-3 py-2 rounded-xl text-xs border focus:outline-none focus:ring-1 focus:ring-emerald-500 transition-colors ${
                                isDarkMode ? "bg-slate-900 border-slate-800 text-white" : "bg-white border-slate-200 text-slate-800"
                              }`}
                            />
                          </div>
                          <button
                            type="submit"
                            className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-4 py-2 rounded-xl shadow-sm transition-all hover:scale-[1.02] flex items-center gap-1 h-9 cursor-pointer"
                          >
                            <Plus className="h-4 w-4" /> Registrar
                          </button>
                        </div>
                      </form>

                      {/* Tabla de Saldos */}
                      {saldosIndependientes.length === 0 ? (
                        <p className="text-xs text-slate-450 font-semibold text-center py-4">
                          No registra procedimientos con saldos independientes aún.
                        </p>
                      ) : (
                        <div className="overflow-x-auto rounded-xl border border-slate-150 dark:border-slate-800">
                          <table className="w-full text-left text-xs border-collapse">
                            <thead>
                              <tr className="bg-slate-50 dark:bg-slate-850 text-slate-500 font-bold border-b">
                                <th className="p-3 w-32">Fecha</th>
                                <th className="p-3">Procedimiento</th>
                                <th className="p-3 text-right w-32">Saldo</th>
                                <th className="p-3 text-center w-20">Acciones</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-150 dark:divide-slate-800">
                              {saldosIndependientes.map((item) => (
                                <tr key={item.id} className="hover:bg-slate-50/20 dark:hover:bg-slate-850/20">
                                  <td className="p-3 font-semibold text-slate-655 dark:text-slate-350">
                                    {new Date(item.fecha).toLocaleDateString("es-ES")}
                                  </td>
                                  <td className="p-3 font-bold text-slate-800 dark:text-white">
                                    {item.procedimiento}
                                  </td>
                                  <td className="p-3 text-right font-black text-slate-900 dark:text-white whitespace-nowrap">
                                    s/. {item.saldo.toFixed(2)}
                                  </td>
                                  <td className="p-3 text-center">
                                    <button
                                      onClick={() => handleDeleteSaldoIndependiente(item.id!)}
                                      className="text-red-500 hover:text-red-700 transition-colors p-1 rounded hover:bg-red-50 dark:hover:bg-red-950/20 cursor-pointer"
                                      title="Eliminar saldo"
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </button>
                                  </td>
                                </tr>
                              ))}
                              {/* Fila del Total */}
                              <tr className="bg-slate-50/50 dark:bg-slate-900/50 font-bold border-t-2 border-slate-200 dark:border-slate-755">
                                <td colSpan={2} className="p-3 text-right text-slate-500">Total Saldo Pendiente:</td>
                                <td className="p-3 text-right font-black text-emerald-600 dark:text-emerald-450 text-sm whitespace-nowrap">
                                  s/. {saldosIndependientes.reduce((acc, curr) => acc + curr.saldo, 0).toFixed(2)}
                                </td>
                                <td></td>
                              </tr>
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>
                    <div className={`border rounded-3xl p-6 shadow-md transition-colors ${
                      isDarkMode ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"
                    }`}>
                      {isEditingHistory ? (
                        <div className="space-y-4">
                          <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400">Editar Historia y Antecedentes</h3>
                          <HistoriaClinicaForm initialData={selectedPaciente} onSubmit={handleUpdateHistory} onCancel={() => setIsEditingHistory(false)} />
                        </div>
                      ) : (
                        <div className="space-y-6">
                          <div className="flex justify-between items-center border-b pb-3 border-slate-250 dark:border-slate-800">
                            <div>
                              <h3 className={`text-md font-bold ${isDarkMode ? "text-white" : "text-slate-800"}`}>Filiación y Anamnesis</h3>
                              <p className="text-xs text-slate-500">Datos personales de contacto y médicos</p>
                            </div>
                            <button 
                              onClick={() => setIsEditingHistory(true)} 
                              className={`flex items-center gap-1 text-[11px] font-extrabold px-3.5 py-2 rounded-xl border transition-colors ${
                                isDarkMode ? "bg-slate-800 border-slate-750 text-slate-300 hover:bg-slate-750" : "bg-slate-50 border-slate-200 text-slate-655 hover:bg-slate-100"
                              }`}
                            >
                              <Edit3 className="h-3.5 w-3.5" /> Editar Antecedentes
                            </button>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs font-semibold">
                            <div className="space-y-3">
                              <h4 className="text-[10px] font-extrabold text-slate-450 uppercase tracking-widest">Datos Generales</h4>
                              <div><span className="text-slate-400 text-[9px] block">Nombre Completo:</span><span className="text-slate-700 dark:text-slate-200">{selectedPaciente.nombre_completo}</span></div>
                              <div><span className="text-slate-400 text-[9px] block">DNI / Pasaporte:</span><span className="text-slate-700 dark:text-slate-200">{selectedPaciente.dni}</span></div>
                              <div><span className="text-slate-400 text-[9px] block">Edad / Sexo:</span><span className="text-slate-700 dark:text-slate-200">{selectedPaciente.edad} años &bull; {selectedPaciente.sexo}</span></div>
                              <div><span className="text-slate-400 text-[9px] block">Teléfono / WhatsApp:</span><span className="text-slate-700 dark:text-slate-200">{selectedPaciente.telefono || "No especificado"}</span></div>
                              <div><span className="text-slate-400 text-[9px] block">Dirección:</span><span className="text-slate-700 dark:text-slate-200">{selectedPaciente.direccion || "No registrada"}</span></div>
                            </div>
                            <div className="space-y-3 border-l pl-6 border-slate-200 dark:border-slate-800">
                              <h4 className="text-[10px] font-extrabold text-slate-450 uppercase tracking-widest">Antecedentes Médicos</h4>
                              <div className={`p-3 rounded-xl border ${
                                selectedPaciente.alergias && selectedPaciente.alergias.toLowerCase() !== "ninguna" && selectedPaciente.alergias.toLowerCase() !== "ninguno"
                                  ? "bg-red-500/10 border-red-500/20 text-red-600"
                                  : "bg-slate-50 dark:bg-slate-950 border-slate-150 dark:border-slate-850 text-slate-500"
                              }`}>
                                <span className="font-extrabold flex items-center gap-1 text-[9px] uppercase"><ShieldAlert className="h-3.5 w-3.5" /> Alergias:</span>
                                <p className="text-xs font-bold leading-tight mt-1">{selectedPaciente.alergias || "Ninguna alergia registrada."}</p>
                              </div>
                              <div><span className="text-slate-400 text-[9px] block">Enfermedades Sistémicas:</span><p className="text-slate-655 dark:text-slate-300 font-medium leading-tight">{selectedPaciente.enfermedades || "Ninguna."}</p></div>
                              <div><span className="text-slate-400 text-[9px] block">Medicamentos Consumidos:</span><p className="text-slate-655 dark:text-slate-300 font-medium leading-tight">{selectedPaciente.medicamentos_actuales || "Ninguno."}</p></div>
                              <div><span className="text-slate-400 text-[9px] block">Hemorragias / Coagulación:</span><p className="text-slate-655 dark:text-slate-300 font-medium leading-tight">{selectedPaciente.hemorragias || "Ninguna."}</p></div>
                              <div><span className="text-slate-400 text-[9px] block">Motivo de Consulta:</span><p className="text-slate-655 dark:text-slate-300 font-bold leading-tight">{selectedPaciente.motivo_consulta}</p></div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Historial Rápido de Sesiones del Paciente */}
                    <div className={`border rounded-3xl p-6 shadow-md transition-colors ${
                      isDarkMode ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"
                    } mt-6`}>
                      <div className="border-b pb-3 mb-4 border-slate-250 dark:border-slate-800 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                        <div>
                          <h3 className={`text-md font-bold flex items-center gap-2 ${isDarkMode ? "text-white" : "text-slate-850"}`}>
                            <Clock className="h-5 w-5 text-teal-650" /> Historial Rápido de Sesiones Clínicas
                          </h3>
                          <p className="text-xs text-slate-500">Últimas citas y evoluciones de todos los tratamientos</p>
                        </div>
                        <button
                          onClick={triggerPrintHistory}
                          className="flex items-center gap-1.5 bg-teal-655 hover:bg-teal-700 text-white font-bold text-[11px] px-3.5 py-2 rounded-xl transition-all shadow-md cursor-pointer hover:scale-[1.02]"
                        >
                          <Printer className="h-3.5 w-3.5" /> Exportar Historial (PDF)
                        </button>
                      </div>

                      {(() => {
                        // Obtener todas las sesiones de todos los tratamientos del paciente actual
                        const todasLasSesiones = tratamientos.flatMap((tr) => {
                          const result = [];
                          
                          // Para planes antiguos o registros únicos que no tienen array de 'sesiones' pero sí procedimientos
                          if ((!tr.sesiones || tr.sesiones.length === 0) && tr.procedimientos && tr.procedimientos.length > 0) {
                            const piezasSet = new Set<string>();
                            tr.procedimientos.forEach(p => {
                              if (p.piezas) p.piezas.split(",").map(x => x.trim()).filter(x => x).forEach(x => piezasSet.add(x));
                            });
                            
                            result.push({
                              fecha: tr.fecha,
                              doctor: "Jean Carlos Zúñiga",
                              procedimientosTratados: tr.procedimientos.map(p => p.nombre_procedimiento),
                              piezasTratadas: Array.from(piezasSet),
                              nota: tr.procedimientos.map(p => p.notas).filter(n => n).join(" | ") || "Registro inicial de Tratamiento / Procedimientos",
                              pago: tr.adelanto,
                              tratamientoFecha: tr.fecha,
                              tratamientoId: tr.id
                            });
                          }
                          
                          // Agregar las sesiones reales registradas
                          if (tr.sesiones && tr.sesiones.length > 0) {
                            result.push(...tr.sesiones.map((ses) => ({
                              ...ses,
                              tratamientoFecha: tr.fecha,
                              tratamientoId: tr.id
                            })));
                          }
                          
                          return result;
                        }).sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime());

                        if (todasLasSesiones.length === 0) {
                          return (
                            <p className="text-xs text-slate-450 font-semibold text-center py-6">
                              No registra sesiones de evolución clínica aún.
                            </p>
                          );
                        }

                        return (
                          <div className="overflow-x-auto rounded-xl border border-slate-150 dark:border-slate-800">
                            <table className="w-full text-left text-xs border-collapse">
                              <thead>
                                <tr className="bg-slate-50 dark:bg-slate-850 text-slate-500 font-bold border-b">
                                  <th className="p-3">Fecha y Hora</th>
                                  <th className="p-3">Odontólogo</th>
                                  <th className="p-3">Procedimientos y Piezas</th>
                                  <th className="p-3">Evolución / Notas</th>
                                  <th className="p-3 text-right">Pago</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-slate-150 dark:divide-slate-800">
                                {todasLasSesiones.map((ses, idx) => (
                                  <tr key={idx} className="hover:bg-slate-50/20 dark:hover:bg-slate-850/20">
                                    <td className="p-3 font-semibold whitespace-nowrap">
                                      <div>{new Date(ses.fecha).toLocaleDateString("es-ES")}</div>
                                      <div className="text-[10px] text-slate-450 font-medium">
                                        {new Date(ses.fecha).toLocaleTimeString("es-ES", {hour: '2-digit', minute:'2-digit'})}
                                      </div>
                                    </td>
                                    <td className="p-3 font-bold text-slate-700 dark:text-slate-350">
                                      Dr. {ses.doctor || "Jean Carlos Zúñiga"}
                                    </td>
                                    <td className="p-3 space-y-1">
                                      <div className="flex flex-wrap gap-1">
                                        {ses.procedimientosTratados && ses.procedimientosTratados.map((proc, pIdx) => (
                                          <span key={pIdx} className="text-[9px] font-black uppercase bg-teal-50 text-teal-700 dark:bg-emerald-950/20 dark:text-emerald-400 border border-teal-100 dark:border-emerald-900 rounded px-1.5 py-0.2">
                                            {proc}
                                          </span>
                                        ))}
                                      </div>
                                      {ses.piezasTratadas && ses.piezasTratadas.length > 0 && (
                                        <div className="text-[9px] text-slate-450 font-bold">
                                          Piezas: <span className="text-teal-600 font-extrabold">{ses.piezasTratadas.join(", ")}</span>
                                        </div>
                                      )}
                                    </td>
                                    <td className="p-3 text-slate-655 dark:text-slate-300 font-medium max-w-xs break-words">
                                      {ses.nota}
                                    </td>
                                    <td className="p-3 text-right font-black text-emerald-600 whitespace-nowrap">
                                      {ses.pago && ses.pago > 0 ? `s/. ${ses.pago.toFixed(2)}` : "--"}
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        );
                      })()}
                    </div>
                  </div>
                )}

                {/* SUB-TAB 2: EVALUACIÓN INICIAL */}
                {activeSubTab === "evaluacion" && (
                  <div className="lg:col-span-12 space-y-6">
                    <div className="p-4 bg-teal-500/5 border border-teal-500/10 rounded-2xl flex justify-between items-center">
                      <div>
                        <h4 className="text-xs font-bold text-teal-700 dark:text-teal-400 flex items-center gap-1.5 uppercase tracking-wider">
                          <Activity className="h-4 w-4" /> Diagnóstico Clínico de Ingreso
                        </h4>
                        <p className="text-[10px] text-slate-500 mt-0.5">
                          Edite las patologías existentes de ingreso (caries, fractura, movilidad, diastemas) haciendo clic en las piezas.
                        </p>
                      </div>
                      <button
                        onClick={() => handleSaveOdontogramaInicial(odontogramaInicial)}
                        className="flex items-center gap-1.5 bg-teal-650 hover:bg-teal-700 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-md cursor-pointer"
                      >
                        <Save className="h-4 w-4" /> Guardar Diagnóstico de Ingreso
                      </button>
                    </div>

                    <Odontograma
                      initialState={odontogramaInicial}
                      onChange={(nuevoEstado) => setOdontogramaInicial(nuevoEstado)}
                      mode="diagnostic"
                      forceVista={getVistaPorEdad(selectedPaciente.edad)}
                    />
                  </div>
                )}

                {/* SUB-TAB 3: PRESUPUESTO & PLAN DE TRATAMIENTO */}
                {activeSubTab === "presupuesto" && (
                  <>
                    {/* Botones de selección de plan */}
                    <div className="lg:col-span-12 space-y-4 mb-4">
                      <div className="flex border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden text-xs font-bold bg-slate-100 dark:bg-slate-900 w-max self-center">
                        <button
                          onClick={() => setSelectedTratamientoDetalle(null)}
                          className={`px-4 py-2 ${!selectedTratamientoDetalle ? "bg-white dark:bg-slate-950 text-teal-600 dark:text-emerald-400 shadow-sm" : "text-slate-500"}`}
                        >
                          Crear Nuevo Plan / Presupuesto
                        </button>
                        {tratamientos.map((t) => (
                          <button
                            key={t.id}
                            onClick={() => setSelectedTratamientoDetalle(t)}
                            className={`px-4 py-2 border-l border-slate-200 dark:border-slate-800 ${selectedTratamientoDetalle?.id === t.id ? "bg-white dark:bg-slate-950 text-teal-600 dark:text-emerald-400 shadow-sm" : "text-slate-500"}`}
                          >
                            Plan: {new Date(t.fecha).toLocaleDateString("es-ES")} ({t.estado === "presupuesto_aceptado" ? "Aceptado" : "Pendiente"})
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Contenido Principal de Presupuesto */}
                    <div className="lg:col-span-12">
                      {!selectedTratamientoDetalle ? (
                        <PresupuestoCalculador
                          catalogo={catalogo}
                          onSubmit={handleSaveTreatment}
                          activeSelectedTeeth={activeSelectedTeeth}
                          onActiveSelectedTeethChange={(teeth) => setActiveSelectedTeeth(teeth)}
                          onProceduresChange={(procs) => setActivePlanProcedures(procs)}
                          onActiveProcedureChange={(name) => setActiveProcedureName(name)}
                          middleContent={
                            <div className="space-y-4 mt-6 mb-6">
                              <div className="flex justify-between items-center">
                                <span className="text-xs font-bold text-slate-450 uppercase tracking-wider">
                                  Odontograma Planificación Activa
                                </span>
                              </div>
                              <Odontograma
                                initialState={odontogramaInicial}
                                readOnly={false}
                                mode="treatment"
                                forceVista={getVistaPorEdad(selectedPaciente.edad)}
                                procedimientosPlanteados={[
                                  ...activePlanProcedures,
                                  ...(activeProcedureName && activeSelectedTeeth.length > 0
                                    ? [{
                                        nombre_procedimiento: activeProcedureName,
                                        piezas: activeSelectedTeeth.join(", "),
                                        notas: ""
                                      }]
                                    : [])
                                ]}
                                onToothClick={handleToothClickInPlan}
                              />
                            </div>
                          }
                        />
                      ) : (
                        <div className="space-y-6">
                          {/* Odontograma del plan guardado */}
                          <div className="space-y-4">
                            <div className="flex justify-between items-center">
                              <span className="text-xs font-bold text-slate-450 uppercase tracking-wider">
                                {`Plan de tratamiento: ${selectedTratamientoDetalle.estado === "presupuesto_aceptado" ? "Aceptado" : "Pendiente"}`}
                              </span>
                            </div>
                            <Odontograma
                              initialState={odontogramaInicial}
                              readOnly={true}
                              mode="final"
                              forceVista={getVistaPorEdad(selectedPaciente.edad)}
                              procedimientosPlanteados={selectedTratamientoDetalle.procedimientos}
                              onToothClick={handleToothClickInPlan}
                            />
                          </div>
                        <div className={`border rounded-3xl p-6 shadow-xl space-y-6 transition-colors ${
                          isDarkMode ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"
                        }`}>
                          <div className="flex justify-between items-center border-b pb-4 border-slate-200 dark:border-slate-800">
                            <div>
                              <h3 className={`text-md font-bold ${isDarkMode ? "text-white" : "text-slate-800"}`}>Resumen de Plan Guardado</h3>
                              <p className="text-xs text-slate-500">Registrado el {new Date(selectedTratamientoDetalle.fecha).toLocaleDateString("es-ES")}</p>
                            </div>
                            <div className="flex gap-2">
                              {selectedTratamientoDetalle.estado === "presupuesto_pendiente" && (
                                <button
                                  onClick={() => handleAceptarPresupuesto(selectedTratamientoDetalle.id)}
                                  className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-4 py-2 rounded-xl shadow-md cursor-pointer"
                                >
                                  <ClipboardCheck className="h-4 w-4" /> Aceptar Presupuesto
                                </button>
                              )}
                              <button
                                onClick={() => triggerPrintWindow(selectedTratamientoDetalle)}
                                className={`flex items-center gap-1.5 text-xs font-bold px-4 py-2 rounded-xl border transition-all ${
                                  isDarkMode ? "bg-slate-850 hover:bg-slate-800 text-slate-200" : "bg-slate-100 hover:bg-slate-200 text-slate-700"
                                }`}
                              >
                                <Printer className="h-4 w-4" /> Exportar Presupuesto
                              </button>
                              <button
                                onClick={() => handleDeleteTreatment(selectedTratamientoDetalle.id)}
                                className="p-2 border border-red-200 dark:border-red-950/20 text-red-500 rounded-xl hover:bg-red-500/10"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </div>

                          <div className="overflow-x-auto rounded-xl border border-slate-150 dark:border-slate-800">
                            <table className="w-full text-left text-xs border-collapse">
                              <thead>
                                <tr className="bg-slate-50 dark:bg-slate-850 text-slate-500 font-bold border-b">
                                  <th className="p-3">Procedimiento</th>
                                  <th className="p-3 text-center">Piezas</th>
                                  <th className="p-3 text-center">Cant.</th>
                                  <th className="p-3">Notas</th>
                                  <th className="p-3 text-right">Costo Total</th>
                                </tr>
                              </thead>
                              <tbody>
                                {selectedTratamientoDetalle.procedimientos.map((p, idx) => (
                                  <tr key={idx} className="hover:bg-slate-50/20">
                                    <td className="p-3 font-bold">{p.nombre_procedimiento}</td>
                                    <td className="p-3 text-center font-extrabold text-teal-650">{p.piezas || "--"}</td>
                                    <td className="p-3 text-center font-bold">{p.cantidad}</td>
                                    <td className="p-3 text-slate-450">{p.notas || "--"}</td>
                                    <td className="p-3 text-right font-black">s/. {p.costo_final.toFixed(2)}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>

                          <div className="grid grid-cols-3 gap-3 text-xs">
                            <div className="bg-slate-50 dark:bg-slate-850 p-4 rounded-xl border text-center"><span className="text-[10px] text-slate-500 block uppercase font-bold">Total del Plan</span><span className="font-black text-slate-855 dark:text-slate-100 mt-1 block">s/. {selectedTratamientoDetalle.total.toFixed(2)}</span></div>
                            <div className="bg-slate-50 dark:bg-slate-855 p-4 rounded-xl border text-center text-emerald-600"><span className="text-[10px] block uppercase font-bold">Adelanto Cobrado</span><span className="font-black mt-1 block">s/. {selectedTratamientoDetalle.adelanto.toFixed(2)}</span></div>
                            <div className="bg-slate-50 dark:bg-slate-855 p-4 rounded-xl border text-center text-amber-500"><span className="text-[10px] block uppercase font-bold">Saldo Pendiente</span><span className="font-black mt-1 block">s/. {selectedTratamientoDetalle.saldo.toFixed(2)}</span></div>
                          </div>
                        </div>
                        </div>
                      )}
                    </div>
                  </>
                )}

                {/* SUB-TAB 4: CONTROL DE SESIONES */}
                {activeSubTab === "sesiones" && (
                  <div className="lg:col-span-12 space-y-6">
                    {/* Seleccionar qué tratamiento o presupuesto accepted visualizar */}
                    {tratamientos.filter(t => t.estado === "presupuesto_aceptado").length === 0 ? (
                      <div className="text-center py-12 border border-dashed rounded-3xl">
                        <AlertCircle className="h-10 w-10 mx-auto text-slate-350 mb-2 animate-bounce" />
                        <p className="text-sm font-bold text-slate-450">No registra ningún Plan de Tratamiento Aceptado</p>
                        <p className="text-xs text-slate-400 mt-0.5">Primero cree un plan de presupuesto en la pestaña anterior y haga clic en &quot;Aceptar Presupuesto&quot;.</p>
                      </div>
                    ) : (
                      <div className="space-y-6">
                        {/* Selector de Plan de Sesiones */}
                        <div className="flex gap-2">
                          {tratamientos.filter(t => t.estado === "presupuesto_aceptado").map((tr, i) => (
                            <button
                              key={tr.id}
                              onClick={() => setSelectedTratamientoDetalle(tr)}
                              className={`px-4 py-2 border rounded-xl text-xs font-bold transition-all ${
                                selectedTratamientoDetalle?.id === tr.id
                                  ? "bg-teal-600 text-white shadow-md border-teal-650"
                                  : "bg-white dark:bg-slate-900 text-slate-500 border-slate-200"
                              }`}
                            >
                              Tratamiento Aceptado ({new Date(tr.fecha).toLocaleDateString("es-ES")})
                            </button>
                          ))}
                        </div>

                        {selectedTratamientoDetalle && selectedTratamientoDetalle.estado === "presupuesto_aceptado" && (
                          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                            
                            {/* Formulario de Registro de Sesión */}
                            <div className={`lg:col-span-5 border rounded-3xl p-6 shadow-md space-y-5 transition-colors ${
                              isDarkMode ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"
                            }`}>
                              <div>
                                <h3 className="text-sm font-bold flex items-center gap-1.5"><Clock className="h-4.5 w-4.5 text-teal-655" /> Registrar Cita / Sesión de Trabajo</h3>
                                <p className="text-[11px] text-slate-500">Log de notas clínicas de la evolución del paciente</p>
                              </div>

                              <div className="space-y-3.5 text-xs">
                                {/* Procedimientos a tratar en la sesión */}
                                <div className="space-y-1.5">
                                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Procedimientos Realizados</label>
                                  <div className="space-y-1 bg-slate-50 dark:bg-slate-950 p-3 rounded-xl border max-h-36 overflow-y-auto">
                                    {selectedTratamientoDetalle.procedimientos.map((p) => (
                                      <label key={p.id} className="flex items-center gap-2 font-bold text-slate-700 dark:text-slate-300">
                                        <input
                                          type="checkbox"
                                          checked={nuevaSesionProcs.includes(p.nombre_procedimiento)}
                                          onChange={(e) => {
                                            if (e.target.checked) {
                                              setNuevaSesionProcs(prev => [...prev, p.nombre_procedimiento]);
                                            } else {
                                              setNuevaSesionProcs(prev => prev.filter(x => x !== p.nombre_procedimiento));
                                            }
                                          }}
                                          className="rounded border-slate-300 dark:border-slate-850"
                                        />
                                        {p.nombre_procedimiento} {p.piezas ? `(Pieza: ${p.piezas})` : ""}
                                      </label>
                                    ))}
                                  </div>
                                </div>

                                {/* Nota */}
                                <div className="space-y-1.5">
                                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Notas de la Sesión</label>
                                  <textarea
                                    value={nuevaSesionNota}
                                    onChange={(e) => setNuevaSesionNota(e.target.value)}
                                    placeholder="Detalle de materiales, anestesia, respuesta clínica..."
                                    rows={4}
                                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl py-2.5 px-3 focus:outline-none focus:border-teal-500"
                                  />
                                </div>

                                {/* Odontólogo Tratante */}
                                <div className="space-y-1.5">
                                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Odontólogo Tratante</label>
                                  <select
                                    value={nuevaSesionDoctor}
                                    onChange={(e) => setNuevaSesionDoctor(e.target.value)}
                                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl py-2.5 px-3 focus:outline-none focus:border-teal-500 font-bold text-slate-700 dark:text-slate-300"
                                  >
                                    <option value="Jean Carlos Zúñiga">Jean Carlos Zúñiga</option>
                                    <option value="Jean Frank Zúñiga">Jean Frank Zúñiga</option>
                                  </select>
                                </div>

                                {/* Piezas Dentales Tratadas en esta Cita */}
                                {(() => {
                                  const piezasSet = new Set<string>();
                                  selectedTratamientoDetalle.procedimientos.forEach((proc) => {
                                    if (proc.piezas) {
                                      proc.piezas.split(",").forEach((pz) => {
                                        const trimmed = pz.trim();
                                        if (trimmed) piezasSet.add(trimmed);
                                      });
                                    }
                                  });
                                  const piezasArr = Array.from(piezasSet).sort();
                                  if (piezasArr.length === 0) return null;
                                  return (
                                    <div className="space-y-1.5">
                                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Piezas Dentales Tratadas en esta Cita</label>
                                      <div className="flex flex-wrap gap-2 bg-slate-50 dark:bg-slate-950 p-2.5 rounded-xl border">
                                        {piezasArr.map((pz) => (
                                          <label key={pz} className="flex items-center gap-1 font-extrabold text-slate-700 dark:text-slate-350 cursor-pointer">
                                            <input
                                              type="checkbox"
                                              checked={nuevaSesionPiezas.includes(pz)}
                                              onChange={(e) => {
                                                if (e.target.checked) {
                                                  setNuevaSesionPiezas(prev => [...prev, pz]);
                                                } else {
                                                  setNuevaSesionPiezas(prev => prev.filter(x => x !== pz));
                                                }
                                              }}
                                              className="rounded border-slate-350 dark:border-slate-800"
                                            />
                                            #{pz}
                                          </label>
                                        ))}
                                      </div>
                                    </div>
                                  );
                                })()}

                                {/* Monto de Pago / Adelanto */}
                                <div className="space-y-1.5">
                                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Monto de Adelanto en esta Cita (s/.)</label>
                                  <input
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    value={nuevaSesionPago || ""}
                                    onChange={(e) => setNuevaSesionPago(Math.max(0, parseFloat(e.target.value) || 0))}
                                    placeholder="0.00"
                                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl py-2.5 px-3 focus:outline-none focus:border-teal-500 font-bold text-slate-800 dark:text-slate-200"
                                  />
                                </div>

                                <button
                                  onClick={() => handleAddSessionLog(selectedTratamientoDetalle.id)}
                                  className="w-full flex items-center justify-center gap-1.5 bg-teal-650 hover:bg-teal-700 text-white font-bold py-2.5 rounded-xl shadow-md cursor-pointer hover:scale-[1.01]"
                                >
                                  <Send className="h-4 w-4" /> Registrar Sesión
                                </button>
                              </div>
                            </div>

                            {/* Historial de Sesiones Registradas */}
                            <div className="lg:col-span-7 space-y-4">
                              <h4 className="text-xs font-bold text-slate-450 uppercase tracking-wider">Historial de Evolución del Tratamiento</h4>
                              
                              {!selectedTratamientoDetalle.sesiones || selectedTratamientoDetalle.sesiones.length === 0 ? (
                                <div className="text-center py-12 border border-dashed rounded-3xl">
                                  <p className="text-xs font-semibold text-slate-400">No se han registrado sesiones clínicas aún en este tratamiento.</p>
                                </div>
                              ) : (
                                <div className="space-y-4 max-h-[480px] overflow-y-auto pr-1">
                                  {(selectedTratamientoDetalle.sesiones || []).map((log, index) => (
                                    <div key={index} className={`border rounded-2xl p-4 space-y-2.5 transition-colors ${
                                      isDarkMode ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"
                                    }`}>
                                      <div className="flex justify-between items-center text-[11px] font-bold border-b pb-1.5 border-slate-150">
                                        <span className="text-teal-655">Cita #{index + 1} &bull; {new Date(log.fecha).toLocaleDateString("es-ES")}</span>
                                        <span className="text-slate-450">{new Date(log.fecha).toLocaleTimeString("es-ES", {hour: '2-digit', minute:'2-digit'})}</span>
                                      </div>

                                      {/* Doctor y Pago */}
                                      <div className="flex flex-wrap justify-between items-center text-[10px] font-extrabold text-slate-500 bg-slate-50 dark:bg-slate-950 p-2 rounded-lg gap-2">
                                        <span>Dr. {log.doctor || "Jean Carlos Zúñiga"}</span>
                                        {log.pago && log.pago > 0 ? (
                                          <span className="text-emerald-600 bg-emerald-50 dark:bg-emerald-950/20 px-2 py-0.5 rounded-md">Abonó: s/. {log.pago.toFixed(2)}</span>
                                        ) : (
                                          <span className="text-slate-400">Sin abono en esta cita</span>
                                        )}
                                      </div>

                                      <p className="text-xs text-slate-700 dark:text-slate-350 leading-relaxed font-semibold">{log.nota}</p>
                                      
                                      {/* Procedimientos y Piezas tratadas */}
                                      <div className="space-y-1.5 pt-1.5 border-t border-slate-100 dark:border-slate-850">
                                        {log.procedimientosTratados && log.procedimientosTratados.length > 0 && (
                                          <div className="flex flex-wrap gap-1.5">
                                            {log.procedimientosTratados.map((procName, pIdx) => (
                                              <span key={pIdx} className="text-[9px] font-black uppercase bg-teal-50 text-teal-700 border border-teal-100 rounded-lg px-2 py-0.5">
                                                ✓ {procName}
                                              </span>
                                            ))}
                                          </div>
                                        )}
                                        {log.piezasTratadas && log.piezasTratadas.length > 0 && (
                                          <div className="text-[9px] font-bold text-slate-500">
                                            Piezas tratadas: <span className="text-teal-655 font-extrabold">{log.piezasTratadas.join(", ")}</span>
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>

                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}

              </div>
            </div>
          )}

        </div>
      </main>

    </div>
  );
}
