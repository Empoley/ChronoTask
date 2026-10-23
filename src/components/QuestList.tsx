'use client';

import React, { useState, useMemo } from 'react';
import { useGame } from '@/context/GameContext';
import { 
  CheckCircle2, 
  Circle, 
  Plus, 
  Trash2, 
  Users, 
  FolderGit2, 
  ChevronDown, 
  ChevronUp, 
  Check 
} from 'lucide-react';
import { InviteModal } from './InviteModal';
import { Quest } from '@/types/game';
import { getTaskProximity, formatDeadline } from '@/utils/dateUtils';

interface QuestListProps {
  onOpenCreateQuest: () => void;
  onOpenCreateTaskForQuest: (questId: string, milestoneId?: string) => void;
}

export function QuestList({ onOpenCreateQuest, onOpenCreateTaskForQuest }: QuestListProps) {
  const { state, toggleMilestone, toggleQuestComplete, deleteQuest, toggleTaskComplete, deleteTask } = useGame();
  const { quests, tasks } = state;

  const [projectFilter, setProjectFilter] = useState<'active' | 'completed' | 'all'>('active');
  const [inviteQuest, setInviteQuest] = useState<Quest | null>(null);
  const [expandedMilestones, setExpandedMilestones] = useState<Record<string, boolean>>({});

  const toggleMilestoneDropdown = (key: string) => {
    setExpandedMilestones(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

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
                  color: isSelected ? 'var(--heading-color)' : 'var(--text-muted)',
                  background: isSelected ? 'var(--brand-subtle)' : 'var(--bg-subtle)',
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
            <h4 style={{ fontSize: '0.9rem', color: 'var(--heading-color)', marginBottom: '0.2rem' }}>
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
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '0.9rem' }}>
          {filteredQuests.map(quest => {
            const completedMilestones = quest.milestones.filter(m => m.completed).length;
            const totalMilestones = quest.milestones.length;
            const progressPercent = totalMilestones > 0 ? Math.round((completedMilestones / totalMilestones) * 100) : 0;
            
            // All tasks belonging to this project (both under milestones and general)
            const allProjectTasks = tasks.filter(t => t.questId === quest.id);
            const pendingProjectTasks = allProjectTasks.filter(t => !t.completed);
            const completedProjectTasks = allProjectTasks.filter(t => t.completed);
            const unassignedTasks = allProjectTasks.filter(t => !t.milestoneId);

            return (
              <div
                key={quest.id}
                className="clean-card"
                style={{
                  padding: '1.15rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.85rem',
                  borderTop: `2.5px solid ${quest.color}`,
                  opacity: quest.completed ? 0.78 : 1,
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
                      <h3 style={{ fontSize: '0.94rem', fontWeight: 600, color: 'var(--heading-color)', margin: 0 }}>
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
                      color: 'var(--accent-green)',
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
                    <span style={{ fontWeight: 600, color: 'var(--heading-color)', fontVariantNumeric: 'tabular-nums' }}>
                      {progressPercent}%
                    </span>
                  </div>
                  <div style={{
                    height: '4px',
                    width: '100%',
                    background: 'var(--bg-subtle)',
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

                {/* Milestones List with Dropdowns */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                  {quest.milestones.map(m => {
                    const milestoneKey = `${quest.id}-${m.id}`;
                    const milestoneTasks = tasks.filter(t => t.questId === quest.id && t.milestoneId === m.id);
                    const milestoneCompletedTasks = milestoneTasks.filter(t => t.completed);
                    const isExpanded = !!expandedMilestones[milestoneKey];

                    return (
                      <div key={m.id} className="milestone-container">
                        {/* Milestone header row - Click to toggle dropdown */}
                        <div
                          className="milestone-header-row"
                          onClick={() => toggleMilestoneDropdown(milestoneKey)}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', minWidth: 0, flex: 1 }}>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleMilestone(quest.id, m.id);
                              }}
                              title={m.completed ? 'Mark milestone incomplete' : 'Mark milestone complete'}
                              style={{
                                background: 'transparent',
                                border: 'none',
                                padding: 0,
                                display: 'flex',
                                alignItems: 'center',
                                cursor: 'pointer'
                              }}
                            >
                              {m.completed ? (
                                <CheckCircle2 size={15} color="var(--accent-green)" />
                              ) : (
                                <Circle size={15} color="var(--text-dim)" />
                              )}
                            </button>

                            <span style={{
                              textDecoration: m.completed ? 'line-through' : 'none',
                              color: m.completed ? 'var(--text-muted)' : 'var(--text-main)',
                              fontSize: '0.78rem',
                              fontWeight: 500,
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap'
                            }}>
                              {m.title}
                            </span>
                          </div>

                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', flexShrink: 0 }}>
                            {/* Milestone Tasks Counter Badge */}
                            <span className={`milestone-task-badge ${milestoneTasks.length === 0 ? 'is-zero' : (milestoneCompletedTasks.length === milestoneTasks.length ? 'is-completed' : '')}`}>
                              {milestoneTasks.length === 0 ? '0 tasks' : `${milestoneCompletedTasks.length}/${milestoneTasks.length} tasks`}
                            </span>

                            {/* Direct "+ Task" button */}
                            {!quest.completed && (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onOpenCreateTaskForQuest(quest.id, m.id);
                                }}
                                title={`Add task under milestone "${m.title}"`}
                                className="btn btn-ghost"
                                style={{ padding: '0.12rem 0.35rem', fontSize: '0.7rem', color: 'var(--brand)' }}
                              >
                                <Plus size={11} strokeWidth={2.5} />
                                <span>Task</span>
                              </button>
                            )}

                            {/* Dropdown Chevron */}
                            <div style={{ color: 'var(--text-muted)', display: 'flex', alignItems: 'center' }}>
                              {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                            </div>
                          </div>
                        </div>

                        {/* Milestone Tasks Dropdown Drawer */}
                        {isExpanded && (
                          <div className="milestone-drawer">
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.15rem' }}>
                              <span style={{ fontSize: '0.67rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                                Milestone Tasks ({milestoneTasks.length})
                              </span>
                              {!quest.completed && (
                                <button
                                  type="button"
                                  onClick={() => onOpenCreateTaskForQuest(quest.id, m.id)}
                                  className="btn btn-ghost"
                                  style={{ fontSize: '0.68rem', padding: '0.1rem 0.35rem', color: 'var(--brand)' }}
                                >
                                  <Plus size={11} />
                                  <span>Add task</span>
                                </button>
                              )}
                            </div>

                            {milestoneTasks.length === 0 ? (
                              <div style={{
                                padding: '0.65rem',
                                textAlign: 'center',
                                background: 'var(--bg-subtle)',
                                borderRadius: 'var(--radius-sm)',
                                fontSize: '0.72rem',
                                color: 'var(--text-muted)',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                gap: '0.35rem'
                              }}>
                                <span>No tasks added to this milestone yet.</span>
                                {!quest.completed && (
                                  <button
                                    type="button"
                                    onClick={() => onOpenCreateTaskForQuest(quest.id, m.id)}
                                    className="btn btn-secondary"
                                    style={{ fontSize: '0.7rem', padding: '0.2rem 0.5rem' }}
                                  >
                                    <Plus size={11} />
                                    <span>Add task to milestone</span>
                                  </button>
                                )}
                              </div>
                            ) : (
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                                {milestoneTasks.map(task => {
                                  const prox = getTaskProximity(task.deadline);
                                  return (
                                    <div key={task.id} className={`milestone-task-card ${task.completed ? 'is-done' : ''}`}>
                                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', minWidth: 0, flex: 1 }}>
                                        <button
                                          type="button"
                                          onClick={() => toggleTaskComplete(task.id)}
                                          title={task.completed ? 'Mark incomplete' : 'Mark complete'}
                                          style={{
                                            width: '15px',
                                            height: '15px',
                                            borderRadius: '4px',
                                            background: task.completed ? 'var(--accent-green)' : 'transparent',
                                            border: task.completed ? '1px solid var(--accent-green)' : '1px solid var(--border-subtle)',
                                            color: '#ffffff',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            cursor: 'pointer',
                                            flexShrink: 0,
                                            transition: 'all 0.12s ease'
                                          }}
                                        >
                                          <Check size={10} strokeWidth={3} />
                                        </button>
                                        <span style={{
                                          fontSize: '0.76rem',
                                          color: task.completed ? 'var(--text-muted)' : 'var(--text-main)',
                                          textDecoration: task.completed ? 'line-through' : 'none',
                                          overflow: 'hidden',
                                          textOverflow: 'ellipsis',
                                          whiteSpace: 'nowrap'
                                        }}>
                                          {task.title}
                                        </span>
                                      </div>

                                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', flexShrink: 0 }}>
                                        <span className={`badge badge-proximity-${prox}`} style={{ fontSize: '0.62rem', padding: '0.04rem 0.35rem' }}>
                                          {formatDeadline(task.deadline)}
                                        </span>
                                        <span className={`badge badge-${task.difficulty}`} style={{ fontSize: '0.62rem', padding: '0.04rem 0.32rem' }}>
                                          {task.difficulty}
                                        </span>
                                        <button
                                          type="button"
                                          onClick={() => deleteTask(task.id)}
                                          title="Delete task"
                                          className="btn btn-ghost"
                                          style={{ padding: '0.12rem', color: 'var(--text-dim)' }}
                                        >
                                          <Trash2 size={11} />
                                        </button>
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}

                  {/* General / Unassigned Tasks Drawer (if any exist) */}
                  {unassignedTasks.length > 0 && (
                    <div className="milestone-container" style={{ borderStyle: 'dashed' }}>
                      <div
                        className="milestone-header-row"
                        onClick={() => toggleMilestoneDropdown(`${quest.id}-unassigned`)}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', minWidth: 0, flex: 1 }}>
                          <span style={{ fontSize: '0.76rem', color: 'var(--text-secondary)', fontWeight: 500 }}>
                            📁 General project tasks
                          </span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', flexShrink: 0 }}>
                          <span className="milestone-task-badge is-zero">
                            {unassignedTasks.filter(t => t.completed).length}/{unassignedTasks.length} tasks
                          </span>
                          <div style={{ color: 'var(--text-muted)', display: 'flex', alignItems: 'center' }}>
                            {expandedMilestones[`${quest.id}-unassigned`] ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                          </div>
                        </div>
                      </div>

                      {expandedMilestones[`${quest.id}-unassigned`] && (
                        <div className="milestone-drawer">
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                            {unassignedTasks.map(task => {
                              const prox = getTaskProximity(task.deadline);
                              return (
                                <div key={task.id} className={`milestone-task-card ${task.completed ? 'is-done' : ''}`}>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', minWidth: 0, flex: 1 }}>
                                    <button
                                      type="button"
                                      onClick={() => toggleTaskComplete(task.id)}
                                      title={task.completed ? 'Mark incomplete' : 'Mark complete'}
                                      style={{
                                        width: '15px',
                                        height: '15px',
                                        borderRadius: '4px',
                                        background: task.completed ? 'var(--accent-green)' : 'transparent',
                                        border: task.completed ? '1px solid var(--accent-green)' : '1px solid var(--border-subtle)',
                                        color: '#ffffff',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        cursor: 'pointer',
                                        flexShrink: 0
                                      }}
                                    >
                                      <Check size={10} strokeWidth={3} />
                                    </button>
                                    <span style={{
                                      fontSize: '0.76rem',
                                      color: task.completed ? 'var(--text-muted)' : 'var(--text-main)',
                                      textDecoration: task.completed ? 'line-through' : 'none',
                                      overflow: 'hidden',
                                      textOverflow: 'ellipsis',
                                      whiteSpace: 'nowrap'
                                    }}>
                                      {task.title}
                                    </span>
                                  </div>

                                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', flexShrink: 0 }}>
                                    <span className={`badge badge-proximity-${prox}`} style={{ fontSize: '0.62rem', padding: '0.04rem 0.35rem' }}>
                                      {formatDeadline(task.deadline)}
                                    </span>
                                    <button
                                      type="button"
                                      onClick={() => deleteTask(task.id)}
                                      title="Delete task"
                                      className="btn btn-ghost"
                                      style={{ padding: '0.12rem', color: 'var(--text-dim)' }}
                                    >
                                      <Trash2 size={11} />
                                    </button>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
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
                    <strong style={{ color: 'var(--heading-color)', fontVariantNumeric: 'tabular-nums' }}>
                      {pendingProjectTasks.length}
                    </strong> pending task{pendingProjectTasks.length !== 1 ? 's' : ''}
                    {allProjectTasks.length > 0 && (
                      <span style={{ color: 'var(--text-dim)' }}> ({completedProjectTasks.length}/{allProjectTasks.length} done)</span>
                    )}
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
