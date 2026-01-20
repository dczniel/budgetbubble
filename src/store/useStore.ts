import { create } from 'zustand';
import { doc, getDoc, setDoc, onSnapshot } from 'firebase/firestore';
import { db, auth } from '../firebase';

export type TransactionType = 'add' | 'remove';
export type Currency = 'USD' | 'EUR' | 'AED';

export interface Transaction {
  id: string;
  amount: number;
  type: TransactionType;
  category: string;
  date: string;
}

interface AppState {
  // User Data
  uid: string | null;
  saved: number;
  goal: number;
  deadline: string | null;
  currency: Currency;
  rates: Record<string, number>;
  categories: string[];
  history: Transaction[];
  
  // Actions
  setUser: (uid: string | null) => void;
  loadData: () => Promise<void>;
  syncToCloud: (state: Partial<AppState>) => void;
  
  setGoal: (amount: number, date?: string) => void;
  setCurrency: (c: Currency) => void;
  addTransaction: (tx: Omit<Transaction, 'id' | 'date'>) => void;
}

export const useStore = create<AppState>((set, get) => ({
  uid: null,
  saved: 0,
  goal: 1000,
  deadline: null,
  currency: 'USD',
  rates: { USD: 1, EUR: 0.92, AED: 3.67 },
  categories: ['Salary', 'Freelance', 'Food', 'Fun'],
  history: [],

  setUser: (uid) => set({ uid }),

  // 1. LOAD DATA (Runs when you log in)
  loadData: async () => {
    const uid = get().uid;
    if (!uid) return;

    const docRef = doc(db, 'users', uid);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      // Load existing data
      set(docSnap.data() as Partial<AppState>);
    } else {
      // New user? Create default profile
      const defaultData = {
        saved: 0,
        goal: 1000,
        currency: 'USD',
        categories: ['Salary', 'Freelance', 'Food', 'Fun'],
        history: []
      };
      await setDoc(docRef, defaultData, { merge: true });
      set(defaultData);
    }
  },

  // 2. SYNC HELPER (Saves specific changes to cloud)
  syncToCloud: (updates) => {
    const uid = get().uid;
    if (uid) {
      const docRef = doc(db, 'users', uid);
      setDoc(docRef, updates, { merge: true });
    }
  },

  setGoal: (amount, date) => {
    set({ goal: amount, deadline: date || null });
    get().syncToCloud({ goal: amount, deadline: date || null });
  },

  setCurrency: (c) => {
    set({ currency: c });
    get().syncToCloud({ currency: c });
  },

  addTransaction: (tx) => {
    const state = get();
    const newSaved = tx.type === 'add' ? state.saved + tx.amount : state.saved - tx.amount;
    const newTx = { ...tx, id: crypto.randomUUID(), date: new Date().toISOString() };
    const newHistory = [newTx, ...state.history];

    set({ saved: Math.max(0, newSaved), history: newHistory });
    get().syncToCloud({ saved: Math.max(0, newSaved), history: newHistory });
  }
}));