import { Button } from "@/components/ui/button";
import { ArrowRight, Database, LayoutTemplate, ShieldCheck, Zap } from "lucide-react";

export default function Home() {
  return (
    <div className="relative min-h-screen bg-slate-950 text-slate-50 overflow-hidden font-sans selection:bg-indigo-500/30">
      {/* Background Gradients Modernos */}
      <div className="absolute top-0 -left-4 w-96 h-96 bg-indigo-600 rounded-full mix-blend-multiply filter blur-[128px] opacity-30"></div>
      <div className="absolute top-0 -right-4 w-96 h-96 bg-purple-600 rounded-full mix-blend-multiply filter blur-[128px] opacity-30"></div>
      <div className="absolute -bottom-8 left-20 w-96 h-96 bg-blue-600 rounded-full mix-blend-multiply filter blur-[128px] opacity-30"></div>

      <div className="relative max-w-7xl mx-auto px-6 pt-32 pb-16 flex flex-col items-center justify-center min-h-screen z-10">
        
        {/* Hero Section */}
        <div className="text-center max-w-3xl space-y-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-900/80 border border-slate-800 text-sm font-medium text-slate-300 backdrop-blur-md shadow-xl">
            <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse"></span>
            Arquitectura Base Operativa
          </div>
          
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight">
            Next.js + Supabase <br className="hidden md:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-emerald-400">
              Al Siguiente Nivel
            </span>
          </h1>
          
          <p className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed">
            Tu entorno de trabajo está correctamente scaffolding. Auth protegido en el Edge, conexión con Base de Datos lista y UI System escalable premium impulsado por Tailwind CSS.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-6">
            <Button size="lg" className="rounded-full bg-indigo-600 hover:bg-indigo-700 text-white h-12 px-8 font-semibold w-full sm:w-auto shadow-[0_0_30px_-5px_rgba(79,70,229,0.5)] transition-all hover:scale-105">
              Comenzar Proyecto <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
            <Button size="lg" variant="outline" className="rounded-full h-12 px-8 font-semibold w-full sm:w-auto border-slate-700 bg-slate-900/50 hover:bg-slate-800 hover:text-white backdrop-blur-sm transition-all text-slate-300">
              Ver Documentación
            </Button>
          </div>
        </div>

        {/* Features Grids */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-32 w-full">
          {[
            {
              icon: LayoutTemplate,
              title: "App Router",
              desc: "React Server Components, Layouts anidados y data fetching optimizado con Next.js 15."
            },
            {
              icon: Database,
              title: "Supabase SSR",
              desc: "Autenticación segura persistida de manera estable entre cliente, servidor y Middleware."
            },
            {
              icon: Zap,
              title: "Tailwind v4",
              desc: "Estilos atómicos de última generación ya configurados sin necesidad de configuración extra."
            },
            {
              icon: ShieldCheck,
              title: "Rutas Seguras",
              desc: "Middlewares implementados y probados para redirigir tráfico no autorizado inteligentemente."
            }
          ].map((feature, i) => (
            <div key={i} className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-md hover:bg-slate-800/80 hover:border-indigo-500/50 transition-all group shadow-2xl">
              <div className="h-12 w-12 rounded-xl bg-indigo-500/10 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-indigo-500/20 transition-all duration-300">
                <feature.icon className="h-6 w-6 text-indigo-400" />
              </div>
              <h3 className="text-lg font-semibold text-slate-200 mb-3">{feature.title}</h3>
              <p className="text-sm text-slate-400 leading-relaxed">{feature.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
