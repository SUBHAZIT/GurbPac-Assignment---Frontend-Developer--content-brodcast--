import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { engagementService } from '@/services/engagement.service';
import DashboardLayout from '@/components/shared/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Clock, Eye, Heart, Play, Film, FileText, Music, Image as ImageIcon,
  History, TrendingUp, BarChart3
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';

function formatDuration(seconds) {
  if (!seconds || seconds === 0) return '0s';
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  if (hrs > 0) return `${hrs}h ${mins}m`;
  if (mins > 0) return `${mins}m ${secs}s`;
  return `${secs}s`;
}

function getTypeIcon(type) {
  switch (type) {
    case 'video': return <Film className="h-4 w-4 text-purple-400" />;
    case 'pdf': return <FileText className="h-4 w-4 text-rose-400" />;
    case 'audio': return <Music className="h-4 w-4 text-amber-400" />;
    default: return <ImageIcon className="h-4 w-4 text-blue-400" />;
  }
}

function getTypeBg(type) {
  switch (type) {
    case 'video': return 'bg-purple-50';
    case 'pdf': return 'bg-rose-50';
    case 'audio': return 'bg-amber-50';
    default: return 'bg-blue-50';
  }
}

export default function ViewerDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({ totalSeconds: 0, itemsWatched: 0, totalLikes: 0 });
  const [history, setHistory] = useState([]);
  const [likedContent, setLikedContent] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('history');

  const firstName = user?.profile?.full_name?.split(' ')[0] || 'there';
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good Morning' : hour < 17 ? 'Good Afternoon' : 'Good Evening';

  useEffect(() => {
    if (!user) return;
    async function load() {
      setLoading(true);
      try {
        const [s, h, l] = await Promise.all([
          engagementService.getWatchStats(user.id),
          engagementService.getWatchHistory(user.id),
          engagementService.getLikedContent(user.id),
        ]);
        setStats(s);
        setHistory(h);
        setLikedContent(l);
      } catch (e) {
        console.error('Failed to load viewer data:', e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [user]);

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
        {/* Greeting Banner */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-teal-500 via-emerald-500 to-cyan-600 p-5 md:p-8 text-white">
          <div className="absolute top-[-30%] right-[-10%] w-72 h-72 bg-white/10 rounded-full" />
          <div className="absolute bottom-[-20%] left-[-5%] w-48 h-48 bg-black/5 rounded-full" />
          <div className="relative z-10">
            <p className="text-white/70 text-xs md:text-sm font-semibold">{greeting} 👋</p>
            <h1 className="text-xl md:text-3xl font-bold mt-1">Hello, {firstName}!</h1>
            <p className="text-white/60 text-sm mt-2 max-w-lg hidden sm:block">
              Welcome to your learning dashboard. Track your viewing progress, revisit favorite content, and keep learning.
            </p>
            <Link to="/live/all">
              <button className="mt-4 inline-flex items-center gap-2 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white font-semibold text-sm px-5 py-2.5 rounded-xl transition-all">
                <Play className="h-4 w-4" /> Watch Live Broadcasts
              </button>
            </Link>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card className="border-none shadow-sm">
            <CardContent className="flex items-center gap-4 pt-6">
              <div className="p-3 bg-teal-50 rounded-xl">
                <Clock className="h-6 w-6 text-teal-600" />
              </div>
              <div>
                <p className="text-sm text-slate-500">Total Watch Time</p>
                <p className="text-2xl font-bold text-slate-900">{formatDuration(stats.totalSeconds)}</p>
              </div>
            </CardContent>
          </Card>
          <Card className="border-none shadow-sm">
            <CardContent className="flex items-center gap-4 pt-6">
              <div className="p-3 bg-blue-50 rounded-xl">
                <Eye className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-slate-500">Content Watched</p>
                <p className="text-2xl font-bold text-slate-900">{stats.itemsWatched}</p>
              </div>
            </CardContent>
          </Card>
          <Card className="border-none shadow-sm">
            <CardContent className="flex items-center gap-4 pt-6">
              <div className="p-3 bg-rose-50 rounded-xl">
                <Heart className="h-6 w-6 text-rose-500" />
              </div>
              <div>
                <p className="text-sm text-slate-500">Content Liked</p>
                <p className="text-2xl font-bold text-slate-900">{stats.totalLikes}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 p-1 bg-slate-100 rounded-xl w-fit">
          <button onClick={() => setActiveTab('history')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${activeTab === 'history' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
            <History className="h-4 w-4" /> Watch History
          </button>
          <button onClick={() => setActiveTab('liked')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${activeTab === 'liked' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
            <Heart className="h-4 w-4" /> Liked
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === 'history' && (
          <div className="space-y-3">
            {loading ? (
              Array(4).fill(0).map((_, i) => (
                <div key={i} className="h-20 bg-white rounded-xl border border-slate-100 animate-pulse" />
              ))
            ) : history.length === 0 ? (
              <Card className="border-none shadow-sm">
                <CardContent className="flex flex-col items-center justify-center py-16 text-slate-400">
                  <Eye className="h-10 w-10 mb-3 text-slate-300" />
                  <p className="font-semibold">No watch history yet</p>
                  <p className="text-sm mt-1">Start watching broadcasts to build your history.</p>
                  <Link to="/live/all" className="mt-4">
                    <button className="bg-teal-500 hover:bg-teal-600 text-white font-semibold text-sm px-5 py-2.5 rounded-xl transition-all">
                      Browse Broadcasts
                    </button>
                  </Link>
                </CardContent>
              </Card>
            ) : (
              history.map((item) => (
                <div key={item.id} className="flex items-center gap-4 p-4 bg-white rounded-xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow group">
                  {/* Thumbnail */}
                  <div className="h-14 w-20 rounded-lg overflow-hidden flex-shrink-0 bg-slate-100">
                    {item.content?.file_type === 'image' && item.content?.file_url ? (
                      <img src={item.content.file_url} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <div className={`w-full h-full flex items-center justify-center ${getTypeBg(item.content?.file_type)}`}>
                        {getTypeIcon(item.content?.file_type)}
                      </div>
                    )}
                  </div>
                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-900 truncate">{item.content?.title || 'Untitled'}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="outline" className="text-[10px] py-0 capitalize">{item.content?.subject}</Badge>
                      <span className="text-[10px] text-slate-400 flex items-center gap-1">
                        <Clock className="h-2.5 w-2.5" /> {formatDuration(item.watch_duration)}
                      </span>
                    </div>
                  </div>
                  {/* Time */}
                  <div className="text-right flex-shrink-0 hidden sm:block">
                    <p className="text-[10px] text-slate-400">
                      {item.last_watched ? format(new Date(item.last_watched), 'MMM d, h:mm a') : 'N/A'}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === 'liked' && (
          <div className="space-y-3">
            {loading ? (
              Array(3).fill(0).map((_, i) => (
                <div key={i} className="h-20 bg-white rounded-xl border border-slate-100 animate-pulse" />
              ))
            ) : likedContent.length === 0 ? (
              <Card className="border-none shadow-sm">
                <CardContent className="flex flex-col items-center justify-center py-16 text-slate-400">
                  <Heart className="h-10 w-10 mb-3 text-slate-300" />
                  <p className="font-semibold">No liked content</p>
                  <p className="text-sm mt-1">Like broadcasts to save them here.</p>
                </CardContent>
              </Card>
            ) : (
              likedContent.map((item) => (
                <div key={item.id} className="flex items-center gap-4 p-4 bg-white rounded-xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                  <div className="h-14 w-20 rounded-lg overflow-hidden flex-shrink-0 bg-slate-100">
                    {item.content?.file_type === 'image' && item.content?.file_url ? (
                      <img src={item.content.file_url} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <div className={`w-full h-full flex items-center justify-center ${getTypeBg(item.content?.file_type)}`}>
                        {getTypeIcon(item.content?.file_type)}
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-900 truncate">{item.content?.title || 'Untitled'}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="outline" className="text-[10px] py-0 capitalize">{item.content?.subject}</Badge>
                      <Badge variant="outline" className="text-[10px] py-0 capitalize gap-1">{getTypeIcon(item.content?.file_type)} {item.content?.file_type}</Badge>
                    </div>
                  </div>
                  <Heart className="h-4 w-4 text-rose-400 fill-rose-400 flex-shrink-0" />
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
