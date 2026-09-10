import React, { useState, useMemo } from "react";
import { 
  Download, 
  Search, 
  Calendar, 
  BookOpen, 
  CheckCircle, 
  Eye, 
  Bookmark, 
  SlidersHorizontal,
  ChevronRight,
  Database,
  ArrowUpRight,
  Sparkles
} from "lucide-react";
import { Manual, DbState } from "../types";

interface InstructionLibraryProps {
  state: DbState;
  onDownloadManual: (id: string) => void;
}

export default function InstructionLibrary({
  state,
  onDownloadManual
}: InstructionLibraryProps) {
  const [selectedType, setSelectedType] = useState("Todos");
  const [searchQuery, setSearchQuery] = useState("");
  const [downloadingManual, setDownloadingManual] = useState<Manual | null>(null);

  const categories = ["Todos", "Inyección de Tinta", "Láser", "Gran Formato", "Térmicas"];

  // Filter manuals list
  const filteredManuals = useMemo(() => {
    return state.manuals.filter(m => {
      const matchesType = selectedType === "Todos" || m.type === selectedType;
      const matchesSearch = 
        m.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
        m.description.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesType && matchesSearch;
    });
  }, [state.manuals, selectedType, searchQuery]);

  const handleDownload = (m: Manual) => {
    onDownloadManual(m.id);
    setDownloadingManual(m);
    setTimeout(() => {
      setDownloadingManual(null);
    }, 2500);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      
      {/* Title block */}
      <div className="flex flex-col gap-1 bg-slate-900/40 p-6 border border-slate-800 rounded-3xl shadow-sm">
        <h1 className="font-bold text-2xl text-white">Biblioteca de Instructivos</h1>
        <p className="text-slate-400 text-sm">Accede a la base de datos técnica más completa para profesionales de impresión.</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        
        {/* Main Left Content: Category Filters & Bento Grid */}
        <div className="flex-grow space-y-6">
          
          {/* Controls Bar */}
          <div className="bg-slate-900/40 p-4 rounded-2xl border border-slate-800 flex flex-col sm:flex-row gap-4 items-center justify-between shadow-sm">
            
            {/* Categories filters tabs */}
            <div className="flex flex-wrap gap-1.5 w-full sm:w-auto">
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setSelectedType(cat)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-semibold tracking-wide transition-all cursor-pointer ${
                    selectedType === cat
                      ? "bg-sky-500 text-white font-bold border border-sky-500"
                      : "border border-slate-800 text-slate-300 hover:bg-slate-800/50 hover:text-white"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Quick search */}
            <div className="relative w-full sm:w-64">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                <Search className="w-4 h-4" />
              </span>
              <input 
                type="text" 
                placeholder="Buscar instructivo..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 text-slate-200 placeholder-slate-500 rounded-full py-1.5 pl-10 pr-4 text-xs focus:outline-none focus:ring-1 focus:ring-sky-500 focus:border-transparent transition-all"
              />
            </div>

          </div>

          {/* Manuals grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-2 gap-6">
            {filteredManuals.map(manual => (
              <div 
                key={manual.id} 
                className="group bg-slate-900/40 border border-slate-800 rounded-3xl overflow-hidden hover:shadow-lg transition-all flex flex-col h-full"
              >
                {/* Manual Thumbnail block */}
                <div className="h-44 overflow-hidden relative border-b border-slate-800 bg-slate-950">
                  <img 
                    src={manual.image} 
                    alt={manual.title} 
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 filter saturate-[0.8]"
                  />
                  
                  {/* Difficulty labels matching Design System guidelines */}
                  <span className={`absolute top-3 right-3 px-2.5 py-1 rounded-xl text-[10px] font-bold uppercase tracking-wider ${
                    manual.difficulty === 'HARD' ? 'bg-rose-500 text-white shadow-sm' :
                    manual.difficulty === 'MEDIUM' ? 'bg-amber-500 text-white shadow-sm' :
                    'bg-emerald-500 text-white shadow-sm'
                  }`}>
                    {manual.difficulty}
                  </span>
                </div>

                {/* Card Content */}
                <div className="p-5 flex flex-col gap-4 flex-grow justify-between">
                  <div className="space-y-1.5">
                    <span className="text-[10px] text-sky-400 font-bold uppercase tracking-widest bg-slate-800 px-2 py-0.5 rounded">
                      {manual.type}
                    </span>
                    <h3 className="font-bold text-base text-white group-hover:text-sky-400 transition-colors line-clamp-1 leading-snug">
                      {manual.title}
                    </h3>
                    <p className="text-xs text-slate-400 leading-relaxed line-clamp-2">
                      {manual.description}
                    </p>
                  </div>

                  <div className="pt-4 border-t border-slate-800 flex items-center justify-between mt-auto">
                    <div className="flex items-center gap-3 text-[10px] text-slate-400 font-semibold">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-sky-400" />
                        {manual.date}
                      </span>
                      <span className="flex items-center gap-1">
                        <Eye className="w-3.5 h-3.5 text-sky-400" />
                        {manual.views} Vistas
                      </span>
                    </div>

                    <button 
                      onClick={() => handleDownload(manual)}
                      className="flex items-center gap-1.5 px-3.5 py-2 bg-sky-500 text-white rounded-xl font-bold text-xs hover:bg-sky-600 hover:shadow-md transition-colors cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Descargar PDF</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}

            {filteredManuals.length === 0 && (
              <div className="col-span-full py-12 text-center text-slate-400 font-medium bg-slate-900/40 rounded-3xl border border-slate-800">
                No hay manuales de soporte disponibles que coincidan con la búsqueda técnica.
              </div>
            )}
          </div>

        </div>

        {/* Sidebar: Recently Updated & Quick stats (Col-span w-80 on desktop) */}
        <aside className="w-full lg:w-80 flex flex-col gap-6 shrink-0">
          
          {/* Recently Updated Manuals */}
          <div className="bg-slate-900/40 border border-slate-800 rounded-3xl p-5 flex flex-col gap-4 shadow-sm">
            <h2 className="font-bold text-base text-white flex items-center gap-2 border-b border-slate-800 pb-2">
              <Sparkles className="w-5 h-5 text-sky-400" />
              Recientemente Actualizados
            </h2>

            <div className="flex flex-col divide-y divide-slate-800">
              
              <div className="py-3 flex flex-col gap-1 group cursor-pointer">
                <div className="flex justify-between items-center text-[10px] font-bold">
                  <span className="text-sky-400">VERSIÓN 4.5.1</span>
                  <span className="text-slate-400 font-medium">Ayer</span>
                </div>
                <h4 className="font-bold text-sm text-white group-hover:text-sky-400 transition-colors">
                  Plotter Master 8000
                </h4>
                <p className="text-xs text-slate-400 leading-snug line-clamp-2">
                  Actualización crítica de tablas de calibración de color y perfiles ICC.
                </p>
              </div>

              <div className="py-3 flex flex-col gap-1 group cursor-pointer">
                <div className="flex justify-between items-center text-[10px] font-bold">
                  <span className="text-sky-400">VERSIÓN 2.1.0</span>
                  <span className="text-slate-400 font-medium">Hace 3 días</span>
                </div>
                <h4 className="font-bold text-sm text-white group-hover:text-sky-400 transition-colors">
                  Eco-Jet Desktop v3
                </h4>
                <p className="text-xs text-slate-400 leading-snug line-clamp-2">
                  Pasos documentados de reemplazo seguro de bomba de drenaje.
                </p>
              </div>

              <div className="py-3 flex flex-col gap-1 group cursor-pointer">
                <div className="flex justify-between items-center text-[10px] font-bold">
                  <span className="text-sky-400">VERSIÓN 1.9.8</span>
                  <span className="text-slate-400 font-medium">12 Oct</span>
                </div>
                <h4 className="font-bold text-sm text-white group-hover:text-sky-400 transition-colors">
                  Industrial Line P-Series
                </h4>
                <p className="text-xs text-slate-400 leading-snug line-clamp-2">
                  Corrección mayor en esquemas eléctricos de alimentación de alta tensión.
                </p>
              </div>

            </div>

            <button className="w-full py-2.5 text-slate-300 font-bold text-xs border border-slate-700 rounded-xl hover:bg-slate-800 hover:text-white transition-all cursor-pointer text-center">
              Ver Historial de Actualizaciones
            </button>
          </div>

          {/* Statistics Info */}
          <div className="bg-slate-800/80 border border-slate-700 rounded-3xl p-5 flex flex-col gap-3 relative overflow-hidden shadow-md">
            <div className="relative z-10 flex flex-col gap-1">
              <span className="text-[10px] font-bold tracking-widest text-sky-400 uppercase">
                Base de Datos
              </span>
              <div className="flex items-baseline gap-2">
                <span className="text-4.5xl font-bold font-mono text-white">1,248</span>
                <span className="text-xs text-slate-400 font-semibold">Instructivos</span>
              </div>
            </div>
            
            <p className="relative z-10 text-xs text-slate-400 leading-relaxed">
              Manuales técnicos certificados por fábrica, planos mecánicos interactivos y diagramas de circuitos para soporte nivel 4.
            </p>

            <div className="absolute top-0 right-0 w-32 h-32 bg-sky-500 opacity-10 rounded-full blur-2xl -mr-16 -mt-16"></div>
          </div>

        </aside>

      </div>

      {/* SIMULATED DOWNLOAD ALERT MODAL */}
      {downloadingManual && (
        <div className="fixed bottom-6 right-6 bg-slate-900 border border-slate-800 shadow-2xl p-4 rounded-2xl z-50 flex items-center gap-3 animate-fade-in max-w-sm">
          <div className="w-8 h-8 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
            <CheckCircle className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <p className="text-xs font-bold text-white">Descargando Manual</p>
            <p className="text-[10px] text-slate-400 truncate" title={downloadingManual.title}>{downloadingManual.title}</p>
            <p className="text-[9px] text-sky-400 font-semibold mt-0.5">Sincronizado & guardado log de descarga en Sheets.</p>
          </div>
        </div>
      )}

    </div>
  );
}
