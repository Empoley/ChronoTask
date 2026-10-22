'use client';

import React, { useState } from 'react';
import { useGame } from '@/context/GameContext';
import { useAuth } from '@/context/AuthContext';
import { Header } from '@/components/Header';
import { WorkspaceOverview } from '@/components/WorkspaceOverview';
import { WorkloadRadar } from '@/components/WorkloadRadar';
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

  if (isLoading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--bg-main)',
        flexDirection: 'column',
        gap: '0.85rem'
      }}>
        <Loader2 size={26} className="spin" color="var(--brand)" />
        <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Connecting to workspace...</span>
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

  const handleOpenCreateTaskForQuest = (questId: string) => {
    setTaskTargetQuestId(questId);
    setIsCreateTaskOpen(true);
  };

  const handleOpenStandardCreateTask = () => {
    setTaskTargetQuestId(undefined);
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
        gap: '1.25rem',
        flex: 1
      }}>
        {/* Top: Workspace Overview & Workload Radar */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(280px, 340px) 1fr',
          gap: '1rem',
          alignItems: 'stretch'
        }}>
          <WorkspaceOverview />
          <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <WorkloadRadar onFocusHorizon={handleFocusHorizon} />
          </div>
        </div>

        {/* Navigation Tabs */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: '1px solid var(--border-subtle)',
          paddingBottom: '0',
          flexWrap: 'wrap',
          gap: '0.5rem'
        }}>
          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '-1px' }}>
            <button
              onClick={() => setActiveMainTab('tasks')}
              className={`nav-tab ${activeMainTab === 'tasks' ? 'is-active' : ''}`}
            >
              <CheckSquare size={15} />
              <span>Tasks</span>
              <span style={{
                fontSize: '0.72rem',
                color: activeMainTab === 'tasks' ? '#ffffff' : 'var(--text-muted)',
                background: activeMainTab === 'tasks' ? 'var(--brand-subtle)' : 'var(--bg-subtle)',
                padding: '0.1rem 0.45rem',
                borderRadius: '9999px',
                border: activeMainTab === 'tasks' ? '1px solid var(--brand-border)' : '1px solid var(--border-subtle)'
              }}>
                {pendingTasksCount}
              </span>
            </button>

            <button
              onClick={() => setActiveMainTab('projects')}
              className={`nav-tab ${activeMainTab === 'projects' ? 'is-active' : ''}`}
            >
              <FolderGit2 size={15} />
              <span>Projects</span>
              <span style={{
                fontSize: '0.72rem',
                color: activeMainTab === 'projects' ? '#ffffff' : 'var(--text-muted)',
                background: activeMainTab === 'projects' ? 'var(--brand-subtle)' : 'var(--bg-subtle)',
                padding: '0.1rem 0.45rem',
                borderRadius: '9999px',
                border: activeMainTab === 'projects' ? '1px solid var(--brand-border)' : '1px solid var(--border-subtle)'
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
        padding: '1rem 1.5rem',
        fontSize: '0.74rem',
        color: 'var(--text-dim)',
        textAlign: 'center'
      }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
          <span>ChronoTasks</span>
          <span>Proactive workload radar & milestone delivery management.</span>
        </div>
      </footer>

      {/* Modals */}
      <CreateTaskModal
        isOpen={isCreateTaskOpen}
        onClose={() => setIsCreateTaskOpen(false)}
        defaultQuestId={taskTargetQuestId}
      />

      <CreateQuestModal
        isOpen={isCreateQuestOpen}
        onClose={() => setIsCreateQuestOpen(false)}
      />
    </div>
  );
}
