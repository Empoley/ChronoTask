'use client';

import React from 'react';
import { useGame } from '@/context/GameContext';
import { useAuth } from '@/context/AuthContext';
import { CheckSquare, Volume2, VolumeX, RotateCcw, Plus, FolderPlus, FolderGit2, User as UserIcon, LogOut, Cloud } from 'lucide-react';

interface HeaderProps {
  onOpenCreateTask: () => void;
  onOpenCreateQuest: () => void;
}

export function Header({ onOpenCreateTask, onOpenCreateQuest }: HeaderProps) {
  const { state, isSoundMuted, toggleSoundMuted, resetDemoData, isCloudSynced } = useGame();
  const { user, signOut, openAuthModal } = useAuth();
  const { tasks, quests } = state;

  const completedCount = tasks.filter(t => t.completed).length;
  const totalTasks = tasks.length;

  return (
    <header style={{
      borderBottom: '1px solid var(--border-subtle)',
      background: 'rgba(10, 12, 16, 0.8)',
      backdropFilter: 'blur(16px)',
      position: 'sticky',
      top: 0,
      zIndex: 100,
      padding: '0.75rem 1.5rem'
    }}>
      <div style={{
        maxWidth: '1280px',
        margin: '0 auto',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '0.75rem'
      }}>
        {/* Brand */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
          <div style={{
            width: '32px',
            height: '32px',
            borderRadius: '8px',
            background: 'var(--brand-subtle)',
            border: '1px solid var(--brand-border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--brand)'
          }}>
            <CheckSquare size={17} />
          </div>
          <div>
            <span style={{ fontSize: '1.05rem', fontWeight: 700, color: '#ffffff', letterSpacing: '-0.02em' }}>
              ChronoTasks
            </span>
          </div>
        </div>

        {/* Quick Stats & Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.55rem', flexWrap: 'wrap' }}>
          {/* Completed capsule */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.45rem',
            background: 'var(--bg-subtle)',
            border: '1px solid var(--border-subtle)',
            padding: '0.3rem 0.65rem',
            borderRadius: 'var(--radius-md)',
            fontSize: '0.76rem'
          }}>
            <CheckSquare size={13} color="var(--accent-green)" />
            <span style={{ color: 'var(--text-secondary)' }}>
              <strong style={{ color: '#ffffff' }}>{completedCount}</strong>/{totalTasks} completed
            </span>
          </div>

          {/* Projects capsule */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.35rem',
            background: 'var(--bg-subtle)',
            border: '1px solid var(--border-subtle)',
            padding: '0.3rem 0.65rem',
            borderRadius: 'var(--radius-md)',
            fontSize: '0.76rem',
            color: 'var(--text-secondary)'
          }}>
            <FolderGit2 size={13} color="var(--brand)" />
            <span style={{ color: '#ffffff', fontWeight: 600 }}>{quests.filter(q => !q.completed).length}</span>
            <span style={{ fontWeight: 400, color: 'var(--text-muted)' }}>projects</span>
          </div>

          {/* User Account / Auth Status */}
          {user ? (
            <div
              title={isCloudSynced ? 'Realtime Cloud Connected' : 'Syncing...'}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.45rem',
                background: 'var(--bg-subtle)',
                border: '1px solid var(--border-subtle)',
                padding: '0.25rem 0.65rem',
                borderRadius: 'var(--radius-md)',
                fontSize: '0.76rem'
              }}
            >
              <Cloud size={13} color={isCloudSynced ? 'var(--accent-green)' : 'var(--accent-gold)'} />
              <span style={{ color: '#ffffff', maxWidth: '140px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {user.email}
              </span>
              <button
                onClick={signOut}
                title="Sign out of account"
                className="btn btn-ghost"
                style={{ padding: '0.2rem', color: 'var(--text-muted)' }}
              >
                <LogOut size={13} />
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <button
                onClick={() => openAuthModal('signin')}
                className="btn btn-secondary"
                style={{ fontSize: '0.76rem', padding: '0.38rem 0.75rem' }}
              >
                <UserIcon size={13} />
                <span>Sign in</span>
              </button>
            </div>
          )}

          {/* Audio toggle */}
          <button
            onClick={toggleSoundMuted}
            title={isSoundMuted ? 'Unmute sounds' : 'Mute sounds'}
            className="btn btn-ghost"
            style={{ padding: '0.35rem', borderRadius: '6px' }}
          >
            {isSoundMuted ? <VolumeX size={15} color="var(--text-muted)" /> : <Volume2 size={15} color="var(--text-secondary)" />}
          </button>

          {/* Reset Demo button */}
          <button
            onClick={() => {
              if (window.confirm('Reset workspace back to default state?')) {
                resetDemoData();
              }
            }}
            title="Reset workspace"
            className="btn btn-ghost"
            style={{ padding: '0.35rem 0.6rem', fontSize: '0.74rem' }}
          >
            <RotateCcw size={13} style={{ marginRight: '0.25rem' }} />
            Reset
          </button>

          {/* Create Project */}
          <button
            onClick={onOpenCreateQuest}
            className="btn btn-secondary"
            style={{ fontSize: '0.78rem', padding: '0.42rem 0.8rem' }}
          >
            <FolderPlus size={14} />
            <span>New project</span>
          </button>

          {/* Create Task CTA */}
          <button
            onClick={onOpenCreateTask}
            className="btn btn-primary"
            style={{ fontSize: '0.78rem', padding: '0.42rem 0.95rem' }}
          >
            <Plus size={15} strokeWidth={2.5} />
            <span>New task</span>
          </button>
        </div>
      </div>
    </header>
  );
}
