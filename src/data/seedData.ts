import { GameState, Task } from '@/types/game';

// Base reference timestamp for static prerendering (safe for SSR)
export const STATIC_BASE_TIME = '2026-10-09T12:00:00.000Z';

// Helper to create ISO date relative to reference time
export function getRelativeDateStr(daysFromNow: number, hours: number = 17, minutes: number = 0, baseDateStr: string = STATIC_BASE_TIME): string {
  const d = new Date(baseDateStr);
  d.setDate(d.getDate() + daysFromNow);
  d.setHours(hours, minutes, 0, 0);
  return d.toISOString();
}

export function getDefaultSeedData(baseDateStr: string = STATIC_BASE_TIME): GameState {
  const createdAtStr = baseDateStr;
  const tasks: Task[] = [
    // Imminent / Overdue & Today
    {
      id: 'task-1',
      title: 'Dispatch the Daily Tactical Standup',
      description: 'Align the party on sprint blockers and calibrate milestone velocity.',
      deadline: getRelativeDateStr(0, 18, 0, baseDateStr), // Today 6 PM
      difficulty: 'easy',
      questId: 'quest-1',
      completed: false,
      xpReward: 30,
      goldReward: 15,
      tags: ['Management', 'Ritual'],
      createdAt: createdAtStr
    },
    {
      id: 'task-2',
      title: 'Review System Telemetry & Bug Reports',
      description: 'Audit production logs and squash critical memory leaks in the cache handler.',
      deadline: getRelativeDateStr(0, 21, 30, baseDateStr), // Today 9:30 PM
      difficulty: 'medium',
      questId: 'quest-1',
      completed: false,
      xpReward: 65,
      goldReward: 35,
      tags: ['Engineering', 'Bugfix'],
      createdAt: createdAtStr
    },

    // This Week
    {
      id: 'task-3',
      title: 'Draft Chapter 3: Transformer Memory Dynamics',
      description: 'Write 3,000 words breaking down attention cache compression mechanisms.',
      deadline: getRelativeDateStr(3, 17, 0, baseDateStr), // 3 days
      difficulty: 'hard',
      questId: 'quest-2',
      completed: false,
      xpReward: 140,
      goldReward: 70,
      tags: ['Research', 'DeepWork'],
      createdAt: createdAtStr
    },
    {
      id: 'task-4',
      title: 'Calibrate Cardio & Isometric Conditioning',
      description: 'Complete 10km tempo run and core stabilization circuit.',
      deadline: getRelativeDateStr(4, 8, 0, baseDateStr), // 4 days
      difficulty: 'easy',
      questId: 'quest-3',
      completed: false,
      xpReward: 35,
      goldReward: 20,
      tags: ['Vitality', 'Health'],
      createdAt: createdAtStr
    },

    // NEXT WEEK (SEEDED HEAVILY TO TRIGGER WORKLOAD WARNING DEMONSTRATION!)
    {
      id: 'task-5',
      title: 'BOSS ENCOUNTER: Final Architecture RFC Review',
      description: 'Present the distributed event-streaming architecture RFC before the executive council.',
      deadline: getRelativeDateStr(8, 14, 0, baseDateStr), // 8 days (Next Week)
      difficulty: 'epic',
      questId: 'quest-1',
      completed: false,
      xpReward: 280,
      goldReward: 150,
      tags: ['Architecture', 'Boss'],
      notes: 'RFC deck draft v1 complete. Reviewing Section 4 with security team before presentation.',
      createdAt: createdAtStr
    },
    {
      id: 'task-6',
      title: 'Complete Benchmark Suite for LLM Agent Pipeline',
      description: 'Run 1,200 multi-step test cases across 5 models and record latency curves.',
      deadline: getRelativeDateStr(9, 17, 0, baseDateStr), // 9 days (Next Week)
      difficulty: 'hard',
      questId: 'quest-2',
      completed: false,
      xpReward: 150,
      goldReward: 80,
      tags: ['Benchmarking', 'Research'],
      createdAt: createdAtStr
    },
    {
      id: 'task-7',
      title: 'Database Sharding & Zero-Downtime Migration Dry Run',
      description: 'Execute mock failover across read replicas and verify foreign key consistency.',
      deadline: getRelativeDateStr(10, 19, 0, baseDateStr), // 10 days (Next Week)
      difficulty: 'hard',
      questId: 'quest-1',
      completed: false,
      xpReward: 135,
      goldReward: 75,
      tags: ['DevOps', 'HighRisk'],
      createdAt: createdAtStr
    },
    {
      id: 'task-8',
      title: 'Conduct Security Penetration Audit',
      description: 'Inspect JWT revocation edge cases and audit third-party dependency vulnerabilities.',
      deadline: getRelativeDateStr(11, 16, 0, baseDateStr), // 11 days (Next Week)
      difficulty: 'medium',
      questId: 'quest-1',
      completed: false,
      xpReward: 70,
      goldReward: 40,
      tags: ['Security', 'Audit'],
      createdAt: createdAtStr
    },
    {
      id: 'task-9',
      title: 'Sync with External Stakeholders & Client Demo',
      description: 'Deliver working alpha build demonstration and collect feedback matrix.',
      deadline: getRelativeDateStr(12, 15, 0, baseDateStr), // 12 days (Next Week)
      difficulty: 'medium',
      questId: 'quest-1',
      completed: false,
      xpReward: 65,
      goldReward: 35,
      tags: ['Presentation', 'Client'],
      createdAt: createdAtStr
    },

    // Next Month
    {
      id: 'task-10',
      title: 'Submit Camera-Ready Conference Manuscript',
      description: 'Finalize IEEE format styling, references, and supplementary appendix.',
      deadline: getRelativeDateStr(21, 23, 59, baseDateStr), // 21 days (Next Month)
      difficulty: 'epic',
      questId: 'quest-2',
      completed: false,
      xpReward: 300,
      goldReward: 200,
      tags: ['Publication', 'Milestone'],
      createdAt: createdAtStr
    },
    {
      id: 'task-11',
      title: 'Quarterly Infrastructure Budget & License Renewal',
      description: 'Audit cloud spending across AWS/GCP and negotiate enterprise renewals.',
      deadline: getRelativeDateStr(26, 12, 0, baseDateStr), // 26 days (Next Month)
      difficulty: 'medium',
      questId: undefined,
      completed: false,
      xpReward: 60,
      goldReward: 40,
      tags: ['Finance'],
      createdAt: createdAtStr
    },

    // Later / Distant Horizon
    {
      id: 'task-12',
      title: 'Marathon 42K Endurance Quest',
      description: 'Conquer the full 42.195km endurance course and claim the Titan Medal.',
      deadline: getRelativeDateStr(48, 7, 0, baseDateStr), // 48 days (Later)
      difficulty: 'epic',
      questId: 'quest-3',
      completed: false,
      xpReward: 350,
      goldReward: 250,
      tags: ['Endurance', 'Titan'],
      createdAt: createdAtStr
    },

    // Already completed demo task
    {
      id: 'task-13',
      title: 'Scaffold Heroic Next.js Foundation',
      description: 'Initialize high-performance React Next.js structure and heroic design tokens.',
      deadline: getRelativeDateStr(-1, 12, 0, baseDateStr),
      difficulty: 'medium',
      questId: 'quest-1',
      completed: true,
      completedAt: getRelativeDateStr(0, 10, 0, baseDateStr),
      xpClaimed: true,
      notes: 'Initial React Next.js architecture setup verified and passing all unit checks.',
      xpReward: 60,
      goldReward: 30,
      tags: ['Code', 'Architecture'],
      createdAt: getRelativeDateStr(-2, 9, 0, baseDateStr)
    }
  ];

  return {
    character: {
      name: 'Lord Arthurian',
      title: 'Bane of Procrastination',
      characterClass: 'Chrono-Paladin',
      avatar: '🛡️',
      level: 4,
      currentXp: 380,
      maxXp: 600,
      hp: 92,
      maxHp: 100,
      gold: 480,
      tasksCompleted: 14,
      streakDays: 5,
      stats: {
        discipline: 28, // Slaying Hard/Epic tasks
        focus: 34,      // Deep work & knowledge
        willpower: 24   // Consistency & timely clears
      },
      currentRealmId: 'realm-1'
    },
    tasks,
    quests: [
      {
        id: 'quest-1',
        title: 'Citadel Overhaul: Next-Gen Architecture',
        description: 'Complete the mission-critical cloud platform modernization and hardening.',
        color: '#f59e0b', // Gold / Amber
        icon: '🏰',
        milestones: [
          { id: 'm-1', title: 'Refactor Core Microservices', completed: true },
          { id: 'm-2', title: 'Execute Distributed Database Sharding', completed: false },
          { id: 'm-3', title: 'Full Executive RFC Approval', completed: false }
        ],
        bonusXp: 450,
        bonusGold: 250,
        deadline: getRelativeDateStr(14, 18, 0, baseDateStr),
        completed: false
      },
      {
        id: 'quest-2',
        title: 'Grimoire of Mastery: Deep Learning Synthesis',
        description: 'Publish groundbreaking research paper on adaptive cognitive AI systems.',
        color: '#8b5cf6', // Mystic Purple
        icon: '📜',
        milestones: [
          { id: 'm-4', title: 'Complete Transformer Literature Review', completed: true },
          { id: 'm-5', title: 'Run Extensive 1200-Test Benchmark', completed: false },
          { id: 'm-6', title: 'Camera-Ready IEEE Manuscript Delivery', completed: false }
        ],
        bonusXp: 550,
        bonusGold: 300,
        deadline: getRelativeDateStr(22, 18, 0, baseDateStr),
        completed: false
      },
      {
        id: 'quest-3',
        title: 'Titan Conditioning: Physical Transcendence',
        description: 'Elevate physical resilience and prepare for the 42K endurance trial.',
        color: '#10b981', // Emerald
        icon: '⚔️',
        milestones: [
          { id: 'm-7', title: 'Establish 4-week Consistency Routine', completed: true },
          { id: 'm-8', title: 'Break 10km Tempo Barrier', completed: false },
          { id: 'm-9', title: 'Conquer the 42.2km Marathon', completed: false }
        ],
        bonusXp: 400,
        bonusGold: 200,
        deadline: getRelativeDateStr(48, 18, 0, baseDateStr),
        completed: false
      }
    ],
    equipment: [
      {
        id: 'eq-1',
        name: 'Blade of Relentless Diligence',
        slot: 'weapon',
        rarity: 'rare',
        statBonus: { discipline: 14, focus: 6 },
        description: 'Forged from tempered obsidian and focus runes. Strikes down procrastination in a single blow.',
        icon: '🗡️',
        unlocked: true,
        equipped: true,
        unlockRequirement: 'Complete 5 Tasks on time'
      },
      {
        id: 'eq-2',
        name: 'Cuirass of the Focused Mind',
        slot: 'armor',
        rarity: 'epic',
        statBonus: { willpower: 18, discipline: 8 },
        description: 'Impenetrable plate armor that shields the champion from sensory distractions.',
        icon: '🛡️',
        unlocked: true,
        equipped: true,
        unlockRequirement: 'Maintain a 3-Day streak'
      },
      {
        id: 'eq-3',
        name: 'Crown of the Master Strategist',
        slot: 'helm',
        rarity: 'rare',
        statBonus: { focus: 12 },
        description: 'A circlet inlaid with sapphire chronocrystals that clarifies tactical planning.',
        icon: '👑',
        unlocked: true,
        equipped: true,
        unlockRequirement: 'Create your first 2 Quests'
      },
      {
        id: 'eq-4',
        name: 'Hourglass of Eternal Momentum',
        slot: 'relic',
        rarity: 'legendary',
        statBonus: { focus: 15, discipline: 15, willpower: 15 },
        description: 'Ancient artifact that accelerates temporal velocity. Earns +15% bonus XP on all quests.',
        icon: '⏳',
        unlocked: true,
        equipped: true,
        unlockRequirement: 'Reach Character Level 4'
      },
      {
        id: 'eq-5',
        name: 'Chrono-Scythe of Zero Procrastination',
        slot: 'weapon',
        rarity: 'legendary',
        statBonus: { discipline: 30, focus: 18 },
        description: 'Slices through overdue deadlines like parchment. An awe-inspiring weapon of the ancients.',
        icon: '⚡',
        unlocked: false,
        equipped: false,
        unlockRequirement: 'Complete 25 Total Tasks (Current: 14/25)',
        progressPercent: 56
      },
      {
        id: 'eq-6',
        name: 'Dragonscale Aegis of Willpower',
        slot: 'armor',
        rarity: 'legendary',
        statBonus: { willpower: 32, discipline: 12 },
        description: 'Carved from the scales of the Ancient Chrono-Dragon. Immunity to deadline panic.',
        icon: '🐉',
        unlocked: false,
        equipped: false,
        unlockRequirement: 'Slay 3 Epic / Boss Tasks (Current: 1/3)',
        progressPercent: 33
      }
    ],
    titles: [
      {
        id: 'title-1',
        name: 'Novice Adventurer',
        rarity: 'common',
        description: 'Awarded to every hero who takes their first step into the realm.',
        unlocked: true,
        active: false,
        requirement: 'Join the guild'
      },
      {
        id: 'title-2',
        name: 'Bane of Procrastination',
        rarity: 'rare',
        description: 'Bestowed upon warriors who vanquish tasks with unwavering precision.',
        unlocked: true,
        active: true,
        requirement: 'Complete 10 tasks before deadline'
      },
      {
        id: 'title-3',
        name: 'Lord of Milestones',
        rarity: 'epic',
        description: 'Champion who guides complex projects to victorious fruition.',
        unlocked: true,
        active: false,
        requirement: 'Complete 1 Full Quest campaign'
      },
      {
        id: 'title-4',
        name: 'Chrono-Ascendant',
        rarity: 'legendary',
        description: 'Master of time itself. Workload surges bend to your iron will.',
        unlocked: false,
        active: false,
        requirement: 'Reach Character Level 10'
      }
    ],
    realms: [
      {
        id: 'realm-1',
        name: 'The Obsidian Archives',
        subtitle: 'Domain of Arcane Research',
        description: 'Deep midnight library filled with glowing glyphs and timeless silence. Perfect for high-intensity cognitive focus.',
        themeColor: '#6366f1',
        ambientPerk: '+5% Bonus XP on Deep Work & Research Tasks',
        bgGradient: 'radial-gradient(circle at 50% 0%, #1e1b4b 0%, #09090b 70%)',
        unlocked: true,
        active: true,
        requirement: 'Unlocked by Default'
      },
      {
        id: 'realm-2',
        name: 'Citadel of Iron Discipline',
        subtitle: 'Fortress of the Vanguard',
        description: 'High stone ramparts overlooking the valley of triumph. Inspires unyielding resolve and aggressive task execution.',
        themeColor: '#f59e0b',
        ambientPerk: '+10% Bonus XP on Hard & Epic Boss Tasks',
        bgGradient: 'radial-gradient(circle at 50% 0%, #451a03 0%, #09090b 75%)',
        unlocked: true,
        active: false,
        requirement: 'Unlocked at Level 3'
      },
      {
        id: 'realm-3',
        name: 'The Astral Observatory',
        subtitle: 'Sovereignty of Chronos',
        description: 'A floating celestial platform where celestial bodies align with future milestones.',
        themeColor: '#06b6d4',
        ambientPerk: '+15% Gold reward on all Project Milestones',
        bgGradient: 'radial-gradient(circle at 50% 0%, #083344 0%, #09090b 75%)',
        unlocked: true,
        active: false,
        requirement: 'Unlocked at Level 4'
      },
      {
        id: 'realm-4',
        name: 'Sanctum of the Chrono-Dragon',
        subtitle: 'Volcanic Crucible of Masters',
        description: 'A legendary volcano chamber where procrastination is forged into raw power.',
        themeColor: '#ef4444',
        ambientPerk: '+25% Extra XP on all Epic Boss encounters',
        bgGradient: 'radial-gradient(circle at 50% 0%, #450a0a 0%, #09090b 80%)',
        unlocked: false,
        active: false,
        requirement: 'Defeat 5 Boss Tasks & Reach Level 6'
      }
    ]
  };
}
