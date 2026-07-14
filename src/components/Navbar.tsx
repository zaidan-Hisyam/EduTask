import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogOut, BookOpen, GraduationCap, LayoutDashboard } from 'lucide-react';

export default function Navbar() {
  const { profile, signOut } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut();
    navigate('/login');
  };

  const dashboardLink = profile?.role === 'teacher' ? '/teacher/dashboard' : '/student/dashboard';

  return (
    <nav className="glass sticky top-0 z-50 px-6 py-3 flex items-center justify-between shadow-lg">
      <Link to={dashboardLink} className="flex items-center gap-2.5 text-white font-bold text-lg">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
          <BookOpen size={16} />
        </div>
        <span className="gradient-text">EduTask</span>
      </Link>

      <div className="flex items-center gap-3">
        <Link
          to={dashboardLink}
          className="flex items-center gap-1.5 text-slate-400 hover:text-white transition-colors text-sm font-medium"
        >
          <LayoutDashboard size={15} />
          Dashboard
        </Link>

        <div className="flex items-center gap-2 bg-slate-800/60 rounded-full px-3 py-1.5 border border-indigo-500/20">
          <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
            profile?.role === 'teacher'
              ? 'bg-indigo-500/30 text-indigo-300'
              : 'bg-green-500/30 text-green-300'
          }`}>
            {profile?.role === 'teacher' ? <GraduationCap size={13} /> : profile?.nama?.[0]?.toUpperCase()}
          </div>
          <div className="flex flex-col leading-none">
            <span className="text-white text-xs font-semibold">{profile?.nama}</span>
            <span className={`text-[10px] font-medium capitalize ${
              profile?.role === 'teacher' ? 'text-indigo-400' : 'text-green-400'
            }`}>
              {profile?.role === 'teacher' ? 'Guru' : `Siswa • ${profile?.kelas || ''}`}
            </span>
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="btn-danger !py-1.5 !px-3 text-xs"
          title="Logout"
        >
          <LogOut size={14} />
          Keluar
        </button>
      </div>
    </nav>
  );
}
