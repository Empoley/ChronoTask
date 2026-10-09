'use client';

import React from 'react';
import { useGame } from '@/context/GameContext';
import { CheckCircle2, Circle, Plus, Calendar } from 'lucide-react';
import { formatDeadline } from '@/utils/dateUtils';

interface QuestListProps {
  onOpenCreateQuest: () => void;
  onOpenCreateTaskForQuest: (questId: string) => void;
}

export function QuestList({ onOpenCreateQuest, onOpenCreateTaskForQuest }: QuestListProps) {
  const { state, toggleMilestone } = useGame();
  const { quests, tasks } = state;

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
            Projects & Quests
          </h2>
          <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '0.1rem' }}>
            Multi-stage projects with milestone tracking and XP rewards.
          </p>
        </div>

        <button
          onClick={onOpenCreateQuest}
          className="btn btn-secondary"
          style={{ fontSize: '0.78rem' }}
        >
          <Plus size={14} />
          <span>New Project</span>
        </button>
      </div>

      {/* Quests Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '1rem' }}>
        {quests.map(quest => {
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
                borderTop: `3px solid ${quest.color}`
              }}
            >
              {/* Header */}
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '0.5rem' }}>
                <div>
                  <h3 style={{ fontSize: '0.98rem', fontWeight: 600, color: '#ffffff' }}>
                    {quest.title}
                  </h3>
                  <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '0.2rem', lineHeight: 1.35 }}>
                    {quest.description}
                  </p>
                </div>

                {quest.completed && (
                  <span style={{
                    fontSize: '0.68rem',
                    background: 'var(--accent-green-subtle)',
                    color: '#34d399',
                    padding: '0.15rem 0.45rem',
                    borderRadius: '4px',
                    fontWeight: 600
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
                    <span style={{ fontSize: '0.68rem', color: 'var(--accent-gold)' }}>
                      +25 XP
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

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                  <span style={{ color: 'var(--accent-gold)', fontWeight: 600 }}>
                    +{quest.bonusXp} XP bonus
                  </span>
                  <button
                    onClick={() => onOpenCreateTaskForQuest(quest.id)}
                    className="btn btn-ghost"
                    style={{ fontSize: '0.72rem', padding: '0.25rem 0.5rem' }}
                  >
                    <Plus size={12} />
                    <span>Add Task</span>
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
