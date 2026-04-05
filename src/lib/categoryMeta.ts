import type { Category } from '../types';

export interface CategoryMeta {
  label: string;
  color: string;       // CSS var-based badge bg
  textColor: string;   // CSS var-based badge text
  dot: string;         // solid dot color class (Tailwind)
}

export const CATEGORY_META: Record<Category, CategoryMeta> = {
  health: {
    label: 'Health',
    color: 'rgba(34, 197, 94, 0.15)',
    textColor: '#16a34a',
    dot: '#22c55e',
  },
  fitness: {
    label: 'Fitness',
    color: 'rgba(249, 115, 22, 0.15)',
    textColor: '#ea580c',
    dot: '#f97316',
  },
  learning: {
    label: 'Learning',
    color: 'rgba(99, 102, 241, 0.15)',
    textColor: '#4f46e5',
    dot: '#6366f1',
  },
  mindfulness: {
    label: 'Mindfulness',
    color: 'rgba(168, 85, 247, 0.15)',
    textColor: '#9333ea',
    dot: '#a855f7',
  },
  productivity: {
    label: 'Productivity',
    color: 'rgba(20, 184, 166, 0.15)',
    textColor: '#0d9488',
    dot: '#14b8a6',
  },
  social: {
    label: 'Social',
    color: 'rgba(236, 72, 153, 0.15)',
    textColor: '#db2777',
    dot: '#ec4899',
  },
  other: {
    label: 'Other',
    color: 'rgba(100, 116, 139, 0.15)',
    textColor: '#475569',
    dot: '#64748b',
  },
};

export const ALL_CATEGORIES: Category[] = [
  'health', 'fitness', 'learning', 'mindfulness', 'productivity', 'social', 'other',
];
