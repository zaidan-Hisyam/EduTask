import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabaseClient';
import Navbar from '../../components/Navbar';
import {
  ArrowLeft, Clock, Users, CheckCircle, FileText, ExternalLink,
  Star, MessageSquare, Loader2, AlertCircle, BookOpen, Award
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

export default function GradeSubmission() {
  const { taskId } = useParams();
  const navigate = useNavigate();
  const [task, setTask] = useState<Task | null>(null);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [grading, setGrading] = useState<{ [id: number]: { nilai: string; feedback: string } }>({});
  const [saving, setSaving] = useState<number | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchData();
  }, [taskId]);

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

    // Init grading state
    const initGrading: typeof grading = {};
    subData?.forEach(s => {
      initGrading[s.id] = { nilai: s.nilai?.toString() ?? '', feedback: s.feedback ?? '' };
    });
    setGrading(initGrading);
    setLoading(false);
  };

  const getSignedUrl = async (filePath: string) => {
    const { data } = await supabase.storage
      .from('assignment-files')
      .createSignedUrl(filePath, 60 * 60); // 1 hour
    if (data?.signedUrl) window.open(data.signedUrl, '_blank');
  };

  const handleGrade = async (submissionId: number) => {
    const g = grading[submissionId];
    const nilaiNum = parseFloat(g.nilai);

    if (isNaN(nilaiNum) || nilaiNum < 0 || nilaiNum > 100) {
      setError('Nilai harus antara 0 - 100');
      return;
    }

    setSaving(submissionId);
    setError('');

    const { error } = await supabase
      .from('submission')
      .update({ nilai: nilaiNum, feedback: g.feedback, status: 'graded' })
      .eq('id', submissionId);

    if (error) setError('Gagal menyimpan nilai');
    else {
      setSubmissions(prev =>
        prev.map(s => s.id === submissionId
          ? { ...s, nilai: nilaiNum, feedback: g.feedback, status: 'graded' }
          : s
        )
      );
    }
    setSaving(null);
  };

  const gradedCount = submissions.filter(s => s.status === 'graded').length;

  return (
    <div className="min-h-screen bg-[#0f172a]">
      <Navbar />
      <main className="max-w-5xl mx-auto px-4 py-8">
        <button
          onClick={() => navigate('/teacher/dashboard')}
          className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors text-sm mb-6"
        >
          <ArrowLeft size={16} />
          Kembali ke Dashboard
        </button>

        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="animate-spin text-indigo-400" size={36} />
          </div>
        ) : (
          <>
            {/* Task Info */}
            <div className="card mb-6 animate-fade-in">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-indigo-500/20 flex items-center justify-center shrink-0">
                  <BookOpen className="text-indigo-400" size={22} />
                </div>
                <div className="flex-1">
                  <h1 className="text-xl font-bold text-white">{task?.judul}</h1>
                  {task?.deskripsi && <p className="text-slate-400 text-sm mt-1">{task.deskripsi}</p>}
                  <div className="flex flex-wrap gap-4 mt-3">
                    <div className="flex items-center gap-1.5 text-xs text-slate-400">
                      <Clock size={13} />
                      Deadline: {task?.deadline && new Date(task.deadline).toLocaleDateString('id-ID', { dateStyle: 'full' })}
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-slate-400">
                      <Users size={13} />
                      {submissions.length} pengumpulan
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-green-400">
                      <CheckCircle size={13} />
                      {gradedCount} sudah dinilai
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-2 text-red-400 text-sm bg-red-500/10 rounded-lg px-4 py-3 border border-red-500/20 mb-4">
                <AlertCircle size={16} />
                {error}
              </div>
            )}

            {/* Submissions */}
            {submissions.length === 0 ? (
              <div className="card text-center py-16">
                <FileText className="mx-auto text-slate-600 mb-4" size={48} />
                <p className="text-slate-400 font-medium">Belum ada siswa yang mengumpulkan</p>
              </div>
            ) : (
              <div className="space-y-4">
                {submissions.map((sub) => (
                  <div key={sub.id} className="card animate-fade-in">
                    <div className="flex flex-col lg:flex-row lg:items-start gap-4">
                      {/* Student Info */}
                      <div className="flex items-center gap-3 lg:w-48 shrink-0">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm">
                          {sub.profiles?.nama?.[0]?.toUpperCase()}
                        </div>
                        <div>
                          <p className="text-white font-semibold text-sm">{sub.profiles?.nama}</p>
                          <p className="text-slate-400 text-xs">{sub.profiles?.kelas}</p>
                          <p className="text-slate-500 text-xs mt-0.5">
                            {new Date(sub.submitted_at).toLocaleDateString('id-ID')}
                          </p>
                        </div>
                      </div>

                      {/* File */}
                      <div className="flex-1">
                        <button
                          onClick={() => getSignedUrl(sub.file_url)}
                          className="flex items-center gap-2 text-indigo-400 hover:text-indigo-300 transition-colors text-sm bg-indigo-500/10 rounded-lg px-3 py-2 border border-indigo-500/20 w-full sm:w-auto"
                        >
                          <FileText size={14} />
                          <span className="truncate max-w-[180px]">{sub.file_name || 'Lihat File Tugas'}</span>
                          <ExternalLink size={12} className="shrink-0 ml-auto" />
                        </button>

                        {/* Grading Form */}
                        <div className="mt-3 space-y-2">
                          <div className="flex gap-2">
                            <div className="relative w-24 shrink-0">
                              <Star size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-yellow-500" />
                              <input
                                type="number"
                                min={0}
                                max={100}
                                placeholder="Nilai"
                                className="input-field pl-8 text-center"
                                value={grading[sub.id]?.nilai ?? ''}
                                onChange={e => setGrading(prev => ({
                                  ...prev,
                                  [sub.id]: { ...prev[sub.id], nilai: e.target.value }
                                }))}
                              />
                            </div>
                            <div className="relative flex-1">
                              <MessageSquare size={14} className="absolute left-2.5 top-3 text-slate-500" />
                              <input
                                type="text"
                                placeholder="Catatan / Feedback (opsional)"
                                className="input-field pl-8"
                                value={grading[sub.id]?.feedback ?? ''}
                                onChange={e => setGrading(prev => ({
                                  ...prev,
                                  [sub.id]: { ...prev[sub.id], feedback: e.target.value }
                                }))}
                              />
                            </div>
                            <button
                              onClick={() => handleGrade(sub.id)}
                              disabled={saving === sub.id}
                              className="btn-primary shrink-0"
                            >
                              {saving === sub.id
                                ? <Loader2 size={14} className="animate-spin" />
                                : <Award size={14} />
                              }
                              {saving === sub.id ? 'Menyimpan...' : 'Simpan Nilai'}
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Status Badge */}
                      <div className="shrink-0">
                        {sub.status === 'graded' ? (
                          <div className="flex flex-col items-end gap-1">
                            <span className="badge badge-graded"><CheckCircle size={10} /> Sudah Dinilai</span>
                            <span className="text-2xl font-bold text-emerald-400">{sub.nilai}</span>
                          </div>
                        ) : (
                          <span className="badge badge-submitted"><Clock size={10} /> Menunggu</span>
                        )}
                      </div>
                    </div>
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
