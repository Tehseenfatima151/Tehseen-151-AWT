import { Outlet, Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  BarChart3, 
  Users, 
  ShieldAlert, 
  Settings, 
  HelpCircle, 
  LogOut,
  Bell
} from 'lucide-react';

export default function DashboardLayout() {
  const location = useLocation();

  const navigation = [
    { name: 'Overview', href: '/admin/dashboard', icon: LayoutDashboard },
    { name: 'Analytics', href: '/admin/analytics', icon: BarChart3 },
    { name: 'User Management', href: '/admin/users', icon: Users },
    { name: 'Security Logs', href: '/admin/security', icon: ShieldAlert },
    { name: 'System Settings', href: '/admin/settings', icon: Settings },
  ];

  return (
    <div className="bg-background font-body-md text-foreground min-h-screen flex selection:bg-primary-fixed-dim selection:text-on-primary-fixed">
      {/* SideNavBar */}
      <aside className="h-screen w-64 fixed left-0 top-0 hidden md:flex flex-col bg-surface-container-low border-r border-border shadow-md z-40 p-2 gap-2">
        <div className="px-4 py-6 mb-4">
          <h1 className="font-headline-md text-2xl font-bold text-primary">ElectorShield</h1>
          <p className="font-label-sm text-xs uppercase tracking-widest text-muted-foreground mt-1">Control Center</p>
        </div>
        
        <nav className="flex-1 space-y-1 px-2">
          {navigation.map((item) => {
            const isActive = location.pathname === item.href;
            return (
              <Link
                key={item.name}
                to={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 active:scale-95 ${
                  isActive 
                    ? 'bg-gradient-to-br from-primary to-secondary text-primary-foreground shadow-lg shadow-primary/20' 
                    : 'text-muted-foreground hover:bg-surface-container-high hover:translate-x-1'
                }`}
              >
                <item.icon size={20} className={isActive ? "text-primary-foreground" : ""} />
                <span className="font-label-sm text-xs uppercase tracking-widest font-semibold">{item.name}</span>
              </Link>
            );
          })}
        </nav>

        <div className="mt-auto px-4 py-4 border-t border-border">
          <button className="w-full py-3 mb-4 rounded-xl bg-gradient-to-br from-primary to-secondary text-primary-foreground font-label-sm text-xs font-bold uppercase tracking-widest shadow-md transition-transform active:scale-95">
            New Security Audit
          </button>
          <div className="space-y-1">
            <Link to="/help" className="flex items-center gap-3 px-2 py-2 text-muted-foreground hover:text-primary transition-colors">
              <HelpCircle size={18} />
              <span className="font-label-sm text-sm font-semibold">Help Center</span>
            </Link>
            <Link to="/login" className="flex items-center gap-3 px-2 py-2 text-destructive hover:opacity-80 transition-opacity">
              <LogOut size={18} />
              <span className="font-label-sm text-sm font-semibold">Sign Out</span>
            </Link>
          </div>
        </div>
      </aside>

      {/* Main Stage */}
      <main className="flex-1 md:ml-64 min-h-screen flex flex-col">
        {/* Top Header Area */}
        <header className="flex justify-between items-center p-4 md:p-10 border-b border-border/40 bg-background/50 backdrop-blur-sm sticky top-0 z-30">
          <div>
            <h2 className="font-display-lg text-2xl md:text-3xl font-bold text-primary tracking-tighter">System Health</h2>
            <p className="text-muted-foreground font-body-md">Monitoring global election integrity across 12 nodes.</p>
          </div>
          <div className="flex items-center gap-4">
            <button className="p-2 rounded-lg hover:bg-primary/5 text-muted-foreground transition-colors relative">
              <Bell size={24} />
              <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-destructive rounded-full border-2 border-background"></span>
            </button>
            <div className="flex items-center gap-3 bg-card p-1 pr-4 rounded-full border border-border cursor-pointer hover:border-primary/50 transition-colors">
              <img 
                alt="Admin" 
                className="w-10 h-10 rounded-full object-cover" 
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuCym-YaQn3RUWcVhHkaYiBoWPkUiIpkPJQCXW56G56MmzTC5I4y5LW2RwcHsfzcsIPMsQOM5IW9eH8NXP9aTU36ZTrIEKtC9-ygPn1VN8Q345itutprOFopPtF8PBY2oaeEZJiN7nBo_i0ZB1FHunT5JF2e38ee-PKX33bwi0Er-uIVxZFBBRXwDyixrH2svgkJpOK37mxlCCgk7r5JsJxUgHeIljPq5MAwBvytuHn8CBV9cxCIUPdVbaYU4QwXmUsYGiYlmv-VIwk"
              />
              <div className="hidden sm:block">
                <p className="font-label-sm text-sm font-bold text-foreground">Alex Chen</p>
                <p className="text-[10px] uppercase tracking-tighter text-muted-foreground font-semibold">Super Admin Access</p>
              </div>
            </div>
          </div>
        </header>

        <div className="flex-1 p-4 md:p-10 pb-20 md:pb-10">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
