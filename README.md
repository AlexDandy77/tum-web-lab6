# HabitBuilder

A powerful client-side habit tracking app built with React, TypeScript, and Tailwind CSS v4.

## Live Demo

> Deployed at: `https://alexdandy77.github.io/tum-web-lab6/`

## Description

HabitBuilder helps you build and maintain positive habits through streak tracking, completion logging, and insightful statistics. All data persists in the browser via `localStorage` — no backend required.

## App Flows

### Adding a Habit
1. Navigate to the **Habits** page (or press `N` anywhere on the page)
2. Click **New Habit**
3. Fill in the name, optional description, category, and frequency (daily/weekly)
4. Submit — the habit appears immediately in your list

### Completing a Habit
- On the **Dashboard**: click any habit's checkbox in Today's Checklist
- On the **Habits** page: click the circle icon on any HabitCard
- Completed habits are visually marked with a strikethrough and a purple border
- Toggling a second time un-completes the habit

### Filtering & Searching
- Use the search bar to find habits by name or description (debounced 250ms)
- Filter by status: **All / Completed / Missed / Favorites**
- Filter by category pills: Health, Fitness, Learning, Mindfulness, Productivity, Social, Other
- Filters can be combined

### Liking / Favoriting
- Click the heart icon on a HabitCard to toggle favorites
- Use the **Favorites** status filter to see only starred habits

### Deleting a Habit
- Click the trash icon on a HabitCard
- Confirm in the dialog — the habit is soft-deleted (history preserved in memory)

### Viewing Statistics
- Navigate to **Stats** page
- See summary cards: total habits, total completions, best streak, avg completion rate
- Category breakdown bar chart
- Per-habit table sorted by current streak

### Streak Calculation
- **Daily habits**: consecutive days with at least one completion (includes today if completed)
- **Weekly habits**: consecutive ISO weeks with at least one completion
- Streaks are displayed with a flame icon on each HabitCard and on the Dashboard leaderboard

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | React 19 + TypeScript |
| Build | Vite 8 |
| Styling | Tailwind CSS v4 (utility + CSS custom properties) |
| Icons | Lucide React |
| Date logic | date-fns |
| State | `useReducer` + `useContext` |
| Persistence | `localStorage` (habits + completions + theme) |
| Deployment | GitHub Pages via `gh-pages` |

## State Architecture

- `StoreProvider` wraps the entire app, exposing `habits`, `completions`, and `filter` via context
- `useLocalStorage<T>` hook syncs any state slice to localStorage on every change
- `filter` state is intentionally **not** persisted — resets on page load
- All streak and completion statistics are **derived at render time** from raw `completions[]` — never stored

## Running Locally

```bash
npm install
npm run dev
```

## Deploying

```bash
npm run deploy
```

## Project Structure

```
src/
├── types.ts                    # Habit, Completion, FilterState, etc.
├── context/
│   └── StoreContext.tsx        # Global state, theme, toasts
├── hooks/
│   └── useLocalStorage.ts      # Persistent state hook
├── lib/
│   ├── streaks.ts              # Streak and completion rate algorithms
│   └── categoryMeta.ts         # Category colors and labels
├── components/
│   ├── Header.tsx              # Nav tabs + theme toggle
│   ├── shared/                 # Badge, Button, Modal, ProgressRing, Toast, EmptyState
│   └── habits/                 # HabitCard, HabitForm, AddHabitModal
└── pages/
    ├── DashboardPage.tsx        # Today's progress + streak leaders
    ├── HabitsPage.tsx           # Full CRUD + filtering
    └── StatsPage.tsx            # Summary cards + category chart + table
```

## Features

- Add / delete habits with name, description, category, frequency
- Complete habits daily (or weekly) with toggle
- Like / favorite habits
- Filter by category, status, search query
- Light / dark theme (persisted)
- Streak tracking with flame animations
- Dashboard with circular progress ring
- Stats page with bar chart and sortable table
- Keyboard shortcut `N` to add a new habit
- Toast notifications for all actions
- Accessible modals with focus trap and Escape to close
- Empty states for all views
- Fully client-side, no server required
