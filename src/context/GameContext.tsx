'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode, useRef } from 'react';
import { GameState, Task, Quest, TaskDifficulty, CollaborationInvite } from '@/types/game';
import { getDefaultSeedData, getSeedDataForUser } from '@/data/seedData';
import { sound } from '@/utils/audio';
import { supabase, isSupabaseConfigured } from '@/lib/supabaseClient';
import { useAuth } from './AuthContext';

const STORAGE_KEY = 'chrono_tasks_app_state_v3';

interface GameContextType {
  state: GameState;
  pendingInvites: CollaborationInvite[];
  acceptInvite: (inviteId: string) => Promise<{ success: boolean; message?: string }>;
  declineInvite: (inviteId: string) => Promise<{ success: boolean; message?: string }>;
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
  toggleQuestComplete: (questId: string) => void;
  deleteQuest: (questId: string) => void;
  resetDemoData: () => void;
  isSoundMuted: boolean;
  toggleSoundMuted: () => void;
  filterProximity: string | null;
  setFilterProximity: (proximity: string | null) => void;
  isCloudSynced: boolean;
}

const GameContext = createContext<GameContextType | undefined>(undefined);

export function GameProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [state, setState] = useState<GameState>(() => getDefaultSeedData());
  const [pendingInvites, setPendingInvites] = useState<CollaborationInvite[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isCloudSynced, setIsCloudSynced] = useState(false);
  const [isSoundMuted, setIsSoundMuted] = useState(false);
  const [filterProximity, setFilterProximity] = useState<string | null>(null);

  const userRef = useRef(user);
  userRef.current = user;

  const fetchCloudDataRef = useRef<() => Promise<void>>(() => Promise.resolve());

  // 1. Reset state when signed out; authenticate required
  useEffect(() => {
    if (!user) {
      setState({ tasks: [], quests: [] });
      setPendingInvites([]);
      setIsLoaded(true);
      setIsCloudSynced(false);
    }
  }, [user]);

  // 3. Cloud Sync & Realtime Subscriptions for Authenticated Users
  useEffect(() => {
    if (!user || !isSupabaseConfigured) {
      setIsCloudSynced(false);
      setPendingInvites([]);
      return;
    }

    let isSubscribed = true;

    const fetchCloudData = async () => {
      try {
        const userEmail = (user.email || '').toLowerCase().trim();

        const [tasksRes, questsRes, membersRes] = await Promise.all([
          supabase.from('tasks').select('*'),
          supabase.from('projects').select('*'),
          supabase.from('project_members').select('*, projects(*)')
        ]);

        if (!isSubscribed) return;

        const allTasksRaw = tasksRes.data || [];
        const allQuestsRaw = questsRes.data || [];
        const allMembersRaw = membersRes.data || [];

        // 1. Pending invites for THIS user only:
        const myPendingInvites: CollaborationInvite[] = allMembersRaw
          .filter((m: any) => {
            const isRecipient = (m.user_email && m.user_email.toLowerCase().trim() === userEmail) || (m.user_id && m.user_id === user.id);
            const isPending = m.status === 'pending';
            // Must not be the owner of the project
            const isNotOwner = m.projects ? m.projects.owner_id !== user.id : true;
            return isRecipient && isPending && isNotOwner;
          })
          .map((m: any) => {
            const proj = m.projects || allQuestsRaw.find((q: any) => q.id === m.project_id);
            return {
              id: m.id,
              projectId: m.project_id,
              userEmail: m.user_email,
              role: (m.role as 'editor' | 'viewer') || 'editor',
              status: m.status as 'pending' | 'accepted',
              createdAt: m.created_at,
              project: proj ? {
                id: proj.id,
                title: proj.title,
                description: proj.description || '',
                color: proj.color || '#6366f1',
                icon: proj.icon || '📁',
                ownerId: proj.owner_id
              } : undefined
            };
          });

        setPendingInvites(myPendingInvites);

        if (tasksRes.data && questsRes.data) {
          // If first time user has 0 projects in cloud, populate with user-scoped seed data
          if (questsRes.data.length === 0) {
            const seed = getSeedDataForUser(user.id);
            const [projRes, taskRes] = await Promise.all([
              supabase.from('projects').insert(
                seed.quests.map(q => ({
                  id: q.id,
                  owner_id: user.id,
                  title: q.title,
                  description: q.description,
                  color: q.color,
                  icon: q.icon,
                  milestones: q.milestones,
                  deadline: q.deadline || null,
                  completed: q.completed,
                  completed_at: q.completedAt || null
                }))
              ),
              tasksRes.data.length === 0
                ? supabase.from('tasks').insert(
                    seed.tasks.map(t => ({
                      id: t.id,
                      user_id: user.id,
                      quest_id: t.questId || null,
                      title: t.title,
                      description: t.description,
                      deadline: t.deadline,
                      difficulty: t.difficulty,
                      completed: t.completed,
                      completed_at: t.completedAt || null,
                      tags: t.tags,
                      notes: t.notes || ''
                    }))
                  )
                : Promise.resolve({ error: null })
            ]);

            if (projRes.error) {
              console.error('Error inserting initial user projects:', projRes.error);
            }
            if (taskRes.error) {
              console.error('Error inserting initial user tasks:', taskRes.error);
            }

            if (isSubscribed) {
              setState(seed);
              setIsCloudSynced(true);
            }
            return;
          }

          // Active project IDs: owned by user OR user has accepted membership
          const acceptedProjectIds = new Set(
            allMembersRaw
              .filter((m: any) => {
                const isForUser = (m.user_email && m.user_email.toLowerCase().trim() === userEmail) || (m.user_id && m.user_id === user.id);
                return isForUser && m.status === 'accepted';
              })
              .map((m: any) => m.project_id)
          );

          const mappedQuests: Quest[] = allQuestsRaw
            .filter((q: any) => q.owner_id === user.id || acceptedProjectIds.has(q.id))
            .map((q: any) => ({
              id: q.id,
              ownerId: q.owner_id,
              title: q.title,
              description: q.description || '',
              color: q.color || '#6366f1',
              icon: q.icon || '📁',
              milestones: q.milestones || [],
              deadline: q.deadline || undefined,
              completed: q.completed || false,
              completedAt: q.completed_at
            }));

          const activeProjectIds = new Set(mappedQuests.map(q => q.id));

          const mappedTasks: Task[] = allTasksRaw
            .filter((t: any) => {
              if (!t.quest_id) return t.user_id === user.id;
              return activeProjectIds.has(t.quest_id);
            })
            .map((t: any) => ({
              id: t.id,
              title: t.title,
              description: t.description || '',
              deadline: t.deadline,
              difficulty: t.difficulty,
              questId: t.quest_id || undefined,
              completed: t.completed,
              completedAt: t.completed_at,
              tags: t.tags || ['General'],
              notes: t.notes || '',
              createdAt: t.created_at
            }));

          setState({ tasks: mappedTasks, quests: mappedQuests });
          setIsCloudSynced(true);
        }
      } catch (err) {
        console.warn('Error syncing cloud data from Supabase:', err);
      }
    };

    fetchCloudDataRef.current = fetchCloudData;
    fetchCloudData();

    // Subscribe to Realtime Postgres Changes
    const channel = supabase
      .channel('chrono_realtime_channel')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'tasks' }, () => {
        fetchCloudData();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'projects' }, () => {
        fetchCloudData();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'project_members' }, () => {
        fetchCloudData();
      })
      .subscribe();

    return () => {
      isSubscribed = false;
      supabase.removeChannel(channel);
    };
  }, [user]);

  const triggerConfetti = useCallback(async (isMajor: boolean = false) => {
    try {
      const confetti = (await import('canvas-confetti')).default;
      if (isMajor) {
        confetti({
          particleCount: 100,
          spread: 75,
          origin: { y: 0.6 },
          colors: ['#f59e0b', '#ec4899', '#8b5cf6', '#10b981', '#3b82f6']
        });
      } else {
        confetti({
          particleCount: 45,
          spread: 55,
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

  const addTask = useCallback((data: {
    title: string;
    description: string;
    deadline: string;
    difficulty: TaskDifficulty;
    questId?: string;
    tags?: string[];
  }) => {
    const newTask: Task = {
      id: `task-${Date.now()}`,
      title: data.title.trim(),
      description: data.description?.trim() || '',
      deadline: data.deadline,
      difficulty: data.difficulty,
      questId: data.questId || undefined,
      completed: false,
      tags: data.tags && data.tags.length > 0 ? data.tags : ['General'],
      createdAt: new Date().toISOString()
    };

    setState(prev => ({
      ...prev,
      tasks: [newTask, ...prev.tasks]
    }));

    if (userRef.current) {
      supabase.from('tasks').insert({
        id: newTask.id,
        user_id: userRef.current.id,
        quest_id: newTask.questId || null,
        title: newTask.title,
        description: newTask.description,
        deadline: newTask.deadline,
        difficulty: newTask.difficulty,
        completed: false,
        tags: newTask.tags,
        notes: ''
      }).then();
    }
  }, []);

  const toggleTaskComplete = useCallback((taskId: string) => {
    setState(prev => {
      const taskIndex = prev.tasks.findIndex(t => t.id === taskId);
      if (taskIndex === -1) return prev;

      const target = prev.tasks[taskIndex];
      const isNowCompleted = !target.completed;
      const completedAt = isNowCompleted ? new Date().toISOString() : undefined;

      const updatedTasks = [...prev.tasks];
      updatedTasks[taskIndex] = {
        ...target,
        completed: isNowCompleted,
        completedAt
      };

      if (isNowCompleted) {
        sound.playTaskComplete();
        triggerConfetti(target.difficulty === 'epic');
      }

      if (userRef.current) {
        supabase.from('tasks').update({
          completed: isNowCompleted,
          completed_at: completedAt || null
        }).eq('id', taskId).then();
      }

      return {
        ...prev,
        tasks: updatedTasks
      };
    });
  }, [triggerConfetti]);

  const updateTaskNotes = useCallback((taskId: string, notes: string) => {
    setState(prev => ({
      ...prev,
      tasks: prev.tasks.map(t => t.id === taskId ? { ...t, notes } : t)
    }));

    if (userRef.current) {
      supabase.from('tasks').update({ notes }).eq('id', taskId).then();
    }
  }, []);

  const deleteTask = useCallback((taskId: string) => {
    setState(prev => ({
      ...prev,
      tasks: prev.tasks.filter(t => t.id !== taskId)
    }));

    if (userRef.current) {
      supabase.from('tasks').delete().eq('id', taskId).then();
    }
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
      color: data.color || '#6366f1',
      icon: data.icon || '📁',
      milestones: data.milestoneTitles
        .filter(t => t.trim().length > 0)
        .map((title, idx) => ({
          id: `m-${Date.now()}-${idx}`,
          title: title.trim(),
          completed: false
        })),
      deadline: data.deadline,
      completed: false,
      ownerId: userRef.current?.id
    };

    setState(prev => ({
      ...prev,
      quests: [newQuest, ...prev.quests]
    }));

    if (userRef.current) {
      supabase.from('projects').insert({
        id: newQuest.id,
        owner_id: userRef.current.id,
        title: newQuest.title,
        description: newQuest.description,
        color: newQuest.color,
        icon: newQuest.icon,
        milestones: newQuest.milestones,
        deadline: newQuest.deadline || null,
        completed: false
      }).then();
    }
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
      const completedAt = allDone ? new Date().toISOString() : undefined;

      const updatedQuest: Quest = {
        ...quest,
        milestones: updatedMilestones,
        completed: allDone,
        completedAt
      };

      if (isQuestNewlyFinished) {
        sound.playTaskComplete();
        triggerConfetti(true);
      } else {
        sound.playTaskComplete();
      }

      if (userRef.current) {
        supabase.from('projects').update({
          milestones: updatedMilestones,
          completed: allDone,
          completed_at: completedAt || null
        }).eq('id', questId).then();
      }

      return {
        ...prev,
        quests: prev.quests.map(q => q.id === questId ? updatedQuest : q)
      };
    });
  }, [triggerConfetti]);

  const toggleQuestComplete = useCallback((questId: string) => {
    setState(prev => {
      const quest = prev.quests.find(q => q.id === questId);
      if (!quest) return prev;

      const isNowCompleted = !quest.completed;
      const updatedMilestones = quest.milestones.map(m => ({
        ...m,
        completed: isNowCompleted
      }));
      const completedAt = isNowCompleted ? new Date().toISOString() : undefined;

      const updatedQuest: Quest = {
        ...quest,
        completed: isNowCompleted,
        completedAt,
        milestones: updatedMilestones
      };

      if (isNowCompleted) {
        sound.playTaskComplete();
        triggerConfetti(true);
      }

      if (userRef.current) {
        supabase.from('projects').update({
          milestones: updatedMilestones,
          completed: isNowCompleted,
          completed_at: completedAt || null
        }).eq('id', questId).then();
      }

      return {
        ...prev,
        quests: prev.quests.map(q => q.id === questId ? updatedQuest : q)
      };
    });
  }, [triggerConfetti]);

  const deleteQuest = useCallback((questId: string) => {
    setState(prev => ({
      ...prev,
      quests: prev.quests.filter(q => q.id !== questId),
      tasks: prev.tasks.map(t => t.questId === questId ? { ...t, questId: undefined } : t)
    }));

    if (userRef.current) {
      supabase.from('projects').delete().eq('id', questId).then();
    }
  }, []);

  const resetDemoData = useCallback(async () => {
    const userSeed = userRef.current ? getSeedDataForUser(userRef.current.id) : getDefaultSeedData();
    setState(userSeed);

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(userSeed));
    } catch {
      // ignore
    }

    if (userRef.current) {
      // Clean and reset cloud data for this user
      await Promise.all([
        supabase.from('tasks').delete().eq('user_id', userRef.current.id),
        supabase.from('projects').delete().eq('owner_id', userRef.current.id)
      ]);

      await Promise.all([
        supabase.from('projects').insert(
          userSeed.quests.map(q => ({
            id: q.id,
            owner_id: userRef.current!.id,
            title: q.title,
            description: q.description,
            color: q.color,
            icon: q.icon,
            milestones: q.milestones,
            deadline: q.deadline || null,
            completed: q.completed,
            completed_at: q.completedAt || null
          }))
        ),
        supabase.from('tasks').insert(
          userSeed.tasks.map(t => ({
            id: t.id,
            user_id: userRef.current!.id,
            quest_id: t.questId || null,
            title: t.title,
            description: t.description,
            deadline: t.deadline,
            difficulty: t.difficulty,
            completed: t.completed,
            completed_at: t.completedAt || null,
            tags: t.tags,
            notes: t.notes || ''
          }))
        )
      ]);
    }
  }, []);

  const acceptInvite = useCallback(async (inviteId: string): Promise<{ success: boolean; message?: string }> => {
    try {
      if (userRef.current && isSupabaseConfigured) {
        const { error } = await supabase
          .from('project_members')
          .update({
            status: 'accepted',
            user_id: userRef.current.id
          })
          .eq('id', inviteId);

        if (error) {
          console.error('Error accepting invite:', error);
          return { success: false, message: error.message };
        }

        if (fetchCloudDataRef.current) {
          await fetchCloudDataRef.current();
        }
        triggerConfetti(false);
        sound.playTaskComplete();
        return { success: true };
      } else {
        setPendingInvites(prev => prev.filter(inv => inv.id !== inviteId));
        triggerConfetti(false);
        sound.playTaskComplete();
        return { success: true };
      }
    } catch (err: any) {
      return { success: false, message: err?.message || 'Failed to accept invitation.' };
    }
  }, [triggerConfetti]);

  const declineInvite = useCallback(async (inviteId: string): Promise<{ success: boolean; message?: string }> => {
    try {
      if (userRef.current && isSupabaseConfigured) {
        const { error } = await supabase
          .from('project_members')
          .delete()
          .eq('id', inviteId);

        if (error) {
          console.error('Error declining invite:', error);
          return { success: false, message: error.message };
        }

        if (fetchCloudDataRef.current) {
          await fetchCloudDataRef.current();
        }
        return { success: true };
      } else {
        setPendingInvites(prev => prev.filter(inv => inv.id !== inviteId));
        return { success: true };
      }
    } catch (err: any) {
      return { success: false, message: err?.message || 'Failed to decline invitation.' };
    }
  }, []);

  return (
    <GameContext.Provider
      value={{
        state,
        pendingInvites,
        acceptInvite,
        declineInvite,
        addTask,
        toggleTaskComplete,
        updateTaskNotes,
        deleteTask,
        addQuest,
        toggleMilestone,
        toggleQuestComplete,
        deleteQuest,
        resetDemoData,
        isSoundMuted,
        toggleSoundMuted,
        filterProximity,
        setFilterProximity,
        isCloudSynced
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
