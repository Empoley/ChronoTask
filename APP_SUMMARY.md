# ChronoTasks — App Summary

## What Is ChronoTasks?

ChronoTasks is a **modern, proactive task and workload management web application** built with Next.js. It helps individuals and teams anticipate upcoming deadlines, balance task density across time horizons, track multi-stage projects with milestone breakdowns, and log progress notes. All data is persisted locally in the browser via `localStorage`; no login or backend is required.

---

## Core Features

### 1. Task Management
- **Create Tasks** with a title, optional description, deadline (date + time picker with quick presets for Today, This Week, Next Week, and Next Month), difficulty rating (Easy, Medium, Hard, Epic), project association, and tags.
- **Horizon-based Grouping** — tasks are automatically organized into horizon categories based on due dates:
  - *Overdue*, *Today*, *This Week*, *Next Week*, *Next Month*, *Later*, and *Completed*
- **Search & Filter** — live search by title, description, or tags, along with difficulty filter.
- **Complete & Reactivate Tasks** — toggle tasks complete with subtle sound feedback and confetti.
- **Progress Notes** — expandable inline notes panel on each task for logging blockers, steps completed, or meeting minutes. Auto-saves on blur and includes a manual Save button with instant feedback.
- **Delete Tasks** — easily remove tasks when no longer needed.

---

### 2. Workload Warning System (Workload Radar)
The **Workload Radar** panel continuously monitors pending task density across time horizons and alerts when thresholds are exceeded to prevent crunch and burnout:

| Horizon | Warning Threshold |
|---------|-------------------|
| Today / Overdue | ≥ 5 tasks |
| Next Week | ≥ 5 tasks |
| Next Month | ≥ 10 tasks |

When a threshold is exceeded, a highlighted alert banner appears with a direct action button that filters the task list to that horizon so you can proactively triage or reschedule tasks.

---

### 3. Projects & Milestones
- **Multi-stage Projects** with title, description, custom color accent, icon, and milestones.
- **Milestone Checklist** — check off individual phases with automatic progress bar percentage calculation.
- **Direct Task Association** — link tasks directly to projects, and click "Add Task" directly on any project card to quickly populate project deliverables.

---

### 4. Workspace Overview
A sleek metrics panel providing real-time operational context:
- Overall task completion rate with a responsive visual progress bar
- Key KPI cards: **Pending** tasks, **Due Soon** (today/overdue) alerts, and active **Streak** counter
- Status indicators for active projects and cleared tasks

---

### 5. Sound & Visual Feedback
- Synthesized Web Audio API chimes (no external audio files required):
  - Gentle completion chime on checking off tasks and milestones
  - Alert notification on high workload threshold warnings
- Audio toggle in the header to easily mute or unmute
- Subtle confetti celebrations when clearing milestones or major initiatives

---

### 6. Data Persistence
- Automatic local persistence in browser `localStorage`.
- **Reset Demo Data** option in the header to restore default sample tasks and projects at any time.

---

## Technology Stack
| Layer | Technology |
|---|---|
| Framework | Next.js (App Router, TypeScript) |
| Styling | Vanilla CSS (custom design system with CSS variables, dark glassmorphic UI) |
| Icons | Lucide React |
| Confetti | canvas-confetti |
| Audio | Web Audio API (synthesized) |
| Storage | Browser localStorage |
