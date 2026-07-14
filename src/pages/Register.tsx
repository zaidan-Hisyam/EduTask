import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import { BookOpen, Mail, Lock, User, GraduationCap, Users, Eye, EyeOff, Loader2, AlertCircle, CheckCircle } from 'lucide-react';

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
    setLoading(true);
    setError('');

    if (password.length < 6) {
      setError('Password minimal 6 karakter');
      setLoading(false);
      return;
    }

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { nama, role, kelas: role === 'student' ? kelas : null },
      },
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    setSuccess(true);
    setTimeout(() => navigate('/login'), 2500);
    setLoading(false);
  };

  if (success) {
    return (
      <div className="min-h-screen bg-[#0f172a] flex items-center justify-center p-4">
        <div className="glass rounded-2xl p-10 text-center max-w-sm w-full animate-fade-in">
          <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="text-green-400" size={32} />
          </div>
          <h2 className="text-xl font-bold text-white mb-2">Akun Berhasil Dibuat!</h2>
          <p className="text-slate-400 text-sm">Silakan cek email untuk konfirmasi, lalu masuk ke akun Anda.</p>
          <p className="text-slate-500 text-xs mt-3">Mengalihkan ke halaman login...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0f172a] flex items-center justify-center p-4">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 right-1/4 w-64 h-64 bg-purple-600/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 left-1/4 w-80 h-80 bg-indigo-600/10 rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-md animate-fade-in">
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-indigo-500/30">
            <BookOpen size={30} className="text-white" />
          </div>
          <h1 className="text-3xl font-bold gradient-text">EduTask</h1>
          <p className="text-slate-400 text-sm mt-1">Daftar Akun Baru</p>
        </div>

        <div className="glass rounded-2xl p-8 shadow-xl">
          <h2 className="text-xl font-bold text-white mb-6">Buat Akun</h2>

          {/* Role selector */}
          <div className="grid grid-cols-2 gap-3 mb-5">
            {(['student', 'teacher'] as Role[]).map(r => (
              <button
                key={r}
                type="button"
                onClick={() => setRole(r)}
                className={`rounded-xl p-3 border-2 transition-all text-left ${
                  role === r
                    ? 'border-indigo-500 bg-indigo-500/10'
                    : 'border-slate-700 bg-slate-800/50 hover:border-slate-600'
                }`}
              >
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center mb-2 ${
                  role === r ? 'bg-indigo-500/30' : 'bg-slate-700'
                }`}>
                  {r === 'teacher'
                    ? <GraduationCap size={16} className={role === r ? 'text-indigo-300' : 'text-slate-400'} />
                    : <Users size={16} className={role === r ? 'text-indigo-300' : 'text-slate-400'} />
                  }
                </div>
                <p className={`font-semibold text-sm ${role === r ? 'text-white' : 'text-slate-400'}`}>
                  {r === 'teacher' ? 'Guru' : 'Siswa'}
                </p>
                <p className="text-xs text-slate-500">{r === 'teacher' ? 'Kelola tugas' : 'Kumpulkan tugas'}</p>
              </button>
            ))}
          </div>

          {error && (
            <div className="flex items-center gap-2 text-red-400 text-sm bg-red-500/10 rounded-lg px-4 py-3 border border-red-500/20 mb-4">
              <AlertCircle size={16} />
              {error}
            </div>
          )}

          <form onSubmit={handleRegister} className="space-y-4">
            <div>
              <label className="label">Nama Lengkap</label>
              <div className="relative">
                <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="text"
                  className="input-field pl-10"
                  placeholder="Nama lengkap"
                  value={nama}
                  onChange={e => setNama(e.target.value)}
                  required
                />
              </div>
            </div>

            <div>
              <label className="label">Email</label>
              <div className="relative">
                <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="email"
                  className="input-field pl-10"
                  placeholder="nama@email.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div>
              <label className="label">Password</label>
              <div className="relative">
                <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type={showPass ? 'text' : 'password'}
                  className="input-field pl-10 pr-10"
                  placeholder="Min. 6 karakter"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                >
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {role === 'student' && (
              <div>
                <label className="label">Kelas</label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="Contoh: X IPA 1"
                  value={kelas}
                  onChange={e => setKelas(e.target.value)}
                  required
                />
              </div>
            )}

            <button type="submit" className="btn-primary w-full justify-center mt-2" disabled={loading}>
              {loading && <Loader2 size={16} className="animate-spin" />}
              {loading ? 'Mendaftar...' : 'Daftar Sekarang'}
            </button>
          </form>

          <p className="text-center text-slate-400 text-sm mt-6">
            Sudah punya akun?{' '}
            <Link to="/login" className="text-indigo-400 hover:text-indigo-300 font-semibold transition-colors">
              Masuk di sini
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
