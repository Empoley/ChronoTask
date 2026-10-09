# ChronoQuest — App Summary

## What Is ChronoQuest?

ChronoQuest is a **gamified task management web application** built with Next.js. It turns everyday to-do lists into an RPG (Role-Playing Game) experience — tasks become quests, deadlines become missions, and productivity becomes character growth. All data is persisted locally in the browser via `localStorage`; no login or backend is required.

---

## Core Features

### Task Management
- **Create tasks** with a title, optional description, deadline (date + time picker), and a difficulty rating (Easy, Medium, Hard, Epic).
- **Deadline-based grouping** — tasks are automatically categorized by how soon they are due:
  - *Overdue*, *Today*, *This Week*, *Next Week*, *Next Month*, *Later*
- **Filter tasks** by proximity group from the workload radar panel.
- **Complete tasks** by clicking the checkbox; completed tasks are moved to a "Completed" section.
- **Uncheck completed tasks** — a task can be moved back to the active list, but **EXP is only awarded once** per task. The `xpClaimed` flag prevents duplicate rewards.
- **Delete tasks** permanently.
- **Progress Notes** — click any task to expand an inline notes panel where you can write free-form progress notes, blockers, or step logs. Notes auto-save on blur and can be saved manually.

### Workload Warning System
The **Workload Radar** panel monitors pending task density across time horizons and alerts when thresholds are exceeded:

| Horizon | Warning Threshold |
|---------|------------------|
| Today / Overdue | ≥ 5 tasks |
| Next Week | ≥ 5 tasks |
| Next Month | ≥ 10 tasks |

When a threshold is exceeded, a highlighted alert banner appears with a direct action button that filters the task list to that horizon so the user can start clearing tasks.

---

### RPG Progression System
Completing tasks earns **XP** and **Gold** based on difficulty:

| Difficulty | XP Reward | Gold Reward |
|-----------|-----------|-------------|
| Easy      | +30 XP    | +15 Gold    |
| Medium    | +65 XP    | +35 Gold    |
| Hard      | +140 XP   | +75 Gold    |
| Epic      | +280 XP   | +150 Gold   |

- A **level-up** occurs when accumulated XP passes a threshold (scales per level). A celebratory modal and confetti animation trigger on level-up.
- The character has three **stats** that grow with task completions: **Discipline** (STR), **Focus** (INT), and **Willpower** (CON).
- Character **HP** replenishes on every task completion.

---

### Character Sheet
A sidebar panel shows the player's live character profile:
- Name, title, class, and avatar
- Level, XP progress bar (current / max), HP bar
- Gold balance
- Discipline, Focus, and Willpower stat scores
- Total tasks completed

---

### Projects (Quests)
- **Create Projects** (called Quests) with a title, description, color, icon, optional deadline, and a list of **milestones**.
- Each milestone can be individually checked off, awarding incremental XP/Gold.
- Completing **all milestones** of a quest triggers a full-quest completion reward (+350 XP, +200 Gold by default) and a confetti celebration.
- Tasks can be **linked to a quest** to associate them with a project.

---

### Rewards Vault (Equipment, Titles, Realms)
Long-term progression unlocks permanent rewards:

- **Equipment** — Weapons, armor, relics, and helms with stat bonuses (Focus, Discipline, Willpower). Items are unlocked by reaching task completion milestones or specific levels, then equipped from the Vault tab.
- **Titles** — Honorific names displayed on the character sheet, unlocked at certain levels (e.g., "The Relentless" at Level 6).
- **Realms** — Location themes that change the atmospheric flavor of the app. Unlocked at progression milestones (e.g., a new realm at Level 5).

---

### Sound & Visual Feedback
- Synthesized audio chimes (Web Audio API — no external audio files) play for:
  - Task completion
  - Level-up fanfare
  - Quest completion
  - Equipment equip
  - Workload alert horn
- **Canvas Confetti** bursts on task completion, level-ups, and quest finishes.
- Sound can be muted via a toggle in the header.

---

## Data Persistence
- All game state (tasks, quests, character, equipment, titles, realms) is saved automatically to **`localStorage`** under the key `chrono_quest_game_state_v1`.
- A **Reset Demo Data** option restores the app to its bundled seed state.

---

## Technology Stack
| Layer | Technology |
|---|---|
| Framework | Next.js (App Router, TypeScript) |
| Styling | Vanilla CSS (custom design system with CSS variables) |
| Icons | Lucide React |
| Confetti | canvas-confetti |
| Audio | Web Audio API (synthesized) |
| Storage | Browser localStorage |
