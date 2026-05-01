import { useState, useEffect, useMemo } from 'react';
import { 
  FileText, 
  Plus, 
  Download, 
  LayoutDashboard,
  ChevronLeft,
  ChevronRight,
  Printer,
  Table as TableIcon,
  Search,
  Filter,
  TrendingUp,
  MapPin,
  Building2,
  Edit2,
  Trash2,
  X,
  LogOut,
  User
} from 'lucide-react';
import { 
  format, 
  isSameDay, 
  isSameMonth, 
  isSameYear, 
  parseISO, 
  addMonths, 
  subMonths,
} from 'date-fns';
import { Task, TaskStatus } from './types';
import { getTasks, addTask, updateTask, deleteTask } from './lib/storage';
import { exportToPDF, exportToExcel } from './lib/export';
import TaskForm from './components/TaskForm';
import ReportTable from './components/ReportTable';
import Login from './components/Login';
import { cn } from './lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import { COMPANIES, AGENTS, STATUSES } from './constants';
import GoogleSheetsSync from './components/GoogleSheetsSync';

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<string | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [view, setView] = useState<'dashboard' | 'report'>('dashboard');
  const [period, setPeriod] = useState<'daily' | 'monthly' | 'yearly'>('monthly');
  
  // Search and Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<TaskStatus | 'All'>('All');
  const [companyFilter, setCompanyFilter] = useState<string | 'All'>('All');
  const [agentFilter, setAgentFilter] = useState<string | 'All'>('All');

  useEffect(() => {
    const savedAuth = localStorage.getItem('assistiq_authenticated');
    const savedUser = localStorage.getItem('assistiq_user');
    if (savedAuth === 'true' && savedUser) {
      setIsAuthenticated(true);
      setUser(savedUser);
    }
    setTasks(getTasks());
  }, []);

  const handleLogin = (username: string) => {
    setIsAuthenticated(true);
    setUser(username);
    localStorage.setItem('assistiq_authenticated', 'true');
    localStorage.setItem('assistiq_user', username);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setUser(null);
    localStorage.removeItem('assistiq_authenticated');
    localStorage.removeItem('assistiq_user');
  };

  const handleAddTask = (task: Task) => {
    if (editingTask) {
      updateTask(task);
    } else {
      addTask(task);
    }
    setTasks(getTasks());
    setEditingTask(null);
  };

  const handleDeleteTask = (id: string) => {
    deleteTask(id);
    setTasks(getTasks());
  };

  const handleEditTask = (task: Task) => {
    setEditingTask(task);
    setIsFormOpen(true);
  };

  const filteredTasks = useMemo(() => {
    return tasks.filter(t => {
      const taskDate = parseISO(t.date);
      const matchesPeriod = 
        period === 'daily' ? isSameDay(taskDate, currentDate) :
        period === 'monthly' ? isSameMonth(taskDate, currentDate) :
        isSameYear(taskDate, currentDate);

      const matchesSearch = 
        (t.insuranceCompany || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (t.agent || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (t.status || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (t.city || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (t.description || '').toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus = statusFilter === 'All' || t.status === statusFilter;
      const matchesCompany = companyFilter === 'All' || t.insuranceCompany === companyFilter;
      const matchesAgent = agentFilter === 'All' || t.agent === agentFilter;

      return matchesPeriod && matchesSearch && matchesStatus && matchesCompany && matchesAgent;
    });
  }, [tasks, currentDate, period, searchQuery, statusFilter, companyFilter, agentFilter]);

  const stats = useMemo(() => {
    const periodRevenue = filteredTasks.reduce((sum, t) => sum + t.price, 0);
    const completedTasks = filteredTasks.filter(t => 
      t.status === 'Fin mission' || t.status === 'Completed'
    ).length;
    
    const companySuccess: Record<string, number> = {};
    filteredTasks.forEach(t => {
      companySuccess[t.insuranceCompany] = (companySuccess[t.insuranceCompany] || 0) + 1;
    });
    
    const bestCompany = Object.entries(companySuccess)
      .sort((a, b) => b[1] - a[1])[0]?.[0] || 'N/A';

    return { total: filteredTasks.length, revenue: periodRevenue, completed: completedTasks, bestCompany };
  }, [filteredTasks]);

  const handlePrev = () => setCurrentDate(prev => subMonths(prev, 1));
  const handleNext = () => setCurrentDate(prev => addMonths(prev, 1));

  if (!isAuthenticated) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <div className="min-h-screen flex flex-col md:flex-row text-white bg-[#0a0a0a]">
      {/* Sidebar */}
      <aside className="w-full md:w-64 glass-panel border-r-0 md:border-r border-white/10 p-6 flex flex-col gap-8 md:sticky md:top-0 md:h-screen z-10">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center shadow-lg shadow-blue-500/20">
            <FileText size={18} className="text-white" />
          </div>
          <h1 className="font-bold text-xl tracking-tight">Assist IQ</h1>
        </div>

        <nav className="flex flex-col gap-2">
          <button 
            onClick={() => setView('dashboard')}
            className={cn(
              "flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl transition-all",
              view === 'dashboard' ? "bg-white/10 border border-white/20 text-white" : "text-slate-400 hover:text-slate-100 hover:bg-white/5"
            )}
          >
            <LayoutDashboard size={14} />
            Analytics
          </button>
          <button 
            onClick={() => setView('report')}
            className={cn(
              "flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl transition-all",
              view === 'report' ? "bg-white/10 border border-white/20 text-white" : "text-slate-400 hover:text-slate-100 hover:bg-white/5"
            )}
          >
            <TableIcon size={14} />
            Mission Log
          </button>
        </nav>

        <div className="mt-auto flex flex-col gap-6">
          <div className="flex items-center gap-3 p-3 bg-white/5 rounded-2xl border border-white/10 group">
            <div className="w-10 h-10 bg-slate-800 rounded-xl flex items-center justify-center border border-white/10 group-hover:border-blue-500/50 transition-colors shadow-inner">
              <User size={18} className="text-slate-400 group-hover:text-blue-400" />
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-bold text-white capitalize">{user}</span>
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-tighter">Verified Agent</span>
            </div>
            <button 
              onClick={handleLogout}
              className="ml-auto p-2 text-slate-500 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-all"
              title="Terminate Session"
            >
              <LogOut size={16} />
            </button>
          </div>

          <div className="p-4 bg-blue-600/20 rounded-2xl border border-blue-500/30">
            <p className="text-[10px] text-blue-300 uppercase font-bold tracking-widest mb-1">Company Goal</p>
            <p className="text-lg font-semibold">{stats.total} Missions</p>
            <div className="w-full bg-white/10 h-1.5 rounded-full mt-2">
              <div 
                className="bg-blue-400 h-1.5 rounded-full transition-all duration-1000" 
                style={{ width: `${Math.min((stats.total / 100) * 100, 100)}%` }}
              ></div>
            </div>
          </div>
          <button 
            onClick={() => setIsFormOpen(true)}
            className="w-full bg-blue-500 text-white py-3 px-4 rounded-xl font-bold text-sm hover:bg-blue-600 active:scale-95 transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-500/20"
          >
            <Plus size={16} />
            New Mission
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6 md:p-10 overflow-y-auto">
        <header className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-10">
          <div>
            <div className="flex items-center gap-4 mb-2">
              <div className="flex bg-white/5 p-1 rounded-lg border border-white/10">
                {(['daily', 'monthly', 'yearly'] as const).map((p) => (
                  <button
                    key={p}
                    onClick={() => setPeriod(p)}
                    className={cn(
                      "px-3 py-1 text-[10px] font-bold uppercase tracking-wider rounded-md transition-all",
                      period === p ? "bg-white/10 text-white" : "text-slate-400 hover:text-slate-200"
                    )}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>
            <h2 className="text-3xl font-bold text-white mb-1">
              {view === 'dashboard' ? 'Assist IQ Operations' : 'Performance Registry'}
            </h2>
          </div>
          
          <div className="flex flex-wrap items-center gap-3">
             <div className="flex items-center gap-2 glass-panel rounded-xl p-1">
              <button onClick={handlePrev} className="p-2 hover:bg-white/5 rounded-lg transition-colors">
                <ChevronLeft size={18} />
              </button>
              <span className="text-sm font-semibold min-w-[120px] text-center px-2">
                {period === 'daily' ? format(currentDate, 'MMM dd, yyyy') :
                 period === 'monthly' ? format(currentDate, 'MMMM yyyy') :
                 format(currentDate, 'yyyy')}
              </span>
              <button onClick={handleNext} className="p-2 hover:bg-white/5 rounded-lg transition-colors">
                <ChevronRight size={18} />
              </button>
            </div>

            <div className="flex gap-2">
               <button 
                  onClick={() => exportToPDF(filteredTasks, format(currentDate, 'yyyy-MM-dd'))}
                  className="glass-button p-3"
                  title="Export PDF"
                >
                  <Download size={18} className="text-red-400" />
                </button>
                <button 
                  onClick={() => exportToExcel(filteredTasks, format(currentDate, 'yyyy-MM-dd'))}
                  className="glass-button p-3"
                  title="Export Excel"
                >
                  <TrendingUp size={18} className="text-emerald-400" />
                </button>
                <div className="border-l border-white/10 mx-1 h-10 self-center hidden sm:block" />
                <GoogleSheetsSync tasks={filteredTasks} />
            </div>
          </div>
        </header>

        {view === 'dashboard' ? (
          <div className="space-y-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="glass-card p-6 flex flex-col gap-2 border-l-4 border-blue-500">
                <div className="flex justify-between items-start">
                  <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">Total Missions</p>
                  <FileText size={14} className="text-blue-500" />
                </div>
                <span className="text-4xl font-bold text-white">{stats.total}</span>
                <p className="text-[10px] text-slate-500 font-medium">For the selected period</p>
              </div>

              <div className="glass-card p-6 flex flex-col gap-2 border-l-4 border-emerald-500">
                <div className="flex justify-between items-start">
                  <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">Total Revenue</p>
                  <TrendingUp size={14} className="text-emerald-500" />
                </div>
                <span className="text-4xl font-bold text-white">{stats.revenue.toLocaleString()} <span className="text-sm font-normal text-slate-400">DH</span></span>
                <p className="text-[10px] text-emerald-400 font-bold">Estimated earnings</p>
              </div>

              <div className="glass-card p-6 flex flex-col gap-2 border-l-4 border-white/20">
                <div className="flex justify-between items-start">
                  <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">Major Partner</p>
                  <Building2 size={14} className="text-slate-400" />
                </div>
                <span className="text-xl font-bold text-white mt-2 truncate">{stats.bestCompany}</span>
                <p className="text-[10px] text-slate-500 font-medium whitespace-nowrap">Highest volume provider</p>
              </div>

              <div className="glass-card p-6 flex flex-col gap-2 border-l-4 border-amber-500">
                <div className="flex justify-between items-start">
                  <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">Success Rate</p>
                  <div className="w-3 h-3 rounded-full bg-amber-500 shadow-lg shadow-amber-500/50"></div>
                </div>
                <span className="text-4xl font-bold text-white">
                  {stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0}%
                </span>
                <p className="text-[10px] text-amber-500 font-bold">Missions completed</p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              <div className="lg:col-span-8 glass-card overflow-hidden">
                <div className="p-6 border-b border-white/10 flex items-center justify-between bg-white/5">
                  <h3 className="font-bold text-lg">Live Feed</h3>
                  <div className="flex gap-2">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                  </div>
                </div>
                <div className="divide-y divide-white/5 max-h-[400px] overflow-y-auto">
                  {filteredTasks.slice().reverse().map(task => (
                    <div key={task.id} className="p-4 flex items-center justify-between hover:bg-white/5 transition-colors">
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-white">{task.insuranceCompany}</span>
                          <span className={cn(
                            "text-[8px] font-bold px-1.5 py-0.5 rounded border uppercase",
                            (task.status === 'Completed' || task.status === 'Fin mission') ? "border-emerald-500/30 text-emerald-400 bg-emerald-500/10" :
                            (task.status === 'Problem' || task.status === 'Désaccord' || task.status === 'Défaut de papier' || task.status === 'Blessure' || task.status === 'Quittez les lieux') ? "border-red-500/30 text-red-400 bg-red-500/10" :
                            "border-blue-500/30 text-blue-400 bg-blue-500/10"
                          )}>
                            {task.status}
                          </span>
                        </div>
                        <span className="text-xs text-slate-400 truncate max-w-[200px] sm:max-w-md">{task.description}</span>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="flex flex-col items-end gap-1">
                           <span className="text-sm font-bold text-emerald-400 font-mono">+{task.price || 0} DH</span>
                           <span className="text-[10px] text-slate-500">{task.date ? format(parseISO(task.date), 'MMM dd') : 'N/A'}</span>
                        </div>
                        <div className="flex gap-1">
                           <button 
                             onClick={() => handleEditTask(task)}
                             className="p-2 hover:bg-blue-500/20 text-blue-400 rounded-lg transition-colors"
                           >
                             <Edit2 size={12} />
                           </button>
                           <button 
                             onClick={() => {
                               if (confirm('Delete mission?')) handleDeleteTask(task.id);
                             }}
                             className="p-2 hover:bg-red-500/20 text-red-400 rounded-lg transition-colors"
                           >
                             <Trash2 size={12} />
                           </button>
                        </div>
                      </div>
                    </div>
                  ))}
                  {filteredTasks.length === 0 && (
                    <div className="p-20 text-center flex flex-col items-center gap-4">
                      <Search size={40} className="text-slate-700" />
                      <p className="text-sm text-slate-500">No telemetry matches your filter path</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="lg:col-span-4 space-y-6">
                <div className="glass-card p-6">
                   <h4 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-6 flex items-center gap-2">
                     <TrendingUp size={12} /> Agent Performance
                   </h4>
                   <div className="space-y-4">
                     {AGENTS.map(agent => {
                       const agentTasks = filteredTasks.filter(t => t.agent === agent);
                       const revenue = agentTasks.reduce((sum, t) => sum + t.price, 0);
                       const count = agentTasks.length;
                       const pct = stats.revenue > 0 ? (revenue / stats.revenue) * 100 : 0;
                       
                       return (
                         <div key={agent} className="space-y-1">
                           <div className="flex justify-between text-xs mb-1">
                             <div className="flex flex-col">
                               <span className="capitalize text-slate-300">{agent}</span>
                               <div className="flex items-center gap-2 mt-1">
                                 <button 
                                   onClick={() => exportToPDF(agentTasks, `${agent}_Report`)}
                                   className="text-[8px] flex items-center gap-0.5 text-slate-500 hover:text-blue-400 transition-colors"
                                 >
                                   <FileText size={8} /> PDF
                                 </button>
                                 <button 
                                   onClick={() => exportToExcel(agentTasks, `${agent}_Report`)}
                                   className="text-[8px] flex items-center gap-0.5 text-slate-500 hover:text-emerald-400 transition-colors"
                                 >
                                   <TableIcon size={8} /> Excel
                                 </button>
                               </div>
                             </div>
                             <div className="text-right">
                               <div className="font-bold text-white">{revenue.toLocaleString()} DH</div>
                               <div className="text-[9px] text-slate-500">{count} records</div>
                             </div>
                           </div>
                           <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                             <motion.div 
                               initial={{ width: 0 }}
                               animate={{ width: `${pct}%` }}
                               transition={{ duration: 1, ease: "easeOut" }}
                               className="bg-blue-500 h-full rounded-full" 
                             />
                           </div>
                         </div>
                       );
                     })}
                     {filteredTasks.length === 0 && <p className="text-xs text-slate-600 italic">No mission data</p>}
                   </div>
                </div>

                <div className="glass-card p-6">
                   <h4 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-6 flex items-center gap-2">
                     <MapPin size={12} /> Geographic Spread
                   </h4>
                   <div className="space-y-4">
                     {Array.from(new Set(filteredTasks.map(t => t.city))).slice(0, 5).map(city => {
                       const count = filteredTasks.filter(t => t.city === city).length;
                       const pct = (count / filteredTasks.length) * 100;
                       return (
                         <div key={city} className="space-y-1">
                           <div className="flex justify-between text-xs">
                             <span>{city}</span>
                             <span className="font-bold">{count}</span>
                           </div>
                           <div className="h-1 bg-white/10 rounded-full">
                             <div className="bg-blue-500 h-full rounded-full" style={{ width: `${pct}%` }}></div>
                           </div>
                         </div>
                       );
                     })}
                     {filteredTasks.length === 0 && <p className="text-xs text-slate-600 italic">Static unavailable</p>}
                   </div>
                </div>

                <div className="glass-card p-6 bg-gradient-to-br from-blue-600/10 to-transparent">
                   <h4 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-4">Support</h4>
                   <p className="text-xs text-slate-400 leading-relaxed italic">
                     "Tracking every assist mission with precision provides the data needed for carrier audits."
                   </p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <AnimatePresence mode="wait">
            <motion.div
              key="report-view"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="space-y-6"
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 glass-card p-6">
                <div className="flex flex-col">
                  <h3 className="text-white font-bold">Mission Records</h3>
                  <div className="flex items-center gap-2">
                    <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">
                      Found {filteredTasks.length} {filteredTasks.length === 1 ? 'record' : 'records'} 
                      {(searchQuery || statusFilter !== 'All' || companyFilter !== 'All' || agentFilter !== 'All') && ' matching filters'}
                    </p>
                    {(searchQuery || statusFilter !== 'All' || companyFilter !== 'All' || agentFilter !== 'All') && (
                      <button
                        onClick={() => {
                          setSearchQuery('');
                          setStatusFilter('All');
                          setCompanyFilter('All');
                          setAgentFilter('All');
                        }}
                        className="text-[9px] font-bold text-blue-400 hover:text-blue-300 uppercase tracking-widest transition-colors flex items-center gap-1 bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/20"
                      >
                        <X size={8} />
                        Reset
                      </button>
                    )}
                  </div>
                </div>
                
                <div className="flex flex-wrap items-center gap-3">
                  <div className="relative min-w-[200px]">
                    <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                    <input 
                       type="text"
                       placeholder="Global search..."
                       value={searchQuery}
                       onChange={(e) => setSearchQuery(e.target.value)}
                       className="glass-input pl-9 w-full !py-2 text-sm"
                    />
                  </div>
                  
                  <div className="flex items-center gap-2 bg-white/5 px-3 py-2 rounded-xl border border-white/10 group focus-within:border-blue-500/30 transition-colors">
                     <Filter size={14} className="text-slate-500 group-focus-within:text-blue-400" />
                     <select 
                       value={statusFilter}
                       onChange={(e) => setStatusFilter(e.target.value as any)}
                       className="bg-transparent text-sm text-slate-300 outline-none appearance-none cursor-pointer pr-4"
                     >
                       <option value="All" className="bg-slate-900">All Statuses</option>
                       {STATUSES.map(s => <option key={s} value={s} className="bg-slate-900">{s}</option>)}
                     </select>
                  </div>

                  <div className="flex items-center gap-2 bg-white/5 px-3 py-2 rounded-xl border border-white/10 group focus-within:border-blue-500/30 transition-colors">
                     <Building2 size={14} className="text-slate-500 group-focus-within:text-blue-400" />
                     <select 
                       value={companyFilter}
                       onChange={(e) => setCompanyFilter(e.target.value)}
                       className="bg-transparent text-sm text-slate-300 outline-none appearance-none cursor-pointer pr-4"
                     >
                       <option value="All" className="bg-slate-900">All Companies</option>
                       {COMPANIES.map(c => <option key={c} value={c} className="bg-slate-900">{c}</option>)}
                     </select>
                  </div>

                  <div className="flex items-center gap-2 bg-white/5 px-3 py-2 rounded-xl border border-white/10 group focus-within:border-blue-500/30 transition-colors">
                     <MapPin size={14} className="text-slate-500 group-focus-within:text-blue-400" />
                     <select 
                       value={agentFilter}
                       onChange={(e) => setAgentFilter(e.target.value)}
                       className="bg-transparent text-sm text-slate-300 outline-none appearance-none cursor-pointer pr-4"
                     >
                       <option value="All" className="bg-slate-900">All Agents</option>
                       {AGENTS.map(a => <option key={a} value={a} className="bg-slate-900">{a}</option>)}
                     </select>
                  </div>

                  <button
                    onClick={() => {
                      if (confirm('Erase ALL mission records? This cannot be undone.')) {
                        localStorage.removeItem('assistiq_tasks_v1');
                        setTasks([]);
                      }
                    }}
                    className="p-2 hover:bg-red-500/10 text-red-500/40 hover:text-red-500 rounded-lg transition-colors border border-transparent hover:border-red-500/20"
                    title="Erase All Records"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                 <div className="glass-card p-6">
                    <h4 className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-4">Performance by Agent</h4>
                    <div className="space-y-3">
                      {AGENTS.map(agent => {
                        const agentTasks = filteredTasks.filter(t => t.agent === agent);
                        const revenue = agentTasks.reduce((sum, t) => sum + t.price, 0);
                        const count = agentTasks.length;
                        if (count === 0) return null;
                        return (
                          <div key={agent} className="flex justify-between items-center text-sm border-b border-white/5 pb-2 last:border-0 last:pb-0">
                            <div>
                               <div className="text-slate-300 capitalize text-xs">{agent}</div>
                               <div className="flex items-center gap-2 mt-0.5">
                                 <button 
                                   onClick={() => exportToPDF(agentTasks, `Agent_${agent.replace(' ', '_')}`)}
                                   className="text-[9px] text-blue-400 hover:underline flex items-center gap-0.5"
                                 >
                                   PDF
                                 </button>
                                 <span className="text-[9px] text-slate-700">|</span>
                                 <button 
                                   onClick={() => exportToExcel(agentTasks, `Agent_${agent.replace(' ', '_')}`)}
                                   className="text-[9px] text-emerald-400 hover:underline flex items-center gap-0.5"
                                 >
                                   Excel
                                 </button>
                               </div>
                               <div className="text-[10px] text-slate-500 mt-0.5">{count} missions</div>
                            </div>
                            <span className="font-bold text-emerald-400 font-mono">{revenue.toLocaleString()} DH</span>
                          </div>
                        );
                      })}
                      {filteredTasks.length === 0 && <p className="text-xs text-slate-600 italic">No agent data</p>}
                    </div>
                 </div>

                 <div className="glass-card p-6">
                    <h4 className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-4">Revenue by Company</h4>
                    <div className="space-y-3">
                      {COMPANIES.map(company => {
                        const companyTasks = filteredTasks.filter(t => t.insuranceCompany === company);
                        const revenue = companyTasks.reduce((sum, t) => sum + t.price, 0);
                        if (companyTasks.length === 0) return null;
                        return (
                          <div key={company} className="flex justify-between items-center text-sm">
                            <span className="text-slate-300">{company}</span>
                            <div className="flex gap-4">
                              <span className="text-slate-500">{companyTasks.length} missions</span>
                              <span className="font-bold text-white">{revenue.toLocaleString()} DH</span>
                            </div>
                          </div>
                        );
                      })}
                      {filteredTasks.length === 0 && <p className="text-xs text-slate-600 italic">No company data for this period</p>}
                    </div>
                 </div>

                 <div className="glass-card p-6">
                    <h4 className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-4">Tasks by City</h4>
                    <div className="flex flex-wrap gap-2">
                       {Array.from(new Set(filteredTasks.map(t => t.city))).map(city => {
                         const count = filteredTasks.filter(t => t.city === city).length;
                         return (
                           <div key={city} className="px-3 py-1 bg-white/5 border border-white/10 rounded-full flex gap-2 items-center">
                             <span className="text-xs text-slate-300">{city}</span>
                             <span className="text-[10px] font-bold text-blue-400">{count}</span>
                           </div>
                         );
                       })}
                       {filteredTasks.length === 0 && <p className="text-xs text-slate-600 italic">No city data for this period</p>}
                    </div>
                 </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                 <div className="glass-card p-6">
                    <h4 className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-4">Mission Categorization</h4>
                    <div className="overflow-x-auto">
                      <table className="w-full text-left">
                        <thead>
                          <tr className="border-b border-white/10">
                            <th className="pb-2 text-[9px] font-bold uppercase text-slate-500">Category</th>
                            <th className="pb-2 text-[9px] font-bold uppercase text-slate-500 text-center">Count</th>
                            <th className="pb-2 text-[9px] font-bold uppercase text-slate-500 text-center">Rate</th>
                            <th className="pb-2 text-[9px] font-bold uppercase text-slate-500 text-right">Subtotal</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                          {[
                            { name: 'URBAN', price: 30 },
                            { name: 'RAYOUN', price: 60 },
                            { name: 'URBAN PRISE PHOTO', price: 10 },
                            { name: 'RAYOUN PRIS PHOTO', price: 15 },
                          ].map(cat => {
                            const count = filteredTasks.filter(t => t.price === cat.price).length;
                            return (
                              <tr key={cat.name}>
                                <td className="py-2 text-[10px] font-bold text-slate-300">{cat.name}</td>
                                <td className="py-2 text-xs text-white text-center font-mono">{count}</td>
                                <td className="py-2 text-[10px] text-slate-500 text-center font-mono">{cat.price} DH</td>
                                <td className="py-2 text-xs font-bold text-emerald-400 text-right font-mono">{(count * cat.price).toLocaleString()} DH</td>
                              </tr>
                            );
                          })}
                          <tr className="bg-white/5 font-bold">
                            <td className="py-2 px-2 text-[10px] text-white">TOTAL SUM</td>
                            <td className="py-2 text-xs text-white text-center font-mono">
                              {filteredTasks.filter(t => [30, 60, 10, 15].includes(t.price)).length}
                            </td>
                            <td className="py-2"></td>
                            <td className="py-2 px-2 text-xs text-emerald-400 text-right font-mono">
                              {filteredTasks.filter(t => [30, 60, 10, 15].includes(t.price)).reduce((sum, t) => sum + t.price, 0).toLocaleString()} DH
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                 </div>

                 <div className="glass-card p-6">
                    <h4 className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-4 text-center">Global Performance Progress</h4>
                    <div className="flex flex-col items-center justify-center h-full gap-4">
                      <div className="relative w-32 h-32">
                        <svg className="w-full h-full" viewBox="0 0 36 36">
                          <path
                            className="text-white/5 stroke-current"
                            strokeWidth="3"
                            fill="none"
                            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                          />
                          <motion.path
                            initial={{ pathLength: 0 }}
                            animate={{ pathLength: stats.total > 0 ? 1 : 0 }}
                            transition={{ duration: 2, ease: "easeOut" }}
                            className="text-blue-500 stroke-current"
                            strokeWidth="3"
                            strokeDasharray="100, 100"
                            fill="none"
                            strokeLinecap="round"
                            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                          />
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                          <span className="text-2xl font-bold text-white">{stats.total}</span>
                          <span className="text-[8px] text-slate-500 uppercase tracking-widest">Total Missions</span>
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="text-xl font-bold text-emerald-400 font-mono">{stats.revenue.toLocaleString()} DH</div>
                        <div className="text-[9px] text-slate-500 uppercase tracking-widest font-bold">Total Earnings</div>
                      </div>
                    </div>
                 </div>
              </div>

              <div className="glass-card overflow-hidden">
                <ReportTable 
                  tasks={filteredTasks} 
                  onEdit={handleEditTask}
                  onDelete={handleDeleteTask}
                />
              </div>
            </motion.div>
          </AnimatePresence>
        )}
      </main>

      <TaskForm 
        isOpen={isFormOpen} 
        initialData={editingTask}
        onClose={() => {
          setIsFormOpen(false);
          setEditingTask(null);
        }} 
        onAdd={handleAddTask} 
      />
    </div>
  );
}
