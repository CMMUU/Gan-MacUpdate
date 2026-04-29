import { create } from 'zustand';
import {
  deleteBackup,
  disableUpdates,
  getOperationLogs,
  getSystemStatus,
  getVersionInfo,
  listHostsBackups,
  restoreBackup,
  restoreUpdates,
} from '../lib/api';
import type { BackupInfo, Language, OperationLogEntry, OperationResult, SystemStatus, ThemeMode, VersionInfo } from '../lib/types';

interface AppState {
  status: SystemStatus | null;
  backups: BackupInfo[];
  version: VersionInfo | null;
  logs: string[];
  operationLogs: OperationLogEntry[];
  selectedLogId: string | null;
  loading: boolean;
  operating: boolean;
  error: string | null;
  theme: ThemeMode;
  language: Language;
  refresh: () => Promise<void>;
  runDisable: () => Promise<void>;
  runRestore: () => Promise<void>;
  runRestoreBackup: (backupPath: string) => Promise<void>;
  runDeleteBackup: (backupPath: string) => Promise<void>;
  clearError: () => void;
  selectLog: (logId: string) => void;
  toggleTheme: () => void;
  toggleLanguage: () => void;
}

function appendLogs(current: string[], result: OperationResult) {
  return [...result.logs, result.message, ...current].slice(0, 240);
}

function completeOperation(result: OperationResult, backups: BackupInfo[], operationLogs: OperationLogEntry[]) {
  return {
    status: result.status,
    backups,
    operationLogs,
    selectedLogId: result.operationLog.id,
    operating: false,
  };
}

export const useAppStore = create<AppState>((set, get) => ({
  status: null,
  backups: [],
  version: null,
  logs: [],
  operationLogs: [],
  selectedLogId: null,
  loading: false,
  operating: false,
  error: null,
  theme: 'dark',
  language: 'en',
  clearError: () => set({ error: null }),
  selectLog: (selectedLogId) => set({ selectedLogId }),
  toggleTheme: () => set((state) => ({ theme: state.theme === 'dark' ? 'light' : 'dark' })),
  toggleLanguage: () => set((state) => ({ language: state.language === 'en' ? 'zh' : 'en' })),
  refresh: async () => {
    set({ loading: true, error: null });
    try {
      const [status, backups, version, operationLogs] = await Promise.all([
        getSystemStatus(),
        listHostsBackups(),
        getVersionInfo(),
        getOperationLogs(),
      ]);
      set((state) => ({
        status,
        backups,
        version,
        operationLogs,
        selectedLogId: state.selectedLogId ?? operationLogs[0]?.id ?? null,
        loading: false,
      }));
    } catch (error) {
      set({ loading: false, error: error instanceof Error ? error.message : String(error) });
    }
  },
  runDisable: async () => {
    set({ operating: true, error: null });
    try {
      const result = await disableUpdates();
      const [backups, operationLogs] = await Promise.all([listHostsBackups(), getOperationLogs()]);
      set((state) => ({
        ...completeOperation(result, backups, operationLogs),
        logs: appendLogs(state.logs, result),
      }));
    } catch (error) {
      set((state) => ({
        operating: false,
        logs: [`Operation failed: ${error instanceof Error ? error.message : String(error)}`, ...state.logs],
        error: error instanceof Error ? error.message : String(error),
      }));
      await get().refresh();
    }
  },
  runRestore: async () => {
    set({ operating: true, error: null });
    try {
      const result = await restoreUpdates();
      const [backups, operationLogs] = await Promise.all([listHostsBackups(), getOperationLogs()]);
      set((state) => ({
        ...completeOperation(result, backups, operationLogs),
        logs: appendLogs(state.logs, result),
      }));
    } catch (error) {
      set((state) => ({
        operating: false,
        logs: [`Operation failed: ${error instanceof Error ? error.message : String(error)}`, ...state.logs],
        error: error instanceof Error ? error.message : String(error),
      }));
      await get().refresh();
    }
  },
  runRestoreBackup: async (backupPath: string) => {
    set({ operating: true, error: null });
    try {
      const result = await restoreBackup(backupPath);
      const [backups, operationLogs] = await Promise.all([listHostsBackups(), getOperationLogs()]);
      set((state) => ({
        ...completeOperation(result, backups, operationLogs),
        logs: appendLogs(state.logs, result),
      }));
    } catch (error) {
      set({ operating: false, error: error instanceof Error ? error.message : String(error) });
      await get().refresh();
    }
  },
  runDeleteBackup: async (backupPath: string) => {
    set({ operating: true, error: null });
    try {
      const result = await deleteBackup(backupPath);
      const [backups, operationLogs] = await Promise.all([listHostsBackups(), getOperationLogs()]);
      set((state) => ({
        ...completeOperation(result, backups, operationLogs),
        logs: appendLogs(state.logs, result),
      }));
    } catch (error) {
      set({ operating: false, error: error instanceof Error ? error.message : String(error) });
      await get().refresh();
    }
  },
}));
