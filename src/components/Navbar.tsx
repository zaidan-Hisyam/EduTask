import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogOut, BookOpen, GraduationCap, LayoutDashboard, User } from 'lucide-react';

export default function Navbar() {
  const { profile, signOut } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut();
    navigate('/login');
  };

  const dashboardLink = profile?.role === 'teacher' ? '/teacher/dashboard' : '/student/dashboard';
  const isTeacher = profile?.role === 'teacher';

  return (
    <nav className="glass-nav sticky top-0 z-40 px-5 py-0 h-14 flex items-center justify-between">
      {/* Logo */}
      <Link to={dashboardLink} className="flex items-center gap-2.5 shrink-0">
        <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-sm">
          <BookOpen size={13} className="text-white" />
        </div>
        <span className="font-extrabold text-base gradient-text tracking-tight">EduTask</span>
      </Link>

      {/* Nav right */}
      <div className="flex items-center gap-2">
        <Link
          to={dashboardLink}
          className="btn-ghost hidden sm:inline-flex"
        >
          <LayoutDashboard size={14} />
          Dashboard
        </Link>

        {/* User pill */}
        <div className="flex items-center gap-2 rounded-full px-2.5 py-1 border"
          style={{ borderColor: 'var(--border)', background: 'var(--bg-card)' }}>
          <div
            className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
            style={{
              background: isTeacher ? 'rgba(99,102,241,0.2)' : 'rgba(34,197,94,0.2)',
              color: isTeacher ? '#818cf8' : '#22c55e',
            }}
          >
            {isTeacher ? <GraduationCap size={13} /> : <User size={12} />}
          </div>
          <div className="hidden sm:block leading-none">
            <p className="text-xs font-semibold" style={{ color: 'var(--text-heading)' }}>
              {profile?.nama}
            </p>
            <p className="text-[10px] font-medium" style={{ color: isTeacher ? '#818cf8' : '#22c55e' }}>
              {isTeacher ? 'Guru' : `Siswa · ${profile?.kelas ?? ''}`}
            </p>
          </div>
        </div>

        <button onClick={handleLogout} className="btn-danger !py-1.5 !px-2.5 !text-xs">
          <LogOut size={13} />
          <span className="hidden sm:inline">Keluar</span>
        </button>
      </div>
    </nav>
  );
}
