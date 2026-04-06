import { createContext, useContext, useReducer, useEffect, useCallback, useState } from 'react';
import type { ReactNode } from 'react';
import type { Habit, Completion, FilterState, Category } from '../types';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { today } from '../lib/streaks';

// ── Actions ──────────────────────────────────────────────────────────────────

type Action =
  | { type: 'ADD_HABIT'; habit: Habit }
  | { type: 'UPDATE_HABIT'; habit: Habit }
  | { type: 'DELETE_HABIT'; id: string }
  | { type: 'TOGGLE_LIKE'; id: string }
  | { type: 'TOGGLE_COMPLETION'; habitId: string }
  | { type: 'REORDER_HABITS'; fromId: string; toId: string }
  | { type: 'SET_FILTER'; filter: Partial<FilterState> }
  | { type: 'SET_HABITS'; habits: Habit[] }
  | { type: 'SET_COMPLETIONS'; completions: Completion[] };

// ── State ─────────────────────────────────────────────────────────────────────

interface StoreState {
  habits: Habit[];
  completions: Completion[];
  filter: FilterState;
}

const initialFilter: FilterState = {
  category: 'all',
  status: 'all',
  search: '',
};

function reducer(state: StoreState, action: Action): StoreState {
  switch (action.type) {
    case 'SET_HABITS':
      return { ...state, habits: action.habits };
    case 'SET_COMPLETIONS':
      return { ...state, completions: action.completions };

    case 'ADD_HABIT':
      return { ...state, habits: [action.habit, ...state.habits] };

    case 'UPDATE_HABIT':
      return {
        ...state,
        habits: state.habits.map((h) => h.id === action.habit.id ? action.habit : h),
      };

    case 'REORDER_HABITS': {
      const list = [...state.habits];
      const fromIdx = list.findIndex((h) => h.id === action.fromId);
      const toIdx = list.findIndex((h) => h.id === action.toId);
      if (fromIdx === -1 || toIdx === -1 || fromIdx === toIdx) return state;
      const [moved] = list.splice(fromIdx, 1);
      list.splice(toIdx, 0, moved);
      return { ...state, habits: list };
    }

    case 'DELETE_HABIT':
      return {
        ...state,
        habits: state.habits.map((h) =>
          h.id === action.id ? { ...h, archivedAt: today() } : h
        ),
      };

    case 'TOGGLE_LIKE':
      return {
        ...state,
        habits: state.habits.map((h) =>
          h.id === action.id ? { ...h, liked: !h.liked } : h
        ),
      };

    case 'TOGGLE_COMPLETION': {
      const t = today();
      const existing = state.completions.find(
        (c) => c.habitId === action.habitId && c.completedAt === t
      );
      if (existing) {
        return {
          ...state,
          completions: state.completions.filter((c) => c.id !== existing.id),
        };
      }
      const newCompletion: Completion = {
        id: crypto.randomUUID(),
        habitId: action.habitId,
        completedAt: t,
      };
      return { ...state, completions: [...state.completions, newCompletion] };
    }

    case 'SET_FILTER':
      return { ...state, filter: { ...state.filter, ...action.filter } };

    default:
      return state;
  }
}

// ── Context ───────────────────────────────────────────────────────────────────

export interface ExportData {
  version: 1;
  exportedAt: string;
  habits: Habit[];
  completions: Completion[];
}

interface StoreContextValue {
  habits: Habit[];
  completions: Completion[];
  filter: FilterState;
  dispatch: React.Dispatch<Action>;
  exportData: () => void;
  importData: (json: string) => string | null; // returns error string or null on success
}

const StoreContext = createContext<StoreContextValue | null>(null);

// ── Toast ─────────────────────────────────────────────────────────────────────

export interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
  exiting?: boolean;
}

interface ToastContextValue {
  toasts: Toast[];
  showToast: (message: string, type?: Toast['type']) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

// ── Theme ─────────────────────────────────────────────────────────────────────

interface ThemeContextValue {
  theme: 'light' | 'dark';
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

// ── Provider ──────────────────────────────────────────────────────────────────

export function StoreProvider({ children }: { children: ReactNode }) {
  const [storedHabits, setStoredHabits] = useLocalStorage<Habit[]>('habit_builder_habits', []);
  const [storedCompletions, setStoredCompletions] = useLocalStorage<Completion[]>('habit_builder_completions', []);
  const [storedTheme, setStoredTheme] = useLocalStorage<'light' | 'dark'>('habit_builder_theme', 'light');
  const [toasts, setToasts] = useState<Toast[]>([]);

  const [state, dispatch] = useReducer(reducer, {
    habits: storedHabits,
    completions: storedCompletions,
    filter: initialFilter,
  });

  // Sync from localStorage → state on mount
  useEffect(() => {
    dispatch({ type: 'SET_HABITS', habits: storedHabits });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Sync state → localStorage
  useEffect(() => {
    setStoredHabits(state.habits);
  }, [state.habits, setStoredHabits]);

  useEffect(() => {
    setStoredCompletions(state.completions);
  }, [state.completions, setStoredCompletions]);

  // Apply theme to <html>
  useEffect(() => {
    const html = document.documentElement;
    if (storedTheme === 'dark') {
      html.classList.add('dark');
    } else {
      html.classList.remove('dark');
    }
  }, [storedTheme]);

  const toggleTheme = useCallback(() => {
    setStoredTheme((t) => (t === 'light' ? 'dark' : 'light'));
  }, [setStoredTheme]);

  const exportData = useCallback(() => {
    const payload: ExportData = {
      version: 1,
      exportedAt: new Date().toISOString(),
      habits: state.habits,
      completions: state.completions,
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `habitbuilder-export-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }, [state.habits, state.completions]);

  const importData = useCallback((json: string): string | null => {
    try {
      const parsed = JSON.parse(json) as Partial<ExportData>;
      if (parsed.version !== 1) return 'Unsupported file version.';
      if (!Array.isArray(parsed.habits) || !Array.isArray(parsed.completions)) {
        return 'Invalid file format: missing habits or completions.';
      }
      dispatch({ type: 'SET_HABITS', habits: parsed.habits });
      dispatch({ type: 'SET_COMPLETIONS', completions: parsed.completions });
      return null;
    } catch {
      return 'Could not parse file. Make sure it is a valid HabitBuilder JSON export.';
    }
  }, [dispatch]);

  const showToast = useCallback((message: string, type: Toast['type'] = 'success') => {
    const id = crypto.randomUUID();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.map((t) => t.id === id ? { ...t, exiting: true } : t));
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, 280);
    }, 3000);
  }, []);

  return (
    <ThemeContext.Provider value={{ theme: storedTheme, toggleTheme }}>
      <ToastContext.Provider value={{ toasts, showToast }}>
        <StoreContext.Provider value={{ habits: state.habits, completions: state.completions, filter: state.filter, dispatch, exportData, importData }}>
          {children}
        </StoreContext.Provider>
      </ToastContext.Provider>
    </ThemeContext.Provider>
  );
}

// ── Hooks ─────────────────────────────────────────────────────────────────────

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
