'use client';

import React, { useState, useMemo } from 'react';
import { useGame } from '@/context/GameContext';
import { TaskCard } from './TaskCard';
import { getTaskProximity, analyzeAllWorkloads } from '@/utils/dateUtils';
import { Search, Plus, Filter, CheckCircle2 } from 'lucide-react';

interface TaskListProps {
  onOpenCreateTask: () => void;
}

export function TaskList({ onOpenCreateTask }: TaskListProps) {
  const { state, filterProximity, setFilterProximity } = useGame();
  const [searchQuery, setSearchQuery] = useState('');
  const [difficultyFilter, setDifficultyFilter] = useState<string>('all');

  const workloads = analyzeAllWorkloads(state.tasks);

  const counts = useMemo(() => {
    const c = {
      all: 0,
      today: 0,
      this_week: 0,
      next_week: 0,
      next_month: 0,
      later: 0,
      completed: 0
    };

    state.tasks.forEach(t => {
      if (t.completed) {
        c.completed++;
      } else {
        c.all++;
        const p = getTaskProximity(t.deadline);
        if (p === 'overdue' || p === 'today') c.today++;
        else if (p === 'this_week') c.this_week++;
        else if (p === 'next_week') c.next_week++;
        else if (p === 'next_month') c.next_month++;
        else if (p === 'later') c.later++;
      }
    });

    return c;
  }, [state.tasks]);

  const filteredTasks = useMemo(() => {
    return state.tasks.filter(task => {
      if (filterProximity === 'completed') {
        if (!task.completed) return false;
      } else {
        if (task.completed) return false;

        if (filterProximity === 'today') {
          const p = getTaskProximity(task.deadline);
          if (p !== 'today' && p !== 'overdue') return false;
        } else if (filterProximity) {
          const p = getTaskProximity(task.deadline);
          if (p !== filterProximity) return false;
        }
      }

      if (difficultyFilter !== 'all' && task.difficulty !== difficultyFilter) {
        return false;
      }

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = task.title.toLowerCase().includes(q);
        const matchesDesc = task.description.toLowerCase().includes(q);
        const matchesTags = task.tags.some(tag => tag.toLowerCase().includes(q));
        if (!matchesTitle && !matchesDesc && !matchesTags) return false;
      }

      return true;
    });
  }, [state.tasks, filterProximity, difficultyFilter, searchQuery]);

  const tabs: { key: string | null; label: string; count: number; isHighWorkload?: boolean }[] = [
    { key: null, label: 'All', count: counts.all },
    { key: 'today', label: 'Today', count: counts.today, isHighWorkload: workloads.today.isHighWorkload },
    { key: 'this_week', label: 'This week', count: counts.this_week, isHighWorkload: workloads.thisWeek.isHighWorkload },
    { key: 'next_week', label: 'Next week', count: counts.next_week, isHighWorkload: workloads.nextWeek.isHighWorkload },
    { key: 'next_month', label: 'Next month', count: counts.next_month, isHighWorkload: workloads.nextMonth.isHighWorkload },
    { key: 'later', label: 'Later', count: counts.later },
    { key: 'completed', label: 'Completed', count: counts.completed }
  ];

  const getEmptyStateMessage = () => {
    if (searchQuery.trim()) return `No tasks match "${searchQuery}".`;
    if (filterProximity === 'today') return 'No pending tasks scheduled for today. Horizon is clear.';
    if (filterProximity === 'this_week') return 'No pending tasks scheduled for this week.';
    if (filterProximity === 'next_week') return 'No pending tasks scheduled for next week.';
    if (filterProximity === 'next_month') return 'No pending tasks scheduled for next month.';
    if (filterProximity === 'completed') return 'No completed tasks recorded yet.';
    return 'Your workspace has no pending tasks.';
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
      {/* Tab Navigation & Search Controls */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '0.65rem'
      }}>
        {/* Proximity Filter Tabs */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.25rem',
          flexWrap: 'wrap'
        }}>
          {tabs.map(tab => {
            const isSelected = filterProximity === tab.key;
            return (
              <button
                key={tab.key ?? 'all'}
                type="button"
                onClick={() => setFilterProximity(tab.key)}
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

                {tab.isHighWorkload && (
                  <span
                    title="High workload alert"
                    style={{
                      width: '5px',
                      height: '5px',
                      borderRadius: '50%',
                      background: '#f59e0b',
                      marginLeft: '0.1rem'
                    }}
                  />
                )}
              </button>
            );
          })}
        </div>

        {/* Search & Filter Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', flexWrap: 'wrap' }}>
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
            <Search size={13} color="var(--text-muted)" style={{ position: 'absolute', left: '0.65rem' }} />
            <input
              type="text"
              placeholder="Search tasks..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              style={{
                background: 'rgba(255, 255, 255, 0.035)',
                border: '1px solid var(--border-subtle)',
                color: '#ffffff',
                padding: '0.36rem 0.65rem 0.36rem 2rem',
                borderRadius: 'var(--radius-md)',
                fontSize: '0.78rem',
                outline: 'none',
                width: '180px',
                transition: 'border-color 0.15s ease'
              }}
            />
          </div>

          <select
            value={difficultyFilter}
            onChange={e => setDifficultyFilter(e.target.value)}
            style={{
              background: '#121622',
              border: '1px solid var(--border-subtle)',
              color: 'var(--text-secondary)',
              padding: '0.36rem 0.65rem',
              borderRadius: 'var(--radius-md)',
              fontSize: '0.76rem',
              outline: 'none',
              cursor: 'pointer'
            }}
          >
            <option value="all">All priorities</option>
            <option value="easy">Easy</option>
            <option value="medium">Medium</option>
            <option value="hard">Hard</option>
            <option value="epic">Epic</option>
          </select>
        </div>
      </div>

      {/* Task List or Empty State */}
      {filteredTasks.length === 0 ? (
        <div className="clean-card" style={{
          padding: '2.5rem 1.5rem',
          textAlign: 'center',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '0.65rem'
        }}>
          <div style={{
            width: '36px',
            height: '36px',
            borderRadius: '50%',
            background: 'var(--bg-subtle)',
            border: '1px solid var(--border-subtle)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--text-muted)'
          }}>
            <CheckCircle2 size={18} />
          </div>

          <div>
            <h4 style={{ fontSize: '0.9rem', color: '#ffffff', marginBottom: '0.2rem' }}>
              {getEmptyStateMessage()}
            </h4>
            <p style={{ fontSize: '0.76rem', color: 'var(--text-muted)', maxWidth: '320px', margin: '0 auto' }}>
              Create a new task to organize your upcoming deliverables and deadlines.
            </p>
          </div>

          <button
            type="button"
            onClick={onOpenCreateTask}
            className="btn btn-primary"
            style={{ marginTop: '0.4rem', fontSize: '0.78rem' }}
          >
            <Plus size={13} strokeWidth={2.5} />
            <span>New task</span>
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {filteredTasks.map(task => (
            <TaskCard key={task.id} task={task} />
          ))}
        </div>
      )}
    </div>
  );
}
