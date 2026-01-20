import { useState } from 'react';
import { useStore, TransactionType } from '../store/useStore';
import { SavingsRing } from '../components/SavingsRing';
import { Modal } from '../components/ui/Modal';
import { getSnarkyMessage } from '../utils/snark';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip } from 'recharts';
import { Settings, Wallet, MinusCircle, Calendar } from 'lucide-react';
import { format } from 'date-fns';

export const SoloDashboard = () => {
  const { 
    goal, deadline, currency, rates, categories, history,
    addTransaction, setGoal, setCurrency, updateRates 
  } = useStore();

  const [txModal, setTxModal] = useState<{ open: boolean, type: TransactionType }>({ open: false, type: 'add' });
  const [goalModal, setGoalModal] = useState(false);
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState(categories[0]);
  const [note, setNote] = useState('');
  const [snark, setSnark] = useState(getSnarkyMessage('idle'));

  // Goal Inputs
  const [newGoal, setNewGoal] = useState(goal.toString());
  const [newDate, setNewDate] = useState(deadline || '');

  const handleTransaction = () => {
    const val = parseFloat(amount);
    if (!val) return;
    
    addTransaction({
      amount: val,
      type: txModal.type,
      category,
      note
    });
    
    setSnark(getSnarkyMessage(txModal.type));
    setTxModal({ ...txModal, open: false });
    setAmount('');
    setNote('');
  };

  const handleGoalUpdate = () => {
    setGoal(parseFloat(newGoal), newDate);
    setGoalModal(false);
  };

  // Chart Data
  const chartData = categories.map(cat => ({
    name: cat,
    value: history.filter(h => h.category === cat && h.type === 'add').reduce((acc, curr) => acc + curr.amount, 0)
  })).filter(d => d.value > 0);

  const COLORS = ['#8b5cf6', '#a78bfa', '#c4b5fd', '#64748b', '#94a3b8'];

  // Currency Fetcher
  const fetchRates = async () => {
    try {
      const res = await fetch('https://api.frankfurter.app/latest?from=USD');
      const data = await res.json();
      updateRates({ USD: 1, EUR: data.rates.EUR, AED: 3.67 }); // AED is pegged usually, simplistic fallback
    } catch (e) {
      console.error("Rate fetch failed");
    }
  };

  return (
    <div className="flex-1 h-full overflow-y-auto bg-background p-4 md:p-8">
      <header className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-3xl font-bold text-slate-800 dark:text-white">Dashboard</h2>
          <p className="text-sm text-primary italic mt-1 min-h-[20px]">{snark}</p>
        </div>
        
        <div className="flex items-center gap-2">
          {/* Currency Pill */}
          <div className="flex bg-surface border border-slate-200 dark:border-slate-700 rounded-full p-1">
            {(['USD', 'EUR', 'AED'] as const).map(c => (
              <button
                key={c}
                onClick={() => setCurrency(c)}
                className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${
                  currency === c 
                    ? 'bg-primary text-white shadow-md' 
                    : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                {c}
              </button>
            ))}
          </div>
          <button onClick={() => setGoalModal(true)} className="p-2 text-slate-500 hover:bg-surface rounded-full">
            <Settings size={20} />
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Main Centerpiece */}
        <div className="lg:col-span-7 flex flex-col items-center">
          <SavingsRing />
          
          <div className="flex gap-4 mt-8 w-full max-w-sm">
            <button 
              onClick={() => setTxModal({ open: true, type: 'remove' })}
              className="flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-slate-100 dark:bg-slate-800 text-red-500 font-bold hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
            >
              <MinusCircle size={20} /> Spend
            </button>
            <button 
              onClick={() => setTxModal({ open: true, type: 'add' })}
              className="flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-primary text-white font-bold shadow-lg shadow-primary/30 hover:bg-primary-dark transition-transform active:scale-95"
            >
              <Wallet size={20} /> Save
            </button>
          </div>
        </div>

        {/* Stats Panel */}
        <div className="lg:col-span-5 space-y-6">
          {/* Pie Chart */}
          <div className="bg-surface p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800">
             <h3 className="text-sm font-bold text-slate-400 uppercase mb-4">Breakdown</h3>
             <div className="h-[200px] w-full">
               <ResponsiveContainer width="100%" height="100%">
                 <PieChart>
                   <Pie
                     data={chartData}
                     innerRadius={60}
                     outerRadius={80}
                     paddingAngle={5}
                     dataKey="value"
                   >
                     {chartData.map((entry, index) => (
                       <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                     ))}
                   </Pie>
                   <RechartsTooltip 
                     contentStyle={{ backgroundColor: 'var(--surface)', borderRadius: '8px', border: 'none' }}
                     itemStyle={{ color: '#8b5cf6' }}
                   />
                 </PieChart>
               </ResponsiveContainer>
             </div>
          </div>

          {/* History */}
          <div className="bg-surface p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 flex-1 min-h-[300px]">
            <h3 className="text-sm font-bold text-slate-400 uppercase mb-4">Timeline</h3>
            <div className="space-y-4 max-h-[300px] overflow-y-auto custom-scrollbar pr-2">
              {history.map(tx => (
                <div key={tx.id} className="flex items-center justify-between text-sm">
                  <div className="flex flex-col">
                    <span className="font-medium text-slate-700 dark:text-slate-200">{tx.category}</span>
                    <span className="text-xs text-slate-400">{format(new Date(tx.date), 'MMM d, h:mm a')}</span>
                  </div>
                  <span className={`font-bold ${tx.type === 'add' ? 'text-green-500' : 'text-red-500'}`}>
                    {tx.type === 'add' ? '+' : '-'}{tx.amount.toLocaleString()}
                  </span>
                </div>
              ))}
              {history.length === 0 && <p className="text-center text-slate-400 py-4">No history yet.</p>}
            </div>
          </div>
        </div>
      </div>

      {/* Transactions Modal */}
      <Modal 
        isOpen={txModal.open} 
        onClose={() => setTxModal({ ...txModal, open: false })} 
        title={txModal.type === 'add' ? 'Stash Cash' : 'Withdraw Funds'}
      >
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Amount</label>
            <input 
              type="number" 
              value={amount}
              onChange={e => setAmount(e.target.value)}
              className="w-full text-3xl font-black bg-transparent border-b-2 border-slate-200 dark:border-slate-700 focus:border-primary outline-none py-2 text-slate-800 dark:text-white placeholder-slate-300"
              placeholder="0.00"
              autoFocus
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Category</label>
            <select 
              value={category}
              onChange={e => setCategory(e.target.value)}
              className="w-full p-3 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700"
            >
              {categories.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Note (Optional)</label>
            <input 
              value={note}
              onChange={e => setNote(e.target.value)}
              className="w-full p-3 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700"
              placeholder="What for?"
            />
          </div>
          <button 
            onClick={handleTransaction}
            className={`w-full py-4 rounded-xl font-bold text-white transition-colors ${
              txModal.type === 'add' ? 'bg-primary hover:bg-primary-dark' : 'bg-red-500 hover:bg-red-600'
            }`}
          >
            {txModal.type === 'add' ? 'Add to Stash' : 'Deduct'}
          </button>
        </div>
      </Modal>

      {/* Goal Modal */}
      <Modal isOpen={goalModal} onClose={() => setGoalModal(false)} title="Target Settings">
        <div className="space-y-4">
           <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Goal Amount</label>
            <input 
              type="number" 
              value={newGoal}
              onChange={e => setNewGoal(e.target.value)}
              className="w-full p-3 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700"
            />
           </div>
           <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Deadline (Optional)</label>
            <div className="relative">
              <input 
                type="date" 
                value={newDate}
                onChange={e => setNewDate(e.target.value)}
                className="w-full p-3 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700"
              />
              <Calendar className="absolute right-3 top-3 text-slate-400 pointer-events-none" size={20} />
            </div>
            <p className="text-xs text-slate-400 mt-2">Setting a date enables pace calculations.</p>
           </div>
           <button 
            onClick={handleGoalUpdate}
            className="w-full py-3 bg-primary hover:bg-primary-dark text-white font-bold rounded-lg mt-4"
           >
             Update Goal
           </button>
        </div>
      </Modal>
    </div>
  );
};