import { Task } from '../types';

const STORAGE_KEY = 'assistiq_tasks_v1';
const OLD_STORAGE_KEY = 'insuretrack_tasks';

export const getTasks = (): Task[] => {
  let data = localStorage.getItem(STORAGE_KEY);
  
  // Migration from old key if exists
  if (!data) {
    const oldData = localStorage.getItem(OLD_STORAGE_KEY);
    if (oldData) {
      localStorage.setItem(STORAGE_KEY, oldData);
      localStorage.removeItem(OLD_STORAGE_KEY); // Move to new key
      data = oldData;
    }
  }

  if (!data) return [];
  try {
    const parsed = JSON.parse(data);
    // Simple migration/validation: ensure required fields exist
    return Array.isArray(parsed) ? parsed.filter(t => t && t.id && (t.insuranceCompany || t.date)) : [];
  } catch {
    return [];
  }
};

export const saveTasks = (tasks: Task[]) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
};

export const addTask = (task: Task) => {
  const tasks = getTasks();
  tasks.push(task);
  saveTasks(tasks);
};

export const updateTask = (updatedTask: Task) => {
  const tasks = getTasks().map(t => t.id === updatedTask.id ? updatedTask : t);
  saveTasks(tasks);
};

export const deleteTask = (id: string) => {
  const tasks = getTasks().filter(t => t.id !== id);
  saveTasks(tasks);
};
