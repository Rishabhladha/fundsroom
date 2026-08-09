import LedgerSidebar from './LedgerSidebar';

export default function AppShell({ children }) {
  return (
    <div className="flex h-screen overflow-hidden" style={{ background: 'var(--canvas)' }}>
      <LedgerSidebar />
      <main className="flex-1 flex flex-col overflow-hidden min-w-0">
        {children}
      </main>
    </div>
  );
}
