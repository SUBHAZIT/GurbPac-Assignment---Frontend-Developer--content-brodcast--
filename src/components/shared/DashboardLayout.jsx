import { useAuth } from '@/context/AuthContext';
import { Sidebar } from '@/components/shared/Sidebar';
import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { Menu, X } from 'lucide-react';

export default function DashboardLayout({ children, allowedRole }) {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    } else if (!loading && allowedRole && user?.profile?.role !== allowedRole) {
      const role = user?.profile?.role;
      if (role === 'principal') navigate('/principal/dashboard');
      else if (role === 'teacher') navigate('/teacher/dashboard');
      else navigate('/viewer/dashboard');
    }
  }, [user, loading, navigate, allowedRole]);

  if (loading || !user) {
    return (
      <div className="flex h-screen w-full">
        <div className="hidden md:block w-64 border-r border-slate-200 p-6 space-y-4">
          <Skeleton className="h-10 w-full" />
          <div className="space-y-2">
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
          </div>
        </div>
        <div className="flex-1 p-4 md:p-8 space-y-6">
          <Skeleton className="h-12 w-1/4" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
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
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar - hidden on mobile, shown on md+ */}
      <div className={`
        fixed inset-y-0 left-0 z-50 transform transition-transform duration-300 ease-in-out md:relative md:translate-x-0
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <Sidebar onClose={() => setSidebarOpen(false)} />
      </div>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto">
        {/* Mobile top bar */}
        <div className="sticky top-0 z-30 md:hidden bg-white/80 backdrop-blur-lg border-b border-slate-200 px-4 h-14 flex items-center justify-between">
          <button 
            onClick={() => setSidebarOpen(true)}
            className="h-9 w-9 rounded-lg bg-slate-100 flex items-center justify-center hover:bg-slate-200 transition-colors"
          >
            <Menu className="h-5 w-5 text-slate-700" />
          </button>
          <span className="text-sm font-bold text-slate-900">StreamPro</span>
          <div className="h-8 w-8 rounded-full bg-teal-500 flex items-center justify-center text-white text-xs font-bold">
            {user?.profile?.full_name?.charAt(0) || 'U'}
          </div>
        </div>

        <div className="max-w-6xl mx-auto p-4 md:p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
