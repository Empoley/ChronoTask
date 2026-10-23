'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useGame } from '@/context/GameContext';
import { useAuth } from '@/context/AuthContext';
import { Mail, Check, X, Shield, FolderGit2, Loader2, AlertCircle, CheckCircle2, Inbox } from 'lucide-react';

interface CollaborationInvitesPopoverProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CollaborationInvitesPopover({ isOpen, onClose }: CollaborationInvitesPopoverProps) {
  const { user } = useAuth();
  const { pendingInvites, acceptInvite, declineInvite } = useGame();
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [actionError, setActionError] = useState<{ id: string; message: string } | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  const popoverRef = useRef<HTMLDivElement>(null);

  // Close when clicking outside
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleAccept = async (inviteId: string, projectTitle: string) => {
    setActionError(null);
    setActionSuccess(null);
    setProcessingId(inviteId);

    const res = await acceptInvite(inviteId);
    setProcessingId(null);

    if (res.success) {
      setActionSuccess(`Joined "${projectTitle}"! Projects and tasks are now synced.`);
      setTimeout(() => {
        setActionSuccess(null);
      }, 4000);
    } else {
      setActionError({
        id: inviteId,
        message: res.message || 'Failed to accept invitation. Please try again.'
      });
    }
  };

  const handleDecline = async (inviteId: string, projectTitle: string) => {
    if (!window.confirm(`Decline invitation to join "${projectTitle}"?`)) return;

    setActionError(null);
    setActionSuccess(null);
    setProcessingId(inviteId);

    const res = await declineInvite(inviteId);
    setProcessingId(null);

    if (res.success) {
      setActionSuccess(`Declined invitation to "${projectTitle}".`);
      setTimeout(() => {
        setActionSuccess(null);
      }, 4000);
    } else {
      setActionError({
        id: inviteId,
        message: res.message || 'Failed to decline invitation. Please try again.'
      });
    }
  };

