import { useState } from 'react';
import type { FormEvent } from 'react';
import type { Category, Frequency, Habit } from '../../types';
import { ALL_CATEGORIES, CATEGORY_META } from '../../lib/categoryMeta';
import { Button } from '../shared/Button';
import { today } from '../../lib/streaks';

interface Props {
  onSubmit: (habit: Habit) => void;
  onCancel: () => void;
  initial?: Habit;
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '10px 14px',
  borderRadius: 12,
  border: '1.5px solid var(--border)',
  background: 'var(--bg-muted)',
  color: 'var(--text)',
  fontSize: 14,
  outline: 'none',
  transition: 'border-color 0.15s',
};

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontSize: 13,
  fontWeight: 600,
  color: 'var(--text-muted)',
  marginBottom: 6,
};

export function HabitForm({ onSubmit, onCancel, initial }: Props) {
  const [name, setName] = useState(initial?.name ?? '');
  const [description, setDescription] = useState(initial?.description ?? '');
  const [category, setCategory] = useState<Category>(initial?.category ?? 'health');
  const [frequency, setFrequency] = useState<Frequency>(initial?.frequency ?? 'daily');
  const [errors, setErrors] = useState<{ name?: string }>({});

  function validate() {
    const e: { name?: string } = {};
    if (!name.trim()) e.name = 'Name is required';
    setErrors(e);
    return !Object.keys(e).length;
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!validate()) return;

    const habit: Habit = initial
      ? { ...initial, name: name.trim(), description: description.trim(), category, frequency }
      : {
          id: crypto.randomUUID(),
          name: name.trim(),
          description: description.trim(),
          category,
          frequency,
          createdAt: today(),
          liked: false,
          archivedAt: null,
        };

    onSubmit(habit);
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
      {/* Name */}
      <div>
        <label style={labelStyle}>Habit Name *</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Drink 2L of water"
          style={{ ...inputStyle, borderColor: errors.name ? '#ef4444' : undefined }}
          autoFocus
        />
        {errors.name && <p style={{ margin: '4px 0 0', fontSize: 12, color: '#ef4444' }}>{errors.name}</p>}
      </div>

      {/* Description */}
      <div>
        <label style={labelStyle}>Description</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Optional note about this habit…"
          rows={2}
          style={{ ...inputStyle, resize: 'vertical', fontFamily: 'inherit' }}
        />
      </div>

      {/* Category */}
      <div>
        <label style={labelStyle}>Category</label>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {ALL_CATEGORIES.map((cat) => {
            const meta = CATEGORY_META[cat];
            const selected = category === cat;
            return (
              <button
                key={cat}
                type="button"
                onClick={() => setCategory(cat)}
                style={{
                  padding: '5px 14px',
                  borderRadius: 9999,
                  border: `1.5px solid ${selected ? meta.textColor : 'var(--border)'}`,
                  background: selected ? meta.color : 'transparent',
                  color: selected ? meta.textColor : 'var(--text-muted)',
                  fontSize: 13,
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

      {/* Frequency */}
      <div>
        <label style={labelStyle}>Frequency</label>
        <div style={{ display: 'flex', gap: 10 }}>
          {(['daily', 'weekly'] as Frequency[]).map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => setFrequency(f)}
              style={{
                flex: 1,
                padding: '8px 0',
                borderRadius: 12,
                border: `1.5px solid ${frequency === f ? 'var(--primary)' : 'var(--border)'}`,
                background: frequency === f ? 'var(--primary-light)' : 'transparent',
                color: frequency === f ? 'var(--primary)' : 'var(--text-muted)',
                fontSize: 14,
                fontWeight: 600,
                cursor: 'pointer',
                textTransform: 'capitalize',
                transition: 'all 0.15s',
              }}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 4 }}>
        <Button type="button" variant="secondary" onClick={onCancel}>Cancel</Button>
        <Button type="submit" variant="primary">
          {initial ? 'Save Changes' : 'Add Habit'}
        </Button>
      </div>
    </form>
  );
}
