'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/context/AuthContext';
import { Quest } from '@/types/game';
import { X, UserPlus, Users, Trash2, Mail, Shield, CheckCircle2, AlertCircle, Clock } from 'lucide-react';

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

    // Check if user is trying to invite themselves
    if (user && targetEmail === (user.email || '').toLowerCase().trim()) {
      setStatusMessage({ type: 'error', text: 'You are already the owner of this project.' });
      setIsSubmitting(false);
      return;
    }

    try {
      if (user) {
        // Create invitation with status 'pending' (they must accept before joining)
        const { error } = await supabase
          .from('project_members')
          .insert({
            project_id: quest.id,
            user_email: targetEmail,
            role,
            status: 'pending'
          });

        if (error) {
          if (error.code === '23505') {
            setStatusMessage({ type: 'error', text: `${targetEmail} has already been invited or is already a member.` });
          } else {
            setStatusMessage({ type: 'error', text: error.message });
          }
          setIsSubmitting(false);
          return;
        }

        setStatusMessage({
          type: 'success',
          text: `Invitation sent to ${targetEmail}! They will see it in their top-right invites.`
        });
        setEmailInput('');
        loadMembers();
      } else {
        // Local/guest preview simulation
        const fakeMember: Member = {
          id: `m-${Date.now()}`,
          user_email: targetEmail,
          role,
          status: 'pending'
        };
        setMembers(prev => [...prev, fakeMember]);
        setStatusMessage({
          type: 'success',
          text: `Invitation sent to ${targetEmail}! (Pending acceptance)`
        });
        setEmailInput('');
      }
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: err.message || 'Failed to send invite.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRemoveMember = async (memberId: string, memberEmail: string, isPending: boolean) => {
    const actionText = isPending 
      ? `Cancel invitation for "${memberEmail}"?` 
      : `Remove collaborator "${memberEmail}" from this project?`;

    if (!window.confirm(actionText)) return;

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
          maxWidth: '500px',
          padding: '1.5rem',
          background: 'var(--bg-card)',
          border: '1px solid var(--border-card)',
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
              <h3 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-main)', letterSpacing: '-0.01em' }}>
                Project collaborators
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
            Invite collaborator by email
          </label>
          <div style={{ display: 'flex', gap: '0.45rem' }}>
            <div style={{ position: 'relative', flex: 1, display: 'flex', alignItems: 'center' }}>
              <Mail size={14} color="var(--text-muted)" style={{ position: 'absolute', left: '0.75rem' }} />
              <input
                type="email"
                required
                placeholder="colleague@example.com"
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
          <p style={{ fontSize: '0.71rem', color: 'var(--text-muted)', marginTop: '0.35rem' }}>
            The invited collaborator will see an invitation badge in their top-right navigation to review and accept.
          </p>
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
          <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', fontWeight: 600, marginBottom: '0.5rem' }}>
            Team and collaborators
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', maxHeight: '200px', overflowY: 'auto' }}>
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
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', flexWrap: 'wrap' }}>
                  <span style={{ color: 'var(--text-main)', fontWeight: 500 }}>{member.user_email}</span>
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

                  {member.status === 'pending' ? (
                    <span style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.2rem',
                      fontSize: '0.68rem',
                      color: '#fbbf24',
                      background: 'var(--accent-gold-subtle)',
                      border: '1px solid rgba(245, 158, 11, 0.25)',
                      padding: '0.1rem 0.45rem',
                      borderRadius: '4px',
                      fontWeight: 600
                    }}>
                      <Clock size={10} />
                      Pending invite
                    </span>
                  ) : (
                    <span style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.2rem',
                      fontSize: '0.68rem',
                      color: '#34d399',
                      background: 'var(--accent-green-subtle)',
                      border: '1px solid rgba(16, 185, 129, 0.25)',
                      padding: '0.1rem 0.45rem',
                      borderRadius: '4px',
                      fontWeight: 600
                    }}>
                      <CheckCircle2 size={10} />
                      Member
                    </span>
                  )}
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <button
                    onClick={() => handleRemoveMember(member.id, member.user_email, member.status === 'pending')}
                    title={member.status === 'pending' ? 'Cancel invitation' : 'Remove collaborator'}
                    className="btn btn-ghost"
                    style={{ padding: '0.2rem 0.45rem', color: 'var(--text-dim)', fontSize: '0.72rem' }}
                  >
                    <Trash2 size={13} style={{ marginRight: '0.2rem' }} />
                    <span>{member.status === 'pending' ? 'Cancel' : 'Remove'}</span>
                  </button>
                </div>
              </div>
            ))}

            {members.length === 0 && (
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: '0.25rem 0' }}>
                No collaborators invited yet. Enter an email above to send an invitation.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
