"use client";

import React, { useState } from "react";
import { User, ShieldAlert, HeartPulse, FileText, Phone, MapPin, Mail, Briefcase, Calendar } from "lucide-react";

export interface PacienteData {
  id?: string;
  nombre_completo: string;
  edad: number;
  sexo: string;
  dni: string;
  telefono: string;
  email: string;
  direccion: string;
  ocupacion: string;
  fecha_registro?: string;
  alergias: string;
  hemorragias: string;
  enfermedades: string;
  medicamentos_actuales: string;
  motivo_consulta: string;
}

interface HistoriaClinicaFormProps {
  initialData?: PacienteData;
  onSubmit: (data: PacienteData) => void;
  onCancel?: () => void;
}

export const HistoriaClinicaForm: React.FC<HistoriaClinicaFormProps> = ({
  initialData,
  onSubmit,
  onCancel,
}) => {
  const [formData, setFormData] = useState<PacienteData>(() => initialData || {
    nombre_completo: "",
    edad: 0,
    sexo: "Masculino",
    dni: "",
    telefono: "",
    email: "",
    direccion: "",
    ocupacion: "",
    alergias: "",
    hemorragias: "",
    enfermedades: "",
    medicamentos_actuales: "",
    motivo_consulta: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "edad" ? parseInt(value) || 0 : value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nombre_completo.trim()) {
      alert("Por favor ingresa el nombre completo del paciente.");
      return;
    }
    if (!formData.dni.trim()) {
      alert("Por favor ingresa el DNI o Documento de Identidad.");
      return;
    }
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8 max-w-4xl mx-auto pb-12">
      
      {/* 1. SECCIÓN: DATOS PERSONALES */}
      <div className="bg-slate-50/50 dark:bg-slate-950/20 border border-slate-200/80 dark:border-slate-850/80 rounded-2xl p-5 shadow-sm space-y-5">
        <div className="flex items-center gap-3 border-b border-slate-200/40 dark:border-slate-800 pb-4">
          <div className="p-2.5 bg-teal-500/10 rounded-xl text-teal-600 dark:text-teal-400">
            <User className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">1. Filiación y Datos Personales</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">Datos identificativos y de contacto del paciente</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Nombre Completo */}
          <div className="md:col-span-2 space-y-2">
            <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Nombre Completo *</label>
            <div className="relative">
              <input
                type="text"
                name="nombre_completo"
                value={formData.nombre_completo}
                onChange={handleChange}
                placeholder="Ej. Juan Carlos Pérez Gómez"
                required
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl py-3 pl-4 pr-10 text-sm font-semibold text-slate-800 dark:text-slate-150 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/10 transition-all"
              />
            </div>
          </div>

          {/* DNI */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">DNI / Pasaporte *</label>
            <input
              type="text"
              name="dni"
              value={formData.dni}
              onChange={handleChange}
              placeholder="Documento de Identidad"
              required
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl py-3 px-4 text-sm font-semibold text-slate-800 dark:text-slate-150 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/10 transition-all"
            />
          </div>

          {/* Edad */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Edad</label>
            <input
              type="number"
              name="edad"
              value={formData.edad || ""}
              onChange={handleChange}
              placeholder="Años"
              min="0"
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl py-3 px-4 text-sm font-semibold text-slate-800 dark:text-slate-150 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/10 transition-all"
            />
          </div>

          {/* Sexo */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Sexo</label>
            <select
              name="sexo"
              value={formData.sexo}
              onChange={handleChange}
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl py-3 px-4 text-sm font-semibold text-slate-800 dark:text-slate-150 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/10 transition-all"
            >
              <option value="Masculino">Masculino</option>
              <option value="Femenino">Femenino</option>
              <option value="Otro">Otro / No Especifica</option>
            </select>
          </div>

          {/* Teléfono */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Teléfono / WhatsApp</label>
            <div className="relative">
              <input
                type="text"
                name="telefono"
                value={formData.telefono}
                onChange={handleChange}
                placeholder="Ej. +51 987 654 321"
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl py-3 pl-4 pr-10 text-sm font-semibold text-slate-800 dark:text-slate-150 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/10 transition-all"
              />
              <Phone className="absolute right-3.5 top-3.5 h-4 w-4 text-slate-400" />
            </div>
          </div>

          {/* Email */}
          <div className="md:col-span-2 space-y-2">
            <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Correo Electrónico</label>
            <div className="relative">
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="paciente@ejemplo.com"
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl py-3 pl-4 pr-10 text-sm font-semibold text-slate-800 dark:text-slate-150 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/10 transition-all"
              />
              <Mail className="absolute right-3.5 top-3.5 h-4 w-4 text-slate-400" />
            </div>
          </div>

          {/* Ocupación */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Ocupación / Trabajo</label>
            <div className="relative">
              <input
                type="text"
                name="ocupacion"
                value={formData.ocupacion}
                onChange={handleChange}
                placeholder="Ej. Ingeniero de Software"
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl py-3 pl-4 pr-10 text-sm font-semibold text-slate-800 dark:text-slate-150 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/10 transition-all"
              />
              <Briefcase className="absolute right-3.5 top-3.5 h-4 w-4 text-slate-400" />
            </div>
          </div>

          {/* Dirección */}
          <div className="md:col-span-3 space-y-2">
            <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Dirección de Domicilio</label>
            <div className="relative">
              <input
                type="text"
                name="direccion"
                value={formData.direccion}
                onChange={handleChange}
                placeholder="Ej. Av. Larco 456, Miraflores, Lima"
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl py-3 pl-4 pr-10 text-sm font-semibold text-slate-800 dark:text-slate-150 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/10 transition-all"
              />
              <MapPin className="absolute right-3.5 top-3.5 h-4 w-4 text-slate-400" />
            </div>
          </div>
        </div>
      </div>

      {/* 2. SECCIÓN: ANTECEDENTES MÉDICOS (HISTORIA CLÍNICA) */}
      <div className="bg-slate-50/50 dark:bg-slate-950/20 border border-slate-200/80 dark:border-slate-850/80 rounded-2xl p-5 shadow-sm space-y-5">
        <div className="flex items-center gap-3 border-b border-slate-200/40 dark:border-slate-800 pb-4">
          <div className="p-2.5 bg-red-500/10 rounded-xl text-red-500">
            <HeartPulse className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">2. Anamnesis y Antecedentes Médicos</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">Información crucial para evaluar riesgos y programar cirugías</p>
          </div>
        </div>

        {/* Motivo de Consulta */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
            <FileText className="h-3.5 w-3.5 text-teal-600 dark:text-teal-400" />
            Motivo de Consulta Principal *
          </label>
          <textarea
            name="motivo_consulta"
            value={formData.motivo_consulta}
            onChange={handleChange}
            placeholder="Ej. Dolor agudo en la molar inferior izquierda al masticar alimentos fríos o calientes..."
            required
            rows={2}
            className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl py-3 px-4 text-sm font-semibold text-slate-800 dark:text-slate-150 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/10 transition-all resize-y"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Alergias */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-red-500 dark:text-red-400 uppercase tracking-wider flex items-center gap-1.5">
              <ShieldAlert className="h-3.5 w-3.5" />
              Alergias (Medicamentos, Penicilina, Látex, Anestesia)
            </label>
            <textarea
              name="alergias"
              value={formData.alergias}
              onChange={handleChange}
              placeholder="Indicar si es alérgico a la penicilina, analgésicos, anestésicos locales, látex, etc. Si no presenta, escribir 'Ninguna'."
              rows={3}
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl py-3 px-4 text-sm font-semibold text-slate-800 dark:text-slate-150 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/10 transition-all resize-y"
            />
          </div>

          {/* Hemorragias / Coagulación */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-red-500 dark:text-red-400 uppercase tracking-wider flex items-center gap-1.5">
              <ShieldAlert className="h-3.5 w-3.5" />
              Hemorragias / Trastornos de Sangrado
            </label>
            <textarea
              name="hemorragias"
              value={formData.hemorragias}
              onChange={handleChange}
              placeholder="Indicar si sangra excesivamente al cortarse, si tiene problemas de coagulación o toma anticoagulantes (ej. Aspirina). Si no, escribir 'Ninguno'."
              rows={3}
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl py-3 px-4 text-sm font-semibold text-slate-800 dark:text-slate-150 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/10 transition-all resize-y"
            />
          </div>

          {/* Enfermedades Sistémicas */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-red-500 dark:text-red-400 uppercase tracking-wider flex items-center gap-1.5">
              <ShieldAlert className="h-3.5 w-3.5" />
              Enfermedades Sistémicas (Diabetes, Hipertensión, Asma, Corazón)
            </label>
            <textarea
              name="enfermedades"
              value={formData.enfermedades}
              onChange={handleChange}
              placeholder="Diabetes, Hipertensión Arterial, Asma, Insuficiencia Renal, Cardiopatías, etc. Indicar si está controlado. Si no, escribir 'Ninguna'."
              rows={3}
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl py-3 px-4 text-sm font-semibold text-slate-800 dark:text-slate-150 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/10 transition-all resize-y"
            />
          </div>

          {/* Medicamentos Actuales */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-red-500 dark:text-red-400 uppercase tracking-wider flex items-center gap-1.5">
              <ShieldAlert className="h-3.5 w-3.5" />
              Medicamentos en Consumo Actual
            </label>
            <textarea
              name="medicamentos_actuales"
              value={formData.medicamentos_actuales}
              onChange={handleChange}
              placeholder="¿Qué fármacos o terapias está consumiendo actualmente? (Insulina, Antihipertensivos, Bifosfonatos, etc.). Si no, escribir 'Ninguno'."
              rows={3}
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl py-3 px-4 text-sm font-semibold text-slate-800 dark:text-slate-150 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/10 transition-all resize-y"
            />
          </div>
        </div>
      </div>

      {/* BOTONES DE CONTROL DE ENVÍO */}
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
          type="submit"
          className="px-8 py-3 bg-teal-600 hover:bg-teal-700 text-white text-sm font-bold rounded-xl shadow-lg shadow-teal-500/10 hover:shadow-teal-500/20 transition-all hover:scale-[1.02] cursor-pointer"
        >
          Guardar Historia Clínica
        </button>
      </div>

    </form>
  );
};
