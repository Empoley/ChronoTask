'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { GameState, Task, Quest, TaskDifficulty, Equipment, Title, RealmLocation } from '@/types/game';
import { getDefaultSeedData } from '@/data/seedData';
import { sound } from '@/utils/audio';

const STORAGE_KEY = 'chrono_quest_game_state_v1';

interface LevelUpEvent {
  oldLevel: number;
  newLevel: number;
  unlockedFeatures: string[];
}

interface GameContextType {
  state: GameState;
  addTask: (data: {
    title: string;
    description: string;
    deadline: string;
    difficulty: TaskDifficulty;
    questId?: string;
    tags?: string[];
  }) => void;
  toggleTaskComplete: (taskId: string) => void;
  updateTaskNotes: (taskId: string, notes: string) => void;
  deleteTask: (taskId: string) => void;
  addQuest: (data: {
    title: string;
    description: string;
    color: string;
    icon: string;
    milestoneTitles: string[];
    deadline?: string;
  }) => void;
  toggleMilestone: (questId: string, milestoneId: string) => void;
  equipItem: (itemId: string) => void;
  setActiveTitle: (titleId: string) => void;
  setActiveRealm: (realmId: string) => void;
  resetDemoData: () => void;
  levelUpModal: LevelUpEvent | null;
  dismissLevelUpModal: () => void;
  isSoundMuted: boolean;
  toggleSoundMuted: () => void;
  filterProximity: string | null;
  setFilterProximity: (proximity: string | null) => void;
}

const GameContext = createContext<GameContextType | undefined>(undefined);

