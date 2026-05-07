import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { contentService } from '@/services/content.service';
import DashboardLayout from '@/components/shared/DashboardLayout';
import { StatsCards } from '@/components/shared/StatsCards';
import { Button } from '@/components/ui/button';
import { CheckCircle, Users, ArrowRight, Play } from 'lucide-react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';

export default function PrincipalDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

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
    }
    fetchStats();
  }, []);

  return (
    <DashboardLayout allowedRole="principal">
      <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Principal Dashboard</h1>
            <p className="text-slate-500 mt-1">Review and manage institutional content broadcasts.</p>
          </div>
          <div className="flex gap-3">
            <Link to="/principal/pending">
              <Button className="bg-indigo-600 hover:bg-indigo-700 gap-2 shadow-lg shadow-indigo-100">
                <CheckCircle className="h-4 w-4" /> Review Pending
              </Button>
            </Link>
          </div>
        </div>

        <StatsCards stats={stats} loading={loading} />

        <div className="grid gap-6 md:grid-cols-2">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-bold text-slate-900">Recent Overview</h3>
              <Link to="/principal/content" className="text-xs font-semibold text-indigo-600 hover:underline">
                View All
              </Link>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-amber-100 text-amber-600 rounded-lg">
                    <Clock className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-900">Pending Review</p>
                    <p className="text-xs text-slate-500">{stats?.pending || 0} items waiting for approval</p>
                  </div>
                </div>
                <Link to="/principal/pending">
                  <Button variant="ghost" size="sm" className="h-8 text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50">
                    Review <ArrowRight className="h-3 w-3 ml-1" />
                  </Button>
                </Link>
              </div>

              <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-indigo-100 text-indigo-600 rounded-lg">
                    <Users className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-900">Total Content</p>
                    <p className="text-xs text-slate-500">{stats?.total || 0} items in the system</p>
                  </div>
                </div>
                <Link to="/principal/content">
                  <Button variant="ghost" size="sm" className="h-8 text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50">
                    Explore <ArrowRight className="h-3 w-3 ml-1" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>

          <div className="bg-indigo-600 p-8 rounded-3xl shadow-xl shadow-indigo-100 flex flex-col justify-between text-white relative overflow-hidden group">
            <div className="absolute -right-8 -top-8 bg-indigo-500 h-40 w-40 rounded-full transition-transform group-hover:scale-110 duration-700" />
            <div className="relative z-10">
              <div className="h-12 w-12 bg-white/20 rounded-2xl backdrop-blur-md flex items-center justify-center mb-6">
                <Play className="h-6 w-6 text-white fill-white" />
              </div>
              <h3 className="text-2xl font-bold mb-2">Public Broadcast</h3>
              <p className="text-indigo-100 text-sm max-w-[200px]">
                Monitor what students are seeing right now across all subjects.
              </p>
            </div>
            <div className="relative z-10 pt-8">
              <Button variant="secondary" className="w-full bg-white text-indigo-600 hover:bg-indigo-50 font-bold py-6 rounded-xl" asChild>
                <Link to="/live/all" target="_blank">View Live Feed</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

function Clock({ className }) {
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
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  );
}
