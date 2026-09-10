import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";

const app = express();
const PORT = 3000;
const DB_FILE = path.join(process.cwd(), "db.json");

// Middleware to parse JSON bodies
app.use(express.json());

// Initial default database state
const defaultDb = {
  cases: [
    {
      id: "#77412-A",
      client: "Gráficas del Norte S.A.",
      model: "Plotter Z-Series X1",
      status: "Abierto",
      priority: "Crítica",
      updatedAt: new Date(Date.now() - 12 * 60000).toISOString(), // 12m ago
      reporter: "Técnico Nvl 3",
      description: "Fallo de cabezal térmico principal. El equipo se detiene a mitad de la impresión con código de error E-402.",
      historicalLogs: [
        { timestamp: new Date(Date.now() - 60 * 60000).toISOString(), user: "Técnico Nvl 3", action: "Creado", detail: "Caso abierto por falla catastrófica de cabezal" }
      ]
    },
    {
      id: "#77409-B",
      client: "Estudios Creativos CDMX",
      model: "LaserJet Pro M501",
      status: "En Proceso",
      priority: "Alta",
      updatedAt: new Date(Date.now() - 105 * 60000).toISOString(), // 1h 45m ago
      reporter: "Admin Tech",
      description: "Rodillos de alimentación atascados. Ruido persistente durante el arrastre de papel.",
      historicalLogs: [
        { timestamp: new Date(Date.now() - 120 * 60000).toISOString(), user: "Admin Tech", action: "Creado", detail: "Caso abierto" },
        { timestamp: new Date(Date.now() - 105 * 60000).toISOString(), user: "Técnico Nvl 3", action: "Modificado", detail: "Cambiado estado a En Proceso" }
      ]
    },
    {
      id: "#77382-C",
      client: "Packaging Global Ltd.",
      model: "Indico 12000 Press",
      status: "Esperando Pieza",
      priority: "Media",
      updatedAt: new Date(Date.now() - 24 * 60 * 60000).toISOString(), // 1 day ago
      reporter: "Técnico Nvl 3",
      description: "Fuga en el circuito hidráulico de distribución de tinta amarilla. Requiere manguera de alta presión de repuesto.",
      historicalLogs: [
        { timestamp: new Date(Date.now() - 28 * 60 * 60000).toISOString(), user: "Técnico Nvl 3", action: "Creado", detail: "Detectada fuga en manguera" },
        { timestamp: new Date(Date.now() - 24 * 60 * 60000).toISOString(), user: "Admin Tech", action: "Modificado", detail: "Cambiado estado a Esperando Pieza" }
      ]
    },
    {
      id: "#77355-D",
      client: "Imprenta Nacional S.L.",
      model: "Latex 365 Printer",
      status: "En Proceso",
      priority: "Media",
      updatedAt: new Date(Date.now() - 48 * 60 * 60000).toISOString(), // 2 days ago
      reporter: "Técnico Nvl 1",
      description: "Desalineación recurrente del alimentador de sustrato flexible. Ajuste mecánico en curso.",
      historicalLogs: [
        { timestamp: new Date(Date.now() - 48 * 60 * 60000).toISOString(), user: "Técnico Nvl 1", action: "Creado", detail: "Caso iniciado por desviación de sustrato" }
      ]
    },
    {
      id: "#77395-X",
      client: "Universal Print Solutions",
      model: "Latex 365 Printer",
      status: "Abierto",
      priority: "Crítica",
      updatedAt: new Date(Date.now() - 2 * 60 * 60000).toISOString(), // 2h ago
      reporter: "Técnico Nvl 3",
      description: "Cortocircuito en placa lógica V2. La impresora no enciende y se dispara la protección de la fuente.",
      historicalLogs: [
        { timestamp: new Date(Date.now() - 2 * 60 * 60000).toISOString(), user: "Técnico Nvl 3", action: "Creado", detail: "Reportado cortocircuito en placa principal" }
      ]
    }
  ],
  manuals: [
    {
      id: "MAN-001",
      title: "Manual de Servicio Pro-Series 500",
      description: "Inyección de Tinta Industrial - Revisión 2024.2",
      type: "Inyección de Tinta",
      difficulty: "HARD",
      date: "OCT 12, 2023",
      views: 1240,
      downloadUrl: "#",
      image: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=400&q=80"
    },
    {
      id: "MAN-002",
      title: "Guía de Configuración LaserJet X9",
      description: "Láser Monocromático - Protocolos de Red",
      type: "Láser",
      difficulty: "EASY",
      date: "NOV 05, 2023",
      views: 850,
      downloadUrl: "#",
      image: "https://images.unsplash.com/photo-1588508065123-287b28e013da?auto=format&fit=crop&w=400&q=80"
    },
    {
      id: "MAN-003",
      title: "Planos de Ensamblaje Wide-Format G3",
      description: "Gran Formato - Esquemas Hidráulicos",
      type: "Gran Formato",
      difficulty: "MEDIUM",
      date: "SEP 28, 2023",
      views: 420,
      downloadUrl: "#",
      image: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=400&q=80"
    },
    {
      id: "MAN-004",
      title: "Mantenimiento Preventivo Thermal-Z",
      description: "Térmicas - Limpieza de Cabezales",
      type: "Térmicas",
      difficulty: "MEDIUM",
      date: "OCT 30, 2023",
      views: 310,
      downloadUrl: "#",
      image: "https://images.unsplash.com/photo-1531403009284-440f080d1e12?auto=format&fit=crop&w=400&q=80"
    }
  ],
  courses: [
    {
      id: "CRS-001",
      title: "Fundamentos de Impresión 3D",
      description: "Fundamentos básicos y calibración física para boquillas FDM/SLA.",
      duration: "12h",
      modulesCount: 8,
      progress: 80,
      completed: false,
      image: "https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=400&q=80"
    },
    {
      id: "CRS-002",
      title: "Electrónica de Plóters",
      description: "Manejo de firmware, diagnóstico de drivers de motores de paso y conectividad serial.",
      duration: "18h",
      modulesCount: 12,
      progress: 0,
      completed: false,
      image: "https://images.unsplash.com/photo-1517055720413-77a2702f583a?auto=format&fit=crop&w=400&q=80"
    },
    {
      id: "CRS-003",
      title: "Mantenimiento Preventivo Nivel 1",
      description: "Lubricación de rieles, calibración de tensión de bandas e inspección de filtros.",
      duration: "6h",
      modulesCount: 4,
      progress: 0,
      completed: false,
      image: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=400&q=80"
    }
  ],
  users: [
    { id: "user-1", name: "Admin Tech", role: "Admin Tech", level: "Level 4 Technician", avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80" },
    { id: "user-2", name: "Técnico Nvl 3", role: "Técnico Nvl 3", level: "Level 3 Technician", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80" },
    { id: "user-3", name: "Técnico Nvl 1", role: "Técnico Nvl 1", level: "Level 1 Technician", avatar: "https://images.unsplash.com/photo-1628157582853-a796fa650a6a?auto=format&fit=crop&w=150&q=80" }
  ],
  activeUserId: "user-1",
  googleSheetsSettings: {
    spreadsheetId: "1_GoogleSheets_Spreadsheet_ID_PrintTech_Database",
    sheetName: "Casos_Soporte",
    range: "A2:G",
    apiKey: "",
    autoSyncEnabled: true,
    syncLogs: [
      { timestamp: new Date(Date.now() - 5000).toISOString(), level: "success", message: "Inicializado canal de sincronización en tiempo real." },
      { timestamp: new Date(Date.now() - 4000).toISOString(), level: "info", message: "Conectado al Spreadsheet ID simulado." }
    ],
    // Let's hold simulated spreadsheet cells so the user can literally see the sheet data changing
    simulatedSheet: [
      ["ID", "Cliente", "Modelo", "Estado", "Prioridad", "Reportado Por", "Última Actualización"],
      ["#77412-A", "Gráficas del Norte S.A.", "Plotter Z-Series X1", "Abierto", "Crítica", "Técnico Nvl 3", "Hace 12m"],
      ["#77409-B", "Estudios Creativos CDMX", "LaserJet Pro M501", "En Proceso", "Alta", "Admin Tech", "Hace 1h 45m"],
      ["#77382-C", "Packaging Global Ltd.", "Indico 12000 Press", "Esperando Pieza", "Media", "Técnico Nvl 3", "Ayer, 16:45"],
      ["#77355-D", "Imprenta Nacional S.L.", "Latex 365 Printer", "En Proceso", "Media", "Técnico Nvl 1", "22 May, 09:12"],
      ["#77395-X", "Universal Print Solutions", "Latex 365 Printer", "Abierto", "Crítica", "Técnico Nvl 3", "Hace 2h"]
    ]
  },
  validationRules: {
    caseIdRegex: "^#[0-9]{5}-[A-Z]$",
    minClientLength: 3,
    allowSpecialCharsInClient: false,
    requireModelSelection: true,
    requireDescription: true
  }
};

// Ensure database file exists
function loadDb() {
  try {
    if (!fs.existsSync(DB_FILE)) {
      fs.writeFileSync(DB_FILE, JSON.stringify(defaultDb, null, 2), "utf8");
      return defaultDb;
    }
    const raw = fs.readFileSync(DB_FILE, "utf8");
    return JSON.parse(raw);
  } catch (error) {
    console.error("Error reading database, using default structure:", error);
    return defaultDb;
  }
}

function saveDb(data: any) {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), "utf8");
  } catch (error) {
    console.error("Error writing database:", error);
  }
}

