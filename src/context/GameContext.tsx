'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode, useRef } from 'react';
import { GameState, Task, Quest, TaskDifficulty, CollaborationInvite } from '@/types/game';
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
    milestoneId?: string;
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
  addMilestoneToQuest: (questId: string, title: string) => Promise<string>;
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
  const [state, setState] = useState<GameState>(() => ({ tasks: [], quests: [] }));
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
            .map((t: any) => {
              let milestoneId: string | undefined = t.milestone_id || undefined;
              if (!milestoneId && Array.isArray(t.tags)) {
                const msTag = t.tags.find((tag: string) => typeof tag === 'string' && tag.startsWith('ms:'));
                if (msTag) milestoneId = msTag.slice(3);
              }
              if (!milestoneId && t.quest_id) {
                const proj = allQuestsRaw.find((q: any) => q.id === t.quest_id);
                if (proj && Array.isArray(proj.milestones)) {
                  const m = proj.milestones.find((mItem: any) => Array.isArray(mItem.taskIds) && mItem.taskIds.includes(t.id));
                  if (m) milestoneId = m.id;
                }
              }
              const visibleTags = (t.tags || ['General']).filter((tag: string) => typeof tag === 'string' && !tag.startsWith('ms:'));

              return {
                id: t.id,
                title: t.title,
                description: t.description || '',
                deadline: t.deadline,
                difficulty: t.difficulty,
                questId: t.quest_id || undefined,
                milestoneId,
                completed: t.completed,
                completedAt: t.completed_at,
                tags: visibleTags.length > 0 ? visibleTags : ['General'],
                notes: t.notes || '',
                createdAt: t.created_at
              };
            });

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
    milestoneId?: string;
    tags?: string[];
  }) => {
    const cleanTags = data.tags && data.tags.length > 0 ? [...data.tags] : ['General'];
    const newTask: Task = {
      id: `task-${Date.now()}`,
      title: data.title.trim(),
      description: data.description?.trim() || '',
      deadline: data.deadline,
      difficulty: data.difficulty,
      questId: data.questId || undefined,
      milestoneId: data.milestoneId || undefined,
      completed: false,
      tags: cleanTags,
      createdAt: new Date().toISOString()
    };

    // Store internal tag for cloud resilience if column milestone_id is not yet created in Supabase
    const tagsForCloud = [...cleanTags];
    if (data.milestoneId && !tagsForCloud.some(t => t.startsWith('ms:'))) {
      tagsForCloud.push(`ms:${data.milestoneId}`);
    }

    setState(prev => {
      let updatedQuests = prev.quests;
      if (newTask.questId && newTask.milestoneId) {
        updatedQuests = prev.quests.map(q => {
          if (q.id === newTask.questId) {
            const updatedMilestones = q.milestones.map(m => {
              if (m.id === newTask.milestoneId) {
                const existingTaskIds = m.taskIds || [];
                return {
                  ...m,
                  taskIds: existingTaskIds.includes(newTask.id) ? existingTaskIds : [...existingTaskIds, newTask.id]
                };
              }
              return m;
            });
            return { ...q, milestones: updatedMilestones };
          }
          return q;
        });
      }

      return {
        ...prev,
        tasks: [newTask, ...prev.tasks],
        quests: updatedQuests
      };
    });

    if (userRef.current) {
      const payload: any = {
        id: newTask.id,
        user_id: userRef.current.id,
        quest_id: newTask.questId || null,
        milestone_id: newTask.milestoneId || null,
        title: newTask.title,
        description: newTask.description,
        deadline: newTask.deadline,
        difficulty: newTask.difficulty,
        completed: false,
        tags: tagsForCloud,
        notes: ''
      };

      // Try inserting with milestone_id. Fall back to insert without milestone_id if column not present yet
      supabase.from('tasks').insert(payload).then(({ error }) => {
        if (error) {
          if (error.code === '42703' || error.message?.includes('milestone_id')) {
            const { milestone_id, ...fallbackPayload } = payload;
            supabase.from('tasks').insert(fallbackPayload).then();
          } else {
            console.warn('Error inserting task into Supabase:', error);
          }
        }
      });

      // Also persist milestone taskIds to project in Supabase if linked
      if (newTask.questId && newTask.milestoneId) {
        supabase.from('projects').select('milestones').eq('id', newTask.questId).single().then(({ data }) => {
          if (data && Array.isArray(data.milestones)) {
            const updated = data.milestones.map((m: any) => {
              if (m.id === newTask.milestoneId) {
                const existing = Array.isArray(m.taskIds) ? m.taskIds : [];
                return {
                  ...m,
                  taskIds: existing.includes(newTask.id) ? existing : [...existing, newTask.id]
                };
              }
              return m;
            });
            supabase.from('projects').update({ milestones: updated }).eq('id', newTask.questId).then();
          }
        });
      }
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

  const addMilestoneToQuest = useCallback(async (questId: string, title: string): Promise<string> => {
    const trimmed = title.trim();
    if (!trimmed) return '';
    const newMilestoneId = `m-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    const newMilestone = {
      id: newMilestoneId,
      title: trimmed,
      completed: false,
      taskIds: []
    };

    let targetUpdatedMilestones: any[] = [];

    setState(prev => {
      const quest = prev.quests.find(q => q.id === questId);
      if (!quest) return prev;
      targetUpdatedMilestones = [...quest.milestones, newMilestone];
      return {
        ...prev,
        quests: prev.quests.map(q => q.id === questId ? { ...q, milestones: targetUpdatedMilestones, completed: false } : q)
      };
    });

    if (userRef.current) {
      const { data } = await supabase.from('projects').select('milestones').eq('id', questId).single();
      const existing = (data && Array.isArray(data.milestones)) ? data.milestones : [];
      await supabase.from('projects').update({
        milestones: [...existing, newMilestone],
        completed: false
      }).eq('id', questId);
    }

    return newMilestoneId;
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
    setState({ tasks: [], quests: [] });

    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // ignore
    }

    if (userRef.current) {
      // Clean cloud data for this user
      await Promise.all([
        supabase.from('tasks').delete().eq('user_id', userRef.current.id),
        supabase.from('projects').delete().eq('owner_id', userRef.current.id)
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
        addMilestoneToQuest,
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
