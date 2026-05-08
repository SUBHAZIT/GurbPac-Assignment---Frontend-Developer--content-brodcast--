import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { contentService } from '@/services/content.service';
import DashboardLayout from '@/components/shared/DashboardLayout';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Plus, 
  Search, 
  ExternalLink, 
  AlertCircle,
  Clock,
  CheckCircle2,
  XCircle,
  Trash2,
  StopCircle,
  Radio,
  AlertTriangle,
  Info,
  Film,
  Image as ImageIcon,
  Music,
  FileText,
  File
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import { format } from 'date-fns';

export default function TeacherContent() {
  const { user } = useAuth();
  const [content, setContent] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showDeleted, setShowDeleted] = useState(false);

  useEffect(() => {
    async function fetchContent() {
      try {
        const data = await contentService.getMyContent(user?.id);
        setContent(data);
      } catch (error) {
        toast.error('Failed to fetch content');
      } finally {
        setLoading(false);
      }
    }
    if (user?.id) fetchContent();
  }, [user]);

  const filteredContent = content.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.subject.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (showDeleted) {
      return matchesSearch && item.is_deleted;
    }
    return matchesSearch;
  });

  const deletedCount = content.filter(i => i.is_deleted).length;
  const stoppedCount = content.filter(i => i.is_broadcasting === false && !i.is_deleted && i.status === 'approved').length;

  const getStatusBadge = (item) => {
    // Deleted content
    if (item.is_deleted) {
      return (
        <Badge className="bg-red-100 text-red-700 border-red-200 gap-1">
          <Trash2 className="h-3 w-3" /> Deleted by Principal
        </Badge>
      );
    }

    // Stopped content
    if (item.status === 'approved' && item.is_broadcasting === false) {
      return (
        <Badge className="bg-orange-100 text-orange-700 border-orange-200 gap-1">
          <StopCircle className="h-3 w-3" /> Broadcasting Stopped
        </Badge>
      );
    }

    // Check if live
    const now = new Date();
    const hasTimes = item.start_time && item.end_time;
    const isWithinWindow = hasTimes 
      ? (new Date(item.start_time) <= now && new Date(item.end_time) >= now)
      : true; // Legacy content is always live if approved and broadcasting

    const isLive = item.status === 'approved'
      && item.is_broadcasting !== false
      && !item.is_deleted
      && isWithinWindow;

    if (isLive) {
      return (
        <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200 gap-1 animate-pulse">
          <Radio className="h-3 w-3" /> Live Now
        </Badge>
      );
    }

    switch (item.status) {
      case 'approved':
        return <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200 hover:bg-emerald-100"><CheckCircle2 className="h-3 w-3 mr-1" /> Approved</Badge>;
      case 'rejected':
        return <Badge variant="destructive" className="bg-rose-100 text-rose-700 border-rose-200 hover:bg-rose-100"><XCircle className="h-3 w-3 mr-1" /> Rejected</Badge>;
      default:
        return <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200"><Clock className="h-3 w-3 mr-1" /> Pending</Badge>;
    }
  };

  return (
    <DashboardLayout allowedRole="teacher">
      <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">My Content</h1>
            <p className="text-slate-500 mt-1">Manage and track your broadcast submissions.</p>
          </div>
          <Link to="/teacher/upload">
            <Button className="bg-teal-500 hover:bg-teal-600 gap-2">
              <Plus className="h-4 w-4" /> New Submission
            </Button>
          </Link>
        </div>

        {/* Alerts for deleted / stopped content */}
        {(deletedCount > 0 || stoppedCount > 0) && (
          <div className="flex flex-col sm:flex-row gap-3">
            {deletedCount > 0 && (
              <button 
                onClick={() => setShowDeleted(!showDeleted)}
                className={`flex items-center gap-3 p-4 rounded-xl border transition-all text-left flex-1 ${
                  showDeleted 
                    ? 'bg-red-50 border-red-200 shadow-sm shadow-red-100' 
                    : 'bg-white border-slate-200 hover:border-red-200 hover:bg-red-50/50'
                }`}
              >
                <div className={`p-2 rounded-lg ${showDeleted ? 'bg-red-100' : 'bg-red-50'}`}>
                  <Trash2 className="h-4 w-4 text-red-500" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-bold text-slate-900">
                    {deletedCount} Deleted Content{deletedCount !== 1 ? 's' : ''}
                  </p>
                  <p className="text-xs text-slate-500">
                    {showDeleted ? 'Showing deleted content' : 'Click to view deleted content with reasons'}
                  </p>
                </div>
                <Badge className={`${showDeleted ? 'bg-red-500 text-white' : 'bg-red-100 text-red-600'} text-xs`}>
                  {showDeleted ? 'Viewing' : deletedCount}
                </Badge>
              </button>
            )}
            {stoppedCount > 0 && (
              <div className="flex items-center gap-3 p-4 bg-amber-50 rounded-xl border border-amber-200 flex-1">
                <div className="p-2 bg-amber-100 rounded-lg">
                  <StopCircle className="h-4 w-4 text-amber-600" />
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-900">
                    {stoppedCount} Broadcast{stoppedCount !== 1 ? 's' : ''} Stopped
                  </p>
                  <p className="text-xs text-slate-500">Broadcasting paused by principal</p>
                </div>
              </div>
            )}
          </div>
        )}

        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">

          <div className="p-4 border-b border-slate-100 flex items-center gap-3">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input 
                type="text" 
                placeholder="Search by title or subject..." 
                className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 transition-all"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            {showDeleted && (
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-slate-500 text-xs"
                onClick={() => setShowDeleted(false)}
              >
                Show All
              </Button>
            )}
          </div>

          <div className="overflow-x-auto">
            <Table>
            <TableHeader className="bg-slate-50/50">
              <TableRow>
                <TableHead className="font-semibold text-slate-700 min-w-[200px]">Content</TableHead>
                <TableHead className="font-semibold text-slate-700 min-w-[120px]">Subject</TableHead>
                <TableHead className="font-semibold text-slate-700 min-w-[150px]">Schedule</TableHead>
                <TableHead className="font-semibold text-slate-700 min-w-[220px]">Status</TableHead>
                <TableHead className="text-right font-semibold text-slate-700">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                Array(5).fill(0).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell><div className="h-10 w-40 bg-slate-100 animate-pulse rounded" /></TableCell>
                    <TableCell><div className="h-6 w-20 bg-slate-100 animate-pulse rounded" /></TableCell>
                    <TableCell><div className="h-10 w-32 bg-slate-100 animate-pulse rounded" /></TableCell>
                    <TableCell><div className="h-6 w-24 bg-slate-100 animate-pulse rounded" /></TableCell>
                    <TableCell><div className="h-8 w-8 bg-slate-100 animate-pulse rounded ml-auto" /></TableCell>
                  </TableRow>
                ))
              ) : filteredContent.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-64 text-center">
                    <div className="flex flex-col items-center justify-center text-slate-400">
                      <div className="p-4 bg-slate-50 rounded-full mb-3">
                        <FileText className="h-8 w-8" />
                      </div>
                      <p className="font-medium text-slate-900">
                        {showDeleted ? 'No deleted content found' : 'No content found'}
                      </p>
                      <p className="text-sm">
                        {showDeleted ? 'No content has been deleted by the principal.' : 'Try adjusting your search or upload something new.'}
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filteredContent.map((item) => (
                  <TableRow key={item.id} className={`group hover:bg-slate-50/50 transition-colors ${item.is_deleted ? 'bg-red-50/30' : ''}`}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className={`h-10 w-16 rounded-md overflow-hidden bg-slate-100 border border-slate-200 relative ${item.is_deleted ? 'opacity-50' : ''}`}>
                          {item.file_type === 'video' ? (
                            <video src={item.file_url} className="w-full h-full object-cover" muted />
                          ) : item.file_type === 'image' ? (
                            <img src={item.file_url} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-slate-400 bg-slate-50">
                              {item.file_type === 'pdf' ? <FileText className="h-4 w-4" /> :
                               item.file_type === 'audio' ? <Music className="h-4 w-4" /> :
                               <File className="h-4 w-4" />}
                            </div>
                          )}
                          {item.is_deleted && (
                            <div className="absolute inset-0 bg-red-500/20 flex items-center justify-center">
                              <Trash2 className="h-4 w-4 text-red-600" />
                            </div>
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className={`font-semibold truncate ${item.is_deleted ? 'text-slate-400 line-through' : 'text-slate-900'}`} title={item.title}>{item.title}</p>
                          <p className="text-xs text-slate-500 truncate" title={item.description}>{item.description || 'No description'}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="font-medium">{item.subject}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="text-xs space-y-1">
                        {item.start_time ? (
                          <>
                            <p className="text-slate-600 flex items-center gap-1">
                              <span className="font-bold text-[10px] uppercase text-slate-400">Start:</span> {format(new Date(item.start_time), 'MMM d, HH:mm')}
                            </p>
                            <p className="text-slate-600 flex items-center gap-1">
                              <span className="font-bold text-[10px] uppercase text-slate-400">End:</span> {format(new Date(item.end_time), 'MMM d, HH:mm')}
                            </p>
                          </>
                        ) : (
                          <p className="text-slate-400 italic">No schedule set (Always Live)</p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-2">
                        {getStatusBadge(item)}
                        
                        {/* Rejection reason */}
                        {item.status === 'rejected' && !item.is_deleted && (
                          <div className="flex items-start gap-1.5 p-2 bg-rose-50 rounded-lg text-[11px] text-rose-700 border border-rose-100 w-full max-w-[280px]">

                            <AlertCircle className="h-3 w-3 shrink-0 mt-0.5" />
                            <p><span className="font-bold">Reason:</span> {item.rejection_reason || 'No reason provided'}</p>
                          </div>
                        )}

                        {/* Deletion reason — shown prominently */}
                        {item.is_deleted && (
                          <div className="flex items-start gap-1.5 p-2.5 bg-red-50 rounded-lg text-[11px] text-red-700 border border-red-200 w-full max-w-[280px]">

                            <AlertTriangle className="h-3.5 w-3.5 shrink-0 mt-0.5 text-red-500" />
                            <div>
                              <p className="font-bold mb-0.5">Deletion Reason:</p>
                              <p className="leading-relaxed">{item.deletion_reason || 'No reason provided'}</p>
                              {item.deleted_at && (
                                <p className="text-[10px] text-red-400 mt-1">
                                  Deleted on {format(new Date(item.deleted_at), 'MMM d, yyyy \'at\' HH:mm')}
                                </p>
                              )}
                            </div>
                          </div>
                        )}

                        {/* Stop reason */}
                        {!item.is_deleted && item.is_broadcasting === false && item.stop_reason && item.status === 'approved' && (
                          <div className="flex items-start gap-1.5 p-2 bg-amber-50 rounded-lg text-[11px] text-amber-700 border border-amber-200 w-full max-w-[280px]">

                            <StopCircle className="h-3 w-3 shrink-0 mt-0.5 text-amber-500" />
                            <div>
                              <p className="font-bold mb-0.5">Stop Reason:</p>
                              <p>{item.stop_reason}</p>
                              {item.stopped_at && (
                                <p className="text-[10px] text-amber-400 mt-1">
                                  Stopped on {format(new Date(item.stopped_at), 'MMM d, yyyy \'at\' HH:mm')}
                                </p>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      {!item.is_deleted ? (
                        <div className="flex items-center justify-end">
                          <a href={`/preview?url=${encodeURIComponent(item.file_url)}&type=${item.file_type}`} target="_blank" rel="noopener noreferrer">
                            <Button variant="ghost" size="sm" className="gap-2 text-slate-600 hover:text-teal-600 hover:bg-teal-50">
                              <ExternalLink className="h-4 w-4" />
                              Preview
                            </Button>
                          </a>
                        </div>
                      ) : (
                        <Badge variant="outline" className="text-[10px] text-red-400 border-red-200">
                          Removed
                        </Badge>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

