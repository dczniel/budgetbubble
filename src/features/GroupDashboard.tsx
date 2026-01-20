import { useState } from 'react';
import { useStore, GroupMember } from '../store/useStore';
import { SavingsRing } from '../components/SavingsRing';
import { Modal } from '../components/ui/Modal';
import { differenceInDays } from 'date-fns';

export const GroupDashboard = () => {
  const { saved, goal, deadline, members, updateMember } = useStore();
  const [importModal, setImportModal] = useState(false);
  const [jsonInput, setJsonInput] = useState('');

  // 1. Calculate Stats for Self
  const daysLeft = deadline ? differenceInDays(new Date(deadline), new Date()) : 0;
  const remaining = Math.max(0, goal - saved);
  const dailyNeeded = daysLeft > 0 ? remaining / daysLeft : 0;
  
  // 2. Handle Comparison
  const [selectedMemberId, setSelectedMemberId] = useState<string | null>(members.length > 0 ? members[0].id : null);
  const rival = members.find(m => m.id === selectedMemberId);

  const handleImport = () => {
    try {
      const data = JSON.parse(jsonInput) as GroupMember;
      if (data.id && data.saved !== undefined) {
        updateMember(data);
        setImportModal(false);
        setJsonInput('');
        setSelectedMemberId(data.id);
      } else {
        alert('Invalid JSON format');
      }
    } catch (e) {
      alert('Parse error');
    }
  };

  const myExportData = JSON.stringify({
    id: 'me', // In a real app this would be a unique UUID
    name: 'Me',
    saved,
    goal,
    deadline
  });

  return (
    <div className="flex-1 h-full overflow-y-auto bg-background p-4 md:p-8">
      <header className="flex justify-between items-center mb-8">
        <h2 className="text-3xl font-bold text-slate-800 dark:text-white">Co-op Mode</h2>
        <button 
          onClick={() => setImportModal(true)}
          className="px-4 py-2 bg-surface border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-bold hover:bg-slate-100 dark:hover:bg-slate-800"
        >
          Sync / Invite
        </button>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
        {/* My Ring */}
        <div className="bg-surface p-6 rounded-3xl border border-slate-200 dark:border-slate-800 flex flex-col items-center">
          <h3 className="text-xl font-bold text-primary mb-4">You</h3>
          <SavingsRing />
          <div className="grid grid-cols-2 gap-4 w-full mt-6">
            <StatBox label="Remaining" value={remaining.toFixed(0)} />
            <StatBox label="Daily Pace" value={daysLeft > 0 ? dailyNeeded.toFixed(0) : 'N/A'} />
          </div>
        </div>

        {/* Rival Ring */}
        <div className="bg-surface p-6 rounded-3xl border border-slate-200 dark:border-slate-800 flex flex-col items-center min-h-[500px] justify-center">
          {rival ? (
            <>
              <div className="flex items-center gap-4 mb-4 w-full px-4">
                 <select 
                   value={selectedMemberId || ''} 
                   onChange={(e) => setSelectedMemberId(e.target.value)}
                   className="flex-1 bg-background p-2 rounded-lg font-bold"
                 >
                   {members.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                 </select>
              </div>
              <SavingsRing customSaved={rival.saved} customGoal={rival.goal} customTitle={rival.name} />
              <div className="mt-6 text-center">
                {rival.saved > saved ? (
                  <p className="text-red-500 font-bold">You are {(rival.saved - saved).toFixed(0)} behind!</p>
                ) : (
                  <p className="text-green-500 font-bold">You are leading by {(saved - rival.saved).toFixed(0)}!</p>
                )}
              </div>
            </>
          ) : (
             <div className="text-center text-slate-400">
               <p className="mb-4">No group members yet.</p>
               <button onClick={() => setImportModal(true)} className="text-primary hover:underline">Import a friend's stats</button>
             </div>
          )}
        </div>
      </div>

      <Modal isOpen={importModal} onClose={() => setImportModal(false)} title="Sync Stats (No Backend)">
        <div className="space-y-6">
          <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-lg">
            <p className="text-xs font-bold text-slate-500 uppercase mb-2">Your Data (Send this to friend)</p>
            <code className="block text-xs break-all bg-black/5 p-2 rounded">{myExportData}</code>
          </div>
          
          <div className="relative flex py-2 items-center">
            <div className="flex-grow border-t border-slate-200 dark:border-slate-700"></div>
            <span className="flex-shrink-0 mx-4 text-slate-400 text-xs">OR IMPORT</span>
            <div className="flex-grow border-t border-slate-200 dark:border-slate-700"></div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Paste Friend's JSON</label>
            <textarea 
              value={jsonInput}
              onChange={e => setJsonInput(e.target.value)}
              className="w-full p-3 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-mono h-24"
              placeholder='{"id":"bob", "name":"Bob", "saved":500...}'
            />
          </div>
          <button onClick={handleImport} className="w-full py-3 bg-primary text-white font-bold rounded-lg">
            Import Member
          </button>
        </div>
      </Modal>
    </div>
  );
};

const StatBox = ({ label, value }: { label: string, value: string }) => (
  <div className="bg-background p-3 rounded-xl text-center">
    <p className="text-xs text-slate-500 uppercase font-bold">{label}</p>
    <p className="text-lg font-black text-slate-800 dark:text-white">{value}</p>
  </div>
);