import type { PropsWithChildren } from 'react';

interface StatCardProps extends PropsWithChildren {
  title: string;
  value: string;
  tone?: 'neutral' | 'success' | 'danger';
}

export function StatCard({ title, value, tone = 'neutral', children }: StatCardProps) {
  const accent = tone === 'success' ? '#00d68f' : tone === 'danger' ? '#ff6b6b' : '#a29bfe';

  return (
    <section
      className="glass-card"
      style={{
        borderRadius: 20,
        padding: 16,
        minWidth: 0,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8, minWidth: 0 }}>
        <span className={`status-dot ${tone}`} />
        <div style={{ color: '#9ca3af', fontSize: 12, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{title}</div>
      </div>
      <div className={`metric-value ${tone}`} style={{ color: accent, fontSize: 'clamp(20px, 2vw, 24px)', fontWeight: 700, marginBottom: children ? 10 : 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
        {value}
      </div>
      {children}
    </section>
  );
}
