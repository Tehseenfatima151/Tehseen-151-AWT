import { useAuth } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { LogOut, LayoutDashboard, User, Share2 } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleCopyLink = () => {
    navigator.clipboard.writeText(`${window.location.origin}/portfolio/${user?.id}`);
    toast.success('Public portfolio link copied!');
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="fixed top-0 inset-x-0 z-50 glass border-b-0 border-white/40">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg shadow-md">
              P
            </div>
            <span className="font-bold text-xl bg-clip-text text-transparent bg-gradient-to-r from-slate-800 to-slate-600">Portfolio</span>
          </Link>
          
          <div className="flex items-center gap-4">
            <button onClick={handleCopyLink} className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-slate-600 hover:text-primary-600 hover:bg-primary-50 transition-colors border border-transparent hover:border-primary-100">
              <Share2 className="w-4 h-4" /> <span className="hidden sm:inline">Share Profile</span>
            </button>
            <Link to="/" className="p-2 rounded-lg text-slate-600 hover:text-primary-600 hover:bg-primary-50 transition-colors">
              <LayoutDashboard className="w-5 h-5" />
            </Link>
            <Link to="/profile" className="p-2 rounded-lg text-slate-600 hover:text-primary-600 hover:bg-primary-50 transition-colors">
              <User className="w-5 h-5" />
            </Link>
            <button onClick={handleLogout} className="p-2 rounded-lg text-rose-600 hover:bg-rose-50 transition-colors">
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
