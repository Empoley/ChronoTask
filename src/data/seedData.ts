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
    // ==========================================
    // 1. TODAY & OVERDUE (Imminent Deadlines)
    // ==========================================
    {
      id: 'task-overdue-1',
      title: 'Submit Cloud Expense Optimization Report',
      description: 'Audit monthly cloud consumption, compile cost center breakdown, and deliver finance optimization summary.',
      deadline: getRelativeDateStr(-1, 16, 0, baseDateStr), // 1 day overdue
      difficulty: 'medium',
      questId: undefined,
      completed: false,
      tags: ['Finance', 'DevOps'],
      notes: 'Waiting on final invoice consolidation from the billing administrator before submission.',
      createdAt: getRelativeDateStr(-3, 10, 0, baseDateStr)
    },
    {
      id: 'task-1',
      title: 'Hold Daily Team Standup',
      description: 'Align the team on sprint blockers, review PR queue, and calibrate milestone delivery velocity.',
      deadline: getRelativeDateStr(0, 14, 0, baseDateStr), // Today 2:00 PM
      difficulty: 'easy',
      questId: 'quest-1',
      completed: false,
      tags: ['Management', 'Meeting'],
      createdAt: createdAtStr
    },
    {
      id: 'task-today-2',
      title: 'Hotfix: Resolve SSL Handshake Timeout on Staging',
      description: 'Patch nginx edge ingress proxy configuration to prevent intermittent TLS termination timeouts.',
      deadline: getRelativeDateStr(0, 16, 30, baseDateStr), // Today 4:30 PM
      difficulty: 'hard',
      questId: 'quest-1',
      completed: false,
      tags: ['DevOps', 'Incident'],
      notes: 'Root cause identified in keepalive timeout threshold on external load balancer.',
      createdAt: createdAtStr
    },
    {
      id: 'task-2',
      title: 'Review System Telemetry & Error Logs',
      description: 'Audit production telemetry and resolve high-memory edge cases in the attention cache layer.',
      deadline: getRelativeDateStr(0, 20, 0, baseDateStr), // Today 8:00 PM
      difficulty: 'medium',
      questId: 'quest-1',
      completed: false,
      tags: ['Engineering', 'Bugfix'],
      createdAt: createdAtStr
    },
    {
      id: 'task-today-4',
      title: 'Approve Sprint Pull Requests & Code Reviews',
      description: 'Review pending pull requests for security compliance, code standards, and unit test coverage.',
      deadline: getRelativeDateStr(0, 22, 0, baseDateStr), // Today 10:00 PM
      difficulty: 'easy',
      questId: 'quest-1',
      completed: false,
      tags: ['CodeReview', 'Quality'],
      createdAt: createdAtStr
    },

    // ==========================================
    // 2. THIS WEEK (Within next 7 days)
    // ==========================================
    {
      id: 'task-tw-1',
      title: 'Refactor Authentication Middleware for JWT Tokens',
      description: 'Implement distributed token refresh logic with automated revocation list synchronization.',
      deadline: getRelativeDateStr(1, 15, 0, baseDateStr), // 1 day
      difficulty: 'medium',
      questId: 'quest-1',
      completed: false,
      tags: ['Security', 'Backend'],
      createdAt: createdAtStr
    },
    {
      id: 'task-3',
      title: 'Draft Technical Spec: Memory Cache Dynamics',
      description: 'Write detailed specification document detailing attention cache compression mechanisms.',
      deadline: getRelativeDateStr(2, 17, 0, baseDateStr), // 2 days
      difficulty: 'hard',
      questId: 'quest-2',
      completed: false,
      tags: ['Research', 'DeepWork'],
      notes: 'Sections 1 through 3 outlined. Initial mathematical proof verified.',
      createdAt: createdAtStr
    },
    {
      id: 'task-tw-2',
      title: 'Conduct Usability Testing for Navigation Redesign',
      description: 'Run 5 remote usability sessions to evaluate navigation readability and tab discoverability.',
      deadline: getRelativeDateStr(3, 11, 30, baseDateStr), // 3 days
      difficulty: 'medium',
      questId: 'quest-4',
      completed: false,
      tags: ['Design', 'UX'],
      createdAt: createdAtStr
    },
    {
      id: 'task-4',
      title: 'Weekly Fitness & Cardio Conditioning',
      description: 'Complete 10km tempo run and recovery workout routine as scheduled in marathon prep plan.',
      deadline: getRelativeDateStr(4, 8, 0, baseDateStr), // 4 days
      difficulty: 'easy',
      questId: 'quest-3',
      completed: false,
      tags: ['Health', 'Habit'],
      createdAt: createdAtStr
    },
    {
      id: 'task-tw-3',
      title: 'Design System Color Token Migration Sync',
      description: 'Align color tokens across web components and document semantic usage rules.',
      deadline: getRelativeDateStr(5, 16, 0, baseDateStr), // 5 days
      difficulty: 'easy',
      questId: 'quest-4',
      completed: false,
      tags: ['Design', 'Frontend'],
      createdAt: createdAtStr
    },
    {
      id: 'task-tw-4',
      title: 'Configure End-to-End Test Automation Suite',
      description: 'Automate critical user flows including task creation, horizon filtering, and milestone delivery.',
      deadline: getRelativeDateStr(6, 18, 0, baseDateStr), // 6 days
      difficulty: 'hard',
      questId: 'quest-1',
      completed: false,
      tags: ['QA', 'Testing'],
      createdAt: createdAtStr
    },

    // ==========================================
    // 3. NEXT WEEK (8 to 14 days out)
    // ==========================================
    {
      id: 'task-5',
      title: 'Final Architecture RFC Review & Presentation',
      description: 'Present the distributed event-streaming architecture RFC before technical leadership.',
      deadline: getRelativeDateStr(8, 14, 0, baseDateStr), // 8 days
      difficulty: 'epic',
      questId: 'quest-1',
      completed: false,
      tags: ['Architecture', 'Leadership'],
      notes: 'RFC deck draft v1 complete. Reviewing Section 4 with security team before presentation.',
      createdAt: createdAtStr
    },
    {
      id: 'task-6',
      title: 'Complete Benchmark Suite for LLM Pipeline',
      description: 'Execute 1,200 multi-step test cases across 5 models and record throughput curves.',
      deadline: getRelativeDateStr(9, 17, 0, baseDateStr), // 9 days
      difficulty: 'hard',
      questId: 'quest-2',
      completed: false,
      tags: ['Benchmarking', 'Research'],
      createdAt: createdAtStr
    },
    {
      id: 'task-7',
      title: 'Database Sharding & Zero-Downtime Migration Dry Run',
      description: 'Execute mock failover across read replicas and verify foreign key consistency.',
      deadline: getRelativeDateStr(10, 19, 0, baseDateStr), // 10 days
      difficulty: 'hard',
      questId: 'quest-1',
      completed: false,
      tags: ['DevOps', 'HighRisk'],
      createdAt: createdAtStr
    },
    {
      id: 'task-8',
      title: 'Conduct Security & Dependency Audit',
      description: 'Inspect token revocation edge cases and audit third-party dependency vulnerabilities.',
      deadline: getRelativeDateStr(11, 16, 0, baseDateStr), // 11 days
      difficulty: 'medium',
      questId: 'quest-1',
      completed: false,
      tags: ['Security', 'Audit'],
      createdAt: createdAtStr
    },
    {
      id: 'task-9',
      title: 'Client Alpha Demonstration & Feedback Sync',
      description: 'Deliver working alpha build demonstration and collect stakeholder feedback matrix.',
      deadline: getRelativeDateStr(12, 15, 0, baseDateStr), // 12 days
      difficulty: 'medium',
      questId: 'quest-1',
      completed: false,
      tags: ['Presentation', 'Client'],
      createdAt: createdAtStr
    },
    {
      id: 'task-nw-1',
      title: 'Optimize Vector Search Index Partitioning',
      description: 'Fine-tune HNSW index construction hyperparameters and evaluate recall-latency tradeoffs.',
      deadline: getRelativeDateStr(13, 11, 0, baseDateStr), // 13 days
      difficulty: 'hard',
      questId: 'quest-2',
      completed: false,
      tags: ['Database', 'Performance'],
      createdAt: createdAtStr
    },
    {
      id: 'task-nw-2',
      title: 'Sprint Retrospective & Velocity Calibration',
      description: 'Review completed delivery metrics, analyze bottlenecks, and establish commitments for upcoming sprint.',
      deadline: getRelativeDateStr(14, 16, 30, baseDateStr), // 14 days
      difficulty: 'easy',
      questId: 'quest-1',
      completed: false,
      tags: ['Management', 'Agile'],
      createdAt: createdAtStr
    },

    // ==========================================
    // 4. NEXT MONTH (15 to 30 days out)
    // ==========================================
    {
      id: 'task-nm-1',
      title: 'Perform Disaster Recovery Failover Simulation',
      description: 'Trigger simulated regional outage on staging environment and measure recovery time objective (RTO).',
      deadline: getRelativeDateStr(16, 14, 0, baseDateStr), // 16 days
      difficulty: 'hard',
      questId: 'quest-1',
      completed: false,
      tags: ['Reliability', 'DevOps'],
      createdAt: createdAtStr
    },
    {
      id: 'task-10',
      title: 'Submit Camera-Ready Conference Manuscript',
      description: 'Finalize paper styling, bibliography references, and supplementary mathematical appendix.',
      deadline: getRelativeDateStr(19, 23, 59, baseDateStr), // 19 days
      difficulty: 'epic',
      questId: 'quest-2',
      completed: false,
      tags: ['Publication', 'Milestone'],
      notes: 'Finalizing IEEE camera-ready template styling and proofreading section citations.',
      createdAt: createdAtStr
    },
    {
      id: 'task-nm-2',
      title: 'Conduct Peer Reviews on Attention Cache Paper',
      description: 'Solicit feedback from external research collaborators and incorporate theoretical suggestions.',
      deadline: getRelativeDateStr(21, 17, 0, baseDateStr), // 21 days
      difficulty: 'medium',
      questId: 'quest-2',
      completed: false,
      tags: ['Research', 'PeerReview'],
      createdAt: createdAtStr
    },
    {
      id: 'task-11',
      title: 'Quarterly Infrastructure Budget & License Renewal',
      description: 'Audit cloud resource spending across AWS/GCP and negotiate enterprise volume renewals.',
      deadline: getRelativeDateStr(24, 12, 0, baseDateStr), // 24 days
      difficulty: 'medium',
      questId: undefined,
      completed: false,
      tags: ['Finance'],
      createdAt: createdAtStr
    },
    {
      id: 'task-nm-3',
      title: 'Half-Marathon 21K Milestone Checkpoint',
      description: 'Run 21.1km distance simulation at target race pace to validate nutrition and hydration strategy.',
      deadline: getRelativeDateStr(27, 7, 30, baseDateStr), // 27 days
      difficulty: 'hard',
      questId: 'quest-3',
      completed: false,
      tags: ['Athletics', 'Training'],
      createdAt: createdAtStr
    },
    {
      id: 'task-nm-4',
      title: 'Publish API v2 Developer Documentation & SDKs',
      description: 'Deploy auto-generated OpenAPI documentation portal and release official TypeScript client package.',
      deadline: getRelativeDateStr(29, 18, 0, baseDateStr), // 29 days
      difficulty: 'medium',
      questId: 'quest-1',
      completed: false,
      tags: ['Docs', 'DeveloperExperience'],
      createdAt: createdAtStr
    },

    // ==========================================
    // 5. LATER (30+ days out)
    // ==========================================
    {
      id: 'task-lt-1',
      title: 'Migrate Kubernetes Clusters to Managed Multi-Region',
      description: 'Architect active-active geo-replicated container clusters with automated traffic failover.',
      deadline: getRelativeDateStr(38, 15, 0, baseDateStr), // 38 days
      difficulty: 'epic',
      questId: 'quest-1',
      completed: false,
      tags: ['Infrastructure', 'Cloud'],
      createdAt: createdAtStr
    },
    {
      id: 'task-12',
      title: 'Marathon 42K Endurance Run',
      description: 'Complete the scheduled annual 42.195km road marathon under target finish time.',
      deadline: getRelativeDateStr(48, 7, 0, baseDateStr), // 48 days
      difficulty: 'epic',
      questId: 'quest-3',
      completed: false,
      tags: ['Endurance', 'Personal'],
      createdAt: createdAtStr
    },
    {
      id: 'task-lt-2',
      title: 'Annual SOC2 Type II Security Compliance Audit',
      description: 'Engage third-party security auditor, furnish continuous evidence logs, and renew certification.',
      deadline: getRelativeDateStr(56, 17, 0, baseDateStr), // 56 days
      difficulty: 'hard',
      questId: undefined,
      completed: false,
      tags: ['Compliance', 'Audit'],
      createdAt: createdAtStr
    },
    {
      id: 'task-lt-3',
      title: 'Keynote Presentation at Global AI Summit',
      description: 'Deliver 45-minute keynote address on memory-efficient foundation models and adaptive inference.',
      deadline: getRelativeDateStr(68, 10, 0, baseDateStr), // 68 days
      difficulty: 'epic',
      questId: 'quest-2',
      completed: false,
      tags: ['Speaking', 'Conference'],
      createdAt: createdAtStr
    },
    {
      id: 'task-lt-4',
      title: 'Design System v3 Next-Gen Component Overhaul',
      description: 'Re-architect core component library using CSS variables, headless primitives, and WCAG AAA compliance.',
      deadline: getRelativeDateStr(85, 16, 0, baseDateStr), // 85 days
      difficulty: 'hard',
      questId: 'quest-4',
      completed: false,
      tags: ['DesignSystem', 'Frontend'],
      createdAt: createdAtStr
    },

    // ==========================================
    // 6. COMPLETED (Historical Delivery Record)
    // ==========================================
    {
      id: 'task-13',
      title: 'Scaffold Core Application Foundation',
      description: 'Initialize high-performance Next.js workspace structure, layout, and design system.',
      deadline: getRelativeDateStr(-2, 12, 0, baseDateStr),
      difficulty: 'medium',
      questId: 'quest-1',
      completed: true,
      completedAt: getRelativeDateStr(-1, 10, 0, baseDateStr),
      notes: 'Initial React Next.js architecture setup verified and passing all unit checks.',
      tags: ['Code', 'Architecture'],
      createdAt: getRelativeDateStr(-4, 9, 0, baseDateStr)
    },
    {
      id: 'task-comp-2',
      title: 'Implement Real-time Workload Radar Algorithm',
      description: 'Write analytical horizon classification algorithm to flag deadline bottlenecks across horizons.',
      deadline: getRelativeDateStr(-4, 15, 0, baseDateStr),
      difficulty: 'hard',
      questId: 'quest-1',
      completed: true,
      completedAt: getRelativeDateStr(-3, 16, 30, baseDateStr),
      notes: 'Horizon threshold calculation and density warnings operational with comprehensive tests.',
      tags: ['Analytics', 'Algorithm'],
      createdAt: getRelativeDateStr(-6, 11, 0, baseDateStr)
    },
    {
      id: 'task-comp-3',
      title: 'Design Dark Mode Tokens & Glassmorphic CSS System',
      description: 'Create custom token palette, card components, buttons, and responsive layout styling.',
      deadline: getRelativeDateStr(-5, 18, 0, baseDateStr),
      difficulty: 'medium',
      questId: 'quest-4',
      completed: true,
      completedAt: getRelativeDateStr(-5, 14, 0, baseDateStr),
      notes: 'Tokens defined in globals.css with high-contrast accessibility compliance.',
      tags: ['Design', 'UI'],
      createdAt: getRelativeDateStr(-8, 10, 0, baseDateStr)
    },
    {
      id: 'task-comp-4',
      title: 'Establish Team Sprint Cadence & GitHub Project Board',
      description: 'Configure sprint review rituals, automated issue triage rules, and milestone tracking.',
      deadline: getRelativeDateStr(-7, 12, 0, baseDateStr),
      difficulty: 'easy',
      questId: 'quest-1',
      completed: true,
      completedAt: getRelativeDateStr(-6, 17, 0, baseDateStr),
      tags: ['Operations', 'Planning'],
      createdAt: getRelativeDateStr(-10, 8, 0, baseDateStr)
    },
    {
      id: 'task-comp-5',
      title: 'Draft Transformer Attention Literature Review',
      description: 'Survey 45 recent papers on sparse and cognitive attention models for foundation networks.',
      deadline: getRelativeDateStr(-9, 17, 0, baseDateStr),
      difficulty: 'hard',
      questId: 'quest-2',
      completed: true,
      completedAt: getRelativeDateStr(-8, 15, 0, baseDateStr),
      notes: 'Completed comprehensive taxonomy of linear and sparse attention mechanisms.',
      tags: ['Research', 'Literature'],
      createdAt: getRelativeDateStr(-14, 9, 0, baseDateStr)
    }
  ];

  return {
    tasks,
    quests: [
      {
        id: 'quest-1',
        title: 'Platform Infrastructure Modernization',
        description: 'Complete mission-critical cloud platform modernization, microservices refactor, and security hardening.',
        color: '#f59e0b', // Amber
        icon: '📁',
        milestones: [
          { id: 'm-1', title: 'Refactor Core Microservices', completed: true },
          { id: 'm-2', title: 'Execute Distributed Database Sharding', completed: false },
          { id: 'm-3', title: 'Executive RFC Architecture Sign-off', completed: false }
        ],
        deadline: getRelativeDateStr(14, 18, 0, baseDateStr),
        completed: false
      },
      {
        id: 'quest-2',
        title: 'Deep Learning Research & Publication',
        description: 'Publish research paper on adaptive cognitive machine learning architectures.',
        color: '#8b5cf6', // Purple
        icon: '📝',
        milestones: [
          { id: 'm-4', title: 'Complete Transformer Literature Review', completed: true },
          { id: 'm-5', title: 'Run Extensive 1200-Test Benchmark', completed: false },
          { id: 'm-6', title: 'Camera-Ready IEEE Manuscript Delivery', completed: false }
        ],
        deadline: getRelativeDateStr(22, 18, 0, baseDateStr),
        completed: false
      },
      {
        id: 'quest-3',
        title: 'Endurance Training & Athletic Goal',
        description: 'Maintain structured physical conditioning plan and prepare for the 42K marathon.',
        color: '#10b981', // Emerald
        icon: '🎯',
        milestones: [
          { id: 'm-7', title: 'Establish 4-week Consistency Routine', completed: true },
          { id: 'm-8', title: 'Break 10km Tempo Barrier', completed: false },
          { id: 'm-9', title: 'Complete 42.2km Marathon', completed: false }
        ],
        deadline: getRelativeDateStr(48, 18, 0, baseDateStr),
        completed: false
      },
      {
        id: 'quest-4',
        title: 'Design System Foundation & Tokens',
        description: 'Establish cohesive typographic hierarchy, modern dark-mode palette, and accessible web primitives.',
        color: '#3b82f6', // Blue
        icon: '🎨',
        milestones: [
          { id: 'm-10', title: 'Audit Legacy UI Components & Dependencies', completed: true },
          { id: 'm-11', title: 'Establish Design Tokens & Typography Scale', completed: true },
          { id: 'm-12', title: 'Build Accessible Primitive Components', completed: true }
        ],
        deadline: getRelativeDateStr(-3, 18, 0, baseDateStr),
        completed: true,
        completedAt: getRelativeDateStr(-2, 16, 0, baseDateStr)
      }
    ],
  };
}

/**
 * Returns seed data uniquely scoped to a specific user to prevent primary key
 * collisions in multi-user databases like Supabase.
 */
export function getSeedDataForUser(userId?: string, baseDateStr: string = STATIC_BASE_TIME): GameState {
  const base = getDefaultSeedData(baseDateStr);
  if (!userId) return base;

  const userSuffix = userId.replace(/-/g, '').slice(0, 8);
  const questIdMap: Record<string, string> = {};

  const quests = base.quests.map((q, idx) => {
    const newId = `q-${userSuffix}-${idx + 1}`;
    questIdMap[q.id] = newId;
    return {
      ...q,
      id: newId,
      ownerId: userId
    };
  });

  const tasks = base.tasks.map((t, idx) => ({
    ...t,
    id: `t-${userSuffix}-${idx + 1}`,
    questId: t.questId ? (questIdMap[t.questId] || t.questId) : undefined
  }));

  return { tasks, quests };
}

