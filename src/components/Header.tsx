'use client';

import React from 'react';
import { useGame } from '@/context/GameContext';
import { Sparkles, Volume2, VolumeX, RotateCcw, Plus, FolderPlus, Swords } from 'lucide-react';

interface HeaderProps {
  onOpenCreateTask: () => void;
  onOpenCreateQuest: () => void;
}

export function Header({ onOpenCreateTask, onOpenCreateQuest }: HeaderProps) {
  const { state, isSoundMuted, toggleSoundMuted, resetDemoData } = useGame();
  const { character } = state;

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
            background: 'rgba(245, 158, 11, 0.15)',
            border: '1px solid rgba(245, 158, 11, 0.3)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--accent-gold)'
          }}>
            <Swords size={18} />
          </div>
          <div>
            <span style={{ fontSize: '1.05rem', fontWeight: 700, color: '#ffffff', letterSpacing: '-0.02em' }}>
              Chrono<span style={{ color: 'var(--accent-gold)' }}>Quest</span>
            </span>
          </div>
        </div>

        {/* Hero Quick Stats */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
          {/* Level & XP Capsule */}
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
            <span style={{ fontWeight: 700, color: 'var(--accent-gold)' }}>
              Lvl {character.level}
            </span>
            <span style={{ color: 'var(--text-muted)' }}>•</span>
            <span style={{ color: 'var(--text-secondary)' }}>
              {character.currentXp}/{character.maxXp} XP
            </span>
          </div>

          {/* Gold */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.35rem',
            background: 'var(--bg-subtle)',
            border: '1px solid var(--border-subtle)',
            padding: '0.3rem 0.65rem',
            borderRadius: 'var(--radius-md)',
            fontSize: '0.76rem',
            color: '#fde047',
            fontWeight: 600
          }}>
            <span>🪙</span>
            <span>{character.gold}g</span>
          </div>

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
              if (window.confirm('Reset demo state back to default data?')) {
                resetDemoData();
              }
            }}
            title="Reset demo data"
            className="btn btn-ghost"
            style={{ padding: '0.35rem 0.6rem', fontSize: '0.74rem' }}
          >
            <RotateCcw size={13} style={{ marginRight: '0.25rem' }} />
            Reset
          </button>

          {/* Create Project / Quest */}
          <button
            onClick={onOpenCreateQuest}
            className="btn btn-secondary"
            style={{ fontSize: '0.78rem', padding: '0.42rem 0.8rem' }}
          >
            <FolderPlus size={14} />
            <span>New Quest</span>
          </button>

          {/* Create Task CTA */}
          <button
            onClick={onOpenCreateTask}
            className="btn btn-primary"
            style={{ fontSize: '0.78rem', padding: '0.42rem 0.95rem' }}
          >
            <Plus size={15} strokeWidth={2.5} />
            <span>New Task</span>
          </button>
        </div>
      </div>
    </header>
  );
}
