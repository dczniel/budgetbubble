import { useState, useEffect } from 'react';
import { useStore } from '../store/useStore';
import type { GroupMember } from '../store/useStore';
import { SavingsRing } from '../components/SavingsRing';
import { Modal } from '../components/ui/Modal';
import { UserPlus, Copy, Trash2, Edit2, Ghost, Users, Sword, Trophy, Sparkles, ChevronDown } from 'lucide-react';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';
import confetti from 'canvas-confetti';

export const GroupDashboard = () => {
  const { 
    uid, username, setUsername, saved, goal, goalTitle,
    friendIds, members, addFriendId, removeFriendId, setLiveMembers,
    convertAmount, currency, goalCurrency, isGhost, toggleGhostMode
  } = useStore();

  const [addModal, setAddModal] = useState(false);
  const [friendCodeInput, setFriendCodeInput] = useState('');
  const [isEditingName, setIsEditingName] = useState(false);
  const [tempName, setTempName] = useState(username);
  
  const [viewMode, setViewMode] = useState<'versus' | 'coop'>('versus');

  useEffect(() => {
    if (friendIds.length === 0) {
      setLiveMembers([]);
      return;
    }
    const unsubscribes = friendIds.map(friendId => {
      return onSnapshot(doc(db, 'users', friendId), (docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data();
          const updatedMember: GroupMember = {
            id: friendId,
            username: data.username || 'Unknown Saver',
            saved: data.saved || 0,
            goal: data.goal || 1000,
            currency: data.currency || 'USD',
            goalTitle: data.goalTitle || 'Goal',
            isGhost: data.isGhost || false
          };
          useStore.setState(state => {
            const others = state.members.filter(m => m.id !== friendId);
            return { members: [...others, updatedMember] };
          });
        }
      });
    });
    return () => unsubscribes.forEach(unsub => unsub());
  }, [friendIds]);

  const displaySaved = convertAmount(saved, 'USD', currency);
  const displayGoal = convertAmount(goal, goalCurrency, currency);
  const myPercent = displayGoal > 0 ? (displaySaved / displayGoal) * 100 : 0;
  
  const [selectedMemberId, setSelectedMemberId] = useState<string | null>(null);
  useEffect(() => {
    if (!selectedMemberId && members.length > 0) setSelectedMemberId(members[0].id);
  }, [members]);

  const rival = members.find(m => m.id === selectedMemberId);
  const rivalSavedDisplay = rival ? convertAmount(rival.saved, 'USD', currency) : 0;
  const rivalGoalDisplay = rival ? convertAmount(rival.goal, rival.currency, currency) : 0;
  const rivalPercent = rivalGoalDisplay > 0 ? (rivalSavedDisplay / rivalGoalDisplay) * 100 : 0;

  const totalSavedCoop = displaySaved + members.reduce((acc, m) => acc + convertAmount(m.saved, 'USD', currency), 0);
  const totalGoalCoop = displayGoal + members.reduce((acc, m) => acc + convertAmount(m.goal, m.currency, currency), 0);
  
  const showRivalAmount = rival && !rival.isGhost;

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

  // UPDATED: Now calculates the button position!
  const triggerConfetti = (e: React.MouseEvent) => {
    // Get the button's position on screen
    const rect = (e.target as HTMLElement).getBoundingClientRect();
    
    // Convert to percentage (0 to 1) for the confetti library
    const x = (rect.left + rect.width / 2) / window.innerWidth;
    const y = (rect.top + rect.height / 2) / window.innerHeight;

    confetti({
      particleCount: 150, // More particles
      spread: 60,         // Tighter burst
      startVelocity: 30,  // Faster pop
      origin: { x, y },   // Fires exactly from the button
      colors: ['#8b5cf6', '#a78bfa', '#c4b5fd'],
      zIndex: 9999
    });
  };

  return (
    <div className="flex-1 h-full flex flex-col bg-slate-50 dark:bg-slate-900 p-4 md:p-8 transition-colors duration-300 overflow-hidden">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4 shrink-0">
        <div>
           <div className="flex items-center gap-3">
             <h2 className="text-3xl font-bold text-slate-800 dark:text-white">Co-op Mode</h2>
             <button 
                onClick={() => setViewMode(viewMode === 'versus' ? 'coop' : 'versus')}
                className="flex items-center gap-2 px-3 py-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-full text-xs font-bold shadow-sm transition-transform active:scale-95"
             >
                {viewMode === 'versus' ? <Sword size={14} className="text-red-400"/> : <Users size={14} className="text-green-400"/>}
                <span className="text-slate-600 dark:text-slate-300 uppercase tracking-wide">{viewMode === 'versus' ? 'Versus' : 'Team Pot'}</span>
             </button>
           </div>
           
           <div className="flex items-center gap-2 text-slate-400 text-sm mt-1">
             {isEditingName ? (
               <div className="flex items-center gap-2">
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
             <span className="text-slate-300">•</span>
             <button 
                onClick={toggleGhostMode}
                className={`flex items-center gap-1 text-xs font-bold transition-colors ${isGhost ? 'text-purple-400' : 'text-slate-400 hover:text-slate-500'}`}
                title="Ghost Mode: Hides your money amounts from friends"
             >
               <Ghost size={12} /> {isGhost ? 'Ghost On' : 'Ghost Off'}
             </button>
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

      <div className="flex-1 min-h-0">
        {viewMode === 'coop' ? (
          // --- COOP VIEW ---
          <div className="flex flex-col items-center justify-center h-full w-full max-w-3xl mx-auto bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 p-4 shadow-sm">
            <div className="text-center mb-4">
              <h3 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-600 mb-2">COMMON POT</h3>
              <p className="text-slate-400 text-sm">You + {members.length} Friends combined</p>
            </div>
            
            <div className="scale-100 flex-1 flex items-center justify-center">
              <SavingsRing customSaved={totalSavedCoop} customGoal={totalGoalCoop} customTitle="Team Total" />
            </div>
            
            <div className="mt-4 flex flex-wrap justify-center gap-4 w-full overflow-y-auto max-h-[150px] custom-scrollbar shrink-0">
                <div className="bg-slate-50 dark:bg-slate-900 p-3 rounded-xl text-center min-w-[100px]">
                  <p className="text-xs font-bold text-slate-500 uppercase mb-1">You</p>
                  <p className="font-bold text-slate-800 dark:text-white">{myPercent.toFixed(1)}%</p>
                </div>
                {members.map(m => {
                  const mVal = convertAmount(m.saved, 'USD', currency);
                  const mGoal = convertAmount(m.goal, m.currency, currency);
                  const mPerc = mGoal > 0 ? (mVal/mGoal)*100 : 0;
                  return (
                    <div key={m.id} className="bg-slate-50 dark:bg-slate-900 p-3 rounded-xl text-center min-w-[100px]">
                      <p className="text-xs font-bold text-slate-500 uppercase mb-1">{m.username}</p>
                      <p className="font-bold text-slate-800 dark:text-white">{mPerc.toFixed(1)}%</p>
                    </div>
                  );
                })}
            </div>
          </div>
        ) : (
          // --- VERSUS VIEW ---
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 h-full"> 
            
            {/* CARD 1: YOU */}
            <div className="bg-white dark:bg-slate-800 p-8 rounded-3xl border border-slate-200 dark:border-slate-700 flex flex-col items-center shadow-sm h-full relative">
              <div className="mb-6 w-full text-center relative h-8 flex items-center justify-center">
                <h3 className="text-xl font-bold text-slate-400 uppercase tracking-widest">You</h3>
              </div>
              <div className="flex-1 flex items-center justify-center">
                <SavingsRing customSaved={displaySaved} customGoal={displayGoal} customTitle={goalTitle} />
              </div>
              <div className="w-full mt-8 text-center h-20 flex flex-col justify-end">
                <p className="text-xs font-bold text-slate-400 uppercase">Remaining</p>
                <p className="text-2xl font-black text-slate-800 dark:text-white">{Math.max(0, displayGoal - displaySaved).toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
              </div>
            </div>

            {/* CARD 2: RIVAL */}
            <div className="bg-white dark:bg-slate-800 p-8 rounded-3xl border border-slate-200 dark:border-slate-700 flex flex-col items-center shadow-sm h-full relative">
              {rival ? (
                <>
                  <div className="mb-6 w-full text-center relative h-8 flex items-center justify-center group cursor-pointer">
                    <div className="relative inline-flex items-center gap-2">
                      <select 
                        value={selectedMemberId || ''} 
                        onChange={(e) => setSelectedMemberId(e.target.value)}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                      >
                        {members.map(m => <option key={m.id} value={m.id}>{m.username}</option>)}
                      </select>
                      <h3 className="text-xl font-bold text-slate-400 uppercase tracking-widest group-hover:text-primary transition-colors">
                        {rival.username}
                      </h3>
                      <ChevronDown size={16} className="text-slate-400 group-hover:text-primary" />
                    </div>
                    
                    <button 
                      onClick={() => { if(confirm("Remove this friend?")) removeFriendId(rival.id); }}
                      className="absolute right-0 top-0 p-1 text-slate-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                      title="Remove Friend"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                  
                  <div className="flex-1 flex items-center justify-center relative">
                    <SavingsRing 
                      customSaved={showRivalAmount ? rivalSavedDisplay : undefined} 
                      customGoal={showRivalAmount ? rivalGoalDisplay : undefined} 
                      customTitle={rival.goalTitle || 'Goal'} 
                    />
                    {rival.isGhost && (
                      <div className="absolute top-0 right-0 bg-slate-100 dark:bg-slate-900 px-2 py-1 rounded text-[10px] font-bold text-slate-500 flex items-center gap-1">
                        <Ghost size={10} /> Hidden
                      </div>
                    )}
                  </div>
                  
                  <div className="w-full mt-8 text-center h-20 flex flex-col justify-end space-y-2">
                    {rivalPercent > myPercent ? (
                      <>
                        <div className="flex items-center justify-center gap-2 text-red-500 font-bold bg-red-50 dark:bg-red-900/20 px-4 py-2 rounded-full mx-auto w-fit">
                          <Trophy size={16} className="text-red-500"/>
                          Trailing by {Math.abs(myPercent - rivalPercent).toFixed(1)}%
                        </div>
                        {/* UPDATED BUTTON: Passes the click event (e) to triggerConfetti */}
                        <button onClick={(e) => triggerConfetti(e)} className="text-xs text-slate-400 hover:text-primary transition-colors flex items-center justify-center gap-1 w-full">
                          <Sparkles size={12}/> Cheer them on
                        </button>
                      </>
                    ) : (
                      <div className="text-green-500 font-bold bg-green-50 dark:bg-green-900/20 px-4 py-2 rounded-full inline-block mx-auto">
                        Leading by {Math.abs(myPercent - rivalPercent).toFixed(1)}%
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-center text-slate-400">
                  <div className="w-16 h-16 bg-slate-100 dark:bg-slate-900 rounded-full flex items-center justify-center mb-4">
                    <UserPlus size={24} className="opacity-50" />
                  </div>
                  <p className="mb-2 font-bold">No friends added.</p>
                  <button onClick={() => setAddModal(true)} className="text-primary hover:underline font-bold text-sm">
                    Add your first friend
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      <Modal isOpen={addModal} onClose={() => setAddModal(false)} title="Connect Friend">
        <div className="space-y-6">
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