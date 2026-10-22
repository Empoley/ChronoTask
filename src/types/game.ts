export type TaskDifficulty = 'easy' | 'medium' | 'hard' | 'epic';

export type TaskProximity = 
  | 'overdue' 
  | 'today' 
  | 'this_week' 
  | 'next_week' 
  | 'next_month' 
  | 'later';

export interface Task {
  id: string;
  title: string;
  description: string;
  deadline: string; // ISO string e.g. '2026-10-17T18:00'
  difficulty: TaskDifficulty;
  questId?: string; // Associated project
  completed: boolean;
  completedAt?: string;
  tags: string[];
  createdAt: string;
  notes?: string;
}

export interface QuestMilestone {
  id: string;
  title: string;
  completed: boolean;
}

export interface Quest {
  id: string;
  title: string;
  description: string;
  color: string;
  icon: string;
  milestones: QuestMilestone[];
  deadline?: string;
  completed: boolean;
  completedAt?: string;
}

export interface GameState {
  tasks: Task[];
  quests: Quest[];
}
