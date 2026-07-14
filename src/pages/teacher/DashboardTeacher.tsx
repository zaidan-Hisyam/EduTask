import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabaseClient';
import { useAuth } from '../../context/AuthContext';
import Navbar from '../../components/Navbar';
import TaskCard from '../../components/TaskCard';
import { Plus, BookOpen, Users, CheckCircle, Clock, Loader2, TrendingUp } from 'lucide-react';

interface Task {
  id: number;
  judul: string;
  deskripsi: string;
  deadline: string;
  created_at: string;
  submissionCount?: number;
}

interface Stats {
  totalTugas: number;
  totalSiswa: number;
  tugasAktif: number;
  totalSubmission: number;
}

export default function DashboardTeacher() {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [stats, setStats] = useState<Stats>({ totalTugas: 0, totalSiswa: 0, tugasAktif: 0, totalSubmission: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      const { data: tugasData } = await supabase
        .from('tugas')
        .select('*, submission(count)')
        .order('deadline', { ascending: true });

      const { count: siswaCount } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .eq('role', 'student');

      const { count: subCount } = await supabase
        .from('submission')
        .select('*', { count: 'exact', head: true });

      const now = new Date();
      const tugasAktif = tugasData?.filter(t => new Date(t.deadline) > now).length ?? 0;

      const tasksWithCount = tugasData?.map(t => ({
        ...t,
        submissionCount: t.submission?.[0]?.count ?? 0,
      })) ?? [];

      setTasks(tasksWithCount);
      setStats({
        totalTugas: tugasData?.length ?? 0,
        totalSiswa: siswaCount ?? 0,
        tugasAktif,
        totalSubmission: subCount ?? 0,
      });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    { label: 'Total Tugas', value: stats.totalTugas, icon: BookOpen, color: 'var(--accent-light)', bg: 'var(--accent-soft)' },
    { label: 'Siswa Terdaftar', value: stats.totalSiswa, icon: Users, color: '#c084fc', bg: 'rgba(192,132,252,0.12)' },
    { label: 'Tugas Aktif', value: stats.tugasAktif, icon: Clock, color: 'var(--yellow)', bg: 'var(--yellow-soft)' },
    { label: 'Total Pengumpulan', value: stats.totalSubmission, icon: CheckCircle, color: 'var(--green)', bg: 'var(--green-soft)' },
  ];

  return (
    <div className="page-wrapper">
      <Navbar />
      <main className="page-content">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest mb-1" style={{ color: 'var(--text-muted)' }}>
              Dashboard Guru
            </p>
            <h1 className="text-2xl font-extrabold">
              Halo, <span className="gradient-text">{profile?.nama}</span> 👋
            </h1>
            <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
              Kelola dan pantau tugas siswa dari sini
            </p>
          </div>
          <button onClick={() => navigate('/teacher/create-task')} className="btn-primary shrink-0">
            <Plus size={16} />
            Buat Tugas Baru
          </button>
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
            <p className="font-semibold" style={{ color: 'var(--text-muted)' }}>Belum ada tugas</p>
            <p className="text-sm mt-1" style={{ color: 'var(--text-subtle)' }}>
              Klik "Buat Tugas Baru" untuk memulai
            </p>
            <button onClick={() => navigate('/teacher/create-task')} className="btn-primary mt-5 mx-auto">
              <Plus size={15} />
              Buat Tugas Pertama
            </button>
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            {tasks.map(task => (
              <TaskCard
                key={task.id}
                id={task.id}
                judul={task.judul}
                deskripsi={task.deskripsi}
                deadline={task.deadline}
                submissionCount={task.submissionCount}
                totalStudents={stats.totalSiswa}
                onClick={() => navigate(`/teacher/grade/${task.id}`)}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
