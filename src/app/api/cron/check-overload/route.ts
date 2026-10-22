import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';
import { analyzeAllWorkloads } from '@/utils/dateUtils';
import { sendOverloadAlertEmail } from '@/lib/emailService';
import { Task } from '@/types/game';

export async function GET(request: Request) {
  return handleOverloadCheck();
}

export async function POST(request: Request) {
  return handleOverloadCheck();
}

async function handleOverloadCheck() {
  try {
    // 1. Fetch profiles to check
    const { data: profiles, error: profileErr } = await supabase
      .from('profiles')
      .select('id, email, display_name, last_overload_email_at');

    if (profileErr) {
      return NextResponse.json({ success: false, error: profileErr.message }, { status: 500 });
    }

    if (!profiles || profiles.length === 0) {
      return NextResponse.json({ success: true, message: 'No registered profiles found to check.' });
    }

    const results = [];
    const todayDateStr = new Date().toISOString().slice(0, 10);

    for (const profile of profiles) {
      // Check if already sent an email today
      if (profile.last_overload_email_at) {
        const lastSentDateStr = new Date(profile.last_overload_email_at).toISOString().slice(0, 10);
        if (lastSentDateStr === todayDateStr) {
          results.push({ email: profile.email, status: 'skipped_already_sent_today' });
          continue;
        }
      }

      // Fetch user tasks
      const { data: rawTasks, error: taskErr } = await supabase
        .from('tasks')
        .select('*')
        .eq('user_id', profile.id)
        .eq('completed', false);

      if (taskErr || !rawTasks) continue;

      const tasks: Task[] = rawTasks.map((t: any) => ({
        id: t.id,
        title: t.title,
        description: t.description || '',
        deadline: t.deadline,
        difficulty: t.difficulty,
        questId: t.quest_id,
        completed: t.completed,
        completedAt: t.completed_at,
        tags: t.tags || ['General'],
        notes: t.notes || '',
        createdAt: t.created_at
      }));

      const analysis = analyzeAllWorkloads(tasks);

      // Only email if there is an active warning
      if (analysis.hasAnyWarning) {
        const emailRes = await sendOverloadAlertEmail({
          toEmail: profile.email,
          toName: profile.display_name || profile.email,
          analysis,
          tasks
        });

        if (emailRes.success) {
          // Update last_overload_email_at
          await supabase
            .from('profiles')
            .update({ last_overload_email_at: new Date().toISOString() })
            .eq('id', profile.id);

          results.push({ email: profile.email, status: 'sent', warnings: analysis.activeWarnings.length });
        } else {
          results.push({ email: profile.email, status: 'failed', error: emailRes.message });
        }
      } else {
        results.push({ email: profile.email, status: 'balanced_no_email_needed' });
      }
    }

    return NextResponse.json({ success: true, processed: results.length, details: results });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
