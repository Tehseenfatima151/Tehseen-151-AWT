/**
 * Calculate the profile completion percentage and generate suggestions for missing items.
 * 
 * Weights:
 * - Profile Picture: 15%
 * - Bio: 15%
 * - Education: 15%
 * - Skills: 15%
 * - Projects: 15%
 * - Certificates: 10%
 * - Experience: 10%
 * - Social Links: 5% (either GitHub or LinkedIn present)
 * Total: 100%
 */
export function calculateProfileCompletion({
  profile,
  education = [],
  skills = [],
  projects = [],
  certificates = [],
  experience = []
}) {
  let score = 0
  const suggestions = []

  // 1. Profile Picture (15%)
  if (profile?.profile_picture) {
    score += 15
  } else {
    suggestions.push({
      section: 'profile_picture',
      text: 'Upload a professional profile picture',
      link: '/student/settings'
    })
  }

  // 2. Bio (15%)
  if (profile?.bio && profile.bio.trim().length > 5) {
    score += 15
  } else {
    suggestions.push({
      section: 'bio',
      text: 'Add a professional bio summarizing your career goals',
      link: '/student/settings'
    })
  }

  // 3. Education (15%)
  if (education && education.length > 0) {
    score += 15
  } else {
    suggestions.push({
      section: 'education',
      text: 'Add your academic qualifications',
      link: '/student/profile'
    })
  }

  // 4. Skills (15%)
  if (skills && skills.length > 0) {
    score += 15
  } else {
    suggestions.push({
      section: 'skills',
      text: 'Add at least one technical or professional skill',
      link: '/student/skills'
    })
  }

  // 5. Projects (15%)
  if (projects && projects.length > 0) {
    score += 15
  } else {
    suggestions.push({
      section: 'projects',
      text: 'Add a project to showcase your practical work',
      link: '/student/projects'
    })
  }

  // 6. Certificates (10%)
  if (certificates && certificates.length > 0) {
    score += 10
  } else {
    suggestions.push({
      section: 'certificates',
      text: 'Add certificates to verify your accomplishments',
      link: '/student/certificates'
    })
  }

  // 7. Experience (10%)
  if (experience && experience.length > 0) {
    score += 10
  } else {
    suggestions.push({
      section: 'experience',
      text: 'Add work experience or academic role',
      link: '/student/profile'
    })
  }

  // 8. Social Links (5%)
  if (profile?.github_url || profile?.linkedin_url) {
    score += 5
  } else {
    suggestions.push({
      section: 'social',
      text: 'Connect your LinkedIn or GitHub profile link',
      link: '/student/settings'
    })
  }

  return {
    percentage: score,
    suggestions
  }
}
