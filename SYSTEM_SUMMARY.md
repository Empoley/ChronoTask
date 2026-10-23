# ChronoTasks — System Summary

ChronoTasks is a proactive workload capacity radar and milestone delivery web application built with **Next.js**, **TypeScript**, and **Supabase**. Unlike standard todo lists, ChronoTasks continuously evaluates task density across upcoming time horizons to alert users of potential scheduling crunches before they happen.

---

## 1. High-Level Purpose

Traditional task managers only show what is due, often leading to crunch when multiple deadlines align. **ChronoTasks** solves this through:
- **Proactive Workload Forecasting**: Monitoring scheduled volume across time horizons (*Today*, *This Week*, *Next Week*, *Next Month*).
- **Threshold Alerts**: Warning users visually and via automated email digests when pending workload exceeds safe limits.
- **Milestone-Driven Projects**: Organizing tasks under multi-stage projects with delivery progress tracking.
- **Collaborative Workspaces**: Sharing projects with team members with role-based access control.

---

## 2. Tech Stack

| Layer | Technology | Details |
|---|---|---|
| **Frontend Framework** | Next.js 15 (App Router) | React 19, TypeScript |
| **Styling** | Vanilla CSS | Custom design system using CSS variables, responsive layout, glassmorphic dark theme, light/dark mode support |
| **Database & Auth** | Supabase | PostgreSQL database with Row-Level Security (RLS) & Supabase Authentication |
| **Email Service** | Resend API | Automated and on-demand HTML workload overload warning digests |
| **Audio & Animation** | Web Audio API & canvas-confetti | Synthesized chimes for task completions and workload alerts without external audio files |
| **State Management** | React Context (`GameContext`, `AuthContext`, `ThemeContext`) | Optimistic local UI state with automatic Supabase PostgreSQL cloud synchronization |

---

## 3. Core System Modules

### A. Workspace Command Deck & Overview
- **Workspace Status**: Displays total tasks, pending tasks, completion percentage with an animated progress bar, and overdue/due-today counters.
- **Workload Radar (Capacity Warning Banner)**:
  - Continuously scans pending tasks against predefined capacity thresholds:
    - **Today / Overdue**: $\ge 5$ tasks
    - **Next Week**: $\ge 5$ tasks
    - **Next Month**: $\ge 10$ tasks
  - When overloaded, displays a warning banner with one-click horizon filtering to triage tasks immediately.
  - Allows instant test or manual email alert dispatch to the authenticated user.

### B. Task Management
- **Task Creation**: Title, description, due date with quick presets (*Today*, *This Week*, *Next Week*, *Next Month*), difficulty tier (**Easy**, **Medium**, **Hard**), project association, milestone assignment, and tags.
- **Proximity Horizons**: Automatic categorization into *Overdue*, *Today*, *This Week*, *Next Week*, *Next Month*, *Later*, and *Completed*.
- **Live Filtering & Search**: Instant text search across titles, descriptions, and tags, plus proximity horizon tabs and difficulty filters.
- **Task Progress Notes**: Expandable inline scratchpad on each task card for logging blockers, meeting notes, and updates with auto-save on blur.
- **Gamified Interaction**: Audio completion chimes and confetti bursts when finishing tasks.

### C. Projects & Milestones
- **Multi-Stage Projects**: Projects with custom title, description, brand color, icon, and delivery deadline.
- **Milestones**: Breakdown of projects into phases/milestones with visual checklists and completion percentage calculation.
- **Task Linking**: Directly attach tasks to specific project milestones; create new milestones directly from within the task creation modal.

### D. Collaboration & Sharing
- **Project Invitations**: Project owners can invite collaborators by email with roles (`editor`, `viewer`).
- **Invites Popover**: Collaborators receive real-time invite notifications to accept or decline.
- **Security & Isolation**: Supabase Row-Level Security (RLS) policies ensure users only see their personal tasks, owned projects, and projects they have accepted invites to.

