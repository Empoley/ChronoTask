'use client';

import React, { useState, useMemo } from 'react';
import { useGame } from '@/context/GameContext';
import { CheckCircle2, Circle, Plus, Trash2, Users, FolderGit2 } from 'lucide-react';
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
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
      {/* Header & Filter Row */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '0.65rem'
      }}>
        {/* Status Filter Tabs */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.25rem',
          flexWrap: 'wrap'
        }}>
          {tabs.map(tab => {
            const isSelected = projectFilter === tab.key;
            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => setProjectFilter(tab.key as 'active' | 'completed' | 'all')}
                className={`proximity-tab ${isSelected ? 'is-active' : ''}`}
              >
                <span>{tab.label}</span>
                <span style={{
                  fontSize: '0.68rem',
                  color: isSelected ? '#ffffff' : 'var(--text-muted)',
                  background: isSelected ? 'rgba(255, 255, 255, 0.12)' : 'rgba(255, 255, 255, 0.04)',
                  padding: '0.06rem 0.35rem',
                  borderRadius: '9999px',
                  fontVariantNumeric: 'tabular-nums'
                }}>
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>

        <button
          type="button"
          onClick={onOpenCreateQuest}
          className="btn btn-secondary"
          style={{ fontSize: '0.78rem' }}
        >
          <Plus size={13} />
          <span>New project</span>
        </button>
      </div>

      {/* Empty State */}
      {filteredQuests.length === 0 ? (
        <div className="clean-card" style={{
          padding: '2.5rem 1.5rem',
          textAlign: 'center',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '0.65rem'
        }}>
          <div style={{
            width: '38px',
            height: '38px',
            borderRadius: '50%',
            background: 'var(--bg-subtle)',
            border: '1px solid var(--border-subtle)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--text-muted)'
          }}>
            <FolderGit2 size={18} />
          </div>

          <div>
            <h4 style={{ fontSize: '0.9rem', color: '#ffffff', marginBottom: '0.2rem' }}>
              {projectFilter === 'completed'
                ? 'No completed projects'
                : 'No active projects found'}
            </h4>
            <p style={{ fontSize: '0.76rem', color: 'var(--text-muted)', maxWidth: '320px', margin: '0 auto' }}>
              {projectFilter === 'completed'
                ? 'Completed projects and finished milestones will be recorded here.'
                : 'Create a project to organize multi-stage initiatives and collaborative milestones.'}
            </p>
          </div>

          <button
            type="button"
            onClick={onOpenCreateQuest}
            className="btn btn-primary"
            style={{ marginTop: '0.4rem', fontSize: '0.78rem' }}
          >
            <Plus size={13} strokeWidth={2.5} />
            <span>New project</span>
          </button>
        </div>
      ) : (
        /* Projects Grid */
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '0.85rem' }}>
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
                  padding: '1.15rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.8rem',
                  borderTop: `2.5px solid ${quest.color}`,
                  opacity: quest.completed ? 0.75 : 1,
                  transition: 'all 0.15s ease'
                }}
              >
                {/* Project Header */}
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '0.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.65rem' }}>
                    <div style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '7px',
                      background: `${quest.color}18`,
                      border: `1px solid ${quest.color}35`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '1rem',
                      flexShrink: 0
                    }}>
                      {quest.icon}
                    </div>
                    <div>
                      <h3 style={{ fontSize: '0.94rem', fontWeight: 600, color: '#ffffff', margin: 0 }}>
                        {quest.title}
                      </h3>
                      {quest.description && (
                        <p style={{ fontSize: '0.76rem', color: 'var(--text-secondary)', marginTop: '0.15rem', lineHeight: 1.35 }}>
                          {quest.description}
                        </p>
                      )}
                    </div>
                  </div>

                  {quest.completed && (
                    <span style={{
                      fontSize: '0.68rem',
                      background: 'var(--accent-green-subtle)',
                      color: '#34d399',
                      border: '1px solid var(--accent-green-border)',
                      padding: '0.12rem 0.45rem',
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
                    <span>Milestones ({completedMilestones} of {totalMilestones})</span>
                    <span style={{ fontWeight: 600, color: '#ffffff', fontVariantNumeric: 'tabular-nums' }}>{progressPercent}%</span>
                  </div>
                  <div style={{
                    height: '4px',
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
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                  {quest.milestones.map(m => (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => toggleMilestone(quest.id, m.id)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.45rem',
                        background: m.completed ? 'rgba(255, 255, 255, 0.02)' : 'var(--bg-subtle)',
                        border: '1px solid var(--border-subtle)',
                        borderRadius: 'var(--radius-sm)',
                        padding: '0.4rem 0.6rem',
                        color: m.completed ? 'var(--text-muted)' : 'var(--text-main)',
                        textAlign: 'left',
                        cursor: 'pointer',
                        fontSize: '0.76rem',
                        transition: 'all 0.1s ease'
                      }}
                    >
                      {m.completed ? (
                        <CheckCircle2 size={14} color="var(--accent-green)" />
                      ) : (
                        <Circle size={14} color="var(--text-dim)" />
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

                {/* Footer Row */}
                <div style={{
                  marginTop: 'auto',
                  paddingTop: '0.65rem',
                  borderTop: '1px solid var(--border-subtle)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  fontSize: '0.72rem'
                }}>
                  <span style={{ color: 'var(--text-muted)' }}>
                    {linkedTasks.length} pending task{linkedTasks.length !== 1 ? 's' : ''}
                  </span>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <button
                      type="button"
                      onClick={() => toggleQuestComplete(quest.id)}
                      className="btn btn-ghost"
                      title={quest.completed ? 'Reopen project' : 'Mark all milestones done'}
                      style={{
                        fontSize: '0.72rem',
                        padding: '0.2rem 0.45rem',
                        color: quest.completed ? 'var(--accent-green)' : 'var(--text-muted)'
                      }}
                    >
                      <CheckCircle2 size={12} />
                      <span>{quest.completed ? 'Reopen' : 'Mark done'}</span>
                    </button>

                    {!quest.completed && (
                      <button
                        type="button"
                        onClick={() => onOpenCreateTaskForQuest(quest.id)}
                        className="btn btn-ghost"
                        style={{ fontSize: '0.72rem', padding: '0.2rem 0.45rem' }}
                      >
                        <Plus size={12} />
                        <span>Add task</span>
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => setInviteQuest(quest)}
                      className="btn btn-ghost"
                      title="Invite collaborators & manage team"
                      style={{ fontSize: '0.72rem', padding: '0.2rem 0.45rem', color: 'var(--text-secondary)' }}
                    >
                      <Users size={12} />
                      <span>Team</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        if (window.confirm(`Delete project "${quest.title}"? Associated tasks will be preserved.`)) {
                          deleteQuest(quest.id);
                        }
                      }}
                      title="Delete project"
                      className="btn btn-ghost"
                      style={{ padding: '0.2rem', color: 'var(--text-dim)' }}
                    >
                      <Trash2 size={12} />
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
