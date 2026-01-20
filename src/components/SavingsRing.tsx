import { motion } from 'framer-motion';
import { useStore } from '../store/useStore';
import { useEffect, useState } from 'react';

export const SavingsRing = ({ customSaved, customGoal, customTitle }: { customSaved?: number, customGoal?: number, customTitle?: string }) => {
  const { saved, goal, currency } = useStore();
  
  const activeSaved = customSaved ?? saved;
  const activeGoal = customGoal ?? goal;
  const percentage = Math.min((activeSaved / activeGoal) * 100, 100);
  const isOverflow = activeSaved > activeGoal;
  
  // SVG Config
  const radius = 120;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  // Snarky visual state
  const [glowIntensity, setGlowIntensity] = useState(0);

  useEffect(() => {
    setGlowIntensity(1);
    const t = setTimeout(() => setGlowIntensity(0), 1000);
    return () => clearTimeout(t);
  }, [activeSaved]);

  return (
    <div className="relative flex flex-col items-center justify-center p-8">
      {/* Decorative Dots */}
      <div className="absolute inset-0 flex items-center justify-center opacity-20 pointer-events-none">
         <div className="w-[300px] h-[300px] border border-dashed border-slate-400 rounded-full animate-spin-slow" />
      </div>

      <div className="relative w-[280px] h-[280px]">
        <svg className="w-full h-full transform -rotate-90 drop-shadow-xl">
          <defs>
            <linearGradient id="ringGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#8b5cf6" />
              <stop offset="100%" stopColor="#c084fc" />
            </linearGradient>
            <filter id="glow">
              <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
              <feMerge>
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
          </defs>

          {/* Track */}
          <circle
            cx="140"
            cy="140"
            r={radius}
            stroke="currentColor"
            strokeWidth="12"
            fill="transparent"
            className="text-slate-200 dark:text-slate-800"
          />

          {/* Progress */}
          <motion.circle
            cx="140"
            cy="140"
            r={radius}
            stroke="url(#ringGradient)"
            strokeWidth="12"
            fill="transparent"
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset }}
            transition={{ duration: 1.5, ease: "easeOut" }}
            filter="url(#glow)"
            className={isOverflow ? "drop-shadow-[0_0_15px_rgba(139,92,246,0.5)]" : ""}
          />
        </svg>

        {/* Center Bubble */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <motion.span 
            className="text-5xl font-black text-slate-800 dark:text-white tracking-tighter"
            key={activeSaved}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
          >
            {percentage.toFixed(0)}%
          </motion.span>
          <span className="text-sm font-medium text-slate-500 uppercase tracking-widest mt-1">
            {customTitle || 'Complete'}
          </span>
          {isOverflow && (
            <span className="text-xs text-green-500 font-bold mt-2 animate-bounce">
              Overachiever!
            </span>
          )}
        </div>
      </div>

      {/* Stats under ring */}
      <div className="mt-8 text-center space-y-1">
        <p className="text-slate-500 text-sm font-medium">Saved so far</p>
        <div className="flex items-baseline justify-center gap-1">
          <span className={currency === 'AED' ? 'currency-aed text-lg' : 'text-lg'}>
             {currency === 'AED' ? 'D' : currency === 'EUR' ? '€' : '$'}
          </span>
          <span className="text-3xl font-bold text-slate-800 dark:text-white">
            {activeSaved.toLocaleString()}
          </span>
          <span className="text-slate-400 text-lg">/ {activeGoal.toLocaleString()}</span>
        </div>
      </div>
    </div>
  );
};