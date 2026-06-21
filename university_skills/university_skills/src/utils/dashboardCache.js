let studentDashboardCache = null
let adminDashboardCache = null

// Registry of subscribers to notify when cache is updated or invalidated
const subscribers = new Set()

export function subscribeToCache(callback) {
  subscribers.add(callback)
  return () => subscribers.delete(callback)
}

function notifySubscribers(type, data) {
  subscribers.forEach(cb => cb(type, data))
}

export function getCachedStudentDashboard(userId) {
  if (studentDashboardCache && studentDashboardCache.userId === userId) {
    return studentDashboardCache.data
  }
  return null
}

export function setCachedStudentDashboard(userId, data) {
  studentDashboardCache = { userId, data }
  notifySubscribers('student_updated', data)
}

export function invalidateStudentDashboardCache() {
  studentDashboardCache = null
  notifySubscribers('student_invalidated', null)
}

export function getCachedAdminDashboard() {
  if (adminDashboardCache) {
    return adminDashboardCache.data
  }
  return null
}

export function setCachedAdminDashboard(data) {
  adminDashboardCache = { data }
  notifySubscribers('admin_updated', data)
}

export function invalidateAdminDashboardCache() {
  adminDashboardCache = null
  notifySubscribers('admin_invalidated', null)
}
