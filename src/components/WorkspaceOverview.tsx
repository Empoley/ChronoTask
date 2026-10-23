'use client';

import React from 'react';
import { useGame } from '@/context/GameContext';
import { getTaskProximity } from '@/utils/dateUtils';
import { Layers } from 'lucide-react';

export function WorkspaceOverview() {
  const { state } = useGame();
  const { tasks, quests } = state;

  const completedCount = tasks.filter(t => t.completed).length;
  const totalTasks = tasks.length;
  const pendingCount = totalTasks - completedCount;
  const completionRate = totalTasks > 0 ? Math.round((completedCount / totalTasks) * 100) : 0;

  // Due soon: overdue or today
  const dueSoonCount = tasks.filter(t => {
    if (t.completed) return false;
    const p = getTaskProximity(t.deadline);
    return p === 'overdue' || p === 'today';
  }).length;

  return (
    <div className="clean-card" style={{
      padding: '1.15rem 1.25rem',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      gap: '0.85rem'
    }}>
      {/* Top Header */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.35rem' }}>
          <div style={{
            width: '28px',
            height: '28px',
            borderRadius: '6px',
            background: 'var(--brand-subtle)',
            border: '1px solid var(--brand-border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--brand)',
            flexShrink: 0
          }}>
            <Layers size={15} />
          </div>

          <div>
            <h3 style={{ fontSize: '0.92rem', fontWeight: 600, color: '#ffffff', margin: 0 }}>
              Workspace Status
            </h3>
            <p style={{ fontSize: '0.74rem', color: 'var(--text-secondary)', marginTop: '0.1rem' }}>
              Execution pace & completion rate
            </p>
          </div>
        </div>
      </div>

      {/* Completion Progress Strip */}
      <div>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          fontSize: '0.74rem',
          marginBottom: '0.35rem'
        }}>
          <span style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>
            Overall progress
          </span>
          <span style={{ color: 'var(--text-muted)', fontVariantNumeric: 'tabular-nums' }}>
            <strong style={{ color: '#ffffff' }}>{completedCount}</strong> of {totalTasks} ({completionRate}%)
          </span>
        </div>
        <div style={{
          height: '6px',
          width: '100%',
          background: 'rgba(255, 255, 255, 0.06)',
          borderRadius: '9999px',
          overflow: 'hidden'
        }}>
          <div
            style={{
              height: '100%',
              width: `${completionRate}%`,
              background: 'linear-gradient(90deg, #6366f1, #818cf8)',
              borderRadius: '9999px',
              transition: 'width 0.4s ease'
            }}
          />
        </div>
      </div>

      {/* 3 Metrics Row */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: '0.5rem'
      }}>
        <div style={{
          background: 'var(--bg-subtle)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-sm)',
          padding: '0.5rem',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>Pending</div>
          <div style={{ fontSize: '1.2rem', fontWeight: 700, color: '#ffffff', marginTop: '0.1rem', fontVariantNumeric: 'tabular-nums' }}>
            {pendingCount}
          </div>
        </div>

        <div style={{
          background: dueSoonCount > 0 ? 'var(--accent-time-subtle)' : 'var(--bg-subtle)',
          border: `1px solid ${dueSoonCount > 0 ? 'var(--accent-time-border)' : 'var(--border-subtle)'}`,
          borderRadius: 'var(--radius-sm)',
          padding: '0.5rem',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '0.68rem', color: dueSoonCount > 0 ? '#fbbf24' : 'var(--text-muted)' }}>Due today</div>
          <div style={{ fontSize: '1.2rem', fontWeight: 700, color: dueSoonCount > 0 ? '#fbbf24' : '#ffffff', marginTop: '0.1rem', fontVariantNumeric: 'tabular-nums' }}>
            {dueSoonCount}
          </div>
        </div>

        <div style={{
          background: 'var(--bg-subtle)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-sm)',
          padding: '0.5rem',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>Projects</div>
          <div style={{ fontSize: '1.2rem', fontWeight: 700, color: '#ffffff', marginTop: '0.1rem', fontVariantNumeric: 'tabular-nums' }}>
            {quests.filter(q => !q.completed).length}
          </div>
        </div>
      </div>
    </div>
  );
}
