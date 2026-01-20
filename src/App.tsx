import { HashRouter } from 'react-router-dom';
import { Sidebar } from './components/Sidebar';
import { SoloDashboard } from './features/SoloDashboard';
import { GroupDashboard } from './features/GroupDashboard';
import { useStore } from './store/useStore';
import { useEffect } from 'react';

function App() {
  const { theme, groupsMode } = useStore();

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  return (
    <HashRouter>
      <div className="flex h-screen w-screen overflow-hidden bg-background text-slate-800 dark:text-slate-200">
        <Sidebar />
        <main className="flex-1 relative">
           {/* Decorative Background Blur */}
           <div className="absolute top-0 left-0 w-full h-64 bg-primary/5 blur-3xl pointer-events-none" />
           
           {groupsMode ? <GroupDashboard /> : <SoloDashboard />}
        </main>
      </div>
    </HashRouter>
  );
}

export default App;