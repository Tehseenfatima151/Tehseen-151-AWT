import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, Mail, Lock, User, GraduationCap, Building } from 'lucide-react';

export default function Signup() {
  const [formData, setFormData] = useState({
    name: '', email: '', password: '', department: '', semester: ''
  });
  const { signup } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    const success = await signup(formData);
    if (success) navigate('/');
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden bg-slate-50 py-12">
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary-200/50 rounded-full mix-blend-multiply filter blur-3xl opacity-70"></div>
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-purple-200/50 rounded-full mix-blend-multiply filter blur-3xl opacity-70"></div>
      
      <div className="w-full max-w-xl relative z-10">
        <div className="glass p-8 md:p-10 rounded-3xl animate-fade-in shadow-2xl relative">
          <div className="absolute inset-0 bg-gradient-to-br from-white/40 to-white/10 pointer-events-none rounded-3xl"></div>
          
          <div className="text-center mb-10 relative z-10">
            <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary-600 to-purple-600">Create Account</h1>
            <p className="text-slate-500 mt-2 font-medium">Start building your university portfolio</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700 ml-1">Full Name</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-slate-400" />
                  </div>
                  <input
                    name="name" type="text" className="input-field pl-11" placeholder="John Doe"
                    onChange={handleChange} required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700 ml-1">Email</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-slate-400" />
                  </div>
                  <input
                    name="email" type="email" className="input-field pl-11" placeholder="you@university.edu"
                    onChange={handleChange} required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700 ml-1">Department</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Building className="h-5 w-5 text-slate-400" />
                  </div>
                  <input
                    name="department" type="text" className="input-field pl-11" placeholder="Computer Science"
                    onChange={handleChange} required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700 ml-1">Semester</label>
                 <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <GraduationCap className="h-5 w-5 text-slate-400" />
                  </div>
                  <input
                    name="semester" type="number" min="1" max="10" className="input-field pl-11" placeholder="1"
                    onChange={handleChange} required
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700 ml-1">Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  name="password" type="password" className="input-field pl-11" placeholder="••••••••"
                  onChange={handleChange} required minLength="6"
                />
              </div>
            </div>

            <button type="submit" className="btn-primary w-full group mt-4">
              Create Account <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
          </form>

          <p className="mt-8 text-center text-slate-600 font-medium relative z-10">
            Already have an account?{' '}
            <Link to="/login" className="text-primary-600 hover:text-primary-700 font-semibold hover:underline decoration-2 underline-offset-4 transition-all">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
