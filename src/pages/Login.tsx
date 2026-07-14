import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import { BookOpen, Mail, Lock, Eye, EyeOff, Loader2, AlertCircle } from 'lucide-react';

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) { setError('Email atau password salah'); setLoading(false); return; }
    if (data.user) {
      const { data: profile } = await supabase
        .from('profiles').select('role').eq('id', data.user.id).single();
      if (profile?.role === 'teacher') navigate('/teacher/dashboard');
      else navigate('/student/dashboard');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: 'var(--bg-base)' }}>
      {/* Ambient glows */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/3 left-1/3 w-72 h-72 rounded-full blur-3xl opacity-20"
          style={{ background: 'radial-gradient(circle, #6366f1, transparent)' }} />
        <div className="absolute bottom-1/4 right-1/3 w-64 h-64 rounded-full blur-3xl opacity-15"
          style={{ background: 'radial-gradient(circle, #7c3aed, transparent)' }} />
      </div>

      <div className="w-full max-w-sm animate-fade-in relative">
        {/* Logo */}
        <div className="text-center mb-7">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center mx-auto mb-4 shadow-lg"
            style={{ boxShadow: '0 8px 30px rgba(99,102,241,0.35)' }}>
            <BookOpen size={26} className="text-white" />
          </div>
          <h1 className="text-2xl font-extrabold gradient-text tracking-tight">EduTask</h1>
          <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>Sistem Pengumpulan Tugas</p>
        </div>

        {/* Card */}
        <div className="card" style={{ background: 'var(--bg-card)', padding: '2rem' }}>
          <h2 className="text-lg font-bold mb-5">Masuk ke Akun</h2>

          {error && (
            <div className="alert alert-error mb-4 text-sm">
              <AlertCircle size={15} className="shrink-0" />
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="label">Email</label>
              <div className="input-wrapper">
                <span className="input-icon"><Mail size={16} /></span>
                <input type="email" className="input-field input-icon-left" placeholder="nama@email.com"
                  value={email} onChange={e => setEmail(e.target.value)} required />
              </div>
            </div>

            <div>
              <label className="label">Password</label>
              <div className="input-wrapper">
                <span className="input-icon"><Lock size={16} /></span>
                <input type={showPass ? 'text' : 'password'} className="input-field input-icon-left"
                  style={{ paddingRight: '2.75rem' }}
                  placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} required />
                <button type="button" onClick={() => setShowPass(!showPass)} className="input-icon-right">
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button type="submit" className="btn-primary w-full justify-center"
              style={{ marginTop: '0.75rem', height: '2.875rem', fontSize: '0.9375rem' }}
              disabled={loading}>
              {loading && <Loader2 size={15} className="animate-spin" />}
              {loading ? 'Masuk...' : 'Masuk'}
            </button>
          </form>

          <p className="text-center text-sm mt-5" style={{ color: 'var(--text-muted)' }}>
            Belum punya akun?{' '}
            <Link to="/register" className="font-semibold transition-colors"
              style={{ color: 'var(--accent-light)' }}>
              Daftar di sini
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