### E. Background Automation & Email Alerts
- **Cron API Route (`/api/cron/check-overload`)**: Checks pending tasks across all registered profiles and sends overload warning emails if thresholds are exceeded (capped at once per day per user).
- **Branded Email Template**: Rich HTML email (`supabase/email_template.html`) breaking down overloaded horizon density and pending deliverables.

---

## 4. Key Data Models

```
┌─────────────────┐       1:N       ┌─────────────────┐
│     Profile     │ ───────────────>│      Task       │
│  (Supabase Auth)│                 │ (Easy/Med/Hard) │
└────────┬────────┘                 └────────┬────────┘
         │ 1:N                               │ N:1 (Optional)
         ▼                                   ▼
┌─────────────────┐       1:N       ┌─────────────────┐
│     Project     │ ───────────────>│    Milestone    │
│  (Multi-stage)  │                 │  (Checklists)   │
└────────┬────────┘                 └─────────────────┘
         │ 1:N
         ▼
┌─────────────────┐
│  ProjectMember  │ (owner / editor / viewer)
│  (Invites/RBAC) │
└─────────────────┘
```

- **`Task`**: `id`, `userId`, `title`, `description`, `deadline`, `difficulty` (`'easy' | 'medium' | 'hard'`), `questId` (project ID), `milestoneId`, `completed`, `tags`, `notes`, `createdAt`.
- **`Project`**: `id`, `ownerId`, `title`, `description`, `color`, `icon`, `deadline`, `milestones`, `completed`, `createdAt`.
- **`ProjectMember`**: `id`, `projectId`, `userId`, `userEmail`, `role`, `status` (`'pending' | 'accepted'`).
- **`Profile`**: `id`, `email`, `displayName`, `avatarUrl`, `lastOverloadEmailAt`.

---

## 5. Directory Structure Overview

```
Task WebApp/
├── src/
│   ├── app/
│   │   ├── api/cron/check-overload/ # Scheduled workload audit endpoint
│   │   ├── globals.css              # Design tokens, themes & component classes
│   │   ├── layout.tsx               # Root layout with font and context providers
│   │   └── page.tsx                 # Main application dashboard
│   ├── components/
│   │   ├── AuthGate.tsx             # Sign-in / Sign-up authentication view
│   │   ├── CollaborationInvitesPopover.tsx # Team invitation inbox
│   │   ├── CreateQuestModal.tsx     # Project creation modal
│   │   ├── CreateTaskModal.tsx      # Task creation modal with difficulty & presets
│   │   ├── Header.tsx               # App navigation, sound toggle, user profile
│   │   ├── InviteModal.tsx          # Project member invite modal
│   │   ├── QuestList.tsx            # Project cards & milestone manager
│   │   ├── TaskCard.tsx             # Interactive task card with notes & audio
│   │   ├── TaskList.tsx             # Horizon tabs, search, filter, and task list
│   │   ├── WorkloadAlert.tsx        # Horizon density monitor & alert banner
│   │   └── WorkspaceOverview.tsx    # Completion rate & KPI dashboard
│   ├── context/
│   │   ├── AuthContext.tsx          # Supabase auth session management
│   │   ├── GameContext.tsx          # Core state, task/project actions & DB sync
│   │   └── ThemeContext.tsx         # Dark / Light theme toggle
│   ├── lib/
│   │   ├── emailService.ts          # Resend API email integration
│   │   └── supabaseClient.ts        # Supabase client initializer
│   ├── types/
│   │   └── game.ts                  # TypeScript domain types & interfaces
│   └── utils/
│       ├── audio.ts                 # Web Audio API sound synthesizer
│       └── dateUtils.ts             # Horizon classification & capacity thresholds
├── supabase/
│   ├── email_template.html          # Responsive HTML email template
│   └── schema.sql                   # Tables, triggers, RLS policies & helper functions
└── SYSTEM_SUMMARY.md                # System documentation summary
```

---

## 6. How to Run Locally

1. **Install dependencies**:
   ```bash
   npm install
   ```
2. **Environment Variables** (`.env.local`):
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   RESEND_API_KEY=your_resend_api_key (optional for emails)
   ```
3. **Run Development Server**:
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser.
