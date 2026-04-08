import { useState, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import { User, Mail, GraduationCap, Building, Camera, Save } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Profile() {
  const { user, updateUser } = useAuth();
  const [formData, setFormData] = useState({
    name: user?.name || '',
    department: user?.department || '',
    semester: user?.semester || ''
  });
  const [profilePic, setProfilePic] = useState(null);
  const fileInputRef = useRef(null);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const res = await api.put('/students/me', formData);
      updateUser(res.data);
      toast.success('Profile updated successfully');
    } catch (err) { toast.error('Failed to update profile'); }
  };

  const handlePictureChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const data = new FormData();
    data.append('file', file);

    try {
      const toastId = toast.loading('Uploading picture...');
      const res = await api.post('/certificates/profile-picture', data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      updateUser({ profile_picture: res.data.profile_picture });
      toast.success('Profile picture updated', { id: toastId });
    } catch (err) { toast.error('Failed to update picture'); }
  };

  return (
    <div className="py-8 animate-fade-in max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold text-slate-900 mb-8">Profile Settings</h1>

      <div className="card space-y-8 relative overflow-hidden">
        {/* Cover graphic */}
        <div className="absolute top-0 inset-x-0 h-32 bg-gradient-to-r from-primary-600 to-purple-600"></div>

        <div className="relative pt-12 flex flex-col md:flex-row gap-8 items-start md:items-center">
          
          <div className="relative group">
            <div className="w-32 h-32 rounded-full border-4 border-white overflow-hidden bg-slate-100 shadow-xl">
              {user?.profile_picture ? (
                <img src={user.profile_picture} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-slate-400">
                  <User className="w-12 h-12" />
                </div>
              )}
            </div>
            <button 
              onClick={() => fileInputRef.current?.click()}
              className="absolute bottom-0 right-0 p-3 bg-slate-900 text-white rounded-full shadow-lg hover:bg-slate-800 transition-colors group-hover:scale-110"
            >
              <Camera className="w-4 h-4" />
            </button>
            <input type="file" ref={fileInputRef} onChange={handlePictureChange} className="hidden" accept="image/*" />
          </div>

          <div>
            <h2 className="text-2xl font-bold text-slate-800">{user?.name}</h2>
            <p className="text-slate-500 font-medium flex items-center gap-2 mt-1"><Mail className="w-4 h-4"/> {user?.email}</p>
          </div>
        </div>

        <div className="border-t border-slate-100 pt-8">
          <form onSubmit={handleUpdate} className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700 ml-1">Full Name</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-slate-400" />
                </div>
                <input name="name" type="text" className="input-field pl-11 bg-slate-50" value={formData.name} onChange={handleChange} required />
              </div>
            </div>

            <div className="space-y-2">
               <label className="text-sm font-semibold text-slate-700 ml-1">Email <span className="text-slate-400 font-normal">(Read Only)</span></label>
               <input type="email" className="input-field bg-slate-100 cursor-not-allowed text-slate-500" value={user?.email || ''} readOnly />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700 ml-1">Department</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Building className="h-5 w-5 text-slate-400" />
                </div>
                <input name="department" type="text" className="input-field pl-11 bg-slate-50" value={formData.department} onChange={handleChange} required />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700 ml-1">Semester</label>
               <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <GraduationCap className="h-5 w-5 text-slate-400" />
                </div>
                <input name="semester" type="number" min="1" max="10" className="input-field pl-11 bg-slate-50" value={formData.semester} onChange={handleChange} required />
              </div>
            </div>

            <div className="md:col-span-2 pt-4">
               <button type="submit" className="btn-primary flex items-center gap-2 ml-auto">
                 <Save className="w-5 h-5"/> Save Changes
               </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
