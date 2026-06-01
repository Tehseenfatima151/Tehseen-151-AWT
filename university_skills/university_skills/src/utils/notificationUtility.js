import { supabase } from '../lib/supabase'

/**
 * Resolves priority and metadata for a notification based on its type and message content.
 */
export function getNotificationMetadata(notif, portal = 'student') {
  const type = notif.type || 'system'
  const message = notif.message || ''
  const title = notif.title || ''
  const isAdmin = portal === 'admin'
  
  let category = 'System Announcement'
  let priority = 'normal' // default
  let badgeColor = 'bg-blue-500/10 text-blue-400 border-blue-500/20'
  let priorityColor = 'bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.6)]'
  let action = null

  // 1. Map type to categories and set basic options
  switch (type) {
    case 'opportunity':
      category = 'Opportunity'
      // TODAY deadline — check title OR message for highest-priority signal
      if (title.includes('TODAY') || message.includes('TODAY') || message.includes('is TODAY')) {
        priority = 'high'
        badgeColor = 'bg-red-500/10 text-red-400 border-red-500/20'
        priorityColor = 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.6)]'
      } else if (message.includes('tomorrow') || message.includes('3 days')) {
        priority = 'medium'
        badgeColor = 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'
        priorityColor = 'bg-yellow-500 shadow-[0_0_8px_rgba(234,179,8,0.6)]'
      } else if (message.includes('7 days')) {
        priority = 'normal'
        badgeColor = 'bg-blue-500/10 text-blue-400 border-blue-500/20'
        priorityColor = 'bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.6)]'
      } else {
        priority = 'normal'
        badgeColor = 'bg-sky-500/10 text-sky-400 border-sky-500/20'
        priorityColor = 'bg-sky-500 shadow-[0_0_8px_rgba(14,165,233,0.6)]'
      }
      action = { label: 'View Opportunity', path: isAdmin ? '/admin/opportunities' : '/student/opportunities' }
      break

    case 'application':
      category = 'Application'
      priority = 'high'
      badgeColor = 'bg-red-500/10 text-red-400 border-red-500/20'
      priorityColor = 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.6)]'
      action = { label: 'View Application Status', path: isAdmin ? '/admin/applications' : '/student/applications' }
      break

    case 'status_change':
      category = 'Application Status'
      priority = 'high'
      badgeColor = 'bg-red-500/10 text-red-400 border-red-500/20'
      priorityColor = 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.6)]'
      action = { label: 'View Application Status', path: isAdmin ? '/admin/applications' : '/student/applications' }
      break

    case 'feedback':
      category = 'Feedback & Rating'
      priority = 'medium'
      badgeColor = 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'
      priorityColor = 'bg-yellow-500 shadow-[0_0_8px_rgba(234,179,8,0.6)]'
      action = { label: 'View Feedback', path: isAdmin ? '/admin/feedback' : '/student/profile' }
      break

    case 'badge':
      category = 'Verification Badge'
      priority = 'high'
      badgeColor = 'bg-red-500/10 text-red-400 border-red-500/20'
      priorityColor = 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.6)]'
      action = { label: isAdmin ? 'Manage Students' : 'Go to Portfolio', path: isAdmin ? '/admin/students' : '/student/profile' }
      break

    case 'system':
    default:
      category = 'System Announcement'
      priority = 'normal'
      badgeColor = 'bg-blue-500/10 text-blue-400 border-blue-500/20'
      priorityColor = 'bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.6)]'
      break
  }

  return {
    category,
    priority,
    badgeColor,
    priorityColor,
    action
  }
}

/**
 * Checks all active opportunities and generates client-side deadline warning notifications for a student.
 */
export async function generateDeadlineWarningsClient(studentId) {
  if (!studentId) return

  try {
    // 1. Fetch active opportunities (opportunities with deadline >= today)
    const todayStr = new Date().toISOString().split('T')[0]
    const { data: opportunities, error: oppsError } = await supabase
      .from('opportunities')
      .select('*')
      .gte('deadline', todayStr)

    if (oppsError || !opportunities) return

    // 2. Fetch student's existing applications (to prevent prompting for already-applied opportunities)
    const { data: applications, error: appsError } = await supabase
      .from('applications')
      .select('opportunity_id')
      .eq('student_id', studentId)

    if (appsError || !applications) return
    const appliedOppIds = new Set(applications.map(app => app.opportunity_id))

    // 3. Fetch student's recent warnings in the last 24h to avoid duplicate inserts
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
    const { data: recentNotifs, error: notifError } = await supabase
      .from('notifications')
      .select('message')
      .eq('user_id', studentId)
      .eq('type', 'opportunity')
      .gte('created_at', yesterday)

    if (notifError || !recentNotifs) return
    const recentNotifMsgs = recentNotifs.map(n => n.message)

    // Helper functions for checking deadline
    const getDaysDiff = (deadlineStr) => {
      const deadline = new Date(deadlineStr)
      const today = new Date()
      // Reset hours to compare dates only
      deadline.setHours(0, 0, 0, 0)
      today.setHours(0, 0, 0, 0)
      
      const diffTime = deadline.getTime() - today.getTime()
      return Math.round(diffTime / (1000 * 60 * 60 * 24))
    }

    const notificationsToInsert = []

    for (const opp of opportunities) {
      // Skip if student already applied
      if (appliedOppIds.has(opp.id)) continue

      const diffDays = getDaysDiff(opp.deadline)
      let alertMsg = ''
      
      if (diffDays === 0) {
        alertMsg = `The deadline for opportunity "${opp.title}" is TODAY! Apply soon before it closes.`
      } else if (diffDays === 1) {
        alertMsg = `The deadline for opportunity "${opp.title}" is tomorrow! Apply soon before it closes.`
      } else if (diffDays === 3) {
        alertMsg = `The deadline for opportunity "${opp.title}" is in 3 days. Apply soon!`
      } else if (diffDays === 7) {
        alertMsg = `The deadline for opportunity "${opp.title}" is in 7 days. Apply soon!`
      }

      // If we have a warning and we haven't sent a similar notification recently
      if (alertMsg && !recentNotifMsgs.some(msg => msg.includes(opp.title) && msg.includes(alertMsg.split('is')[1]))) {
        notificationsToInsert.push({
          user_id: studentId,
          title: 'Upcoming Application Deadline',
          message: alertMsg,
          type: 'opportunity',
          is_read: false
        })
      }
    }

    // 4. Batch insert new notifications
    if (notificationsToInsert.length > 0) {
      await supabase.from('notifications').insert(notificationsToInsert)
    }
  } catch (err) {
    console.error('Error generating client side deadline warnings:', err)
  }
}
