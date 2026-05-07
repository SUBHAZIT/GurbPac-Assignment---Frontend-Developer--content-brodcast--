import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';

export default function RootRedirect() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (loading) return;

    if (!user) {
      navigate('/landing');
      return;
    }

    // Redirect based on role
    const role = user.user_metadata?.role || 'student';
    if (role === 'teacher') {
      navigate('/teacher/dashboard');
    } else if (role === 'principal') {
      navigate('/principal/dashboard');
    } else {
      navigate('/live/all');
    }
  }, [user, loading, navigate]);

  return (
    <div className="h-screen w-full flex items-center justify-center bg-slate-50">
      <div className="flex flex-col items-center gap-4">
        <div className="h-12 w-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
        <p className="text-slate-500 font-medium animate-pulse">Redirecting you...</p>
      </div>
    </div>
  );
}
