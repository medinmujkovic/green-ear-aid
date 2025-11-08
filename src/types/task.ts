export interface Task {
  id: string;
  title: string;
  description: string;
  location: string;
  reward: number;
  category: 'cleanup' | 'planting' | 'monitoring' | 'education';
  asdiInsight: string;
  status?: 'available' | 'in-progress' | 'pending-approval' | 'completed';
  completedAt?: string;
}

export interface User {
  name: string;
  email: string;
  tasksCompleted: number;
  totalRewards: number;
}
