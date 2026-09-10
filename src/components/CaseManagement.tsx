import React, { useState, useMemo } from "react";
import { 
  Plus, 
  Search, 
  SlidersHorizontal, 
  Trash2, 
  Edit3, 
  History, 
  X, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  Loader2, 
  ArrowRight,
  Info,
  ChevronRight,
  FileSpreadsheet
} from "lucide-react";
import { Case, User, ValidationRules, DbState } from "../types";

interface CaseManagementProps {
  state: DbState;
  onSaveCase: (caseData: Partial<Case>) => Promise<{ success: boolean; error?: string }>;
  onDeleteCase: (id: string) => Promise<{ success: boolean; error?: string }>;
  onSyncNow: () => void;
  isSyncing: boolean;
  newCaseModalOpen: boolean;
  setNewCaseModalOpen: (open: boolean) => void;
}

export default function CaseManagement({
  state,
  onSaveCase,
  onDeleteCase,
  onSyncNow,
  isSyncing,
  newCaseModalOpen,
  setNewCaseModalOpen
}: CaseManagementProps) {
  // Filters & Search
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("Todos los Estados");
  const [priorityFilter, setPriorityFilter] = useState("Todas las Prioridades");

  // Selected case for editing/inspecting
  const [editingCase, setEditingCase] = useState<Partial<Case> | null>(null);
  const [inspectingLogsCase, setInspectingLogsCase] = useState<Case | null>(null);

  // Form Fields & Error States
  const [formData, setFormData] = useState({
    id: "",
    client: "",
    model: "Plotter Z-Series X1",
    status: "Abierto",
    priority: "Media",
    description: ""
  });
  const [formError, setFormError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const activeUser = state.users.find(u => u.id === state.activeUserId) || state.users[0];

  const printerModels = [
    "Plotter Z-Series X1",
    "LaserJet Pro M501",
    "Indico 12000 Press",
    "Latex 365 Printer",
    "Eco-Jet Desktop v3",
    "Plotter Master 8000",
    "Industrial Line P-Series",
    "Thermal-Z"
  ];

  // Data filtering
  const filteredCases = useMemo(() => {
    return state.cases.filter(c => {
      const query = searchQuery.toLowerCase();
      const matchesSearch = 
        c.id.toLowerCase().includes(query) || 
        c.client.toLowerCase().includes(query) || 
        c.model.toLowerCase().includes(query) ||
        (c.description && c.description.toLowerCase().includes(query));

      const matchesStatus = statusFilter === "Todos los Estados" || c.status === statusFilter;
      const matchesPriority = priorityFilter === "Todas las Prioridades" || c.priority === priorityFilter;

      return matchesSearch && matchesStatus && matchesPriority;
    });
  }, [state.cases, searchQuery, statusFilter, priorityFilter]);

  // Critical cases list (Crítica)
  const criticalCases = useMemo(() => {
    return state.cases.filter(c => c.priority === "Crítica");
  }, [state.cases]);

  // Daily Metrics
  const casesCreatedTodayCount = state.cases.length + 3; // Simulating relative volume
  const casesSolvedTodayCount = state.cases.filter(c => c.status === "Resuelto").length + 6;
  const efficiencyPercentage = Math.round((casesSolvedTodayCount / (casesCreatedTodayCount || 1)) * 100);

  // Start Creation
  const handleOpenCreate = () => {
    setFormData({
      id: `#77${Math.floor(100 + Math.random() * 899)}-A`, // Seed a suggested clean ID
      client: "",
      model: printerModels[0],
      status: "Abierto",
      priority: "Media",
      description: ""
    });
    setFormError("");
    setFieldErrors({});
    setEditingCase({ isNew: true } as any);
    setNewCaseModalOpen(true);
  };

  // Start Editing
  const handleOpenEdit = (c: Case) => {
    // Role level check: Técnico Nvl 1 can only edit their own report
    if (activeUser.role === "Técnico Nvl 1" && c.reporter !== activeUser.name) {
      alert(`Acceso Restringido: Como Técnico Nvl 1, solo puedes editar casos reportados por ti mismo. Este caso fue reportado por: ${c.reporter}`);
      return;
    }

    setFormData({
      id: c.id,
      client: c.client,
      model: c.model,
      status: c.status,
      priority: c.priority,
      description: c.description || ""
    });
    setFormError("");
    setFieldErrors({});
    setEditingCase(c);
    setNewCaseModalOpen(true);
  };

  // Validate form in real time client side
  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};
    const rules = state.validationRules;

    // Case ID
    const idRegex = new RegExp(rules.caseIdRegex);
    if (!formData.id) {
      errors.id = "El código del caso es obligatorio.";
    } else if (!idRegex.test(formData.id)) {
      errors.id = `Formato incorrecto. Debe cumplir con ${rules.caseIdRegex} (Ej: #77412-A).`;
    }

    // Client Name
    if (!formData.client.trim()) {
      errors.client = "El nombre del cliente es obligatorio.";
    } else if (formData.client.trim().length < rules.minClientLength) {
      errors.client = `Mínimo de caracteres: ${rules.minClientLength}.`;
    }

    if (!rules.allowSpecialCharsInClient) {
      const specialChars = /[^a-zA-Z0-9\sÁÉÍÓÚáéíóúÑñ.,-]/;
      if (specialChars.test(formData.client)) {
        errors.client = "No se permiten caracteres especiales o símbolos.";
      }
    }

    // Model selection
    if (rules.requireModelSelection && !formData.model) {
      errors.model = "Selecciona un modelo técnico de impresora.";
    }

    // Description
    if (rules.requireDescription && (!formData.description || formData.description.trim().length < 10)) {
      errors.description = "Descripción obligatoria (mínimo 10 caracteres).";
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Save form
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    setFormError("");

    try {
      const payload = {
        ...formData,
        reporter: editingCase?.id ? editingCase.reporter : activeUser.name
      };

      const res = await onSaveCase(payload);
      if (res.success) {
        setNewCaseModalOpen(false);
        setEditingCase(null);
      } else {
        setFormError(res.error || "Ocurrió un error al guardar el caso.");
      }
    } catch (err: any) {
      setFormError("Error de comunicación con el servidor.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Delete
  const handleDelete = async (id: string) => {
    if (activeUser.role !== "Admin Tech") {
      alert("Acceso Restringido: Solo administradores (Admin Tech) pueden eliminar de forma permanente registros de la hoja de cálculo de Google Sheets.");
      return;
    }

    if (confirm(`¿Está seguro de que desea eliminar permanentemente el caso ${id}? Esta acción quitará la fila de la hoja de cálculo de Google Sheets de forma instantánea.`)) {
      await onDeleteCase(id);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      
      {/* Header Section with CTA */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-slate-900/40 p-6 border border-slate-800 rounded-3xl shadow-sm">
        <div>
          <h2 className="font-bold text-2xl text-white">Centro de Casos Técnicos</h2>
          <p className="text-slate-400 text-sm mt-1">Gestión, validación y sincronización en tiempo real con Google Sheets.</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={onSyncNow}
            disabled={isSyncing}
            className="px-4 py-2 border border-slate-800 rounded-xl hover:bg-slate-800/60 transition-colors text-xs font-bold text-sky-400 flex items-center gap-2 cursor-pointer disabled:opacity-50"
          >
            <Loader2 className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
            Sincronizar Sheets
          </button>
          <button 
            onClick={handleOpenCreate}
            className="bg-sky-500 hover:bg-sky-600 text-white px-5 py-2.5 rounded-xl flex items-center gap-2 shadow-md transition-all active:scale-95 text-sm font-bold cursor-pointer"
          >
            <Plus className="w-5 h-5" />
            <span>Nuevo Caso</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-6">
        
        {/* Main Table Area (Col-span 9 on desktop) */}
        <div className="col-span-12 lg:col-span-9 space-y-4">
          
          {/* Filters and search row */}
          <div className="bg-slate-900/40 p-4 rounded-2xl border border-slate-800 flex flex-wrap gap-4 items-center shadow-sm">
            <div className="relative flex-1 min-w-[200px]">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">
                <Search className="w-4 h-4" />
              </span>
              <input 
                type="text" 
                placeholder="Buscar por ID, cliente, modelo o descripción..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-full py-1.5 pl-10 pr-4 text-xs text-white focus:outline-none focus:ring-1 focus:ring-sky-500 focus:border-transparent transition-all"
              />
            </div>

            <div className="flex flex-wrap gap-2 items-center">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1 shrink-0">
                <SlidersHorizontal className="w-3.5 h-3.5 text-sky-400" /> Filtrar por:
              </span>
              
              <select 
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-slate-800 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-slate-200 focus:ring-1 focus:ring-sky-500 focus:border-transparent outline-none"
              >
                <option>Todos los Estados</option>
                <option>Abierto</option>
                <option>En Proceso</option>
                <option>Esperando Pieza</option>
                <option>Resuelto</option>
              </select>

              <select 
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
                className="bg-slate-800 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-slate-200 focus:ring-1 focus:ring-sky-500 focus:border-transparent outline-none"
              >
                <option>Todas las Prioridades</option>
                <option>Crítica</option>
                <option>Alta</option>
                <option>Media</option>
              </select>
            </div>
          </div>

          {/* Cases Data Table */}
          <div className="bg-slate-900/40 border border-slate-800 rounded-3xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto custom-scrollbar">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-950 border-b border-slate-800">
                    <th className="px-5 py-3 text-[11px] font-bold text-slate-400 tracking-wider uppercase">ID Caso</th>
                    <th className="px-5 py-3 text-[11px] font-bold text-slate-400 tracking-wider uppercase">Cliente</th>
                    <th className="px-5 py-3 text-[11px] font-bold text-slate-400 tracking-wider uppercase">Modelo Impresora</th>
                    <th className="px-5 py-3 text-[11px] font-bold text-slate-400 tracking-wider uppercase">Estado</th>
                    <th className="px-5 py-3 text-[11px] font-bold text-slate-400 tracking-wider uppercase">Prioridad</th>
                    <th className="px-5 py-3 text-[11px] font-bold text-slate-400 tracking-wider uppercase text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 text-xs">
                  {filteredCases.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-5 py-10 text-center text-slate-500 font-medium bg-slate-900/10">
                        No se encontraron casos activos que coincidan con los filtros seleccionados.
                      </td>
                    </tr>
                  ) : (
                    filteredCases.map(c => {
                      const minutesAgo = Math.round((Date.now() - new Date(c.updatedAt).getTime()) / 60000);
                      let relativeText = "Hace momentos";
                      if (minutesAgo < 60) relativeText = `Hace ${minutesAgo}m`;
                      else if (minutesAgo < 1440) relativeText = `Hace ${Math.floor(minutesAgo / 60)}h`;
                      else relativeText = new Date(c.updatedAt).toLocaleDateString();

                      return (
                        <tr key={c.id} className="hover:bg-slate-800/30 transition-colors group">
                          <td className="px-5 py-4 font-mono font-bold text-sky-400 text-sm whitespace-nowrap">
                            {c.id}
                          </td>
                          <td className="px-5 py-4 font-semibold text-white text-sm">
                            <div>
                              <p className="line-clamp-1">{c.client}</p>
                              <p className="text-[10px] text-slate-400 font-medium mt-0.5">Por: {c.reporter}</p>
                            </div>
                          </td>
                          <td className="px-5 py-4 font-medium text-slate-300 text-xs whitespace-nowrap">
                            {c.model}
                          </td>
                          <td className="px-5 py-4 whitespace-nowrap">
                            <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase inline-flex items-center gap-1.5 ${
                              c.status === 'Abierto' ? 'bg-rose-500/10 text-rose-400' :
                              c.status === 'En Proceso' ? 'bg-sky-500/10 text-sky-400' :
                              c.status === 'Esperando Pieza' ? 'bg-amber-500/10 text-amber-400' :
                              'bg-emerald-500/10 text-emerald-400'
                            }`}>
                              {c.status === 'Abierto' && <span className="w-1.5 h-1.5 bg-rose-400 rounded-full animate-ping"></span>}
                              {c.status}
                            </span>
                          </td>
                          <td className="px-5 py-4 whitespace-nowrap">
                            <span className={`font-bold text-[11px] ${
                              c.priority === 'Crítica' ? 'text-rose-400' :
                              c.priority === 'Alta' ? 'text-amber-400' : 'text-sky-400'
                            }`}>
                              {c.priority}
                            </span>
                          </td>
                          <td className="px-5 py-4 text-right whitespace-nowrap">
                            <div className="flex justify-end gap-1.5">
                              <button 
                                onClick={() => setInspectingLogsCase(c)}
                                className="p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white rounded-lg transition-colors cursor-pointer"
                                title="Ver historial de auditoría"
                              >
                                <History className="w-4 h-4" />
                              </button>
                              <button 
                                onClick={() => handleOpenEdit(c)}
                                className="p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white rounded-lg transition-colors cursor-pointer"
                                title="Editar caso"
                              >
                                <Edit3 className="w-4 h-4" />
                              </button>
                              {activeUser.role === "Admin Tech" && (
                                <button 
                                  onClick={() => handleDelete(c.id)}
                                  className="p-1.5 text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors cursor-pointer"
                                  title="Eliminar caso de forma permanente"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Table Footer info */}
            <div className="p-4 bg-slate-950/60 border-t border-slate-800 flex flex-col sm:flex-row justify-between items-center gap-2 text-xs text-slate-400 font-medium">
              <span>Mostrando {filteredCases.length} de {state.cases.length} casos totales en la base de datos.</span>
              <span className="flex items-center gap-1 bg-slate-900 border border-slate-800 px-2.5 py-1 rounded-full text-[10px] font-bold text-sky-400 uppercase">
                <FileSpreadsheet className="w-3.5 h-3.5" /> Sincronización en tiempo real habilitada
              </span>
            </div>

          </div>

        </div>

        {/* Sidebar Widgets (Col-span 3 on desktop) */}
        <div className="col-span-12 lg:col-span-3 space-y-6">
          
          {/* Critical cases widget */}
          <div className="bg-slate-900/40 rounded-3xl p-6 border border-slate-800 shadow-sm relative overflow-hidden">
            <h3 className="font-bold text-base text-white mb-4 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0" />
              Casos Críticos ({criticalCases.length})
            </h3>

            <div className="space-y-3 max-h-[300px] overflow-y-auto custom-scrollbar pr-1">
              {criticalCases.map(c => (
                <div 
                  key={c.id}
                  onClick={() => handleOpenEdit(c)}
                  className="bg-slate-950/60 rounded-xl p-3 border border-slate-800 border-l-4 border-l-rose-500 shadow-sm cursor-pointer hover:shadow-md hover:scale-[1.01] transition-all"
                >
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-mono font-bold text-sky-400 text-xs">{c.id}</span>
                    <span className="text-[9px] font-bold text-rose-400 uppercase tracking-widest bg-rose-505/10 px-1.5 py-0.5 rounded">
                      BLOQUEANTE
                    </span>
                  </div>
                  <h4 className="font-bold text-xs text-white line-clamp-1">{c.client}</h4>
                  <p className="text-[10px] text-slate-400 truncate mt-0.5">{c.model}</p>
                  
                  <div className="flex items-center justify-between mt-3 pt-2 border-t border-slate-800">
                    <span className="text-[10px] text-slate-500 italic truncate max-w-[100px]">
                      Reportado por {c.reporter}
                    </span>
                    <span className="text-[9px] text-sky-400 font-bold hover:underline inline-flex items-center gap-0.5">
                      Ver <ChevronRight className="w-2.5 h-2.5" />
                    </span>
                  </div>
                </div>
              ))}
              {criticalCases.length === 0 && (
                <p className="text-xs text-slate-500 font-medium text-center py-6">Excelente: No hay casos críticos bloqueantes hoy.</p>
              )}
            </div>
          </div>

          {/* Metrics summary widget */}
          <div className="bg-slate-900/40 border border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Estadísticas de Hoy</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <p className="text-[10px] text-slate-400 font-bold uppercase">Casos Nuevos</p>
                <p className="text-3xl font-bold text-white font-mono">{casesCreatedTodayCount}</p>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] text-slate-400 font-bold uppercase">Resueltos</p>
                <p className="text-3xl font-bold text-sky-400 font-mono">{casesSolvedTodayCount}</p>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-800 space-y-2">
              <div className="flex justify-between text-xs font-bold text-slate-200">
                <span>Eficiencia Operativa</span>
                <span className="font-mono">{efficiencyPercentage}%</span>
              </div>
              <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                <div 
                  className="bg-sky-500 h-full rounded-full transition-all duration-700" 
                  style={{ width: `${Math.min(100, efficiencyPercentage)}%` }}
                ></div>
              </div>
            </div>
          </div>

        </div>

      </div>

      {/* MODAL 1: CREATE OR UPDATE CASE FORM */}
      {newCaseModalOpen && editingCase && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 w-full max-w-lg rounded-3xl border border-slate-800 shadow-2xl overflow-hidden animate-fade-in">
            
            {/* Modal Header */}
            <div className="bg-slate-950 border-b border-slate-800 p-5 text-white flex justify-between items-center">
              <div>
                <h3 className="font-bold text-lg text-white">
                  {editingCase.id ? `Editar Caso ${editingCase.id}` : "Registrar Nuevo Caso Técnico"}
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">Captura con validación de datos en tiempo real.</p>
              </div>
              <button 
                onClick={() => {
                  setNewCaseModalOpen(false);
                  setEditingCase(null);
                }}
                className="p-1.5 hover:bg-white/10 rounded-xl transition-colors text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              
              {formError && (
                <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              {/* Case ID */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                  Código de Caso (Sincronización ID)
                </label>
                <input 
                  type="text" 
                  value={formData.id}
                  disabled={!editingCase.isNew}
                  onChange={(e) => {
                    setFormData({ ...formData, id: e.target.value });
                    setFieldErrors({ ...fieldErrors, id: "" });
                  }}
                  placeholder="#77412-A"
                  className={`w-full bg-slate-800 border rounded-xl py-2 px-3 text-sm text-white focus:outline-none focus:ring-1 focus:ring-sky-500 focus:border-transparent transition-all ${
                    fieldErrors.id ? "border-rose-400 ring-1 ring-rose-300" : "border-slate-700"
                  } disabled:opacity-50`}
                />
                {fieldErrors.id && <p className="text-[10px] text-rose-400 font-semibold">{fieldErrors.id}</p>}
                <p className="text-[10px] text-slate-500 font-medium leading-none mt-1">Formato obligatorio: {state.validationRules.caseIdRegex}</p>
              </div>

              {/* Client */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                  Nombre del Cliente / Empresa
                </label>
                <input 
                  type="text" 
                  value={formData.client}
                  onChange={(e) => {
                    setFormData({ ...formData, client: e.target.value });
                    setFieldErrors({ ...fieldErrors, client: "" });
                  }}
                  placeholder="Ej: Gráficas del Norte S.A."
                  className={`w-full bg-slate-800 border rounded-xl py-2 px-3 text-sm text-white focus:outline-none focus:ring-1 focus:ring-sky-500 focus:border-transparent transition-all ${
                    fieldErrors.client ? "border-rose-400 ring-1 ring-rose-300" : "border-slate-700"
                  }`}
                />
                {fieldErrors.client && <p className="text-[10px] text-rose-400 font-semibold">{fieldErrors.client}</p>}
              </div>

              {/* Model & Priority Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                    Modelo de Plóter/Impresora
                  </label>
                  <select 
                    value={formData.model}
                    onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl py-2 px-3 text-sm focus:outline-none focus:ring-1 focus:ring-sky-500 focus:border-transparent outline-none"
                  >
                    {printerModels.map(m => (
                      <option key={m} value={m}>{m}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                    Prioridad Técnica
                  </label>
                  <select 
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value as any })}
                    className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl py-2 px-3 text-sm focus:outline-none focus:ring-1 focus:ring-sky-500 focus:border-transparent outline-none"
                  >
                    <option value="Media">Media</option>
                    <option value="Alta">Alta</option>
                    <option value="Crítica">Crítica</option>
                  </select>
                </div>
              </div>

              {/* Status */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                  Estado de Diagnóstico / Reparación
                </label>
                <select 
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                  className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl py-2 px-3 text-sm focus:outline-none focus:ring-1 focus:ring-sky-500 focus:border-transparent outline-none"
                >
                  <option value="Abierto">Abierto</option>
                  <option value="En Proceso">En Proceso</option>
                  <option value="Esperando Pieza">Esperando Pieza</option>
                  <option value="Resuelto">Resuelto</option>
                </select>
              </div>

              {/* Description */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                  Descripción Detallada del Fallo Técnico
                </label>
                <textarea 
                  rows={3}
                  value={formData.description}
                  onChange={(e) => {
                    setFormData({ ...formData, description: e.target.value });
                    setFieldErrors({ ...fieldErrors, description: "" });
                  }}
                  placeholder="Detalle los códigos de error visualizados, fallos de calibración o piezas requeridas..."
                  className={`w-full bg-slate-800 border rounded-xl py-2 px-3 text-sm text-white focus:outline-none focus:ring-1 focus:ring-sky-500 focus:border-transparent transition-all ${
                    fieldErrors.description ? "border-rose-400 ring-1 ring-rose-300" : "border-slate-700"
                  }`}
                ></textarea>
                {fieldErrors.description && <p className="text-[10px] text-rose-400 font-semibold">{fieldErrors.description}</p>}
              </div>

              {/* Action buttons */}
              <div className="pt-4 border-t border-slate-800 flex justify-between items-center">
                <span className="text-[10px] text-slate-400 font-semibold uppercase flex items-center gap-1">
                  <Info className="w-3.5 h-3.5 text-sky-400" /> Operador: {activeUser.name}
                </span>
                
                <div className="flex gap-2">
                  <button 
                    type="button"
                    onClick={() => {
                      setNewCaseModalOpen(false);
                      setEditingCase(null);
                    }}
                    className="px-4 py-2 border border-slate-700 rounded-xl text-xs font-bold text-slate-300 hover:bg-slate-800 cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button 
                    type="submit"
                    disabled={isSubmitting}
                    className="bg-sky-500 hover:bg-sky-600 text-white px-5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 cursor-pointer disabled:opacity-55"
                  >
                    {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
                    <span>{editingCase.id ? "Actualizar y Sincronizar" : "Sincronizar con G-Sheets"}</span>
                  </button>
                </div>
              </div>

            </form>

          </div>
        </div>
      )}

      {/* MODAL 2: INSPECT AUDIT LOGS */}
      {inspectingLogsCase && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 w-full max-w-lg rounded-3xl border border-slate-800 shadow-2xl overflow-hidden animate-fade-in">
            
            <div className="bg-slate-950 border-b border-slate-800 p-5 text-white flex justify-between items-center">
              <div>
                <h3 className="font-bold text-lg text-white">Historial de Auditoría: {inspectingLogsCase.id}</h3>
                <p className="text-xs text-slate-400 mt-0.5">Sincronización y cambios en tiempo real registrados en Google Sheets.</p>
              </div>
              <button 
                onClick={() => setInspectingLogsCase(null)}
                className="p-1.5 hover:bg-white/10 rounded-xl text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 max-h-[400px] overflow-y-auto custom-scrollbar">
              
              <div className="bg-slate-800 p-4 rounded-2xl space-y-1">
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Cliente de Incidencia</p>
                <p className="font-bold text-sm text-sky-400">{inspectingLogsCase.client}</p>
                <p className="text-xs text-slate-300 mt-2"><span className="font-semibold">Modelo:</span> {inspectingLogsCase.model}</p>
                <p className="text-xs text-slate-300 mt-1"><span className="font-semibold">Descripción:</span> {inspectingLogsCase.description}</p>
              </div>

              <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest pt-2">Línea de Tiempo de Auditoría</h4>

              <div className="space-y-4 pl-4 border-l border-sky-500/20 relative">
                {inspectingLogsCase.historicalLogs && inspectingLogsCase.historicalLogs.map((log, index) => (
                  <div key={index} className="relative space-y-1 pb-1">
                    
                    {/* Circle indicators on sidebar timeline */}
                    <span className="absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full bg-sky-500 border-2 border-slate-900 ring-2 ring-sky-500/20"></span>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-bold text-white">{log.action} por {log.user}</span>
                      <span className="text-[10px] text-slate-500">{new Date(log.timestamp).toLocaleString()}</span>
                    </div>
                    <p className="text-xs text-slate-400 leading-tight">{log.detail}</p>
                  </div>
                ))}
              </div>

            </div>

            <div className="p-4 bg-slate-950 border-t border-slate-800 flex justify-end">
              <button 
                onClick={() => setInspectingLogsCase(null)}
                className="px-5 py-2 bg-sky-500 hover:bg-sky-600 text-white text-xs font-bold rounded-xl cursor-pointer"
              >
                Cerrar Auditoría
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
