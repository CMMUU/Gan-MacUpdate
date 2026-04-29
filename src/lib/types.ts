export type ThemeMode = 'dark' | 'light';
export type Language = 'en' | 'zh';

export interface SystemStatus {
  autoUpdateEnabled: boolean;
  hostsBlocked: boolean;
  serviceRunning: boolean;
  blockedDomains: string[];
  backupCount: number;
  latestBackup: string | null;
}

export interface BackupInfo {
  path: string;
  fileName: string;
  modifiedAt: string;
}

export interface OperationLogEntry {
  id: string;
  action: string;
  success: boolean;
  startedAt: string;
  finishedAt: string;
  message: string;
  lines: string[];
}

export interface OperationResult {
  success: boolean;
  message: string;
  logs: string[];
  status: SystemStatus;
  operationLog: OperationLogEntry;
}

export interface VersionInfo {
  appVersion: string;
  scriptVersion: string;
  scriptAuthor: string;
}
