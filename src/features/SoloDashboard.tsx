import { useState } from 'react';
import { useStore } from '../store/useStore';
import type { TransactionType, Currency } from '../store/useStore';
import { SavingsRing } from '../components/SavingsRing';
import { Modal } from '../components/ui/Modal';
import { getSnarkyMessage } from '../utils/snark';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip } from 'recharts';
import { Settings, Wallet, MinusCircle, Calendar, AlertCircle } from 'lucide-react';
import { format, differenceInDays } from 'date-fns';

export const SoloDashboard = () => {
  const { 
    goal, goalCurrency, deadline, currency, categories, history,
    addTransaction, setGoal, setCurrency, convertAmount 
  } = useStore();

  const [txModal, setTxModal] = useState<{ open: boolean, type: TransactionType }>({ open: false, type: 'add' });
  const [goalModal, setGoalModal] = useState(false);
  
  // Transaction State
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState(categories[0]);
  const [snark, setSnark] = useState(getSnarkyMessage('idle'));

  // Goal Inputs
  const [newGoal, setNewGoal] = useState(goal.toString());
  const [newDate, setNewDate] = useState(deadline || '');
  const [newGoalCurrency, setNewGoalCurrency] = useState<Currency>(goalCurrency);

  // --- MATH ---
  const displayGoal = convertAmount(goal, goalCurrency, currency);
  // Assume saved is stored in USD, so we convert USD -> View Currency
  const displaySaved = convertAmount(useStore(s => s.saved), 'USD', currency);
  
  const remaining = Math.max(0, displayGoal - displaySaved);
  
  const daysLeft = deadline ? differenceInDays(new Date(deadline), new Date()) : 0;
  const dailyPace = daysLeft > 0 ? remaining / daysLeft : 0;

  const handleTransaction = () => {
    const val = parseFloat(amount);
    if (!val) return;
    
    // Convert input amount (View Currency) -> USD (Base Storage)
    const amountInUSD = convertAmount(val, currency, 'USD');
    
    addTransaction({
      amount: amountInUSD,
      type: txModal.type,
      category,
    });
    
    setSnark(getSnarkyMessage(txModal.type));
    setTxModal({ ...txModal, open: false });
    setAmount('');
  };

  const handleGoalUpdate = () => {
    setGoal(parseFloat(newGoal), newDate, newGoalCurrency);
    setGoalModal(false);
  };

  // Chart Data
  const chartData = categories.map(cat => ({
    name: cat,
    value: history.filter(h => h.category === cat && h.type === 'add').reduce((acc, curr) => acc + curr.amount, 0)
  })).filter(d => d.value > 0);

  const COLORS = ['#8b5cf6', '#a78bfa', '#c4b5fd', '#64748b', '#94a3b8'];
  const CURRENCY_SYMBOLS = { USD: '$', EUR: '€', AED: 'د.إ' };

  return (
    <div className="flex-1 h-full overflow-y-auto bg-slate-50 dark:bg-slate-900 p-4 md:p-8 transition-colors duration-300">
      <header className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-3xl font-bold text-slate-800 dark:text-white">Dashboard</h2>
          <p className="text-sm text-primary italic mt-1 min-h-[20px]">{snark}</p>
        </div>
        
        <div className="flex items-center gap-2">
          {/* Currency Pill */}
          <div className="flex bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-full p-1 shadow-sm">
            {(['USD', 'EUR', 'AED'] as const).map(c => (
              <button
                key={c}
                onClick={() => setCurrency(c)}
                className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${
                  currency === c 
                    ? 'bg-primary text-white shadow-md' 
                    : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700 dark:text-slate-400'
                }`}
              >
                {c}
              </button>
            ))}
          </div>
          <button onClick={() => setGoalModal(true)} className="p-2 text-slate-500 hover:bg-white dark:hover:bg-slate-800 rounded-full transition-colors">
            <Settings size={20} />
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Main Centerpiece */}
        <div className="lg:col-span-7 flex flex-col items-center">
          <SavingsRing customSaved={displaySaved} customGoal={displayGoal} />
          
          <div className="flex gap-4 mt-8 w-full max-w-sm">
            <button 
              onClick={() => setTxModal({ open: true, type: 'remove' })}
              className="flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-slate-200 dark:bg-slate-800 text-red-500 font-bold hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
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
          
          {/* Remaining Card */}
          <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700">
             <div className="flex justify-between items-start mb-2">
                <h3 className="text-sm font-bold text-slate-400 uppercase">Remaining</h3>
                {deadline && <span className="text-xs bg-slate-100 dark:bg-slate-700 px-2 py-1 rounded text-slate-500">{daysLeft} days left</span>}
             </div>
             <div className="text-3xl font-black text-slate-800 dark:text-white mb-1">
                {CURRENCY_SYMBOLS[currency]} {remaining.toLocaleString(undefined, { maximumFractionDigits: 0 })}
             </div>
             {deadline && daysLeft > 0 && (
               <p className="text-xs text-primary font-medium">
                 Save <span className="font-bold">{CURRENCY_SYMBOLS[currency]}{dailyPace.toFixed(0)}</span> / day to hit target
               </p>
             )}
          </div>

          {/* Pie Chart */}
          <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700">
             <h3 className="text-sm font-bold text-slate-400 uppercase mb-4">Breakdown</h3>
             {/* CRITICAL FIX: Fixed height prevents crash */}
             <div className="h-[200px] w-full min-w-0 relative">
               <ResponsiveContainer width="100%" height="100%">
                 <PieChart>
                   <Pie
                     data={chartData}
                     innerRadius={60}
                     outerRadius={80}
                     paddingAngle={5}
                     dataKey="value"
                     stroke="none"
                   >
                     {chartData.map((entry, index) => (
                       <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                     ))}
                   </Pie>
                   <RechartsTooltip 
                     contentStyle={{ backgroundColor: '#1e293b', borderRadius: '8px', border: 'none', color: '#fff' }}
                     itemStyle={{ color: '#fff' }}
                   />
                 </PieChart>
               </ResponsiveContainer>
             </div>
          </div>

          {/* History */}
          <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 flex-1 min-h-[300px]">
            <h3 className="text-sm font-bold text-slate-400 uppercase mb-4">Timeline</h3>
            <div className="space-y-4 max-h-[300px] overflow-y-auto custom-scrollbar pr-2">
              {history.map(tx => (
                <div key={tx.id} className="flex items-center justify-between text-sm">
                  <div className="flex flex-col">
                    <span className="font-medium text-slate-700 dark:text-slate-200">{tx.category}</span>
                    <span className="text-xs text-slate-400">{format(new Date(tx.date), 'MMM d, h:mm a')}</span>
                  </div>
                  <span className={`font-bold ${tx.type === 'add' ? 'text-green-500' : 'text-red-500'}`}>
                    {tx.type === 'add' ? '+' : '-'}{convertAmount(tx.amount, 'USD', currency).toLocaleString(undefined, { maximumFractionDigits: 0 })}
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
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Amount ({currency})</label>
            <input 
              type="number" 
              value={amount}
              onChange={e => setAmount(e.target.value)}
              className="w-full text-3xl font-black bg-transparent border-b-2 border-slate-200 dark:border-slate-600 focus:border-primary outline-none py-2 text-slate-800 dark:text-white placeholder-slate-300"
              placeholder="0.00"
              autoFocus
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Category</label>
            <select 
              value={category}
              onChange={e => setCategory(e.target.value)}
              className="w-full p-3 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-600 text-slate-800 dark:text-white"
            >
              {categories.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
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
           <div className="grid grid-cols-3 gap-2">
             <div className="col-span-2">
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Goal Amount</label>
                <input 
                  type="number" 
                  value={newGoal}
                  onChange={e => setNewGoal(e.target.value)}
                  className="w-full p-3 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-600 text-slate-800 dark:text-white"
                />
             </div>
             <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Currency</label>
                <select 
                  value={newGoalCurrency} 
                  onChange={(e) => setNewGoalCurrency(e.target.value as Currency)}
                  className="w-full p-3 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-600 text-slate-800 dark:text-white font-bold"
                >
                  <option value="USD">USD</option>
                  <option value="EUR">EUR</option>
                  <option value="AED">AED</option>
                </select>
             </div>
           </div>

           <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Deadline (Optional)</label>
            <div className="relative">
              <input 
                type="date" 
                value={newDate}
                onChange={e => setNewDate(e.target.value)}
                className="w-full p-3 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-600 text-slate-800 dark:text-white"
              />
              <Calendar className="absolute right-3 top-3 text-slate-400 pointer-events-none" size={20} />
            </div>
           </div>
           
           <div className="bg-slate-100 dark:bg-slate-700 p-3 rounded-lg flex gap-3 items-start">
              <AlertCircle size={18} className="text-primary shrink-0 mt-0.5" />
              <p className="text-xs text-slate-500 dark:text-slate-300">
                Goals are saved in {newGoalCurrency}. If you view the dashboard in another currency, the goal amount will auto-convert.
              </p>
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