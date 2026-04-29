import { useEffect, useMemo } from 'react';
import { Globe, MoonStar, RefreshCcw, ShieldCheck, ShieldOff, Sparkles, SunMedium } from 'lucide-react';
import { StatCard } from './components/StatCard';
import { getActionLabel, getMessage } from './lib/i18n';
import { useAppStore } from './lib/store';

function statusText(value: boolean, positive: string, negative: string) {
  return value ? positive : negative;
}

export default function App() {
  const {
    status,
    backups,
    version,
    logs,
    operationLogs,
    selectedLogId,
    loading,
    operating,
    error,
    theme,
    language,
    refresh,
    runDisable,
    runRestore,
    runRestoreBackup,
    runDeleteBackup,
    clearError,
    selectLog,
    toggleTheme,
    toggleLanguage,
  } = useAppStore();

  const t = getMessage(language);
  const selectedLog = useMemo(
    () => operationLogs.find((entry) => entry.id === selectedLogId) ?? operationLogs[0] ?? null,
    [operationLogs, selectedLogId],
  );

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return (
    <main
      className="app-shell no-select"
      style={{
        height: '100vh',
        color: 'var(--text-main)',
        padding: 'clamp(12px, 1.5vw, 24px)',
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          maxWidth: 1400,
          height: '100%',
          margin: '0 auto',
          display: 'grid',
          gridTemplateRows: 'auto auto minmax(0, 1fr) auto',
          gap: 'clamp(10px, 1.2vw, 16px)',
          overflow: 'hidden',
          position: 'relative',
          zIndex: 1,
        }}
      >
        <header
          className="glass-panel"
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: 14,
            flexWrap: 'wrap',
            padding: '16px 18px',
            borderRadius: 24,
          }}
        >
          <div style={{ minWidth: 0 }}>
            <div className="brand-badge" style={{ marginBottom: 10 }}>
              <Sparkles size={14} /> {t.badge}
            </div>
            <h1 style={{ margin: 0, fontSize: 'clamp(24px, 3vw, 34px)', lineHeight: 1.05, letterSpacing: '-0.03em' }}>Gan-Mac Desktop</h1>
            <p style={{ margin: '6px 0 0', color: 'var(--text-soft)', fontSize: 'clamp(12px, 1.5vw, 14px)' }}>
              {t.subtitle}
            </p>
          </div>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <button className="glass-button" onClick={toggleTheme} style={toggleButtonStyle}>
              {theme === 'dark' ? <SunMedium size={16} /> : <MoonStar size={16} />} {theme === 'dark' ? t.light : t.dark}
            </button>
            <button className="glass-button" onClick={toggleLanguage} style={toggleButtonStyle}>
              <Globe size={16} /> {t.language}
            </button>
            <button
              className="glass-button"
              onClick={() => void refresh()}
              disabled={loading || operating}
              style={buttonStyle('linear-gradient(135deg, rgba(71,85,105,0.95), rgba(51,65,85,0.9))')}
            >
              <RefreshCcw size={16} style={{ animation: loading ? 'spin 1s linear infinite' : 'none' }} /> {t.refresh}
            </button>
            <button
              className="glass-button"
              onClick={() => void runDisable()}
              disabled={operating}
              style={buttonStyle('linear-gradient(135deg, rgba(124,58,237,0.98), rgba(109,40,217,0.88))')}
            >
              <ShieldOff size={16} /> {operating ? t.running : t.disable}
            </button>
            <button
              className="glass-button"
              onClick={() => void runRestore()}
              disabled={operating}
              style={buttonStyle('linear-gradient(135deg, rgba(5,150,105,0.98), rgba(4,120,87,0.9))')}
            >
              <ShieldCheck size={16} /> {operating ? t.running : t.restore}
            </button>
          </div>
        </header>

        <div style={{ display: 'grid', gap: 'clamp(10px, 1.2vw, 16px)' }}>
          {error ? (
            <div
              className="error-banner glass-panel"
              onClick={clearError}
              style={{
                padding: '12px 14px',
                borderRadius: 16,
                background: 'rgba(239,68,68,0.12)',
                border: '1px solid rgba(239,68,68,0.25)',
                color: '#fecaca',
                cursor: 'pointer',
                fontSize: 'clamp(12px, 1.4vw, 14px)',
              }}
            >
              {error}
            </div>
          ) : null}

          <section
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
              gap: 'clamp(10px, 1.2vw, 16px)',
            }}
          >
            <StatCard
              title={t.autoUpdate}
              value={status ? statusText(status.autoUpdateEnabled, t.enabled, t.disabled) : t.checking}
              tone={status ? (status.autoUpdateEnabled ? 'success' : 'danger') : 'neutral'}
            />
            <StatCard
              title={t.hostsBlock}
              value={status ? statusText(status.hostsBlocked, t.active, t.inactive) : t.checking}
              tone={status ? (status.hostsBlocked ? 'danger' : 'success') : 'neutral'}
            />
            <StatCard
              title={t.updateService}
              value={status ? statusText(status.serviceRunning, t.serviceRunning, t.serviceStopped) : t.checking}
              tone={status ? (status.serviceRunning ? 'success' : 'danger') : 'neutral'}
            />
            <StatCard
              title={t.hostsBackup}
              value={status ? `${status.backupCount}` : t.checking}
            >
              <div style={{ color: 'var(--text-soft)', fontSize: 12, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {t.latestBackup}: {status?.latestBackup ?? t.none}
              </div>
            </StatCard>
          </section>
        </div>

        <section
          style={{
            display: 'grid',
            gridTemplateColumns: 'minmax(0, 0.85fr) minmax(0, 1fr) minmax(0, 1.25fr)',
            gap: 'clamp(10px, 1.2vw, 16px)',
            minHeight: 0,
            overflow: 'hidden',
          }}
        >
          <section className="glass-panel" style={{ borderRadius: 22, minHeight: 0, padding: 16 }}>
            <h2 className="section-title" style={panelTitleStyle}>{t.blockedDomains}</h2>
            <div style={{ display: 'grid', gap: 8, alignContent: 'start' }}>
              {(status?.blockedDomains ?? []).map((domain) => (
                <div key={domain} className="soft-list-item" style={listItemStyle}>
                  <span style={truncateStyle}>{domain}</span>
                  <strong style={{ color: 'var(--brand-soft)', flexShrink: 0 }}>{status?.hostsBlocked ? 'BLOCKED' : 'OPEN'}</strong>
                </div>
              ))}
            </div>
          </section>

          <section className="glass-panel" style={{ borderRadius: 22, minHeight: 0, display: 'grid', gridTemplateRows: 'auto minmax(0, 1fr)', padding: 16 }}>
            <h2 className="section-title" style={panelTitleStyle}>{t.backupManager}</h2>
            <div style={{ display: 'grid', gap: 8, alignContent: 'start', minHeight: 0, overflow: 'hidden' }}>
              {backups.length ? backups.slice(0, 8).map((backup) => (
                <div key={backup.path} className="soft-list-item" style={{ ...listItemStyle, alignItems: 'flex-start' }}>
                  <div style={{ minWidth: 0, display: 'grid', gap: 4 }}>
                    <span style={truncateStyle}>{backup.fileName}</span>
                    <span style={{ ...truncateStyle, fontSize: 11, color: 'var(--text-soft)' }}>{backup.modifiedAt}</span>
                  </div>
                  <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                    <button className="glass-button" onClick={() => void runRestoreBackup(backup.path)} disabled={operating} style={smallButtonStyle}>
                      {t.restoreBackup}
                    </button>
                    <button className="glass-button" onClick={() => void runDeleteBackup(backup.path)} disabled={operating} style={dangerButtonStyle}>
                      {t.deleteBackup}
                    </button>
                  </div>
                </div>
              )) : <div style={{ color: 'var(--text-soft)' }}>{t.noBackups}</div>}
            </div>
          </section>

          <section className="glass-panel" style={{ borderRadius: 22, minHeight: 0, display: 'grid', gridTemplateRows: 'auto minmax(0, 1fr)', padding: 16 }}>
            <h2 className="section-title" style={panelTitleStyle}>{t.operationLogs}</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 0.9fr) minmax(0, 1.1fr)', gap: 10, minHeight: 0, overflow: 'hidden' }}>
              <div className="shimmer-log" style={logPaneStyle}>
                {operationLogs.length ? operationLogs.slice(0, 12).map((entry) => (
                  <button
                    key={entry.id}
                    className="soft-list-item"
                    onClick={() => selectLog(entry.id)}
                    style={{
                      ...logHistoryItemStyle,
                      border: entry.id === selectedLog?.id ? '1px solid rgba(139,92,246,0.45)' : '1px solid transparent',
                      background: entry.id === selectedLog?.id ? 'rgba(139,92,246,0.12)' : 'rgba(255,255,255,0.04)',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}>
                      <strong style={truncateStyle}>{getActionLabel(language, entry.action)}</strong>
                      <span style={{ color: entry.success ? 'var(--success)' : 'var(--danger)', flexShrink: 0 }}>{entry.success ? t.success : t.failed}</span>
                    </div>
                    <div style={{ ...truncateStyle, fontSize: 11, color: 'var(--text-soft)' }}>{entry.finishedAt}</div>
                  </button>
                )) : t.noLogs}
              </div>
              <div className="shimmer-log" style={logPaneStyle}>
                {selectedLog ? (
                  <>
                    <div style={{ display: 'grid', gap: 6, marginBottom: 10 }}>
                      <strong>{getActionLabel(language, selectedLog.action)}</strong>
                      <div style={{ fontSize: 12, color: 'var(--text-soft)' }}>{t.status}: {selectedLog.success ? t.success : t.failed}</div>
                      <div style={{ fontSize: 12, color: 'var(--text-soft)' }}>{t.startedAt}: {selectedLog.startedAt}</div>
                      <div style={{ fontSize: 12, color: 'var(--text-soft)' }}>{t.finishedAt}: {selectedLog.finishedAt}</div>
                    </div>
                    <div style={{ display: 'grid', gap: 4 }}>
                      {selectedLog.lines.map((line, index) => (
                        <div key={`${selectedLog.id}-${index}`} style={singleLineStyle}>{line}</div>
                      ))}
                    </div>
                  </>
                ) : logs.length ? logs.slice(0, 14).map((line, index) => (
                  <div key={`${line}-${index}`} style={singleLineStyle}>{line}</div>
                )) : t.noLogs}
              </div>
            </div>
          </section>
        </section>

        <footer style={{ color: 'var(--text-dim)', fontSize: 12, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', paddingLeft: 4 }}>
          {operating ? t.running : loading ? t.checking : t.ready}
        </footer>
      </div>
    </main>
  );
}

function buttonStyle(background: string): React.CSSProperties {
  return {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 8,
    border: '1px solid rgba(255,255,255,0.12)',
    borderRadius: 16,
    background,
    color: '#fff',
    padding: '10px 14px',
    fontWeight: 600,
    fontSize: 13,
    cursor: 'pointer',
    whiteSpace: 'nowrap',
  };
}

const toggleButtonStyle: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: 8,
  border: '1px solid rgba(255,255,255,0.12)',
  borderRadius: 16,
  background: 'rgba(255,255,255,0.08)',
  color: 'var(--text-main)',
  padding: '10px 14px',
  fontWeight: 600,
  fontSize: 13,
  cursor: 'pointer',
  whiteSpace: 'nowrap',
};

const smallButtonStyle: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  border: '1px solid rgba(255,255,255,0.12)',
  borderRadius: 12,
  background: 'rgba(255,255,255,0.08)',
  color: 'var(--text-main)',
  padding: '7px 10px',
  fontSize: 11,
  cursor: 'pointer',
};

