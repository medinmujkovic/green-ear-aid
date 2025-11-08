import { User } from '@/types/task';

const USER_KEY = 'ecoecho_user';
const USER_TASKS_KEY = 'ecoecho_user_tasks';

export const saveUser = (user: User): void => {
  localStorage.setItem(USER_KEY, JSON.stringify(user));
};

export const getUser = (): User | null => {
  const userData = localStorage.getItem(USER_KEY);
  return userData ? JSON.parse(userData) : null;
};

export const clearUser = (): void => {
  localStorage.removeItem(USER_KEY);
  localStorage.removeItem(USER_TASKS_KEY);
};

export const isAuthenticated = (): boolean => {
  return getUser() !== null;
};
