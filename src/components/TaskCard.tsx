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
    if (status === 'graded')    return <span className="badge badge-graded"><CheckCircle size={9} /> Sudah Dinilai</span>;
    if (status === 'submitted') return <span className="badge badge-submitted"><Clock size={9} /> Menunggu Penilaian</span>;
    if (isOverdue)              return <span className="badge" style={{ background: 'var(--red-soft)', color: 'var(--red)', border: '1px solid var(--red-border)' }}>Terlambat</span>;
    return <span className="badge badge-pending">Belum Dikerjakan</span>;
  };

  return (
    <div
      onClick={onClick}
      className="card card-hover cursor-pointer animate-fade-in"
      style={{ cursor: 'pointer' }}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-start gap-2.5 flex-1 min-w-0">
          <div
            className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5"
            style={{ background: 'var(--accent-soft)' }}
          >
            <BookOpen size={13} style={{ color: 'var(--accent-light)' }} />
          </div>
          <div className="min-w-0">
            <h3 className="font-semibold text-sm truncate" style={{ color: 'var(--text-heading)' }}>
              {judul}
            </h3>
            {deskripsi && (
              <p className="text-xs mt-0.5 line-clamp-2" style={{ color: 'var(--text-muted)' }}>
                {deskripsi}
              </p>
            )}
          </div>
        </div>
        {statusBadge()}
      </div>

      {/* Footer */}
      <div
        className="flex items-center justify-between pt-3 mt-3"
        style={{ borderTop: '1px solid var(--border)' }}
      >
        {/* Deadline */}
        <div className="flex items-center gap-1.5">
          <Clock
            size={11}
            style={{ color: isOverdue && status === 'pending' ? 'var(--red)' : 'var(--text-subtle)' }}
          />
          <span
            className="text-xs"
            style={{ color: isOverdue && status === 'pending' ? 'var(--red)' : 'var(--text-muted)', fontWeight: 500 }}
          >
            {deadlineDate.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
          </span>
          {status === 'pending' && !isOverdue && daysLeft <= 3 && (
            <span className="text-xs font-semibold" style={{ color: 'var(--yellow)' }}>
              · {daysLeft}h lagi
            </span>
          )}
        </div>

        {/* Right side */}
        {typeof submissionCount !== 'undefined' && (
          <span className="flex items-center gap-1 text-xs" style={{ color: 'var(--text-muted)' }}>
            <Users size={11} />
            {submissionCount}/{totalStudents ?? '?'}
          </span>
        )}
        {status === 'graded' && nilai !== null && typeof nilai !== 'undefined' && (
          <span className="text-base font-extrabold" style={{ color: 'var(--green)' }}>
            {nilai} <span className="text-xs font-normal" style={{ color: 'var(--text-muted)' }}>/100</span>
          </span>
        )}
      </div>
    </div>
  );
}
