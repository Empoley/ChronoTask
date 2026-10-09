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
  questId?: string; // Associated project / quest
  completed: boolean;
  completedAt?: string;
  xpReward: number;
  goldReward: number;
  tags: string[];
  createdAt: string;
  notes?: string;
  xpClaimed?: boolean;
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
  bonusXp: number;
  bonusGold: number;
  deadline?: string;
  completed: boolean;
  completedAt?: string;
}

export type EquipmentSlot = 'weapon' | 'armor' | 'relic' | 'helm';
export type ItemRarity = 'common' | 'rare' | 'epic' | 'legendary';

export interface Equipment {
  id: string;
  name: string;
  slot: EquipmentSlot;
  rarity: ItemRarity;
  statBonus: {
    focus?: number;
    discipline?: number;
    willpower?: number;
    streakBonus?: number;
  };
  description: string;
  icon: string;
  unlocked: boolean;
  equipped: boolean;
  unlockRequirement: string;
  progressText?: string;
  progressPercent?: number;
}

export interface Title {
  id: string;
  name: string;
  rarity: ItemRarity;
  description: string;
  unlocked: boolean;
  active: boolean;
  requirement: string;
}

export interface RealmLocation {
  id: string;
  name: string;
  subtitle: string;
  description: string;
  themeColor: string;
  ambientPerk: string;
  bgGradient: string;
  unlocked: boolean;
  active: boolean;
  requirement: string;
}

export interface CharacterProfile {
  name: string;
  title: string;
  characterClass: string;
  avatar: string;
  level: number;
  currentXp: number;
  maxXp: number;
  hp: number;
  maxHp: number;
  gold: number;
  tasksCompleted: number;
  streakDays: number;
  stats: {
    discipline: number; // STR / Task execution
    focus: number;      // INT / Cognitive stamina
    willpower: number;  // CON / Consistency
  };
  currentRealmId: string;
}

export interface GameState {
  character: CharacterProfile;
  tasks: Task[];
  quests: Quest[];
  equipment: Equipment[];
  titles: Title[];
  realms: RealmLocation[];
}
