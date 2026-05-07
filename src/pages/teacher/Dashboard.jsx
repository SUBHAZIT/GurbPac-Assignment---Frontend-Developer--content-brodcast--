import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { contentService } from '@/services/content.service';
import DashboardLayout from '@/components/shared/DashboardLayout';
import { StatsCards } from '@/components/shared/StatsCards';
import { Button } from '@/components/ui/button';
import { Plus, ArrowRight, Play } from 'lucide-react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';

export default function TeacherDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

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
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Teacher Dashboard</h1>
            <p className="text-slate-500 mt-1">Track your content uploads and broadcast status.</p>
          </div>
          <div className="flex gap-3">
            <Link to="/teacher/content">
              <Button variant="outline" className="gap-2">
                View My Content <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link to="/teacher/upload">
              <Button className="bg-indigo-600 hover:bg-indigo-700 gap-2">
                <Plus className="h-4 w-4" /> Upload New
              </Button>
            </Link>
          </div>
        </div>

        <StatsCards stats={stats} loading={loading} />

        <div className="grid gap-6 md:grid-cols-2">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <h3 className="font-bold text-slate-900 mb-4">Quick Actions</h3>
            <div className="grid grid-cols-1 gap-3">
              <Link to="/teacher/upload">
                <div className="group p-4 rounded-xl border border-slate-100 bg-slate-50 hover:bg-indigo-50 hover:border-indigo-100 transition-all cursor-pointer">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-indigo-100 text-indigo-600 rounded-lg group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                      <Plus className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-semibold text-slate-900">Upload Content</p>
                      <p className="text-sm text-slate-500">Add images or videos to the system</p>
                    </div>
                  </div>
                </div>
              </Link>
              <Link to="/teacher/content">
                <div className="group p-4 rounded-xl border border-slate-100 bg-slate-50 hover:bg-emerald-50 hover:border-emerald-100 transition-all cursor-pointer">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-emerald-100 text-emerald-600 rounded-lg group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                      <FileStack className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-semibold text-slate-900">Check Status</p>
                      <p className="text-sm text-slate-500">View approvals and feedback</p>
                    </div>
                  </div>
                </div>
              </Link>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-center items-center text-center">
            <div className="h-16 w-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
              <Play className="h-8 w-8 text-slate-300" />
            </div>
            <h3 className="font-bold text-slate-900">Live Preview</h3>
            <p className="text-sm text-slate-500 max-w-[250px] mt-2 mb-6">
              View how your approved content looks on the public broadcast page.
            </p>
            <Link to={`/live/${user?.id}`} target="_blank">
              <Button variant="secondary" size="sm">
                Open Public Page
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

function FileStack({ className }) {
  return (
    <svg 
      className={className} 
      xmlns="http://www.w3.org/2000/svg" 
      width="24" 
      height="24" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    >
      <path d="M4 7V4a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v3" />
      <path d="M2 11v10a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V11" />
      <path d="M7 15h10" />
      <path d="M7 19h10" />
    </svg>
  );
}
