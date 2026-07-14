import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabaseClient';
import { useAuth } from '../../context/AuthContext';
import Navbar from '../../components/Navbar';
import TaskCard from '../../components/TaskCard';
import { BookOpen, Clock, CheckCircle, Award, Loader2, TrendingUp } from 'lucide-react';

interface TaskWithStatus {
  id: number;
  judul: string;
  deskripsi: string;
  deadline: string;
  submission: { status: string; nilai: number | null } | null;
}

export default function DashboardStudent() {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const [tasks, setTasks] = useState<TaskWithStatus[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchTasks(); }, [profile]);

  const fetchTasks = async () => {
    if (!profile?.id) return;
    const { data } = await supabase
      .from('tugas')
      .select(`*, submission!left(status, nilai)`)
      .eq('submission.student_id', profile.id)
      .order('deadline', { ascending: true });

    setTasks(data?.map(t => ({ ...t, submission: t.submission?.[0] ?? null })) ?? []);
    setLoading(false);
  };

  const pending   = tasks.filter(t => !t.submission);
  const submitted = tasks.filter(t => t.submission?.status === 'submitted');
  const graded    = tasks.filter(t => t.submission?.status === 'graded');
  const avgNilai  = graded.length > 0
    ? (graded.reduce((s, t) => s + (t.submission?.nilai ?? 0), 0) / graded.length).toFixed(1)
    : '—';

  const statCards = [
    { label: 'Belum Dikerjakan', value: pending.length,   icon: Clock,        color: 'var(--text-muted)',   bg: 'rgba(100,116,139,0.12)' },
    { label: 'Menunggu Penilaian', value: submitted.length, icon: BookOpen,   color: 'var(--yellow)',       bg: 'var(--yellow-soft)' },
    { label: 'Sudah Dinilai',    value: graded.length,    icon: CheckCircle,  color: 'var(--green)',        bg: 'var(--green-soft)' },
    { label: 'Rata-rata Nilai',  value: avgNilai,         icon: Award,        color: 'var(--accent-light)', bg: 'var(--accent-soft)' },
  ];

  return (
    <div className="page-wrapper">
      <Navbar />
      <main className="page-content">
        {/* Header */}
        <div className="mb-8">
          <p className="text-xs font-semibold uppercase tracking-widest mb-1" style={{ color: 'var(--text-muted)' }}>
            Dashboard Siswa
          </p>
          <h1 className="text-2xl font-extrabold">
            Halo, <span className="gradient-text">{profile?.nama}</span> 👋
          </h1>
          <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
            Kelas {profile?.kelas} · Pantau dan kumpulkan tugasmu di sini
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
          {statCards.map(({ label, value, icon: Icon, color, bg }) => (
            <div key={label} className="stat-card">
              <div className="stat-icon" style={{ background: bg }}>
                <Icon size={17} style={{ color }} />
              </div>
              <p className="stat-value">{loading ? '—' : value}</p>
              <p className="stat-label">{label}</p>
            </div>
          ))}
        </div>

        {/* Task List */}
        <div className="section-heading">
          <TrendingUp size={17} style={{ color: 'var(--accent-light)' }} />
          <h2>Daftar Tugas</h2>
          <span className="ml-auto text-xs" style={{ color: 'var(--text-muted)' }}>
            {tasks.length} tugas
          </span>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="animate-spin" size={32} style={{ color: 'var(--accent-light)' }} />
          </div>
        ) : tasks.length === 0 ? (
          <div className="card text-center py-16">
            <BookOpen className="mx-auto mb-3" size={40} style={{ color: 'var(--text-subtle)' }} />
            <p className="font-semibold" style={{ color: 'var(--text-muted)' }}>Belum ada tugas dari guru</p>
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            {tasks.map(task => {
              const s = task.submission;
              const status = s ? (s.status === 'graded' ? 'graded' : 'submitted') : 'pending';
              return (
                <TaskCard
                  key={task.id}
                  id={task.id}
                  judul={task.judul}
                  deskripsi={task.deskripsi}
                  deadline={task.deadline}
                  status={status}
                  nilai={s?.nilai}
                  onClick={() => navigate(`/student/submit/${task.id}`)}
                />
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
