import { useStore } from '../store/useStore';
import { User, Users, Moon, Sun, LogOut, RefreshCw } from 'lucide-react';

export const Sidebar = () => {
  const { 
    groupsMode, setGroupsMode, theme, setTheme, resetData, setUser
  } = useStore();
  
  const handleReset = async () => {
    if (confirm("ARE YOU SURE? \nThis will delete ALL history and reset your progress to zero.\nThis cannot be undone.")) {
      await resetData();
      alert("Data wiped. Clean slate!");
    }
  };

  return (
    <aside className="w-64 bg-slate-50 dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col transition-colors duration-300">
      <div className="p-6">
        <h1 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600 mb-1">
          BudgetBubble.
        </h1>
        <p className="text-xs text-slate-400 font-medium">Money Money Money.</p>
      </div>

      <nav className="flex-1 px-4 space-y-2">
        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 px-2">Mode</p>
        <button 
          onClick={() => setGroupsMode(false)}
          className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-colors ${!groupsMode ? 'bg-white dark:bg-slate-800 text-primary font-bold shadow-sm' : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'}`}
        >
          <User size={18} /> Solo
        </button>
        <button 
          onClick={() => setGroupsMode(true)}
          className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-colors ${groupsMode ? 'bg-white dark:bg-slate-800 text-primary font-bold shadow-sm' : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'}`}
        >
          <Users size={18} /> Groups
        </button>
      </nav>

      {/* Footer Controls */}
      <div className="p-4 border-t border-slate-200 dark:border-slate-800 space-y-2">
        <button 
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          className="w-full flex items-center gap-3 px-3 py-2 text-sm font-medium text-slate-500 hover:text-slate-800 dark:hover:text-white transition-colors"
        >
          {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
        </button>
        
        <button 
          onClick={handleReset}
          className="w-full flex items-center gap-3 px-3 py-2 text-sm font-medium text-red-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-lg transition-colors"
        >
          <RefreshCw size={18} />
          Reset Data
        </button>

        <button 
          onClick={() => setUser(null)}
          className="w-full flex items-center gap-3 px-3 py-2 text-sm font-medium text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
        >
          <LogOut size={18} />
          Log Out
        </button>
      </div>
    </aside>
  );
};