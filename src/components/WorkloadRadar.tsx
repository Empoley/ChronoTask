'use client';

import React, { useState } from 'react';
import { useGame } from '@/context/GameContext';
import { useAuth } from '@/context/AuthContext';
import { analyzeAllWorkloads, HorizonAlert } from '@/utils/dateUtils';
import { sendOverloadAlertEmail } from '@/lib/emailService';
import { sound } from '@/utils/audio';
import { AlertCircle, CheckCircle, Mail, Loader2 } from 'lucide-react';

interface WorkloadRadarProps {
  onFocusHorizon: (horizon: 'today' | 'this_week' | 'next_week' | 'next_month') => void;
}

export function WorkloadRadar({ onFocusHorizon }: WorkloadRadarProps) {
  const { state } = useGame();
  const { user } = useAuth();
  const analysis = analyzeAllWorkloads(state.tasks);

  const [sendingEmail, setSendingEmail] = useState(false);
  const [emailFeedback, setEmailFeedback] = useState<{ msg: string; isError: boolean } | null>(null);

  const handleAlertAction = (horizon: 'today' | 'this_week' | 'next_week' | 'next_month') => {
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
    }, 7000);
  };

  const emailButton = (
    <button
      onClick={handleTestEmail}
      disabled={sendingEmail}
      className="btn btn-ghost"
      title="Test your EmailJS overload alert integration"
      style={{
        fontSize: '0.72rem',
        padding: '0.25rem 0.6rem',
        color: 'var(--text-secondary)',
        border: '1px solid var(--border-subtle)'
      }}
    >
      {sendingEmail ? <Loader2 size={12} className="spin" /> : <Mail size={12} />}
      <span>{sendingEmail ? 'Sending...' : 'Test email alert'}</span>
    </button>
  );

  const feedbackBanner = emailFeedback && (
    <div style={{
      fontSize: '0.75rem',
      padding: '0.4rem 0.8rem',
      borderRadius: 'var(--radius-sm)',
      background: emailFeedback.isError ? 'rgba(239, 68, 68, 0.12)' : 'rgba(34, 197, 94, 0.12)',
      border: `1px solid ${emailFeedback.isError ? 'rgba(239, 68, 68, 0.3)' : 'rgba(34, 197, 94, 0.3)'}`,
      color: emailFeedback.isError ? '#fca5a5' : '#86efac',
      display: 'flex',
      alignItems: 'center',
      gap: '0.4rem'
    }}>
      {emailFeedback.isError ? <AlertCircle size={13} /> : <CheckCircle size={13} />}
      <span>{emailFeedback.msg}</span>
    </div>
  );

  if (!analysis.hasAnyWarning) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
        <div className="clean-card" style={{
          padding: '0.9rem 1.25rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '0.75rem',
          borderLeft: '3px solid var(--accent-green)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <CheckCircle size={16} color="var(--accent-green)" />
            <span style={{ fontSize: '0.82rem', fontWeight: 500, color: 'var(--text-main)' }}>
              Workload balanced across all horizons
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
            <span style={{
              fontSize: '0.72rem',
              color: 'var(--text-secondary)',
              background: 'var(--bg-subtle)',
              border: '1px solid var(--border-subtle)',
              padding: '0.2rem 0.5rem',
              borderRadius: 'var(--radius-sm)'
            }}>
              Today: {analysis.today.taskCount}
            </span>
            <span style={{
              fontSize: '0.72rem',
              color: 'var(--text-secondary)',
              background: 'var(--bg-subtle)',
              border: '1px solid var(--border-subtle)',
              padding: '0.2rem 0.5rem',
              borderRadius: 'var(--radius-sm)'
            }}>
              This week: {analysis.thisWeek.taskCount}
            </span>
            <span style={{
              fontSize: '0.72rem',
              color: 'var(--text-secondary)',
              background: 'var(--bg-subtle)',
              border: '1px solid var(--border-subtle)',
              padding: '0.2rem 0.5rem',
              borderRadius: 'var(--radius-sm)'
            }}>
              Next week: {analysis.nextWeek.taskCount}
            </span>
            <span style={{
              fontSize: '0.72rem',
              color: 'var(--text-secondary)',
              background: 'var(--bg-subtle)',
              border: '1px solid var(--border-subtle)',
              padding: '0.2rem 0.5rem',
              borderRadius: 'var(--radius-sm)'
            }}>
              Next month: {analysis.nextMonth.taskCount}
            </span>

            {emailButton}
          </div>
        </div>
        {feedbackBanner}
      </div>
    );
  }

  // Active Warnings State - The bold visual moment on the page
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
            borderLeft: '4px solid #f97316',
            background: 'rgba(249, 115, 22, 0.06)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', flex: 1, minWidth: '260px' }}>
            <div style={{
              width: '38px',
              height: '38px',
              borderRadius: '8px',
              background: 'rgba(249, 115, 22, 0.14)',
              border: '1px solid rgba(249, 115, 22, 0.3)',
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
                  border: '1px solid rgba(249, 115, 22, 0.25)',
                  padding: '0.12rem 0.5rem',
                  borderRadius: '4px',
                  fontWeight: 600
                }}>
                  {alert.taskCount} {alert.taskCount === 1 ? 'task' : 'tasks'}
                </span>
              </div>

              <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '0.2rem', lineHeight: 1.35 }}>
                {alert.message}
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            {emailButton}
            <button
              onClick={() => handleAlertAction(alert.horizon)}
              className="btn btn-primary"
              style={{ fontSize: '0.78rem', padding: '0.45rem 0.95rem' }}
            >
              Review {alert.label} tasks ({alert.taskCount})
            </button>
          </div>
        </div>
      ))}
      {feedbackBanner}
    </div>
  );
}
