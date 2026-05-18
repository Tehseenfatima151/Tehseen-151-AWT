import { useState } from 'react';
import { Camera, Save, Shield, Key } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { PageHeader } from '../../components/common/UIComponents';

export default function AdminProfile() {
  const { user, updateUser } = useAuthStore();
  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    updateUser({ name, phone });
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Admin Profile" subtitle="Manage your account information and security settings." breadcrumbs={[{ label: 'Admin' }, { label: 'Profile' }]} />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-card border border-border rounded-2xl p-6 flex flex-col items-center text-center">
          <div className="relative mb-4">
            <img src={user?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.name}`} alt={user?.name} className="w-24 h-24 rounded-full border-4 border-primary/30" />
            <button className="absolute bottom-0 right-0 w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center hover:opacity-90 transition-all shadow-lg">
              <Camera size={14} />
            </button>
          </div>
          <h3 className="font-bold text-lg">{user?.name}</h3>
          <p className="text-sm text-muted-foreground">{user?.email}</p>
          <span className="mt-2 px-3 py-1 bg-primary/10 text-primary text-xs font-black rounded-full uppercase tracking-wide">Super Admin</span>
          <div className="mt-4 w-full space-y-2 text-sm">
            <div className="flex justify-between p-2 bg-muted/50 rounded-lg">
              <span className="text-muted-foreground font-medium">Email Verified</span>
              <span className="text-emerald-600 font-bold">✓ Yes</span>
            </div>
            <div className="flex justify-between p-2 bg-muted/50 rounded-lg">
              <span className="text-muted-foreground font-medium">2FA Enabled</span>
              <span className={`font-bold ${user?.is2FAEnabled ? 'text-emerald-600' : 'text-red-500'}`}>{user?.is2FAEnabled ? '✓ Yes' : '✗ No'}</span>
            </div>
            <div className="flex justify-between p-2 bg-muted/50 rounded-lg">
              <span className="text-muted-foreground font-medium">Member Since</span>
              <span className="font-bold">{user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : '—'}</span>
            </div>
          </div>
        </div>
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-card border border-border rounded-2xl p-6 space-y-4">
            <h3 className="font-bold flex items-center gap-2"><Shield size={18} className="text-primary" /> Account Information</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[['Full Name', name, setName, 'text'], ['Email Address', user?.email || '', null, 'email'], ['Phone', phone, setPhone, 'text'], ['Organization', user?.organization || 'VoteSphere Inc.', null, 'text']].map(([label, val, setter, type]) => (
                <div key={label as string}>
                  <label className="text-xs font-bold uppercase tracking-wide text-muted-foreground mb-1 block">{label as string}</label>
                  <input type={type as string} value={val as string} onChange={setter ? (e: React.ChangeEvent<HTMLInputElement>) => (setter as (v: string) => void)(e.target.value) : undefined} readOnly={!setter}
                    className={`w-full px-3 py-2.5 border border-border rounded-xl text-sm transition-all ${setter ? 'bg-muted/30 focus:outline-none focus:ring-2 focus:ring-primary/30' : 'bg-muted/10 text-muted-foreground cursor-not-allowed'}`} />
                </div>
              ))}
            </div>
            <button onClick={handleSave} className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-primary to-secondary text-white font-bold rounded-xl text-sm hover:opacity-90 transition-all">
              <Save size={15} /> {saved ? 'Saved!' : 'Save Changes'}
            </button>
          </div>
          <div className="bg-card border border-border rounded-2xl p-6">
            <h3 className="font-bold flex items-center gap-2 mb-4"><Key size={18} className="text-primary" /> Change Password</h3>
            <div className="space-y-3">
              {['Current Password', 'New Password', 'Confirm New Password'].map(label => (
                <div key={label}>
                  <label className="text-xs font-bold uppercase tracking-wide text-muted-foreground mb-1 block">{label}</label>
                  <input type="password" placeholder="••••••••" className="w-full px-3 py-2.5 border border-border rounded-xl text-sm bg-muted/30 focus:outline-none focus:ring-2 focus:ring-primary/30" />
                </div>
              ))}
              <button className="px-5 py-2.5 border border-border text-foreground font-bold rounded-xl text-sm hover:bg-muted transition-all">Update Password</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
