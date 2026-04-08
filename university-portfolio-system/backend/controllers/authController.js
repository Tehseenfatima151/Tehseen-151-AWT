const supabase = require('../config/supabase');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_jwt_key_here';
const BCRYPT_SALT_ROUNDS = Number(process.env.BCRYPT_SALT_ROUNDS || 10);

exports.signup = async (req, res) => {
  try {
    const { name, email, password, department, semester } = req.body;

    if (!name || !email || !password || !department || semester === undefined) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    if (typeof email !== 'string' || !email.includes('@')) {
      return res.status(400).json({ message: 'Invalid email address' });
    }

    if (typeof password !== 'string' || password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }

    if (Number.isNaN(Number(semester)) || Number(semester) < 1) {
      return res.status(400).json({ message: 'Semester must be a positive number' });
    }
    
    // Check if user exists
    const { data: existingUser, error: existingUserError } = await supabase
      .from('students')
      .select('id')
      .eq('email', email)
      .maybeSingle();

    if (existingUserError) throw existingUserError;
      
    if (existingUser) {
      return res.status(409).json({ message: 'User already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, BCRYPT_SALT_ROUNDS);

    const { data, error } = await supabase
      .from('students')
      .insert([
        { name, email, password: hashedPassword, department, semester }
      ])
      .select('id, name, email')
      .single();

    if (error) throw error;

    const payload = { id: data.id };
    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });

    res.status(201).json({ token, user: data });
  } catch (err) {
    console.error(err);
    // Postgres unique violation
    if (err?.code === '23505') {
      return res.status(409).json({ message: 'User already exists' });
    }
    res.status(500).json({ message: err.message || 'Server error' });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    if (typeof email !== 'string' || !email.includes('@')) {
      return res.status(400).json({ message: 'Invalid email address' });
    }

    const { data: user, error } = await supabase
      .from('students')
      .select('*')
      .eq('email', email)
      .single();

    if (!user || error) return res.status(401).json({ message: 'Invalid credentials' });

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) return res.status(401).json({ message: 'Invalid credentials' });

    const payload = { id: user.id };
    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });

    delete user.password;
    res.status(200).json({ token, user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};
