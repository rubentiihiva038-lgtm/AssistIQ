export type TaskStatus = 'Fin mission' | 'Arrangement' | 'Désaccord' | 'Défaut de papier' | 'Blessure' | 'Quittez les lieux' | 'PV de police' | 'Completed' | 'Pending' | 'Problem';

export interface Task {
  id: string;
  insuranceCompany: string;
  status: TaskStatus;
  city: string;
  agent: string;
  price: number;
  description?: string;
  date: string; // ISO string
  createdAt: string;
}

export interface CompanyStats {
  company: string;
  taskCount: number;
  totalRevenue: number;
}

export interface CityStats {
  city: string;
  taskCount: number;
}

export interface ReportingPeriodData {
  tasks: Task[];
  totalTasks: number;
  totalRevenue: number;
  companyBreakdown: CompanyStats[];
  cityBreakdown: CityStats[];
}
