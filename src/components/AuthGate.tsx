'use client';

import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Lock, Mail, User as UserIcon, Eye, EyeOff, AlertCircle, CheckCircle2, ShieldCheck, Users, BellRing, ArrowRight, CheckSquare } from 'lucide-react';

export function AuthGate() {
  const { signIn, signUp, isSupabaseReady } = useAuth();
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [displayName, setDisplayName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);
    setIsSubmitting(true);

    try {
      if (mode === 'signin') {
        const { error } = await signIn(email, password);
        if (error) {
          setErrorMessage(error.message);
        }
      } else {
        const { error } = await signUp(email, password, displayName);
        if (error) {
          setErrorMessage(error.message);
        } else {
          setSuccessMessage('Account created! Please check your email inbox if confirmation is required, or sign in now.');
          setMode('signin');
        }
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'An unexpected error occurred.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '1.5rem',
      background: 'radial-gradient(ellipse at 50% 15%, rgba(99, 102, 241, 0.08) 0%, rgba(8, 10, 15, 1) 75%)'
    }}>
      <div style={{
        maxWidth: '440px',
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        gap: '1.25rem'
      }}>
        {/* Brand Header */}
        <div style={{ textAlign: 'center' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '42px',
            height: '42px',
            borderRadius: '10px',
            background: 'var(--brand-subtle)',
            border: '1px solid var(--brand-border)',
            color: 'var(--brand)',
            marginBottom: '0.85rem'
          }}>
            <CheckSquare size={22} />
          </div>

          <h1 style={{ fontSize: '1.75rem', fontWeight: 700, color: '#ffffff', letterSpacing: '-0.025em' }}>
            ChronoTasks
          </h1>
          <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', marginTop: '0.35rem', lineHeight: 1.5 }}>
            Sign in to access your unique workspace, time horizon radar, and collaborative delivery.
          </p>
        </div>

        {/* Auth Card */}
        <div className="clean-card" style={{
          padding: '1.75rem',
          background: '#0f131c',
          borderRadius: 'var(--radius-lg)',
          boxShadow: 'var(--shadow-lg)'
        }}>
          {!isSupabaseReady && (
            <div style={{
              background: 'var(--accent-time-subtle)',
              border: '1px solid var(--accent-time-border)',
              borderRadius: 'var(--radius-sm)',
              padding: '0.75rem 0.95rem',
              marginBottom: '1.25rem',
              fontSize: '0.76rem',
              color: '#fed7aa',
              lineHeight: 1.5
            }}>
              <div style={{ fontWeight: 600, color: '#fbbf24', marginBottom: '0.2rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <AlertCircle size={14} /> Missing .env.local Configuration
              </div>
              Create a <code style={{ background: 'rgba(0,0,0,0.3)', padding: '0.1rem 0.3rem', borderRadius: '3px' }}>.env.local</code> file in this project with your Supabase credentials to activate authentication.
            </div>
          )}

          {/* Mode Switcher */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '0.35rem',
            background: 'rgba(255, 255, 255, 0.04)',
            padding: '0.25rem',
            borderRadius: 'var(--radius-md)',
            marginBottom: '1.25rem'
          }}>
            <button
              type="button"
              onClick={() => { setMode('signin'); setErrorMessage(null); setSuccessMessage(null); }}
              style={{
                padding: '0.5rem',
                borderRadius: 'var(--radius-sm)',
                border: 'none',
                background: mode === 'signin' ? 'var(--brand)' : 'transparent',
                color: mode === 'signin' ? '#ffffff' : 'var(--text-secondary)',
                fontWeight: 600,
                fontSize: '0.8rem',
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              Sign in
            </button>
            <button
              type="button"
              onClick={() => { setMode('signup'); setErrorMessage(null); setSuccessMessage(null); }}
              style={{
                padding: '0.5rem',
                borderRadius: 'var(--radius-sm)',
                border: 'none',
                background: mode === 'signup' ? 'var(--brand)' : 'transparent',
                color: mode === 'signup' ? '#ffffff' : 'var(--text-secondary)',
                fontWeight: 600,
                fontSize: '0.8rem',
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              Create account
            </button>
          </div>

          {/* Feedback Messages */}
          {errorMessage && (
            <div style={{
              background: 'var(--accent-red-subtle)',
              border: '1px solid var(--accent-red-border)',
              borderRadius: 'var(--radius-sm)',
              padding: '0.65rem 0.85rem',
              marginBottom: '1rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.45rem',
              color: '#f87171',
              fontSize: '0.78rem'
            }}>
              <AlertCircle size={15} style={{ flexShrink: 0 }} />
              <span>{errorMessage}</span>
            </div>
          )}

          {successMessage && (
            <div style={{
              background: 'var(--accent-green-subtle)',
              border: '1px solid var(--accent-green-border)',
              borderRadius: 'var(--radius-sm)',
              padding: '0.65rem 0.85rem',
              marginBottom: '1rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.45rem',
              color: '#34d399',
              fontSize: '0.78rem'
            }}>
              <CheckCircle2 size={15} style={{ flexShrink: 0 }} />
              <span>{successMessage}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
            {mode === 'signup' && (
              <div>
                <label style={{ display: 'block', fontSize: '0.74rem', fontWeight: 500, color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>
                  Full name
                </label>
                <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                  <UserIcon size={14} color="var(--text-muted)" style={{ position: 'absolute', left: '0.75rem' }} />
                  <input
                    type="text"
                    required
                    placeholder="Alex Morgan"
                    value={displayName}
                    onChange={e => setDisplayName(e.target.value)}
                    style={{
                      width: '100%',
                      background: 'rgba(255, 255, 255, 0.04)',
                      border: '1px solid var(--border-subtle)',
                      color: '#ffffff',
                      padding: '0.55rem 0.75rem 0.55rem 2.25rem',
                      borderRadius: 'var(--radius-md)',
                      fontSize: '0.82rem',
                      outline: 'none'
                    }}
                  />
                </div>
              </div>
            )}

            <div>
              <label style={{ display: 'block', fontSize: '0.74rem', fontWeight: 500, color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>
                Email address
              </label>
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <Mail size={14} color="var(--text-muted)" style={{ position: 'absolute', left: '0.75rem' }} />
                <input
                  type="email"
                  required
                  placeholder="alex@example.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  style={{
                    width: '100%',
                    background: 'rgba(255, 255, 255, 0.04)',
                    border: '1px solid var(--border-subtle)',
                    color: '#ffffff',
                    padding: '0.55rem 0.75rem 0.55rem 2.25rem',
                    borderRadius: 'var(--radius-md)',
                    fontSize: '0.82rem',
                    outline: 'none'
                  }}
                />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.74rem', fontWeight: 500, color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>
                Password
              </label>
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <Lock size={14} color="var(--text-muted)" style={{ position: 'absolute', left: '0.75rem' }} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  minLength={6}
                  placeholder="••••••••"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  style={{
                    width: '100%',
                    background: 'rgba(255, 255, 255, 0.04)',
                    border: '1px solid var(--border-subtle)',
                    color: '#ffffff',
                    padding: '0.55rem 2.4rem 0.55rem 2.25rem',
                    borderRadius: 'var(--radius-md)',
                    fontSize: '0.82rem',
                    outline: 'none'
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute',
                    right: '0.65rem',
                    background: 'none',
                    border: 'none',
                    color: showPassword ? '#ffffff' : 'var(--text-muted)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    padding: '0.2rem'
                  }}
                  title={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="btn btn-primary"
              style={{
                width: '100%',
                marginTop: '0.4rem',
                padding: '0.6rem',
                fontSize: '0.84rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.45rem'
              }}
            >
              <span>{isSubmitting ? 'Authenticating...' : mode === 'signin' ? 'Sign in to workspace' : 'Create free account'}</span>
              {!isSubmitting && <ArrowRight size={14} />}
            </button>
          </form>
        </div>

        {/* Feature Highlights */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '0.65rem',
          textAlign: 'center'
        }}>
          <div style={{
            background: 'var(--bg-subtle)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-md)',
            padding: '0.65rem 0.45rem'
          }}>
            <ShieldCheck size={15} color="var(--accent-green)" style={{ margin: '0 auto 0.25rem' }} />
            <div style={{ fontSize: '0.72rem', fontWeight: 600, color: '#ffffff' }}>Encrypted</div>
            <div style={{ fontSize: '0.66rem', color: 'var(--text-muted)', marginTop: '0.1rem' }}>Unique per user</div>
          </div>

          <div style={{
            background: 'var(--bg-subtle)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-md)',
            padding: '0.65rem 0.45rem'
          }}>
            <Users size={15} color="var(--brand)" style={{ margin: '0 auto 0.25rem' }} />
            <div style={{ fontSize: '0.72rem', fontWeight: 600, color: '#ffffff' }}>Invites</div>
            <div style={{ fontSize: '0.66rem', color: 'var(--text-muted)', marginTop: '0.1rem' }}>Accept to join</div>
          </div>

          <div style={{
            background: 'var(--bg-subtle)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-md)',
            padding: '0.65rem 0.45rem'
          }}>
            <BellRing size={15} color="var(--accent-time)" style={{ margin: '0 auto 0.25rem' }} />
            <div style={{ fontSize: '0.72rem', fontWeight: 600, color: '#ffffff' }}>Horizons</div>
            <div style={{ fontSize: '0.66rem', color: 'var(--text-muted)', marginTop: '0.1rem' }}>Radar alerts</div>
          </div>
        </div>
      </div>
    </div>
  );
}
