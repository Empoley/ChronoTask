'use client';

import React, { useState, useEffect } from 'react';
import { useGame } from '@/context/GameContext';
import { TaskDifficulty } from '@/types/game';
import { X } from 'lucide-react';

interface CreateTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultQuestId?: string;
}

export function CreateTaskModal({ isOpen, onClose, defaultQuestId }: CreateTaskModalProps) {
  const { state, addTask } = useGame();

  const getDefaultDateTime = (daysAhead: number = 7) => {
    const d = new Date();
    d.setDate(d.getDate() + daysAhead);
    d.setHours(18, 0, 0, 0);
    const pad = (n: number) => n.toString().padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  };

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [deadline, setDeadline] = useState('2026-10-16T18:00');
  const [difficulty, setDifficulty] = useState<TaskDifficulty>('medium');
  const [questId, setQuestId] = useState(defaultQuestId || '');
  const [tagInput, setTagInput] = useState('');

  useEffect(() => {
    if (isOpen) {
      setDeadline(getDefaultDateTime(7));
      if (defaultQuestId) setQuestId(defaultQuestId);
    }
  }, [isOpen, defaultQuestId]);

  if (!isOpen) return null;

  const difficultyLevels: { key: TaskDifficulty; label: string; desc: string }[] = [
    { key: 'easy', label: 'Easy', desc: 'Low effort' },
    { key: 'medium', label: 'Medium', desc: 'Standard' },
    { key: 'hard', label: 'Hard', desc: 'High effort' },
    { key: 'epic', label: 'Epic', desc: 'Major' }
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !deadline) return;

    const tags = tagInput
      .split(',')
      .map(t => t.trim())
      .filter(t => t.length > 0);

    addTask({
      title: title.trim(),
      description: description.trim(),
      deadline,
      difficulty,
      questId: questId || undefined,
      tags: tags.length > 0 ? tags : ['General']
    });

    setTitle('');
    setDescription('');
    setTagInput('');
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
          background: '#12151f'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: '#ffffff' }}>
            New Task
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
              Title
            </label>
            <input
              type="text"
              required
              placeholder="What needs to be done?"
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
              Description (optional)
            </label>
            <textarea
              rows={2}
              placeholder="Add details, criteria, or context..."
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

          {/* Deadline */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
              <label style={{ fontSize: '0.78rem', fontWeight: 500, color: 'var(--text-secondary)' }}>
                Deadline
              </label>
              <div style={{ display: 'flex', gap: '0.25rem' }}>
                <button
                  type="button"
                  onClick={() => setDeadline(getDefaultDateTime(0))}
                  style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', fontSize: '0.7rem', padding: '0.15rem 0.4rem', cursor: 'pointer' }}
                >
                  Today
                </button>
                <button
                  type="button"
                  onClick={() => setDeadline(getDefaultDateTime(3))}
                  style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', fontSize: '0.7rem', padding: '0.15rem 0.4rem', cursor: 'pointer' }}
                >
                  This Week
                </button>
                <button
                  type="button"
                  onClick={() => setDeadline(getDefaultDateTime(8))}
                  style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', fontSize: '0.7rem', padding: '0.15rem 0.4rem', cursor: 'pointer' }}
                >
                  Next Week
                </button>
                <button
                  type="button"
                  onClick={() => setDeadline(getDefaultDateTime(25))}
                  style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', fontSize: '0.7rem', padding: '0.15rem 0.4rem', cursor: 'pointer' }}
                >
                  Next Month
                </button>
              </div>
            </div>

            <input
              type="datetime-local"
              required
              value={deadline}
              onChange={e => setDeadline(e.target.value)}
              style={{
                width: '100%',
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid var(--border-subtle)',
                color: '#ffffff',
                padding: '0.55rem 0.75rem',
                borderRadius: 'var(--radius-md)',
                fontSize: '0.85rem',
                outline: 'none',
                colorScheme: 'dark'
              }}
            />
          </div>

          {/* Difficulty */}
          <div>
            <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 500, color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>
              Difficulty
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.4rem' }}>
              {difficultyLevels.map(item => {
                const isSelected = difficulty === item.key;
                return (
                    <button
                    key={item.key}
                    type="button"
                    onClick={() => setDifficulty(item.key)}
                    style={{
                      background: isSelected ? 'var(--brand-subtle)' : 'rgba(255, 255, 255, 0.03)',
                      border: isSelected ? '1px solid var(--brand)' : '1px solid var(--border-subtle)',
                      borderRadius: 'var(--radius-sm)',
                      padding: '0.5rem 0.25rem',
                      textAlign: 'center',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <div style={{ fontSize: '0.76rem', fontWeight: 600, color: isSelected ? '#ffffff' : 'var(--text-secondary)' }}>
                      {item.label}
                    </div>
                    <div style={{ fontSize: '0.68rem', color: isSelected ? 'var(--brand)' : 'var(--text-muted)', marginTop: '0.15rem' }}>
                      {item.desc}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Project & Tags */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 500, color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>
                Project (optional)
              </label>
              <select
                value={questId}
                onChange={e => setQuestId(e.target.value)}
                style={{
                  width: '100%',
                  background: 'rgba(16, 19, 27, 0.9)',
                  border: '1px solid var(--border-subtle)',
                  color: '#ffffff',
                  padding: '0.55rem 0.65rem',
                  borderRadius: 'var(--radius-md)',
                  fontSize: '0.78rem',
                  outline: 'none'
                }}
              >
                <option value="">None</option>
                {state.quests.map(q => (
                  <option key={q.id} value={q.id}>{q.title}</option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 500, color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>
                Tags (comma separated)
              </label>
              <input
                type="text"
                placeholder="e.g. Design, Sprint"
                value={tagInput}
                onChange={e => setTagInput(e.target.value)}
                style={{
                  width: '100%',
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid var(--border-subtle)',
                  color: '#ffffff',
                  padding: '0.55rem 0.65rem',
                  borderRadius: 'var(--radius-md)',
                  fontSize: '0.78rem',
                  outline: 'none'
                }}
              />
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
              Create task
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
