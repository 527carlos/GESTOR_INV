import React, { useEffect, useState } from "react";
import { 
  PlusCircle, 
  History, 
  Award, 
  FileText, 
  Terminal, 
  Wrench, 
  Users, 
  ArrowRight, 
  Timer, 
  Eye, 
  TrendingUp,
  AlertCircle,
  CheckCircle,
  DatabaseZap,
  BookOpen
} from "lucide-react";
import { DbState } from "../types";

interface DashboardProps {
  state: DbState;
  setActiveTab: (tab: string) => void;
  onOpenNewCaseModal: () => void;
  onDownloadManual: (id: string) => void;
}

export default function Dashboard({
  state,
  setActiveTab,
  onOpenNewCaseModal,
  onDownloadManual
}: DashboardProps) {
  const [progressBarWidth, setProgressBarWidth] = useState(0);

  useEffect(() => {
    // Elegant entrance animation for the training progress bar
    const timer = setTimeout(() => {
      setProgressBarWidth(68);
    }, 400);
    return () => clearTimeout(timer);
  }, []);

  // Compute stats
  const totalCases = state.cases.length;
  const activeCases = state.cases.filter(c => c.status === "Abierto" || c.status === "En Proceso").length;
  const pendingCases = state.cases.filter(c => c.status === "Esperando Pieza").length;
  const solvedCases = state.cases.filter(c => c.status === "Resuelto").length;

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      
      {/* Welcome Section */}
      <section className="bg-slate-900/40 border border-slate-800 rounded-3xl p-6 md:p-8 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative overflow-hidden">
        <div className="space-y-2 relative z-10">
          <h1 className="font-bold text-3xl md:text-4xl text-white tracking-tight">
            Bienvenido al Portal de Servicio
          </h1>
          <p className="text-slate-300 text-base md:text-lg max-w-2xl leading-relaxed">
            Gestione sus tareas técnicas, supervise el estado de los equipos y continúe su formación profesional con las herramientas avanzadas de PrintTech.
          </p>
        </div>
        <div className="shrink-0 flex items-center gap-2 bg-slate-800 border border-slate-700 rounded-full px-4 py-2 text-xs font-semibold text-sky-400 z-10">
          <DatabaseZap className="w-4 h-4 animate-bounce" />
          <span>Google Sheets Conectado</span>
        </div>
        
        {/* Abstract background accent */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-sky-500/5 rounded-full blur-3xl -mr-20 -mt-20 opacity-40"></div>
      </section>

      {/* Bento Layout Grid */}
      <div className="grid grid-cols-12 gap-6">
        
        {/* Quick Actions (Col-span 4 on desktop) */}
        <div className="col-span-12 lg:col-span-4 flex flex-col gap-4">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Acciones Rápidas</h3>
          
          <button 
            onClick={onOpenNewCaseModal}
            className="group bg-slate-900/40 border border-slate-800 rounded-2xl p-4 flex items-center gap-4 hover:border-sky-500 hover:shadow-md transition-all text-left w-full cursor-pointer"
          >
            <div className="w-12 h-12 rounded-xl bg-slate-800 text-white flex items-center justify-center shrink-0 group-hover:bg-sky-500/20 group-hover:text-sky-400 transition-colors">
              <PlusCircle className="w-6 h-6" />
            </div>
            <div>
              <p className="font-bold text-base text-white">Nuevo Caso</p>
              <p className="text-xs text-slate-400">Reportar incidencia técnica inmediata</p>
            </div>
          </button>

          <button 
            onClick={() => setActiveTab("library")}
            className="group bg-slate-900/40 border border-slate-800 rounded-2xl p-4 flex items-center gap-4 hover:border-sky-500 hover:shadow-md transition-all text-left w-full cursor-pointer"
          >
            <div className="w-12 h-12 rounded-xl bg-slate-800 text-sky-400 flex items-center justify-center shrink-0 group-hover:bg-sky-500 group-hover:text-white transition-colors">
              <History className="w-6 h-6" />
            </div>
            <div>
              <p className="font-bold text-base text-white">Manuales Recientes</p>
              <p className="text-xs text-slate-400">Acceder a guías consultadas hoy</p>
            </div>
          </button>

          <button 
            onClick={() => setActiveTab("training")}
            className="group bg-slate-900/40 border border-slate-800 rounded-2xl p-4 flex items-center gap-4 hover:border-sky-500 hover:shadow-md transition-all text-left w-full relative overflow-hidden cursor-pointer"
          >
            <div className="w-12 h-12 rounded-xl bg-slate-800 text-white flex items-center justify-center shrink-0 group-hover:bg-sky-500 group-hover:text-white transition-colors">
              <Award className="w-6 h-6" />
            </div>
            <div className="z-10">
              <p className="font-bold text-base text-white">Certificación en curso</p>
              <p className="text-xs text-slate-400">Mantenimiento Preventivo L-Format</p>
            </div>
            <div className="absolute bottom-0 left-0 h-1 bg-sky-500 w-2/3"></div>
          </button>
        </div>

        {/* Case Status Summary Widget (Col-span 8 on desktop) */}
        <div className="col-span-12 lg:col-span-8 bg-slate-900/40 border border-slate-800 p-6 rounded-3xl flex flex-col justify-between shadow-sm">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h3 className="font-bold text-lg text-white mb-1">Estado de Casos</h3>
              <p className="text-xs text-slate-400">Resumen de operaciones en tiempo real</p>
            </div>
            <button 
              onClick={() => setActiveTab("cases")}
              className="text-xs text-sky-400 font-bold hover:underline"
            >
              VER TODOS LOS CASOS
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-slate-950/40 border border-slate-800/80 p-5 rounded-2xl border-l-4 border-sky-500">
              <p className="text-slate-400 text-xs font-bold tracking-wide uppercase mb-1">ACTIVOS</p>
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-bold font-mono text-white">{activeCases}</span>
                <span className="text-sky-400 text-xs font-semibold">+2 hoy</span>
              </div>
            </div>

            <div className="bg-slate-950/40 border border-slate-800/80 p-5 rounded-2xl border-l-4 border-rose-500">
              <p className="text-slate-400 text-xs font-bold tracking-wide uppercase mb-1">PENDIENTES</p>
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-bold font-mono text-white">{pendingCases}</span>
                <span className="text-rose-400 text-xs font-semibold">Urgente</span>
              </div>
            </div>

            <div className="bg-slate-950/40 border border-slate-800/80 p-5 rounded-2xl border-l-4 border-emerald-500">
              <p className="text-slate-400 text-xs font-bold tracking-wide uppercase mb-1">RESUELTOS</p>
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-bold font-mono text-white">{solvedCases}</span>
                <span className="text-emerald-400 text-xs font-semibold">100% meta</span>
              </div>
            </div>
          </div>
        </div>

        {/* Popular Instructions (Col-span 7 on desktop) */}
        <div className="col-span-12 lg:col-span-7 bg-slate-900/40 border border-slate-800 rounded-3xl flex flex-col overflow-hidden shadow-sm">
          <div className="p-6 border-b border-slate-800 flex justify-between items-center">
            <h3 className="font-bold text-lg text-white">Instructivos Populares</h3>
            <span className="text-slate-400"><BookOpen className="w-5 h-5" /></span>
          </div>

          <div className="divide-y divide-slate-800 overflow-y-auto max-h-[360px] custom-scrollbar">
            {state.manuals.map(manual => (
              <div 
                key={manual.id} 
                onClick={() => {
                  onDownloadManual(manual.id);
                  setActiveTab("library");
                }}
                className="p-4 flex gap-4 hover:bg-slate-800/50 cursor-pointer group"
              >
                <div className="w-24 h-16 rounded-xl bg-slate-800 overflow-hidden shrink-0 relative border border-slate-700">
                  <img 
                    src={manual.image} 
                    alt={manual.title} 
                    className="w-full h-full object-cover filter grayscale group-hover:grayscale-0 transition-all duration-300"
                  />
                </div>
                <div className="flex-grow flex flex-col justify-between">
                  <p className="font-semibold text-sm text-white group-hover:text-sky-400 transition-colors line-clamp-1">{manual.title}</p>
                  <p className="text-xs text-slate-400 line-clamp-1">{manual.description}</p>
                  <div className="flex items-center gap-4 mt-1">
                    <span className="flex items-center gap-1 text-[10px] text-slate-500 font-medium">
                      <Timer className="w-3 h-3" /> 12 min
                    </span>
                    <span className="flex items-center gap-1 text-[10px] text-slate-500 font-medium">
                      <Eye className="w-3 h-3" /> {manual.views} vistas
                    </span>
                    <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold uppercase ${
                      manual.difficulty === 'HARD' ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' :
                      manual.difficulty === 'MEDIUM' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                      'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                    }`}>
                      {manual.difficulty === 'HARD' ? 'NIVEL PRO' : manual.difficulty === 'MEDIUM' ? 'AVANZADO' : 'BÁSICO'}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Training Progress (Col-span 5 on desktop) */}
        <div className="col-span-12 lg:col-span-5 flex flex-col gap-6">
          
          {/* Progress Card */}
          <div className="bg-slate-800/80 border border-slate-700/80 rounded-3xl p-6 text-white relative overflow-hidden shadow-md">
            <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
              <Award className="w-32 h-32" />
            </div>
            <div className="relative z-10 flex flex-col justify-between h-full">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h3 className="font-bold text-lg text-white mb-1">Próximos Entrenamientos</h3>
                  <p className="text-slate-400 text-xs">Tu ruta de aprendizaje actual</p>
                </div>
                <span className="bg-sky-500 text-white text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider">
                  EN VIVO
                </span>
              </div>

              <div className="mb-6">
                <div className="flex justify-between items-end mb-2">
                  <p className="font-bold text-sm">Maintenance Specialist</p>
                  <p className="text-xs font-mono font-bold text-sky-400">68%</p>
                </div>
                {/* Custom animated progress bar */}
                <div className="w-full h-2.5 bg-slate-700 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-sky-500 to-emerald-400 rounded-full transition-all duration-1000 ease-out" 
                    style={{ width: `${progressBarWidth}%` }}
                  ></div>
                </div>
              </div>

              <div className="flex gap-4 items-center text-xs text-slate-300 font-medium">
                <span className="flex items-center gap-1">
                  <Timer className="w-4 h-4" /> 14 Nov
                </span>
                <span className="flex items-center gap-1">
                  <FileText className="w-4 h-4" /> 4 Módulos restantes
                </span>
              </div>
            </div>
          </div>

          {/* Technical Resources links */}
          <div className="bg-slate-900/40 border border-slate-800 rounded-3xl p-6 shadow-sm flex-grow flex flex-col justify-between">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">RECURSOS TÉCNICOS</h4>
            
            <div className="space-y-4">
              <a 
                href="#diagnosticos"
                onClick={(e) => { e.preventDefault(); setActiveTab("settings"); }}
                className="flex items-center justify-between group cursor-pointer pb-2 border-b border-slate-800 hover:border-sky-500/40 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <Terminal className="w-5 h-5 text-sky-400 group-hover:scale-110 transition-transform" />
                  <span className="text-sm font-bold text-white group-hover:text-sky-400 group-hover:underline">Consola de Sincronización G-Sheets</span>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-500" />
              </a>

              <a 
                href="#herramientas"
                onClick={(e) => { e.preventDefault(); setActiveTab("training"); }}
                className="flex items-center justify-between group cursor-pointer pb-2 border-b border-slate-800 hover:border-sky-500/40 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <Wrench className="w-5 h-5 text-sky-400 group-hover:scale-110 transition-transform" />
                  <span className="text-sm font-bold text-white group-hover:text-sky-400 group-hover:underline">Kit de Certificaciones Virtuales</span>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-500" />
              </a>

              <a 
                href="#comunidad"
                onClick={(e) => { e.preventDefault(); setActiveTab("library"); }}
                className="flex items-center justify-between group cursor-pointer hover:border-sky-500/40 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <Users className="w-5 h-5 text-sky-400 group-hover:scale-110 transition-transform" />
                  <span className="text-sm font-bold text-white group-hover:text-sky-400 group-hover:underline">Comunidad de Expertos Técnicos</span>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-500" />
              </a>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
