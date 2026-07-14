import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabaseClient';
import { useAuth } from '../../context/AuthContext';
import Navbar from '../../components/Navbar';
import FileUploader from '../../components/FileUploader';
import {
  ArrowLeft, Clock, BookOpen, CheckCircle, Award, MessageSquare,
  Loader2, FileText, AlertCircle, Star
} from 'lucide-react';

interface Task {
  id: number;
  judul: string;
  deskripsi: string;
  deadline: string;
}

interface Submission {
  id: number;
  file_url: string;
  file_name: string;
  nilai: number | null;
  feedback: string | null;
  status: string;
  submitted_at: string;
}

export default function SubmitTask() {
  const { taskId } = useParams();
  const navigate = useNavigate();
  const { profile } = useAuth();
  const [task, setTask] = useState<Task | null>(null);
  const [submission, setSubmission] = useState<Submission | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [pendingFile, setPendingFile] = useState<{ url: string; name: string } | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchData();
  }, [taskId, profile]);

  const fetchData = async () => {
    if (!profile?.id) return;

    const [{ data: tugasData }, { data: subData }] = await Promise.all([
      supabase.from('tugas').select('*').eq('id', taskId).single(),
      supabase.from('submission')
        .select('*')
        .eq('task_id', taskId)
        .eq('student_id', profile.id)
        .maybeSingle(),
    ]);

    setTask(tugasData);
    setSubmission(subData);
    setLoading(false);
  };

  const handleUploadSuccess = (fileUrl: string, fileName: string) => {
    setPendingFile({ url: fileUrl, name: fileName });
  };

  const handleSubmit = async () => {
    if (!pendingFile || !profile?.id) return;
    setSubmitting(true);
    setError('');

    const { error } = await supabase.from('submission').insert({
      task_id: Number(taskId),
      student_id: profile.id,
      file_url: pendingFile.url,
      file_name: pendingFile.name,
      status: 'submitted',
    });

    if (error) {
      setError('Gagal mengumpulkan tugas: ' + error.message);
    } else {
      await fetchData();
      setPendingFile(null);
    }
    setSubmitting(false);
  };

  const isOverdue = task ? new Date(task.deadline) < new Date() : false;

  return (
    <div className="min-h-screen bg-[#0f172a]">
      <Navbar />
      <main className="max-w-2xl mx-auto px-4 py-8">
        <button
          onClick={() => navigate('/student/dashboard')}
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
          <div className="space-y-4 animate-fade-in">
            {/* Task Detail */}
            <div className="card">
              <div className="flex items-start gap-3 mb-4">
                <div className="w-11 h-11 rounded-xl bg-indigo-500/20 flex items-center justify-center shrink-0">
                  <BookOpen className="text-indigo-400" size={20} />
                </div>
                <div className="flex-1">
                  <h1 className="text-xl font-bold text-white">{task?.judul}</h1>
                  <div className="flex items-center gap-1.5 mt-1">
                    <Clock size={12} className={isOverdue ? 'text-red-400' : 'text-slate-500'} />
                    <span className={`text-xs ${isOverdue ? 'text-red-400 font-medium' : 'text-slate-400'}`}>
                      Deadline: {task?.deadline && new Date(task.deadline).toLocaleDateString('id-ID', { dateStyle: 'full' })}
                      {isOverdue && ' (Sudah Lewat)'}
                    </span>
                  </div>
                </div>
              </div>

              {task?.deskripsi && (
                <div className="rounded-lg bg-slate-800/60 p-4 border border-slate-700/50">
                  <p className="text-slate-300 text-sm leading-relaxed whitespace-pre-wrap">{task.deskripsi}</p>
                </div>
              )}
            </div>

            {/* Submission Status */}
            {submission ? (
              <div className="card space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-bold text-white">Status Pengumpulan</h2>
                  {submission.status === 'graded'
                    ? <span className="badge badge-graded"><CheckCircle size={10} /> Sudah Dinilai</span>
                    : <span className="badge badge-submitted"><Clock size={10} /> Menunggu Penilaian</span>
                  }
                </div>

                <div className="flex items-center gap-2 bg-slate-800/60 rounded-lg p-3 border border-slate-700/50">
                  <FileText size={16} className="text-indigo-400" />
                  <span className="text-slate-300 text-sm flex-1 truncate">{submission.file_name || 'File Tugas'}</span>
                  <span className="text-slate-500 text-xs">
                    {new Date(submission.submitted_at).toLocaleDateString('id-ID')}
                  </span>
                </div>

                {submission.status === 'graded' && (
                  <div className="rounded-xl bg-gradient-to-br from-emerald-500/10 to-green-500/5 border border-emerald-500/20 p-5">
                    <div className="flex items-center gap-3 mb-3">
                      <Award className="text-emerald-400" size={22} />
                      <div>
                        <p className="text-slate-400 text-xs font-medium">Nilai Kamu</p>
                        <div className="flex items-baseline gap-1">
                          <p className="text-4xl font-black text-emerald-400">{submission.nilai}</p>
                          <span className="text-slate-500 text-sm">/100</span>
                        </div>
                      </div>
                      <div className="ml-auto">
                        {(submission.nilai ?? 0) >= 75
                          ? <Star className="text-yellow-400 fill-yellow-400" size={28} />
                          : <Star className="text-slate-600" size={28} />
                        }
                      </div>
                    </div>

                    {submission.feedback && (
                      <div className="flex gap-2 bg-slate-800/50 rounded-lg p-3">
                        <MessageSquare size={14} className="text-slate-500 shrink-0 mt-0.5" />
                        <div>
                          <p className="text-xs text-slate-500 mb-1 font-medium">Catatan Guru:</p>
                          <p className="text-slate-300 text-sm">{submission.feedback}</p>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ) : (
              /* Upload Form */
              <div className="card">
                <h2 className="text-lg font-bold text-white mb-1">Kumpulkan Tugas</h2>
                <p className="text-slate-400 text-sm mb-4">Upload file PDF atau DOCX (maks 5MB)</p>

                {error && (
                  <div className="flex items-center gap-2 text-red-400 text-sm bg-red-500/10 rounded-lg px-4 py-3 border border-red-500/20 mb-4">
                    <AlertCircle size={16} />
                    {error}
                  </div>
                )}

                {isOverdue && !submission && (
                  <div className="flex items-center gap-2 text-yellow-400 text-sm bg-yellow-500/10 rounded-lg px-4 py-3 border border-yellow-500/20 mb-4">
                    <AlertCircle size={16} />
                    Deadline sudah lewat, namun kamu masih bisa mengumpulkan tugas.
                  </div>
                )}

                <FileUploader
                  studentId={profile!.id}
                  taskId={Number(taskId)}
                  onUploadSuccess={handleUploadSuccess}
                />

                {pendingFile && (
                  <button
                    onClick={handleSubmit}
                    disabled={submitting}
                    className="btn-primary w-full justify-center mt-4"
                  >
                    {submitting && <Loader2 size={16} className="animate-spin" />}
                    {submitting ? 'Mengumpulkan...' : 'Konfirmasi & Kumpulkan Tugas'}
                  </button>
                )}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
