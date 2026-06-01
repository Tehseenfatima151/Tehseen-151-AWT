import { supabase, supabaseAdmin } from '../lib/supabase'

// Use supabaseAdmin if available (bypasses RLS for admin operations)
// Falls back to regular supabase client if service key not set
const adminDb = supabaseAdmin ?? supabase

export async function getAdminStats() {
  const [students, skills, projects, certificates, feedback, ratings, services, education, experience] = await Promise.all([
    supabase.from('users').select('*', { count: 'exact', head: true }).eq('role', 'student'),
    supabase.from('skills').select('*', { count: 'exact', head: true }),
    supabase.from('projects').select('*', { count: 'exact', head: true }),
    supabase.from('certificates').select('*', { count: 'exact', head: true }),
    supabase.from('feedback').select('*', { count: 'exact', head: true }),
    supabase.from('ratings').select('*', { count: 'exact', head: true }),
    supabase.from('services').select('*', { count: 'exact', head: true }),
    supabase.from('education').select('*', { count: 'exact', head: true }),
    supabase.from('experience').select('*', { count: 'exact', head: true }),
  ])
  return {
    students: students.count ?? 0,
    skills: skills.count ?? 0,
    projects: projects.count ?? 0,
    certificates: certificates.count ?? 0,
    feedback: feedback.count ?? 0,
    ratings: ratings.count ?? 0,
    services: services.count ?? 0,
    education: education.count ?? 0,
    experience: experience.count ?? 0,
  }
}

export async function listStudents() {
  return supabase.from('users').select('*, skills(skill_name, skill_level)').eq('role', 'student').order('created_at', { ascending: false })
}

export async function createStudentAccount({ email, password, name, department, semester }) {
  if (!supabaseAdmin) {
    throw new Error('Missing VITE_SUPABASE_SERVICE_ROLE_KEY')
  }
  const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { role: 'student', is_admin_created: true },
  })
  if (authError) throw authError

  const { error: profileError } = await supabaseAdmin.from('users').insert({
    id: authData.user.id,
    name,
    email,
    role: 'student',
    department,
    semester,
    is_approved: true,
  })
  if (profileError) throw profileError
}

export async function deleteStudent(userId) {
  if (!supabaseAdmin) throw new Error('Missing VITE_SUPABASE_SERVICE_ROLE_KEY')
  await supabase.from('users').delete().eq('id', userId)
  await supabaseAdmin.auth.admin.deleteUser(userId)
}

export async function listModerationData(table) {
  return supabase.from(table).select('*, users(name,email)').order('created_at', { ascending: false })
}

export async function getStudentPortfolio(userId) {
  const [user, skills, projects, certificates, rating, feedback, education, experience, services] = await Promise.all([
    supabase.from('users').select('*').eq('id', userId).single(),
    supabase.from('skills').select('*').eq('user_id', userId).order('created_at', { ascending: false }),
    supabase.from('projects').select('*').eq('user_id', userId).order('created_at', { ascending: false }),
    supabase.from('certificates').select('*').eq('user_id', userId).order('created_at', { ascending: false }),
    supabase.from('ratings').select('rating').eq('user_id', userId).maybeSingle(),
    supabase.from('feedback').select('id,message,created_at,admin_id').eq('user_id', userId).order('created_at', { ascending: false }),
    supabase.from('education').select('*').eq('user_id', userId).order('created_at', { ascending: false }),
    supabase.from('experience').select('*').eq('user_id', userId).order('created_at', { ascending: false }),
    supabase.from('services').select('*').eq('user_id', userId).order('created_at', { ascending: false }),
  ])

  return {
    user: user.data,
    skills: skills.data ?? [],
    projects: projects.data ?? [],
    certificates: certificates.data ?? [],
    education: education.data ?? [],
    experience: experience.data ?? [],
    services: services.data ?? [],
    rating: rating.data?.rating ?? null,
    feedback: feedback.data ?? [],
    errors: [user.error, skills.error, projects.error, certificates.error, rating.error, feedback.error, education.error, experience.error, services.error].filter(Boolean),
  }
}

export async function upsertStudentRating(userId, rating) {
  return supabase.from('ratings').upsert({ user_id: userId, rating }, { onConflict: 'user_id' }).select().single()
}

export async function addFeedback({ userId, adminId, message }) {
  return supabase.from('feedback').insert({ user_id: userId, admin_id: adminId, message }).select().single()
}

export async function listLeaderboard(limit = 20) {
  return supabase
    .from('ratings')
    .select('user_id,rating,created_at,users(name,email,department,semester)')
    .order('rating', { ascending: false })
    .order('created_at', { ascending: true })
    .limit(limit)
}

/** All feedback rows for admin dashboard (student + admin names). */
export async function listAllFeedback() {
  return supabase
    .from('feedback')
    .select(
      'id,message,created_at,user_id,admin_id,student:users!feedback_user_id_fkey(name,email),admin_user:users!feedback_admin_id_fkey(name,email)',
    )
    .order('created_at', { ascending: false })
}

// Opportunity Management — uses adminDb to bypass RLS deadlocks
export async function listOpportunities() {
  return adminDb.from('opportunities').select('*, users!opportunities_created_by_fkey(name)').order('created_at', { ascending: false })
}

export async function createOpportunity(payload) {
  return adminDb.from('opportunities').insert([payload]).select()
}

export async function updateOpportunity(id, payload) {
  return adminDb.from('opportunities').update(payload).eq('id', id).select()
}

export async function deleteOpportunity(id) {
  return adminDb.from('opportunities').delete().eq('id', id)
}

// Application Management — uses adminDb to bypass RLS deadlocks
export async function listApplications() {
  return adminDb
    .from('applications')
    .select('*, opportunities(title, deadline), user:users!applications_student_id_fkey(name, email)')
    .order('created_at', { ascending: false })
}

export async function updateApplicationStatus(id, status) {
  return adminDb.from('applications').update({ status }).eq('id', id).select()
}

export async function updateStudentAdminFields(userId, payload) {
  if (payload.is_approved === true && supabaseAdmin) {
    try {
      await supabaseAdmin.auth.admin.updateUserById(userId, { email_confirm: true })
    } catch (err) {
      console.error('Failed to confirm email in auth admin:', err)
    }
  }
  return supabase.from('users').update(payload).eq('id', userId).select().single()
}
