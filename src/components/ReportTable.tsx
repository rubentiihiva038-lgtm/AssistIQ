import { Task, TaskStatus } from '../types';
import { cn } from '../lib/utils';
import { format, parseISO } from 'date-fns';
import { Edit2, Trash2 } from 'lucide-react';

interface ReportTableProps {
  tasks: Task[];
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
}

const statusColors: Record<TaskStatus, string> = {
  'Fin mission': 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  'Arrangement': 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  'Désaccord': 'bg-red-500/20 text-red-400 border-red-500/30',
  'Défaut de papier': 'bg-red-500/20 text-red-400 border-red-500/30',
  'Blessure': 'bg-red-500/20 text-red-400 border-red-500/30',
  'Quittez les lieux': 'bg-red-500/20 text-red-400 border-red-500/30',
  'PV de police': 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  Completed: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  Pending: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  Problem: 'bg-red-500/20 text-red-400 border-red-500/30',
};

export default function ReportTable({ tasks, onEdit, onDelete }: ReportTableProps) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left border-collapse min-w-[800px]">
        <thead>
          <tr className="bg-white/10 border-b border-white/10">
            <th className="p-4 text-[10px] font-bold uppercase tracking-widest text-slate-400">Date</th>
            <th className="p-4 text-[10px] font-bold uppercase tracking-widest text-slate-400">Company</th>
            <th className="p-4 text-[10px] font-bold uppercase tracking-widest text-slate-400">Status</th>
            <th className="p-4 text-[10px] font-bold uppercase tracking-widest text-slate-400">City</th>
            <th className="p-4 text-[10px] font-bold uppercase tracking-widest text-slate-400">Agent</th>
            <th className="p-4 text-[10px] font-bold uppercase tracking-widest text-slate-400 text-right">Price</th>
            <th className="p-4 text-[10px] font-bold uppercase tracking-widest text-slate-400 text-center">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-white/5">
          {tasks.map((task) => (
            <tr key={task.id} className="hover:bg-white/5 transition-colors group cursor-default">
              <td className="p-4 text-sm text-slate-300 font-mono">
                {task.date ? format(parseISO(task.date), 'MMM dd') : 'N/A'}
              </td>
              <td className="p-4 text-sm font-bold text-white">
                {task.insuranceCompany}
              </td>
              <td className="p-4 text-sm">
                <span className={cn(
                  "px-2 py-0.5 rounded-full text-[10px] font-bold uppercase border",
                  statusColors[task.status]
                )}>
                  {task.status}
                </span>
              </td>
              <td className="p-4 text-sm text-slate-400 group-hover:text-slate-200 transition-colors">
                {task.city}
              </td>
              <td className="p-4 text-sm text-slate-400">
                {task.agent}
              </td>
              <td className="p-4 text-sm font-mono text-right text-emerald-400 font-bold">
                {task.price.toLocaleString()} DH
              </td>
              <td className="p-4 text-sm">
                <div className="flex items-center justify-center gap-2">
                  <button 
                    onClick={() => onEdit(task)}
                    className="p-2 hover:bg-blue-500/20 text-blue-400 rounded-lg transition-colors"
                    title="Edit Mission"
                  >
                    <Edit2 size={14} />
                  </button>
                  <button 
                    onClick={() => {
                      if (confirm('Delete this mission record permanently?')) {
                        onDelete(task.id);
                      }
                    }}
                    className="p-2 hover:bg-red-500/20 text-red-400 rounded-lg transition-colors"
                    title="Delete Mission"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </td>
            </tr>
          ))}
          {tasks.length === 0 && (
            <tr>
              <td colSpan={7} className="p-12 text-center text-sm text-slate-500 italic">
                No missions matching the current criteria
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
