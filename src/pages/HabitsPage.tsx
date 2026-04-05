import { useState, useEffect, useRef } from 'react';
import { Plus, Search, ListChecks, GripVertical } from 'lucide-react';
import { useFilteredHabits, useStore, useSetFilter } from '../context/StoreContext';
import { CATEGORY_META, ALL_CATEGORIES } from '../lib/categoryMeta';
import type { Category, FilterStatus, Habit } from '../types';
import { HabitCard } from '../components/habits/HabitCard';
import { AddHabitModal } from '../components/habits/AddHabitModal';
import { Button } from '../components/shared/Button';
import { EmptyState } from '../components/shared/EmptyState';

const STATUS_TABS: { id: FilterStatus; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'completed', label: 'Completed' },
  { id: 'missed', label: 'Missed' },
  { id: 'favorites', label: 'Favorites' },
];

function DraggableList({ habits }: { habits: Habit[] }) {
  const { dispatch } = useStore();
  const dragId = useRef<string | null>(null);
  const [overId, setOverId] = useState<string | null>(null);

  function onDragStart(id: string) {
    dragId.current = id;
  }

  function onDragOver(e: React.DragEvent, id: string) {
    e.preventDefault();
    if (dragId.current !== id) setOverId(id);
  }

  function onDrop(toId: string) {
    if (dragId.current && dragId.current !== toId) {
      dispatch({ type: 'REORDER_HABITS', fromId: dragId.current, toId });
    }
    dragId.current = null;
    setOverId(null);
  }

  function onDragEnd() {
    dragId.current = null;
    setOverId(null);
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      {habits.map((h) => {
        const isDragging = dragId.current === h.id;
        const isOver = overId === h.id;
        return (
          <div
            key={h.id}
            draggable
            onDragStart={() => onDragStart(h.id)}
            onDragOver={(e) => onDragOver(e, h.id)}
            onDrop={() => onDrop(h.id)}
            onDragEnd={onDragEnd}
            style={{
              display: 'flex',
              alignItems: 'stretch',
              gap: 0,
              opacity: isDragging ? 0.4 : 1,
              borderRadius: 16,
              outline: isOver ? '2px solid var(--primary)' : '2px solid transparent',
              outlineOffset: 2,
              transition: 'opacity 0.15s, outline-color 0.15s',
              cursor: 'default',
            }}
          >
            {/* Drag handle */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                paddingRight: 6,
                paddingLeft: 2,
                color: 'var(--text-subtle)',
                cursor: 'grab',
                flexShrink: 0,
                touchAction: 'none',
              }}
              title="Drag to reorder"
            >
              <GripVertical size={16} />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <HabitCard habit={h} />
            </div>
          </div>
        );
      })}
    </div>
  );
}

