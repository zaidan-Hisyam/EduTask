import { Clock, BookOpen, Users, CheckCircle } from 'lucide-react';

interface TaskCardProps {
  id: number;
  judul: string;
  deskripsi?: string;
  deadline: string;
  submissionCount?: number;
  totalStudents?: number;
  status?: 'pending' | 'submitted' | 'graded';
  nilai?: number | null;
  onClick: () => void;
}

export default function TaskCard({
  judul,
  deskripsi,
  deadline,
  submissionCount,
  totalStudents,
  status,
  nilai,
  onClick,
}: TaskCardProps) {
  const deadlineDate = new Date(deadline);
  const now = new Date();
  const isOverdue = deadlineDate < now && status === 'pending';
  const daysLeft = Math.ceil((deadlineDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

  const statusBadge = () => {
    if (!status) return null;
    if (status === 'graded') return <span className="badge badge-graded"><CheckCircle size={10} /> Sudah Dinilai</span>;
    if (status === 'submitted') return <span className="badge badge-submitted"><Clock size={10} /> Menunggu Penilaian</span>;
    if (isOverdue) return <span className="badge" style={{ background: 'rgba(239,68,68,0.15)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.3)' }}>Terlambat</span>;
    return <span className="badge badge-pending">Belum Dikerjakan</span>;
  };

  return (
    <div
      onClick={onClick}
      className="card cursor-pointer hover:border-indigo-500/40 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_8px_30px_rgba(99,102,241,0.15)] animate-fade-in"
    >
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-7 h-7 rounded-lg bg-indigo-500/20 flex items-center justify-center shrink-0">
              <BookOpen size={13} className="text-indigo-400" />
            </div>
            <h3 className="text-white font-semibold text-base truncate">{judul}</h3>
          </div>
          {deskripsi && (
            <p className="text-slate-400 text-sm line-clamp-2 ml-9">{deskripsi}</p>
          )}
        </div>
        {statusBadge()}
      </div>

      <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-700/50">
        <div className="flex items-center gap-1.5 text-xs">
          <Clock size={12} className={isOverdue && status === 'pending' ? 'text-red-400' : 'text-slate-500'} />
          <span className={isOverdue && status === 'pending' ? 'text-red-400 font-medium' : 'text-slate-500'}>
            {deadlineDate.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
          </span>
          {status === 'pending' && !isOverdue && (
            <span className={`ml-1 font-medium ${daysLeft <= 2 ? 'text-yellow-400' : 'text-slate-400'}`}>
              ({daysLeft > 0 ? `${daysLeft} hari lagi` : 'Hari ini'})
            </span>
          )}
        </div>

        {typeof submissionCount !== 'undefined' && (
          <div className="flex items-center gap-1 text-xs text-slate-500">
            <Users size={12} />
            <span>{submissionCount}/{totalStudents ?? '?'} siswa</span>
          </div>
        )}

        {status === 'graded' && nilai !== null && typeof nilai !== 'undefined' && (
          <div className="flex items-center gap-1 text-xs font-bold text-emerald-400">
            <span>Nilai:</span>
            <span className="text-base">{nilai}</span>
          </div>
        )}
      </div>
    </div>
  );
}
