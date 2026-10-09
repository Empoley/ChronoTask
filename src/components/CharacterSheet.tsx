'use client';

import React from 'react';
import { useGame } from '@/context/GameContext';
import { Shield, Sparkles, ChevronRight } from 'lucide-react';

interface CharacterSheetProps {
  onOpenArmoryTab: () => void;
}

export function CharacterSheet({ onOpenArmoryTab }: CharacterSheetProps) {
  const { state } = useGame();
  const { character, equipment } = state;

  const equippedWeapon = equipment.find(e => e.slot === 'weapon' && e.equipped);
  const equippedArmor = equipment.find(e => e.slot === 'armor' && e.equipped);
  const equippedHelm = equipment.find(e => e.slot === 'helm' && e.equipped);
  const equippedRelic = equipment.find(e => e.slot === 'relic' && e.equipped);

  const xpPercent = Math.min(100, Math.round((character.currentXp / character.maxXp) * 100));

  return (
    <div className="clean-card" style={{ padding: '1.25rem' }}>
      {/* Top Profile Summary */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
          <div style={{
            width: '44px',
            height: '44px',
            borderRadius: '10px',
            background: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid var(--border-card)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.5rem',
            flexShrink: 0
          }}>
            {character.avatar}
          </div>

          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
              <h2 style={{ fontSize: '1rem', fontWeight: 600, color: '#ffffff' }}>
                {character.name}
              </h2>
              <span style={{
                fontSize: '0.72rem',
                color: 'var(--accent-gold)',
                background: 'var(--accent-gold-subtle)',
                padding: '0.1rem 0.45rem',
                borderRadius: '4px',
                fontWeight: 600
              }}>
                Lvl {character.level}
              </span>
            </div>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '0.15rem' }}>
              {character.characterClass} • <span style={{ color: 'var(--text-muted)' }}>{character.title}</span>
            </p>
          </div>
        </div>

        <button
          onClick={onOpenArmoryTab}
          className="btn btn-ghost"
          style={{ fontSize: '0.74rem', padding: '0.3rem 0.5rem', gap: '0.2rem' }}
        >
          <span>Vault</span>
          <ChevronRight size={13} />
        </button>
      </div>

      {/* Clean XP Progress */}
      <div style={{ marginBottom: '1rem' }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          fontSize: '0.74rem',
          marginBottom: '0.35rem'
        }}>
          <span style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>
            Experience
          </span>
          <span style={{ color: 'var(--text-muted)' }}>
            <strong style={{ color: '#ffffff' }}>{character.currentXp}</strong> / {character.maxXp} XP ({xpPercent}%)
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
              width: `${xpPercent}%`,
              background: 'var(--accent-gold)',
              borderRadius: '9999px',
              transition: 'width 0.3s ease'
            }}
          />
        </div>
      </div>

      {/* Clean Stats Row */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: '0.5rem',
        marginBottom: '1rem'
      }}>
        <div style={{
          background: 'var(--bg-subtle)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-sm)',
          padding: '0.5rem',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontWeight: 500 }}>MIGHT</div>
          <div style={{ fontSize: '1rem', fontWeight: 700, color: '#ffffff', marginTop: '0.1rem' }}>
            {character.stats.discipline}
          </div>
        </div>

        <div style={{
          background: 'var(--bg-subtle)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-sm)',
          padding: '0.5rem',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontWeight: 500 }}>FOCUS</div>
          <div style={{ fontSize: '1rem', fontWeight: 700, color: '#ffffff', marginTop: '0.1rem' }}>
            {character.stats.focus}
          </div>
        </div>

        <div style={{
          background: 'var(--bg-subtle)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-sm)',
          padding: '0.5rem',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontWeight: 500 }}>RESOLVE</div>
          <div style={{ fontSize: '1rem', fontWeight: 700, color: '#ffffff', marginTop: '0.1rem' }}>
            {character.stats.willpower}
          </div>
        </div>
      </div>

      {/* Compact Gear Preview */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.4rem' }}>
        {[
          { label: 'Weapon', item: equippedWeapon, fallback: '🗡️' },
          { label: 'Armor', item: equippedArmor, fallback: '🛡️' },
          { label: 'Helm', item: equippedHelm, fallback: '👑' },
          { label: 'Relic', item: equippedRelic, fallback: '⏳' }
        ].map((slot, i) => (
          <div
            key={i}
            onClick={onOpenArmoryTab}
            title={slot.item ? `${slot.item.name}: ${slot.item.description}` : `Empty ${slot.label}`}
            style={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.35rem',
              padding: '0.35rem 0.25rem',
              background: slot.item ? 'rgba(255, 255, 255, 0.04)' : 'transparent',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-sm)',
              cursor: 'pointer',
              fontSize: '0.78rem'
            }}
          >
            <span>{slot.item?.icon || slot.fallback}</span>
            <span style={{
              fontSize: '0.7rem',
              color: slot.item ? 'var(--text-secondary)' : 'var(--text-dim)',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap'
            }}>
              {slot.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
