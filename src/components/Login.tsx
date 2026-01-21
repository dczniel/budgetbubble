import { signInWithPopup } from 'firebase/auth';
import { auth, googleProvider } from '../firebase';
import { motion } from 'framer-motion';

export const Login = () => {
  const handleLogin = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      console.error("Login failed", error);
    }
  };

  return (
    <div className="h-screen w-screen bg-slate-900 flex flex-col items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center space-y-6 max-w-md"
      >
        <div className="mb-8">
          <h1 className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600 mb-2">
            Budget Bubble
          </h1>
          <p className="text-slate-400 text-lg">Gamified savings for friends.</p>
        </div>

        <button
          onClick={handleLogin}
          className="flex items-center justify-center gap-3 w-full bg-white text-slate-900 font-bold py-4 px-8 rounded-xl hover:bg-slate-100 transition-transform active:scale-95 text-lg"
        >
          <img src="https://www.google.com/favicon.ico" alt="G" className="w-6 h-6" />
          Sign in with Google
        </button>
        
        <p className="text-slate-600 text-xs mt-8">
          Your data will be saved to the cloud.
        </p>
      </motion.div>
    </div>
  );
};