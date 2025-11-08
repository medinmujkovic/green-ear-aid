export interface Task {
  id: string;
  title: string;
  description: string;
  location: string;
  reward: number;
  category: 'cleanup' | 'planting' | 'monitoring' | 'education';
  assignee: 'government' | 'individual';
  rewardType: 'money' | 'transport' | 'coupon' | 'cinema' | 'other';
  rewardDetails: string;
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
