import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type TransactionType = 'add' | 'remove';
export type Currency = 'USD' | 'EUR' | 'AED';

export interface Transaction {
  id: string;
  amount: number;
  type: TransactionType;
  category: string;
  note?: string;
  date: string; // ISO string
  currencySnapshot: number; // Rate at time of tx
}

export interface GroupMember {
  id: string;
  name: string;
  saved: number;
  goal: number;
  deadline?: string;
}

interface AppState {
  // Solo State
  saved: number;
  goal: number;
  deadline: string | null;
  currency: Currency;
  rates: Record<string, number>;
  categories: string[];
  history: Transaction[];
  theme: 'light' | 'dark';
  
  // Group State
  groupsMode: boolean;
  members: GroupMember[]; // In manual mode, this is imported data
  
  // Actions
  setTheme: (theme: 'light' | 'dark') => void;
  setGoal: (amount: number, date?: string) => void;
  setCurrency: (c: Currency) => void;
  updateRates: (rates: Record<string, number>) => void;
  addTransaction: (tx: Omit<Transaction, 'id' | 'date' | 'currencySnapshot'>) => void;
  addCategory: (cat: string) => void;
  removeCategory: (cat: string) => void;
  toggleGroupsMode: () => void;
  updateMember: (member: GroupMember) => void; // For manual sync import
}

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      saved: 0,
      goal: 1000,
      deadline: null,
      currency: 'USD',
      rates: { USD: 1, EUR: 0.92, AED: 3.67 }, // Fallbacks
      categories: ['Salary', 'Freelance', 'Gifts', 'Investments'],
      history: [],
      theme: 'dark',
      groupsMode: false,
      members: [],

      setTheme: (theme) => set({ theme }),
      setGoal: (amount, date) => set({ goal: amount, deadline: date || null }),
      setCurrency: (c) => set({ currency: c }),
      updateRates: (rates) => set({ rates }),
      
      addTransaction: (tx) => set((state) => {
        const newSaved = tx.type === 'add' 
          ? state.saved + tx.amount 
          : state.saved - tx.amount;
        
        return {
          saved: Math.max(0, newSaved),
          history: [
            {
              ...tx,
              id: crypto.randomUUID(),
              date: new Date().toISOString(),
              currencySnapshot: state.rates[state.currency] || 1
            },
            ...state.history
          ]
        };
      }),

      addCategory: (cat) => set((state) => ({ 
        categories: [...state.categories, cat] 
      })),
      
      removeCategory: (cat) => set((state) => ({ 
        categories: state.categories.filter(c => c !== cat) 
      })),

      toggleGroupsMode: () => set((state) => ({ groupsMode: !state.groupsMode })),
      
      updateMember: (member) => set((state) => {
        const exists = state.members.find(m => m.id === member.id);
        if (exists) {
          return { members: state.members.map(m => m.id === member.id ? member : m) };
        }
        return { members: [...state.members, member] };
      })
    }),
    { name: 'savings-tracker-storage' }
  )
);