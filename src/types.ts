export interface HistoricalLog {
  timestamp: string;
  user: string;
  action: string;
  detail: string;
}

export interface Case {
  id: string;
  client: string;
  model: string;
  status: 'Abierto' | 'En Proceso' | 'Esperando Pieza' | 'Resuelto';
  priority: 'Crítica' | 'Alta' | 'Media';
  updatedAt: string;
  reporter: string;
  description: string;
  historicalLogs: HistoricalLog[];
}

export interface Manual {
  id: string;
  title: string;
  description: string;
  type: string;
  difficulty: 'HARD' | 'MEDIUM' | 'EASY';
  date: string;
  views: number;
  downloadUrl: string;
  image: string;
}

export interface Course {
  id: string;
  title: string;
  description: string;
  duration: string;
  modulesCount: number;
  progress: number;
  completed: boolean;
  image: string;
}

export interface User {
  id: string;
  name: string;
  role: 'Admin Tech' | 'Técnico Nvl 3' | 'Técnico Nvl 1';
  level: string;
  avatar: string;
}

export interface SyncLog {
  timestamp: string;
  level: 'success' | 'info' | 'warning' | 'error';
  message: string;
}

export interface GoogleSheetsSettings {
  spreadsheetId: string;
  sheetName: string;
  range: string;
  apiKey: string;
  autoSyncEnabled: boolean;
  syncLogs: SyncLog[];
  simulatedSheet: string[][];
}

export interface ValidationRules {
  caseIdRegex: string;
  minClientLength: number;
  allowSpecialCharsInClient: boolean;
  requireModelSelection: boolean;
  requireDescription: boolean;
}

export interface DbState {
  cases: Case[];
  manuals: Manual[];
  courses: Course[];
  users: User[];
  activeUserId: string;
  googleSheetsSettings: GoogleSheetsSettings;
  validationRules: ValidationRules;
}
