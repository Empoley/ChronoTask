'use client';

import React, { useState, useMemo } from 'react';
import { useGame } from '@/context/GameContext';
import { TaskCard } from './TaskCard';
import { getTaskProximity, analyzeAllWorkloads } from '@/utils/dateUtils';
import { Search, Plus } from 'lucide-react';

interface TaskListProps {
  onOpenCreateTask: () => void;
}

export function TaskList({ onOpenCreateTask }: TaskListProps) {
  const { state, filterProximity, setFilterProximity } = useGame();
  const [searchQuery, setSearchQuery] = useState('');
  const [difficultyFilter, setDifficultyFilter] = useState<string>('all');

  const workloads = analyzeAllWorkloads(state.tasks);

  // Group counts
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

  const tabs = [
    { key: null, label: 'All', count: counts.all },
    { key: 'today', label: 'Today', count: counts.today, isHighWorkload: workloads.today.isHighWorkload },
    { key: 'this_week', label: 'This Week', count: counts.this_week, isHighWorkload: false },
    { key: 'next_week', label: 'Next Week', count: counts.next_week, isHighWorkload: workloads.nextWeek.isHighWorkload },
    { key: 'next_month', label: 'Next Month', count: counts.next_month, isHighWorkload: workloads.nextMonth.isHighWorkload },
    { key: 'later', label: 'Later', count: counts.later, isHighWorkload: false },
    { key: 'completed', label: 'Completed', count: counts.completed, isHighWorkload: false }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      {/* Tab Navigation & Controls */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '0.75rem'
      }}>
        {/* Clean Proximity Tabs */}
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
                onClick={() => setFilterProximity(tab.key)}
                className="btn"
                style={{
                  padding: '0.38rem 0.75rem',
                  fontSize: '0.76rem',
                  background: isSelected ? 'rgba(255, 255, 255, 0.1)' : 'transparent',
                  color: isSelected ? '#ffffff' : 'var(--text-secondary)',
                  border: isSelected ? '1px solid var(--border-card)' : '1px solid transparent',
                  position: 'relative'
                }}
              >
                <span>{tab.label}</span>
                <span style={{
                  fontSize: '0.7rem',
                  color: isSelected ? 'var(--accent-gold)' : 'var(--text-muted)',
                  marginLeft: '0.2rem'
                }}>
                  {tab.count}
                </span>

                {/* Subtle warning indicator for next week surge */}
                {tab.isHighWorkload && (
                  <span style={{
                    width: '6px',
                    height: '6px',
                    borderRadius: '50%',
                    background: '#f97316',
                    marginLeft: '0.25rem'
                  }} />
                )}
              </button>
            );
          })}
        </div>

        {/* Search & Filter */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
            <Search size={13} color="var(--text-muted)" style={{ position: 'absolute', left: '0.65rem' }} />
            <input
              type="text"
              placeholder="Search tasks..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              style={{
                background: 'rgba(255, 255, 255, 0.04)',
                border: '1px solid var(--border-subtle)',
                color: '#ffffff',
                padding: '0.38rem 0.65rem 0.38rem 2rem',
                borderRadius: 'var(--radius-md)',
                fontSize: '0.78rem',
                outline: 'none',
                width: '150px'
              }}
            />
          </div>

          <select
            value={difficultyFilter}
            onChange={e => setDifficultyFilter(e.target.value)}
            style={{
              background: 'rgba(16, 19, 27, 0.9)',
              border: '1px solid var(--border-subtle)',
              color: 'var(--text-secondary)',
              padding: '0.38rem 0.65rem',
              borderRadius: 'var(--radius-md)',
              fontSize: '0.78rem',
              outline: 'none',
              cursor: 'pointer'
            }}
          >
            <option value="all">All Difficulties</option>
            <option value="easy">Easy</option>
            <option value="medium">Medium</option>
            <option value="hard">Hard</option>
            <option value="epic">Epic</option>
          </select>
        </div>
      </div>

      {/* Task List */}
      {filteredTasks.length === 0 ? (
        <div className="clean-card" style={{
          padding: '2.5rem 1.5rem',
          textAlign: 'center'
        }}>
          <h4 style={{ fontSize: '0.95rem', color: '#ffffff', marginBottom: '0.25rem' }}>
            No tasks in this view
          </h4>
          <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
            {filterProximity === 'next_week'
              ? 'No pending tasks scheduled for next week.'
              : 'Add a new task to continue earning XP and leveling up.'}
          </p>
          <button
            onClick={onOpenCreateTask}
            className="btn btn-primary"
          >
            <Plus size={14} />
            <span>Create Task</span>
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.55rem' }}>
          {filteredTasks.map(task => (
            <TaskCard key={task.id} task={task} />
          ))}
        </div>
      )}
    </div>
  );
}
