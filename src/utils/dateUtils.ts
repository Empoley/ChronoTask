import { Task, TaskProximity } from '@/types/game';
import { STATIC_BASE_TIME } from '@/data/seedData';

/**
 * Returns safe reference date: static during prerender, live in browser
 */
export function getCurrentReferenceDate(): Date {
  if (typeof window !== 'undefined') {
    return new Date();
  }
  return new Date(STATIC_BASE_TIME);
}

/**
 * Returns the proximity category for a given deadline relative to reference date.
 */
export function getTaskProximity(deadlineStr: string, referenceDate: Date = getCurrentReferenceDate()): TaskProximity {
  if (!deadlineStr) return 'later';

  const deadline = new Date(deadlineStr);
  if (isNaN(deadline.getTime())) return 'later';

  const ref = new Date(referenceDate);
  const startOfToday = new Date(ref.getFullYear(), ref.getMonth(), ref.getDate());
  const endOfToday = new Date(ref.getFullYear(), ref.getMonth(), ref.getDate(), 23, 59, 59, 999);

  // Overdue if strictly before today
  if (deadline < startOfToday) {
    return 'overdue';
  }

  // Today
  if (deadline >= startOfToday && deadline <= endOfToday) {
    return 'today';
  }

  const oneDayMs = 24 * 60 * 60 * 1000;
  const daysDiff = (deadline.getTime() - endOfToday.getTime()) / oneDayMs;

  // This week: within next 7 days from tomorrow
  if (daysDiff <= 7) {
    return 'this_week';
  }

  // Next week: between 7 and 14 days
  if (daysDiff > 7 && daysDiff <= 14) {
    return 'next_week';
  }

  // Next month: between 14 and 30 days
  if (daysDiff > 14 && daysDiff <= 30) {
    return 'next_month';
  }

  return 'later';
}

/**
 * Formats a deadline for user display with relative badges.
 */
export function formatDeadline(deadlineStr: string): string {
  if (!deadlineStr) return 'No deadline set';
  const d = new Date(deadlineStr);
  if (isNaN(d.getTime())) return deadlineStr;

  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const month = monthNames[d.getMonth()];
  const day = d.getDate();
  const year = d.getFullYear();
  const hours = d.getHours();
  const minutes = d.getMinutes().toString().padStart(2, '0');
  const ampm = hours >= 12 ? 'PM' : 'AM';
  const displayHours = hours % 12 || 12;

  return `${month} ${day}, ${year} • ${displayHours}:${minutes} ${ampm}`;
}

/**
 * Format relative countdown string like "2 days left" or "Overdue by 1 day"
 */
export function getRelativeTimeText(deadlineStr: string, refDate: Date = getCurrentReferenceDate()): { text: string; isPast: boolean } {
  if (!deadlineStr) return { text: 'No date', isPast: false };
  const d = new Date(deadlineStr);
  const diffMs = d.getTime() - refDate.getTime();
  const isPast = diffMs < 0;
  const absDiff = Math.abs(diffMs);

  const hours = Math.floor(absDiff / (1000 * 60 * 60));
  const days = Math.floor(hours / 24);

  if (days > 1) {
    return {
      text: isPast ? `${days}d overdue` : `${days}d remaining`,
      isPast
    };
  } else if (hours >= 1) {
    return {
      text: isPast ? `${hours}h overdue` : `${hours}h remaining`,
      isPast
    };
  } else {
    return {
      text: isPast ? 'Due earlier today' : 'Due very soon',
      isPast
    };
  }
}

export interface HorizonAlert {
  horizon: 'today' | 'next_week' | 'next_month';
  label: string;
  taskCount: number;
  threshold: number;
  isHighWorkload: boolean;
  message: string;
}

export interface ComprehensiveWorkloadAnalysis {
  hasAnyWarning: boolean;
  activeWarnings: HorizonAlert[];
  today: HorizonAlert;
  nextWeek: HorizonAlert;
  nextMonth: HorizonAlert;
}

