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

  // Sync with prop changes if task updates
  useEffect(() => {
    setNoteText(task.notes || '');
  }, [task.notes]);

  const quest = task.questId ? state.quests.find(q => q.id === task.questId) : null;

  // XP label: if XP was already claimed, show +0 XP Claimed!
  const isXpClaimed = !!task.xpClaimed;

  const difficultyMeta: Record<string, { label: string; badgeClass: string }> = {
    easy: {
      label: isXpClaimed ? 'Easy • Claimed (+0 XP)' : 'Easy • +30 XP',
      badgeClass: 'badge-easy'
    },
    medium: {
      label: isXpClaimed ? 'Medium • Claimed (+0 XP)' : 'Medium • +65 XP',
      badgeClass: 'badge-medium'
    },
    hard: {
      label: isXpClaimed ? 'Hard • Claimed (+0 XP)' : 'Hard • +140 XP',
      badgeClass: 'badge-hard'
    },
    epic: {
      label: isXpClaimed ? 'Epic • Claimed (+0 XP)' : 'Epic • +280 XP',
      badgeClass: 'badge-epic'
    }
  };

  const diff = difficultyMeta[task.difficulty] || difficultyMeta.medium;

  const proximityLabels: Record<string, string> = {
    overdue: 'Overdue',
    today: 'Due Today',
    this_week: 'This Week',
    next_week: 'Next Week',
    next_month: 'Next Month',
    later: 'Later'
  };

  const handleSaveNotes = () => {
    updateTaskNotes(task.id, noteText);
    setIsSavedFeedback(true);
    setTimeout(() => {
      setIsSavedFeedback(false);
    }, 2000);
  };

  return (
    <div
      className="clean-card"
      style={{
        padding: '0.9rem 1.15rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.65rem',
        opacity: task.completed ? 0.6 : 1,
        transition: 'all 0.15s ease'
      }}
    >
      {/* Main Row */}
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.85rem' }}>
        {/* Checkbox */}
        <button
          onClick={() => toggleTaskComplete(task.id)}
          title={
            task.completed
              ? 'Mark incomplete (task will return to list; EXP cannot be claimed again)'
              : isXpClaimed
              ? 'Complete task (EXP already claimed previously: +0 XP)'
              : `Complete task (+${task.xpReward} XP)`
          }
          style={{
            width: '20px',
            height: '20px',
            borderRadius: '5px',
            background: task.completed ? 'var(--accent-green)' : 'rgba(255, 255, 255, 0.04)',
            border: task.completed ? '1px solid var(--accent-green)' : '1px solid var(--border-card)',
            color: task.completed ? '#000000' : 'transparent',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            flexShrink: 0,
            marginTop: '0.2rem',
            transition: 'all 0.15s ease'
          }}
        >
          <Check size={13} strokeWidth={3} />
        </button>

        {/* Task Details Header */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: '0.5rem' }}>
            <h4
              onClick={() => setIsExpanded(prev => !prev)}
              style={{
                fontSize: '0.92rem',
                fontWeight: 500,
                color: task.completed ? 'var(--text-muted)' : '#ffffff',
                textDecoration: task.completed ? 'line-through' : 'none',
                lineHeight: 1.35,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.35rem'
              }}
            >
              <span>{task.title}</span>
              {task.notes && (
                <span title="Has progress notes" style={{ display: 'inline-flex', alignItems: 'center' }}>
                  <FileText size={12} color="var(--accent-gold)" />
                </span>
              )}
            </h4>

            {/* Actions: Notes toggle & Delete */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <button
                onClick={() => setIsExpanded(prev => !prev)}
                title={isExpanded ? 'Collapse notes' : 'Write progress notes'}
                className="btn btn-ghost"
                style={{
                  padding: '0.2rem 0.4rem',
                  fontSize: '0.72rem',
                  color: isExpanded ? 'var(--accent-gold)' : 'var(--text-muted)'
                }}
              >
                <FileText size={12} />
                <span>{isExpanded ? 'Close' : 'Notes'}</span>
                {isExpanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
              </button>

              <button
                onClick={() => deleteTask(task.id)}
                title="Delete task"
                className="btn btn-ghost"
                style={{
                  padding: '0.2rem',
                  color: 'var(--text-dim)',
                  lineHeight: 1
                }}
              >
                <Trash2 size={13} />
              </button>
            </div>
          </div>

          {task.description && (
            <p
              onClick={() => setIsExpanded(prev => !prev)}
              style={{
                fontSize: '0.8rem',
                color: 'var(--text-secondary)',
                marginTop: '0.25rem',
                lineHeight: 1.35,
                cursor: 'pointer'
              }}
            >
              {task.description}
            </p>
          )}

          {/* Clean Meta Row */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '0.45rem',
            marginTop: '0.5rem',
            fontSize: '0.74rem'
          }}>
            {/* Proximity badge */}
            <span className={`badge badge-proximity-${proximity}`}>
              {proximityLabels[proximity] || 'Scheduled'}
            </span>

            {/* Difficulty & XP reward */}
            <span
              className={`badge ${diff.badgeClass}`}
              title={isXpClaimed ? 'This task has already been completed before; no duplicate EXP will be granted.' : undefined}
            >
              {diff.label}
            </span>

            {/* Project tag if present */}
            {quest && (
              <span style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.3rem',
                color: 'var(--text-secondary)',
                background: 'var(--bg-subtle)',
                border: '1px solid var(--border-subtle)',
                padding: '0.15rem 0.45rem',
                borderRadius: 'var(--radius-sm)',
                fontSize: '0.72rem'
              }}>
                <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: quest.color }} />
                <span>{quest.title}</span>
              </span>
            )}

            {/* Deadline date */}
            <span style={{
              color: relativeTime.isPast ? '#f87171' : 'var(--text-muted)',
              marginLeft: 'auto',
              display: 'flex',
              alignItems: 'center',
              gap: '0.25rem'
            }}>
              <Calendar size={12} />
              <span>{formatDeadline(task.deadline).split('•')[0]}</span>
              <span>({relativeTime.text})</span>
            </span>
          </div>
        </div>
      </div>

      {/* Expandable Progress Notes Section */}
      {isExpanded && (
        <div style={{
          marginTop: '0.35rem',
          paddingTop: '0.65rem',
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
              <FileText size={12} color="var(--accent-gold)" />
              <span>Progress Notes</span>
            </span>

            {isXpClaimed && (
              <span style={{ color: 'var(--text-muted)', fontStyle: 'italic', fontSize: '0.7rem' }}>
                * Completed previously: EXP already claimed
              </span>
            )}
          </div>

          <textarea
            rows={3}
            value={noteText}
            onChange={e => setNoteText(e.target.value)}
            onBlur={handleSaveNotes}
            placeholder="Write your progress notes, steps completed, or blockers..."
            style={{
              width: '100%',
              background: 'rgba(255, 255, 255, 0.04)',
              border: '1px solid var(--border-card)',
              color: '#ffffff',
              padding: '0.5rem 0.65rem',
              borderRadius: 'var(--radius-sm)',
              fontSize: '0.8rem',
              lineHeight: 1.4,
              outline: 'none',
              resize: 'vertical',
              fontFamily: 'inherit'
            }}
          />

          <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '0.5rem' }}>
            {isSavedFeedback && (
              <span style={{ fontSize: '0.72rem', color: '#34d399', display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                <CheckCheck size={13} />
                <span>Notes Saved</span>
              </span>
            )}
            <button
              onClick={handleSaveNotes}
              className="btn btn-secondary"
              style={{ fontSize: '0.72rem', padding: '0.25rem 0.6rem' }}
            >
              <Save size={12} />
              <span>Save Notes</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
