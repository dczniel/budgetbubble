import { HashRouter } from 'react-router-dom';
import { Sidebar } from './components/Sidebar';
import { SoloDashboard } from './features/SoloDashboard';
import { GroupDashboard } from './features/GroupDashboard';
import { Login } from './components/Login';
import { useStore } from './store/useStore';
import { useEffect, useState } from 'react';
import { auth } from './firebase';
import { onAuthStateChanged } from 'firebase/auth';

function App() {
  const { groupsMode, setUser, loadData } = useStore();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  // Auth Listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUser(user.uid);
        setIsAuthenticated(true);
        loadData(); // Load their data from cloud
      } else {
        setUser(null);
        setIsAuthenticated(false);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  if (loading) return <div className="h-screen bg-slate-900 text-white flex items-center justify-center">Loading...</div>;
  if (!isAuthenticated) return <Login />;

  return (
    <HashRouter>
      <div className="flex h-screen w-screen overflow-hidden bg-background text-slate-800 dark:text-slate-200">
        <Sidebar />
        <main className="flex-1 relative">
           <div className="absolute top-0 left-0 w-full h-64 bg-primary/5 blur-3xl pointer-events-none" />
           {groupsMode ? <GroupDashboard /> : <SoloDashboard />}
        </main>
      </div>
    </HashRouter>
  );
}

export default App;