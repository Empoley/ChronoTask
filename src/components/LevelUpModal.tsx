'use client';

import React from 'react';
import { useGame } from '@/context/GameContext';
import { Trophy, ArrowRight, Sparkles } from 'lucide-react';

export function LevelUpModal() {
  const { levelUpModal, dismissLevelUpModal } = useGame();

  if (!levelUpModal) return null;

  const { oldLevel, newLevel, unlockedFeatures } = levelUpModal;

  return (
    <div className="modal-overlay" onClick={dismissLevelUpModal}>
      <div
        className="clean-card"
        onClick={e => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: '400px',
          padding: '1.75rem',
          textAlign: 'center',
          background: '#12151f',
          border: '1px solid rgba(245, 158, 11, 0.4)'
        }}
      >
        <div style={{
          width: '54px',
          height: '54px',
          borderRadius: '50%',
          background: 'var(--accent-gold-subtle)',
          margin: '0 auto 1rem auto',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'var(--accent-gold)'
        }}>
          <Trophy size={28} />
        </div>

        <h3 style={{ fontSize: '1.35rem', fontWeight: 700, color: '#ffffff', marginBottom: '0.25rem' }}>
          Level Up!
        </h3>
        <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
          You reached a new character level.
        </p>

        {/* Level pill */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '0.75rem',
          margin: '1.25rem 0',
          padding: '0.65rem',
          background: 'var(--bg-subtle)',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--border-subtle)'
        }}>
          <span style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-muted)' }}>
            Lvl {oldLevel}
          </span>
          <ArrowRight size={16} color="var(--accent-gold)" />
          <span style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--accent-gold)' }}>
            Lvl {newLevel}
          </span>
        </div>

        {/* Stat boosts */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '0.4rem',
          marginBottom: '1rem'
        }}>
          <div style={{ background: 'var(--bg-subtle)', padding: '0.45rem', borderRadius: '6px' }}>
            <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>MIGHT</div>
            <div style={{ fontSize: '0.85rem', color: '#ffffff', fontWeight: 600 }}>+2</div>
          </div>
          <div style={{ background: 'var(--bg-subtle)', padding: '0.45rem', borderRadius: '6px' }}>
            <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>FOCUS</div>
            <div style={{ fontSize: '0.85rem', color: '#ffffff', fontWeight: 600 }}>+2</div>
          </div>
          <div style={{ background: 'var(--bg-subtle)', padding: '0.45rem', borderRadius: '6px' }}>
            <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>RESOLVE</div>
            <div style={{ fontSize: '0.85rem', color: '#ffffff', fontWeight: 600 }}>+2</div>
          </div>
        </div>

        {/* Unlocked rewards list */}
        {unlockedFeatures && unlockedFeatures.length > 0 && (
          <div style={{
            marginBottom: '1.25rem',
            padding: '0.65rem 0.85rem',
            background: 'var(--accent-purple-subtle)',
            borderRadius: 'var(--radius-sm)',
            textAlign: 'left'
          }}>
            <div style={{ fontSize: '0.72rem', color: '#c084fc', fontWeight: 600, marginBottom: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              <Sparkles size={12} />
              <span>Unlocked:</span>
            </div>
            {unlockedFeatures.map((feat, i) => (
              <div key={i} style={{ fontSize: '0.78rem', color: '#ffffff' }}>
                • {feat}
              </div>
            ))}
          </div>
        )}

        <button
          onClick={dismissLevelUpModal}
          className="btn btn-primary"
          style={{ width: '100%', padding: '0.65rem' }}
        >
          Continue
        </button>
      </div>
    </div>
  );
}
