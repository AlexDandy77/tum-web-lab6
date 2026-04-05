import { useState } from 'react';
import { StoreProvider } from './context/StoreContext';
import { Header } from './components/Header';
import { DashboardPage } from './pages/DashboardPage';
import { HabitsPage } from './pages/HabitsPage';
import { StatsPage } from './pages/StatsPage';
import { ToastContainer } from './components/shared/Toast';
import type { Page } from './types';

function AppInner() {
  const [page, setPage] = useState<Page>('dashboard');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100svh' }}>
      <Header page={page} setPage={setPage} />
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        {page === 'dashboard' && <DashboardPage />}
        {page === 'habits' && <HabitsPage />}
        {page === 'stats' && <StatsPage />}
      </main>
      <ToastContainer />
    </div>
  );
}

export default function App() {
  return (
    <StoreProvider>
      <AppInner />
    </StoreProvider>
  );
}
