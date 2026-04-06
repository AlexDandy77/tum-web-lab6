import { useContext, useCallback } from 'react';
import { StoreContext, ToastContext, ThemeContext } from './StoreContext';
import type { FilterState, Category } from '../types';

export type { Toast } from './StoreContext';
import { today } from '../lib/streaks';

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error('useStore must be used within StoreProvider');
  return ctx;
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within StoreProvider');
  return ctx;
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within StoreProvider');
  return ctx;
}

export function useActiveHabits() {
  const { habits } = useStore();
  return habits.filter((h) => !h.archivedAt);
}

export function useFilteredHabits() {
  const { habits, completions, filter } = useStore();
  const active = habits.filter((h) => !h.archivedAt);
  const t = today();

  return active.filter((h) => {
    if (filter.category !== 'all' && h.category !== filter.category) return false;
    if (filter.search) {
      const q = filter.search.toLowerCase();
      if (!h.name.toLowerCase().includes(q) && !h.description.toLowerCase().includes(q)) return false;
    }
    if (filter.status === 'favorites' && !h.liked) return false;
    if (filter.status === 'completed') {
      const done = completions.some((c) => c.habitId === h.id && c.completedAt === t);
      if (!done) return false;
    }
    if (filter.status === 'missed') {
      const done = completions.some((c) => c.habitId === h.id && c.completedAt === t);
      if (done) return false;
    }
    return true;
  });
}

export function useSetFilter() {
  const { dispatch } = useStore();
  return useCallback((filter: Partial<FilterState> & { category?: Category | 'all' }) => {
    dispatch({ type: 'SET_FILTER', filter });
  }, [dispatch]);
}
