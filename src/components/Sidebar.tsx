import { useStore } from '../store/useStore';
import { Plus, Trash2, Users, User, Sun, Moon } from 'lucide-react';
import { useState } from 'react';
import { Modal } from './ui/Modal';
import clsx from 'clsx';

export const Sidebar = () => {
  const { categories, addCategory, removeCategory, theme, setTheme, groupsMode, toggleGroupsMode } = useStore();
  const [isCatModalOpen, setIsCatModalOpen] = useState(false);
  const [newCat, setNewCat] = useState('');

  const handleAddCat = () => {
    if (newCat.trim()) {
      addCategory(newCat);
      setNewCat('');
      setIsCatModalOpen(false);
    }
  };

  return (
    <aside className="w-full md:w-64 bg-surface border-r border-slate-200 dark:border-slate-800 flex flex-col h-full transition-colors">
      <div className="p-6">
        <h1 className="text-2xl font-black bg-gradient-to-r from-primary to-primary-glow bg-clip-text text-transparent">
          Hoardr.
        </h1>
        <p className="text-xs text-slate-400 mt-1 italic">Don't buy that latte.</p>
      </div>

      <nav className="flex-1 overflow-y-auto px-4 space-y-6">
        {/* Mode Switch */}
        <div>
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 px-2">Mode</h3>
          <button 
            onClick={toggleGroupsMode}
            className={clsx(
              "w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
              !groupsMode ? "bg-primary/10 text-primary" : "text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
            )}
          >
            <User size={18} /> Solo
          </button>
          <button 
            onClick={toggleGroupsMode}
            className={clsx(
              "w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors mt-1",
              groupsMode ? "bg-primary/10 text-primary" : "text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
            )}
          >
            <Users size={18} /> Groups
          </button>
        </div>

        {/* Categories */}
        <div>
          <div className="flex items-center justify-between px-2 mb-3">
             <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Sources</h3>
             <button onClick={() => setIsCatModalOpen(true)} className="text-primary hover:text-primary-dark">
               <Plus size={16} />
             </button>
          </div>
          <div className="space-y-1 max-h-[300px] overflow-y-auto custom-scrollbar">
            {categories.map(cat => (
              <div key={cat} className="group flex items-center justify-between px-3 py-2 rounded-lg text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800">
                <span className="truncate">{cat}</span>
                <button 
                  onClick={(e) => { e.stopPropagation(); removeCategory(cat); }}
                  className="opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-500 transition-opacity"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>
        </div>
      </nav>

      {/* Footer / Theme */}
      <div className="p-4 border-t border-slate-200 dark:border-slate-800">
        <button 
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          className="flex items-center gap-3 text-sm font-medium text-slate-500 hover:text-slate-800 dark:hover:text-white transition-colors"
        >
          {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
        </button>
      </div>

      <Modal isOpen={isCatModalOpen} onClose={() => setIsCatModalOpen(false)} title="New Category">
        <div className="space-y-4">
          <input 
            value={newCat} 
            onChange={(e) => setNewCat(e.target.value)}
            placeholder="e.g., Side Hustle"
            className="w-full p-3 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 outline-none focus:ring-2 focus:ring-primary"
            autoFocus
          />
          <button 
            onClick={handleAddCat}
            className="w-full py-3 bg-primary hover:bg-primary-dark text-white font-bold rounded-lg transition-colors"
          >
            Create
          </button>
        </div>
      </Modal>
    </aside>
  );
};