import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabaseClient';
import { useAuth } from '../../context/AuthContext';
import Navbar from '../../components/Navbar';
import { ArrowLeft, BookOpen, Calendar, FileText, Loader2, CheckCircle, AlertCircle } from 'lucide-react';

export default function CreateTask() {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const [judul, setJudul] = useState('');
  const [deskripsi, setDeskripsi] = useState('');
  const [deadline, setDeadline] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const minDate = new Date();
  minDate.setDate(minDate.getDate() + 1);
  const minDateStr = minDate.toISOString().slice(0, 16);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (!profile?.id) {
      setError('Sesi tidak valid. Silakan login ulang.');
      setLoading(false);
      return;
    }

    const { error } = await supabase.from('tugas').insert({
      judul,
      deskripsi,
      deadline: new Date(deadline).toISOString(),
      created_by: profile.id,
    });

    if (error) {
      setError('Gagal membuat tugas: ' + error.message);
      setLoading(false);
      return;
    }

    setSuccess(true);
    setTimeout(() => navigate('/teacher/dashboard'), 1800);
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#0f172a]">
      <Navbar />
      <main className="max-w-2xl mx-auto px-4 py-8">
        <button
          onClick={() => navigate('/teacher/dashboard')}
          className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors text-sm mb-6"
        >
          <ArrowLeft size={16} />
          Kembali ke Dashboard
        </button>

        <div className="card animate-fade-in">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/20 flex items-center justify-center">
              <BookOpen className="text-indigo-400" size={20} />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">Buat Tugas Baru</h1>
              <p className="text-slate-400 text-xs">Isi detail tugas untuk siswa</p>
            </div>
          </div>

          {error && (
            <div className="flex items-center gap-2 text-red-400 text-sm bg-red-500/10 rounded-lg px-4 py-3 border border-red-500/20 mb-4">
              <AlertCircle size={16} />
              {error}
            </div>
          )}

          {success && (
            <div className="flex items-center gap-2 text-green-400 text-sm bg-green-500/10 rounded-lg px-4 py-3 border border-green-500/20 mb-4">
              <CheckCircle size={16} />
              Tugas berhasil dibuat! Mengalihkan...
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="label">Judul Tugas</label>
              <div className="relative">
                <FileText size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="text"
                  className="input-field pl-10"
                  placeholder="Contoh: Tugas Matematika Bab 3"
                  value={judul}
                  onChange={e => setJudul(e.target.value)}
                  required
                  maxLength={100}
                />
              </div>
            </div>

            <div>
              <label className="label">Deskripsi / Instruksi</label>
              <textarea
                className="input-field resize-none"
                placeholder="Tuliskan instruksi tugas secara jelas..."
                value={deskripsi}
                onChange={e => setDeskripsi(e.target.value)}
                rows={5}
              />
            </div>

            <div>
              <label className="label">Batas Waktu (Deadline)</label>
              <div className="relative">
                <Calendar size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="datetime-local"
                  className="input-field pl-10"
                  value={deadline}
                  onChange={e => setDeadline(e.target.value)}
                  min={minDateStr}
                  required
                />
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => navigate('/teacher/dashboard')}
                className="btn-secondary flex-1 justify-center"
              >
                Batal
              </button>
              <button type="submit" className="btn-primary flex-1 justify-center" disabled={loading || success}>
                {loading && <Loader2 size={16} className="animate-spin" />}
                {loading ? 'Menyimpan...' : 'Buat Tugas'}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
