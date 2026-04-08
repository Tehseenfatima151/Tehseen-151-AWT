const supabase = require('../config/supabase');

const isNonEmptyString = (v) => typeof v === 'string' && v.trim().length > 0;
const isValidDateString = (v) => {
  // Expect YYYY-MM-DD (what HTML date input sends)
  if (!isNonEmptyString(v)) return false;
  return /^\d{4}-\d{2}-\d{2}$/.test(v.trim());
};

const STORAGE_BUCKET = process.env.SUPABASE_STORAGE_BUCKET || 'portfolio-files';

const extractStorageRefFromPublicUrl = (publicUrl) => {
  if (!publicUrl || typeof publicUrl !== 'string') return null;
  try {
    const url = new URL(publicUrl);
    // Example pathname:
    // /storage/v1/object/public/<bucket>/<objectPath...>
    const parts = url.pathname.split('/').filter(Boolean);
    const publicIdx = parts.indexOf('public');
    if (publicIdx === -1) return null;
    const bucket = parts[publicIdx + 1];
    const objectPath = parts.slice(publicIdx + 2).join('/');
    if (!bucket || !objectPath) return null;
    return { bucket, objectPath };
  } catch {
    return null;
  }
};

const isSupabaseNotFound = (err) => {
  return err?.code === 'PGRST116' || String(err?.message || '').toLowerCase().includes('0 rows');
};

exports.getCertificates = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('certificates')
      .select('*')
      .eq('student_id', req.user.id);

    if (error) throw error;
    res.status(200).json(data);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.addCertificate = async (req, res) => {
  try {
    const { certificate_name, issue_date } = req.body;

    if (!isNonEmptyString(certificate_name)) {
      return res.status(400).json({ message: 'certificate_name is required' });
    }
    if (!isValidDateString(issue_date)) {
      return res.status(400).json({ message: 'issue_date must be in YYYY-MM-DD format' });
    }

    if (!req.file) {
      return res.status(400).json({ message: 'Certificate file is required' });
    }

    let file_url = '';

    if (req.file) {
      const fileBuffer = req.file.buffer;
      const fileName = `${req.user.id}/${Date.now()}-${req.file.originalname.replace(/[^a-zA-Z0-9.]/g, '_')}`;

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from(STORAGE_BUCKET)
        .upload(fileName, fileBuffer, {
          contentType: req.file.mimetype,
          upsert: false
        });

      if (uploadError) throw uploadError;

      const { data: publicUrlData } = supabase.storage
        .from(STORAGE_BUCKET)
        .getPublicUrl(fileName);
        
      file_url = publicUrlData.publicUrl;
    }

    const { data, error } = await supabase
      .from('certificates')
      .insert([{
        student_id: req.user.id,
        certificate_name: certificate_name.trim(),
        issue_date: issue_date.trim(),
        file_url
      }])
      .select()
      .single();

    if (error) throw error;
    res.status(201).json(data);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.deleteCertificate = async (req, res) => {
  try {
    if (!req.params.id) {
      return res.status(400).json({ message: 'id is required' });
    }

    // Fetch the existing storage URL so we can delete the old object too.
    const { data: cert, error: certFetchError } = await supabase
      .from('certificates')
      .select('file_url')
      .eq('id', req.params.id)
      .eq('student_id', req.user.id)
      .maybeSingle();

    if (certFetchError) throw certFetchError;
    if (!cert) return res.status(404).json({ message: 'Certificate not found' });

    if (cert.file_url) {
      const storageRef = extractStorageRefFromPublicUrl(cert.file_url);
      if (storageRef?.objectPath) {
        const { error: removeError } = await supabase.storage
          .from(storageRef.bucket)
          .remove([storageRef.objectPath]);

        if (removeError) {
          // Best-effort cleanup: don't block deleting the certificate record.
          console.error('Failed to delete old certificate file:', removeError);
        }
      }
    }

    const { error: deleteError } = await supabase
      .from('certificates')
      .delete()
      .eq('id', req.params.id)
      .eq('student_id', req.user.id);

    if (deleteError) throw deleteError;

    res.status(200).json({ message: 'Certificate deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updateCertificate = async (req, res) => {
  try {
    if (!req.params.id) {
      return res.status(400).json({ message: 'id is required' });
    }

    const { certificate_name, issue_date } = req.body;

    if (!isNonEmptyString(certificate_name)) {
      return res.status(400).json({ message: 'certificate_name is required' });
    }
    if (!isValidDateString(issue_date)) {
      return res.status(400).json({ message: 'issue_date must be in YYYY-MM-DD format' });
    }

    let file_url;
    if (req.file) {
      const fileBuffer = req.file.buffer;
      const fileName = `${req.user.id}/${Date.now()}-${req.file.originalname.replace(/[^a-zA-Z0-9.]/g, '_')}`;

      const { error: uploadError } = await supabase.storage
        .from(STORAGE_BUCKET)
        .upload(fileName, fileBuffer, {
          contentType: req.file.mimetype,
          upsert: false
        });

      if (uploadError) throw uploadError;

      const { data: publicUrlData } = supabase.storage
        .from(STORAGE_BUCKET)
        .getPublicUrl(fileName);

      file_url = publicUrlData.publicUrl;
    }

    const updatePayload = {
      certificate_name: certificate_name.trim(),
      issue_date: issue_date.trim()
    };

    if (file_url) updatePayload.file_url = file_url;

    const { data, error } = await supabase
      .from('certificates')
      .update(updatePayload)
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

exports.uploadProfilePicture = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const fileBuffer = req.file.buffer;
    const fileName = `${req.user.id}/profile-${Date.now()}.${req.file.mimetype.split('/')[1]}`;

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from(STORAGE_BUCKET)
      .upload(fileName, fileBuffer, {
        contentType: req.file.mimetype,
        upsert: true
      });

    if (uploadError) throw uploadError;

    const { data: publicUrlData } = supabase.storage
      .from(STORAGE_BUCKET)
      .getPublicUrl(fileName);

    const profile_picture = publicUrlData.publicUrl;

    const { data, error } = await supabase
      .from('students')
      .update({ profile_picture })
      .eq('id', req.user.id)
      .select('id, name, email, department, semester, profile_picture')
      .single();

    if (error) throw error;

    res.status(200).json({ profile_picture: data.profile_picture, user: data });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
