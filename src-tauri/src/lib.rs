use glob::glob;
use serde::{Deserialize, Serialize};
use std::fs;
use std::process::Command;
use std::time::{SystemTime, UNIX_EPOCH};
use thiserror::Error;

const APP_VERSION: &str = "1.0.0";
const SCRIPT_VERSION: &str = "0.0.2";
const SCRIPT_AUTHOR: &str = "CMMUU";
const SOFTWARE_UPDATE_PLIST: &str = "/Library/Preferences/com.apple.SoftwareUpdate.plist";
const HOSTS_PATH: &str = "/etc/hosts";
const APP_SUPPORT_DIR: &str = "gan-mac-desktop";
const LOG_FILE_NAME: &str = "operation-logs.json";
const DEFAULT_DOMAIN_LIST: [&str; 6] = [
    "swscan.apple.com",
    "mesu.apple.com",
    "swdist.apple.com",
    "swcdn.apple.com",
    "gdmf.apple.com",
    "xp.apple.com",
];

#[derive(Debug, Error)]
enum AppError {
    #[error("{0}")]
    Message(String),
    #[error(transparent)]
    Io(#[from] std::io::Error),
    #[error(transparent)]
    Json(#[from] serde_json::Error),
}

impl Serialize for AppError {
    fn serialize<S>(&self, serializer: S) -> Result<S::Ok, S::Error>
    where
        S: serde::Serializer,
    {
        serializer.serialize_str(&self.to_string())
    }
}

#[derive(Debug, Serialize, Clone)]
#[serde(rename_all = "camelCase")]
struct SystemStatus {
    auto_update_enabled: bool,
    hosts_blocked: bool,
    service_running: bool,
    blocked_domains: Vec<String>,
    backup_count: usize,
    latest_backup: Option<String>,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
#[serde(rename_all = "camelCase")]
struct OperationLogEntry {
    id: String,
    action: String,
    success: bool,
    started_at: String,
    finished_at: String,
    message: String,
    lines: Vec<String>,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
struct OperationResult {
    success: bool,
    message: String,
    logs: Vec<String>,
    status: SystemStatus,
    operation_log: OperationLogEntry,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
struct VersionInfo {
    app_version: String,
    script_version: String,
    script_author: String,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
struct BackupInfo {
    path: String,
    file_name: String,
    modified_at: String,
}

#[tauri::command]
fn get_version_info() -> VersionInfo {
    VersionInfo {
        app_version: APP_VERSION.to_string(),
        script_version: SCRIPT_VERSION.to_string(),
        script_author: SCRIPT_AUTHOR.to_string(),
    }
}

#[tauri::command]
fn get_operation_logs() -> Result<Vec<OperationLogEntry>, AppError> {
    read_operation_logs()
}

#[tauri::command]
fn list_hosts_backups() -> Result<Vec<BackupInfo>, AppError> {
    get_backup_paths()?
        .into_iter()
        .map(backup_info_from_path)
        .collect()
}

#[tauri::command]
fn get_system_status() -> Result<SystemStatus, AppError> {
    collect_system_status()
}

#[tauri::command]
fn disable_updates() -> Result<OperationResult, AppError> {
    execute_operation("disable_updates", disable_script(), "System updates disabled.")
}

#[tauri::command]
fn restore_updates() -> Result<OperationResult, AppError> {
    execute_operation("restore_updates", restore_script(), "System updates restored.")
}

#[tauri::command]
fn restore_backup(backup_path: String) -> Result<OperationResult, AppError> {
    let script = format!(
        r#"
set -e

echo 'Restoring selected hosts backup'
cp -f '{backup_path}' /etc/hosts
chmod 644 /etc/hosts
dscacheutil -flushcache 2>/dev/null || true
killall -HUP mDNSResponder 2>/dev/null || true

echo 'Backup restore complete'
"#,
        backup_path = escape_single_quotes(&backup_path)
    );
    execute_operation("restore_backup", script, "Hosts backup restored.")
}

#[tauri::command]
fn delete_backup(backup_path: String) -> Result<OperationResult, AppError> {
    let script = format!(
        r#"
set -e

echo 'Deleting selected hosts backup'
rm -f '{backup_path}'

echo 'Backup delete complete'
"#,
        backup_path = escape_single_quotes(&backup_path)
    );
    execute_operation("delete_backup", script, "Hosts backup deleted.")
}

fn execute_operation(action: &str, script: String, message: &str) -> Result<OperationResult, AppError> {
    let started_at = now_iso_string();
    let logs = run_privileged_script(&script)?;
    let finished_at = now_iso_string();
    let status = collect_system_status()?;
    let operation_log = OperationLogEntry {
        id: format!("{}-{}", action, now_unix_seconds()),
        action: action.to_string(),
        success: true,
        started_at,
        finished_at,
        message: message.to_string(),
        lines: logs.clone(),
    };
    append_operation_log(operation_log.clone())?;

    Ok(OperationResult {
        success: true,
        message: message.to_string(),
        logs,
        status,
        operation_log,
    })
}

fn collect_system_status() -> Result<SystemStatus, AppError> {
    let schedule_output = Command::new("softwareupdate").args(["--schedule"]).output()?;
    let schedule_text = String::from_utf8_lossy(&schedule_output.stdout).to_lowercase()
        + &String::from_utf8_lossy(&schedule_output.stderr).to_lowercase();
    let auto_update_enabled = !schedule_text.contains("off");

    let hosts_content = fs::read_to_string(HOSTS_PATH).unwrap_or_default();
    let hosts_blocked = DEFAULT_DOMAIN_LIST.iter().all(|domain| {
        hosts_content.contains(&format!("127.0.0.1 {}", domain))
    });

    let service_output = Command::new("launchctl").args(["list"]).output()?;
    let service_text = String::from_utf8_lossy(&service_output.stdout);
    let service_running = service_text.contains("com.apple.softwareupdated");

    let backups = get_backup_paths()?;
    let latest_backup = backups.first().map(|path| path.display().to_string());

    Ok(SystemStatus {
        auto_update_enabled,
        hosts_blocked,
        service_running,
        blocked_domains: DEFAULT_DOMAIN_LIST.iter().map(|item| item.to_string()).collect(),
        backup_count: backups.len(),
        latest_backup,
    })
}

fn get_backup_paths() -> Result<Vec<std::path::PathBuf>, AppError> {
    let mut backups = Vec::new();
    for entry in glob("/etc/hosts.bak_*").map_err(|error| AppError::Message(error.to_string()))? {
        match entry {
            Ok(path) => backups.push(path),
            Err(error) => return Err(AppError::Message(error.to_string())),
        }
    }
    backups.sort_by(|a, b| b.cmp(a));
    Ok(backups)
}

fn backup_info_from_path(path: std::path::PathBuf) -> Result<BackupInfo, AppError> {
    let metadata = fs::metadata(&path)?;
    let modified = metadata.modified().unwrap_or(SystemTime::now());
    let modified_at = system_time_to_string(modified);
    Ok(BackupInfo {
        path: path.display().to_string(),
        file_name: path.file_name().map(|name| name.to_string_lossy().to_string()).unwrap_or_default(),
        modified_at,
    })
}

fn read_operation_logs() -> Result<Vec<OperationLogEntry>, AppError> {
    let path = operation_log_file_path()?;
    if !path.exists() {
        return Ok(Vec::new());
    }
    let content = fs::read_to_string(path)?;
    if content.trim().is_empty() {
        return Ok(Vec::new());
    }
    Ok(serde_json::from_str(&content)?)
}

fn append_operation_log(entry: OperationLogEntry) -> Result<(), AppError> {
    let mut logs = read_operation_logs()?;
    logs.insert(0, entry);
    logs.truncate(100);
    write_operation_logs(&logs)
}

fn write_operation_logs(logs: &[OperationLogEntry]) -> Result<(), AppError> {
    let path = operation_log_file_path()?;
    if let Some(parent) = path.parent() {
        fs::create_dir_all(parent)?;
    }
    fs::write(path, serde_json::to_string_pretty(logs)?)?;
    Ok(())
}

fn operation_log_file_path() -> Result<std::path::PathBuf, AppError> {
    let home = std::env::var("HOME").map_err(|_| AppError::Message("Unable to resolve HOME directory.".to_string()))?;
    Ok(std::path::PathBuf::from(home)
        .join("Library")
        .join("Application Support")
        .join(APP_SUPPORT_DIR)
        .join(LOG_FILE_NAME))
}

fn run_privileged_script(script: &str) -> Result<Vec<String>, AppError> {
    let temp_dir = std::env::temp_dir();
    let script_path = temp_dir.join("gan-mac-desktop-command.sh");
    fs::write(&script_path, script)?;

    let script_path_str = script_path.display().to_string();
    let output = Command::new("osascript")
        .args([
            "-e",
            &format!(
                "do shell script \"/bin/chmod +x '{}' && /bin/bash '{}'\" with administrator privileges",
                script_path_str, script_path_str
            ),
        ])
        .output()?;

    let _ = fs::remove_file(&script_path);

    if output.status.success() {
        let stdout = String::from_utf8_lossy(&output.stdout);
        let logs = stdout
            .lines()
            .filter(|line| !line.trim().is_empty())
            .map(|line| line.to_string())
            .collect::<Vec<_>>();
        Ok(if logs.is_empty() { vec!["Operation completed.".to_string()] } else { logs })
    } else {
        Err(AppError::Message(String::from_utf8_lossy(&output.stderr).trim().to_string()))
    }
}

fn disable_script() -> String {
    let block_lines = DEFAULT_DOMAIN_LIST
        .iter()
        .map(|domain| format!("echo '127.0.0.1 {}' >> /etc/hosts", domain))
        .collect::<Vec<_>>()
        .join("\n");

    format!(
        r#"
set -e

echo 'Starting disable workflow'
softwareupdate --schedule off

defaults write {plist} AutomaticCheckEnabled -bool FALSE
defaults write {plist} AutomaticDownload -bool FALSE
defaults write {plist} CriticalUpdateInstall -bool FALSE
defaults write {plist} ConfigDataInstall -bool FALSE
defaults write {plist} AutomaticallyInstallMacOSUpdates -bool FALSE
defaults write {plist} AutomaticInstallation -bool FALSE

echo 'Software Update preferences written'

rm -rf /Library/Caches/com.apple.SoftwareUpdate/ 2>/dev/null || true
rm -rf /Library/Updates/* 2>/dev/null || true
rm -f /var/db/softwareupdate/* 2>/dev/null || true
rm -f /var/db/SoftwareUpdate.badge 2>/dev/null || true
rm -f /Library/Preferences/com.apple.preferences.softwareupdate.plist 2>/dev/null || true
rm -f /var/db/softwareupdate/preferences.plist 2>/dev/null || true
rm -f /private/var/db/softwareupdate/preferences.plist 2>/dev/null || true

echo 'Cache and badge files cleaned'

backup="/etc/hosts.bak_$(date +%Y%m%d%H%M%S)"
cp /etc/hosts "$backup"
chmod 644 "$backup"
echo "Created hosts backup: $backup"

grep -q '# 更新屏蔽规则 / Update Block Rules' /etc/hosts || {{
  printf '\n# 更新屏蔽规则 / Update Block Rules\n' >> /etc/hosts
  {block_lines}
}}
chmod 644 /etc/hosts

echo 'Hosts block rules applied'

dscacheutil -flushcache 2>/dev/null || true
killall -HUP mDNSResponder 2>/dev/null || true
launchctl disable system/com.apple.softwareupdated 2>/dev/null || true
launchctl stop system/com.apple.softwareupdated 2>/dev/null || true
launchctl unload -w /System/Library/LaunchDaemons/com.apple.softwareupdated.plist 2>/dev/null || true
pmset -a powernap 0 2>/dev/null || true
pmset -a womp 0 2>/dev/null || true
pmset -a darkwakes 0 2>/dev/null || true
defaults write com.apple.systempreferences AttentionPrefBundleIDs 0 2>/dev/null || true
killall Dock 2>/dev/null || true
killall usernoted 2>/dev/null || true
killall softwareupdated 2>/dev/null || true
killall softwareupdated_notify_agent 2>/dev/null || true
softwareupdate --reset-ignored 2>/dev/null || true

echo 'Disable workflow finished'
"#,
        plist = SOFTWARE_UPDATE_PLIST,
        block_lines = block_lines
    )
}

fn restore_script() -> String {
    let lines_to_delete = DEFAULT_DOMAIN_LIST.len() + 1;
    format!(
        r#"
set -e

echo 'Starting restore workflow'
latest_backup=$(ls -t /etc/hosts.bak_* 2>/dev/null | head -1 || true)
if [ -n "$latest_backup" ]; then
  cp -f "$latest_backup" /etc/hosts
  chmod 644 /etc/hosts
  echo "Restored hosts backup: $latest_backup"
else
  sed -i '' '/# 更新屏蔽规则 \/ Update Block Rules/,+{lines_to_delete}d' /etc/hosts 2>/dev/null || true
  chmod 644 /etc/hosts
  echo 'No backup found, removed block rules directly'
fi

softwareupdate --schedule on

defaults write {plist} AutomaticCheckEnabled -bool TRUE
defaults write {plist} AutomaticDownload -bool TRUE
defaults write {plist} CriticalUpdateInstall -bool TRUE
defaults write {plist} ConfigDataInstall -bool TRUE
defaults write {plist} AutomaticallyInstallMacOSUpdates -bool TRUE
defaults write {plist} AutomaticInstallation -bool TRUE

echo 'Software Update preferences restored'

launchctl enable system/com.apple.softwareupdated 2>/dev/null || true
launchctl start system/com.apple.softwareupdated 2>/dev/null || true
launchctl load -w /System/Library/LaunchDaemons/com.apple.softwareupdated.plist 2>/dev/null || true
pmset -a powernap 1 2>/dev/null || true
pmset -a womp 1 2>/dev/null || true
pmset -a darkwakes 1 2>/dev/null || true
rm -rf /Library/Caches/com.apple.SoftwareUpdate/ 2>/dev/null || true

dscacheutil -flushcache 2>/dev/null || true
killall -HUP mDNSResponder 2>/dev/null || true
touch /var/db/SoftwareUpdate.badge 2>/dev/null || true
chmod 644 /var/db/SoftwareUpdate.badge 2>/dev/null || true

echo 'Restore workflow finished'
"#,
        plist = SOFTWARE_UPDATE_PLIST,
        lines_to_delete = lines_to_delete
    )
}

fn now_unix_seconds() -> u64 {
    SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .map(|duration| duration.as_secs())
        .unwrap_or(0)
}

fn now_iso_string() -> String {
    now_unix_seconds().to_string()
}

fn system_time_to_string(time: SystemTime) -> String {
    time.duration_since(UNIX_EPOCH)
        .map(|duration| duration.as_secs().to_string())
        .unwrap_or_else(|_| "0".to_string())
}

fn escape_single_quotes(value: &str) -> String {
    value.replace('\'', "'\\''")
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![
            get_system_status,
            disable_updates,
            restore_updates,
            list_hosts_backups,
            restore_backup,
            delete_backup,
            get_operation_logs,
            get_version_info,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
