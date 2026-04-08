const supabase = require('../config/supabase');

const isNonEmptyString = (v) => typeof v === 'string' && v.trim().length > 0;

const isValidUrl = (v) => {
  if (!isNonEmptyString(v)) return false;
  try {
    const url = new URL(v);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
};

const isSupabaseNotFound = (err) => {
  return err?.code === 'PGRST116' || String(err?.message || '').toLowerCase().includes('0 rows');
};

exports.getProjects = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .eq('student_id', req.user.id);

    if (error) throw error;
    res.status(200).json(data);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.addProject = async (req, res) => {
  try {
    const { title, description, tech_used, github_link } = req.body;

    if (!isNonEmptyString(title)) return res.status(400).json({ message: 'title is required' });
    if (!isNonEmptyString(description)) return res.status(400).json({ message: 'description is required' });
    if (!isNonEmptyString(tech_used)) return res.status(400).json({ message: 'tech_used is required' });
    if (github_link !== undefined && github_link !== null && github_link !== '') {
      if (!isValidUrl(github_link)) return res.status(400).json({ message: 'github_link must be a valid URL' });
    }

    const { data, error } = await supabase
      .from('projects')
      .insert([{
        student_id: req.user.id,
        title: title.trim(),
        description: description.trim(),
        tech_used: tech_used.trim(),
        github_link: github_link ? github_link.trim() : null
      }])
      .select()
      .single();

    if (error) throw error;
    res.status(201).json(data);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updateProject = async (req, res) => {
  try {
    if (!req.params.id) {
      return res.status(400).json({ message: 'id is required' });
    }

    const { title, description, tech_used, github_link } = req.body;

    if (!isNonEmptyString(title)) return res.status(400).json({ message: 'title is required' });
    if (!isNonEmptyString(description)) return res.status(400).json({ message: 'description is required' });
    if (!isNonEmptyString(tech_used)) return res.status(400).json({ message: 'tech_used is required' });
    if (github_link !== undefined && github_link !== null && github_link !== '') {
      if (!isValidUrl(github_link)) return res.status(400).json({ message: 'github_link must be a valid URL' });
    }

    const { data, error } = await supabase
      .from('projects')
      .update({
        title: title.trim(),
        description: description.trim(),
        tech_used: tech_used.trim(),
        github_link: github_link ? github_link.trim() : null
      })
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

exports.deleteProject = async (req, res) => {
  try {
    if (!req.params.id) {
      return res.status(400).json({ message: 'id is required' });
    }

    const { data: project, error: fetchError } = await supabase
      .from('projects')
      .select('id')
      .eq('id', req.params.id)
      .eq('student_id', req.user.id)
      .maybeSingle();

    if (fetchError) throw fetchError;
    if (!project) return res.status(404).json({ message: 'Project not found' });

    const { error: deleteError } = await supabase
      .from('projects')
      .delete()
      .eq('id', req.params.id)
      .eq('student_id', req.user.id);

    if (deleteError) throw deleteError;
    res.status(200).json({ message: 'Project deleted successfully' });
  } catch (err) {
    res.status(isSupabaseNotFound(err) ? 404 : 500).json({ message: err.message || 'Server error' });
  }
};
