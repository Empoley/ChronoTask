'use client';

import React from 'react';
import { useGame } from '@/context/GameContext';
import { getTaskProximity } from '@/utils/dateUtils';
import { CheckCircle2, Layers, FolderGit2 } from 'lucide-react';

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
    <div className="clean-card" style={{ padding: '1.25rem' }}>
      {/* Top Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.15rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
          <div style={{
            width: '42px',
            height: '42px',
            borderRadius: '10px',
            background: 'var(--brand-subtle)',
            border: '1px solid var(--brand-border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--brand)',
            flexShrink: 0
          }}>
            <Layers size={21} />
          </div>

          <div>
            <h2 style={{ fontSize: '0.98rem', fontWeight: 600, color: '#ffffff', letterSpacing: '-0.01em' }}>
              Workspace
            </h2>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '0.15rem' }}>
              Personal productivity and horizon tracking
            </p>
          </div>
        </div>
      </div>

      {/* Completion Progress Bar */}
      <div style={{ marginBottom: '1.15rem' }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          fontSize: '0.74rem',
          marginBottom: '0.4rem'
        }}>
          <span style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>
            Task completion
          </span>
          <span style={{ color: 'var(--text-muted)' }}>
            <strong style={{ color: '#ffffff' }}>{completedCount}</strong> / {totalTasks} ({completionRate}%)
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
              background: 'var(--brand)',
              borderRadius: '9999px',
              transition: 'width 0.3s ease'
            }}
          />
        </div>
      </div>

      {/* 3 Metric Summary Boxes */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: '0.5rem'
      }}>
        <div style={{
          background: 'var(--bg-subtle)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-sm)',
          padding: '0.55rem 0.45rem',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 400 }}>Pending</div>
          <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#ffffff', marginTop: '0.15rem' }}>
            {pendingCount}
          </div>
        </div>

        <div style={{
          background: 'var(--bg-subtle)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-sm)',
          padding: '0.55rem 0.45rem',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '0.72rem', color: dueSoonCount > 0 ? '#f87171' : 'var(--text-muted)', fontWeight: 400 }}>Due soon</div>
          <div style={{ fontSize: '1.25rem', fontWeight: 700, color: dueSoonCount > 0 ? '#f87171' : '#ffffff', marginTop: '0.15rem' }}>
            {dueSoonCount}
          </div>
        </div>

        <div style={{
          background: 'var(--bg-subtle)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-sm)',
          padding: '0.55rem 0.45rem',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 400 }}>Projects</div>
          <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#ffffff', marginTop: '0.15rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.25rem' }}>
            <span>{quests.filter(q => !q.completed).length}</span>
          </div>
        </div>
      </div>

    </div>
  );
}
