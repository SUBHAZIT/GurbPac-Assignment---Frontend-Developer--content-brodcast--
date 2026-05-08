import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { contentService } from '@/services/content.service';
import DashboardLayout from '@/components/shared/DashboardLayout';
import { StatsCards } from '@/components/shared/StatsCards';
import { Button } from '@/components/ui/button';
import { CheckCircle, Users, ArrowRight, Play, Clock, ShieldCheck, BarChart3, History, Radio, StopCircle, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';

export default function PrincipalDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const firstName = user?.profile?.full_name?.split(' ')[0] || 'there';

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good Morning' : hour < 17 ? 'Good Afternoon' : 'Good Evening';

  useEffect(() => {
    async function fetchStats() {
      try {
        const data = await contentService.getStats('principal');
        setStats(data);
      } catch (error) {
        toast.error('Failed to fetch dashboard stats');
      } finally {
        setLoading(false);
      }
      // Auto-expire silently (don't block dashboard)
      try { await contentService.autoExpireBroadcasts(); } catch {}
    }
    fetchStats();
  }, []);

  return (
    <DashboardLayout allowedRole="principal">
      <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
        {/* Greeting Banner */}
        <div className="bg-gradient-to-r from-slate-900 to-slate-800 rounded-2xl md:rounded-3xl p-5 md:p-8 text-white relative overflow-hidden">
          <div className="absolute -right-16 -top-16 w-56 h-56 bg-teal-500/10 rounded-full" />
          <div className="absolute right-24 bottom-0 w-36 h-36 bg-teal-500/5 rounded-full" />
          <div className="absolute left-0 top-0 w-full h-1 bg-gradient-to-r from-teal-400 via-emerald-400 to-cyan-400" />
          <div className="relative z-10">
            <p className="text-slate-400 text-xs md:text-sm font-semibold mb-1">{greeting} 👋</p>
            <h1 className="text-xl md:text-3xl font-bold tracking-tight">Hello, {firstName}!</h1>
            <p className="text-slate-400 mt-2 max-w-md text-sm hidden sm:block">
              Welcome to the admin portal. Review pending content, manage approvals, and monitor broadcasts.
            </p>
          </div>
          <div className="absolute right-8 top-1/2 -translate-y-1/2 hidden md:flex gap-4">
            <Link to="/principal/pending">
              <Button className="bg-teal-500 hover:bg-teal-600 text-white gap-2 rounded-xl shadow-lg shadow-teal-500/20">
                <CheckCircle className="h-4 w-4" /> Review Pending
              </Button>
            </Link>
          </div>
        </div>

        <StatsCards stats={stats} loading={loading} />

        {/* Action Cards */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <Link to="/principal/pending" className="group">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md hover:border-amber-200 transition-all h-full">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-amber-50 text-amber-600 rounded-xl group-hover:bg-amber-500 group-hover:text-white transition-colors">
                  <Clock className="h-6 w-6" />
                </div>
                {stats?.pending > 0 && (
                  <span className="h-7 min-w-[28px] px-2 rounded-full bg-amber-500 text-white text-xs font-bold flex items-center justify-center animate-pulse">
                    {stats.pending}
                  </span>
                )}
              </div>
              <h3 className="font-bold text-slate-900 mb-1">Pending Review</h3>
              <p className="text-sm text-slate-500">{stats?.pending || 0} items waiting for your approval.</p>
            </div>
          </Link>

          <Link to="/principal/content" className="group">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md hover:border-teal-200 transition-all h-full">
              <div className="p-3 bg-teal-50 text-teal-600 rounded-xl w-fit mb-4 group-hover:bg-teal-500 group-hover:text-white transition-colors">
                <Users className="h-6 w-6" />
              </div>
              <h3 className="font-bold text-slate-900 mb-1">Content Library</h3>
              <p className="text-sm text-slate-500">Browse, stop, or delete submissions.</p>
            </div>
          </Link>

          <Link to="/principal/history" className="group">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md hover:border-violet-200 transition-all h-full">
              <div className="p-3 bg-violet-50 text-violet-600 rounded-xl w-fit mb-4 group-hover:bg-violet-500 group-hover:text-white transition-colors">
                <History className="h-6 w-6" />
              </div>
              <h3 className="font-bold text-slate-900 mb-1">Broadcast History</h3>
              <p className="text-sm text-slate-500">Track all broadcasting events.</p>
            </div>
          </Link>

          <Link to="/live/all" target="_blank" className="group">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md hover:border-blue-200 transition-all h-full">
              <div className="p-3 bg-blue-50 text-blue-600 rounded-xl w-fit mb-4 group-hover:bg-blue-500 group-hover:text-white transition-colors">
                <Play className="h-6 w-6" />
              </div>
              <h3 className="font-bold text-slate-900 mb-1">Live Broadcast</h3>
              <p className="text-sm text-slate-500">Monitor what students see now.</p>
            </div>
          </Link>
        </div>

        {/* Bottom Row */}
        <div className="grid gap-6 md:grid-cols-2">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-teal-50 rounded-lg">
                <BarChart3 className="h-5 w-5 text-teal-600" />
              </div>
              <h3 className="font-bold text-slate-900">Content Overview</h3>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between py-2 border-b border-slate-100">
                <span className="text-sm text-slate-600">Total Submissions</span>
                <span className="text-sm font-bold text-slate-900">{stats?.total || 0}</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <Radio className="h-3.5 w-3.5 text-emerald-500" />
                  <span className="text-sm text-slate-600">Currently Broadcasting</span>
                </div>
                <span className="text-sm font-bold text-emerald-600">{stats?.broadcasting || 0}</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-slate-100">
                <span className="text-sm text-slate-600">Approval Rate</span>
                <span className="text-sm font-bold text-emerald-600">
                  {stats?.total ? Math.round((stats.approved / stats.total) * 100) : 0}%
                </span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-slate-100">
                <span className="text-sm text-slate-600">Rejection Rate</span>
                <span className="text-sm font-bold text-rose-600">
                  {stats?.total ? Math.round((stats.rejected / stats.total) * 100) : 0}%
                </span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <Trash2 className="h-3.5 w-3.5 text-red-400" />
                  <span className="text-sm text-slate-600">Deleted Content</span>
                </div>
                <span className="text-sm font-bold text-red-600">{stats?.deleted || 0}</span>
              </div>
              <div className="flex items-center justify-between py-2">
                <span className="text-sm text-slate-600">Awaiting Action</span>
                <span className="text-sm font-bold text-amber-600">{stats?.pending || 0}</span>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-teal-500 to-emerald-600 p-8 rounded-3xl shadow-xl shadow-teal-100 flex flex-col justify-between text-white relative overflow-hidden group">
            <div className="absolute -right-8 -top-8 bg-white/10 h-40 w-40 rounded-full transition-transform group-hover:scale-110 duration-700" />
            <div className="relative z-10">
              <div className="h-12 w-12 bg-white/20 rounded-2xl backdrop-blur-md flex items-center justify-center mb-6">
                <ShieldCheck className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-2xl font-bold mb-2">Institution Control</h3>
              <p className="text-teal-100 text-sm max-w-[200px]">
                All content is moderated and approved before reaching students.
              </p>
            </div>
            <div className="relative z-10 pt-8">
              <Button variant="secondary" className="w-full bg-white text-teal-600 hover:bg-teal-50 font-bold py-6 rounded-xl" asChild>
                <Link to="/principal/pending">Review Submissions</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
