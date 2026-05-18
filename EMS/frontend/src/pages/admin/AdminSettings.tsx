import { useState } from 'react';
import { Settings, Globe, Shield, Bell, Users, Save } from 'lucide-react';
import { PageHeader } from '../../components/common/UIComponents';
import { motion } from 'framer-motion';

export default function AdminSettings() {
  const [settings, setSettings] = useState({
    platformName: 'VoteSphere', supportEmail: 'support@votesphere.com', maxVoters: 10000,
    require2FA: false, requireEmailVerification: true, enableWaitlist: true,
    enableFraudDetection: true, enableAuditLogs: true, maintenanceMode: false,
    allowPublicResults: true, sessionTimeout: 120, maxLoginAttempts: 5,
  });
  const [saved, setSaved] = useState(false);
  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setSettings(s => ({ ...s, [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.type === 'number' ? +e.target.value : e.target.value }));
  const handleSave = () => { setSaved(true); setTimeout(() => setSaved(false), 2500); };

  const Toggle = ({ label, desc, settingKey }: { label: string; desc: string; settingKey: keyof typeof settings }) => (
    <div className="flex items-center justify-between p-4 bg-muted/30 rounded-xl">
      <div>
        <p className="font-semibold text-sm">{label}</p>
        <p className="text-xs text-muted-foreground">{desc}</p>
      </div>
      <button onClick={() => setSettings(s => ({ ...s, [settingKey]: !s[settingKey] }))}
        className={`relative w-11 h-6 rounded-full transition-colors ${settings[settingKey] ? 'bg-primary' : 'bg-muted'}`}>
        <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${settings[settingKey] ? 'translate-x-5' : ''}`} />
      </button>
    </div>
  );

  return (
    <div className="space-y-6">
      <PageHeader title="Platform Settings" subtitle="Configure VoteSphere platform-wide preferences." breadcrumbs={[{ label: 'Admin' }, { label: 'Settings' }]}
        actions={
          <button onClick={handleSave} className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-primary to-secondary text-white font-bold rounded-xl text-sm hover:opacity-90 transition-all">
            <Save size={15} /> {saved ? 'Saved!' : 'Save Changes'}
          </button>
        }
      />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-card border border-border rounded-2xl p-6 space-y-4">
          <div className="flex items-center gap-2 mb-2"><Globe size={18} className="text-primary" /><h3 className="font-bold">General Settings</h3></div>
          {[['Platform Name', 'platformName', 'text'], ['Support Email', 'supportEmail', 'email'], ['Max Voters per Election', 'maxVoters', 'number'], ['Session Timeout (min)', 'sessionTimeout', 'number'], ['Max Login Attempts', 'maxLoginAttempts', 'number']].map(([label, key, type]) => (
            <div key={key}>
              <label className="text-xs font-bold uppercase tracking-wide text-muted-foreground mb-1 block">{label}</label>
              <input type={type} value={settings[key as keyof typeof settings] as string} onChange={set(key)}
                className="w-full px-3 py-2.5 border border-border rounded-xl text-sm bg-muted/30 focus:outline-none focus:ring-2 focus:ring-primary/30" />
            </div>
          ))}
        </div>
        <div className="bg-card border border-border rounded-2xl p-6 space-y-3">
          <div className="flex items-center gap-2 mb-2"><Shield size={18} className="text-primary" /><h3 className="font-bold">Security & Features</h3></div>
          <Toggle label="Require 2FA" desc="Enforce two-factor authentication for all users" settingKey="require2FA" />
          <Toggle label="Email Verification" desc="Require email verification on signup" settingKey="requireEmailVerification" />
          <Toggle label="Fraud Detection" desc="AI-powered suspicious activity monitoring" settingKey="enableFraudDetection" />
          <Toggle label="Audit Logging" desc="Log all user actions immutably" settingKey="enableAuditLogs" />
          <Toggle label="Waitlist System" desc="Enable waitlists when elections reach capacity" settingKey="enableWaitlist" />
          <Toggle label="Public Results" desc="Show results on public landing page" settingKey="allowPublicResults" />
          <Toggle label="Maintenance Mode" desc="Take platform offline for maintenance" settingKey="maintenanceMode" />
        </div>
      </div>
    </div>
  );
}
