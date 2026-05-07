import { useAuth } from '@/context/AuthContext';
import { Sidebar } from '@/components/shared/Sidebar';
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { Skeleton } from '@/components/ui/skeleton';

export default function DashboardLayout({ children, allowedRole }) {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    } else if (!loading && allowedRole && user?.profile?.role !== allowedRole) {
      const correctPath = user?.profile?.role === 'principal' ? '/principal/dashboard' : '/teacher/dashboard';
      navigate(correctPath);
    }
  }, [user, loading, navigate, allowedRole]);

  if (loading || !user) {
    return (
      <div className="flex h-screen w-full">
        <div className="w-64 border-r border-slate-200 p-6 space-y-4">
          <Skeleton className="h-10 w-full" />
          <div className="space-y-2">
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
          </div>
        </div>
        <div className="flex-1 p-8 space-y-6">
          <Skeleton className="h-12 w-1/4" />
          <div className="grid grid-cols-3 gap-6">
            <Skeleton className="h-32" />
            <Skeleton className="h-32" />
            <Skeleton className="h-32" />
          </div>
          <Skeleton className="h-96 w-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-slate-50">
      <Sidebar />
      <main className="flex-1 overflow-y-auto p-8">
        <div className="max-w-6xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
