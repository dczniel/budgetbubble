import { useState, useEffect } from 'react';
import { useStore } from '../store/useStore';
import type { GroupMember } from '../store/useStore';
import { SavingsRing } from '../components/SavingsRing';
import { Modal } from '../components/ui/Modal';
import { differenceInDays } from 'date-fns';
import { Share2, UserPlus, Copy, Trash2, Edit2 } from 'lucide-react';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';

export const GroupDashboard = () => {
  const { 
    uid, username, setUsername, saved, goal, deadline, 
    friendIds, members, addFriendId, removeFriendId, setLiveMembers,
    convertAmount, currency, goalCurrency 
  } = useStore();

  const [addModal, setAddModal] = useState(false);
  const [friendCodeInput, setFriendCodeInput] = useState('');
  const [isEditingName, setIsEditingName] = useState(false);
  const [tempName, setTempName] = useState(username);

  // --- REAL-TIME FRIEND SYNC ---
  useEffect(() => {
    if (friendIds.length === 0) {
      setLiveMembers([]);
      return;
    }

    // Create a listener for EACH friend
    const unsubscribes = friendIds.map(friendId => {
      return onSnapshot(doc(db, 'users', friendId), (docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data();
          // We have fresh data! Update the global list
          const updatedMember: GroupMember = {
            id: friendId,
            username: data.username || 'Unknown Saver',
            saved: data.saved || 0,
            goal: data.goal || 1000,
            currency: data.currency || 'USD'
          };
          
          // Merge this update into our list
          useStore.setState(state => {
            const others = state.members.filter(m => m.id !== friendId);
            return { members: [...others, updatedMember] };
          });
        }
      });
    });

    // Cleanup listeners when we leave
    return () => unsubscribes.forEach(unsub => unsub());
  }, [friendIds]);

  // --- STATS CALC ---
  const displaySaved = convertAmount(saved, 'USD', currency);
  const displayGoal = convertAmount(goal, goalCurrency, currency);
  const remaining = Math.max(0, displayGoal - displaySaved);
  
  // Rival Selection
  const [selectedMemberId, setSelectedMemberId] = useState<string | null>(null);
  
  // Auto-select first friend if none selected
  useEffect(() => {
    if (!selectedMemberId && members.length > 0) setSelectedMemberId(members[0].id);
  }, [members]);

  const rival = members.find(m => m.id === selectedMemberId);
  const rivalSavedDisplay = rival ? convertAmount(rival.saved, 'USD', currency) : 0;
  const rivalGoalDisplay = rival ? convertAmount(rival.goal, rival.currency, currency) : 0;

  const handleAddFriend = async () => {
    if (friendCodeInput.trim()) {
      await addFriendId(friendCodeInput.trim());
      setAddModal(false);
      setFriendCodeInput('');
    }
  };

  const handleNameUpdate = () => {
    setUsername(tempName);
    setIsEditingName(false);
  };

  return (
    <div className="flex-1 h-full overflow-y-auto bg-slate-50 dark:bg-slate-900 p-4 md:p-8 transition-colors duration-300">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
           <h2 className="text-3xl font-bold text-slate-800 dark:text-white">Co-op Mode</h2>
           <div className="flex items-center gap-2 text-slate-400 text-sm">
             {isEditingName ? (
               <div className="flex items-center gap-2 mt-1">
                 <input 
                   autoFocus
                   className="bg-white dark:bg-slate-800 border border-primary rounded px-2 py-1 text-slate-800 dark:text-white outline-none"
                   value={tempName}
                   onChange={e => setTempName(e.target.value)}
                   onKeyDown={e => e.key === 'Enter' && handleNameUpdate()}
                 />
                 <button onClick={handleNameUpdate} className="text-primary font-bold text-xs">SAVE</button>
               </div>
             ) : (
               <div className="flex items-center gap-2 group">
                 <span>Playing as <strong className="text-slate-600 dark:text-slate-200">{username}</strong></span>
                 <button onClick={() => setIsEditingName(true)} className="opacity-0 group-hover:opacity-100 transition-opacity">
                   <Edit2 size={12} />
                 </button>
               </div>
             )}
           </div>
        </div>
        <button 
          onClick={() => setAddModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg text-sm font-bold shadow-lg shadow-primary/30 hover:bg-primary-dark transition-transform active:scale-95"
        >
          <UserPlus size={16} />
          Add Friend
        </button>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
        {/* My Ring */}
        <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-200 dark:border-slate-700 flex flex-col items-center shadow-sm">
          <h3 className="text-xl font-bold text-slate-400 uppercase tracking-widest mb-4">You</h3>
          <SavingsRing customSaved={displaySaved} customGoal={displayGoal} />
          <div className="w-full mt-6 text-center">
             <p className="text-xs font-bold text-slate-400 uppercase">Remaining</p>
             <p className="text-2xl font-black text-slate-800 dark:text-white">{remaining.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
          </div>
        </div>

        {/* Rival Ring */}
        <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-200 dark:border-slate-700 flex flex-col items-center min-h-[500px] justify-center shadow-sm relative">
          {rival ? (
            <>
              <div className="flex items-center gap-4 mb-4 w-full px-4">
                 <select 
                   value={selectedMemberId || ''} 
                   onChange={(e) => setSelectedMemberId(e.target.value)}
                   className="flex-1 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 p-2 rounded-lg font-bold text-slate-800 dark:text-white outline-none"
                 >
                   {members.map(m => <option key={m.id} value={m.id}>{m.username}</option>)}
                 </select>
                 <button 
                   onClick={() => {
                     if(confirm("Remove this friend?")) removeFriendId(rival.id);
                   }}
                   className="p-2 text-slate-400 hover:text-red-500 transition-colors"
                 >
                   <Trash2 size={18} />
                 </button>
              </div>
              
              <SavingsRing customSaved={rivalSavedDisplay} customGoal={rivalGoalDisplay} customTitle={rival.username} />
              
              <div className="mt-6 text-center">
                {rivalSavedDisplay > displaySaved ? (
                  <p className="text-red-500 font-bold bg-red-50 dark:bg-red-900/20 px-4 py-2 rounded-full">
                    You are {(rivalSavedDisplay - displaySaved).toFixed(0)} behind!
                  </p>
                ) : (
                  <p className="text-green-500 font-bold bg-green-50 dark:bg-green-900/20 px-4 py-2 rounded-full">
                    You are leading by {(displaySaved - rivalSavedDisplay).toFixed(0)}!
                  </p>
                )}
              </div>
            </>
          ) : (
             <div className="text-center text-slate-400 p-8">
               <div className="w-20 h-20 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
                 <UserPlus size={32} className="opacity-50" />
               </div>
               <p className="mb-2 font-bold">No friends added yet.</p>
               <p className="text-xs max-w-[200px] mx-auto mb-6">
                 Share your "Friend ID" with them, or ask for theirs to connect instantly.
               </p>
               <button onClick={() => setAddModal(true)} className="text-primary hover:underline font-bold text-sm">
                 Add your first friend
               </button>
             </div>
          )}
        </div>
      </div>

      <Modal isOpen={addModal} onClose={() => setAddModal(false)} title="Connect Friend">
        <div className="space-y-6">
          
          {/* My Code Section */}
          <div className="p-4 bg-slate-100 dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700">
            <p className="text-xs font-bold text-slate-500 uppercase mb-2">Your Friend ID (Share This)</p>
            <div className="flex gap-2">
              <code className="flex-1 block text-xs break-all bg-white dark:bg-black/20 p-3 rounded border border-slate-200 dark:border-slate-700 select-all text-slate-600 dark:text-slate-400 font-mono">
                {uid}
              </code>
              <button 
                onClick={() => navigator.clipboard.writeText(uid || '')}
                className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3 rounded hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-500"
              >
                <Copy size={16} />
              </button>
            </div>
          </div>
          
          <div className="relative flex py-2 items-center">
            <div className="flex-grow border-t border-slate-200 dark:border-slate-700"></div>
            <span className="flex-shrink-0 mx-4 text-slate-400 text-xs font-bold">ADD SOMEONE</span>
            <div className="flex-grow border-t border-slate-200 dark:border-slate-700"></div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Paste Their Friend ID</label>
            <input 
              value={friendCodeInput}
              onChange={e => setFriendCodeInput(e.target.value)}
              className="w-full p-3 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-sm font-mono text-slate-800 dark:text-white focus:border-primary outline-none transition-colors"
              placeholder="e.g. 7d8f9g-df87..."
            />
          </div>
          <button 
            onClick={handleAddFriend} 
            disabled={!friendCodeInput}
            className="w-full py-3 bg-primary hover:bg-primary-dark disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-lg transition-colors"
          >
            Connect & Sync
          </button>
        </div>
      </Modal>
    </div>
  );
};