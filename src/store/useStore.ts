import { create } from 'zustand';
import { doc, getDoc, setDoc, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';
import { db } from '../firebase';

// --- TYPES ---
export type TransactionType = 'add' | 'remove';
export type Currency = 'USD' | 'EUR' | 'AED';
export type Theme = 'light' | 'dark';

export interface Transaction {
  id: string;
  amount: number;
  type: TransactionType;
  category: string;
  date: string;
}

export interface GroupMember {
  id: string;
  username: string;
  saved: number;
  goal: number;
  currency: Currency;
  goalTitle?: string;
  isGhost?: boolean; // NEW: Privacy Flag
}

interface AppState {
  uid: string | null;
  username: string;
  saved: number;
  goal: number;
  goalTitle: string;
  goalCurrency: Currency;
  deadline: string | null;
  currency: Currency;
  theme: Theme;
  isGhost: boolean; // NEW: Your privacy setting
  categories: string[];
  history: Transaction[];
  
  friendIds: string[];
  members: GroupMember[];
  groupsMode: boolean;

  // Actions
  setUser: (uid: string | null) => void;
  loadData: () => Promise<void>;
  syncToCloud: (state: Partial<AppState>) => void;
  resetData: () => Promise<void>;
  
  setGoal: (amount: number, date?: string, currency?: Currency, title?: string) => void;
  setCurrency: (c: Currency) => void;
  setTheme: (t: Theme) => void;
  setUsername: (name: string) => void;
  toggleGhostMode: () => void; // NEW
  addCategory: (cat: string) => void;
  removeCategory: (cat: string) => void;
  addTransaction: (tx: Omit<Transaction, 'id' | 'date'>) => void;
  setGroupsMode: (isGroup: boolean) => void;

  addFriendId: (id: string) => Promise<void>;
  removeFriendId: (id: string) => Promise<void>;
  setLiveMembers: (members: GroupMember[]) => void;
  convertAmount: (amount: number, from: Currency, to: Currency) => number;
}

const RATES = { USD: 1, EUR: 0.92, AED: 3.67 };

export const useStore = create<AppState>((set, get) => ({
  uid: null,
  username: 'Budgeter',
  saved: 0,
  goal: 1000,
  goalTitle: 'Goal',
  goalCurrency: 'USD',
  deadline: null,
  currency: 'USD',
  theme: 'dark',
  isGhost: false, // Default: public
  categories: ['Salary', 'Freelance', 'Food', 'Fun'],
  history: [],
  groupsMode: false,
  
  friendIds: [],
  members: [],

  setUser: (uid) => set({ uid }),
  setGroupsMode: (isGroup) => set({ groupsMode: isGroup }),

  convertAmount: (amount, from, to) => {
    const fromRate = RATES[from] || 1;
    const toRate = RATES[to] || 1;
    if (from === to) return amount;
    const inUSD = amount / fromRate;
    return inUSD * toRate;
  },

  loadData: async () => {
    const uid = get().uid;
    if (!uid) return;

    const docRef = doc(db, 'users', uid);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const data = docSnap.data();
      set({
        ...data,
        friendIds: data.friendIds || [], 
        username: data.username || 'Budgeter',
        saved: data.saved || 0,
        goalTitle: data.goalTitle || 'Goal',
        theme: data.theme || 'dark',
        isGhost: data.isGhost || false,
        categories: data.categories || ['Salary', 'Freelance', 'Food', 'Fun'],
        history: data.history || []
      } as Partial<AppState>);

      if (data.theme === 'dark') document.documentElement.classList.add('dark');
      else document.documentElement.classList.remove('dark');
    } else {
      const defaultData = {
        username: 'Budgeter',
        saved: 0,
        goal: 1000,
        goalTitle: 'Goal',
        goalCurrency: 'USD',
        currency: 'USD',
        theme: 'dark',
        isGhost: false,
        categories: ['Salary', 'Freelance', 'Food', 'Fun'],
        history: [],
        friendIds: []
      };
      await setDoc(docRef, defaultData, { merge: true });
      set(defaultData as any);
    }
  },

  syncToCloud: (updates) => {
    const uid = get().uid;
    if (uid) {
      const docRef = doc(db, 'users', uid);
      const { members, groupsMode, ...cleanUpdates } = updates as any;
      setDoc(docRef, cleanUpdates, { merge: true });
    }
  },

  resetData: async () => {
    const uid = get().uid;
    if (!uid) return;
    
    const freshStart = {
      saved: 0,
      goal: 1000,
      goalTitle: 'Goal',
      goalCurrency: 'USD' as Currency,
      history: [],
      deadline: null,
      friendIds: [],
      isGhost: false
    };
    
    set(freshStart);
    get().syncToCloud(freshStart);
  },

  setGoal: (amount, date, currency, title) => {
    const updates = { 
      goal: amount, 
      deadline: date || null,
      goalCurrency: currency || get().currency,
      goalTitle: title || 'Goal'
    };
    set(updates);
    get().syncToCloud(updates);
  },

  toggleGhostMode: () => {
    const newVal = !get().isGhost;
    set({ isGhost: newVal });
    get().syncToCloud({ isGhost: newVal });
  },

  setCurrency: (c) => {
    set({ currency: c });
    get().syncToCloud({ currency: c });
  },
  
  setUsername: (name) => {
    set({ username: name });
    get().syncToCloud({ username: name });
  },

  setTheme: (t) => {
    set({ theme: t });
    if (t === 'dark') document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
    get().syncToCloud({ theme: t });
  },

  addCategory: (cat) => {
    const { categories } = get();
    if (!categories.includes(cat)) {
      const newCats = [...categories, cat];
      set({ categories: newCats });
      get().syncToCloud({ categories: newCats });
    }
  },

  removeCategory: (cat) => {
    const { categories } = get();
    const newCats = categories.filter(c => c !== cat);
    set({ categories: newCats });
    get().syncToCloud({ categories: newCats });
  },

  addTransaction: (tx) => {
    const state = get();
    const newSaved = tx.type === 'add' ? state.saved + tx.amount : state.saved - tx.amount;
    const newTx = { ...tx, id: crypto.randomUUID(), date: new Date().toISOString() };
    const newHistory = [newTx, ...state.history];

    set({ saved: Math.max(0, newSaved), history: newHistory });
    get().syncToCloud({ saved: Math.max(0, newSaved), history: newHistory });
  },

  addFriendId: async (friendId) => {
    const { uid, friendIds } = get();
    if (!uid) return;
    if (friendIds.includes(friendId)) return;
    if (friendId === uid) return;

    const newIds = [...friendIds, friendId];
    set({ friendIds: newIds });
    const docRef = doc(db, 'users', uid);
    await updateDoc(docRef, { friendIds: arrayUnion(friendId) });
  },

  removeFriendId: async (friendId) => {
    const { uid, friendIds } = get();
    if (!uid) return;
    
    const newIds = friendIds.filter(id => id !== friendId);
    set({ friendIds: newIds });
    const docRef = doc(db, 'users', uid);
    await updateDoc(docRef, { friendIds: arrayRemove(friendId) });
  },

  setLiveMembers: (members) => {
    set({ members });
  }
}));