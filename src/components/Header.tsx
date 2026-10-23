'use client';

import React, { useState } from 'react';
import { useGame } from '@/context/GameContext';
import { useAuth } from '@/context/AuthContext';
import { CheckSquare, Volume2, VolumeX, Plus, FolderPlus, FolderGit2, User as UserIcon, LogOut, Cloud, Mail } from 'lucide-react';
import { CollaborationInvitesPopover } from './CollaborationInvitesPopover';

interface HeaderProps {
  onOpenCreateTask: () => void;
  onOpenCreateQuest: () => void;
}

export function Header({ onOpenCreateTask, onOpenCreateQuest }: HeaderProps) {
  const { state, pendingInvites, isSoundMuted, toggleSoundMuted, isCloudSynced } = useGame();
  const { user, signOut, openAuthModal } = useAuth();
  const [isInvitesOpen, setIsInvitesOpen] = useState(false);
  const { tasks, quests } = state;

  const completedCount = tasks.filter(t => t.completed).length;
  const totalTasks = tasks.length;
  const activeProjectsCount = quests.filter(q => !q.completed).length;

  return (
    <header style={{
      borderBottom: '1px solid var(--border-subtle)',
      background: 'rgba(8, 10, 15, 0.85)',
      backdropFilter: 'blur(16px)',
      position: 'sticky',
      top: 0,
      zIndex: 100,
      padding: '0.65rem 1.5rem'
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
        {/* Left: Brand Identity & Quick Stats */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.55rem' }}>
            <div style={{
              width: '30px',
              height: '30px',
              borderRadius: '7px',
              background: 'var(--brand-subtle)',
              border: '1px solid var(--brand-border)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--brand)'
            }}>
              <CheckSquare size={16} />
            </div>
            <span style={{ fontSize: '1rem', fontWeight: 700, color: '#ffffff', letterSpacing: '-0.02em' }}>
              ChronoTasks
            </span>
          </div>

          <div style={{
            width: '1px',
            height: '16px',
            background: 'var(--border-subtle)',
            margin: '0 0.15rem'
          }} />

          {/* Quiet Status Counters */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
              <strong style={{ color: '#ffffff', fontVariantNumeric: 'tabular-nums' }}>{completedCount}</strong>
              <span style={{ color: 'var(--text-muted)' }}>/ {totalTasks} done</span>
            </span>
            <span style={{ color: 'var(--text-dim)' }}>·</span>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
              <strong style={{ color: '#ffffff', fontVariantNumeric: 'tabular-nums' }}>{activeProjectsCount}</strong>
              <span style={{ color: 'var(--text-muted)' }}>active {activeProjectsCount === 1 ? 'project' : 'projects'}</span>
            </span>
          </div>
        </div>

        {/* Right: Utilities & Primary Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
          {/* Collaboration Invites Popover Button */}
          {user && (
            <div style={{ position: 'relative' }}>
              <button
                id="collaboration-invites-btn"
                onClick={() => setIsInvitesOpen(prev => !prev)}
                className="btn btn-secondary"
                style={{
                  padding: '0.3rem 0.65rem',
                  fontSize: '0.76rem',
                  background: isInvitesOpen 
                    ? 'rgba(99, 102, 241, 0.16)' 
                    : (pendingInvites.length > 0 ? 'rgba(99, 102, 241, 0.12)' : 'var(--bg-subtle)'),
                  borderColor: (pendingInvites.length > 0 || isInvitesOpen)
                    ? 'rgba(99, 102, 241, 0.45)'
                    : 'var(--border-subtle)',
                  color: (pendingInvites.length > 0 || isInvitesOpen) ? '#ffffff' : 'var(--text-secondary)'
                }}
                title={pendingInvites.length > 0 ? `${pendingInvites.length} pending collaboration invite(s)` : 'Collaboration invites'}
              >
                <Mail size={13} color={(pendingInvites.length > 0 || isInvitesOpen) ? 'var(--brand)' : 'currentColor'} />
                <span>Invites</span>
                {pendingInvites.length > 0 && (
                  <span
                    className="invite-badge-pulse"
                    style={{
                      background: 'var(--brand)',
                      color: '#ffffff',
                      fontSize: '0.64rem',
                      fontWeight: 700,
                      padding: '0.08rem 0.4rem',
                      borderRadius: '9999px',
                      lineHeight: 1
                    }}
                  >
                    {pendingInvites.length}
                  </span>
                )}
              </button>

              <CollaborationInvitesPopover
                isOpen={isInvitesOpen}
                onClose={() => setIsInvitesOpen(false)}
              />
            </div>
          )}

          {/* Audio toggle */}
          <button
            onClick={toggleSoundMuted}
            title={isSoundMuted ? 'Unmute notification sounds' : 'Mute notification sounds'}
            className="btn btn-ghost"
            style={{ padding: '0.35rem', borderRadius: 'var(--radius-sm)' }}
          >
            {isSoundMuted ? <VolumeX size={14} color="var(--text-muted)" /> : <Volume2 size={14} color="var(--text-secondary)" />}
          </button>

          {/* User Account / Auth Capsule */}
          {user ? (
            <div
              title={isCloudSynced ? 'Synced in realtime with Supabase cloud' : 'Connecting to cloud...'}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                background: 'var(--bg-subtle)',
                border: '1px solid var(--border-subtle)',
                padding: '0.25rem 0.6rem',
                borderRadius: 'var(--radius-md)',
                fontSize: '0.75rem'
              }}
            >
              <Cloud size={12} color={isCloudSynced ? 'var(--accent-green)' : 'var(--accent-time)'} />
              <span style={{ color: 'var(--text-secondary)', maxWidth: '135px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {user.email}
              </span>
              <button
                onClick={signOut}
                title="Sign out of account"
                className="btn btn-ghost"
                style={{ padding: '0.15rem', color: 'var(--text-muted)' }}
              >
                <LogOut size={12} />
              </button>
            </div>
          ) : (
            <button
              onClick={() => openAuthModal('signin')}
              className="btn btn-secondary"
              style={{ fontSize: '0.76rem', padding: '0.32rem 0.7rem' }}
            >
              <UserIcon size={12} />
              <span>Sign in</span>
            </button>
          )}

          <div style={{
            width: '1px',
            height: '16px',
            background: 'var(--border-subtle)',
            margin: '0 0.15rem'
          }} />

          {/* Primary Action Buttons */}
          <button
            onClick={onOpenCreateQuest}
            className="btn btn-secondary"
            style={{ fontSize: '0.78rem', padding: '0.4rem 0.8rem' }}
          >
            <FolderPlus size={13} />
            <span>New project</span>
          </button>

          <button
            onClick={onOpenCreateTask}
            className="btn btn-primary"
            style={{ fontSize: '0.78rem', padding: '0.4rem 0.9rem' }}
          >
            <Plus size={14} strokeWidth={2.5} />
            <span>New task</span>
          </button>
        </div>
      </div>
    </header>
  );
}
