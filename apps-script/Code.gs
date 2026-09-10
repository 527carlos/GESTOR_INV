/**
 * ISERA Portal - PrintTech Systems
 * Portado a Google Apps Script. Usa la hoja de cálculo indicada como base de
 * datos central (reemplaza el db.json / Express del proyecto original).
 */

// ID de la hoja de cálculo principal (base de datos del sistema).
var SPREADSHEET_ID = '1nDzrYnIQ-OoTwWpLwWBYrQGWA0WwTEs7u3wYm__S8FE';

var SHEET_NAMES = {
  CASOS: 'Casos',
  HISTORIAL: 'HistorialCasos',
  MANUALES: 'Manuales',
  CURSOS: 'Cursos',
  USUARIOS: 'Usuarios',
  CONFIG: 'Config',
  REGLAS: 'ReglasValidacion',
  LOGS_SYNC: 'LogsSync'
};

var CASOS_HEADERS = ['id', 'client', 'model', 'status', 'priority', 'updatedAt', 'reporter', 'description'];
var HISTORIAL_HEADERS = ['caseId', 'timestamp', 'user', 'action', 'detail'];
var MANUALES_HEADERS = ['id', 'title', 'description', 'type', 'difficulty', 'date', 'views', 'downloadUrl', 'image'];
var CURSOS_HEADERS = ['id', 'title', 'description', 'duration', 'modulesCount', 'progress', 'completed', 'image'];
var USUARIOS_HEADERS = ['id', 'name', 'role', 'level', 'avatar'];
var CONFIG_HEADERS = ['key', 'value'];
var REGLAS_HEADERS = ['key', 'value'];
var LOGS_SYNC_HEADERS = ['timestamp', 'level', 'message'];

// ---------------------------------------------------------------------------
// Web app entry point
// ---------------------------------------------------------------------------

