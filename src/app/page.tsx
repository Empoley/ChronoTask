'use client';

import React, { useState } from 'react';
import { useGame } from '@/context/GameContext';
import { Header } from '@/components/Header';
import { CharacterSheet } from '@/components/CharacterSheet';
import { WorkloadRadar } from '@/components/WorkloadRadar';
import { TaskList } from '@/components/TaskList';
import { QuestList } from '@/components/QuestList';
import { EquipmentVault } from '@/components/EquipmentVault';
import { CreateTaskModal } from '@/components/CreateTaskModal';
import { CreateQuestModal } from '@/components/CreateQuestModal';
import { LevelUpModal } from '@/components/LevelUpModal';
import { CheckSquare, FolderGit2, Trophy } from 'lucide-react';

export default function Home() {
  const { state, setFilterProximity } = useGame();
  const [activeMainTab, setActiveMainTab] = useState<'tasks' | 'quests' | 'vault'>('tasks');
  const [isCreateTaskOpen, setIsCreateTaskOpen] = useState(false);
  const [isCreateQuestOpen, setIsCreateQuestOpen] = useState(false);
  const [taskTargetQuestId, setTaskTargetQuestId] = useState<string | undefined>(undefined);

  const handleFocusHorizon = (horizon: 'today' | 'next_week' | 'next_month') => {
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
        {/* Top: Hero Profile & Workload Radar */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(280px, 340px) 1fr',
          gap: '1rem',
          alignItems: 'stretch'
        }}>
          <CharacterSheet onOpenArmoryTab={() => setActiveMainTab('vault')} />
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
          paddingBottom: '0.5rem',
          flexWrap: 'wrap',
          gap: '0.5rem'
        }}>
          <div style={{ display: 'flex', gap: '0.25rem' }}>
            <button
              onClick={() => setActiveMainTab('tasks')}
              className="btn"
              style={{
                background: activeMainTab === 'tasks' ? 'rgba(255, 255, 255, 0.08)' : 'transparent',
                color: activeMainTab === 'tasks' ? '#ffffff' : 'var(--text-secondary)',
                fontWeight: activeMainTab === 'tasks' ? 600 : 500,
                fontSize: '0.82rem'
              }}
            >
              <CheckSquare size={15} />
              <span>Tasks ({pendingTasksCount})</span>
            </button>

            <button
              onClick={() => setActiveMainTab('quests')}
              className="btn"
              style={{
                background: activeMainTab === 'quests' ? 'rgba(255, 255, 255, 0.08)' : 'transparent',
                color: activeMainTab === 'quests' ? '#ffffff' : 'var(--text-secondary)',
                fontWeight: activeMainTab === 'quests' ? 600 : 500,
                fontSize: '0.82rem'
              }}
            >
              <FolderGit2 size={15} />
              <span>Projects ({state.quests.length})</span>
            </button>

            <button
              onClick={() => setActiveMainTab('vault')}
              className="btn"
              style={{
                background: activeMainTab === 'vault' ? 'rgba(255, 255, 255, 0.08)' : 'transparent',
                color: activeMainTab === 'vault' ? '#ffffff' : 'var(--text-secondary)',
                fontWeight: activeMainTab === 'vault' ? 600 : 500,
                fontSize: '0.82rem'
              }}
            >
              <Trophy size={15} />
              <span>Rewards ({state.equipment.filter(e => e.unlocked).length})</span>
            </button>
          </div>
        </div>

        {/* Tab Content */}
        <div>
          {activeMainTab === 'tasks' && (
            <TaskList onOpenCreateTask={handleOpenStandardCreateTask} />
          )}

          {activeMainTab === 'quests' && (
            <QuestList
              onOpenCreateQuest={() => setIsCreateQuestOpen(true)}
              onOpenCreateTaskForQuest={handleOpenCreateTaskForQuest}
            />
          )}

          {activeMainTab === 'vault' && (
            <EquipmentVault />
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
          <span>ChronoQuest</span>
          <span>Interactive demonstrational state saved in localStorage.</span>
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

      <LevelUpModal />
    </div>
  );
}
