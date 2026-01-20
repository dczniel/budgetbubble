export const getSnarkyMessage = (type: 'add' | 'remove' | 'idle', amount?: number) => {
  const messages = {
    add: [
      "Oh, look at you, actually being responsible.",
      "A tiny step for your wallet, a giant leap for your ego.",
      "Don't spend it all in one place. Oh wait, you saved it.",
      "Finally. I was getting worried.",
    ],
    remove: [
      "I hope that was absolutely necessary.",
      "And... it's gone.",
      "Backsliding? How original.",
      "Your future self is judging you right now.",
    ],
    idle: [
      "Money doesn't grow on div elements.",
      "Staring at the ring won't make it fill up.",
      "Tick tock. Inflation is waiting."
    ]
  };
  
  const pool = messages[type];
  return pool[Math.floor(Math.random() * pool.length)];
};

export const formatCurrency = (amount: number, currency: string, rates: Record<string, number>) => {
  // Convert base (USD in store) to display currency? 
  // Simplified: Assuming store saves in selected currency or handling conversion at input.
  // For this implementation, we assume values in store are RAW units, visuals handle symbol.
  
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
};