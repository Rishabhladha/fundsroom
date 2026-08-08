import LedgerSidebar from './LedgerSidebar';

// ─────────────────────────────────────────────────────────────────────────────
// AppShell — two-column layout: sidebar + main content area
// ─────────────────────────────────────────────────────────────────────────────

export default function AppShell({ children }) {
  return (
    <div className="flex h-screen overflow-hidden" style={{ backgroundColor: '#12151B' }}>
      <LedgerSidebar />
      <main className="flex-1 flex flex-col overflow-hidden min-w-0">
        {children}
      </main>
    </div>
  );
}
