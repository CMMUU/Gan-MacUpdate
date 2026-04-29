import type { Language } from './types';

export const messages = {
  en: {
    badge: 'Curved glass control desk',
    subtitle: 'Visual control for disabling and restoring macOS system updates',
    refresh: 'Refresh',
    disable: 'Disable Updates',
    restore: 'Restore Updates',
    running: 'Running...',
    autoUpdate: 'Auto Update Schedule',
    hostsBlock: 'Hosts Blocking',
    updateService: 'Update Service',
    hostsBackup: 'Hosts Backups',
    enabled: 'Enabled',
    disabled: 'Disabled',
    active: 'Active',
    inactive: 'Inactive',
    serviceRunning: 'Running',
    serviceStopped: 'Stopped',
    checking: 'Checking',
    latestBackup: 'Latest backup',
    none: 'None',
    blockedDomains: 'Blocked Domains',
    backupManager: 'Hosts Backup Manager',
    operationLogs: 'Operation Logs',
    noBackups: 'No backups yet',
    noLogs: 'No logs yet',
    restoreBackup: 'Restore',
    deleteBackup: 'Delete',
    logHistory: 'History',
    logDetails: 'Details',
    success: 'Success',
    failed: 'Failed',
    ready: 'Ready',
    appVersion: 'App version',
    scriptVersion: 'Script version',
    status: 'Status',
    startedAt: 'Started',
    finishedAt: 'Finished',
    backupDeleted: 'Backup deleted.',
    backupRestored: 'Backup restored.',
    light: 'Light',
    dark: 'Dark',
    language: '中文',
    english: 'EN',
    chinese: '中文',
    disableAction: 'Disable updates',
    restoreAction: 'Restore updates',
    restoreBackupAction: 'Restore backup',
    deleteBackupAction: 'Delete backup',
  },
  zh: {
    badge: '曲线玻璃控制台',
    subtitle: '可视化管理 macOS 系统更新禁用与恢复流程',
    refresh: '刷新状态',
    disable: '禁用更新',
    restore: '恢复更新',
    running: '执行中...',
    autoUpdate: '自动更新计划',
    hostsBlock: 'Hosts 屏蔽',
    updateService: '更新服务',
    hostsBackup: 'Hosts 备份',
    enabled: '已启用',
    disabled: '已禁用',
    active: '已生效',
    inactive: '未生效',
    serviceRunning: '运行中',
    serviceStopped: '未运行',
    checking: '检测中',
    latestBackup: '最新备份',
    none: '无',
    blockedDomains: '域名屏蔽状态',
    backupManager: 'Hosts 备份管理',
    operationLogs: '操作日志',
    noBackups: '暂无备份',
    noLogs: '暂无日志',
    restoreBackup: '恢复',
    deleteBackup: '删除',
    logHistory: '历史记录',
    logDetails: '详情',
    success: '成功',
    failed: '失败',
    ready: '就绪',
    appVersion: '应用版本',
    scriptVersion: '脚本版本',
    status: '状态',
    startedAt: '开始时间',
    finishedAt: '结束时间',
    backupDeleted: '备份已删除。',
    backupRestored: '备份已恢复。',
    light: '浅色',
    dark: '深色',
    language: 'EN',
    english: 'EN',
    chinese: '中文',
    disableAction: '禁用更新',
    restoreAction: '恢复更新',
    restoreBackupAction: '恢复备份',
    deleteBackupAction: '删除备份',
  },
} as const;

export function getMessage(language: Language) {
  return messages[language];
}

export function getActionLabel(language: Language, action: string) {
  const dict = getMessage(language);
  switch (action) {
    case 'disable_updates':
      return dict.disableAction;
    case 'restore_updates':
      return dict.restoreAction;
    case 'restore_backup':
      return dict.restoreBackupAction;
    case 'delete_backup':
      return dict.deleteBackupAction;
    default:
      return action;
  }
}
