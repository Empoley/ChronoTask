'use client';

import React from 'react';
import { useGame } from '@/context/GameContext';
import { analyzeAllWorkloads, HorizonAlert } from '@/utils/dateUtils';
import { sound } from '@/utils/audio';
import { AlertCircle, CheckCircle, ArrowRight } from 'lucide-react';

interface WorkloadRadarProps {
  onFocusHorizon: (horizon: 'today' | 'next_week' | 'next_month') => void;
}

export function WorkloadRadar({ onFocusHorizon }: WorkloadRadarProps) {
  const { state } = useGame();
  const analysis = analyzeAllWorkloads(state.tasks);

  const handleAlertAction = (horizon: 'today' | 'next_week' | 'next_month') => {
    sound.playAlertHorn();
    onFocusHorizon(horizon);
  };

  if (!analysis.hasAnyWarning) {
    return (
      <div className="clean-card" style={{
        padding: '0.85rem 1.15rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '0.75rem',
        borderLeft: '3px solid var(--accent-green)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
          <CheckCircle size={16} color="var(--accent-green)" />
          <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
            Workload balanced across horizons • Today ({analysis.today.taskCount}/5), Next Week ({analysis.nextWeek.taskCount}/5), Next Month ({analysis.nextMonth.taskCount}/10)
          </span>
        </div>
      </div>
    );
  }

  // Active Warnings State
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
      {analysis.activeWarnings.map((alert: HorizonAlert) => (
        <div
          key={alert.horizon}
          className="clean-card"
          style={{
            padding: '1rem 1.25rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '1rem',
            borderLeft: '3px solid #f97316',
            background: 'rgba(249, 115, 22, 0.05)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flex: 1, minWidth: '260px' }}>
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '8px',
              background: 'rgba(249, 115, 22, 0.12)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fb923c',
              flexShrink: 0
            }}>
              <AlertCircle size={20} />
            </div>

            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <h3 style={{ fontSize: '0.92rem', fontWeight: 600, color: '#ffffff' }}>
                  High workload: {alert.label}
                </h3>
                <span style={{
                  fontSize: '0.7rem',
                  color: '#fb923c',
                  background: 'rgba(249, 115, 22, 0.15)',
                  padding: '0.1rem 0.45rem',
                  borderRadius: '4px',
                  fontWeight: 600
                }}>
                  {alert.taskCount} tasks (threshold: {alert.threshold}+)
                </span>
              </div>

              <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '0.2rem', lineHeight: 1.3 }}>
                {alert.message}
              </p>
            </div>
          </div>

          <button
            onClick={() => handleAlertAction(alert.horizon)}
            className="btn btn-primary"
            style={{ fontSize: '0.78rem', padding: '0.45rem 0.95rem' }}
          >
            <span>Review {alert.label} Tasks ({alert.taskCount})</span>
            <ArrowRight size={14} />
          </button>
        </div>
      ))}
    </div>
  );
}