export function GameProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<GameState>(() => getDefaultSeedData());
  const [isLoaded, setIsLoaded] = useState(false);
  const [levelUpModal, setLevelUpModal] = useState<LevelUpEvent | null>(null);
  const [isSoundMuted, setIsSoundMuted] = useState(false);
  const [filterProximity, setFilterProximity] = useState<string | null>(null);

  // Load state from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.character && parsed.tasks) {
          setState(parsed);
        }
      }
    } catch {
      // Ignore parse errors, fallback to default seed
    }
    setIsLoaded(true);
  }, []);

  // Save state to localStorage whenever state changes
  useEffect(() => {
    if (isLoaded) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
      } catch {
        // quota exceeded or storage disabled
      }
    }
  }, [state, isLoaded]);

  const triggerConfetti = useCallback(async (isEpic: boolean = false) => {
    try {
      const confetti = (await import('canvas-confetti')).default;
      if (isEpic) {
        confetti({
          particleCount: 120,
          spread: 80,
          origin: { y: 0.6 },
          colors: ['#f59e0b', '#ec4899', '#8b5cf6', '#10b981', '#3b82f6']
        });
      } else {
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.7 },
          colors: ['#f59e0b', '#3b82f6', '#10b981']
        });
      }
    } catch {
      // Confetti optional
    }
  }, []);

  const toggleSoundMuted = useCallback(() => {
    setIsSoundMuted(prev => {
      const next = !prev;
      sound.setSoundEnabled(!next);
      return next;
    });
  }, []);

  // Check achievement & item unlocks based on progression
  const evaluateUnlocks = (
    updatedState: GameState, 
    newLevel: number, 
    completedCount: number
  ): { updatedEquipment: Equipment[]; updatedTitles: Title[]; updatedRealms: RealmLocation[]; newlyUnlocked: string[] } => {
    const newlyUnlocked: string[] = [];

    // Equipment unlocks
    const updatedEquipment = updatedState.equipment.map(item => {
      if (item.unlocked) return item;

      let shouldUnlock = false;
      if (item.id === 'eq-5' && completedCount >= 20) {
        shouldUnlock = true;
      } else if (item.id === 'eq-6' && newLevel >= 5) {
        shouldUnlock = true;
      }

      if (shouldUnlock) {
        newlyUnlocked.push(`Equipment: ${item.name}`);
        return { ...item, unlocked: true, progressPercent: 100 };
      }
      return item;
    });

    // Title unlocks
    const updatedTitles = updatedState.titles.map(title => {
      if (title.unlocked) return title;

      let shouldUnlock = false;
      if (title.id === 'title-4' && newLevel >= 6) {
        shouldUnlock = true;
      }

      if (shouldUnlock) {
        newlyUnlocked.push(`Title: "${title.name}"`);
        return { ...title, unlocked: true };
      }
      return title;
    });

    // Realm unlocks
    const updatedRealms = updatedState.realms.map(realm => {
      if (realm.unlocked) return realm;

      let shouldUnlock = false;
      if (realm.id === 'realm-4' && newLevel >= 5) {
        shouldUnlock = true;
      }

      if (shouldUnlock) {
        newlyUnlocked.push(`Realm: ${realm.name}`);
        return { ...realm, unlocked: true };
      }
      return realm;
    });

    return { updatedEquipment, updatedTitles, updatedRealms, newlyUnlocked };
  };

  const addTask = useCallback((data: {
    title: string;
    description: string;
    deadline: string;
    difficulty: TaskDifficulty;
    questId?: string;
    tags?: string[];
  }) => {
    const xpRewards: Record<TaskDifficulty, number> = {
      easy: 30,
      medium: 65,
      hard: 140,
      epic: 280
    };

    const goldRewards: Record<TaskDifficulty, number> = {
      easy: 15,
      medium: 35,
      hard: 75,
      epic: 150
    };

    const newTask: Task = {
      id: `task-${Date.now()}`,
      title: data.title.trim(),
      description: data.description?.trim() || '',
      deadline: data.deadline,
      difficulty: data.difficulty,
      questId: data.questId || undefined,
      completed: false,
      xpReward: xpRewards[data.difficulty] || 50,
      goldReward: goldRewards[data.difficulty] || 25,
      tags: data.tags && data.tags.length > 0 ? data.tags : ['Quest'],
      createdAt: new Date().toISOString()
    };

    setState(prev => ({
      ...prev,
      tasks: [newTask, ...prev.tasks]
    }));
  }, []);

  const toggleTaskComplete = useCallback((taskId: string) => {
    setState(prev => {
      const taskIndex = prev.tasks.findIndex(t => t.id === taskId);
      if (taskIndex === -1) return prev;

      const target = prev.tasks[taskIndex];
      const isNowCompleted = !target.completed;

      // If unchecking, it goes back into tasks, but xpClaimed stays true so it won't award EXP again!
      if (!isNowCompleted) {
        const updatedTasks = [...prev.tasks];
        updatedTasks[taskIndex] = {
          ...target,
          completed: false,
          completedAt: undefined,
          xpClaimed: true // Retained!
        };

        return {
          ...prev,
          tasks: updatedTasks
        };
      }

      // MARKING COMPLETE: Check if XP was already claimed previously
      const isAlreadyClaimed = !!target.xpClaimed;
      const xpToAward = isAlreadyClaimed ? 0 : target.xpReward;
      const goldToAward = isAlreadyClaimed ? 0 : target.goldReward;

      const updatedTasks = [...prev.tasks];
      updatedTasks[taskIndex] = {
        ...target,
        completed: true,
        completedAt: new Date().toISOString(),
        xpClaimed: true
      };

      sound.playTaskComplete();
      triggerConfetti(target.difficulty === 'epic');

      // If XP was already claimed before, don't award EXP or level up
      if (isAlreadyClaimed) {
        return {
          ...prev,
          tasks: updatedTasks
        };
      }

      // Fresh completion: award XP, stats, check level up
      let disciplineDelta = target.difficulty === 'epic' ? 3 : target.difficulty === 'hard' ? 2 : 1;
      let focusDelta = 1;
      let willpowerDelta = 1;

      let newCurrentXp = prev.character.currentXp + xpToAward;
      let newLevel = prev.character.level;
      let newMaxXp = prev.character.maxXp;
      let didLevelUp = false;
      const oldLevel = prev.character.level;

      // Check level up threshold
      while (newCurrentXp >= newMaxXp) {
        newCurrentXp -= newMaxXp;
        newLevel += 1;
        newMaxXp = Math.floor(newLevel * 160 + 280);
        didLevelUp = true;
      }

      const newTasksCompleted = prev.character.tasksCompleted + 1;

      const { updatedEquipment, updatedTitles, updatedRealms, newlyUnlocked } = evaluateUnlocks(
        prev,
        newLevel,
        newTasksCompleted
      );

      if (didLevelUp) {
        sound.playLevelUp();
        triggerConfetti(true);
        setLevelUpModal({
          oldLevel,
          newLevel,
          unlockedFeatures: newlyUnlocked
        });
      }

      return {
        ...prev,
        tasks: updatedTasks,
        equipment: updatedEquipment,
        titles: updatedTitles,
        realms: updatedRealms,
        character: {
          ...prev.character,
          level: newLevel,
          currentXp: newCurrentXp,
          maxXp: newMaxXp,
          hp: 100, // Replenish HP on task completion
          gold: prev.character.gold + goldToAward,
          tasksCompleted: newTasksCompleted,
          stats: {
            discipline: prev.character.stats.discipline + disciplineDelta,
            focus: prev.character.stats.focus + focusDelta,
            willpower: prev.character.stats.willpower + willpowerDelta
          }
        }
      };
    });
  }, [triggerConfetti]);

  const updateTaskNotes = useCallback((taskId: string, notes: string) => {
    setState(prev => ({
      ...prev,
      tasks: prev.tasks.map(t => t.id === taskId ? { ...t, notes } : t)
    }));
  }, []);

  const deleteTask = useCallback((taskId: string) => {
    setState(prev => ({
      ...prev,
      tasks: prev.tasks.filter(t => t.id !== taskId)
    }));
  }, []);

  const addQuest = useCallback((data: {
    title: string;
    description: string;
    color: string;
    icon: string;
    milestoneTitles: string[];
    deadline?: string;
  }) => {
    const newQuest: Quest = {
      id: `quest-${Date.now()}`,
      title: data.title.trim(),
      description: data.description.trim(),
      color: data.color || '#f59e0b',
      icon: data.icon || '📜',
      milestones: data.milestoneTitles
        .filter(t => t.trim().length > 0)
        .map((title, idx) => ({
          id: `m-${Date.now()}-${idx}`,
          title: title.trim(),
          completed: false
        })),
      bonusXp: 350,
      bonusGold: 200,
      deadline: data.deadline,
      completed: false
    };

    setState(prev => ({
      ...prev,
      quests: [newQuest, ...prev.quests]
    }));
  }, []);

  const toggleMilestone = useCallback((questId: string, milestoneId: string) => {
    setState(prev => {
      const quest = prev.quests.find(q => q.id === questId);
      if (!quest) return prev;

      const updatedMilestones = quest.milestones.map(m => 
        m.id === milestoneId ? { ...m, completed: !m.completed } : m
      );

      const allDone = updatedMilestones.length > 0 && updatedMilestones.every(m => m.completed);
      const isQuestNewlyFinished = !quest.completed && allDone;

      const updatedQuest: Quest = {
        ...quest,
        milestones: updatedMilestones,
        completed: allDone,
        completedAt: allDone ? new Date().toISOString() : undefined
      };

      if (isQuestNewlyFinished) {
        sound.playLevelUp();
        triggerConfetti(true);
      } else {
        sound.playTaskComplete();
      }

      // Bonus rewards if quest completed
      const bonusXp = isQuestNewlyFinished ? quest.bonusXp : 25;
      const bonusGold = isQuestNewlyFinished ? quest.bonusGold : 10;

      let newCurrentXp = prev.character.currentXp + bonusXp;
      let newLevel = prev.character.level;
      let newMaxXp = prev.character.maxXp;
      let didLevelUp = false;
      const oldLevel = prev.character.level;

      while (newCurrentXp >= newMaxXp) {
        newCurrentXp -= newMaxXp;
        newLevel += 1;
        newMaxXp = Math.floor(newLevel * 160 + 280);
        didLevelUp = true;
      }

      if (didLevelUp) {
        sound.playLevelUp();
        triggerConfetti(true);
        setLevelUpModal({
          oldLevel,
          newLevel,
          unlockedFeatures: ['Quest Campaign Conquered: ' + quest.title]
        });
      }

      return {
        ...prev,
        quests: prev.quests.map(q => q.id === questId ? updatedQuest : q),
        character: {
          ...prev.character,
          level: newLevel,
          currentXp: newCurrentXp,
          maxXp: newMaxXp,
          gold: prev.character.gold + bonusGold
        }
      };
    });
  }, [triggerConfetti]);

  const equipItem = useCallback((itemId: string) => {
    sound.playEquipSound();
    setState(prev => {
      const targetItem = prev.equipment.find(e => e.id === itemId);
      if (!targetItem || !targetItem.unlocked) return prev;

      const slot = targetItem.slot;
      const updatedEquipment = prev.equipment.map(item => {
        if (item.slot === slot) {
          return { ...item, equipped: item.id === itemId ? !item.equipped : false };
        }
        return item;
      });

      return {
        ...prev,
        equipment: updatedEquipment
      };
    });
  }, []);

  const setActiveTitle = useCallback((titleId: string) => {
    setState(prev => {
      const selected = prev.titles.find(t => t.id === titleId);
      if (!selected || !selected.unlocked) return prev;

      return {
        ...prev,
        titles: prev.titles.map(t => ({
          ...t,
          active: t.id === titleId
        })),
        character: {
          ...prev.character,
          title: selected.name
        }
      };
    });
  }, []);

  const setActiveRealm = useCallback((realmId: string) => {
    setState(prev => {
      const selected = prev.realms.find(r => r.id === realmId);
      if (!selected || !selected.unlocked) return prev;

      return {
        ...prev,
        realms: prev.realms.map(r => ({
          ...r,
          active: r.id === realmId
        })),
        character: {
          ...prev.character,
          currentRealmId: realmId
        }
      };
    });
  }, []);

  const resetDemoData = useCallback(() => {
    const defaultData = getDefaultSeedData();
    setState(defaultData);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultData));
    } catch {
      // ignore
    }
  }, []);

  const dismissLevelUpModal = useCallback(() => {
    setLevelUpModal(null);
  }, []);

  return (
    <GameContext.Provider
      value={{
        state,
        addTask,
        toggleTaskComplete,
        updateTaskNotes,
        deleteTask,
        addQuest,
        toggleMilestone,
        equipItem,
        setActiveTitle,
        setActiveRealm,
        resetDemoData,
        levelUpModal,
        dismissLevelUpModal,
        isSoundMuted,
        toggleSoundMuted,
        filterProximity,
        setFilterProximity
      }}
    >
      {children}
    </GameContext.Provider>
  );
}

export function useGame() {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
}