function doGet(e) {
  ensureSetup_();
  return HtmlService.createTemplateFromFile('Index')
    .evaluate()
    .setTitle('ISERA Portal - PrintTech Systems')
    .addMetaTag('viewport', 'width=device-width, initial-scale=1')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

function include(filename) {
  return HtmlService.createHtmlOutputFromFile(filename).getContent();
}

// ---------------------------------------------------------------------------
// Spreadsheet / sheet helpers
// ---------------------------------------------------------------------------

function getSS_() {
  return SpreadsheetApp.openById(SPREADSHEET_ID);
}

function getOrCreateSheet_(ss, name, headers) {
  var sheet = ss.getSheetByName(name);
  if (!sheet) {
    sheet = ss.insertSheet(name);
    sheet.appendRow(headers);
    sheet.setFrozenRows(1);
    sheet.getRange(1, 1, 1, headers.length).setFontWeight('bold');
    // Formato de texto plano para las filas de datos: evita que Sheets
    // reinterprete automáticamente valores como fechas o números
    // (p.ej. "OCT 12, 2023" o IDs con formato especial).
    sheet.getRange(2, 1, Math.max(sheet.getMaxRows() - 1, 1), headers.length).setNumberFormat('@');
  }
  return sheet;
}

function isSheetEmpty_(sheet) {
  return sheet.getLastRow() < 2;
}

function readTable_(sheet, headers) {
  var lastRow = sheet.getLastRow();
  if (lastRow < 2) return [];
  var values = sheet.getRange(2, 1, lastRow - 1, headers.length).getValues();
  var out = [];
  for (var i = 0; i < values.length; i++) {
    var row = values[i];
    var isEmpty = row.every(function (c) { return c === '' || c === null || c === undefined; });
    if (isEmpty) continue;
    var obj = {};
    for (var j = 0; j < headers.length; j++) {
      obj[headers[j]] = row[j];
    }
    out.push(obj);
  }
  return out;
}

function writeTable_(sheet, headers, objects) {
  var lastRow = sheet.getLastRow();
  if (lastRow > 1) {
    sheet.getRange(2, 1, lastRow - 1, headers.length).clearContent();
  }
  if (objects.length === 0) return;
  var rows = objects.map(function (obj) {
    return headers.map(function (h) {
      var v = obj[h];
      return v === undefined || v === null ? '' : v;
    });
  });
  sheet.getRange(2, 1, rows.length, headers.length).setValues(rows);
}

function readKeyValue_(sheet) {
  var lastRow = sheet.getLastRow();
  var obj = {};
  if (lastRow < 2) return obj;
  var values = sheet.getRange(2, 1, lastRow - 1, 2).getValues();
  values.forEach(function (row) {
    if (row[0] === '' || row[0] === null) return;
    obj[row[0]] = row[1];
  });
  return obj;
}

function writeKeyValue_(sheet, obj) {
  var keys = Object.keys(obj);
  var rows = keys.map(function (k) { return [k, obj[k]]; });
  var lastRow = sheet.getLastRow();
  if (lastRow > 1) {
    sheet.getRange(2, 1, lastRow - 1, 2).clearContent();
  }
  if (rows.length > 0) {
    sheet.getRange(2, 1, rows.length, 2).setValues(rows);
  }
}

// ---------------------------------------------------------------------------
// Setup / seed
// ---------------------------------------------------------------------------

function ensureSetup_() {
  var ss = getSS_();
  var casos = getOrCreateSheet_(ss, SHEET_NAMES.CASOS, CASOS_HEADERS);
  var historial = getOrCreateSheet_(ss, SHEET_NAMES.HISTORIAL, HISTORIAL_HEADERS);
  var manuales = getOrCreateSheet_(ss, SHEET_NAMES.MANUALES, MANUALES_HEADERS);
  var cursos = getOrCreateSheet_(ss, SHEET_NAMES.CURSOS, CURSOS_HEADERS);
  var usuarios = getOrCreateSheet_(ss, SHEET_NAMES.USUARIOS, USUARIOS_HEADERS);
  var config = getOrCreateSheet_(ss, SHEET_NAMES.CONFIG, CONFIG_HEADERS);
  var reglas = getOrCreateSheet_(ss, SHEET_NAMES.REGLAS, REGLAS_HEADERS);
  var logsSync = getOrCreateSheet_(ss, SHEET_NAMES.LOGS_SYNC, LOGS_SYNC_HEADERS);

  var now = Date.now();

  // Cada tabla se siembra de forma independiente e idempotente: si una
  // ejecución previa falló a la mitad (timeout, error transitorio de
  // Sheets, etc.) las tablas que ya tenían datos no bloquean el sembrado
  // de las que quedaron vacías.

  if (isSheetEmpty_(usuarios)) {
    writeTable_(usuarios, USUARIOS_HEADERS, [
      { id: 'user-1', name: 'Admin Tech', role: 'Admin Tech', level: 'Level 4 Technician', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80' },
      { id: 'user-2', name: 'Técnico Nvl 3', role: 'Técnico Nvl 3', level: 'Level 3 Technician', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80' },
      { id: 'user-3', name: 'Técnico Nvl 1', role: 'Técnico Nvl 1', level: 'Level 1 Technician', avatar: 'https://images.unsplash.com/photo-1628157582853-a796fa650a6a?auto=format&fit=crop&w=150&q=80' }
    ]);
  }

  if (isSheetEmpty_(config)) {
    writeKeyValue_(config, {
      activeUserId: 'user-1',
      spreadsheetId: SPREADSHEET_ID,
      sheetName: SHEET_NAMES.CASOS,
      range: 'A2:H',
      apiKey: '',
      autoSyncEnabled: true
    });
  }

  if (isSheetEmpty_(reglas)) {
    writeKeyValue_(reglas, {
      caseIdRegex: '^#[0-9]{5}-[A-Z]$',
      minClientLength: 3,
      allowSpecialCharsInClient: false,
      requireModelSelection: true,
      requireDescription: true
    });
  }

  if (isSheetEmpty_(manuales)) {
    writeTable_(manuales, MANUALES_HEADERS, [
      { id: 'MAN-001', title: 'Manual de Servicio Pro-Series 500', description: 'Inyección de Tinta Industrial - Revisión 2024.2', type: 'Inyección de Tinta', difficulty: 'HARD', date: 'OCT 12, 2023', views: 1240, downloadUrl: '#', image: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=400&q=80' },
      { id: 'MAN-002', title: 'Guía de Configuración LaserJet X9', description: 'Láser Monocromático - Protocolos de Red', type: 'Láser', difficulty: 'EASY', date: 'NOV 05, 2023', views: 850, downloadUrl: '#', image: 'https://images.unsplash.com/photo-1588508065123-287b28e013da?auto=format&fit=crop&w=400&q=80' },
      { id: 'MAN-003', title: 'Planos de Ensamblaje Wide-Format G3', description: 'Gran Formato - Esquemas Hidráulicos', type: 'Gran Formato', difficulty: 'MEDIUM', date: 'SEP 28, 2023', views: 420, downloadUrl: '#', image: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=400&q=80' },
      { id: 'MAN-004', title: 'Mantenimiento Preventivo Thermal-Z', description: 'Térmicas - Limpieza de Cabezales', type: 'Térmicas', difficulty: 'MEDIUM', date: 'OCT 30, 2023', views: 310, downloadUrl: '#', image: 'https://images.unsplash.com/photo-1531403009284-440f080d1e12?auto=format&fit=crop&w=400&q=80' }
    ]);
  }

  if (isSheetEmpty_(cursos)) {
    writeTable_(cursos, CURSOS_HEADERS, [
      { id: 'CRS-001', title: 'Fundamentos de Impresión 3D', description: 'Fundamentos básicos y calibración física para boquillas FDM/SLA.', duration: '12h', modulesCount: 8, progress: 80, completed: false, image: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=400&q=80' },
      { id: 'CRS-002', title: 'Electrónica de Plóters', description: 'Manejo de firmware, diagnóstico de drivers de motores de paso y conectividad serial.', duration: '18h', modulesCount: 12, progress: 0, completed: false, image: 'https://images.unsplash.com/photo-1517055720413-77a2702f583a?auto=format&fit=crop&w=400&q=80' },
      { id: 'CRS-003', title: 'Mantenimiento Preventivo Nivel 1', description: 'Lubricación de rieles, calibración de tensión de bandas e inspección de filtros.', duration: '6h', modulesCount: 4, progress: 0, completed: false, image: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=400&q=80' }
    ]);
  }

  if (isSheetEmpty_(logsSync)) {
    writeTable_(logsSync, LOGS_SYNC_HEADERS, [
      { timestamp: now - 5000, level: 'success', message: 'Inicializado canal de sincronización con Google Sheets.' },
      { timestamp: now - 4000, level: 'info', message: 'Base de datos conectada al Spreadsheet ID: ' + SPREADSHEET_ID }
    ]);
  }

  if (!isSheetEmpty_(casos)) return;

  var seedCases = [
    {
      id: '#77412-A', client: 'Gráficas del Norte S.A.', model: 'Plotter Z-Series X1',
      status: 'Abierto', priority: 'Crítica', updatedAt: now - 12 * 60000, reporter: 'Técnico Nvl 3',
      description: 'Fallo de cabezal térmico principal. El equipo se detiene a mitad de la impresión con código de error E-402.'
    },
    {
      id: '#77409-B', client: 'Estudios Creativos CDMX', model: 'LaserJet Pro M501',
      status: 'En Proceso', priority: 'Alta', updatedAt: now - 105 * 60000, reporter: 'Admin Tech',
      description: 'Rodillos de alimentación atascados. Ruido persistente durante el arrastre de papel.'
    },
    {
      id: '#77382-C', client: 'Packaging Global Ltd.', model: 'Indico 12000 Press',
      status: 'Esperando Pieza', priority: 'Media', updatedAt: now - 24 * 60 * 60000, reporter: 'Técnico Nvl 3',
      description: 'Fuga en el circuito hidráulico de distribución de tinta amarilla. Requiere manguera de alta presión de repuesto.'
    },
    {
      id: '#77355-D', client: 'Imprenta Nacional S.L.', model: 'Latex 365 Printer',
      status: 'En Proceso', priority: 'Media', updatedAt: now - 48 * 60 * 60000, reporter: 'Técnico Nvl 1',
      description: 'Desalineación recurrente del alimentador de sustrato flexible. Ajuste mecánico en curso.'
    },
    {
      id: '#77395-X', client: 'Universal Print Solutions', model: 'Latex 365 Printer',
      status: 'Abierto', priority: 'Crítica', updatedAt: now - 2 * 60 * 60000, reporter: 'Técnico Nvl 3',
      description: 'Cortocircuito en placa lógica V2. La impresora no enciende y se dispara la protección de la fuente.'
    }
  ];
  writeTable_(casos, CASOS_HEADERS, seedCases);

  var seedHistory = [
    { caseId: '#77412-A', timestamp: now - 60 * 60000, user: 'Técnico Nvl 3', action: 'Creado', detail: 'Caso abierto por falla catastrófica de cabezal' },
    { caseId: '#77409-B', timestamp: now - 120 * 60000, user: 'Admin Tech', action: 'Creado', detail: 'Caso abierto' },
    { caseId: '#77409-B', timestamp: now - 105 * 60000, user: 'Técnico Nvl 3', action: 'Modificado', detail: 'Cambiado estado a En Proceso' },
    { caseId: '#77382-C', timestamp: now - 28 * 60 * 60000, user: 'Técnico Nvl 3', action: 'Creado', detail: 'Detectada fuga en manguera' },
    { caseId: '#77382-C', timestamp: now - 24 * 60 * 60000, user: 'Admin Tech', action: 'Modificado', detail: 'Cambiado estado a Esperando Pieza' },
    { caseId: '#77355-D', timestamp: now - 48 * 60 * 60000, user: 'Técnico Nvl 1', action: 'Creado', detail: 'Caso iniciado por desviación de sustrato' },
    { caseId: '#77395-X', timestamp: now - 2 * 60 * 60000, user: 'Técnico Nvl 3', action: 'Creado', detail: 'Reportado cortocircuito en placa principal' }
  ];
  writeTable_(historial, HISTORIAL_HEADERS, seedHistory);
}

/** Ejecutar manualmente una vez desde el editor de Apps Script para inicializar la hoja. */
function initializeSpreadsheet() {
  ensureSetup_();
}

// ---------------------------------------------------------------------------
// Readers / writers per entity
// ---------------------------------------------------------------------------

function readUsers_(ss) {
  return readTable_(getOrCreateSheet_(ss, SHEET_NAMES.USUARIOS, USUARIOS_HEADERS), USUARIOS_HEADERS);
}

function readConfig_(ss) {
  var raw = readKeyValue_(getOrCreateSheet_(ss, SHEET_NAMES.CONFIG, CONFIG_HEADERS));
  return {
    activeUserId: raw.activeUserId || '',
    spreadsheetId: raw.spreadsheetId || SPREADSHEET_ID,
    sheetName: raw.sheetName || SHEET_NAMES.CASOS,
    range: raw.range || 'A2:H',
    apiKey: raw.apiKey || '',
    autoSyncEnabled: raw.autoSyncEnabled === true || raw.autoSyncEnabled === 'true'
  };
}

function writeConfig_(ss, config) {
  writeKeyValue_(getOrCreateSheet_(ss, SHEET_NAMES.CONFIG, CONFIG_HEADERS), config);
}

function readRules_(ss) {
  var raw = readKeyValue_(getOrCreateSheet_(ss, SHEET_NAMES.REGLAS, REGLAS_HEADERS));
  return {
    caseIdRegex: raw.caseIdRegex || '^#[0-9]{5}-[A-Z]$',
    minClientLength: Number(raw.minClientLength || 3),
    allowSpecialCharsInClient: raw.allowSpecialCharsInClient === true || raw.allowSpecialCharsInClient === 'true',
    requireModelSelection: raw.requireModelSelection === true || raw.requireModelSelection === 'true' || raw.requireModelSelection === undefined,
    requireDescription: raw.requireDescription === true || raw.requireDescription === 'true' || raw.requireDescription === undefined
  };
}

function writeRules_(ss, rules) {
  writeKeyValue_(getOrCreateSheet_(ss, SHEET_NAMES.REGLAS, REGLAS_HEADERS), rules);
}

function readCasesRaw_(ss) {
  var rows = readTable_(getOrCreateSheet_(ss, SHEET_NAMES.CASOS, CASOS_HEADERS), CASOS_HEADERS);
  rows.forEach(function (c) { c.updatedAt = Number(c.updatedAt); });
  rows.sort(function (a, b) { return b.updatedAt - a.updatedAt; });
  return rows;
}

function writeCasesRaw_(ss, cases) {
  writeTable_(getOrCreateSheet_(ss, SHEET_NAMES.CASOS, CASOS_HEADERS), CASOS_HEADERS, cases);
}

function readHistory_(ss) {
  var rows = readTable_(getOrCreateSheet_(ss, SHEET_NAMES.HISTORIAL, HISTORIAL_HEADERS), HISTORIAL_HEADERS);
  rows.forEach(function (r) { r.timestamp = Number(r.timestamp); });
  rows.sort(function (a, b) { return a.timestamp - b.timestamp; });
  return rows;
}

function appendHistory_(ss, entry) {
  getOrCreateSheet_(ss, SHEET_NAMES.HISTORIAL, HISTORIAL_HEADERS).appendRow(HISTORIAL_HEADERS.map(function (h) { return entry[h]; }));
}

function removeHistoryForCase_(ss, caseId) {
  var sheet = getOrCreateSheet_(ss, SHEET_NAMES.HISTORIAL, HISTORIAL_HEADERS);
  var rows = readHistory_(ss).filter(function (r) { return r.caseId !== caseId; });
  writeTable_(sheet, HISTORIAL_HEADERS, rows);
}

function readManualsRaw_(ss) {
  var rows = readTable_(getOrCreateSheet_(ss, SHEET_NAMES.MANUALES, MANUALES_HEADERS), MANUALES_HEADERS);
  rows.forEach(function (m) {
    m.views = Number(m.views || 0);
    // Si Sheets llegó a interpretar la columna "date" como fecha real
    // (p.ej. celdas creadas antes del formato de texto plano), la
    // devolvemos como texto legible en vez de un objeto Date crudo.
    if (Object.prototype.toString.call(m.date) === '[object Date]') {
      m.date = Utilities.formatDate(m.date, Session.getScriptTimeZone(), 'MMM dd, yyyy').toUpperCase();
    } else if (m.date !== undefined && m.date !== null) {
      m.date = String(m.date);
    }
  });
  return rows;
}

function writeManualsRaw_(ss, manuals) {
  writeTable_(getOrCreateSheet_(ss, SHEET_NAMES.MANUALES, MANUALES_HEADERS), MANUALES_HEADERS, manuals);
}

function readCoursesRaw_(ss) {
  var rows = readTable_(getOrCreateSheet_(ss, SHEET_NAMES.CURSOS, CURSOS_HEADERS), CURSOS_HEADERS);
  rows.forEach(function (c) {
    c.progress = Number(c.progress || 0);
    c.modulesCount = Number(c.modulesCount || 0);
    c.completed = c.completed === true || c.completed === 'true';
  });
  return rows;
}

function writeCoursesRaw_(ss, courses) {
  writeTable_(getOrCreateSheet_(ss, SHEET_NAMES.CURSOS, CURSOS_HEADERS), CURSOS_HEADERS, courses);
}

function readSyncLogs_(ss) {
  var rows = readTable_(getOrCreateSheet_(ss, SHEET_NAMES.LOGS_SYNC, LOGS_SYNC_HEADERS), LOGS_SYNC_HEADERS);
  rows.forEach(function (r) { r.timestamp = Number(r.timestamp); });
  rows.sort(function (a, b) { return b.timestamp - a.timestamp; });
  return rows.slice(0, 50);
}

function addSyncLog_(ss, level, message) {
  var sheet = getOrCreateSheet_(ss, SHEET_NAMES.LOGS_SYNC, LOGS_SYNC_HEADERS);
  sheet.appendRow([Date.now(), level, message]);
  var lastRow = sheet.getLastRow();
  var totalDataRows = lastRow - 1;
  var MAX_LOGS = 80;
  if (totalDataRows > MAX_LOGS) {
    sheet.deleteRows(2, totalDataRows - MAX_LOGS);
  }
}

// ---------------------------------------------------------------------------
// Derived data
// ---------------------------------------------------------------------------

function attachHistoryToCases_(cases, history) {
  var byCase = {};
  history.forEach(function (h) {
    if (!byCase[h.caseId]) byCase[h.caseId] = [];
    byCase[h.caseId].push({ timestamp: new Date(h.timestamp).toISOString(), user: h.user, action: h.action, detail: h.detail });
  });
  return cases.map(function (c) {
    var copy = {};
    CASOS_HEADERS.forEach(function (h) { copy[h] = c[h]; });
    copy.updatedAt = new Date(c.updatedAt).toISOString();
    copy.historicalLogs = byCase[c.id] || [];
    return copy;
  });
}

function relativeTime_(ms) {
  var diffMin = Math.round((Date.now() - ms) / 60000);
  if (diffMin < 1) return 'Hace unos instantes';
  if (diffMin < 60) return 'Hace ' + diffMin + 'm';
  if (diffMin < 1440) {
    var hrs = Math.floor(diffMin / 60);
    var mins = diffMin % 60;
    return 'Hace ' + hrs + 'h ' + mins + 'm';
  }
  var days = Math.floor(diffMin / 1440);
  return 'Hace ' + days + ' d';
}

function buildSheetPreview_(rawCases) {
  var header = ['ID', 'Cliente', 'Modelo', 'Estado', 'Prioridad', 'Reportado Por', 'Última Actualización'];
  var rows = rawCases.map(function (c) {
    return [c.id, c.client, c.model, c.status, c.priority, c.reporter, relativeTime_(c.updatedAt)];
  });
  return [header].concat(rows);
}

// ---------------------------------------------------------------------------
// Public API (llamadas desde el cliente con google.script.run)
// ---------------------------------------------------------------------------

function getInitialData() {
  ensureSetup_();
  var ss = getSS_();
  var rawCases = readCasesRaw_(ss);
  var history = readHistory_(ss);
  var cases = attachHistoryToCases_(rawCases, history);
  var manuals = readManualsRaw_(ss);
  var courses = readCoursesRaw_(ss);
  var users = readUsers_(ss);
  var config = readConfig_(ss);
  var rules = readRules_(ss);
  var syncLogs = readSyncLogs_(ss).map(function (l) {
    return { timestamp: new Date(l.timestamp).toISOString(), level: l.level, message: l.message };
  });

  return {
    cases: cases,
    manuals: manuals,
    courses: courses,
    users: users,
    activeUserId: config.activeUserId,
    googleSheetsSettings: {
      spreadsheetId: config.spreadsheetId,
      sheetName: config.sheetName,
      range: config.range,
      apiKey: config.apiKey,
      autoSyncEnabled: config.autoSyncEnabled,
      syncLogs: syncLogs,
      simulatedSheet: buildSheetPreview_(rawCases)
    },
    validationRules: rules
  };
}

function selectUser(userId) {
  var ss = getSS_();
  var users = readUsers_(ss);
  var user = users.filter(function (u) { return u.id === userId; })[0];
  if (!user) return { success: false, error: 'Usuario no encontrado' };
  var config = readConfig_(ss);
  config.activeUserId = userId;
  writeConfig_(ss, config);
  addSyncLog_(ss, 'info', 'Usuario de sesión cambiado a: ' + user.name + ' (' + user.role + ')');
  return { success: true, activeUserId: userId };
}

function saveCase(caseData) {
  var lock = LockService.getScriptLock();
  lock.waitLock(30000);
  try {
    var ss = getSS_();
    var config = readConfig_(ss);
    var users = readUsers_(ss);
    var activeUser = users.filter(function (u) { return u.id === config.activeUserId; })[0];
    if (!activeUser) return { success: false, error: 'Usuario de sesión no válido' };

    var rules = readRules_(ss);
    var id = String(caseData.id || '').trim();
    var client = String(caseData.client || '').trim();
    var model = caseData.model;
    var status = caseData.status;
    var priority = caseData.priority;
    var description = String(caseData.description || '').trim();

    var idRegex;
    try {
      idRegex = new RegExp(rules.caseIdRegex);
    } catch (e) {
      idRegex = /^#[0-9]{5}-[A-Z]$/;
    }
    if (!idRegex.test(id)) {
      return { success: false, error: 'Código de Caso inválido. Debe cumplir con el formato ' + rules.caseIdRegex + ' (Ej: #77412-A)' };
    }
    if (!client || client.length < rules.minClientLength) {
      return { success: false, error: 'El nombre del cliente debe tener al menos ' + rules.minClientLength + ' caracteres.' };
    }
    if (!rules.allowSpecialCharsInClient) {
      var specialChars = /[^a-zA-Z0-9\sÁÉÍÓÚáéíóúÑñ.,-]/;
      if (specialChars.test(client)) {
        return { success: false, error: 'El nombre del cliente no puede contener caracteres especiales no estándar.' };
      }
    }
    if (rules.requireModelSelection && (!model || model === 'Seleccione un modelo')) {
      return { success: false, error: 'Debe seleccionar un modelo de impresora válido de la lista técnica.' };
    }
    if (rules.requireDescription && (!description || description.length < 10)) {
      return { success: false, error: 'La descripción técnica es obligatoria y debe tener al menos 10 caracteres.' };
    }

    var cases = readCasesRaw_(ss);
    var idx = -1;
    for (var i = 0; i < cases.length; i++) {
      if (cases[i].id === id) { idx = i; break; }
    }
    var isNew = idx === -1;

    if (!isNew) {
      var existing = cases[idx];
      if (activeUser.role === 'Técnico Nvl 1' && existing.reporter !== activeUser.name) {
        return {
          success: false,
          error: 'Acceso Denegado: Como ' + activeUser.role + ', no tienes permisos para modificar casos asignados o creados por otros técnicos.'
        };
      }
    }

    var timestamp = Date.now();
    if (isNew) {
      var newCase = {
        id: id, client: client, model: model, status: status || 'Abierto', priority: priority || 'Media',
        updatedAt: timestamp, reporter: caseData.reporter || activeUser.name, description: description
      };
      cases.unshift(newCase);
      appendHistory_(ss, { caseId: id, timestamp: timestamp, user: activeUser.name, action: 'Creado', detail: 'Caso registrado con validación exitosa.' });
      addSyncLog_(ss, 'success', 'Sincronizado caso NUEVO [' + id + '] con Google Sheets.');
    } else {
      var old = cases[idx];
      var detail = 'Actualización general de datos técnicos.';
      if (old.status !== status) detail = 'Estado cambiado de ' + old.status + ' a ' + status;
      cases[idx] = {
        id: old.id, client: client, model: model, status: status, priority: priority,
        updatedAt: timestamp, reporter: old.reporter, description: description
      };
      appendHistory_(ss, { caseId: id, timestamp: timestamp, user: activeUser.name, action: 'Modificado', detail: detail });
      addSyncLog_(ss, 'success', 'Sincronización en tiempo real: Actualizado caso [' + id + '] en Google Sheet.');
    }

    writeCasesRaw_(ss, cases);
    return { success: true };
  } finally {
    lock.releaseLock();
  }
}

function deleteCase(id) {
  var lock = LockService.getScriptLock();
  lock.waitLock(30000);
  try {
    var ss = getSS_();
    var config = readConfig_(ss);
    var users = readUsers_(ss);
    var activeUser = users.filter(function (u) { return u.id === config.activeUserId; })[0];
    if (!activeUser || activeUser.role !== 'Admin Tech') {
      return { success: false, error: 'Acceso Denegado: Solo el Administrador de Soporte (Admin Tech) tiene permisos para eliminar registros técnicos de forma permanente.' };
    }
    var cases = readCasesRaw_(ss);
    var idx = -1;
    for (var i = 0; i < cases.length; i++) {
      if (cases[i].id === id) { idx = i; break; }
    }
    if (idx === -1) return { success: false, error: 'Caso no encontrado' };
    cases.splice(idx, 1);
    writeCasesRaw_(ss, cases);
    removeHistoryForCase_(ss, id);
    addSyncLog_(ss, 'warning', 'REGISTRO ELIMINADO [' + id + '] por el administrador. Fila removida en Google Sheets.');
    return { success: true };
  } finally {
    lock.releaseLock();
  }
}

function saveGoogleSheetsSettings(settings) {
  var lock = LockService.getScriptLock();
  lock.waitLock(30000);
  try {
    var ss = getSS_();
    var config = readConfig_(ss);
    var users = readUsers_(ss);
    var activeUser = users.filter(function (u) { return u.id === config.activeUserId; })[0];
    if (!activeUser || activeUser.role !== 'Admin Tech') {
      return { success: false, error: 'Acceso Denegado: Solo administradores pueden modificar la configuración de Google Sheets.' };
    }
    config.spreadsheetId = settings.spreadsheetId || config.spreadsheetId;
    config.sheetName = settings.sheetName || config.sheetName;
    config.range = settings.range || config.range;
    config.apiKey = settings.apiKey !== undefined ? settings.apiKey : config.apiKey;
    config.autoSyncEnabled = settings.autoSyncEnabled !== undefined ? !!settings.autoSyncEnabled : config.autoSyncEnabled;
    writeConfig_(ss, config);
    addSyncLog_(ss, 'info', 'Configuración de Google Sheets actualizada. Spreadsheet ID: ...' + String(config.spreadsheetId).slice(-6));
    return { success: true };
  } finally {
    lock.releaseLock();
  }
}

function saveValidationRules(rules) {
  var lock = LockService.getScriptLock();
  lock.waitLock(30000);
  try {
    var ss = getSS_();
    var config = readConfig_(ss);
    var users = readUsers_(ss);
    var activeUser = users.filter(function (u) { return u.id === config.activeUserId; })[0];
    if (!activeUser || activeUser.role !== 'Admin Tech') {
      return { success: false, error: 'Acceso Denegado: Se requiere rol Admin Tech para modificar las reglas de validación.' };
    }
    var current = readRules_(ss);
    var updated = {
      caseIdRegex: rules.caseIdRegex || current.caseIdRegex,
      minClientLength: rules.minClientLength !== undefined ? Number(rules.minClientLength) : current.minClientLength,
      allowSpecialCharsInClient: rules.allowSpecialCharsInClient !== undefined ? !!rules.allowSpecialCharsInClient : current.allowSpecialCharsInClient,
      requireModelSelection: rules.requireModelSelection !== undefined ? !!rules.requireModelSelection : current.requireModelSelection,
      requireDescription: rules.requireDescription !== undefined ? !!rules.requireDescription : current.requireDescription
    };
    writeRules_(ss, updated);
    addSyncLog_(ss, 'warning', 'Reglas de validación de datos del formulario modificadas.');
    return { success: true };
  } finally {
    lock.releaseLock();
  }
}

function downloadManual(manualId) {
  var lock = LockService.getScriptLock();
  lock.waitLock(30000);
  try {
    var ss = getSS_();
    var manuals = readManualsRaw_(ss);
    var manual = null;
    for (var i = 0; i < manuals.length; i++) {
      if (manuals[i].id === manualId) { manual = manuals[i]; break; }
    }
    if (!manual) return { success: false, error: 'Manual no encontrado' };
    manual.views = Number(manual.views || 0) + 1;
    writeManualsRaw_(ss, manuals);
    return { success: true, manual: manual };
  } finally {
    lock.releaseLock();
  }
}

function updateCourseProgress(courseId, progress) {
  var lock = LockService.getScriptLock();
  lock.waitLock(30000);
  try {
    var ss = getSS_();
    var courses = readCoursesRaw_(ss);
    var course = null;
    for (var i = 0; i < courses.length; i++) {
      if (courses[i].id === courseId) { course = courses[i]; break; }
    }
    if (!course) return { success: false, error: 'Curso no encontrado' };
    course.progress = Math.min(100, Math.max(0, Number(progress)));
    course.completed = course.progress === 100;
    writeCoursesRaw_(ss, courses);
    return { success: true, course: course };
  } finally {
    lock.releaseLock();
  }
}
