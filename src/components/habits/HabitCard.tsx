import { useState } from 'react';
import { Heart, Trash2, CheckCircle, Circle, Flame, Zap, Pencil } from 'lucide-react';
import type { Habit } from '../../types';
import { useStore, useToast } from '../../context/StoreContext';
import { computeStats } from '../../lib/streaks';
import { Badge } from '../shared/Badge';
import { Modal } from '../shared/Modal';
import { Button } from '../shared/Button';
import { EditHabitModal } from './EditHabitModal';

interface Props {
  habit: Habit;
}

export function HabitCard({ habit }: Props) {
  const { completions, dispatch } = useStore();
  const { showToast } = useToast();
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [checkAnim, setCheckAnim] = useState(false);

  const stats = computeStats(habit, completions);

  function handleToggle() {
    dispatch({ type: 'TOGGLE_COMPLETION', habitId: habit.id });
    if (!stats.completedToday) {
      setCheckAnim(true);
      setTimeout(() => setCheckAnim(false), 400);
      showToast(`✓ "${habit.name}" completed!`);
    }
  }

  function handleLike() {
    dispatch({ type: 'TOGGLE_LIKE', id: habit.id });
    showToast(habit.liked ? 'Removed from favorites' : 'Added to favorites', 'info');
  }

  function handleDelete() {
    dispatch({ type: 'DELETE_HABIT', id: habit.id });
    showToast(`"${habit.name}" deleted`, 'error');
    setConfirmDelete(false);
  }

  const freqLabel = habit.frequency === 'daily' ? 'Daily' : 'Weekly';

  return (
    <>
      <div
        className="animate-fade-in"
        style={{
          background: 'var(--bg-card)',
          border: `1.5px solid ${stats.completedToday ? 'var(--primary)' : 'var(--border)'}`,
          borderRadius: 16,
          padding: '16px 18px',
          display: 'flex',
          flexDirection: 'column',
          gap: 10,
          transition: 'border-color 0.2s, box-shadow 0.2s',
          boxShadow: stats.completedToday ? '0 0 0 3px var(--primary-light)' : 'none',
        }}
      >
        {/* Top row: check + name */}
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, minWidth: 0 }}>
          {/* Check button */}
          <button
            onClick={handleToggle}
            aria-label={stats.completedToday ? 'Unmark habit' : 'Complete habit'}
            className={checkAnim ? 'animate-check' : undefined}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: 0,
              color: stats.completedToday ? 'var(--primary)' : 'var(--text-subtle)',
              flexShrink: 0,
              marginTop: 1,
              transition: 'color 0.15s',
            }}
          >
            {stats.completedToday
              ? <CheckCircle size={22} strokeWidth={2.5} />
              : <Circle size={22} strokeWidth={1.5} />
            }
          </button>

          {/* Name + description */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{
              margin: 0,
              fontWeight: 700,
              fontSize: 15,
              color: 'var(--text)',
              textDecoration: stats.completedToday ? 'line-through' : 'none',
              textDecorationColor: 'var(--text-subtle)',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}>
              {habit.name}
            </p>
            {habit.description && (
              <p style={{
                margin: '2px 0 0',
                fontSize: 13,
                color: 'var(--text-muted)',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
              }}>
                {habit.description}
              </p>
            )}
          </div>
        </div>

        {/* Bottom row: badges + actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
          <Badge category={habit.category} />

          <span style={{
            fontSize: 11,
            color: 'var(--text-subtle)',
            background: 'var(--bg-muted)',
            padding: '2px 8px',
            borderRadius: 9999,
            fontWeight: 500,
          }}>
            {freqLabel}
          </span>

          {stats.currentStreak > 0 && (
            <span style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 3,
              fontSize: 12,
              fontWeight: 700,
              color: '#f97316',
              background: 'rgba(249,115,22,0.12)',
              padding: '2px 8px',
              borderRadius: 9999,
            }}>
              <Flame size={12} className="animate-flame" />
              {stats.currentStreak}
            </span>
          )}

          {stats.totalCompletions > 0 && (
            <span style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 3,
              fontSize: 12,
              color: 'var(--text-subtle)',
            }}>
              <Zap size={11} />
              {Math.round(stats.completionRate * 100)}%
            </span>
          )}

          {/* Actions pushed to the right */}
          <div style={{ display: 'flex', gap: 4, marginLeft: 'auto', flexShrink: 0 }}>
            <button
              onClick={handleLike}
              aria-label={habit.liked ? 'Unfavorite' : 'Favorite'}
              style={{
                background: habit.liked ? 'rgba(239,68,68,0.1)' : 'var(--bg-muted)',
                border: 'none',
                borderRadius: 8,
                width: 30,
                height: 30,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                color: habit.liked ? '#ef4444' : 'var(--text-subtle)',
                transition: 'all 0.15s',
              }}
            >
              <Heart size={14} fill={habit.liked ? '#ef4444' : 'none'} strokeWidth={2} />
            </button>
            <button
              onClick={() => setShowEdit(true)}
              aria-label="Edit habit"
              style={{
                background: 'var(--bg-muted)',
                border: 'none',
                borderRadius: 8,
                width: 30,
                height: 30,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                color: 'var(--text-subtle)',
                transition: 'all 0.15s',
              }}
            >
              <Pencil size={13} />
            </button>
            <button
              onClick={() => setConfirmDelete(true)}
              aria-label="Delete habit"
              style={{
                background: 'var(--bg-muted)',
                border: 'none',
                borderRadius: 8,
                width: 30,
                height: 30,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                color: 'var(--text-subtle)',
                transition: 'all 0.15s',
              }}
            >
              <Trash2 size={14} />
            </button>
          </div>
        </div>
      </div>

      {/* Edit modal */}
      {showEdit && <EditHabitModal habit={habit} onClose={() => setShowEdit(false)} />}

      {/* Confirm delete modal */}
      {confirmDelete && (
        <Modal title="Delete Habit" onClose={() => setConfirmDelete(false)} width={400}>
          <p style={{ color: 'var(--text-muted)', marginBottom: 20 }}>
            Are you sure you want to delete <strong style={{ color: 'var(--text)' }}>{habit.name}</strong>?
            This will remove all completion history.
          </p>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
            <Button variant="secondary" onClick={() => setConfirmDelete(false)}>Cancel</Button>
            <Button variant="danger" onClick={handleDelete}>Delete</Button>
          </div>
        </Modal>
      )}
    </>
  );
}
