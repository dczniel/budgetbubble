import { useStore } from '../store/useStore';
import { User, Users, Plus, Trash2, Moon, Sun, LogOut, RefreshCw } from 'lucide-react';
import { useState } from 'react';

export const Sidebar = () => {
  const { 
    groupsMode, setGroupsMode, categories, addCategory, 
    removeCategory, theme, setTheme, resetData, setUser
  } = useStore();
  
  const [newCat, setNewCat] = useState('');

  const handleAddCat = (e: React.FormEvent) => {
    e.preventDefault();
    if (newCat) {
      addCategory(newCat);
      setNewCat('');
    }
  };

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

      <nav className="flex-1 px-4 space-y-8">
        {/* Mode Switcher */}
        <div>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 px-2">Mode</p>
          <div className="space-y-1">
            <button 
              onClick={() => setGroupsMode(false)} // Explicitly set to Solo
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${!groupsMode ? 'bg-primary/10 text-primary font-bold' : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'}`}
            >
              <User size={18} /> Solo
            </button>
            <button 
              onClick={() => setGroupsMode(true)} // Explicitly set to Groups
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${groupsMode ? 'bg-primary/10 text-primary font-bold' : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'}`}
            >
              <Users size={18} /> Groups
            </button>
          </div>
        </div>

        {/* Sources/Categories */}
        <div>
          <div className="flex justify-between items-center mb-3 px-2">
             <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Sources</p>
             <button onClick={() => document.getElementById('cat-input')?.focus()} className="text-primary hover:text-primary-dark">
               <Plus size={16} />
             </button>
          </div>
          <div className="space-y-1">
            {categories.map(cat => (
              <div key={cat} className="group flex justify-between items-center px-3 py-2 text-sm text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg">
                <span>{cat}</span>
                <button 
                  onClick={() => removeCategory(cat)}
                  className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-red-500"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
            <form onSubmit={handleAddCat} className="mt-2">
              <input 
                id="cat-input"
                type="text" 
                placeholder="+ Add new..." 
                value={newCat}
                onChange={e => setNewCat(e.target.value)}
                className="w-full bg-transparent px-3 py-2 text-sm outline-none text-slate-600 dark:text-slate-300 placeholder-slate-400 focus:bg-slate-100 dark:focus:bg-slate-800 rounded-lg"
              />
            </form>
          </div>
        </div>
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