const dangerButtonStyle: React.CSSProperties = {
  ...smallButtonStyle,
  background: 'rgba(255,107,107,0.12)',
  color: 'var(--danger)',
};

const panelTitleStyle: React.CSSProperties = {
  marginTop: 0,
  marginBottom: 12,
  fontSize: 16,
};

const listItemStyle: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  gap: 12,
  padding: '9px 11px',
  borderRadius: 12,
  background: 'rgba(255,255,255,0.04)',
  minWidth: 0,
};

const truncateStyle: React.CSSProperties = {
  minWidth: 0,
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
};

const singleLineStyle: React.CSSProperties = {
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
};

const logPaneStyle: React.CSSProperties = {
  background: 'linear-gradient(180deg, rgba(7,10,24,0.76), rgba(2,6,23,0.68))',
  borderRadius: 16,
  padding: 12,
  minHeight: 0,
  overflow: 'hidden',
  fontFamily: 'SFMono-Regular, Menlo, monospace',
  fontSize: 'clamp(11px, 1.2vw, 12px)',
  lineHeight: 1.5,
  color: 'var(--text-main)',
  display: 'grid',
  alignContent: 'start',
  gap: 6,
  border: '1px solid rgba(255,255,255,0.08)',
};

const logHistoryItemStyle: React.CSSProperties = {
  display: 'grid',
  gap: 6,
  width: '100%',
  textAlign: 'left',
  padding: '10px 12px',
  borderRadius: 12,
  color: 'var(--text-main)',
  cursor: 'pointer',
};
