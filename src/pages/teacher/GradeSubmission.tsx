import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabaseClient';
import Navbar from '../../components/Navbar';
import {
  ArrowLeft, Clock, Users, CheckCircle, FileText, ExternalLink,
  Star, MessageSquare, Loader2, AlertCircle, BookOpen, Award, X, Edit2,
} from 'lucide-react';

interface Task {
  id: number;
  judul: string;
  deskripsi: string;
  deadline: string;
}

interface Submission {
  id: number;
  student_id: string;
  file_url: string;
  file_name: string;
  nilai: number | null;
  feedback: string | null;
  status: string;
  submitted_at: string;
  profiles: {
    nama: string;
    kelas: string;
    email: string;
  };
}

interface GradeModal {
  submissionId: number;
  studentName: string;
  nilai: string;
  feedback: string;
}

export default function GradeSubmission() {
  const { taskId } = useParams();
  const navigate = useNavigate();
  const [task, setTask] = useState<Task | null>(null);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState<GradeModal | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => { fetchData(); }, [taskId]);

  const fetchData = async () => {
    const [{ data: tugasData }, { data: subData }] = await Promise.all([
      supabase.from('tugas').select('*').eq('id', taskId).single(),
      supabase.from('submission')
        .select('*, profiles(nama, kelas, email)')
        .eq('task_id', taskId)
        .order('submitted_at', { ascending: true }),
    ]);
    setTask(tugasData);
    setSubmissions(subData ?? []);
    setLoading(false);
  };

  const getSignedUrl = async (filePath: string) => {
    const { data } = await supabase.storage
      .from('assignment-files')
      .createSignedUrl(filePath, 60 * 60);
    if (data?.signedUrl) window.open(data.signedUrl, '_blank');
  };

  const openModal = (sub: Submission) => {
    setError('');
    setModal({
      submissionId: sub.id,
      studentName: sub.profiles?.nama ?? '',
      nilai: sub.nilai?.toString() ?? '',
      feedback: sub.feedback ?? '',
    });
  };

  const closeModal = () => { setModal(null); setError(''); };

  const handleGrade = async () => {
    if (!modal) return;
    const nilaiNum = parseFloat(modal.nilai);
    if (isNaN(nilaiNum) || nilaiNum < 0 || nilaiNum > 100) {
      setError('Nilai harus antara 0 – 100');
      return;
    }
    setSaving(true);
    setError('');
    const { error: dbErr } = await supabase
      .from('submission')
      .update({ nilai: nilaiNum, feedback: modal.feedback, status: 'graded' })
      .eq('id', modal.submissionId);

    if (dbErr) {
      setError('Gagal menyimpan nilai, coba lagi.');
    } else {
      setSubmissions(prev =>
        prev.map(s => s.id === modal.submissionId
          ? { ...s, nilai: nilaiNum, feedback: modal.feedback, status: 'graded' }
          : s
        )
      );
      closeModal();
    }
    setSaving(false);
  };

  const gradedCount = submissions.filter(s => s.status === 'graded').length;

  return (
    <div className="page-wrapper">
      <Navbar />

      {/* ── Grading Modal ─────────────────────────── */}
      {modal && (
        <div className="modal-backdrop animate-fade-in" onClick={closeModal}>
          <div className="modal-box animate-scale-in" onClick={e => e.stopPropagation()}>
            {/* Header */}
            <div className="flex items-center justify-between mb-5">
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>
                  Nilai Tugas
                </p>
                <h3 className="text-lg font-bold mt-0.5" style={{ color: 'var(--text-heading)' }}>
                  {modal.studentName}
                </h3>
              </div>
              <button onClick={closeModal} className="btn-ghost !p-1.5">
                <X size={18} />
              </button>
            </div>

            {error && (
              <div className="alert alert-error mb-4 text-sm">
                <AlertCircle size={15} className="shrink-0 mt-0.5" />
                {error}
              </div>
            )}

            {/* Nilai input */}
            <div className="mb-4">
              <label className="label">Nilai (0 – 100)</label>
              <div className="relative">
                <Star size={15} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--yellow)' }} />
                <input
                  type="number"
                  min={0}
                  max={100}
                  placeholder="Masukkan nilai..."
                  className="input-field pl-9"
                  value={modal.nilai}
                  onChange={e => setModal(prev => prev ? { ...prev, nilai: e.target.value } : null)}
                  autoFocus
                />
              </div>
            </div>

            {/* Feedback */}
            <div className="mb-6">
              <label className="label">Catatan / Feedback <span className="normal-case font-normal">(opsional)</span></label>
              <div className="relative">
                <MessageSquare size={14} className="absolute left-3 top-3.5" style={{ color: 'var(--text-muted)' }} />
                <textarea
                  placeholder="Tulis catatan untuk siswa..."
                  className="input-field pl-9 resize-none"
                  rows={3}
                  value={modal.feedback}
                  onChange={e => setModal(prev => prev ? { ...prev, feedback: e.target.value } : null)}
                />
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <button onClick={closeModal} className="btn-secondary flex-1 justify-center">Batal</button>
              <button onClick={handleGrade} disabled={saving} className="btn-primary flex-1 justify-center">
                {saving ? <Loader2 size={15} className="animate-spin" /> : <Award size={15} />}
                {saving ? 'Menyimpan...' : 'Simpan Nilai'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Page content ──────────────────────────── */}
      <main className="page-content" style={{ maxWidth: '860px' }}>
        <button onClick={() => navigate('/teacher/dashboard')} className="back-link">
          <ArrowLeft size={15} />
          Kembali ke Dashboard
        </button>

        {loading ? (
          <div className="flex justify-center py-24">
            <Loader2 className="animate-spin" size={34} style={{ color: 'var(--accent-light)' }} />
          </div>
        ) : (
          <>
            {/* Task Info card */}
            <div className="card mb-6 animate-fade-in">
              <div className="flex items-start gap-4">
                <div className="stat-icon shrink-0" style={{ background: 'var(--accent-soft)' }}>
                  <BookOpen size={18} style={{ color: 'var(--accent-light)' }} />
                </div>
                <div className="flex-1 min-w-0">
                  <h1 className="text-lg font-bold truncate">{task?.judul}</h1>
                  {task?.deskripsi && (
                    <p className="text-sm mt-1 line-clamp-2" style={{ color: 'var(--text-muted)' }}>
                      {task.deskripsi}
                    </p>
                  )}
                  <div className="flex flex-wrap gap-4 mt-3">
                    <span className="flex items-center gap-1.5 text-xs" style={{ color: 'var(--text-muted)' }}>
                      <Clock size={12} />
                      {task?.deadline && new Date(task.deadline).toLocaleDateString('id-ID', { dateStyle: 'long' })}
                    </span>
                    <span className="flex items-center gap-1.5 text-xs" style={{ color: 'var(--text-muted)' }}>
                      <Users size={12} />
                      {submissions.length} pengumpulan
                    </span>
                    <span className="flex items-center gap-1.5 text-xs" style={{ color: 'var(--green)' }}>
                      <CheckCircle size={12} />
                      {gradedCount} sudah dinilai
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Submission list */}
            {submissions.length === 0 ? (
              <div className="card text-center py-16">
                <FileText className="mx-auto mb-3" size={40} style={{ color: 'var(--text-subtle)' }} />
                <p className="font-semibold" style={{ color: 'var(--text-muted)' }}>
                  Belum ada siswa yang mengumpulkan
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {submissions.map((sub, idx) => (
                  <div key={sub.id} className="card animate-fade-in" style={{ animationDelay: `${idx * 40}ms` }}>
                    <div className="flex items-center gap-4">
                      {/* Avatar */}
                      <div
                        className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold shrink-0"
                        style={{ background: 'linear-gradient(135deg, #6366f1, #7c3aed)', color: '#fff' }}
                      >
                        {sub.profiles?.nama?.[0]?.toUpperCase()}
                      </div>

                      {/* Student info */}
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm truncate" style={{ color: 'var(--text-heading)' }}>
                          {sub.profiles?.nama}
                        </p>
                        <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                          {sub.profiles?.kelas} ·{' '}
                          {new Date(sub.submitted_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
                        </p>
                      </div>

                      {/* File button */}
                      <button
                        onClick={() => getSignedUrl(sub.file_url)}
                        className="hidden sm:flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg transition-colors"
                        style={{
                          background: 'var(--accent-soft)',
                          color: 'var(--accent-light)',
                          border: '1px solid var(--accent-border)',
                        }}
                      >
                        <FileText size={13} />
                        <span className="max-w-[120px] truncate">{sub.file_name || 'Lihat File'}</span>
                        <ExternalLink size={11} />
                      </button>

                      {/* Grade / status */}
                      <div className="flex items-center gap-2 shrink-0">
                        {sub.status === 'graded' ? (
                          <>
                            <div className="text-right hidden sm:block">
                              <p className="text-xl font-extrabold" style={{ color: 'var(--green)' }}>
                                {sub.nilai}
                              </p>
                              {sub.feedback && (
                                <p className="text-[10px] max-w-[120px] truncate" style={{ color: 'var(--text-muted)' }}>
                                  {sub.feedback}
                                </p>
                              )}
                            </div>
                            <span className="badge badge-graded">
                              <CheckCircle size={9} /> Dinilai
                            </span>
                          </>
                        ) : (
                          <span className="badge badge-submitted">
                            <Clock size={9} /> Menunggu
                          </span>
                        )}

                        {/* Edit / grade button */}
                        <button
                          onClick={() => openModal(sub)}
                          className="btn-primary !py-1.5 !px-2.5 !text-xs"
                          title={sub.status === 'graded' ? 'Edit Nilai' : 'Beri Nilai'}
                        >
                          {sub.status === 'graded'
                            ? <Edit2 size={13} />
                            : <Award size={13} />
                          }
                          <span className="hidden sm:inline">
                            {sub.status === 'graded' ? 'Edit' : 'Nilai'}
                          </span>
                        </button>
                      </div>
                    </div>

                    {/* Mobile file button */}
                    <button
                      onClick={() => getSignedUrl(sub.file_url)}
                      className="sm:hidden mt-3 flex items-center gap-2 text-xs font-medium px-3 py-1.5 rounded-lg w-full"
                      style={{
                        background: 'var(--accent-soft)',
                        color: 'var(--accent-light)',
                        border: '1px solid var(--accent-border)',
                      }}
                    >
                      <FileText size={13} />
                      {sub.file_name || 'Lihat File Tugas'}
                      <ExternalLink size={11} className="ml-auto" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
