import { ComprehensiveWorkloadAnalysis } from '@/utils/dateUtils';
import { Task } from '@/types/game';

export interface OverloadEmailPayload {
  toEmail: string;
  toName: string;
  analysis: ComprehensiveWorkloadAnalysis;
  tasks: Task[];
  actionUrl?: string;
  forceSend?: boolean;
}

export async function sendOverloadAlertEmail(payload: OverloadEmailPayload): Promise<{ success: boolean; message: string }> {
  const serviceId = process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID || '';
  const templateId = process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID || '';
  const publicKey = process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY || '';

  if (!serviceId || !publicKey) {
    return { success: false, message: 'EmailJS credentials (service ID or public key) are missing.' };
  }

  if (!payload.analysis.hasAnyWarning && !payload.forceSend) {
    return { success: false, message: 'No active overload warnings to send.' };
  }

  // Format summary string
  const warnings = payload.analysis.activeWarnings.length > 0 
    ? payload.analysis.activeWarnings 
    : [{ horizon: 'today' as const, label: 'Today (Test Alert)', taskCount: 4, threshold: 1, message: 'Over capacity with 4 tasks scheduled (threshold is 1)' }];

  const warningLabels = warnings
    .map(w => `${w.label} (${w.taskCount} tasks)`)
    .join(', ');

  const overloadSummary = `⚠️ High Workload Warning: ${warningLabels}`;

  // Build clean HTML breakdown
  let detailsHtml = '<div style="margin-top: 12px;">';
  for (const warning of warnings) {
    detailsHtml += `
      <div style="background: rgba(255, 255, 255, 0.04); border-left: 3px solid #f97316; border-radius: 6px; padding: 10px 14px; margin-bottom: 8px;">
        <div style="font-weight: 600; font-size: 14px; color: #ffffff;">${warning.label}: ${warning.taskCount} tasks</div>
        <div style="font-size: 12px; color: #94a3b8; margin-top: 3px;">${warning.message}</div>
      </div>
    `;
  }
  detailsHtml += '</div>';

  const templateParams = {
    to_name: payload.toName || 'ChronoTasks User',
    to_email: payload.toEmail,
    overload_summary: overloadSummary,
    overload_details_html: detailsHtml,
    action_url: payload.actionUrl || (typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000'),
    date_string: new Date().toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  };

  try {
    const res = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        service_id: serviceId,
        template_id: templateId,
        user_id: publicKey,
        template_params: templateParams
      })
    });

    if (res.ok) {
      return { success: true, message: 'Overload alert email sent successfully.' };
    } else {
      const errText = await res.text();
      return { success: false, message: `EmailJS error: ${errText}` };
    }
  } catch (error: any) {
    return { success: false, message: error.message || 'Failed to send overload email.' };
  }
}

export interface InviteEmailPayload {
  toEmail: string;
  toName?: string;
  projectName: string;
  inviterName: string;
  role: 'editor' | 'viewer';
  actionUrl?: string;
}

export async function sendCollaborationInviteEmail(payload: InviteEmailPayload): Promise<{ success: boolean; message: string }> {
  const serviceId = process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID || '';
  const templateId = process.env.NEXT_PUBLIC_EMAILJS_INVITE_TEMPLATE_ID || process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID || '';
  const publicKey = process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY || '';

  if (!serviceId || !publicKey || !templateId) {
    return { success: false, message: 'EmailJS credentials (service ID, template ID, or public key) are missing.' };
  }

  const subject = `🤝 Collaboration Invite: You've been invited to "${payload.projectName}"`;

  const detailsHtml = `
    <div style="background: rgba(255, 255, 255, 0.04); border-left: 3px solid #6366f1; border-radius: 6px; padding: 14px 16px; margin: 12px 0;">
      <div style="font-weight: 600; font-size: 15px; color: #ffffff;">Project: ${payload.projectName}</div>
      <div style="font-size: 13px; color: #cbd5e1; margin-top: 6px; line-height: 1.5;">
        <strong>${payload.inviterName}</strong> has invited you to collaborate on this project as an <strong>${payload.role === 'editor' ? 'Editor' : 'Viewer'}</strong>.
      </div>
      <div style="font-size: 12px; color: #94a3b8; margin-top: 8px; line-height: 1.4;">
        Sign in or create an account with this email address to view milestones, track tasks, and collaborate in real-time.
      </div>
    </div>
  `;

  const templateParams = {
    to_name: payload.toName || payload.toEmail.split('@')[0],
    to_email: payload.toEmail,
    overload_summary: subject,
    overload_details_html: detailsHtml,
    action_url: payload.actionUrl || (typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000'),
    date_string: new Date().toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  };

  try {
    const res = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        service_id: serviceId,
        template_id: templateId,
        user_id: publicKey,
        template_params: templateParams
      })
    });

    if (res.ok) {
      return { success: true, message: 'Invitation email sent successfully.' };
    } else {
      const errText = await res.text();
      return { success: false, message: `EmailJS error: ${errText}` };
    }
  } catch (error: any) {
    return { success: false, message: error.message || 'Failed to send invite email.' };
  }
}

