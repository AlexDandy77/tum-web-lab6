import type { ReactNode } from 'react';

interface Props {
  icon: ReactNode;
  title: string;
  description: string;
  action?: ReactNode;
}

export function EmptyState({ icon, title, description, action }: Props) {
  return (
    <div
      className="animate-fade-in"
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '60px 24px',
        textAlign: 'center',
        gap: 12,
      }}
    >
      <div style={{
        width: 72,
        height: 72,
        borderRadius: '50%',
        background: 'var(--bg-muted)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'var(--text-subtle)',
        fontSize: 32,
      }}>
        {icon}
      </div>
      <h3 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: 'var(--text)' }}>{title}</h3>
      <p style={{ margin: 0, fontSize: 14, color: 'var(--text-muted)', maxWidth: 320 }}>{description}</p>
      {action && <div style={{ marginTop: 8 }}>{action}</div>}
    </div>
  );
}
