"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  Home, 
  Users, 
  ClipboardList, 
  Activity, 
  Settings, 
  HelpCircle, 
  UserCircle2,
  Stethoscope
} from "lucide-react";

export const Sidebar: React.FC = () => {
  const pathname = usePathname();

  const menuItems = [
    { name: "Panel Principal", href: "/dashboard", icon: Home },
    { name: "Pacientes e Historias", href: "/dashboard/pacientes", icon: Users },
  ];

  return (
    <aside className="fixed inset-y-0 left-0 z-20 flex flex-col w-64 bg-slate-900 border-r border-slate-800 text-slate-400 p-6 select-none justify-between">
      <div className="space-y-8">
        
        {/* LOGO CLÍNICO */}
        <div className="flex items-center gap-3 px-2">
          <div className="p-2 bg-indigo-500 rounded-xl text-white shadow-lg shadow-indigo-500/20">
            <Stethoscope className="h-6 w-6" />
          </div>
          <div>
            <h1 className="font-extrabold text-white text-md tracking-tight leading-none">Clinident</h1>
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Admin Dashboard</span>
          </div>
        </div>

        {/* NAVEGACIÓN */}
        <nav className="space-y-1">
          <span className="px-3 text-[10px] font-bold text-slate-650 uppercase tracking-wider block mb-3">Menú de Navegación</span>
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all group ${
                  isActive
                    ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/15"
                    : "hover:bg-slate-800/60 hover:text-slate-200"
                }`}
              >
                <Icon className={`h-5 w-5 transition-transform group-hover:scale-105 ${
                  isActive ? "text-white" : "text-slate-500 group-hover:text-indigo-400"
                }`} />
                {item.name}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* FOOTER - PERFIL DOCTOR */}
      <div className="space-y-4 pt-6 border-t border-slate-800">
        <div className="flex items-center gap-3 px-2">
          <div className="h-10 w-10 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-indigo-400 font-bold">
            DR
          </div>
          <div className="overflow-hidden">
            <p className="text-xs font-bold text-slate-200 truncate">Dr. Carlos Romero</p>
            <span className="text-[10px] font-semibold text-slate-500 block uppercase tracking-wider">Odontólogo Líder</span>
          </div>
        </div>
        
        <p className="text-[10px] font-medium text-slate-600 text-center">
          Uso Interno Autorizado &copy; {new Date().getFullYear()}
        </p>
      </div>

    </aside>
  );
};
