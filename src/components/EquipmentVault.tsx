'use client';

import React, { useState } from 'react';
import { useGame } from '@/context/GameContext';
import { Lock, Check } from 'lucide-react';

export function EquipmentVault() {
  const { state, equipItem, setActiveTitle, setActiveRealm } = useGame();
  const { equipment, titles, realms, character } = state;

  const [activeTab, setActiveTab] = useState<'armory' | 'titles' | 'realms'>('armory');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      {/* Header & Sub-nav */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '0.75rem'
      }}>
        <div>
          <h2 style={{ fontSize: '1.05rem', fontWeight: 600, color: '#ffffff' }}>
            Rewards & Unlocks
          </h2>
          <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '0.1rem' }}>
            Long-term goal achievements unlock gear, titles, and locations.
          </p>
        </div>

        <div style={{
          display: 'flex',
          gap: '0.25rem',
          background: 'var(--bg-subtle)',
          padding: '0.2rem',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--border-subtle)'
        }}>
          <button
            onClick={() => setActiveTab('armory')}
            className="btn"
            style={{
              padding: '0.35rem 0.75rem',
              fontSize: '0.76rem',
              background: activeTab === 'armory' ? 'rgba(255, 255, 255, 0.1)' : 'transparent',
              color: activeTab === 'armory' ? '#ffffff' : 'var(--text-secondary)'
            }}
          >
            Equipment ({equipment.filter(e => e.unlocked).length}/{equipment.length})
          </button>

          <button
            onClick={() => setActiveTab('titles')}
            className="btn"
            style={{
              padding: '0.35rem 0.75rem',
              fontSize: '0.76rem',
              background: activeTab === 'titles' ? 'rgba(255, 255, 255, 0.1)' : 'transparent',
              color: activeTab === 'titles' ? '#ffffff' : 'var(--text-secondary)'
            }}
          >
            Titles ({titles.filter(t => t.unlocked).length}/{titles.length})
          </button>

          <button
            onClick={() => setActiveTab('realms')}
            className="btn"
            style={{
              padding: '0.35rem 0.75rem',
              fontSize: '0.76rem',
              background: activeTab === 'realms' ? 'rgba(255, 255, 255, 0.1)' : 'transparent',
              color: activeTab === 'realms' ? '#ffffff' : 'var(--text-secondary)'
            }}
          >
            Locations ({realms.filter(r => r.unlocked).length}/{realms.length})
          </button>
        </div>
      </div>

      {/* 1. Equipment Grid */}
      {activeTab === 'armory' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '0.85rem' }}>
          {equipment.map(item => (
            <div
              key={item.id}
              className="clean-card"
              style={{
                padding: '1.1rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.75rem',
                opacity: item.unlocked ? 1 : 0.6,
                border: item.equipped ? '1px solid rgba(245, 158, 11, 0.4)' : undefined
              }}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '0.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                  <span style={{ fontSize: '1.4rem' }}>{item.icon}</span>
                  <div>
                    <h4 style={{ fontSize: '0.9rem', fontWeight: 600, color: '#ffffff' }}>
                      {item.name}
                    </h4>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'capitalize' }}>
                      {item.slot} • {item.rarity}
                    </span>
                  </div>
                </div>

                {!item.unlocked && <Lock size={14} color="var(--text-muted)" />}
                {item.equipped && (
                  <span style={{
                    fontSize: '0.68rem',
                    color: 'var(--accent-gold)',
                    background: 'var(--accent-gold-subtle)',
                    padding: '0.1rem 0.4rem',
                    borderRadius: '4px',
                    fontWeight: 600
                  }}>
                    Equipped
                  </span>
                )}
              </div>

              <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: 1.35 }}>
                {item.description}
              </p>

              {/* Stat boosts */}
              <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                {item.statBonus.discipline && (
                  <span style={{ fontSize: '0.7rem', color: 'var(--accent-gold)', background: 'var(--accent-gold-subtle)', padding: '0.15rem 0.4rem', borderRadius: '4px' }}>
                    +{item.statBonus.discipline} Might
                  </span>
                )}
                {item.statBonus.focus && (
                  <span style={{ fontSize: '0.7rem', color: '#c084fc', background: 'var(--accent-purple-subtle)', padding: '0.15rem 0.4rem', borderRadius: '4px' }}>
                    +{item.statBonus.focus} Focus
                  </span>
                )}
                {item.statBonus.willpower && (
                  <span style={{ fontSize: '0.7rem', color: '#34d399', background: 'var(--accent-green-subtle)', padding: '0.15rem 0.4rem', borderRadius: '4px' }}>
                    +{item.statBonus.willpower} Resolve
                  </span>
                )}
              </div>

              <div style={{ marginTop: 'auto', paddingTop: '0.5rem' }}>
                {item.unlocked ? (
                  <button
                    onClick={() => equipItem(item.id)}
                    className={item.equipped ? 'btn btn-secondary' : 'btn btn-primary'}
                    style={{ width: '100%', fontSize: '0.75rem', padding: '0.4rem' }}
                  >
                    {item.equipped ? 'Unequip' : 'Equip Item'}
                  </button>
                ) : (
                  <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                    Goal: {item.unlockRequirement}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 2. Titles Grid */}
      {activeTab === 'titles' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '0.85rem' }}>
          {titles.map(title => {
            const isActive = character.title === title.name;
            return (
              <div
                key={title.id}
                className="clean-card"
                style={{
                  padding: '1.1rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.65rem',
                  opacity: title.unlocked ? 1 : 0.6,
                  border: isActive ? '1px solid rgba(245, 158, 11, 0.4)' : undefined
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <h4 style={{ fontSize: '0.92rem', fontWeight: 600, color: '#ffffff' }}>
                    &ldquo;{title.name}&rdquo;
                  </h4>
                  {isActive ? (
                    <span style={{ fontSize: '0.68rem', color: 'var(--accent-gold)', fontWeight: 600 }}>Active</span>
                  ) : !title.unlocked ? (
                    <Lock size={14} color="var(--text-muted)" />
                  ) : null}
                </div>

                <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                  {title.description}
                </p>

                <div style={{ marginTop: 'auto', paddingTop: '0.5rem' }}>
                  {title.unlocked ? (
                    <button
                      onClick={() => setActiveTitle(title.id)}
                      disabled={isActive}
                      className={isActive ? 'btn btn-secondary' : 'btn btn-primary'}
                      style={{ width: '100%', fontSize: '0.75rem', padding: '0.4rem' }}
                    >
                      {isActive ? 'Current Title' : 'Select Title'}
                    </button>
                  ) : (
                    <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                      Goal: {title.requirement}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 3. Realms / Locations Grid */}
      {activeTab === 'realms' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '0.85rem' }}>
          {realms.map(realm => {
            const isActive = character.currentRealmId === realm.id;
            return (
              <div
                key={realm.id}
                className="clean-card"
                style={{
                  padding: '1.1rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.65rem',
                  opacity: realm.unlocked ? 1 : 0.6,
                  border: isActive ? `1px solid ${realm.themeColor}` : undefined
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div>
                    <h4 style={{ fontSize: '0.92rem', fontWeight: 600, color: '#ffffff' }}>
                      {realm.name}
                    </h4>
                    <span style={{ fontSize: '0.7rem', color: realm.themeColor }}>
                      {realm.subtitle}
                    </span>
                  </div>
                  {isActive ? (
                    <span style={{ fontSize: '0.68rem', color: realm.themeColor, fontWeight: 600 }}>Current</span>
                  ) : !realm.unlocked ? (
                    <Lock size={14} color="var(--text-muted)" />
                  ) : null}
                </div>

                <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: 1.35 }}>
                  {realm.description}
                </p>

                <div style={{
                  background: 'var(--bg-subtle)',
                  padding: '0.45rem 0.65rem',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '0.72rem',
                  color: 'var(--text-main)'
                }}>
                  Perk: <span style={{ color: realm.themeColor }}>{realm.ambientPerk}</span>
                </div>

                <div style={{ marginTop: 'auto', paddingTop: '0.5rem' }}>
                  {realm.unlocked ? (
                    <button
                      onClick={() => setActiveRealm(realm.id)}
                      disabled={isActive}
                      className={isActive ? 'btn btn-secondary' : 'btn btn-primary'}
                      style={{ width: '100%', fontSize: '0.75rem', padding: '0.4rem' }}
                    >
                      {isActive ? 'Current Location' : 'Set as Location'}
                    </button>
                  ) : (
                    <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                      Goal: {realm.requirement}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
