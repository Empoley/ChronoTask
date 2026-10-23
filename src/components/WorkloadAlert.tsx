'use client';

import React, { useState } from 'react';
import { useGame } from '@/context/GameContext';
import { useAuth } from '@/context/AuthContext';
import { analyzeAllWorkloads } from '@/utils/dateUtils';
import { sendOverloadAlertEmail } from '@/lib/emailService';
import { sound } from '@/utils/audio';
import { AlertTriangle, ArrowRight, Mail, Loader2, CheckCircle2 } from 'lucide-react';

interface WorkloadAlertProps {
  onFocusHorizon: (horizon: 'today' | 'this_week' | 'next_week' | 'next_month') => void;
}

export function WorkloadAlert({ onFocusHorizon }: WorkloadAlertProps) {
  const { state } = useGame();
  const { user } = useAuth();
  const analysis = analyzeAllWorkloads(state.tasks);

  const [sendingEmail, setSendingEmail] = useState(false);
  const [emailFeedback, setEmailFeedback] = useState<{ msg: string; isError: boolean } | null>(null);

  // If no thresholds are met, make the workload alert invisible
  if (!analysis.hasAnyWarning || analysis.activeWarnings.length === 0) {
    return null;
  }

  const handleHorizonClick = (horizon: 'today' | 'this_week' | 'next_week' | 'next_month') => {
    sound.playAlertHorn();
    onFocusHorizon(horizon);
  };

  const handleTestEmail = async () => {
    let targetEmail = user?.email;
    let targetName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'ChronoTasks User';

    if (!targetEmail) {
      const prompted = window.prompt('Enter an email address to send a test Overload Alert to:');
      if (!prompted) return;
      targetEmail = prompted.trim();
      targetName = targetEmail.split('@')[0];
    }

    setSendingEmail(true);
    setEmailFeedback(null);

    const res = await sendOverloadAlertEmail({
      toEmail: targetEmail,
      toName: targetName,
      analysis,
      tasks: state.tasks,
      forceSend: true
    });

    setSendingEmail(false);
    setEmailFeedback({
      msg: res.success ? `Alert sent to ${targetEmail}!` : res.message,
      isError: !res.success
    });

    setTimeout(() => {
      setEmailFeedback(null);
    }, 5000);
  };

  return (
    <div
      className="clean-card"
      style={{
        padding: '1.15rem 1.25rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.85rem',
        borderLeft: '3px solid #f59e0b',
        background: 'rgba(245, 158, 11, 0.03)'
      }}
    >
      {/* Header Row */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
          <div style={{
            width: '28px',
            height: '28px',
            borderRadius: '6px',
            background: 'var(--accent-time-subtle)',
            border: '1px solid var(--accent-time-border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--accent-time)'
          }}>
            <AlertTriangle size={15} />
          </div>
          <div>
            <h3 style={{ fontSize: '0.92rem', fontWeight: 600, color: 'var(--heading-color)', margin: 0, letterSpacing: '-0.01em' }}>
              Workload alert
            </h3>
            <p style={{ fontSize: '0.74rem', color: 'var(--text-secondary)', marginTop: '0.1rem' }}>
              High task density detected in upcoming schedule
            </p>
          </div>
        </div>

        {/* Email test action */}
        <button
          onClick={handleTestEmail}
          disabled={sendingEmail}
          className="btn btn-ghost"
          title="Send overload alert summary email"
          style={{ fontSize: '0.72rem', padding: '0.2rem 0.5rem', color: 'var(--text-muted)' }}
        >
          {sendingEmail ? <Loader2 size={12} className="spin" /> : <Mail size={12} />}
          <span>{sendingEmail ? 'Sending...' : 'Test digest'}</span>
        </button>
      </div>

      {/* Email feedback notification if present */}
      {emailFeedback && (
        <div style={{
          fontSize: '0.74rem',
          padding: '0.4rem 0.75rem',
          borderRadius: 'var(--radius-sm)',
          background: emailFeedback.isError ? 'var(--accent-red-subtle)' : 'var(--accent-green-subtle)',
          border: `1px solid ${emailFeedback.isError ? 'var(--accent-red-border)' : 'var(--accent-green-border)'}`,
          color: emailFeedback.isError ? '#f87171' : '#34d399',
          display: 'flex',
          alignItems: 'center',
          gap: '0.4rem'
        }}>
          {emailFeedback.isError ? <AlertTriangle size={13} /> : <CheckCircle2 size={13} />}
          <span>{emailFeedback.msg}</span>
        </div>
      )}

      {/* Pop-up Alert Items: ONLY the horizons that met their thresholds */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        {analysis.activeWarnings.map(alert => (
          <div
            key={alert.horizon}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '0.65rem 0.85rem',
              background: 'var(--bg-subtle)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-md)',
              gap: '0.75rem',
              flexWrap: 'wrap'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <span
                style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  background: '#f59e0b',
                  boxShadow: '0 0 8px rgba(245, 158, 11, 0.6)'
                }}
              />
              <div>
                <span style={{ fontSize: '0.84rem', fontWeight: 600, color: 'var(--heading-color)' }}>
                  {alert.label}
                </span>
                <span style={{ fontSize: '0.76rem', color: 'var(--text-secondary)', marginLeft: '0.5rem' }}>
                  <strong style={{ color: '#fbbf24', fontVariantNumeric: 'tabular-nums' }}>
                    {alert.taskCount}
                  </strong>{' '}
                  {alert.taskCount === 1 ? 'task scheduled' : 'tasks scheduled'}
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => handleHorizonClick(alert.horizon)}
              className="btn btn-secondary"
              style={{
                fontSize: '0.74rem',
                padding: '0.3rem 0.7rem',
                borderColor: 'rgba(245, 158, 11, 0.35)',
                color: '#fbbf24',
                background: 'rgba(245, 158, 11, 0.1)',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem'
              }}
            >
              <span>View {alert.label.toLowerCase()} tasks</span>
              <ArrowRight size={13} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
