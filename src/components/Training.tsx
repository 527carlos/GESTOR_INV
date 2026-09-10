import React, { useState } from "react";
import { 
  Award, 
  BookOpen, 
  CheckCircle, 
  Clock, 
  ChevronRight, 
  Layers, 
  Lock, 
  Star, 
  User, 
  HelpCircle, 
  Activity, 
  Sparkles,
  ArrowRight,
  Sliders
} from "lucide-react";
import { Course, DbState } from "../types";

interface TrainingProps {
  state: DbState;
  onUpdateCourseProgress: (courseId: string, progress: number) => void;
}

export default function Training({
  state,
  onUpdateCourseProgress
}: TrainingProps) {
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [sessionRequested, setSessionRequested] = useState(false);

  // Compute average progress for circular indicator
  const totalCourses = state.courses.length;
  const averageProgress = Math.round(
    state.courses.reduce((acc, c) => acc + c.progress, 0) / (totalCourses || 1)
  );

  const handleProgressChange = (courseId: string, newProgress: number) => {
    onUpdateCourseProgress(courseId, newProgress);
    if (selectedCourse && selectedCourse.id === courseId) {
      setSelectedCourse({
        ...selectedCourse,
        progress: newProgress,
        completed: newProgress === 100
      });
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      
      {/* Title block */}
      <div className="flex flex-col gap-1 bg-slate-900/40 p-6 border border-slate-800 rounded-3xl shadow-sm">
        <h1 className="font-bold text-2xl text-white">Módulos de Capacitación</h1>
        <p className="text-slate-400 text-sm">Supervise sus habilidades técnicas, complete laboratorios prácticos y obtenga certificaciones oficiales.</p>
      </div>

      {/* Top Bento Layout: Progress Tracker & Large Featured Call To Action */}
      <div className="grid grid-cols-12 gap-6">
        
        {/* Progress Circular chart (Col-span 4 on desktop) */}
        <div className="col-span-12 lg:col-span-4 bg-slate-900/40 border border-slate-800 rounded-3xl p-6 flex flex-col items-center justify-between text-center shadow-sm">
          <h2 className="font-bold text-base text-white mb-4 w-full text-left">Mi Progreso</h2>
          
          {/* Circular progress container */}
          <div className="relative w-44 h-44 flex items-center justify-center">
            {/* SVG circle */}
            <svg className="w-full h-full transform -rotate-95" viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                r="40"
                stroke="#1e293b"
                strokeWidth="8"
                fill="transparent"
              />
              <circle
                cx="50"
                cy="50"
                r="40"
                stroke="#0ea5e9"
                strokeWidth="8"
                fill="transparent"
                strokeDasharray="251.2"
                strokeDashoffset={251.2 - (251.2 * averageProgress) / 100}
                className="transition-all duration-1000 ease-out"
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute flex flex-col items-center">
              <span className="text-3xl font-bold font-mono text-white">{averageProgress}%</span>
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Completado</span>
            </div>
          </div>

          <div className="mt-6 w-full space-y-2">
            <div className="flex justify-between text-xs font-semibold">
              <span className="text-white">Próximo Hito</span>
              <span className="text-sky-400">Técnico Senior</span>
            </div>
            <div className="w-full h-2 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
              <div 
                className="h-full bg-sky-500 rounded-full transition-all duration-700" 
                style={{ width: `${averageProgress}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Featured Call to action banner */}
        <div className="col-span-12 lg:col-span-8 relative rounded-3xl overflow-hidden min-h-[300px] border border-slate-800 shadow-sm flex flex-col justify-end p-6 md:p-8 bg-slate-800/80 text-white">
          <div className="absolute inset-0 bg-cover bg-center mix-blend-overlay opacity-30" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=800&q=80')" }}></div>
          
          <div className="relative z-10 space-y-4 max-w-xl">
            <span className="inline-block px-2.5 py-1 bg-sky-500 text-white font-bold text-[9px] rounded-full uppercase tracking-widest">
              Nuevo Módulo
            </span>
            <h3 className="text-2xl md:text-3xl font-bold leading-tight">Optimización de Inyectores UV-C</h3>
            <p className="text-slate-300 text-sm leading-relaxed">
              Domina la última tecnología de curado ultravioleta de alto rendimiento para plóters planos de alta velocidad.
            </p>
            <button 
              onClick={() => {
                const uvCourse = state.courses[1] || state.courses[0];
                setSelectedCourse(uvCourse);
              }}
              className="bg-sky-500 text-white hover:bg-sky-600 px-5 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 cursor-pointer w-fit shadow-md hover:scale-95 transition-all"
            >
              <span>Continuar Aprendizaje</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

      </div>

      {/* Main Course List & Certificates sidebar */}
      <div className="grid grid-cols-12 gap-6">
        
        {/* Course Cards Grid */}
        <div className="col-span-12 lg:col-span-9 space-y-6">
          <h2 className="font-bold text-lg text-white flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-sky-400" /> Cursos Disponibles
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {state.courses.map(course => (
              <div 
                key={course.id} 
                className="bg-slate-900/40 border border-slate-800 rounded-3xl overflow-hidden hover:shadow-lg transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="h-40 relative bg-slate-950 border-b border-slate-800">
                    <img src={course.image} alt={course.title} className="w-full h-full object-cover saturate-[0.8]" />
                    {course.progress > 0 && (
                      <span className="absolute top-3 right-3 bg-slate-900/95 backdrop-blur-md px-2.5 py-1 rounded-full text-white font-bold text-[10px] border border-slate-800 shadow-sm font-mono">
                        {course.progress}%
                      </span>
                    )}
                  </div>

                  <div className="p-5 space-y-2">
                    <h3 className="font-bold text-base text-white line-clamp-1">{course.title}</h3>
                    <p className="text-xs text-slate-400 leading-relaxed line-clamp-2">{course.description}</p>
                    
                    <div className="flex items-center gap-4 pt-2 text-[10px] text-slate-400 font-bold">
                      <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5 text-sky-400" /> {course.duration}</span>
                      <span className="flex items-center gap-1"><Layers className="w-3.5 h-3.5 text-sky-400" /> {course.modulesCount} Módulos</span>
                    </div>
                  </div>
                </div>

                <div className="p-5 pt-0">
                  <button 
                    onClick={() => setSelectedCourse(course)}
                    className={`w-full py-2.5 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                      course.progress === 100
                        ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                        : course.progress > 0
                        ? "bg-sky-500 text-white"
                        : "border border-sky-500/30 text-sky-400 hover:bg-slate-800"
                    }`}
                  >
                    {course.progress === 100 ? "Completado" : course.progress > 0 ? "Continuar" : "Iniciar"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Certifications & Badges Sidebar */}
        <div className="col-span-12 lg:col-span-3 space-y-6">
          
          {/* Badges block */}
          <div className="bg-slate-900/40 border border-slate-800 rounded-3xl p-5 space-y-4 shadow-sm">
            <h2 className="font-bold text-base text-white border-b border-slate-800 pb-2">Certificaciones</h2>
            
            <div className="space-y-3">
              
              {/* Badge 1 */}
              <div className="flex items-center gap-3 p-3 bg-slate-800/80 border border-slate-700/80 rounded-2xl shadow-sm">
                <div className="w-10 h-10 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center rounded-full shrink-0">
                  <CheckCircle className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-bold text-xs text-white">Operador Pro</p>
                  <p className="text-[10px] text-slate-500">Obtenido el 12/03/24</p>
                </div>
              </div>

              {/* Badge 2 */}
              <div className="flex items-center gap-3 p-3 bg-slate-800/80 border border-slate-700/80 rounded-2xl shadow-sm">
                <div className="w-10 h-10 bg-sky-500/10 text-sky-400 border border-sky-500/20 flex items-center justify-center rounded-full shrink-0">
                  <Star className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-bold text-xs text-white">Calibración UV</p>
                  <p className="text-[10px] text-slate-500">Obtenido el 05/01/24</p>
                </div>
              </div>

              {/* Locked Badge 3 */}
              <div className="flex items-center gap-3 p-3 bg-slate-900/20 border border-slate-800 border-dashed rounded-2xl opacity-60">
                <div className="w-10 h-10 bg-gray-800 flex items-center justify-center rounded-full text-gray-500 shrink-0">
                  <Lock className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-bold text-xs text-gray-500">Técnico Máster</p>
                  <p className="text-[10px] text-gray-500">Completa 10 cursos</p>
                </div>
              </div>

            </div>
          </div>

          {/* Tutor Request Block */}
          <div className="bg-slate-800/80 border border-slate-700 text-white rounded-3xl p-5 space-y-3 shadow-md relative overflow-hidden">
            <h4 className="font-bold text-sm">¿Necesitas ayuda?</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Agenda una sesión remota personalizada con un instructor de laboratorio de PrintTech.
            </p>
            <button 
              onClick={() => {
                setSessionRequested(true);
                setTimeout(() => setSessionRequested(false), 3000);
              }}
              className="w-full py-2 bg-sky-500 hover:bg-sky-600 text-white font-bold rounded-xl text-xs transition-colors cursor-pointer text-center"
            >
              {sessionRequested ? "✓ Solicitud Registrada" : "Solicitar Tutoría"}
            </button>
          </div>

        </div>

      </div>

      {/* INTERACTIVE COURSE PROGRESSION SLIDER MODAL */}
      {selectedCourse && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 w-full max-w-md rounded-3xl border border-slate-800 shadow-2xl overflow-hidden animate-fade-in">
            
            <div className="bg-slate-800 p-5 border-b border-slate-700 text-white flex justify-between items-center">
              <div>
                <h3 className="font-bold text-base">Laboratorio de Simulación</h3>
                <p className="text-xs text-slate-400 mt-0.5">Control de avance y práctica técnica.</p>
              </div>
              <button 
                onClick={() => setSelectedCourse(null)}
                className="p-1.5 hover:bg-white/10 rounded-xl text-white cursor-pointer"
              >
                <Lock className="w-4 h-4 hidden" />
                <span className="font-bold text-sm">Cerrar</span>
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="flex gap-4 p-3 bg-slate-950 rounded-2xl border border-slate-850">
                <img src={selectedCourse.image} alt="" className="w-16 h-16 rounded-xl object-cover shrink-0" />
                <div>
                  <h4 className="font-bold text-sm text-white">{selectedCourse.title}</h4>
                  <p className="text-[11px] text-slate-400 leading-tight mt-1">{selectedCourse.description}</p>
                </div>
              </div>

              {/* Slider for progression */}
              <div className="space-y-2 pt-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-white">Simular Avance de Aprendizaje</span>
                  <span className="font-mono font-bold text-sky-400">{selectedCourse.progress}%</span>
                </div>
                <input 
                  type="range" 
                  min="0" 
                  max="100" 
                  step="5"
                  value={selectedCourse.progress}
                  onChange={(e) => handleProgressChange(selectedCourse.id, Number(e.target.value))}
                  className="w-full accent-sky-500 h-2 bg-slate-950 rounded-lg appearance-none cursor-pointer"
                />
                <div className="flex justify-between text-[9px] text-slate-500 font-bold uppercase">
                  <span>No Iniciado</span>
                  <span>En progreso</span>
                  <span>Certificado</span>
                </div>
              </div>

              <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-3 text-emerald-400 text-xs flex gap-2.5 items-center">
                <Activity className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Cualquier cambio guardado se sincroniza con el historial de la base de datos de Google Sheets.</span>
              </div>
            </div>

            <div className="p-4 border-t border-slate-800 bg-slate-950 flex justify-between items-center">
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Duración: {selectedCourse.duration}</span>
              <button 
                onClick={() => setSelectedCourse(null)}
                className="px-4 py-2 bg-sky-500 hover:bg-sky-600 text-white text-xs font-bold rounded-xl cursor-pointer"
              >
                Cerrar Práctica
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
