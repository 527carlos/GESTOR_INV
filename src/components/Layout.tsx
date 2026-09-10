import React, { useState } from "react";
import { 
  LayoutDashboard, 
  BookOpen, 
  GraduationCap, 
  FileSpreadsheet, 
  Settings, 
  HelpCircle, 
  Bell, 
  Database,
  Search,
  Menu,
  X,
  UserCheck,
  RefreshCw,
  LogOut,
  Sliders,
  DatabaseZap
} from "lucide-react";
import { User, DbState } from "../types";

interface LayoutProps {
  children: React.ReactNode;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  state: DbState;
  onSelectUser: (userId: string) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  isSyncing: boolean;
  onSyncNow: () => void;
}

export default function Layout({
  children,
  activeTab,
  setActiveTab,
  state,
  onSelectUser,
  searchQuery,
  setSearchQuery,
  isSyncing,
  onSyncNow
}: LayoutProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [notificationOpen, setNotificationOpen] = useState(false);

  const activeUser = state.users.find(u => u.id === state.activeUserId) || state.users[0];

  const navigationItems = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "library", label: "Instructivos", icon: BookOpen },
    { id: "training", label: "Capacitación", icon: GraduationCap },
    { id: "cases", label: "Gestión de Casos", icon: Sliders },
    { id: "settings", label: "Sheets & Roles", icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-brand-bg flex text-slate-200">
      
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 bg-slate-900/40 backdrop-blur border-r border-slate-800 fixed h-screen z-30">
        <div className="p-6 border-b border-slate-800/80">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-sky-500/10 flex items-center justify-center rounded-xl border border-sky-500/20 text-sky-400 shrink-0 shadow-sm">
                <Database className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h2 className="font-bold text-base leading-tight text-white tracking-tight">ISERA Portal</h2>
                  <span className="text-[9px] font-mono font-bold bg-sky-500/15 text-sky-400 px-1.5 py-0.2 rounded border border-sky-500/20">PRO</span>
                </div>
                <p className="text-[10px] text-slate-400 font-semibold tracking-wider uppercase mt-0.5">PrintTech Systems</p>
              </div>
            </div>
          </div>
          <div className="mt-3 flex items-center justify-between text-[10px] text-slate-500 font-mono">
            <span className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              v4.2.1-online
            </span>
            <a 
              href="https://p.isera.dev/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-sky-400 hover:text-sky-300 font-sans font-medium flex items-center gap-0.5"
            >
              p.isera.dev ↗
            </a>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-1">
          {navigationItems.map(item => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? "bg-sky-500/10 text-sky-400 shadow-sm font-semibold border border-sky-500/10"
                    : "text-slate-400 hover:bg-slate-800/50 hover:text-white"
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? "text-sky-400" : ""}`} />
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* Sheets Quick Status */}
        <div className="p-4 mx-3 mb-4 bg-slate-900/50 border border-slate-800 rounded-2xl">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-slate-400 tracking-wide uppercase flex items-center gap-1.5">
              <DatabaseZap className="w-3.5 h-3.5 text-sky-400" /> Sheets Sync
            </span>
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
          </div>
          <p className="text-[11px] text-slate-400 truncate" title={state.googleSheetsSettings.spreadsheetId}>
            ID: ...{state.googleSheetsSettings.spreadsheetId.slice(-8)}
          </p>
          <div className="mt-3 flex items-center justify-between">
            <span className="text-[10px] text-slate-500 font-medium">Auto-Sync Activo</span>
            <button 
              onClick={onSyncNow}
              disabled={isSyncing}
              className="text-[10px] text-sky-400 flex items-center gap-1 hover:underline font-bold"
            >
              <RefreshCw className={`w-3 h-3 ${isSyncing ? 'animate-spin' : ''}`} />
              Sincronizar
            </button>
          </div>
        </div>

        {/* User Session Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-900/50">
          <div className="relative">
            <button 
              onClick={() => setUserDropdownOpen(!userDropdownOpen)}
              className="w-full flex items-center gap-3 p-1.5 rounded-xl hover:bg-slate-800/50 transition-colors text-left"
            >
              <img 
                src={activeUser.avatar} 
                alt={activeUser.name} 
                className="w-10 h-10 rounded-full object-cover border-2 border-sky-400"
              />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold truncate text-slate-200">{activeUser.name}</p>
                <p className="text-[10px] text-slate-400 font-semibold tracking-wider uppercase">{activeUser.role}</p>
              </div>
              <UserCheck className="w-4 h-4 text-sky-400 shrink-0" />
            </button>

            {/* Simulated Roles Selector Menu */}
            {userDropdownOpen && (
              <div className="absolute bottom-full left-0 w-full mb-2 bg-slate-900 border border-slate-800 shadow-xl z-50 py-2">
                <p className="px-3 py-1.5 text-[10px] font-bold text-slate-400 tracking-wider uppercase border-b border-slate-800">
                  Simular Usuario (Roles)
                </p>
                {state.users.map(u => (
                  <button
                    key={u.id}
                    onClick={() => {
                      onSelectUser(u.id);
                      setUserDropdownOpen(false);
                    }}
                    className={`w-full flex items-center gap-2.5 px-3 py-2 text-xs text-left transition-colors ${
                      state.activeUserId === u.id 
                        ? "bg-slate-800 font-semibold text-white" 
                        : "hover:bg-slate-800/50 text-slate-300"
                    }`}
                  >
                    <img src={u.avatar} alt={u.name} className="w-6 h-6 rounded-full object-cover" />
                    <div>
                      <p className="font-semibold leading-none">{u.name}</p>
                      <p className="text-[9px] text-slate-400">{u.role}</p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* Main Container */}
      <div className="flex-1 flex flex-col md:pl-64 min-w-0">
        
        {/* Top Header Navbar */}
        <header className="h-16 bg-slate-950/70 backdrop-blur border-b border-slate-800 sticky top-0 z-20 flex items-center justify-between px-4 md:px-8 shadow-sm">
          <div className="flex items-center gap-4 flex-1">
            <button 
              onClick={() => setMobileMenuOpen(true)}
              className="md:hidden p-1.5 hover:bg-slate-800 rounded-xl text-slate-200"
            >
              <Menu className="w-6 h-6" />
            </button>

            {/* Quick Filter Search */}
            <div className="relative w-full max-w-md hidden sm:block">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                <Search className="w-4 h-4" />
              </span>
              <input 
                type="text" 
                placeholder="Buscar manuales, casos técnicos o herramientas..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-900/90 border border-slate-800 rounded-xl py-1.5 pl-9 pr-14 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-sky-500 focus:border-transparent transition-all font-sans"
              />
              <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] font-mono text-slate-500 bg-slate-800 px-1.5 py-0.5 rounded border border-slate-700 pointer-events-none">
                ⌘K
              </span>
            </div>

            <div className="md:hidden">
              <h1 className="font-bold text-white text-base">ISERA Portal</h1>
            </div>
          </div>

          {/* Quick actions right corner */}
          <div className="flex items-center gap-3">
            {/* Live Sheets Indicator */}
            <div className="hidden lg:flex items-center gap-2 bg-slate-900 border border-slate-800 rounded-full px-3 py-1 text-xs text-sky-400 font-medium">
              <DatabaseZap className="w-3.5 h-3.5" />
              <span>G-Sheets Activo</span>
            </div>

            {/* Notifications Alert Bell */}
            <div className="relative">
              <button 
                onClick={() => setNotificationOpen(!notificationOpen)}
                className="p-2 text-slate-400 hover:bg-slate-800 rounded-full transition-colors relative"
              >
                <Bell className="w-5 h-5" />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full ring-2 ring-slate-950"></span>
              </button>

              {/* Live sync logs notification popup */}
              {notificationOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-slate-900/95 backdrop-blur rounded-2xl border border-slate-800 shadow-xl z-50 py-3 px-4">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-800 mb-2">
                    <h3 className="font-bold text-sm text-white">Logs de Sincronización</h3>
                    <span className="text-[9px] font-bold text-sky-400 px-2 py-0.5 bg-slate-800 rounded-full">Real-time</span>
                  </div>
                  <div className="max-h-60 overflow-y-auto space-y-2 custom-scrollbar">
                    {state.googleSheetsSettings.syncLogs.slice(0, 10).map((log, i) => (
                      <div key={i} className="text-xs pb-2 border-b border-slate-800 last:border-0">
                        <div className="flex justify-between text-[9px] text-slate-400 mb-0.5">
                          <span>{new Date(log.timestamp).toLocaleTimeString()}</span>
                          <span className={`capitalize font-semibold ${
                            log.level === 'success' ? 'text-emerald-400' :
                            log.level === 'error' ? 'text-rose-400' : 'text-sky-400'
                          }`}>{log.level}</span>
                        </div>
                        <p className="text-slate-200 leading-tight">{log.message}</p>
                      </div>
                    ))}
                  </div>
                  <button 
                    onClick={() => {
                      setActiveTab("settings");
                      setNotificationOpen(false);
                    }}
                    className="w-full mt-2 text-center text-xs text-sky-400 hover:underline font-bold"
                  >
                    Ver consola de Sheets
                  </button>
                </div>
              )}
            </div>

            <div className="h-6 w-px bg-slate-800"></div>

            {/* Mobile User Switcher */}
            <div className="flex items-center gap-2">
              <img 
                src={activeUser.avatar} 
                alt={activeUser.name} 
                className="w-8 h-8 rounded-full object-cover border border-sky-400 md:border-0"
              />
              <div className="hidden lg:block text-left leading-none">
                <p className="text-xs font-bold text-slate-200">{activeUser.name}</p>
                <p className="text-[9px] text-slate-400 font-bold tracking-wider uppercase mt-0.5">{activeUser.level}</p>
              </div>
            </div>
          </div>
        </header>

        {/* Mobile Sidebar Modal */}
        {mobileMenuOpen && (
          <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-50 md:hidden flex">
            <div className="w-64 bg-slate-900 h-full p-4 flex flex-col justify-between border-r border-slate-800">
              <div>
                <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-4">
                  <div className="flex items-center gap-2.5">
                    <Database className="w-5 h-5 text-sky-400" />
                    <span className="font-bold text-white text-base">Service Portal</span>
                  </div>
                  <button 
                    onClick={() => setMobileMenuOpen(false)}
                    className="p-1 hover:bg-slate-800 rounded-lg text-slate-400"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <nav className="space-y-1">
                  {navigationItems.map(item => {
                    const Icon = item.icon;
                    const isActive = activeTab === item.id;
                    return (
                      <button
                        key={item.id}
                        onClick={() => {
                          setActiveTab(item.id);
                          setMobileMenuOpen(false);
                        }}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                          isActive
                            ? "bg-sky-500/10 text-sky-400 font-semibold"
                            : "text-slate-400 hover:bg-slate-800"
                        }`}
                      >
                        <Icon className="w-5 h-5" />
                        {item.label}
                      </button>
                    );
                  })}
                </nav>
              </div>

              {/* Mobile Profile Roles switcher */}
              <div className="pt-4 border-t border-slate-800">
                <p className="text-[10px] font-bold text-slate-500 uppercase mb-2">Simular Rol</p>
                <div className="grid grid-cols-1 gap-1">
                  {state.users.map(u => (
                    <button
                      key={u.id}
                      onClick={() => {
                        onSelectUser(u.id);
                        setMobileMenuOpen(false);
                      }}
                      className={`flex items-center gap-2 p-2 rounded-xl text-xs text-left ${
                        state.activeUserId === u.id 
                          ? "bg-slate-800 border border-slate-700 font-semibold text-white" 
                          : "hover:bg-slate-800/50 text-slate-400"
                      }`}
                    >
                      <img src={u.avatar} alt={u.name} className="w-5 h-5 rounded-full object-cover" />
                      <div>
                        <p className="leading-none font-bold">{u.name}</p>
                        <p className="text-[9px]">{u.role}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex-1" onClick={() => setMobileMenuOpen(false)}></div>
          </div>
        )}

        {/* Main Content Area */}
        <main className="flex-grow p-4 md:p-8 animate-fade-in mb-16 md:mb-0">
          {children}
        </main>

        {/* Mobile Bottom Navigation Bar */}
        <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-slate-900/90 backdrop-blur border-t border-slate-800 h-16 flex items-center justify-around px-4 z-40 shadow-lg">
          {navigationItems.map(item => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex flex-col items-center gap-1 transition-all ${
                  isActive ? "text-sky-400 font-bold" : "text-slate-400"
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="text-[9px] uppercase tracking-wider font-semibold">{item.id.substring(0, 5)}</span>
              </button>
            );
          })}
        </nav>

        {/* Shared Footer info */}
        <footer className="hidden md:flex justify-between items-center py-5 px-8 border-t border-slate-800/80 text-xs text-slate-500 font-medium bg-slate-950/40">
          <div className="flex items-center gap-2">
            <span>© 2026 PrintTech Solutions Global</span>
            <span>•</span>
            <a href="https://p.isera.dev/" target="_blank" rel="noopener noreferrer" className="text-sky-400 hover:text-sky-300 font-mono">
              p.isera.dev
            </a>
          </div>
          <div className="flex items-center gap-3 font-mono text-[11px]">
            <span className="flex items-center gap-1.5 text-emerald-400">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
              Sistema Operativo
            </span>
            <span>|</span>
            <span className="text-slate-400">Build: 4.2.1-stable</span>
          </div>
        </footer>
      </div>
    </div>
  );
}