/**
 * Analyzes workload pressure across Today (threshold: 5+), Next Week (threshold: 5+), and Next Month (threshold: 10+).
 */
export function analyzeAllWorkloads(tasks: Task[], refDate: Date = getCurrentReferenceDate()): ComprehensiveWorkloadAnalysis {
  let todayCount = 0;
  let nextWeekCount = 0;
  let nextMonthCount = 0;

  for (const task of tasks) {
    if (task.completed) continue;
    const proximity = getTaskProximity(task.deadline, refDate);

    if (proximity === 'today' || proximity === 'overdue') {
      todayCount++;
    } else if (proximity === 'next_week') {
      nextWeekCount++;
    } else if (proximity === 'next_month') {
      nextMonthCount++;
    }
  }

  const today: HorizonAlert = {
    horizon: 'today',
    label: 'Today / Overdue',
    taskCount: todayCount,
    threshold: 5,
    isHighWorkload: todayCount >= 5,
    message: `High workload today: ${todayCount} tasks due. Clear immediate tasks to stay on schedule.`
  };

  const nextWeek: HorizonAlert = {
    horizon: 'next_week',
    label: 'Next Week',
    taskCount: nextWeekCount,
    threshold: 5,
    isHighWorkload: nextWeekCount >= 5,
    message: `High workload next week: ${nextWeekCount} tasks scheduled. Clear tasks early to avoid a backlog.`
  };

  const nextMonth: HorizonAlert = {
    horizon: 'next_month',
    label: 'Next Month',
    taskCount: nextMonthCount,
    threshold: 10,
    isHighWorkload: nextMonthCount >= 10,
    message: `High workload next month: ${nextMonthCount} tasks scheduled. Consider adjusting long-range milestones.`
  };

  const activeWarnings: HorizonAlert[] = [];
  if (today.isHighWorkload) activeWarnings.push(today);
  if (nextWeek.isHighWorkload) activeWarnings.push(nextWeek);
  if (nextMonth.isHighWorkload) activeWarnings.push(nextMonth);

  return {
    hasAnyWarning: activeWarnings.length > 0,
    activeWarnings,
    today,
    nextWeek,
    nextMonth
  };
}

export interface WorkloadAnalysis {
  isHighWorkload: boolean;
  taskCount: number;
  totalDifficultyPoints: number;
  epicCount: number;
  hardCount: number;
  threatLevel: 'calm' | 'moderate' | 'high' | 'critical';
  recommendation: string;
}

/**
 * Backward-compatible helper for Next Week (strictly requiring 5 or more tasks)
 */
export function analyzeNextWeekWorkload(tasks: Task[], refDate: Date = getCurrentReferenceDate()): WorkloadAnalysis {
  const nextWeekPendingTasks = tasks.filter(t => !t.completed && getTaskProximity(t.deadline, refDate) === 'next_week');
  const taskCount = nextWeekPendingTasks.length;
  // Strictly only warn if there's 5 or more tasks
  const isHighWorkload = taskCount >= 5;

  let totalDifficultyPoints = 0;
  let epicCount = 0;
  let hardCount = 0;
  const difficultyWeights: Record<string, number> = { easy: 1, medium: 2, hard: 3.5, epic: 5 };

  for (const task of nextWeekPendingTasks) {
    totalDifficultyPoints += difficultyWeights[task.difficulty] || 2;
    if (task.difficulty === 'epic') epicCount++;
    if (task.difficulty === 'hard') hardCount++;
  }

  return {
    isHighWorkload,
    taskCount,
    totalDifficultyPoints,
    epicCount,
    hardCount,
    threatLevel: isHighWorkload ? 'high' : 'calm',
    recommendation: isHighWorkload
      ? `High workload: ${taskCount} tasks scheduled for next week. Clear tasks early to avoid a backlog.`
      : 'Next week workload is manageable.'
  };
}
