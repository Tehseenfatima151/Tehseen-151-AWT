const supabase = require('../config/supabase');

const isNonEmptyString = (v) => typeof v === 'string' && v.trim().length > 0;
const allowedSkillLevels = new Set(['Beginner', 'Intermediate', 'Expert']);
const isSupabaseNotFound = (err) => {
  return err?.code === 'PGRST116' || String(err?.message || '').toLowerCase().includes('0 rows');
};

exports.getSkills = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('skills')
      .select('*')
      .eq('student_id', req.user.id);

    if (error) throw error;
    res.status(200).json(data);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.addSkill = async (req, res) => {
  try {
    const { skill_name, skill_level } = req.body;

    if (!isNonEmptyString(skill_name)) {
      return res.status(400).json({ message: 'skill_name is required' });
    }
    if (!isNonEmptyString(skill_level)) {
      return res.status(400).json({ message: 'skill_level is required' });
    }
    if (!allowedSkillLevels.has(skill_level.trim())) {
      return res.status(400).json({ message: 'skill_level must be Beginner, Intermediate, or Expert' });
    }

    const { data, error } = await supabase
      .from('skills')
      .insert([{ student_id: req.user.id, skill_name: skill_name.trim(), skill_level: skill_level.trim() }])
      .select()
      .single();

    if (error) throw error;
    res.status(201).json(data);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updateSkill = async (req, res) => {
  try {
    if (!req.params.id) {
      return res.status(400).json({ message: 'id is required' });
    }

    const { skill_name, skill_level } = req.body;

    if (!isNonEmptyString(skill_name)) {
      return res.status(400).json({ message: 'skill_name is required' });
    }
    if (!isNonEmptyString(skill_level)) {
      return res.status(400).json({ message: 'skill_level is required' });
    }
    if (!allowedSkillLevels.has(skill_level.trim())) {
      return res.status(400).json({ message: 'skill_level must be Beginner, Intermediate, or Expert' });
    }

    const { data, error } = await supabase
      .from('skills')
      .update({ skill_name: skill_name.trim(), skill_level: skill_level.trim() })
      .eq('id', req.params.id)
      .eq('student_id', req.user.id)
      .select()
      .single();

    if (error) throw error;
    res.status(200).json(data);
  } catch (err) {
    res.status(isSupabaseNotFound(err) ? 404 : 500).json({ message: err.message || 'Server error' });
  }
};

exports.deleteSkill = async (req, res) => {
  try {
    if (!req.params.id) {
      return res.status(400).json({ message: 'id is required' });
    }

    const { data: skill, error: fetchError } = await supabase
      .from('skills')
      .select('id')
      .eq('id', req.params.id)
      .eq('student_id', req.user.id)
      .maybeSingle();

    if (fetchError) throw fetchError;
    if (!skill) return res.status(404).json({ message: 'Skill not found' });

    const { error: deleteError } = await supabase
      .from('skills')
      .delete()
      .eq('id', req.params.id)
      .eq('student_id', req.user.id);

    if (deleteError) throw deleteError;
    res.status(200).json({ message: 'Skill deleted successfully' });
  } catch (err) {
    res.status(isSupabaseNotFound(err) ? 404 : 500).json({ message: err.message || 'Server error' });
  }
};
