import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Register from './pages/Register';
import DashboardTeacher from './pages/teacher/DashboardTeacher';
import CreateTask from './pages/teacher/CreateTask';
import GradeSubmission from './pages/teacher/GradeSubmission';
import DashboardStudent from './pages/student/DashboardStudent';
import SubmitTask from './pages/student/SubmitTask';
import { Loader2 } from 'lucide-react';

function RootRedirect() {
  const { session, profile, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0f172a]">
        <Loader2 className="animate-spin text-indigo-400" size={36} />
      </div>
    );
  }

  if (!session) return <Navigate to="/login" replace />;
  if (profile?.role === 'teacher') return <Navigate to="/teacher/dashboard" replace />;
  if (profile?.role === 'student') return <Navigate to="/student/dashboard" replace />;
  return <Navigate to="/login" replace />;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public */}
        <Route path="/" element={<RootRedirect />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Teacher Routes */}
        <Route path="/teacher/dashboard" element={
          <ProtectedRoute allowedRole="teacher">
            <DashboardTeacher />
          </ProtectedRoute>
        } />
        <Route path="/teacher/create-task" element={
          <ProtectedRoute allowedRole="teacher">
            <CreateTask />
          </ProtectedRoute>
        } />
        <Route path="/teacher/grade/:taskId" element={
          <ProtectedRoute allowedRole="teacher">
            <GradeSubmission />
          </ProtectedRoute>
        } />

        {/* Student Routes */}
        <Route path="/student/dashboard" element={
          <ProtectedRoute allowedRole="student">
            <DashboardStudent />
          </ProtectedRoute>
        } />
        <Route path="/student/submit/:taskId" element={
          <ProtectedRoute allowedRole="student">
            <SubmitTask />
          </ProtectedRoute>
        } />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
