import { useState } from 'react';
import { FileText, Lock, Mail, Loader2, ArrowRight } from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '../lib/utils';

interface LoginProps {
  onLogin: (user: string) => void;
}

export default function Login({ onLogin }: LoginProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    // Simulate a professional login process
    setTimeout(() => {
      if (email && password) {
        onLogin(email.split('@')[0]);
      } else {
        setError('Invalid credentials. Please check your entry.');
        setIsLoading(false);
      }
    }, 1500);
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#0a0a0a] relative overflow-hidden font-sans">
      {/* Background Orbs */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/20 rounded-full blur-[120px] animate-pulse" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-emerald-600/10 rounded-full blur-[120px] animate-pulse" />
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md p-8 relative z-10"
      >
        <div className="text-center mb-10">
          <motion.div 
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            className="w-16 h-16 bg-blue-500 rounded-2xl flex items-center justify-center shadow-2xl shadow-blue-500/40 mx-auto mb-6"
          >
            <FileText size={32} className="text-white" />
          </motion.div>
          <h1 className="text-4xl font-black tracking-tight text-white mb-2">Assist IQ</h1>
          <p className="text-slate-400 text-sm font-medium">Enterprise Telemetry & Mission Tracking</p>
        </div>

        <div className="glass-card p-8 border-white/10 backdrop-blur-xl">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 ml-1">Email Terminal</label>
              <div className="relative group">
                <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-400 transition-colors" />
                <input 
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@assistiq.com"
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-3.5 pl-12 pr-4 text-white placeholder:text-slate-600 focus:outline-none focus:border-blue-500/50 focus:bg-white/10 transition-all font-medium"
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-end">
                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 ml-1">Secure Passkey</label>
                <button type="button" className="text-[9px] font-bold text-blue-400/60 hover:text-blue-400 uppercase tracking-widest transition-colors">Recover</button>
              </div>
              <div className="relative group">
                <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-400 transition-colors" />
                <input 
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-3.5 pl-12 pr-4 text-white placeholder:text-slate-600 focus:outline-none focus:border-blue-500/50 focus:bg-white/10 transition-all font-medium"
                />
              </div>
            </div>

            {error && (
              <motion.p 
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="text-red-400 text-xs font-bold bg-red-400/10 p-3 rounded-lg border border-red-400/20"
              >
                {error}
              </motion.p>
            )}

            <button 
              type="submit"
              disabled={isLoading}
              className={cn(
                "w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-4 rounded-xl shadow-xl shadow-blue-500/25 flex items-center justify-center gap-3 transition-all active:scale-[0.98] mt-4",
                isLoading && "opacity-80 cursor-not-allowed"
              )}
            >
              {isLoading ? (
                <>
                  <Loader2 size={20} className="animate-spin text-white/60" />
                  <span className="tracking-wide">Establishing Bridge...</span>
                </>
              ) : (
                <>
                  <span className="tracking-wide">Initialize Dashboard</span>
                  <ArrowRight size={20} />
                </>
              )}
            </button>
          </form>
        </div>

        <div className="mt-8 text-center">
          <p className="text-slate-600 text-[10px] font-bold uppercase tracking-[0.2em]">
            System Online • Secure Node 4.2.0
          </p>
        </div>
      </motion.div>
    </div>
  );
}
