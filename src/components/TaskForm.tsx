import React, { useState, useEffect } from 'react';
import { Plus, X, Save } from 'lucide-react';
import { TaskStatus, Task } from '../types';
import { cn } from '../lib/utils';
import { motion } from 'motion/react';
import { COMPANIES, STATUSES, AGENTS, PRICES } from '../constants';

interface TaskFormProps {
  onAdd: (task: Task) => void;
  isOpen: boolean;
  onClose: () => void;
  initialData?: Task | null;
}

export default function TaskForm({ onAdd, isOpen, onClose, initialData }: TaskFormProps) {
  const [insuranceCompany, setInsuranceCompany] = useState(COMPANIES[0]);
  const [status, setStatus] = useState<TaskStatus>(STATUSES[0]);
  const [city, setCity] = useState('');
  const [agent, setAgent] = useState(AGENTS[0]);
  const [price, setPrice] = useState<number | string>(PRICES[0]);
  const [isManualPrice, setIsManualPrice] = useState(false);
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    if (initialData) {
      setInsuranceCompany(initialData.insuranceCompany);
      setStatus(initialData.status);
      setCity(initialData.city);
      setAgent(initialData.agent);
      setPrice(initialData.price);
      setDescription(initialData.description || '');
      setDate(initialData.date.split('T')[0]);
      setIsManualPrice(!PRICES.includes(initialData.price));
    } else {
      setInsuranceCompany(COMPANIES[0]);
      setStatus(STATUSES[0]);
      setCity('');
      setAgent(AGENTS[0]);
      setPrice(PRICES[0]);
      setDescription('');
      setDate(new Date().toISOString().split('T')[0]);
      setIsManualPrice(false);
    }
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalPrice = Number(price);
    const newTask: Task = {
      id: initialData?.id || crypto.randomUUID(),
      insuranceCompany,
      status,
      city,
      agent,
      price: finalPrice,
      description,
      date: new Date(date).toISOString(),
      createdAt: initialData?.createdAt || new Date().toISOString(),
    };
    onAdd(newTask);
    onClose();
  };

  return (
    <div 
      className="fixed inset-0 bg-slate-950/60 backdrop-blur-md z-50 flex items-center justify-center p-4 overflow-y-auto cursor-pointer"
      onClick={onClose}
    >
      <div 
        className="glass-card w-full max-w-xl p-8 shadow-2xl relative overflow-hidden my-auto cursor-default"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-blue-500/10 blur-3xl rounded-full"></div>
        
        <div className="flex justify-between items-center mb-8">
          <h2 className="font-bold text-2xl text-white">
            {initialData ? 'Update Mission Record' : 'Log Assistance Mission'}
          </h2>
          <button 
            type="button"
            onClick={onClose} 
            className="p-2 hover:bg-white/10 rounded-full transition-colors text-slate-400 hover:text-white group"
            title="Close Form"
          >
            <X size={24} className="group-hover:rotate-90 transition-transform duration-200" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 relative">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="text-[10px] font-bold uppercase text-slate-400 tracking-widest block mb-2">Insurance Company</label>
              <select
                value={insuranceCompany}
                onChange={(e) => setInsuranceCompany(e.target.value)}
                className="glass-input w-full appearance-none cursor-pointer"
              >
                {COMPANIES.map((c) => (
                  <option key={c} value={c} className="bg-slate-900">{c}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-[10px] font-bold uppercase text-slate-400 tracking-widest block mb-2">Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as TaskStatus)}
                className="glass-input w-full appearance-none cursor-pointer"
              >
                {STATUSES.map((s) => (
                  <option key={s} value={s} className="bg-slate-900">{s}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-[10px] font-bold uppercase text-slate-400 tracking-widest block mb-2">City / Location</label>
              <input
                type="text"
                required
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="glass-input w-full"
                placeholder="e.g. Casablanca"
              />
            </div>

            <div>
              <label className="text-[10px] font-bold uppercase text-slate-400 tracking-widest block mb-2">Price Selection (DH)</label>
              <select
                value={isManualPrice ? 'manual' : price}
                onChange={(e) => {
                  if (e.target.value === 'manual') {
                    setIsManualPrice(true);
                    setPrice('');
                  } else {
                    setIsManualPrice(false);
                    setPrice(Number(e.target.value));
                  }
                }}
                className="glass-input w-full appearance-none cursor-pointer"
              >
                {PRICES.map((p) => (
                  <option key={p} value={p} className="bg-slate-900">{p} DH</option>
                ))}
                <option value="manual" className="bg-slate-900 underline text-blue-400">Manual Entry...</option>
              </select>
            </div>

            {isManualPrice && (
              <motion.div 
                initial={{ opacity: 0, x: -10 }} 
                animate={{ opacity: 1, x: 0 }}
                className="md:col-span-1"
              >
                <label className="text-[10px] font-bold uppercase text-blue-400 tracking-widest block mb-2">Enter Manual Price (DH)</label>
                <input
                  type="number"
                  required
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  className="glass-input w-full border-blue-500/30"
                  placeholder="e.g. 100"
                  min="0"
                />
              </motion.div>
            )}

            <div className="md:col-span-2">
              <label className="text-[10px] font-bold uppercase text-slate-400 tracking-widest block mb-2">Assistance Agent</label>
              <select
                value={agent}
                onChange={(e) => setAgent(e.target.value)}
                className="glass-input w-full appearance-none cursor-pointer"
              >
                {AGENTS.map((a) => (
                  <option key={a} value={a} className="bg-slate-900">{a}</option>
                ))}
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="text-[10px] font-bold uppercase text-slate-400 tracking-widest block mb-2">Task Description (Optional)</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Details of the mission..."
                className="glass-input w-full h-24 resize-none placeholder:text-slate-600"
              />
            </div>

            <div>
              <label className="text-[10px] font-bold uppercase text-slate-400 tracking-widest block mb-2">Service Date</label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="glass-input w-full"
              />
            </div>
          </div>

          <div className="flex gap-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-white/5 text-slate-400 py-4 rounded-xl font-bold text-sm hover:bg-white/10 transition-all border border-white/10"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-[2] bg-blue-600 text-white py-4 rounded-xl font-bold text-sm hover:bg-blue-500 transition-all shadow-lg shadow-blue-600/20 flex items-center justify-center gap-2"
            >
              {initialData ? <Save size={18} /> : <Plus size={18} />}
              {initialData ? 'Update Record' : 'Commit to Database'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
