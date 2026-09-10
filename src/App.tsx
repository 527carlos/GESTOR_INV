import React, { useEffect, useState } from "react";
import Layout from "./components/Layout";
import Dashboard from "./components/Dashboard";
import CaseManagement from "./components/CaseManagement";
import InstructionLibrary from "./components/InstructionLibrary";
import Training from "./components/Training";
import SettingsAndSheets from "./components/SettingsAndSheets";
import { DbState, Case, GoogleSheetsSettings, ValidationRules } from "./types";
import { Loader2 } from "lucide-react";

export default function App() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [state, setState] = useState<DbState | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSyncing, setIsSyncing] = useState(false);
  const [newCaseModalOpen, setNewCaseModalOpen] = useState(false);

  // Load database state from the server APIs
  const fetchState = async (showLoadingAnimation = false) => {
    if (showLoadingAnimation) setIsSyncing(true);
    try {
      const res = await fetch("/api/data");
      if (res.ok) {
        const data = await res.json();
        setState(data);
      }
    } catch (err) {
      console.error("Error fetching state from backend:", err);
    } finally {
      if (showLoadingAnimation) {
        setTimeout(() => setIsSyncing(false), 800);
      }
    }
  };

  // Initial load
  useEffect(() => {
    fetchState(true);
  }, []);

  // Polling for real-time synchronization every 3 seconds (3000ms)
  // Ensures that updates are propagated live across multi-user testing
  useEffect(() => {
    const interval = setInterval(() => {
      fetchState(false);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  // Sync now action triggered manually
  const handleSyncNow = async () => {
    await fetchState(true);
  };

  // Change logged in user / simulation role
  const handleSelectUser = async (userId: string) => {
    try {
      const res = await fetch("/api/user/select", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId })
      });
      if (res.ok) {
        await fetchState(false);
      }
    } catch (err) {
      console.error("Error selecting user:", err);
    }
  };

  // Save/Update Case
  const handleSaveCase = async (caseData: Partial<Case>): Promise<{ success: boolean; error?: string }> => {
    try {
      const res = await fetch("/api/cases", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(caseData)
      });
      const data = await res.json();
      if (res.ok) {
        await fetchState(false);
        return { success: true };
      } else {
        return { success: false, error: data.error };
      }
    } catch (err) {
      return { success: false, error: "Fallo de conexión con el servidor técnico." };
    }
  };

  // Delete Case (restricted to Admin Tech)
  const handleDeleteCase = async (id: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const res = await fetch("/api/cases/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id })
      });
      const data = await res.json();
      if (res.ok) {
        await fetchState(false);
        return { success: true };
      } else {
        alert(data.error || "No se pudo eliminar el caso.");
        return { success: false, error: data.error };
      }
    } catch (err) {
      return { success: false, error: "Error de red." };
    }
  };

  // Download manual views increments
  const handleDownloadManual = async (manualId: string) => {
    try {
      await fetch("/api/manuals/download", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ manualId })
      });
      fetchState(false);
    } catch (err) {
      console.error("Error in download metrics sync:", err);
    }
  };

  // Update course progress progression
  const handleUpdateCourseProgress = async (courseId: string, progress: number) => {
    try {
      await fetch("/api/courses/progress", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ courseId, progress })
      });
      fetchState(false);
    } catch (err) {
      console.error("Error updating course progress:", err);
    }
  };

  // Save Google Sheets spreadsheet ID & key settings
  const handleSaveGoogleSheetsSettings = async (settings: Partial<GoogleSheetsSettings>): Promise<boolean> => {
    try {
      const res = await fetch("/api/settings/google-sheets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings)
      });
      if (res.ok) {
        await fetchState(false);
        return true;
      }
    } catch (err) {
      console.error("Error saving Google Sheets configuration:", err);
    }
    return false;
  };

  // Save Capture Data validations rules
  const handleSaveValidationRules = async (rules: ValidationRules): Promise<boolean> => {
    try {
      const res = await fetch("/api/settings/validation-rules", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(rules)
      });
      if (res.ok) {
        await fetchState(false);
        return true;
      }
    } catch (err) {
      console.error("Error saving validation rules:", err);
    }
    return false;
  };

  // Pre-load layout skeleton if state hasn't fetched yet
  if (!state) {
    return (
      <div className="min-h-screen bg-brand-bg flex flex-col items-center justify-center gap-4 text-brand-primary">
        <Loader2 className="w-10 h-10 animate-spin text-brand-secondary" />
        <p className="font-bold text-sm tracking-wide uppercase">Cargando base de datos PrintTech...</p>
      </div>
    );
  }

  // Bridging: opening new case modal from dashboard
  const handleOpenNewCaseFromDashboard = () => {
    setActiveTab("cases");
    setNewCaseModalOpen(true);
  };

  return (
    <Layout
      activeTab={activeTab}
      setActiveTab={setActiveTab}
      state={state}
      onSelectUser={handleSelectUser}
      searchQuery={searchQuery}
      setSearchQuery={setSearchQuery}
      isSyncing={isSyncing}
      onSyncNow={handleSyncNow}
    >
      {activeTab === "dashboard" && (
        <Dashboard
          state={state}
          setActiveTab={setActiveTab}
          onOpenNewCaseModal={handleOpenNewCaseFromDashboard}
          onDownloadManual={handleDownloadManual}
        />
      )}
      {activeTab === "cases" && (
        <CaseManagement
          state={state}
          onSaveCase={handleSaveCase}
          onDeleteCase={handleDeleteCase}
          onSyncNow={handleSyncNow}
          isSyncing={isSyncing}
          newCaseModalOpen={newCaseModalOpen}
          setNewCaseModalOpen={setNewCaseModalOpen}
        />
      )}
      {activeTab === "library" && (
        <InstructionLibrary
          state={state}
          onDownloadManual={handleDownloadManual}
        />
      )}
      {activeTab === "training" && (
        <Training
          state={state}
          onUpdateCourseProgress={handleUpdateCourseProgress}
        />
      )}
      {activeTab === "settings" && (
        <SettingsAndSheets
          state={state}
          onSaveGoogleSheetsSettings={handleSaveGoogleSheetsSettings}
          onSaveValidationRules={handleSaveValidationRules}
          onSelectUser={handleSelectUser}
          isSyncing={isSyncing}
          onSyncNow={handleSyncNow}
        />
      )}
    </Layout>
  );
}