// Add logs helper
function addSyncLog(db: any, level: "success" | "info" | "warning" | "error", message: string) {
  db.googleSheetsSettings.syncLogs.unshift({
    timestamp: new Date().toISOString(),
    level,
    message
  });
  if (db.googleSheetsSettings.syncLogs.length > 50) {
    db.googleSheetsSettings.syncLogs.pop();
  }
}

// Update simulated Google Sheet grid matching cases list
function updateSimulatedSheetGrid(db: any) {
  const header = ["ID", "Cliente", "Modelo", "Estado", "Prioridad", "Reportado Por", "Última Actualización"];
  const rows = db.cases.map((c: any) => {
    let relativeTime = "Hace unos instantes";
    const diffMin = Math.round((Date.now() - new Date(c.updatedAt).getTime()) / 60000);
    if (diffMin < 60) {
      relativeTime = `Hace ${diffMin}m`;
    } else if (diffMin < 1440) {
      const hrs = Math.floor(diffMin / 60);
      const mins = diffMin % 60;
      relativeTime = `Hace ${hrs}h ${mins}m`;
    } else {
      const days = Math.floor(diffMin / 1440);
      relativeTime = `Hace ${days} d`;
    }
    return [c.id, c.client, c.model, c.status, c.priority, c.reporter, relativeTime];
  });
  db.googleSheetsSettings.simulatedSheet = [header, ...rows];
}

