import { useCallback, useState } from 'react';
import { UploadCloud, FileText, X, CheckCircle, Loader2, AlertCircle } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';

interface FileUploaderProps {
  studentId: string;
  taskId: number;
  onUploadSuccess: (fileUrl: string, fileName: string) => void;
}

const MAX_SIZE_MB = 5;
const ALLOWED_TYPES = [
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
];
const ALLOWED_EXT = ['.pdf', '.docx'];

export default function FileUploader({ studentId, taskId, onUploadSuccess }: FileUploaderProps) {
  const [dragActive, setDragActive] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [uploaded, setUploaded] = useState(false);

  const validateFile = (f: File): string | null => {
    if (!ALLOWED_TYPES.includes(f.type) && !ALLOWED_EXT.some((ext) => f.name.endsWith(ext))) {
      return 'Hanya file PDF dan DOCX yang diperbolehkan';
    }
    if (f.size > MAX_SIZE_MB * 1024 * 1024) {
      return `Ukuran file maksimal ${MAX_SIZE_MB}MB`;
    }
    return null;
  };

  const handleFile = useCallback((f: File) => {
    const err = validateFile(f);
    if (err) {
      setError(err);
      return;
    }
    setError(null);
    setFile(f);
    setUploaded(false);
  }, []);

  const handleDrag = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.stopPropagation();
      setDragActive(false);
      const f = e.dataTransfer.files[0];
      if (f) handleFile(f);
    },
    [handleFile]
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) handleFile(f);
  };

  const handleUpload = async () => {
    if (!file) return;
    setUploading(true);
    setProgress(0);
    setError(null);

    try {
      const ext = file.name.split('.').pop();
      const filePath = `${studentId}/${taskId}_${Date.now()}.${ext}`;

      const interval = setInterval(() => {
        setProgress((prev) => Math.min(prev + 15, 85));
      }, 200);

      const { error: uploadError } = await supabase.storage
        .from('assignment-files')
        .upload(filePath, file, { upsert: false });

      clearInterval(interval);

      if (uploadError) throw uploadError;

      setProgress(100);

      const { data: urlData } = await supabase.storage
        .from('assignment-files')
        .createSignedUrl(filePath, 60 * 60 * 24 * 365);

      if (!urlData?.signedUrl) throw new Error('Gagal mendapatkan URL file');

      setUploaded(true);
      onUploadSuccess(filePath, file.name);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Gagal mengupload file';
      setError(msg);
      setProgress(0);
    } finally {
      setUploading(false);
    }
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  if (uploaded && file) {
    return (
      <div className="rounded-xl border border-green-500/30 bg-green-500/10 p-4 flex items-center gap-3">
        <CheckCircle className="text-green-400 shrink-0" size={24} />
        <div className="flex-1 min-w-0">
          <p className="text-green-300 font-semibold text-sm">File berhasil diupload!</p>
          <p className="text-slate-400 text-xs truncate">
            {file.name} • {formatSize(file.size)}
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            setUploaded(false);
            setFile(null);
            setProgress(0);
          }}
          className="text-slate-400 hover:text-white transition-colors"
        >
          <X size={16} />
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div
        className={`relative rounded-xl border-2 border-dashed transition-all duration-200 p-6 text-center ${
          dragActive
            ? 'border-indigo-400 bg-indigo-500/10'
            : 'border-slate-600 hover:border-indigo-500/50 hover:bg-indigo-500/5'
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input
          type="file"
          accept=".pdf,.docx"
          onChange={handleChange}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          disabled={uploading}
        />
        {file ? (
          <div className="flex items-center justify-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-indigo-500/20 flex items-center justify-center">
              <FileText className="text-indigo-400" size={20} />
            </div>
            <div className="text-left">
              <p className="text-white font-semibold text-sm truncate max-w-[200px]">{file.name}</p>
              <p className="text-slate-400 text-xs">{formatSize(file.size)}</p>
            </div>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setFile(null);
              }}
              className="ml-auto text-slate-400 hover:text-red-400 transition-colors"
            >
              <X size={16} />
            </button>
          </div>
        ) : (
          <>
            <UploadCloud className="mx-auto text-slate-500 mb-2" size={32} />
            <p className="text-slate-300 font-medium text-sm">Klik atau drag &amp; drop file di sini</p>
            <p className="text-slate-500 text-xs mt-1">PDF atau DOCX, maksimal 5MB</p>
          </>
        )}
      </div>

      {error && (
        <div className="flex items-center gap-2 text-red-400 text-xs bg-red-500/10 rounded-lg px-3 py-2 border border-red-500/20">
          <AlertCircle size={14} />
          {error}
        </div>
      )}

      {uploading && (
        <div className="space-y-1.5">
          <div className="flex justify-between text-xs text-slate-400">
            <span>Mengupload...</span>
            <span>{progress}%</span>
          </div>
          <div className="w-full bg-slate-700 rounded-full h-1.5">
            <div
              className="bg-gradient-to-r from-indigo-500 to-purple-500 h-1.5 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      {file && !uploading && !uploaded && (
        <button type="button" onClick={handleUpload} className="btn-primary w-full justify-center">
          <UploadCloud size={16} />
          Upload Tugas
        </button>
      )}

      {uploading && (
        <button
          type="button"
          disabled
          className="btn-primary w-full justify-center opacity-60 cursor-not-allowed"
        >
          <Loader2 size={16} className="animate-spin" />
          Mengupload...
        </button>
      )}
    </div>
  );
}
