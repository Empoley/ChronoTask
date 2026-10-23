'use client';

import React, { useState, useEffect } from 'react';
import { Task } from '@/types/game';
import { useGame } from '@/context/GameContext';
import { getTaskProximity, formatDeadline, getRelativeTimeText } from '@/utils/dateUtils';
import { Check, Trash2, Calendar, FileText, ChevronDown, ChevronUp, Save, CheckCheck } from 'lucide-react';

interface TaskCardProps {
  task: Task;
}

export function TaskCard({ task }: TaskCardProps) {
  const { state, toggleTaskComplete, updateTaskNotes, deleteTask } = useGame();
  const proximity = getTaskProximity(task.deadline);
  const relativeTime = getRelativeTimeText(task.deadline);

  const [isExpanded, setIsExpanded] = useState(false);
  const [noteText, setNoteText] = useState(task.notes || '');
  const [isSavedFeedback, setIsSavedFeedback] = useState(false);

  useEffect(() => {
    setNoteText(task.notes || '');
  }, [task.notes]);

  const quest = task.questId ? state.quests.find(q => q.id === task.questId) : null;
  const milestone = (quest && task.milestoneId) ? quest.milestones.find(m => m.id === task.milestoneId) : null;

  const difficultyMeta: Record<string, { label: string; badgeClass: string }> = {
    easy: { label: 'Easy', badgeClass: 'badge-easy' },
    medium: { label: 'Medium', badgeClass: 'badge-medium' },
    hard: { label: 'Hard', badgeClass: 'badge-hard' },
    epic: { label: 'Epic', badgeClass: 'badge-epic' }
  };

  const diff = difficultyMeta[task.difficulty] || difficultyMeta.medium;

  const proximityLabels: Record<string, string> = {
    overdue: 'Overdue',
    today: 'Due today',
    this_week: 'This week',
    next_week: 'Next week',
    next_month: 'Next month',
    later: 'Later'
  };

  const handleSaveNotes = () => {
    updateTaskNotes(task.id, noteText);
    setIsSavedFeedback(true);
    setTimeout(() => {
      setIsSavedFeedback(false);
    }, 2000);
  };

  const isDueSoon = proximity === 'overdue' || proximity === 'today';

  return (
    <div className={`task-item status-${proximity} ${task.completed ? 'is-completed' : ''}`}>
      {/* Primary Card Row */}
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
        {/* Custom tactile checkbox */}
        <button
          type="button"
          onClick={() => toggleTaskComplete(task.id)}
          title={task.completed ? 'Mark incomplete' : 'Mark complete'}
          style={{
            width: '18px',
            height: '18px',
            borderRadius: '5px',
            background: task.completed ? 'var(--accent-green)' : 'transparent',
            border: task.completed ? '1px solid var(--accent-green)' : '1px solid var(--border-card)',
            color: '#000000',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            flexShrink: 0,
            marginTop: '0.15rem',
            transition: 'all 0.15s ease'
          }}
        >
          <Check size={12} strokeWidth={3} />
        </button>

        {/* Task Content */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: '0.5rem' }}>
            <h4
              onClick={() => setIsExpanded(prev => !prev)}
              style={{
                fontSize: '0.9rem',
                fontWeight: 500,
                color: task.completed ? 'var(--text-muted)' : 'var(--heading-color)',
                textDecoration: task.completed ? 'line-through' : 'none',
                lineHeight: 1.35,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem'
              }}
            >
              <span>{task.title}</span>
              {task.notes && (
                <span title="Has progress notes" style={{ display: 'inline-flex', alignItems: 'center' }}>
                  <FileText size={11} color="var(--brand)" />
                </span>
              )}
            </h4>

            {/* Quick Actions */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              <button
                type="button"
                onClick={() => setIsExpanded(prev => !prev)}
                title={isExpanded ? 'Collapse notes' : 'View progress notes'}
                className="btn btn-ghost"
                style={{
                  padding: '0.15rem 0.35rem',
                  fontSize: '0.72rem',
                  color: isExpanded ? 'var(--brand)' : 'var(--text-muted)'
                }}
              >
                <FileText size={11} />
                <span>{isExpanded ? 'Hide' : 'Notes'}</span>
                {isExpanded ? <ChevronUp size={11} /> : <ChevronDown size={11} />}
              </button>

              <button
                type="button"
                onClick={() => deleteTask(task.id)}
                title="Delete task"
                className="btn btn-ghost"
                style={{
                  padding: '0.15rem',
                  color: 'var(--text-dim)'
                }}
              >
                <Trash2 size={12} />
              </button>
            </div>
          </div>

          {task.description && (
            <p
              onClick={() => setIsExpanded(prev => !prev)}
              style={{
                fontSize: '0.78rem',
                color: 'var(--text-secondary)',
                marginTop: '0.2rem',
                lineHeight: 1.4,
                cursor: 'pointer'
              }}
            >
              {task.description}
            </p>
          )}

          {/* Unified Metadata Row */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '0.45rem',
            marginTop: '0.45rem',
            fontSize: '0.72rem'
          }}>
            {/* Horizon Proximity Pill */}
            <span className={`badge badge-proximity-${proximity}`}>
              {proximityLabels[proximity] || 'Scheduled'}
            </span>

            {/* Priority Indicator */}
            <span className={`badge ${diff.badgeClass}`}>
              {diff.label}
            </span>

            {/* Project Pill if associated */}
            {quest && (
              <span style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.3rem',
                color: 'var(--text-secondary)',
                background: 'var(--bg-subtle)',
                border: '1px solid var(--border-subtle)',
                padding: '0.12rem 0.45rem',
                borderRadius: '4px',
                fontSize: '0.7rem'
              }}>
                <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: quest.color }} />
                <span>{quest.title}</span>
                {milestone && (
                  <>
                    <span style={{ opacity: 0.4 }}>/</span>
                    <span style={{ color: 'var(--brand)', fontWeight: 600 }}>{milestone.title}</span>
                  </>
                )}
              </span>
            )}

            {/* Deadline information */}
            <span style={{
              color: isDueSoon ? '#fbbf24' : 'var(--text-muted)',
              marginLeft: 'auto',
              display: 'flex',
              alignItems: 'center',
              gap: '0.3rem',
              fontVariantNumeric: 'tabular-nums'
            }}>
              <Calendar size={11} />
              <span>{formatDeadline(task.deadline)}</span>
              <span style={{ color: isDueSoon ? '#f59e0b' : 'var(--text-dim)', fontSize: '0.68rem' }}>
                ({relativeTime.text})
              </span>
            </span>
          </div>
        </div>
      </div>

      {/* Progress Notes Drawer */}
      {isExpanded && (
        <div style={{
          marginTop: '0.25rem',
          paddingTop: '0.6rem',
          borderTop: '1px solid var(--border-subtle)',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.45rem'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontSize: '0.72rem',
            color: 'var(--text-secondary)'
          }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontWeight: 600 }}>
              <FileText size={11} color="var(--brand)" />
              <span>Progress notes & blockers</span>
            </span>
          </div>

          <textarea
            rows={3}
            value={noteText}
            onChange={e => setNoteText(e.target.value)}
            onBlur={handleSaveNotes}
            placeholder="Record task status, key decisions, or next steps..."
            style={{
              width: '100%',
              background: 'var(--input-bg)',
              border: '1px solid var(--input-border)',
              color: 'var(--text-main)',
              padding: '0.45rem 0.65rem',
              borderRadius: 'var(--radius-sm)',
              fontSize: '0.78rem',
              lineHeight: 1.45,
              outline: 'none',
              resize: 'vertical',
              fontFamily: 'inherit'
            }}
          />

          <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '0.5rem' }}>
            {isSavedFeedback && (
              <span style={{ fontSize: '0.72rem', color: '#34d399', display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                <CheckCheck size={12} />
                <span>Notes saved</span>
              </span>
            )}
            <button
              type="button"
              onClick={handleSaveNotes}
              className="btn btn-secondary"
              style={{ fontSize: '0.72rem', padding: '0.22rem 0.55rem' }}
            >
              <Save size={11} />
              <span>Save notes</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