  return (
    <div
      ref={popoverRef}
      style={{
        position: 'absolute',
        top: 'calc(100% + 8px)',
        right: 0,
        width: '380px',
        maxWidth: '92vw',
        background: '#121520',
        border: '1px solid var(--border-card)',
        borderRadius: 'var(--radius-lg)',
        boxShadow: '0 16px 36px -4px rgba(0, 0, 0, 0.7), 0 0 0 1px rgba(255, 255, 255, 0.08)',
        zIndex: 1000,
        overflow: 'hidden',
        animation: 'fadeInDown 0.18s ease-out'
      }}
    >
      {/* Header */}
      <div style={{
        padding: '0.85rem 1rem',
        borderBottom: '1px solid var(--border-subtle)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        background: 'rgba(255, 255, 255, 0.02)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.55rem' }}>
          <div style={{
            width: '28px',
            height: '28px',
            borderRadius: '6px',
            background: 'var(--brand-subtle)',
            border: '1px solid var(--brand-border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--brand)'
          }}>
            <Mail size={15} />
          </div>
          <div>
            <h4 style={{ fontSize: '0.88rem', fontWeight: 600, color: '#ffffff', margin: 0 }}>
              Collaboration Invites
            </h4>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          {pendingInvites.length > 0 && (
            <span style={{
              fontSize: '0.7rem',
              fontWeight: 600,
              color: '#ffffff',
              background: 'var(--brand)',
              padding: '0.1rem 0.5rem',
              borderRadius: '9999px'
            }}>
              {pendingInvites.length} pending
            </span>
          )}

          <button
            onClick={onClose}
            className="btn btn-ghost"
            style={{ padding: '0.25rem', color: 'var(--text-muted)' }}
            title="Close"
          >
            <X size={15} />
          </button>
        </div>
      </div>

      {/* Success Notification */}
      {actionSuccess && (
        <div style={{
          background: 'var(--accent-green-subtle)',
          borderBottom: '1px solid rgba(16, 185, 129, 0.25)',
          padding: '0.55rem 0.85rem',
          fontSize: '0.75rem',
          color: '#34d399',
          display: 'flex',
          alignItems: 'center',
          gap: '0.45rem'
        }}>
          <CheckCircle2 size={14} />
          <span>{actionSuccess}</span>
        </div>
      )}

      {/* Body */}
      <div style={{
        padding: '0.85rem',
        maxHeight: '380px',
        overflowY: 'auto',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.65rem'
      }}>
        {pendingInvites.length === 0 ? (
          <div style={{
            padding: '2rem 1rem',
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '0.65rem'
          }}>
            <div style={{
              width: '44px',
              height: '44px',
              borderRadius: '50%',
              background: 'rgba(255, 255, 255, 0.04)',
              border: '1px solid var(--border-subtle)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--text-muted)'
            }}>
              <Inbox size={22} />
            </div>
            <div>
              <p style={{ fontSize: '0.84rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '0.25rem' }}>
                No pending invitations
              </p>
              <p style={{ fontSize: '0.74rem', color: 'var(--text-muted)', maxWidth: '280px', lineHeight: 1.45 }}>
                When someone invites <strong style={{ color: 'var(--text-secondary)' }}>{user?.email}</strong> to collaborate on a project, it will appear here.
              </p>
            </div>
          </div>
        ) : (
          pendingInvites.map(invite => {
            const projectTitle = invite.project?.title || 'Project Invitation';
            const projectColor = invite.project?.color || 'var(--brand)';
            const projectIcon = invite.project?.icon || '📁';
            const isProcessing = processingId === invite.id;

            return (
              <div
                key={invite.id}
                style={{
                  background: 'rgba(255, 255, 255, 0.03)',
                  border: '1px solid var(--border-card)',
                  borderRadius: 'var(--radius-md)',
                  padding: '0.85rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.6rem',
                  transition: 'border-color 0.15s ease'
                }}
              >
                {/* Project Header */}
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '0.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.55rem' }}>
                    <div style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '8px',
                      background: `${projectColor}20`,
                      border: `1px solid ${projectColor}45`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '1rem',
                      flexShrink: 0
                    }}>
                      {projectIcon}
                    </div>
                    <div>
                      <h5 style={{ fontSize: '0.85rem', fontWeight: 600, color: '#ffffff', margin: 0 }}>
                        {projectTitle}
                      </h5>
                      {invite.project?.description && (
                        <p style={{
                          fontSize: '0.72rem',
                          color: 'var(--text-secondary)',
                          marginTop: '0.15rem',
                          lineHeight: 1.3,
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden'
                        }}>
                          {invite.project.description}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Role Badge */}
                  <span style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.25rem',
                    fontSize: '0.68rem',
                    color: invite.role === 'editor' ? '#60a5fa' : '#34d399',
                    background: invite.role === 'editor' ? 'var(--accent-blue-subtle)' : 'var(--accent-green-subtle)',
                    border: `1px solid ${invite.role === 'editor' ? 'rgba(59, 130, 246, 0.25)' : 'rgba(16, 185, 129, 0.25)'}`,
                    padding: '0.15rem 0.45rem',
                    borderRadius: '4px',
                    textTransform: 'capitalize',
                    fontWeight: 600,
                    flexShrink: 0
                  }}>
                    <Shield size={10} />
                    {invite.role}
                  </span>
                </div>

                {/* Sub info */}
                <div style={{ fontSize: '0.71rem', color: 'var(--text-muted)' }}>
                  Invited as collaborator · <span style={{ color: 'var(--text-secondary)' }}>{invite.userEmail}</span>
                </div>

                {/* Inline Error Message */}
                {actionError && actionError.id === invite.id && (
                  <div style={{
                    background: 'var(--accent-red-subtle)',
                    border: '1px solid rgba(239, 68, 68, 0.25)',
                    color: '#f87171',
                    padding: '0.45rem 0.65rem',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: '0.72rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.35rem'
                  }}>
                    <AlertCircle size={13} />
                    <span>{actionError.message}</span>
                  </div>
                )}

                {/* Actions */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', marginTop: '0.2rem' }}>
                  <button
                    type="button"
                    disabled={isProcessing}
                    onClick={() => handleAccept(invite.id, projectTitle)}
                    className="btn"
                    style={{
                      flex: 1,
                      background: '#10b981',
                      color: '#ffffff',
                      fontSize: '0.76rem',
                      fontWeight: 600,
                      padding: '0.4rem 0.65rem',
                      borderRadius: 'var(--radius-sm)',
                      border: '1px solid rgba(255, 255, 255, 0.15)'
                    }}
                  >
                    {isProcessing ? (
                      <Loader2 size={13} className="spin" />
                    ) : (
                      <Check size={13} strokeWidth={2.5} />
                    )}
                    <span>{isProcessing ? 'Accepting...' : 'Accept'}</span>
                  </button>

                  <button
                    type="button"
                    disabled={isProcessing}
                    onClick={() => handleDecline(invite.id, projectTitle)}
                    className="btn btn-ghost"
                    style={{
                      fontSize: '0.76rem',
                      padding: '0.4rem 0.65rem',
                      color: 'var(--text-muted)',
                      borderRadius: 'var(--radius-sm)',
                      border: '1px solid var(--border-subtle)'
                    }}
                  >
                    <X size={13} />
                    <span>Decline</span>
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Footer Info */}
      <div style={{
        padding: '0.65rem 0.85rem',
        borderTop: '1px solid var(--border-subtle)',
        background: 'rgba(0, 0, 0, 0.2)',
        fontSize: '0.7rem',
        color: 'var(--text-dim)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <span>Visible only to your account</span>
        <span style={{ color: 'var(--text-secondary)' }}>{user?.email}</span>
      </div>
    </div>
  );
}
