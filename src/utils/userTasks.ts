import { Task } from '@/types/task';

const USER_TASKS_KEY = 'ecoecho_user_tasks';

export const getUserTasks = (): Task[] => {
  const tasks = localStorage.getItem(USER_TASKS_KEY);
  return tasks ? JSON.parse(tasks) : [];
};

export const addUserTask = (task: Task): void => {
  const tasks = getUserTasks();
  tasks.push({ ...task, status: 'in-progress' });
  localStorage.setItem(USER_TASKS_KEY, JSON.stringify(tasks));
};

export const updateTaskStatus = (taskId: string, status: Task['status']): void => {
  const tasks = getUserTasks();
  const updatedTasks = tasks.map(task => 
    task.id === taskId 
      ? { ...task, status, completedAt: status === 'pending-approval' ? new Date().toISOString() : task.completedAt }
      : task
  );
  localStorage.setItem(USER_TASKS_KEY, JSON.stringify(updatedTasks));
};

export const completeTask = (taskId: string): void => {
  updateTaskStatus(taskId, 'pending-approval');
};
