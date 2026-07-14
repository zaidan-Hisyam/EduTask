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
  submission: {
    status: string;
    nilai: number | null;
  } | null;
}

export default function DashboardStudent() {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const [tasks, setTasks] = useState<TaskWithStatus[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTasks();
  }, [profile]);

  const fetchTasks = async () => {
    if (!profile?.id) return;

    const { data } = await supabase
      .from('tugas')
      .select(`
        *,
        submission!left(status, nilai)
      `)
      .eq('submission.student_id', profile.id)
      .order('deadline', { ascending: true });

    setTasks(
      data?.map(t => ({
        ...t,
        submission: t.submission?.[0] ?? null,
      })) ?? []
    );
    setLoading(false);
  };

  const pending = tasks.filter(t => !t.submission);
  const submitted = tasks.filter(t => t.submission?.status === 'submitted');
  const graded = tasks.filter(t => t.submission?.status === 'graded');
  const avgNilai = graded.length > 0
    ? (graded.reduce((sum, t) => sum + (t.submission?.nilai ?? 0), 0) / graded.length).toFixed(1)
    : '-';

  const statCards = [
    { label: 'Belum Dikerjakan', value: pending.length, icon: Clock, color: 'text-slate-400', bg: 'bg-slate-500/20' },
    { label: 'Menunggu Penilaian', value: submitted.length, icon: BookOpen, color: 'text-yellow-400', bg: 'bg-yellow-500/20' },
    { label: 'Sudah Dinilai', value: graded.length, icon: CheckCircle, color: 'text-green-400', bg: 'bg-green-500/20' },
    { label: 'Rata-rata Nilai', value: avgNilai, icon: Award, color: 'text-indigo-400', bg: 'bg-indigo-500/20' },
  ];

  return (
    <div className="min-h-screen bg-[#0f172a]">
      <Navbar />
      <main className="max-w-5xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-white">
            Halo, <span className="gradient-text">{profile?.nama}</span> 👋
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Kelas {profile?.kelas} · Pantau dan kumpulkan tugasmu di sini
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {statCards.map(({ label, value, icon: Icon, color, bg }) => (
            <div key={label} className="card hover:border-indigo-500/30 transition-all">
              <div className={`w-10 h-10 rounded-xl ${bg} flex items-center justify-center mb-3`}>
                <Icon size={18} className={color} />
              </div>
              <p className={`text-2xl font-bold ${loading ? 'text-slate-600' : 'text-white'}`}>
                {loading ? '...' : value}
              </p>
              <p className="text-slate-400 text-xs mt-0.5">{label}</p>
            </div>
          ))}
        </div>

        {/* Task List */}
        <div className="flex items-center gap-2 mb-5">
          <TrendingUp size={18} className="text-indigo-400" />
          <h2 className="text-lg font-bold text-white">Daftar Tugas</h2>
          <span className="ml-auto text-xs text-slate-500">{tasks.length} tugas</span>
        </div>

        {loading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="animate-spin text-indigo-400" size={36} />
          </div>
        ) : tasks.length === 0 ? (
          <div className="card text-center py-16">
            <BookOpen className="mx-auto text-slate-600 mb-4" size={48} />
            <p className="text-slate-400 font-medium">Belum ada tugas dari guru</p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {tasks.map(task => {
              const statusMap: any = {
                graded: 'graded',
                submitted: 'submitted',
              };
              const status = task.submission ? statusMap[task.submission.status] ?? 'submitted' : 'pending';

              return (
                <TaskCard
                  key={task.id}
                  id={task.id}
                  judul={task.judul}
                  deskripsi={task.deskripsi}
                  deadline={task.deadline}
                  status={status}
                  nilai={task.submission?.nilai}
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
