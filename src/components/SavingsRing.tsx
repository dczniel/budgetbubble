import { motion } from 'framer-motion';
import { useStore } from '../store/useStore';
import { useEffect, useState } from 'react';

export const SavingsRing = ({ customSaved, customGoal, customTitle }: { customSaved?: number, customGoal?: number, customTitle?: string }) => {
  const { saved, goal, currency, rates } = useStore();
  
  // 1. CURRENCY MATH FIX
  // We get the specific rate for the selected currency (e.g., 3.67 for AED)
  const rate = rates[currency] || 1;

  // We convert the "Store USD" value into "Display Value"
  const rawSaved = customSaved ?? saved;
  const rawGoal = customGoal ?? goal;
  
  const displaySaved = rawSaved * rate;
  const displayGoal = rawGoal * rate;

  // Percent relies on the ratio, so math doesn't matter, but we calculate it safely
  const percentage = Math.min((rawSaved / rawGoal) * 100, 100);
  const isOverflow = rawSaved > rawGoal;
  
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
  }, [rawSaved]);

  return (
    // 2. LAYOUT FIX: Added 'py-12' (padding vertical) to stop the top glow from being cut off
    <div className="flex flex-col items-center justify-center py-12 relative">
      
      {/* Container that perfectly centers both rings */}
      <div className="relative w-[340px] h-[340px] flex items-center justify-center">
        
        {/* Decorative Dots - Absolute Positioned to be exactly centered behind */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-20">
           <div className="w-[320px] h-[320px] border border-dashed border-slate-400 rounded-full animate-spin-slow" />
        </div>

        {/* The Main SVG - Relative to sit on top */}
        <div className="relative w-[280px] h-[280px] z-10">
          <svg className="w-full h-full transform -rotate-90 drop-shadow-2xl overflow-visible">
            <defs>
              <linearGradient id="ringGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#8b5cf6" />
                <stop offset="100%" stopColor="#c084fc" />
              </linearGradient>
              {/* Expanded filter region to preventing clipping of the glow */}
              <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="6" result="coloredBlur"/>
                <feMerge>
                  <feMergeNode in="coloredBlur"/>
                  <feMergeNode in="SourceGraphic"/>
                </feMerge>
              </filter>
            </defs>

            {/* Track Background */}
            <circle
              cx="140"
              cy="140"
              r={radius}
              stroke="currentColor"
              strokeWidth="12"
              fill="transparent"
              className="text-slate-200 dark:text-slate-800"
            />

            {/* Progress Fill */}
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

          {/* Center Bubble Text */}
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
            <motion.span 
              className="text-6xl font-black text-slate-800 dark:text-white tracking-tighter"
              key={displaySaved}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
            >
              {percentage.toFixed(0)}<span className="text-2xl">%</span>
            </motion.span>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">
              {customTitle || 'Complete'}
            </span>
          </div>
        </div>
      </div>

      {/* Stats under ring - Now using the CONVERTED displaySaved variables */}
      <div className="mt-4 text-center space-y-2 z-10">
        <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">Saved so far</p>
        <div className="flex items-center justify-center gap-2">
          <span className={currency === 'AED' ? 'currency-aed text-2xl text-primary' : 'text-2xl text-primary font-serif'}>
             {currency === 'AED' ? 'D' : currency === 'EUR' ? '€' : '$'}
          </span>
          <span className="text-4xl font-black text-slate-800 dark:text-white">
            {Math.floor(displaySaved).toLocaleString()}
          </span>
          <span className="text-slate-500 text-xl font-medium">/ {Math.floor(displayGoal).toLocaleString()}</span>
        </div>
      </div>
    </div>
  );
};