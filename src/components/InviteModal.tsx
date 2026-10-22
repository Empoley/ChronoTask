'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/context/AuthContext';
import { Quest } from '@/types/game';
import { sendCollaborationInviteEmail } from '@/lib/emailService';
import { X, UserPlus, Users, Trash2, Mail, Shield, CheckCircle2, AlertCircle, Send, Loader2 } from 'lucide-react';

interface InviteModalProps {
  isOpen: boolean;
  onClose: () => void;
  quest: Quest | null;
}

interface Member {
  id: string;
  user_email: string;
  role: string;
  status: string;
}

export function InviteModal({ isOpen, onClose, quest }: InviteModalProps) {
  const { user } = useAuth();
  const [emailInput, setEmailInput] = useState('');
  const [role, setRole] = useState<'editor' | 'viewer'>('editor');
  const [members, setMembers] = useState<Member[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [resendingEmail, setResendingEmail] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    if (isOpen && quest && user) {
      loadMembers();
    }
  }, [isOpen, quest, user]);

  if (!isOpen || !quest) return null;

  const loadMembers = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('project_members')
        .select('*')
        .eq('project_id', quest.id);

      if (!error && data) {
        setMembers(data);
      }
    } catch {
      // ignore
    } finally {
      setIsLoading(false);
    }
  };

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailInput.trim()) return;

    setStatusMessage(null);
    setIsSubmitting(true);
    const targetEmail = emailInput.trim().toLowerCase();

    try {
      if (user) {
        const { error } = await supabase
          .from('project_members')
          .insert({
            project_id: quest.id,
            user_email: targetEmail,
            role,
            status: 'accepted'
          });

        if (error && error.code !== '23505') {
          setStatusMessage({ type: 'error', text: error.message });
          setIsSubmitting(false);
          return;
        }

        // Send email invitation via EmailJS
        const inviterName = user.user_metadata?.full_name || user.email?.split('@')[0] || 'A team member';
        const emailRes = await sendCollaborationInviteEmail({
          toEmail: targetEmail,
          projectName: quest.title,
          inviterName,
          role
        });

        if (emailRes.success) {
          setStatusMessage({ type: 'success', text: `Invited ${targetEmail} and sent invitation email!` });
        } else {
          setStatusMessage({ type: 'error', text: `Added ${targetEmail} to team, but email delivery reported: ${emailRes.message}` });
        }

        setEmailInput('');
        loadMembers();
      } else {
        // Local/guest preview simulation
        const fakeMember: Member = {
          id: `m-${Date.now()}`,
          user_email: targetEmail,
          role,
          status: 'accepted'
        };
        setMembers(prev => [...prev, fakeMember]);
        setStatusMessage({ type: 'success', text: `Invited ${targetEmail} (Local workspace). Sign in to sync with cloud.` });
        setEmailInput('');
      }
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: err.message || 'Failed to send invite.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResendEmail = async (targetEmail: string, memberRole: string) => {
    setStatusMessage(null);
    setResendingEmail(targetEmail);
    const inviterName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'A team member';
    const emailRes = await sendCollaborationInviteEmail({
      toEmail: targetEmail,
      projectName: quest.title,
      inviterName,
      role: memberRole as 'editor' | 'viewer'
    });
    setResendingEmail(null);
    if (emailRes.success) {
      setStatusMessage({ type: 'success', text: `Invitation email resent to ${targetEmail}!` });
    } else {
      setStatusMessage({ type: 'error', text: `Failed to send email: ${emailRes.message}` });
    }
  };

  const handleRemoveMember = async (memberId: string) => {
    try {
      if (user) {
        await supabase
          .from('project_members')
          .delete()
          .eq('id', memberId);
        loadMembers();
      } else {
        setMembers(prev => prev.filter(m => m.id !== memberId));
      }
    } catch {
      // ignore
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="clean-card"
        onClick={e => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: '480px',
          padding: '1.5rem',
          background: '#12151f',
          borderRadius: 'var(--radius-lg)'
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.15rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '8px',
              background: 'var(--brand-subtle)',
              border: '1px solid var(--brand-border)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--brand)'
            }}>
              <Users size={18} />
            </div>
            <div>
              <h3 style={{ fontSize: '1rem', fontWeight: 600, color: '#ffffff' }}>
                Project Collaborators
              </h3>
              <p style={{ fontSize: '0.76rem', color: 'var(--text-secondary)', marginTop: '0.15rem' }}>
                {quest.title}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="btn btn-ghost"
            style={{ padding: '0.35rem' }}
          >
            <X size={16} />
          </button>
        </div>

        {/* Invite Form */}
        <form onSubmit={handleInvite} style={{ marginBottom: '1.25rem' }}>
          <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 500, color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>
            Invite by email
          </label>
          <div style={{ display: 'flex', gap: '0.45rem' }}>
            <div style={{ position: 'relative', flex: 1, display: 'flex', alignItems: 'center' }}>
              <Mail size={14} color="var(--text-muted)" style={{ position: 'absolute', left: '0.75rem' }} />
              <input
                type="email"
                required
                placeholder="colleague@company.com"
                value={emailInput}
                onChange={e => setEmailInput(e.target.value)}
                style={{
                  width: '100%',
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid var(--border-subtle)',
                  color: '#ffffff',
                  padding: '0.48rem 0.65rem 0.48rem 2.25rem',
                  borderRadius: 'var(--radius-md)',
                  fontSize: '0.8rem',
                  outline: 'none'
                }}
              />
            </div>

            <select
              value={role}
              onChange={e => setRole(e.target.value as 'editor' | 'viewer')}
              style={{
                background: 'rgba(16, 19, 27, 0.9)',
                border: '1px solid var(--border-subtle)',
                color: 'var(--text-secondary)',
                padding: '0.48rem 0.65rem',
                borderRadius: 'var(--radius-md)',
                fontSize: '0.78rem',
                outline: 'none',
                cursor: 'pointer'
              }}
            >
              <option value="editor">Editor</option>
              <option value="viewer">Viewer</option>
            </select>

            <button
              type="submit"
              disabled={isSubmitting}
              className="btn btn-primary"
              style={{ fontSize: '0.78rem', padding: '0.48rem 0.85rem' }}
            >
              <UserPlus size={14} />
              <span>Invite</span>
            </button>
          </div>
        </form>

        {/* Status Message */}
        {statusMessage && (
          <div style={{
            background: statusMessage.type === 'success' ? 'var(--accent-green-subtle)' : 'var(--accent-red-subtle)',
            border: `1px solid ${statusMessage.type === 'success' ? 'rgba(16, 185, 129, 0.25)' : 'rgba(239, 68, 68, 0.25)'}`,
            color: statusMessage.type === 'success' ? '#34d399' : '#f87171',
            padding: '0.55rem 0.75rem',
            borderRadius: 'var(--radius-sm)',
            fontSize: '0.76rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.45rem',
            marginBottom: '1rem'
          }}>
            {statusMessage.type === 'success' ? <CheckCircle2 size={14} /> : <AlertCircle size={14} />}
            <span>{statusMessage.text}</span>
          </div>
        )}

        {/* Members List */}
        <div>
          <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', fontWeight: 600, marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Current Members
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', maxHeight: '180px', overflowY: 'auto' }}>
            {/* Owner row */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '0.5rem 0.75rem',
              background: 'rgba(255, 255, 255, 0.03)',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--border-subtle)',
              fontSize: '0.78rem'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ color: '#ffffff', fontWeight: 500 }}>
                  {user?.email || 'You (Project Owner)'}
                </span>
                <span style={{ fontSize: '0.68rem', color: 'var(--brand)', background: 'var(--brand-subtle)', padding: '0.1rem 0.4rem', borderRadius: '4px', fontWeight: 600 }}>
                  Owner
                </span>
              </div>
            </div>

            {/* Invited collaborators */}
            {members.map(member => (
              <div
                key={member.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '0.5rem 0.75rem',
                  background: 'rgba(255, 255, 255, 0.03)',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--border-subtle)',
                  fontSize: '0.78rem'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ color: 'var(--text-main)' }}>{member.user_email}</span>
                  <span style={{
                    fontSize: '0.68rem',
                    color: 'var(--text-secondary)',
                    background: 'var(--bg-subtle)',
                    border: '1px solid var(--border-subtle)',
                    padding: '0.1rem 0.4rem',
                    borderRadius: '4px',
                    textTransform: 'capitalize'
                  }}>
                    {member.role}
                  </span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <button
                    type="button"
                    disabled={resendingEmail === member.user_email}
                    onClick={() => handleResendEmail(member.user_email, member.role)}
                    title="Resend invitation email"
                    className="btn btn-ghost"
                    style={{ fontSize: '0.72rem', padding: '0.2rem 0.5rem', color: 'var(--brand)' }}
                  >
                    {resendingEmail === member.user_email ? (
                      <Loader2 size={12} className="spin" />
                    ) : (
                      <Send size={12} />
                    )}
                    <span>{resendingEmail === member.user_email ? 'Sending...' : 'Resend'}</span>
                  </button>

                  <button
                    onClick={() => handleRemoveMember(member.id)}
                    title="Remove collaborator"
                    className="btn btn-ghost"
                    style={{ padding: '0.2rem', color: 'var(--text-dim)' }}
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            ))}

            {members.length === 0 && (
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: '0.25rem 0' }}>
                No other collaborators added yet. Invite team members to collaborate in real-time.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
