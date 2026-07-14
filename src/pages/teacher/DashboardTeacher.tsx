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

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Fetch tasks
      const { data: tugasData } = await supabase
        .from('tugas')
        .select('*, submission(count)')
        .order('deadline', { ascending: true });

      // Fetch students count
      const { count: siswaCount } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .eq('role', 'student');

      // Fetch total submissions
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
    { label: 'Total Tugas', value: stats.totalTugas, icon: BookOpen, color: 'indigo' },
    { label: 'Siswa Terdaftar', value: stats.totalSiswa, icon: Users, color: 'purple' },
    { label: 'Tugas Aktif', value: stats.tugasAktif, icon: Clock, color: 'yellow' },
    { label: 'Total Pengumpulan', value: stats.totalSubmission, icon: CheckCircle, color: 'green' },
  ];

  return (
    <div className="min-h-screen bg-[#0f172a]">
      <Navbar />
      <main className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-white">
              Selamat datang, <span className="gradient-text">{profile?.nama}</span> 👋
            </h1>
            <p className="text-slate-400 text-sm mt-1">Kelola dan pantau tugas siswa dari sini</p>
          </div>
          <button
            onClick={() => navigate('/teacher/create-task')}
            className="btn-primary shrink-0"
          >
            <Plus size={18} />
            Buat Tugas Baru
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {statCards.map(({ label, value, icon: Icon, color }) => (
            <div key={label} className="card hover:border-indigo-500/30 transition-all">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${
                color === 'indigo' ? 'bg-indigo-500/20' :
                color === 'purple' ? 'bg-purple-500/20' :
                color === 'yellow' ? 'bg-yellow-500/20' : 'bg-green-500/20'
              }`}>
                <Icon size={18} className={
                  color === 'indigo' ? 'text-indigo-400' :
                  color === 'purple' ? 'text-purple-400' :
                  color === 'yellow' ? 'text-yellow-400' : 'text-green-400'
                } />
              </div>
              <p className="text-2xl font-bold text-white">{loading ? '...' : value}</p>
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
            <p className="text-slate-400 font-medium">Belum ada tugas</p>
            <p className="text-slate-500 text-sm mt-1">Klik "Buat Tugas Baru" untuk memulai</p>
            <button onClick={() => navigate('/teacher/create-task')} className="btn-primary mt-5 mx-auto">
              <Plus size={16} />
              Buat Tugas Pertama
            </button>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
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
