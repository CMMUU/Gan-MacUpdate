import { invoke } from '@tauri-apps/api/core';
import type { BackupInfo, OperationLogEntry, OperationResult, SystemStatus, VersionInfo } from './types';

export const getSystemStatus = () => invoke<SystemStatus>('get_system_status');
export const disableUpdates = () => invoke<OperationResult>('disable_updates');
export const restoreUpdates = () => invoke<OperationResult>('restore_updates');
export const listHostsBackups = () => invoke<BackupInfo[]>('list_hosts_backups');
export const restoreBackup = (backupPath: string) => invoke<OperationResult>('restore_backup', { backupPath });
export const deleteBackup = (backupPath: string) => invoke<OperationResult>('delete_backup', { backupPath });
export const getOperationLogs = () => invoke<OperationLogEntry[]>('get_operation_logs');
export const getVersionInfo = () => invoke<VersionInfo>('get_version_info');
