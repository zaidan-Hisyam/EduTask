import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import {
  BookOpen, Mail, Lock, User, GraduationCap, Users,
  Eye, EyeOff, Loader2, AlertCircle, CheckCircle, School,
} from 'lucide-react';

type Role = 'student' | 'teacher';

export default function Register() {
  const navigate = useNavigate();
  const [nama, setNama] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [kelas, setKelas] = useState('');
  const [role, setRole] = useState<Role>('student');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 6) { setError('Password minimal 6 karakter'); return; }
    setLoading(true);
    setError('');
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { nama, role, kelas: role === 'student' ? kelas : null } },
    });
    if (error) { setError(error.message); setLoading(false); return; }
    setSuccess(true);
    setTimeout(() => navigate('/login'), 2500);
    setLoading(false);
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4" style={{ background: 'var(--bg-base)' }}>
        <div className="card text-center animate-scale-in" style={{ maxWidth: '22rem', padding: '2.5rem' }}>
          <div className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4"
            style={{ background: 'var(--green-soft)' }}>
            <CheckCircle size={28} style={{ color: 'var(--green)' }} />
          </div>
          <h2 className="text-lg font-bold mb-2">Akun Berhasil Dibuat!</h2>
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
            Silakan cek email untuk konfirmasi, lalu masuk ke akun Anda.
          </p>
          <p className="text-xs mt-3" style={{ color: 'var(--text-subtle)' }}>
            Mengalihkan ke halaman login...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: 'var(--bg-base)' }}>
      {/* Ambient glows */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 right-1/3 w-64 h-64 rounded-full blur-3xl opacity-15"
          style={{ background: 'radial-gradient(circle, #7c3aed, transparent)' }} />
        <div className="absolute bottom-1/4 left-1/3 w-72 h-72 rounded-full blur-3xl opacity-15"
          style={{ background: 'radial-gradient(circle, #6366f1, transparent)' }} />
      </div>

      <div className="w-full max-w-sm animate-fade-in relative">
        {/* Logo */}
        <div className="text-center mb-7">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center mx-auto mb-4 shadow-lg"
            style={{ boxShadow: '0 8px 30px rgba(99,102,241,0.35)' }}>
            <BookOpen size={26} className="text-white" />
          </div>
          <h1 className="text-2xl font-extrabold gradient-text tracking-tight">EduTask</h1>
          <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>Daftar Akun Baru</p>
        </div>

        <div className="card" style={{ background: 'var(--bg-card)', padding: '2rem' }}>
          <h2 className="text-lg font-bold mb-5">Buat Akun</h2>

          {/* Role selector */}
          <div className="grid grid-cols-2 gap-2.5 mb-5">
            {(['student', 'teacher'] as Role[]).map(r => (
              <button
                key={r}
                type="button"
                onClick={() => setRole(r)}
                className="rounded-xl p-3 border-2 transition-all text-left"
                style={{
                  borderColor: role === r ? 'var(--accent)' : 'var(--border)',
                  background: role === r ? 'var(--accent-soft)' : 'var(--bg-surface)',
                }}
              >
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center mb-2"
                  style={{ background: role === r ? 'rgba(99,102,241,0.25)' : 'rgba(255,255,255,0.05)' }}
                >
                  {r === 'teacher'
                    ? <GraduationCap size={16} style={{ color: role === r ? 'var(--accent-light)' : 'var(--text-muted)' }} />
                    : <Users size={16} style={{ color: role === r ? 'var(--accent-light)' : 'var(--text-muted)' }} />
                  }
                </div>
                <p className="font-semibold text-sm" style={{ color: role === r ? 'var(--text-heading)' : 'var(--text-muted)' }}>
                  {r === 'teacher' ? 'Guru' : 'Siswa'}
                </p>
                <p className="text-xs mt-0.5" style={{ color: 'var(--text-subtle)' }}>
                  {r === 'teacher' ? 'Kelola tugas' : 'Kumpulkan tugas'}
                </p>
              </button>
            ))}
          </div>

          {error && (
            <div className="alert alert-error mb-4 text-sm">
              <AlertCircle size={15} className="shrink-0" />
              {error}
            </div>
          )}

          <form onSubmit={handleRegister} className="space-y-4">
            <div>
              <label className="label">Nama Lengkap</label>
              <div className="input-wrapper">
                <span className="input-icon"><User size={16} /></span>
                <input type="text" className="input-field input-icon-left" placeholder="Nama lengkap"
                  value={nama} onChange={e => setNama(e.target.value)} required />
              </div>
            </div>

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
                  placeholder="Min. 6 karakter" value={password} onChange={e => setPassword(e.target.value)} required />
                <button type="button" onClick={() => setShowPass(!showPass)} className="input-icon-right">
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {role === 'student' && (
              <div>
                <label className="label">Kelas</label>
                <div className="input-wrapper">
                  <span className="input-icon"><School size={16} /></span>
                  <input type="text" className="input-field input-icon-left" placeholder="Contoh: X IPA 1"
                    value={kelas} onChange={e => setKelas(e.target.value)} required />
                </div>
              </div>
            )}

            <button type="submit" className="btn-primary w-full justify-center"
              style={{ marginTop: '0.75rem', height: '2.875rem', fontSize: '0.9375rem' }}
              disabled={loading}>
              {loading && <Loader2 size={15} className="animate-spin" />}
              {loading ? 'Mendaftar...' : 'Daftar Sekarang'}
            </button>
          </form>

          <p className="text-center text-sm mt-5" style={{ color: 'var(--text-muted)' }}>
            Sudah punya akun?{' '}
            <Link to="/login" className="font-semibold transition-colors" style={{ color: 'var(--accent-light)' }}>
              Masuk di sini
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
