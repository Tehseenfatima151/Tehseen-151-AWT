const supabase = require('../config/supabase');

const isNonEmptyString = (v) => typeof v === 'string' && v.trim().length > 0;
const isValidSemester = (v) => {
  if (v === undefined || v === null || v === '') return false;
  const n = Number(v);
  return Number.isFinite(n) && n >= 1 && n <= 10;
};

const isSupabaseNotFound = (err) => {
  // PostgREST commonly returns PGRST116 for `.single()` when no rows are found.
  return err?.code === 'PGRST116' || String(err?.message || '').toLowerCase().includes('0 rows');
};

exports.getMe = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('students')
      .select('id, name, email, department, semester, profile_picture')
      .eq('id', req.user.id)
      .single();

    if (error) {
      if (isSupabaseNotFound(error)) return res.status(404).json({ message: 'Student not found' });
      throw error;
    }
    res.status(200).json(data);
  } catch (err) {
    res.status(isSupabaseNotFound(err) ? 404 : 500).json({ message: err.message || 'Server error' });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const { name, department, semester, profile_picture } = req.body;

    if (!name && !department && semester === undefined && profile_picture === undefined) {
      return res.status(400).json({ message: 'No update fields provided' });
    }

    if (name !== undefined && !isNonEmptyString(name)) {
      return res.status(400).json({ message: 'name must be a non-empty string' });
    }
    if (department !== undefined && !isNonEmptyString(department)) {
      return res.status(400).json({ message: 'department must be a non-empty string' });
    }
    if (semester !== undefined && !isValidSemester(semester)) {
      return res.status(400).json({ message: 'semester must be an integer between 1 and 10' });
    }
    if (profile_picture !== undefined && typeof profile_picture !== 'string') {
      return res.status(400).json({ message: 'profile_picture must be a string URL' });
    }
    
    const updates = {};
    if (name) updates.name = name.trim();
    if (department) updates.department = department.trim();
    if (semester !== undefined) updates.semester = Number(semester);
    if (profile_picture !== undefined) updates.profile_picture = profile_picture;

    const { data, error } = await supabase
      .from('students')
      .update(updates)
      .eq('id', req.user.id)
      .select('id, name, email, department, semester, profile_picture')
      .single();

    if (error) {
      if (isSupabaseNotFound(error)) return res.status(404).json({ message: 'Student not found' });
      throw error;
    }
    res.status(200).json(data);
  } catch (err) {
    res.status(isSupabaseNotFound(err) ? 404 : 500).json({ message: err.message || 'Server error' });
  }
};

exports.getPublicProfile = async (req, res) => {
  try {
    const studentId = req.params.id;

    if (!studentId) {
      return res.status(400).json({ message: 'id is required' });
    }
    
    const { data: student, error: studentError } = await supabase
      .from('students')
      .select('id, name, email, department, semester, profile_picture')
      .eq('id', studentId)
      .single();

    if (studentError) {
      if (isSupabaseNotFound(studentError)) return res.status(404).json({ message: 'Profile not found' });
      throw studentError;
    }

    const [{ data: skills, error: skillsError }, { data: projects, error: projectsError }, { data: certificates, error: certError }] = await Promise.all([
      supabase.from('skills').select('*').eq('student_id', studentId),
      supabase.from('projects').select('*').eq('student_id', studentId),
      supabase.from('certificates').select('*').eq('student_id', studentId)
    ]);

    if (skillsError) throw skillsError;
    if (projectsError) throw projectsError;
    if (certError) throw certError;

    res.status(200).json({
      ...student,
      skills: skills || [],
      projects: projects || [],
      certificates: certificates || []
    });
  } catch (err) {
    res.status(isSupabaseNotFound(err) ? 404 : 500).json({ message: err.message || 'Profile not found' });
  }
};
