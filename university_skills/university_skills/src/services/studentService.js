import { supabase } from '../lib/supabase'
import { invalidateStudentDashboardCache, invalidateAdminDashboardCache } from '../utils/dashboardCache'

export async function getStudentStats(userId) {
  const [skills, projects, certificates, rating] = await Promise.all([
    supabase.from('skills').select('*', { count: 'exact', head: true }).eq('user_id', userId),
    supabase.from('projects').select('*', { count: 'exact', head: true }).eq('user_id', userId),
    supabase.from('certificates').select('*', { count: 'exact', head: true }).eq('user_id', userId),
    supabase.from('ratings').select('rating').eq('user_id', userId).maybeSingle(),
  ])

  return {
    totalSkills: skills.count ?? 0,
    totalProjects: projects.count ?? 0,
    totalCertificates: certificates.count ?? 0,
    rating: rating.data?.rating ?? null,
  }
}

export async function updateProfile(userId, payload) {
  const res = await supabase.from('users').update(payload).eq('id', userId).select().single()
  invalidateStudentDashboardCache()
  invalidateAdminDashboardCache()
  return res
}

export async function listByUser(table, userId) {
  return supabase.from(table).select('*').eq('user_id', userId).order('created_at', { ascending: false })
}

export async function createItem(table, payload) {
  const res = await supabase.from(table).insert(payload).select().single()
  invalidateStudentDashboardCache()
  invalidateAdminDashboardCache()
  return res
}

export async function updateItem(table, id, payload) {
  const res = await supabase.from(table).update(payload).eq('id', id).select().single()
  invalidateStudentDashboardCache()
  invalidateAdminDashboardCache()
  return res
}

export async function deleteItem(table, id) {
  const res = await supabase.from(table).delete().eq('id', id)
  invalidateStudentDashboardCache()
  invalidateAdminDashboardCache()
  return res
}

export async function listFeedbackForStudent(userId) {
  return supabase
    .from('feedback')
    .select('id,message,created_at,admin_id,users!feedback_admin_id_fkey(name,email)')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
}

export async function listActiveOpportunities() {
  return supabase.from('opportunities').select('*').order('created_at', { ascending: false })
}

export async function listMyApplications(userId) {
  return supabase
    .from('applications')
    .select('*, opportunities(title, description)')
    .eq('student_id', userId)
    .order('created_at', { ascending: false })
}

export async function applyToOpportunity(opportunityId, userId) {
  const res = await supabase.from('applications').insert({
    opportunity_id: opportunityId,
    student_id: userId,
    status: 'pending'
  }).select().single()
  invalidateStudentDashboardCache()
  invalidateAdminDashboardCache()
  return res
}
