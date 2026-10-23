'use client';

import React, { useState } from 'react';
import { useGame } from '@/context/GameContext';
import { X, Plus, Trash2 } from 'lucide-react';

interface CreateQuestModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CreateQuestModal({ isOpen, onClose }: CreateQuestModalProps) {
  const { addQuest } = useGame();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [color, setColor] = useState('#8b5cf6');
  const [icon, setIcon] = useState('📁');
  const [deadline, setDeadline] = useState('');
  const [milestones, setMilestones] = useState<string[]>([
    'Phase 1: Planning & Setup',
    'Phase 2: Implementation',
    'Phase 3: Review & Launch'
  ]);

  if (!isOpen) return null;

  const colorPresets = ['#f59e0b', '#8b5cf6', '#10b981', '#3b82f6', '#ec4899', '#ef4444'];
  const iconPresets = ['📁', '🚀', '🎯', '📊', '⚡', '💡', '📝', '💼'];

  const handleAddMilestone = () => {
    setMilestones([...milestones, `Phase ${milestones.length + 1}: Final Review`]);
  };

  const handleUpdateMilestone = (index: number, val: string) => {
    const updated = [...milestones];
    updated[index] = val;
    setMilestones(updated);
  };

  const handleRemoveMilestone = (index: number) => {
    if (milestones.length <= 1) return;
    setMilestones(milestones.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    addQuest({
      title: title.trim(),
      description: description.trim(),
      color,
      icon,
      milestoneTitles: milestones,
      deadline: deadline || undefined
    });

    setTitle('');
    setDescription('');
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="clean-card"
        onClick={e => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: '500px',
          maxHeight: '90vh',
          overflowY: 'auto',
          padding: '1.5rem',
          background: 'var(--bg-card)',
          border: '1px solid var(--border-card)',
          borderRadius: 'var(--radius-lg)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
          <h3 style={{ fontSize: '1.05rem', fontWeight: 600, color: 'var(--text-main)', letterSpacing: '-0.01em' }}>
            New project
          </h3>
          <button
            onClick={onClose}
            className="btn btn-ghost"
            style={{ padding: '0.35rem' }}
          >
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {/* Title */}
          <div>
            <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 500, color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>
              Project Title
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Website Redesign or Q4 Product Launch"
              value={title}
              onChange={e => setTitle(e.target.value)}
              style={{
                width: '100%',
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid var(--border-subtle)',
                color: '#ffffff',
                padding: '0.55rem 0.75rem',
                borderRadius: 'var(--radius-md)',
                fontSize: '0.85rem',
                outline: 'none'
              }}
            />
          </div>

          {/* Description */}
          <div>
            <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 500, color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>
              Description
            </label>
            <textarea
              rows={2}
              placeholder="What is the objective or scope of this project?"
              value={description}
              onChange={e => setDescription(e.target.value)}
              style={{
                width: '100%',
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid var(--border-subtle)',
                color: '#ffffff',
                padding: '0.55rem 0.75rem',
                borderRadius: 'var(--radius-md)',
                fontSize: '0.82rem',
                outline: 'none',
                resize: 'vertical'
              }}
            />
          </div>

          {/* Color & Icon */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 500, color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>
                Icon
              </label>
              <div style={{ display: 'flex', gap: '0.3rem', flexWrap: 'wrap' }}>
                {iconPresets.map(ic => (
                  <button
                    key={ic}
                    type="button"
                    onClick={() => setIcon(ic)}
                    style={{
                      width: '28px',
                      height: '28px',
                      borderRadius: '6px',
                      background: icon === ic ? 'rgba(255, 255, 255, 0.15)' : 'rgba(255, 255, 255, 0.03)',
                      border: icon === ic ? `1px solid ${color}` : '1px solid var(--border-subtle)',
                      cursor: 'pointer',
                      fontSize: '0.95rem'
                    }}
                  >
                    {ic}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 500, color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>
                Color
              </label>
              <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap', alignItems: 'center', height: '28px' }}>
                {colorPresets.map(c => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setColor(c)}
                    style={{
                      width: '20px',
                      height: '20px',
                      borderRadius: '50%',
                      background: c,
                      border: color === c ? '2px solid #ffffff' : 'none',
                      cursor: 'pointer'
                    }}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Milestones */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
              <label style={{ fontSize: '0.78rem', fontWeight: 500, color: 'var(--text-secondary)' }}>
                Milestones
              </label>
              <button
                type="button"
                onClick={handleAddMilestone}
                className="btn btn-ghost"
                style={{ fontSize: '0.7rem', padding: '0.15rem 0.4rem' }}
              >
                <Plus size={12} />
                <span>Add</span>
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
              {milestones.map((m, idx) => (
                <div key={idx} style={{ display: 'flex', gap: '0.35rem', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', width: '16px' }}>{idx + 1}</span>
                  <input
                    type="text"
                    value={m}
                    onChange={e => handleUpdateMilestone(idx, e.target.value)}
                    style={{
                      flex: 1,
                      background: 'rgba(255, 255, 255, 0.05)',
                      border: '1px solid var(--border-subtle)',
                      color: '#ffffff',
                      padding: '0.45rem 0.65rem',
                      borderRadius: 'var(--radius-sm)',
                      fontSize: '0.8rem',
                      outline: 'none'
                    }}
                  />
                  {milestones.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveMilestone(idx)}
                      className="btn btn-ghost"
                      style={{ padding: '0.35rem', color: 'var(--text-muted)' }}
                    >
                      <Trash2 size={13} />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '0.5rem' }}>
            <button
              type="button"
              onClick={onClose}
              className="btn btn-ghost"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
            >
              Create project
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
