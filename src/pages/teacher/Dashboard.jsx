import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { contentService } from '@/services/content.service';
import DashboardLayout from '@/components/shared/DashboardLayout';
import { StatsCards } from '@/components/shared/StatsCards';
import { Button } from '@/components/ui/button';
import { Plus, ArrowRight, Play, FolderOpen, Calendar, TrendingUp, BookOpen } from 'lucide-react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';

export default function TeacherDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const firstName = user?.profile?.full_name?.split(' ')[0] || 'there';

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good Morning' : hour < 17 ? 'Good Afternoon' : 'Good Evening';

  useEffect(() => {
    async function fetchStats() {
      try {
        const data = await contentService.getStats('teacher', user?.id);
        setStats(data);
      } catch (error) {
        toast.error('Failed to fetch dashboard stats');
      } finally {
        setLoading(false);
      }
    }
    if (user?.id) fetchStats();
  }, [user]);

  return (
    <DashboardLayout allowedRole="teacher">
      <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
        {/* Greeting Banner */}
        <div className="bg-gradient-to-r from-teal-500 to-emerald-500 rounded-3xl p-8 text-white relative overflow-hidden">
          <div className="absolute -right-12 -top-12 w-48 h-48 bg-white/10 rounded-full" />
          <div className="absolute right-20 bottom-0 w-32 h-32 bg-white/5 rounded-full" />
          <div className="relative z-10">
            <p className="text-teal-100 text-sm font-semibold mb-1">{greeting} 👋</p>
            <h1 className="text-3xl font-bold tracking-tight">Hello, {firstName}!</h1>
            <p className="text-teal-100 mt-2 max-w-md">
              Welcome to your teaching portal. Upload content, track approvals, and manage your broadcasts.
            </p>
          </div>
          <div className="absolute right-8 top-1/2 -translate-y-1/2 hidden md:flex gap-4">
            <Link to="/teacher/upload">
              <Button className="bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white border border-white/20 gap-2 rounded-xl">
                <Plus className="h-4 w-4" /> Upload New
              </Button>
            </Link>
          </div>
        </div>

        <StatsCards stats={stats} loading={loading} />

        {/* Quick Actions & Info */}
        <div className="grid gap-6 md:grid-cols-3">
          <Link to="/teacher/upload" className="group">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md hover:border-teal-200 transition-all h-full">
              <div className="p-3 bg-teal-50 text-teal-600 rounded-xl w-fit mb-4 group-hover:bg-teal-500 group-hover:text-white transition-colors">
                <Plus className="h-6 w-6" />
              </div>
              <h3 className="font-bold text-slate-900 mb-1">Upload Content</h3>
              <p className="text-sm text-slate-500">Add new images or media for broadcast approval.</p>
            </div>
          </Link>

          <Link to="/teacher/content" className="group">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md hover:border-emerald-200 transition-all h-full">
              <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl w-fit mb-4 group-hover:bg-emerald-500 group-hover:text-white transition-colors">
                <FolderOpen className="h-6 w-6" />
              </div>
              <h3 className="font-bold text-slate-900 mb-1">My Submissions</h3>
              <p className="text-sm text-slate-500">View approval status and rejection feedback.</p>
            </div>
          </Link>

          <Link to={`/live/${user?.id}`} target="_blank" className="group">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md hover:border-blue-200 transition-all h-full">
              <div className="p-3 bg-blue-50 text-blue-600 rounded-xl w-fit mb-4 group-hover:bg-blue-500 group-hover:text-white transition-colors">
                <Play className="h-6 w-6" />
              </div>
              <h3 className="font-bold text-slate-900 mb-1">Live Preview</h3>
              <p className="text-sm text-slate-500">See how your approved content looks on the public page.</p>
            </div>
          </Link>
        </div>

        {/* Info Cards */}
        <div className="grid gap-6 md:grid-cols-2">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-amber-50 rounded-lg">
                <Calendar className="h-5 w-5 text-amber-600" />
              </div>
              <h3 className="font-bold text-slate-900">How It Works</h3>
            </div>
            <ol className="space-y-3 text-sm text-slate-600">
              <li className="flex gap-3">
                <span className="flex-shrink-0 h-6 w-6 rounded-full bg-teal-50 text-teal-600 flex items-center justify-center text-xs font-bold">1</span>
                Upload your content with title, subject, and schedule.
              </li>
              <li className="flex gap-3">
                <span className="flex-shrink-0 h-6 w-6 rounded-full bg-teal-50 text-teal-600 flex items-center justify-center text-xs font-bold">2</span>
                Your principal reviews and approves or provides feedback.
              </li>
              <li className="flex gap-3">
                <span className="flex-shrink-0 h-6 w-6 rounded-full bg-teal-50 text-teal-600 flex items-center justify-center text-xs font-bold">3</span>
                Approved content goes live at the scheduled time for students.
              </li>
            </ol>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-teal-50 rounded-lg">
                <TrendingUp className="h-5 w-5 text-teal-600" />
              </div>
              <h3 className="font-bold text-slate-900">Quick Stats</h3>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between py-2 border-b border-slate-100">
                <span className="text-sm text-slate-600">Approval Rate</span>
                <span className="text-sm font-bold text-slate-900">
                  {stats?.total ? Math.round((stats.approved / stats.total) * 100) : 0}%
                </span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-slate-100">
                <span className="text-sm text-slate-600">Pending Review</span>
                <span className="text-sm font-bold text-amber-600">{stats?.pending || 0} items</span>
              </div>
              <div className="flex items-center justify-between py-2">
                <span className="text-sm text-slate-600">Active Broadcasts</span>
                <span className="text-sm font-bold text-emerald-600">{stats?.approved || 0} approved</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
