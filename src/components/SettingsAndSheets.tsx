import React, { useState } from "react";
import { 
  Database, 
  Settings, 
  ShieldAlert, 
  RefreshCw, 
  UserCheck, 
  ToggleLeft, 
  Grid, 
  CheckCircle, 
  Terminal, 
  Key, 
  FileSpreadsheet, 
  Eye, 
  EyeOff,
  Sliders,
  HelpCircle,
  Plus,
  Trash2,
  Lock,
  Loader2,
  SlidersHorizontal,
  Info
} from "lucide-react";
import { DbState, User, ValidationRules, GoogleSheetsSettings } from "../types";

interface SettingsAndSheetsProps {
  state: DbState;
  onSaveGoogleSheetsSettings: (settings: Partial<GoogleSheetsSettings>) => Promise<boolean>;
  onSaveValidationRules: (rules: ValidationRules) => Promise<boolean>;
  onSelectUser: (userId: string) => void;
  isSyncing: boolean;
  onSyncNow: () => void;
}

export default function SettingsAndSheets({
  state,
  onSaveGoogleSheetsSettings,
  onSaveValidationRules,
  onSelectUser,
  isSyncing,
  onSyncNow
}: SettingsAndSheetsProps) {
  // Google Sheets credentials states
  const [spreadsheetId, setSpreadsheetId] = useState(state.googleSheetsSettings.spreadsheetId);
  const [sheetName, setSheetName] = useState(state.googleSheetsSettings.sheetName);
  const [range, setRange] = useState(state.googleSheetsSettings.range);
  const [apiKey, setApiKey] = useState(state.googleSheetsSettings.apiKey);
  const [showApiKey, setShowApiKey] = useState(false);
  const [autoSync, setAutoSync] = useState(state.googleSheetsSettings.autoSyncEnabled);
  const [sheetsSaveSuccess, setSheetsSaveSuccess] = useState(false);
  const [sheetsIsSubmitting, setSheetsIsSubmitting] = useState(false);

  // Validation rules states
  const [caseIdRegex, setCaseIdRegex] = useState(state.validationRules.caseIdRegex);
  const [minClientLength, setMinClientLength] = useState(state.validationRules.minClientLength);
  const [allowSpecialChars, setAllowSpecialChars] = useState(state.validationRules.allowSpecialCharsInClient);
  const [requireModel, setRequireModel] = useState(state.validationRules.requireModelSelection);
  const [requireDesc, setRequireDesc] = useState(state.validationRules.requireDescription);
  const [rulesSaveSuccess, setRulesSaveSuccess] = useState(false);
  const [rulesIsSubmitting, setRulesIsSubmitting] = useState(false);

  const activeUser = state.users.find(u => u.id === state.activeUserId) || state.users[0];

  const handleSaveSheets = async (e: React.FormEvent) => {
    e.preventDefault();
    if (activeUser.role !== "Admin Tech") {
      alert("Acceso Restringido: Solo el Administrador de Soporte (Admin Tech) tiene permisos para modificar la configuración de Google Sheets.");
      return;
    }
    setSheetsIsSubmitting(true);
    const success = await onSaveGoogleSheetsSettings({
      spreadsheetId,
      sheetName,
      range,
      apiKey,
      autoSyncEnabled: autoSync
    });
    setSheetsIsSubmitting(false);
    if (success) {
      setSheetsSaveSuccess(true);
      setTimeout(() => setSheetsSaveSuccess(false), 3000);
    }
  };

  const handleSaveRules = async (e: React.FormEvent) => {
    e.preventDefault();
    if (activeUser.role !== "Admin Tech") {
      alert("Acceso Restringido: Solo el Administrador de Soporte (Admin Tech) tiene permisos para modificar las reglas de validación de captura.");
      return;
    }
    setRulesIsSubmitting(true);
    const success = await onSaveValidationRules({
      caseIdRegex,
      minClientLength: Number(minClientLength),
      allowSpecialCharsInClient: allowSpecialChars,
      requireModelSelection: requireModel,
      requireDescription: requireDesc
    });
    setRulesIsSubmitting(false);
    if (success) {
      setRulesSaveSuccess(true);
      setTimeout(() => setRulesSaveSuccess(false), 3000);
    }
  };

  // Define exact restricted permissions array for visual display
  const getPermissionsForRole = (role: string) => {
    switch (role) {
      case "Admin Tech":
        return [
          "Acceso completo de administrador",
          "Crear, modificar y eliminar cualquier caso técnico",
          "Modificar reglas de validación en tiempo real",
          "Configurar credenciales del Spreadsheet de Google Sheets",
          "Gestionar cuentas de técnicos locales"
        ];
      case "Técnico Nvl 3":
        return [
          "Acceso intermedio de diagnóstico",
          "Crear nuevos casos técnicos",
          "Modificar cualquier caso técnico",
          "Ver biblioteca y descargar manuales",
          "✕ Prohibido eliminar registros en Google Sheets",
          "✕ Prohibido modificar reglas de validación o credenciales de Sheets"
        ];
      case "Técnico Nvl 1":
        return [
          "Acceso básico de operador",
          "Crear nuevos casos técnicos",
          "Modificar únicamente casos técnicos reportados por sí mismo",
          "Ver biblioteca y descargar manuales",
          "✕ Prohibido modificar casos de otros técnicos",
          "✕ Prohibido eliminar cualquier caso",
          "✕ Prohibido alterar configuración o validaciones"
        ];
      default:
        return [];
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      
      {/* Title block */}
      <div className="flex flex-col gap-1 bg-slate-900/40 p-6 border border-slate-800 rounded-3xl shadow-sm">
        <h1 className="font-bold text-2xl text-white">Configuración & Integración</h1>
        <p className="text-slate-400 text-sm">Administre la sincronización con Google Sheets, defina validaciones técnicas y simule accesos restringidos por rol.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Google Sheets Integration & Live Grid (Span 8) */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Google Sheets Config Form */}
          <div className="bg-slate-900/40 border border-slate-800 rounded-3xl p-6 shadow-sm space-y-6">
            <div className="flex justify-between items-start border-b border-slate-800 pb-4">
              <div>
                <h3 className="font-bold text-lg text-white flex items-center gap-2">
                  <Database className="w-5 h-5 text-sky-400" />
                  Sincronización con Google Sheets
                </h3>
                <p className="text-xs text-slate-400 mt-1">Conecte su portal técnico a una hoja de cálculo como base de datos central persistente.</p>
              </div>
              <span className="flex h-2.5 w-2.5 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-500 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-sky-500"></span>
              </span>
            </div>

            {activeUser.role !== "Admin Tech" && (
              <div className="bg-rose-500/10 border border-rose-500/20 rounded-2xl p-4 text-rose-400 text-xs font-semibold flex items-center gap-3">
                <ShieldAlert className="w-5 h-5 shrink-0" />
                <span>Modo de Vista de Lectura: Solo el rol de Administrador (Admin Tech) tiene permisos para editar la configuración de Google Sheets.</span>
              </div>
            )}

            <form onSubmit={handleSaveSheets} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              {/* Spreadsheet ID */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Google Spreadsheet ID</label>
                <input 
                  type="text" 
                  value={spreadsheetId}
                  disabled={activeUser.role !== "Admin Tech"}
                  onChange={(e) => setSpreadsheetId(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl py-2 px-3 text-xs font-mono text-white focus:outline-none focus:ring-1 focus:ring-sky-500 focus:border-transparent disabled:opacity-50"
                />
              </div>

              {/* Sheet Name */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Nombre de la Hoja (Tab)</label>
                <input 
                  type="text" 
                  value={sheetName}
                  disabled={activeUser.role !== "Admin Tech"}
                  onChange={(e) => setSheetName(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl py-2 px-3 text-xs text-white focus:outline-none focus:ring-1 focus:ring-sky-500 focus:border-transparent disabled:opacity-50"
                />
              </div>

              {/* Range */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Rango de Datos</label>
                <input 
                  type="text" 
                  value={range}
                  disabled={activeUser.role !== "Admin Tech"}
                  onChange={(e) => setRange(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl py-2 px-3 text-xs font-mono text-white focus:outline-none focus:ring-1 focus:ring-sky-500 focus:border-transparent disabled:opacity-50"
                />
              </div>

              {/* API Key */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Google Cloud API Key / Credencial</label>
                <div className="relative">
                  <input 
                    type={showApiKey ? "text" : "password"} 
                    value={apiKey}
                    disabled={activeUser.role !== "Admin Tech"}
                    onChange={(e) => setApiKey(e.target.value)}
                    placeholder="Opcional - Simulado activo por defecto"
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl py-2 pl-3 pr-10 text-xs font-mono text-white focus:outline-none focus:ring-1 focus:ring-sky-500 focus:border-transparent disabled:opacity-50"
                  />
                  <button
                    type="button"
                    onClick={() => setShowApiKey(!showApiKey)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white"
                  >
                    {showApiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Toggle Auto Sync */}
              <div className="md:col-span-2 flex items-center justify-between p-3 bg-slate-800/60 rounded-xl">
                <div className="space-y-0.5">
                  <p className="text-xs font-bold text-white">Sincronización en Tiempo Real Automatizada</p>
                  <p className="text-[10px] text-slate-400">Cada acción de creación, edición o eliminación actualiza celdas de forma instantánea.</p>
                </div>
                <input 
                  type="checkbox"
                  checked={autoSync}
                  disabled={activeUser.role !== "Admin Tech"}
                  onChange={(e) => setAutoSync(e.target.checked)}
                  className="w-10 h-5 bg-gray-700 checked:bg-sky-500 rounded-full appearance-none cursor-pointer relative before:content-[''] before:absolute before:w-4 before:h-4 before:bg-white before:rounded-full before:transition-all before:left-0.5 before:top-0.5 checked:before:translate-x-5 border border-gray-600 shadow-inner"
                />
              </div>

              {/* Submission row */}
              <div className="md:col-span-2 flex justify-between items-center pt-2">
                <div className="text-[11px] text-sky-400 font-bold flex items-center gap-1">
                  <Info className="w-3.5 h-3.5" /> Canales seguros proxy SSL habilitados
                </div>
                {activeUser.role === "Admin Tech" && (
                  <button 
                    type="submit"
                    disabled={sheetsIsSubmitting}
                    className="bg-sky-500 hover:opacity-95 text-white px-5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {sheetsIsSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
                    <span>Guardar Configuración de Sheets</span>
                  </button>
                )}
              </div>

              {sheetsSaveSuccess && (
                <div className="md:col-span-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-400" />
                  <span>Sincronización con Google Sheets guardada con éxito. Actualizado Spreadsheet ID simulado.</span>
                </div>
              )}

            </form>
          </div>

          {/* SIMULATED GOOGLE SHEETS LIVE GRID */}
          <div className="bg-slate-900/40 border border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <div>
                <h3 className="font-bold text-base text-white flex items-center gap-2">
                  <Grid className="w-5 h-5 text-sky-400" />
                  Visualizador de Hoja de Cálculo (Google Sheets Grid)
                </h3>
                <p className="text-xs text-slate-400">Representación en tiempo real de las filas y celdas del spreadsheet de Google Sheets.</p>
              </div>
              <button 
                onClick={onSyncNow}
                disabled={isSyncing}
                className="px-3 py-1.5 border border-slate-800 rounded-xl text-[10px] font-bold text-sky-400 flex items-center gap-1.5 hover:bg-slate-800 cursor-pointer disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
                <span>Re-vincular</span>
              </button>
            </div>

            {/* Simulating Sheet grid table */}
            <div className="overflow-x-auto border border-slate-800 rounded-xl custom-scrollbar">
              <table className="w-full text-left border-collapse font-mono text-[10px]">
                <thead>
                  <tr className="bg-slate-950 border-b border-slate-800">
                    <th className="px-3 py-2 text-slate-500 border-r border-slate-800 text-center w-8 bg-slate-900"></th>
                    {state.googleSheetsSettings.simulatedSheet[0].map((header, colIdx) => (
                      <th key={colIdx} className="px-4 py-2 text-slate-300 border-r border-slate-800 font-bold uppercase tracking-wider">
                        {String.fromCharCode(65 + colIdx)} ({header})
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {state.googleSheetsSettings.simulatedSheet.map((row, rowIdx) => {
                    if (rowIdx === 0) return null; // Skip header visual duplicates
                    return (
                      <tr key={rowIdx} className="hover:bg-slate-800/20 transition-colors">
                        <td className="px-3 py-2 border-r border-slate-800 font-bold text-slate-500 bg-slate-900 text-center w-8">
                          {rowIdx + 1}
                        </td>
                        {row.map((cell, cellIdx) => (
                          <td key={cellIdx} className="px-4 py-2 border-r border-slate-800 truncate max-w-[150px] font-medium text-slate-300">
                            {cell}
                          </td>
                        ))}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            
            <p className="text-[10px] text-slate-400 font-bold flex items-center gap-1 leading-none">
              <FileSpreadsheet className="w-4 h-4 text-sky-400" /> 
              Sincronizado: Hoja "{state.googleSheetsSettings.sheetName}" | Rango {state.googleSheetsSettings.range} | {state.cases.length} registros cargados.
            </p>
          </div>

          {/* Sync logs console terminal style */}
          <div className="bg-slate-950 border border-slate-800/80 text-white rounded-3xl p-5 shadow-md">
            <h3 className="font-bold text-sm text-sky-400 flex items-center gap-2 mb-3">
              <Terminal className="w-4 h-4 text-sky-400" />
              Consola de Eventos y Logs de Sincronización
            </h3>
            <div className="font-mono text-[10px] space-y-1.5 max-h-40 overflow-y-auto custom-scrollbar pr-1 bg-slate-900/60 p-3 rounded-2xl border border-slate-850">
              {state.googleSheetsSettings.syncLogs.map((log, i) => (
                <div key={i} className="leading-tight">
                  <span className="text-gray-500 mr-2">[{new Date(log.timestamp).toLocaleTimeString()}]</span>
                  <span className={`mr-2 font-bold uppercase ${
                    log.level === 'success' ? 'text-emerald-400' :
                    log.level === 'error' ? 'text-rose-400' :
                    log.level === 'warning' ? 'text-amber-400' : 'text-[#a2eded]'
                  }`}>
                    {log.level}:
                  </span>
                  <span className="text-gray-200">{log.message}</span>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Right Column: User authentication roles simulator & Validation rules (Span 4) */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* USER ROLES AUTHENTICATION LIST */}
          <div className="bg-slate-900/40 border border-slate-800 rounded-3xl p-6 shadow-sm space-y-5">
            <div>
              <h3 className="font-bold text-base text-white flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-sky-400" />
                Permisos Locales por Rol
              </h3>
              <p className="text-xs text-slate-400 mt-1">Haga clic en un técnico para cambiar la sesión y simular accesos restringidos en tiempo real.</p>
            </div>

            <div className="space-y-4">
              {state.users.map(u => {
                const isSelected = state.activeUserId === u.id;
                const permissions = getPermissionsForRole(u.role);

                return (
                  <div 
                    key={u.id}
                    onClick={() => onSelectUser(u.id)}
                    className={`p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                      isSelected
                        ? "border-sky-500 bg-slate-800/80 shadow-sm"
                        : "border-slate-800 hover:border-sky-500/50 bg-slate-900/20"
                    }`}
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <img src={u.avatar} alt={u.name} className="w-9 h-9 rounded-full object-cover border-2 border-sky-500 shrink-0" />
                      <div>
                        <div className="flex items-center gap-1.5">
                          <p className="font-bold text-xs text-white">{u.name}</p>
                          {isSelected && (
                            <span className="bg-sky-500 text-white text-[8px] font-bold px-1.5 py-0.5 rounded-full uppercase">
                              Activo
                            </span>
                          )}
                        </div>
                        <p className="text-[10px] text-slate-400 font-bold leading-none uppercase mt-0.5">{u.role}</p>
                      </div>
                    </div>

                    {/* Permissions list inside role card */}
                    <ul className="space-y-1 pl-2 border-l border-slate-800 mt-3">
                      {permissions.map((p, idx) => (
                        <li key={idx} className={`text-[10px] leading-tight ${
                          p.startsWith("✕") ? "text-rose-400 font-medium" : "text-slate-300"
                        }`}>
                          • {p}
                        </li>
                      ))}
                    </ul>
                  </div>
                );
              })}
            </div>
          </div>

          {/* CAPTURE FORM DATA VALIDATIONS RULES CONFIG */}
          <div className="bg-slate-900/40 border border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
            <div>
              <h3 className="font-bold text-base text-white flex items-center gap-2">
                <Sliders className="w-5 h-5 text-sky-400" />
                Reglas de Validación de Captura
              </h3>
              <p className="text-xs text-slate-400 mt-1">Configuración en tiempo real para evitar errores de captura en el formulario de incidentes.</p>
            </div>

            {activeUser.role !== "Admin Tech" && (
              <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-400 text-[10px] font-semibold flex items-center gap-2">
                <Lock className="w-4 h-4 shrink-0" />
                <span>Se requieren permisos de Admin Tech para alterar estas reglas.</span>
              </div>
            )}

            <form onSubmit={handleSaveRules} className="space-y-3">
              
              {/* Regex Case ID */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">ID Validación Regex</label>
                <input 
                  type="text" 
                  value={caseIdRegex}
                  disabled={activeUser.role !== "Admin Tech"}
                  onChange={(e) => setCaseIdRegex(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl py-2 px-3 text-xs font-mono focus:outline-none focus:ring-1 focus:ring-sky-500 focus:border-transparent disabled:opacity-50"
                />
              </div>

              {/* Min Client Name Length */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Mínimo Letras Nombre Cliente</label>
                <input 
                  type="number" 
                  value={minClientLength}
                  disabled={activeUser.role !== "Admin Tech"}
                  onChange={(e) => setMinClientLength(Number(e.target.value))}
                  className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl py-2 px-3 text-xs focus:outline-none focus:ring-1 focus:ring-sky-500 focus:border-transparent disabled:opacity-50"
                />
              </div>

              {/* Checkbox: Allow special chars */}
              <div className="flex items-center gap-2.5">
                <input 
                  type="checkbox"
                  id="allowSpecialChars"
                  checked={allowSpecialChars}
                  disabled={activeUser.role !== "Admin Tech"}
                  onChange={(e) => setAllowSpecialChars(e.target.checked)}
                  className="rounded text-sky-500 focus:ring-sky-500 h-4 w-4"
                />
                <label htmlFor="allowSpecialChars" className="text-xs text-slate-300 cursor-pointer">
                  Permitir caracteres especiales en Cliente
                </label>
              </div>

              {/* Checkbox: Require Model selection */}
              <div className="flex items-center gap-2.5">
                <input 
                  type="checkbox"
                  id="requireModel"
                  checked={requireModel}
                  disabled={activeUser.role !== "Admin Tech"}
                  onChange={(e) => setRequireModel(e.target.checked)}
                  className="rounded text-sky-500 focus:ring-sky-500 h-4 w-4"
                />
                <label htmlFor="requireModel" className="text-xs text-slate-300 cursor-pointer">
                  Exigir selección de impresora válida
                </label>
              </div>

              {/* Checkbox: Require detailed description */}
              <div className="flex items-center gap-2.5">
                <input 
                  type="checkbox"
                  id="requireDesc"
                  checked={requireDesc}
                  disabled={activeUser.role !== "Admin Tech"}
                  onChange={(e) => setRequireDesc(e.target.checked)}
                  className="rounded text-sky-500 focus:ring-sky-500 h-4 w-4"
                />
                <label htmlFor="requireDesc" className="text-xs text-slate-300 cursor-pointer">
                  Exigir descripción de incidente (&gt;10 letras)
                </label>
              </div>

              {activeUser.role === "Admin Tech" && (
                <button 
                  type="submit"
                  disabled={rulesIsSubmitting}
                  className="w-full bg-sky-500 hover:bg-sky-600 text-white py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {rulesIsSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
                  <span>Aplicar Reglas de Formulario</span>
                </button>
              )}

              {rulesSaveSuccess && (
                <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-3 py-1.5 rounded-xl text-[10px] font-semibold flex items-center gap-2">
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Validaciones de captura modificadas. El formulario responderá a estas reglas inmediatamente.</span>
                </div>
              )}

            </form>
          </div>

        </div>

      </div>

    </div>
  );
}