export function HabitsPage() {
  const [showModal, setShowModal] = useState(false);
  const [searchInput, setSearchInput] = useState('');
  const { filter } = useStore();
  const setFilter = useSetFilter();
  const filtered = useFilteredHabits();

  const isFiltered = filter.status !== 'all' || filter.category !== 'all' || filter.search.length > 0;

  // Keyboard shortcut: N to open add modal
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'n' && !e.ctrlKey && !e.metaKey && !(e.target instanceof HTMLInputElement) && !(e.target instanceof HTMLTextAreaElement)) {
        setShowModal(true);
      }
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, []);

  // Debounce search
  useEffect(() => {
    const t = setTimeout(() => setFilter({ search: searchInput }), 250);
    return () => clearTimeout(t);
  }, [searchInput, setFilter]);

  return (
    <div style={{ maxWidth: 960, margin: '0 auto', padding: '24px 20px', flex: 1 }}>
      {/* Header row */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20, gap: 12, flexWrap: 'wrap' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 24, fontWeight: 800, color: 'var(--text)' }}>My Habits</h1>
          <p style={{ margin: '2px 0 0', color: 'var(--text-muted)', fontSize: 13 }}>
            {filtered.length} habit{filtered.length !== 1 ? 's' : ''}
            {filter.status !== 'all' || filter.category !== 'all' || filter.search ? ' matching filters' : ' total'}
          </p>
        </div>
        <Button variant="primary" onClick={() => setShowModal(true)}>
          <Plus size={16} />
          New Habit
          <span style={{ fontSize: 11, opacity: 0.7, background: 'rgba(255,255,255,0.2)', padding: '1px 5px', borderRadius: 4 }}>N</span>
        </Button>
      </div>

      {/* Filter bar */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 20 }}>
        {/* Search */}
        <div style={{ position: 'relative' }}>
          <Search size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-subtle)' }} />
          <input
            type="search"
            placeholder="Search habits…"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            aria-label="Search habits"
            style={{
              width: '100%',
              padding: '9px 12px 9px 36px',
              borderRadius: 12,
              border: '1.5px solid var(--border)',
              background: 'var(--bg-card)',
              color: 'var(--text)',
              fontSize: 14,
              outline: 'none',
            }}
          />
        </div>

        {/* Status tabs */}
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {STATUS_TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilter({ status: tab.id })}
              style={{
                padding: '5px 14px',
                borderRadius: 9999,
                border: `1.5px solid ${filter.status === tab.id ? 'var(--primary)' : 'var(--border)'}`,
                background: filter.status === tab.id ? 'var(--primary-light)' : 'var(--bg-card)',
                color: filter.status === tab.id ? 'var(--primary)' : 'var(--text-muted)',
                fontSize: 13,
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.15s',
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Category pills */}
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          <button
            onClick={() => setFilter({ category: 'all' })}
            style={{
              padding: '4px 12px',
              borderRadius: 9999,
              border: `1.5px solid ${filter.category === 'all' ? 'var(--primary)' : 'var(--border)'}`,
              background: filter.category === 'all' ? 'var(--primary-light)' : 'transparent',
              color: filter.category === 'all' ? 'var(--primary)' : 'var(--text-subtle)',
              fontSize: 12,
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.15s',
            }}
          >
            All categories
          </button>
          {ALL_CATEGORIES.map((cat) => {
            const meta = CATEGORY_META[cat];
            const selected = filter.category === cat;
            return (
              <button
                key={cat}
                onClick={() => setFilter({ category: (filter.category === cat ? 'all' : cat) as Category | 'all' })}
                style={{
                  padding: '4px 12px',
                  borderRadius: 9999,
                  border: `1.5px solid ${selected ? meta.textColor : 'var(--border)'}`,
                  background: selected ? meta.color : 'transparent',
                  color: selected ? meta.textColor : 'var(--text-subtle)',
                  fontSize: 12,
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.15s',
                }}
              >
                {meta.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Habits list */}
      {filtered.length === 0 ? (
        <EmptyState
          icon={<ListChecks />}
          title="No habits found"
          description={isFiltered
            ? 'Try adjusting your filters.'
            : 'Start building better habits! Press N or click the button above.'}
          action={!isFiltered
            ? <Button onClick={() => setShowModal(true)}><Plus size={14} /> New Habit</Button>
            : undefined
          }
        />
      ) : isFiltered ? (
        // When filtered: plain grid, no drag handles (order change wouldn't persist correctly)
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 14 }}>
          {filtered.map((h) => <HabitCard key={h.id} habit={h} />)}
        </div>
      ) : (
        // No filters: draggable single-column list
        <>
          <p style={{ margin: '0 0 10px', fontSize: 12, color: 'var(--text-subtle)', display: 'flex', alignItems: 'center', gap: 4 }}>
            <GripVertical size={13} /> Drag the handle to reorder
          </p>
          <DraggableList habits={filtered} />
        </>
      )}

      {showModal && <AddHabitModal onClose={() => setShowModal(false)} />}
    </div>
  );
}
