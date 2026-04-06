import { useMemo } from 'react';
import { Flame, Zap, CheckCircle, BarChart2 } from 'lucide-react';
import { useActiveHabits, useStore } from '../context/StoreContext';
import { computeStats } from '../lib/streaks';
import { CATEGORY_META, ALL_CATEGORIES } from '../lib/categoryMeta';
import { Badge } from '../components/shared/Badge';
import { EmptyState } from '../components/shared/EmptyState';

function StatCard({ label, value, icon, color }: { label: string; value: string | number; icon: React.ReactNode; color: string }) {
  return (
    <div style={{
      background: 'var(--bg-card)',
      borderRadius: 16,
      padding: '18px 20px',
      border: '1px solid var(--border)',
      display: 'flex',
      alignItems: 'center',
      gap: 14,
    }}>
      <div style={{
        width: 44,
        height: 44,
        borderRadius: 12,
        background: `${color}22`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color,
        flexShrink: 0,
      }}>
        {icon}
      </div>
      <div>
        <p style={{ margin: 0, fontSize: 24, fontWeight: 800, color: 'var(--text)' }}>{value}</p>
        <p style={{ margin: 0, fontSize: 12, color: 'var(--text-muted)', fontWeight: 500 }}>{label}</p>
      </div>
    </div>
  );
}

export function StatsPage() {
  const habits = useActiveHabits();
  const { completions } = useStore();

  const allStats = useMemo(() =>
    habits.map((h) => ({ habit: h, stats: computeStats(h, completions) })),
    [habits, completions]
  );

  const totalCompletions = allStats.reduce((sum, { stats }) => sum + stats.totalCompletions, 0);
  const bestStreak = Math.max(0, ...allStats.map(({ stats }) => stats.longestStreak));
  const avgRate = allStats.length
    ? Math.round((allStats.reduce((sum, { stats }) => sum + stats.completionRate, 0) / allStats.length) * 100)
    : 0;

  // Category breakdown
  const catData = useMemo(() => ALL_CATEGORIES.map((cat) => {
    const catHabits = allStats.filter(({ habit }) => habit.category === cat);
    const count = catHabits.length;
    const done = catHabits.filter(({ stats }) => stats.completedToday).length;
    return { cat, count, done };
  }).filter((x) => x.count > 0), [allStats]);

  const maxCatCount = Math.max(1, ...catData.map((x) => x.count));

  // Sort table by current streak desc
  const sorted = [...allStats].sort((a, b) => b.stats.currentStreak - a.stats.currentStreak);

  if (habits.length === 0) {
    return (
      <div style={{ maxWidth: 960, margin: '0 auto', padding: '24px 20px', flex: 1 }}>
        <EmptyState
          icon={<BarChart2 />}
          title="No stats yet"
          description="Add some habits and start tracking to see your statistics here."
        />
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 960, margin: '0 auto', padding: '24px 20px', flex: 1 }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ margin: 0, fontSize: 24, fontWeight: 800, color: 'var(--text)' }}>Statistics</h1>
        <p style={{ margin: '2px 0 0', color: 'var(--text-muted)', fontSize: 13 }}>Your habit tracking overview</p>
      </div>

      {/* Summary cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 12, marginBottom: 24 }}>
        <StatCard label="Active Habits" value={habits.length} icon={<CheckCircle size={20} />} color="#7c3aed" />
        <StatCard label="Total Completions" value={totalCompletions} icon={<Zap size={20} />} color="#2563eb" />
        <StatCard label="Best Streak" value={`${bestStreak} days`} icon={<Flame size={20} />} color="#f97316" />
        <StatCard label="Avg Completion Rate" value={`${avgRate}%`} icon={<BarChart2 size={20} />} color="#22c55e" />
      </div>

      <div className="stats-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 16, alignItems: 'start' }}>
        {/* Category breakdown */}
        <div style={{
          background: 'var(--bg-card)',
          borderRadius: 20,
          padding: 20,
          border: '1px solid var(--border)',
        }}>
          <h2 style={{ margin: '0 0 16px', fontSize: 15, fontWeight: 700, color: 'var(--text)' }}>By Category</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {catData.map(({ cat, count }) => {
              const meta = CATEGORY_META[cat];
              const pct = count / maxCatCount;
              return (
                <div key={cat}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                    <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)' }}>{meta.label}</span>
                    <span style={{ fontSize: 12, fontWeight: 700, color: meta.textColor }}>{count}</span>
                  </div>
                  <div style={{ height: 8, borderRadius: 4, background: 'var(--bg-muted)', overflow: 'hidden' }}>
                    <div style={{
                      height: '100%',
                      width: `${pct * 100}%`,
                      background: meta.dot,
                      borderRadius: 4,
                      transition: 'width 0.6s ease',
                    }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Habit stats table */}
        <div style={{
          background: 'var(--bg-card)',
          borderRadius: 20,
          padding: 20,
          border: '1px solid var(--border)',
          overflowX: 'auto',
        }}>
          <h2 style={{ margin: '0 0 16px', fontSize: 15, fontWeight: 700, color: 'var(--text)' }}>Habit Breakdown</h2>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr>
                {['Habit', 'Category', 'Streak', 'Best', 'Rate', 'Total'].map((col) => (
                  <th key={col} style={{
                    textAlign: col === 'Habit' || col === 'Category' ? 'left' : 'center',
                    padding: '6px 8px',
                    color: 'var(--text-muted)',
                    fontWeight: 600,
                    borderBottom: '1px solid var(--border)',
                    whiteSpace: 'nowrap',
                  }}>
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {sorted.map(({ habit, stats }) => (
                <tr key={habit.id} style={{ borderBottom: '1px solid var(--border)' }}>
                  <td style={{ padding: '10px 8px', fontWeight: 600, color: 'var(--text)', maxWidth: 160 }}>
                    <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', display: 'block' }}>
                      {habit.name}
                    </span>
                  </td>
                  <td style={{ padding: '10px 8px' }}>
                    <Badge category={habit.category} />
                  </td>
                  <td style={{ padding: '10px 8px', textAlign: 'center' }}>
                    {stats.currentStreak > 0 ? (
                      <span style={{ color: '#f97316', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 3 }}>
                        <Flame size={12} />
                        {stats.currentStreak}
                      </span>
                    ) : (
                      <span style={{ color: 'var(--text-subtle)' }}>—</span>
                    )}
                  </td>
                  <td style={{ padding: '10px 8px', textAlign: 'center', color: 'var(--text-muted)', fontWeight: 600 }}>
                    {stats.longestStreak > 0 ? stats.longestStreak : '—'}
                  </td>
                  <td style={{ padding: '10px 8px', textAlign: 'center' }}>
                    <span style={{
                      color: stats.completionRate >= 0.7 ? '#22c55e' : stats.completionRate >= 0.4 ? '#f59e0b' : '#ef4444',
                      fontWeight: 700,
                    }}>
                      {Math.round(stats.completionRate * 100)}%
                    </span>
                  </td>
                  <td style={{ padding: '10px 8px', textAlign: 'center', color: 'var(--text-muted)', fontWeight: 600 }}>
                    {stats.totalCompletions}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