// REST API Endpoints
app.get("/api/data", (req, res) => {
  const db = loadDb();
  res.json(db);
});

// Update current active user (Login simulation)
app.post("/api/user/select", (req, res) => {
  const { userId } = req.body;
  const db = loadDb();
  const user = db.users.find((u: any) => u.id === userId);
  if (user) {
    db.activeUserId = userId;
    addSyncLog(db, "info", `Usuario de sesión cambiado a: ${user.name} (${user.role})`);
    saveDb(db);
    res.json({ success: true, activeUserId: userId });
  } else {
    res.status(404).json({ error: "Usuario no encontrado" });
  }
});

// Save or Update Case
app.post("/api/cases", (req, res) => {
  const { id, client, model, status, priority, description, reporter } = req.body;
  const db = loadDb();

  // Find active user for validation
  const activeUser = db.users.find((u: any) => u.id === db.activeUserId);
  if (!activeUser) {
    return res.status(401).json({ error: "Usuario de sesión no válido" });
  }

  // 1. DATA VALIDATION RULES
  const rules = db.validationRules;
  
  // Format check
  const idRegex = new RegExp(rules.caseIdRegex);
  if (!idRegex.test(id)) {
    return res.status(400).json({ 
      error: `Código de Caso inválido. Debe cumplir con el formato ${rules.caseIdRegex} (Ej: #77412-A)` 
    });
  }

  // Client length check
  if (!client || client.trim().length < rules.minClientLength) {
    return res.status(400).json({ 
      error: `El nombre del cliente debe tener al menos ${rules.minClientLength} caracteres.` 
    });
  }

  // Special characters check
  if (!rules.allowSpecialCharsInClient) {
    const specialChars = /[^a-zA-Z0-9\sÁÉÍÓÚáéíóúÑñ.,-]/;
    if (specialChars.test(client)) {
      return res.status(400).json({ 
        error: "El nombre del cliente no puede contener caracteres especiales no estándar." 
      });
    }
  }

  // Model check
  if (rules.requireModelSelection && (!model || model === "Seleccione un modelo")) {
    return res.status(400).json({ 
      error: "Debe seleccionar un modelo de impresora válido de la lista técnica." 
    });
  }

  // Description check
  if (rules.requireDescription && (!description || description.trim().length < 10)) {
    return res.status(400).json({ 
      error: "La descripción técnica es obligatoria y debe tener al menos 10 caracteres." 
    });
  }

  // 2. PERMISSION CHECKS (Restricted Access Levels)
  // Admin Tech can do anything.
  // Técnico Nvl 3 can create and modify.
  // Técnico Nvl 1 can create cases but cannot edit someone else's cases.
  let isNew = false;
  let existingIndex = db.cases.findIndex((c: any) => c.id === id);
  if (existingIndex === -1) {
    isNew = true;
  }

  if (!isNew) {
    // If updating, check permissions
    const existingCase = db.cases[existingIndex];
    if (activeUser.role === "Técnico Nvl 1" && existingCase.reporter !== activeUser.name) {
      return res.status(403).json({ 
        error: `Acceso Denegado: Como ${activeUser.role}, no tienes permisos para modificar casos asignados o creados por otros técnicos.` 
      });
    }
  }

  // 3. APPLY CHANGE
  const timestamp = new Date().toISOString();
  let statusChangedDetail = "";
  
  if (isNew) {
    const newCase = {
      id,
      client: client.trim(),
      model,
      status: status || "Abierto",
      priority: priority || "Media",
      updatedAt: timestamp,
      reporter: reporter || activeUser.name,
      description: description.trim(),
      historicalLogs: [
        { timestamp, user: activeUser.name, action: "Creado", detail: "Caso registrado con validación exitosa." }
      ]
    };
    db.cases.unshift(newCase);
    addSyncLog(db, "success", `Sincronizado caso NUEVO [${id}] con Google Sheets fila: ${db.cases.length + 1}`);
  } else {
    const oldCase = db.cases[existingIndex];
    if (oldCase.status !== status) {
      statusChangedDetail = `Estado cambiado de ${oldCase.status} a ${status}`;
    }
    
    db.cases[existingIndex] = {
      ...oldCase,
      client: client.trim(),
      model,
      status,
      priority,
      updatedAt: timestamp,
      description: description.trim(),
      historicalLogs: [
        ...oldCase.historicalLogs,
        { 
          timestamp, 
          user: activeUser.name, 
          action: "Modificado", 
          detail: statusChangedDetail || "Actualización general de datos técnicos." 
        }
      ]
    };
    addSyncLog(db, "success", `Sincronización en tiempo real: Actualizado caso [${id}] en Google Sheet.`);
  }

  // Auto update simulated spreadsheet grid
  updateSimulatedSheetGrid(db);
  saveDb(db);
  res.json({ success: true, cases: db.cases });
});

