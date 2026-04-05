import { useState } from 'react';
import { CheckCircle, Circle, Flame, Trophy, Plus } from 'lucide-react';
import { useActiveHabits, useStore, useToast } from '../context/StoreContext';
import { computeStats, today } from '../lib/streaks';
import { Badge } from '../components/shared/Badge';
import { ProgressRing } from '../components/shared/ProgressRing';
import { AddHabitModal } from '../components/habits/AddHabitModal';
import { Button } from '../components/shared/Button';
import { EmptyState } from '../components/shared/EmptyState';
import { format } from 'date-fns';

export function DashboardPage() {
  const habits = useActiveHabits();
  const { completions, dispatch } = useStore();
  const { showToast } = useToast();
  const [showModal, setShowModal] = useState(false);

  const todayDate = format(new Date(), 'EEEE, MMMM d');
  const t = today();

  const allStats = habits.map((h) => computeStats(h, completions));
  const completedCount = allStats.filter((s) => s.completedToday).length;
  const totalCount = habits.length;
  const progress = totalCount ? completedCount / totalCount : 0;

  // Top 3 by current streak
  const leaders = [...habits]
    .map((h) => ({ habit: h, stats: computeStats(h, completions) }))
    .filter((x) => x.stats.currentStreak > 0)
    .sort((a, b) => b.stats.currentStreak - a.stats.currentStreak)
    .slice(0, 3);

  function handleToggle(habitId: string) {
    const isDone = completions.some((c) => c.habitId === habitId && c.completedAt === t);
    dispatch({ type: 'TOGGLE_COMPLETION', habitId });
    if (!isDone) {
      const h = habits.find((x) => x.id === habitId);
      showToast(`✓ "${h?.name}" completed!`);
    }
  }

  return (
    <div style={{ maxWidth: 960, margin: '0 auto', padding: '24px 20px', flex: 1 }}>
      {/* Greeting */}
      <div style={{ marginBottom: 24 }}>
        <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: 13 }}>{todayDate}</p>
        <h1 style={{ margin: '4px 0 0', fontSize: 26, fontWeight: 800, color: 'var(--text)' }}>
          {completedCount === totalCount && totalCount > 0
            ? '🎉 All done for today!'
            : totalCount === 0
            ? 'Welcome to HabitBuilder'
            : `Let's build momentum!`}
        </h1>
      </div>

      {totalCount === 0 ? (
        <EmptyState
          icon={<Flame />}
          title="No habits yet"
          description="Add your first habit to start building streaks and tracking your progress."
          action={<Button onClick={() => setShowModal(true)}><Plus size={14} /> Add First Habit</Button>}
        />
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          {/* Progress ring */}
          <div style={{
            background: 'var(--bg-card)',
            borderRadius: 20,
            padding: 24,
            border: '1px solid var(--border)',
            display: 'flex',
            alignItems: 'center',
            gap: 24,
            gridColumn: '1 / -1',
          }}>
            <ProgressRing value={progress} size={110} stroke={10}>
              <span style={{ fontSize: 22, fontWeight: 800, color: 'var(--text)' }}>{completedCount}</span>
              <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>/ {totalCount}</span>
            </ProgressRing>
            <div>
              <p style={{ margin: 0, fontSize: 20, fontWeight: 800, color: 'var(--text)' }}>
                {Math.round(progress * 100)}% complete
              </p>
              <p style={{ margin: '4px 0 0', color: 'var(--text-muted)', fontSize: 14 }}>
                {totalCount - completedCount > 0
                  ? `${totalCount - completedCount} habit${totalCount - completedCount !== 1 ? 's' : ''} remaining today`
                  : 'You crushed all your habits today!'}
              </p>
            </div>
          </div>

          {/* Today's habits */}
          <div style={{
            background: 'var(--bg-card)',
            borderRadius: 20,
            padding: 20,
            border: '1px solid var(--border)',
          }}>
            <h2 style={{ margin: '0 0 14px', fontSize: 15, fontWeight: 700, color: 'var(--text)' }}>
              Today's Checklist
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {habits.slice(0, 8).map((h) => {
                const done = completions.some((c) => c.habitId === h.id && c.completedAt === t);
                return (
                  <button
                    key={h.id}
                    onClick={() => handleToggle(h.id)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 10,
                      background: done ? 'var(--bg-muted)' : 'transparent',
                      border: '1px solid var(--border)',
                      borderRadius: 10,
                      padding: '8px 12px',
                      cursor: 'pointer',
                      textAlign: 'left',
                      width: '100%',
                      transition: 'all 0.15s',
                    }}
                  >
                    {done
                      ? <CheckCircle size={18} style={{ color: 'var(--primary)', flexShrink: 0 }} />
                      : <Circle size={18} style={{ color: 'var(--text-subtle)', flexShrink: 0 }} />
                    }
                    <span style={{
                      fontSize: 13,
                      fontWeight: 600,
                      color: done ? 'var(--text-muted)' : 'var(--text)',
                      textDecoration: done ? 'line-through' : 'none',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}>
                      {h.name}
                    </span>
                    <div style={{ marginLeft: 'auto', flexShrink: 0 }}>
                      <Badge category={h.category} />
                    </div>
                  </button>
                );
              })}
              {habits.length > 8 && (
                <p style={{ margin: '4px 0 0', fontSize: 12, color: 'var(--text-subtle)', textAlign: 'center' }}>
                  +{habits.length - 8} more in the Habits page
                </p>
              )}
            </div>
          </div>

          {/* Streak leaders */}
          <div style={{
            background: 'var(--bg-card)',
            borderRadius: 20,
            padding: 20,
            border: '1px solid var(--border)',
          }}>
            <h2 style={{ margin: '0 0 14px', fontSize: 15, fontWeight: 700, color: 'var(--text)', display: 'flex', alignItems: 'center', gap: 6 }}>
              <Trophy size={16} style={{ color: '#f59e0b' }} />
              Streak Leaders
            </h2>
            {leaders.length === 0 ? (
              <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>Complete habits to build streaks!</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {leaders.map(({ habit, stats }, idx) => (
                  <div key={habit.id} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{
                      width: 24,
                      height: 24,
                      borderRadius: '50%',
                      background: idx === 0 ? '#f59e0b' : idx === 1 ? '#94a3b8' : '#cd7c2f',
                      color: '#fff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 11,
                      fontWeight: 800,
                      flexShrink: 0,
                    }}>
                      {idx + 1}
                    </span>
                    <span style={{ flex: 1, fontSize: 13, fontWeight: 600, color: 'var(--text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {habit.name}
                    </span>
                    <span style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 3,
                      fontSize: 13,
                      fontWeight: 800,
                      color: '#f97316',
                    }}>
                      <Flame size={14} className="animate-flame" />
                      {stats.currentStreak}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {showModal && <AddHabitModal onClose={() => setShowModal(false)} />}
    </div>
  );
}
