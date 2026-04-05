import { format, subDays, getISOWeek, getYear, parseISO } from 'date-fns';
import type { Habit, Completion, HabitStats } from '../types';

const today = () => format(new Date(), 'yyyy-MM-dd');

function getWeekKey(dateStr: string): string {
  const d = parseISO(dateStr);
  return `${getYear(d)}-W${String(getISOWeek(d)).padStart(2, '0')}`;
}

function currentWeekKey(): string {
  return getWeekKey(today());
}

function completedToday(habitId: string, completions: Completion[]): boolean {
  const t = today();
  return completions.some((c) => c.habitId === habitId && c.completedAt === t);
}

function completedThisWeek(habitId: string, completions: Completion[]): boolean {
  const wk = currentWeekKey();
  return completions
    .filter((c) => c.habitId === habitId)
    .some((c) => getWeekKey(c.completedAt) === wk);
}

function calcDailyStreak(habitId: string, completions: Completion[]): number {
  const dates = new Set(
    completions.filter((c) => c.habitId === habitId).map((c) => c.completedAt)
  );

  const t = today();
  // If not completed today, streak might still be alive from yesterday
  let streak = 0;
  let cursor = dates.has(t) ? t : format(subDays(new Date(), 1), 'yyyy-MM-dd');

  while (dates.has(cursor)) {
    streak++;
    cursor = format(subDays(parseISO(cursor), 1), 'yyyy-MM-dd');
  }
  return streak;
}

function calcWeeklyStreak(habitId: string, completions: Completion[]): number {
  const weeks = new Set(
    completions.filter((c) => c.habitId === habitId).map((c) => getWeekKey(c.completedAt))
  );

  const wk = currentWeekKey();
  let streak = 0;
  let cursorDate = new Date();

  // Start from current week or last week
  let cursorKey = weeks.has(wk) ? wk : getWeekKey(format(subDays(cursorDate, 7), 'yyyy-MM-dd'));

  while (weeks.has(cursorKey)) {
    streak++;
    cursorDate = subDays(cursorDate, 7);
    cursorKey = getWeekKey(format(cursorDate, 'yyyy-MM-dd'));
  }
  return streak;
}

function calcLongestDailyStreak(habitId: string, completions: Completion[]): number {
  const dates = completions
    .filter((c) => c.habitId === habitId)
    .map((c) => c.completedAt)
    .sort();

  if (!dates.length) return 0;

  let best = 1;
  let current = 1;

  for (let i = 1; i < dates.length; i++) {
    const prev = parseISO(dates[i - 1]);
    const curr = parseISO(dates[i]);
    const diff = Math.round((curr.getTime() - prev.getTime()) / 86400000);
    if (diff === 1) {
      current++;
      best = Math.max(best, current);
    } else if (diff > 1) {
      current = 1;
    }
    // diff === 0 means duplicate date, skip
  }
  return best;
}

function calcLongestWeeklyStreak(habitId: string, completions: Completion[]): number {
  const weekSet = [...new Set(
    completions
      .filter((c) => c.habitId === habitId)
      .map((c) => getWeekKey(c.completedAt))
  )].sort();

  if (!weekSet.length) return 0;

  let best = 1;
  let current = 1;

  for (let i = 1; i < weekSet.length; i++) {
    const [yearA, wA] = weekSet[i - 1].split('-W').map(Number);
    const [yearB, wB] = weekSet[i].split('-W').map(Number);
    const isConsecutive = (yearB === yearA && wB === wA + 1) || (yearB === yearA + 1 && wA >= 52 && wB === 1);
    if (isConsecutive) {
      current++;
      best = Math.max(best, current);
    } else {
      current = 1;
    }
  }
  return best;
}

function calcCompletionRate(habit: Habit, completions: Completion[]): number {
  const habCompletions = completions.filter((c) => c.habitId === habit.id);
  if (!habCompletions.length) return 0;

  const todayDate = new Date();
  const createdDate = parseISO(habit.createdAt);
  const startDate = createdDate > subDays(todayDate, 30) ? createdDate : subDays(todayDate, 30);

  if (habit.frequency === 'daily') {
    const days = Math.max(1, Math.round((todayDate.getTime() - startDate.getTime()) / 86400000));
    const completed = habCompletions.filter((c) => {
      const d = parseISO(c.completedAt);
      return d >= startDate && d <= todayDate;
    }).length;
    return Math.min(1, completed / days);
  } else {
    const weeks = Math.max(1, Math.round((todayDate.getTime() - startDate.getTime()) / (7 * 86400000)));
    const completedWeeks = new Set(
      habCompletions
        .filter((c) => {
          const d = parseISO(c.completedAt);
          return d >= startDate && d <= todayDate;
        })
        .map((c) => getWeekKey(c.completedAt))
    ).size;
    return Math.min(1, completedWeeks / weeks);
  }
}

export function computeStats(habit: Habit, completions: Completion[]): HabitStats {
  const isDaily = habit.frequency === 'daily';
  return {
    habitId: habit.id,
    currentStreak: isDaily
      ? calcDailyStreak(habit.id, completions)
      : calcWeeklyStreak(habit.id, completions),
    longestStreak: isDaily
      ? calcLongestDailyStreak(habit.id, completions)
      : calcLongestWeeklyStreak(habit.id, completions),
    totalCompletions: completions.filter((c) => c.habitId === habit.id).length,
    completionRate: calcCompletionRate(habit, completions),
    completedToday: isDaily
      ? completedToday(habit.id, completions)
      : completedThisWeek(habit.id, completions),
  };
}

export { today };