// Delete Case
app.post("/api/cases/delete", (req, res) => {
  const { id } = req.body;
  const db = loadDb();

  // Find active user
  const activeUser = db.users.find((u: any) => u.id === db.activeUserId);
  if (!activeUser || activeUser.role !== "Admin Tech") {
    return res.status(403).json({ 
      error: "Acceso Denegado: Solo el Administrador de Soporte (Admin Tech) tiene permisos para eliminar registros técnicos de forma permanente." 
    });
  }

  const existingIndex = db.cases.findIndex((c: any) => c.id === id);
  if (existingIndex !== -1) {
    db.cases.splice(existingIndex, 1);
    addSyncLog(db, "warning", `REGISTRO ELIMINADO [${id}] por el administrador. Celda removida en Google Sheets.`);
    updateSimulatedSheetGrid(db);
    saveDb(db);
    res.json({ success: true, cases: db.cases });
  } else {
    res.status(404).json({ error: "Caso no encontrado" });
  }
});

// Update Google Sheets Credentials or simulation settings
app.post("/api/settings/google-sheets", (req, res) => {
  const { spreadsheetId, sheetName, range, apiKey, autoSyncEnabled } = req.body;
  const db = loadDb();

  // Authorization check
  const activeUser = db.users.find((u: any) => u.id === db.activeUserId);
  if (!activeUser || activeUser.role !== "Admin Tech") {
    return res.status(403).json({ error: "Acceso Denegado: Solo administradores pueden modificar la configuración de Google Sheets." });
  }

  db.googleSheetsSettings = {
    ...db.googleSheetsSettings,
    spreadsheetId: spreadsheetId || db.googleSheetsSettings.spreadsheetId,
    sheetName: sheetName || db.googleSheetsSettings.sheetName,
    range: range || db.googleSheetsSettings.range,
    apiKey: apiKey !== undefined ? apiKey : db.googleSheetsSettings.apiKey,
    autoSyncEnabled: autoSyncEnabled !== undefined ? autoSyncEnabled : db.googleSheetsSettings.autoSyncEnabled
  };

  addSyncLog(db, "info", `Configuración de Google Sheets actualizada. Spreadsheet ID: ...${db.googleSheetsSettings.spreadsheetId.slice(-6)}`);
  saveDb(db);
  res.json({ success: true, googleSheetsSettings: db.googleSheetsSettings });
});

