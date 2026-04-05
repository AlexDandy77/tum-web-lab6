export type Frequency = 'daily' | 'weekly';

export type Category =
  | 'health'
  | 'fitness'
  | 'learning'
  | 'mindfulness'
  | 'productivity'
  | 'social'
  | 'other';

export interface Habit {
  id: string;
  name: string;
  description: string;
  category: Category;
  frequency: Frequency;
  createdAt: string; // YYYY-MM-DD
  liked: boolean;
  archivedAt: string | null;
}

export interface Completion {
  id: string;
  habitId: string;
  completedAt: string; // YYYY-MM-DD
}

export interface HabitStats {
  habitId: string;
  currentStreak: number;
  longestStreak: number;
  totalCompletions: number;
  completionRate: number; // 0–1, last 30 days
  completedToday: boolean;
}

export type FilterStatus = 'all' | 'completed' | 'missed' | 'favorites';

export interface FilterState {
  category: Category | 'all';
  status: FilterStatus;
  search: string;
}

export type Page = 'dashboard' | 'habits' | 'stats';
