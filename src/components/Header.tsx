import { Sun, Moon, Flame } from 'lucide-react';
import { useTheme } from '../context/StoreContext';
import type { Page } from '../types';

interface Props {
  page: Page;
  setPage: (p: Page) => void;
}

const tabs: { id: Page; label: string }[] = [
  { id: 'dashboard', label: 'Dashboard' },
  { id: 'habits', label: 'Habits' },
  { id: 'stats', label: 'Stats' },
];

export function Header({ page, setPage }: Props) {
  const { theme, toggleTheme } = useTheme();

  return (
    <header style={{
      background: 'var(--bg-card)',
      borderBottom: '1px solid var(--border)',
      position: 'sticky',
      top: 0,
      zIndex: 100,
    }}>
      <div style={{
        maxWidth: 960,
        margin: '0 auto',
        padding: '0 20px',
        display: 'flex',
        alignItems: 'center',
        gap: 24,
        height: 60,
      }}>
        {/* Logo */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          fontWeight: 800,
          fontSize: 18,
          color: 'var(--primary)',
          userSelect: 'none',
          flexShrink: 0,
        }}>
          <Flame size={22} className="animate-flame" />
          HabitBuilder
        </div>

        {/* Nav */}
        <nav style={{ display: 'flex', gap: 4, flex: 1 }}>
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setPage(tab.id)}
              style={{
                background: page === tab.id ? 'var(--primary-light)' : 'transparent',
                color: page === tab.id ? 'var(--primary)' : 'var(--text-muted)',
                border: 'none',
                borderRadius: 10,
                padding: '6px 14px',
                fontWeight: page === tab.id ? 700 : 500,
                fontSize: 14,
                cursor: 'pointer',
                transition: 'all 0.15s',
              }}
            >
              {tab.label}
            </button>
          ))}
        </nav>

        {/* Theme toggle */}
        <button
          onClick={toggleTheme}
          aria-label="Toggle theme"
          style={{
            background: 'var(--bg-muted)',
            border: '1px solid var(--border)',
            borderRadius: '50%',
            width: 36,
            height: 36,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            color: 'var(--text-muted)',
            flexShrink: 0,
          }}
        >
          {theme === 'light' ? <Moon size={16} /> : <Sun size={16} />}
        </button>
      </div>
    </header>
  );
}