// Update validation rules
app.post("/api/settings/validation-rules", (req, res) => {
  const { caseIdRegex, minClientLength, allowSpecialCharsInClient, requireModelSelection, requireDescription } = req.body;
  const db = loadDb();

  const activeUser = db.users.find((u: any) => u.id === db.activeUserId);
  if (!activeUser || activeUser.role !== "Admin Tech") {
    return res.status(403).json({ error: "Acceso Denegado: Se requiere rol Admin Tech para modificar las reglas de validación." });
  }

  db.validationRules = {
    caseIdRegex: caseIdRegex || db.validationRules.caseIdRegex,
    minClientLength: minClientLength !== undefined ? Number(minClientLength) : db.validationRules.minClientLength,
    allowSpecialCharsInClient: allowSpecialCharsInClient !== undefined ? allowSpecialCharsInClient : db.validationRules.allowSpecialCharsInClient,
    requireModelSelection: requireModelSelection !== undefined ? requireModelSelection : db.validationRules.requireModelSelection,
    requireDescription: requireDescription !== undefined ? requireDescription : db.validationRules.requireDescription
  };

  addSyncLog(db, "warning", "Reglas de validación de datos del formulario modificadas.");
  saveDb(db);
  res.json({ success: true, validationRules: db.validationRules });
});

// Download Manual - simulation views
app.post("/api/manuals/download", (req, res) => {
  const { manualId } = req.body;
  const db = loadDb();
  const manual = db.manuals.find((m: any) => m.id === manualId);
  if (manual) {
    manual.views += 1;
    saveDb(db);
    res.json({ success: true, manual });
  } else {
    res.status(404).json({ error: "Manual no encontrado" });
  }
});

// Course Progression
app.post("/api/courses/progress", (req, res) => {
  const { courseId, progress } = req.body;
  const db = loadDb();
  const course = db.courses.find((c: any) => c.id === courseId);
  if (course) {
    course.progress = Math.min(100, Math.max(0, Number(progress)));
    if (course.progress === 100) {
      course.completed = true;
    }
    saveDb(db);
    res.json({ success: true, course });
  } else {
    res.status(404).json({ error: "Curso no encontrado" });
  }
});

// Vite Middleware integrated below
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer();
