'use client';

import React, { useState } from 'react';
import { useGame } from '@/context/GameContext';
import { useAuth } from '@/context/AuthContext';
import { Header } from '@/components/Header';
import { WorkspaceOverview } from '@/components/WorkspaceOverview';
import { WorkloadAlert } from '@/components/WorkloadAlert';
import { TaskList } from '@/components/TaskList';
import { QuestList } from '@/components/QuestList';
import { CreateTaskModal } from '@/components/CreateTaskModal';
import { CreateQuestModal } from '@/components/CreateQuestModal';
import { AuthGate } from '@/components/AuthGate';
import { CheckSquare, FolderGit2, Loader2 } from 'lucide-react';

export default function Home() {
  const { user, isLoading } = useAuth();
  const { state, setFilterProximity } = useGame();
  const [activeMainTab, setActiveMainTab] = useState<'tasks' | 'projects'>('tasks');
  const [isCreateTaskOpen, setIsCreateTaskOpen] = useState(false);
  const [isCreateQuestOpen, setIsCreateQuestOpen] = useState(false);
  const [taskTargetQuestId, setTaskTargetQuestId] = useState<string | undefined>(undefined);
  const [taskTargetMilestoneId, setTaskTargetMilestoneId] = useState<string | undefined>(undefined);

  if (isLoading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--bg-page)',
        flexDirection: 'column',
        gap: '0.75rem'
      }}>
        <Loader2 size={24} className="spin" color="var(--brand)" />
        <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Connecting to workspace...</span>
      </div>
    );
  }

  if (!user) {
    return <AuthGate />;
  }

  const handleFocusHorizon = (horizon: 'today' | 'this_week' | 'next_week' | 'next_month') => {
    setActiveMainTab('tasks');
    setFilterProximity(horizon);
  };

  const handleOpenCreateTaskForQuest = (questId: string, milestoneId?: string) => {
    setTaskTargetQuestId(questId);
    setTaskTargetMilestoneId(milestoneId);
    setIsCreateTaskOpen(true);
  };

  const handleOpenStandardCreateTask = () => {
    setTaskTargetQuestId(undefined);
    setTaskTargetMilestoneId(undefined);
    setIsCreateTaskOpen(true);
  };

  const pendingTasksCount = state.tasks.filter(t => !t.completed).length;

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column'
    }}>
      {/* Header */}
      <Header
        onOpenCreateTask={handleOpenStandardCreateTask}
        onOpenCreateQuest={() => setIsCreateQuestOpen(true)}
      />

      {/* Main Content */}
      <main style={{
        maxWidth: '1280px',
        width: '100%',
        margin: '0 auto',
        padding: '1.25rem 1.5rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '1.15rem',
        flex: 1
      }}>
        {/* Top Command Deck: Workspace Status & Workload Alert */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(310px, 1fr))',
          gap: '0.85rem',
          alignItems: 'stretch'
        }}>
          <WorkspaceOverview />
          <WorkloadAlert onFocusHorizon={handleFocusHorizon} />
        </div>

        {/* Primary Navigation Tabs */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: '1px solid var(--border-subtle)',
          paddingBottom: '0',
          flexWrap: 'wrap',
          gap: '0.5rem'
        }}>
          <div style={{ display: 'flex', gap: '0.35rem', marginBottom: '-1px' }}>
            <button
              type="button"
              onClick={() => setActiveMainTab('tasks')}
              className={`nav-tab ${activeMainTab === 'tasks' ? 'is-active' : ''}`}
            >
              <CheckSquare size={14} />
              <span>Tasks</span>
              <span style={{
                fontSize: '0.68rem',
                color: activeMainTab === 'tasks' ? '#ffffff' : 'var(--text-muted)',
                background: activeMainTab === 'tasks' ? 'var(--brand-subtle)' : 'var(--bg-subtle)',
                padding: '0.08rem 0.42rem',
                borderRadius: '9999px',
                border: activeMainTab === 'tasks' ? '1px solid var(--brand-border)' : '1px solid var(--border-subtle)',
                fontVariantNumeric: 'tabular-nums'
              }}>
                {pendingTasksCount}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveMainTab('projects')}
              className={`nav-tab ${activeMainTab === 'projects' ? 'is-active' : ''}`}
            >
              <FolderGit2 size={14} />
              <span>Projects</span>
              <span style={{
                fontSize: '0.68rem',
                color: activeMainTab === 'projects' ? '#ffffff' : 'var(--text-muted)',
                background: activeMainTab === 'projects' ? 'var(--brand-subtle)' : 'var(--bg-subtle)',
                padding: '0.08rem 0.42rem',
                borderRadius: '9999px',
                border: activeMainTab === 'projects' ? '1px solid var(--brand-border)' : '1px solid var(--border-subtle)',
                fontVariantNumeric: 'tabular-nums'
              }}>
                {state.quests.length}
              </span>
            </button>
          </div>
        </div>

        {/* Tab Content */}
        <div>
          {activeMainTab === 'tasks' && (
            <TaskList onOpenCreateTask={handleOpenStandardCreateTask} />
          )}

          {activeMainTab === 'projects' && (
            <QuestList
              onOpenCreateQuest={() => setIsCreateQuestOpen(true)}
              onOpenCreateTaskForQuest={handleOpenCreateTaskForQuest}
            />
          )}
        </div>
      </main>

      {/* Footer */}
      <footer style={{
        marginTop: 'auto',
        borderTop: '1px solid var(--border-subtle)',
        padding: '0.85rem 1.5rem',
        fontSize: '0.72rem',
        color: 'var(--text-dim)',
        background: 'rgba(8, 10, 15, 0.5)'
      }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
          <span>ChronoTasks</span>
          <span>Proactive workload capacity radar & milestone delivery management.</span>
        </div>
      </footer>

      {/* Modals */}
      <CreateTaskModal
        isOpen={isCreateTaskOpen}
        onClose={() => setIsCreateTaskOpen(false)}
        defaultQuestId={taskTargetQuestId}
        defaultMilestoneId={taskTargetMilestoneId}
      />

      <CreateQuestModal
        isOpen={isCreateQuestOpen}
        onClose={() => setIsCreateQuestOpen(false)}
      />
    </div>
  );
}
