'use client';

import React, { useState, useMemo } from 'react';
import { useGame } from '@/context/GameContext';
import { CheckCircle2, Circle, Plus, Trash2, Users } from 'lucide-react';
import { InviteModal } from './InviteModal';
import { Quest } from '@/types/game';

interface QuestListProps {
  onOpenCreateQuest: () => void;
  onOpenCreateTaskForQuest: (questId: string) => void;
}

export function QuestList({ onOpenCreateQuest, onOpenCreateTaskForQuest }: QuestListProps) {
  const { state, toggleMilestone, toggleQuestComplete, deleteQuest } = useGame();
  const { quests, tasks } = state;

  const [projectFilter, setProjectFilter] = useState<'active' | 'completed' | 'all'>('active');
  const [inviteQuest, setInviteQuest] = useState<Quest | null>(null);

  const activeQuests = useMemo(() => quests.filter(q => !q.completed), [quests]);
  const completedQuests = useMemo(() => quests.filter(q => q.completed), [quests]);

  const filteredQuests = useMemo(() => {
    if (projectFilter === 'active') return activeQuests;
    if (projectFilter === 'completed') return completedQuests;
    return quests;
  }, [projectFilter, activeQuests, completedQuests, quests]);

  const tabs = [
    { key: 'active', label: 'Active', count: activeQuests.length },
    { key: 'completed', label: 'Completed', count: completedQuests.length },
    { key: 'all', label: 'All', count: quests.length }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '0.75rem'
      }}>
        <div>
          <h2 style={{ fontSize: '1.05rem', fontWeight: 600, color: '#ffffff' }}>
            Projects
          </h2>
          <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '0.1rem' }}>
            Multi-stage initiatives with milestone tracking and delivery progress.
          </p>
        </div>

        <button
          onClick={onOpenCreateQuest}
          className="btn btn-secondary"
          style={{ fontSize: '0.78rem' }}
        >
          <Plus size={14} />
          <span>New project</span>
        </button>
      </div>

      {/* Tabs Row */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '0.75rem'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.35rem',
          flexWrap: 'wrap'
        }}>
          {tabs.map(tab => {
            const isSelected = projectFilter === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => setProjectFilter(tab.key as 'active' | 'completed' | 'all')}
                className={`proximity-tab ${isSelected ? 'is-active' : ''}`}
              >
                <span>{tab.label}</span>
                <span style={{
                  fontSize: '0.68rem',
                  color: isSelected ? '#ffffff' : 'var(--text-muted)',
                  background: isSelected ? 'rgba(255, 255, 255, 0.12)' : 'rgba(255, 255, 255, 0.04)',
                  padding: '0.08rem 0.38rem',
                  borderRadius: '9999px',
                  marginLeft: '0.15rem'
                }}>
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Empty States */}
      {filteredQuests.length === 0 ? (
        <div className="clean-card" style={{
          padding: '2.5rem 1.5rem',
          textAlign: 'center'
        }}>
          {projectFilter === 'completed' ? (
            <>
              <div style={{
                width: '38px',
                height: '38px',
                borderRadius: '8px',
                background: 'var(--accent-green-subtle)',
                border: '1px solid rgba(16, 185, 129, 0.25)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--accent-green)',
                margin: '0 auto 0.75rem auto'
              }}>
                <CheckCircle2 size={18} />
              </div>
              <h4 style={{ fontSize: '0.95rem', color: '#ffffff', marginBottom: '0.25rem' }}>
                No completed projects
              </h4>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
                Mark all milestones or click &quot;Mark done&quot; on an active project to record delivered initiatives.
              </p>
              <button
                onClick={() => setProjectFilter('active')}
                className="btn btn-secondary"
                style={{ fontSize: '0.78rem' }}
              >
                <span>View active projects</span>
              </button>
            </>
          ) : projectFilter === 'active' ? (
            <>
              <h4 style={{ fontSize: '0.95rem', color: '#ffffff', marginBottom: '0.25rem' }}>
                No active projects
              </h4>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
                All projects are delivered. Create a new project to start tracking your next initiative.
              </p>
              <button
                onClick={onOpenCreateQuest}
                className="btn btn-primary"
                style={{ fontSize: '0.78rem' }}
              >
                <Plus size={14} />
                <span>New project</span>
              </button>
            </>
          ) : (
            <>
              <h4 style={{ fontSize: '0.95rem', color: '#ffffff', marginBottom: '0.25rem' }}>
                No projects found
              </h4>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
                Create your first project to track initiatives and milestone checklists.
              </p>
              <button
                onClick={onOpenCreateQuest}
                className="btn btn-primary"
                style={{ fontSize: '0.78rem' }}
              >
                <Plus size={14} />
                <span>New project</span>
              </button>
            </>
          )}
        </div>
      ) : (
        /* Quests Grid */
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '1rem' }}>
          {filteredQuests.map(quest => {
            const completedMilestones = quest.milestones.filter(m => m.completed).length;
            const totalMilestones = quest.milestones.length;
            const progressPercent = totalMilestones > 0 ? Math.round((completedMilestones / totalMilestones) * 100) : 0;
            const linkedTasks = tasks.filter(t => t.questId === quest.id && !t.completed);

            return (
              <div
                key={quest.id}
                className="clean-card"
                style={{
                  padding: '1.25rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.85rem',
                  borderTop: `3px solid ${quest.color}`,
                  opacity: quest.completed ? 0.8 : 1
                }}
              >
                {/* Header */}
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '0.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.65rem' }}>
                    <span style={{ fontSize: '1.25rem' }}>{quest.icon}</span>
                    <div>
                      <h3 style={{ fontSize: '0.98rem', fontWeight: 600, color: '#ffffff' }}>
                        {quest.title}
                      </h3>
                      <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '0.2rem', lineHeight: 1.35 }}>
                        {quest.description}
                      </p>
                    </div>
                  </div>

                  {quest.completed && (
                    <span style={{
                      fontSize: '0.68rem',
                      background: 'var(--accent-green-subtle)',
                      color: '#34d399',
                      border: '1px solid rgba(16, 185, 129, 0.25)',
                      padding: '0.15rem 0.45rem',
                      borderRadius: '4px',
                      fontWeight: 600,
                      flexShrink: 0
                    }}>
                      Completed
                    </span>
                  )}
                </div>

                {/* Progress bar */}
                <div>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    fontSize: '0.72rem',
                    marginBottom: '0.3rem',
                    color: 'var(--text-muted)'
                  }}>
                    <span>Milestones ({completedMilestones}/{totalMilestones})</span>
                    <span style={{ fontWeight: 600, color: '#ffffff' }}>{progressPercent}%</span>
                  </div>
                  <div style={{
                    height: '5px',
                    width: '100%',
                    background: 'rgba(255, 255, 255, 0.06)',
                    borderRadius: '9999px',
                    overflow: 'hidden'
                  }}>
                    <div
                      style={{
                        height: '100%',
                        width: `${progressPercent}%`,
                        background: quest.color,
                        borderRadius: '9999px',
                        transition: 'width 0.3s ease'
                      }}
                    />
                  </div>
                </div>

                {/* Milestones checklist */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                  {quest.milestones.map(m => (
                    <button
                      key={m.id}
                      onClick={() => toggleMilestone(quest.id, m.id)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        background: m.completed ? 'rgba(255, 255, 255, 0.02)' : 'var(--bg-subtle)',
                        border: '1px solid var(--border-subtle)',
                        borderRadius: 'var(--radius-sm)',
                        padding: '0.45rem 0.65rem',
                        color: m.completed ? 'var(--text-muted)' : 'var(--text-main)',
                        textAlign: 'left',
                        cursor: 'pointer',
                        fontSize: '0.78rem',
                        transition: 'all 0.1s ease'
                      }}
                    >
                      {m.completed ? (
                        <CheckCircle2 size={15} color="var(--accent-green)" />
                      ) : (
                        <Circle size={15} color="var(--text-dim)" />
                      )}
                      <span style={{
                        textDecoration: m.completed ? 'line-through' : 'none',
                        flex: 1
                      }}>
                        {m.title}
                      </span>
                    </button>
                  ))}
                </div>

                {/* Footer row */}
                <div style={{
                  marginTop: 'auto',
                  paddingTop: '0.65rem',
                  borderTop: '1px solid var(--border-subtle)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  fontSize: '0.74rem'
                }}>
                  <span style={{ color: 'var(--text-muted)' }}>
                    {linkedTasks.length} pending task{linkedTasks.length !== 1 ? 's' : ''}
                  </span>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                    <button
                      onClick={() => toggleQuestComplete(quest.id)}
                      className="btn btn-ghost"
                      title={quest.completed ? 'Reopen project' : 'Mark all milestones done'}
                      style={{
                        fontSize: '0.72rem',
                        padding: '0.25rem 0.5rem',
                        color: quest.completed ? 'var(--accent-green)' : 'var(--text-muted)'
                      }}
                    >
                      <CheckCircle2 size={13} />
                      <span>{quest.completed ? 'Reopen' : 'Mark done'}</span>
                    </button>

                    {!quest.completed && (
                      <button
                        onClick={() => onOpenCreateTaskForQuest(quest.id)}
                        className="btn btn-ghost"
                        style={{ fontSize: '0.72rem', padding: '0.25rem 0.5rem' }}
                      >
                        <Plus size={12} />
                        <span>Add task</span>
                      </button>
                    )}

                    <button
                      onClick={() => setInviteQuest(quest)}
                      className="btn btn-ghost"
                      title="Invite collaborators & manage team"
                      style={{ fontSize: '0.72rem', padding: '0.25rem 0.5rem', color: 'var(--text-secondary)' }}
                    >
                      <Users size={12} />
                      <span>Team</span>
                    </button>

                    <button
                      onClick={() => {
                        if (window.confirm(`Delete project "${quest.title}"? Associated tasks will be preserved.`)) {
                          deleteQuest(quest.id);
                        }
                      }}
                      title="Delete project"
                      className="btn btn-ghost"
                      style={{ padding: '0.25rem', color: 'var(--text-dim)', lineHeight: 1 }}
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Team / Collaborator Invite Modal */}
      <InviteModal
        isOpen={!!inviteQuest}
        onClose={() => setInviteQuest(null)}
        quest={inviteQuest}
      />
    </div>
  );
}
