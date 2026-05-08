import { useState, useEffect, useCallback } from 'react';
import { contentService } from '@/services/content.service';
import { useAuth } from '@/context/AuthContext';
import DashboardLayout from '@/components/shared/DashboardLayout';
import { ApprovalModal } from '@/components/principal/ApprovalModal';
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
import { Input } from '@/components/ui/input';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { 
  Search, 
  Filter, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  ExternalLink,
  StopCircle,
  Trash2,
  Play,
  Radio,
  AlertTriangle,
  RotateCcw
} from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';

export default function PrincipalAllContent() {
  const { user } = useAuth();
  const [content, setContent] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    status: 'all',
    search: '',
  });

  // Modal state
  const [selectedItem, setSelectedItem] = useState(null);
  const [modalMode, setModalMode] = useState('stop');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const data = await contentService.getAllContent(filters);
      setContent(data);
    } catch (error) {
      toast.error('Failed to fetch content');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchAll();
    }, 300);
    return () => clearTimeout(timer);
  }, [fetchAll]);

  // Auto-expire check on page load (silent fail if migration not applied)
  useEffect(() => {
    contentService.autoExpireBroadcasts().then(expired => {
      if (expired && expired.length > 0) {
        toast.info(`${expired.length} broadcast(s) auto-expired`);
        fetchAll();
      }
    }).catch(() => {});
  }, []);

  const handleAction = (item, mode) => {
    setSelectedItem(item);
    setModalMode(mode);
    setIsModalOpen(true);
  };

  const onConfirm = async (reason) => {
    if (!selectedItem) return;
    try {
      if (modalMode === 'stop') {
        await contentService.stopBroadcasting(selectedItem.id, user?.id, reason);
        toast.success('Broadcasting stopped successfully');
      } else if (modalMode === 'delete') {
        await contentService.softDeleteContent(selectedItem.id, user?.id, reason);
        toast.success('Content deleted successfully');
      }
      fetchAll();
    } catch (error) {
      toast.error(`Failed to ${modalMode} content: ${error.message}`);
    }
  };

  const handleResume = async (item) => {
    try {
      await contentService.resumeBroadcasting(item.id, user?.id);
      toast.success('Broadcasting resumed');
      fetchAll();
    } catch (error) {
      toast.error('Failed to resume broadcasting');
    }
  };

  const getStatusBadge = (item) => {
    if (item.is_deleted) {
      return (
        <Badge className="bg-red-100 text-red-700 border-red-200 gap-1">
          <Trash2 className="h-3 w-3" /> Deleted
        </Badge>
      );
    }
    
    if (item.status === 'approved' && item.is_broadcasting === false) {
      return (
        <Badge className="bg-orange-100 text-orange-700 border-orange-200 gap-1">
          <StopCircle className="h-3 w-3" /> Stopped
        </Badge>
      );
    }

    const now = new Date();
    const isLive = item.status === 'approved' 
      && item.is_broadcasting 
      && item.start_time && item.end_time
      && new Date(item.start_time) <= now 
      && new Date(item.end_time) >= now;

    if (isLive) {
      return (
        <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200 gap-1 animate-pulse">
          <Radio className="h-3 w-3" /> Live
        </Badge>
      );
    }

    switch (item.status) {
      case 'approved':
        return <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200">Approved</Badge>;
      case 'rejected':
        return <Badge variant="destructive" className="bg-rose-100 text-rose-700 border-rose-200">Rejected</Badge>;
      default:
        return <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">Pending</Badge>;
    }
  };

  const isLiveBroadcasting = (item) => {
    const now = new Date();
    return item.status === 'approved' 
      && item.is_broadcasting !== false
      && !item.is_deleted
      && item.start_time && item.end_time
      && new Date(item.start_time) <= now 
      && new Date(item.end_time) >= now;
  };

  return (
    <DashboardLayout allowedRole="principal">
      <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">All Content</h1>
          <p className="text-slate-500 mt-1">Browse, filter, and manage the entire content library.</p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex flex-col md:flex-row items-center gap-4">
            <div className="relative flex-1 w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input 
                placeholder="Search by title..." 
                className="pl-10 bg-slate-50 border-slate-200"
                value={filters.search}
                onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
              />
            </div>
            <div className="flex items-center gap-3 w-full md:w-auto">
              <div className="flex items-center gap-2 text-sm font-medium text-slate-500 whitespace-nowrap">
                <Filter className="h-4 w-4" /> Filter by:
              </div>
              <Select 
                value={filters.status} 
                onValueChange={(val) => setFilters(prev => ({ ...prev, status: val }))}
              >
                <SelectTrigger className="w-[140px] bg-slate-50 border-slate-200">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Table>
            <TableHeader className="bg-slate-50/50">
              <TableRow>
                <TableHead>Content & Teacher</TableHead>
                <TableHead>Subject</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Schedule</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                Array(5).fill(0).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell><div className="h-10 w-40 bg-slate-100 animate-pulse rounded" /></TableCell>
                    <TableCell><div className="h-6 w-20 bg-slate-100 animate-pulse rounded" /></TableCell>
                    <TableCell><div className="h-6 w-24 bg-slate-100 animate-pulse rounded" /></TableCell>
                    <TableCell><div className="h-6 w-32 bg-slate-100 animate-pulse rounded" /></TableCell>
                    <TableCell><div className="h-8 w-8 bg-slate-100 animate-pulse rounded ml-auto" /></TableCell>
                  </TableRow>
                ))
              ) : content.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-64 text-center text-slate-400">
                    No results found matching your filters.
                  </TableCell>
                </TableRow>
              ) : (
                content.map((item) => (
                  <TableRow key={item.id} className={`group hover:bg-slate-50/50 transition-colors ${item.is_deleted ? 'opacity-60' : ''}`}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-12 rounded bg-slate-100 border border-slate-200 overflow-hidden shrink-0 relative">
                          <img src={item.file_url} alt="" className="w-full h-full object-cover" />
                          {item.is_deleted && (
                            <div className="absolute inset-0 bg-red-500/20 flex items-center justify-center">
                              <Trash2 className="h-3 w-3 text-red-600" />
                            </div>
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className={`font-semibold truncate text-sm ${item.is_deleted ? 'text-slate-400 line-through' : 'text-slate-900'}`}>{item.title}</p>
                          <p className="text-[10px] text-slate-400 truncate">{item.profiles?.full_name}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="font-normal">{item.subject}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        {getStatusBadge(item)}
                        {item.is_deleted && item.deletion_reason && (
                          <div className="flex items-start gap-1 p-1.5 bg-red-50 rounded text-[10px] text-red-600 max-w-[160px]">
                            <AlertTriangle className="h-3 w-3 shrink-0 mt-0.5" />
                            <span className="truncate">{item.deletion_reason}</span>
                          </div>
                        )}
                        {!item.is_deleted && item.is_broadcasting === false && item.stop_reason && (
                          <div className="flex items-start gap-1 p-1.5 bg-orange-50 rounded text-[10px] text-orange-600 max-w-[160px]">
                            <StopCircle className="h-3 w-3 shrink-0 mt-0.5" />
                            <span className="truncate">{item.stop_reason}</span>
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-xs text-slate-500">
                      {item.start_time && item.end_time ? (
                        <div className="space-y-0.5">
                          <p>{format(new Date(item.start_time), 'MMM d, HH:mm')}</p>
                          <p className="text-slate-400">to {format(new Date(item.end_time), 'HH:mm')}</p>
                        </div>
                      ) : (
                        format(new Date(item.created_at), 'MMM d, yyyy')
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {/* View link */}
                        <a href={item.file_url} target="_blank" rel="noopener noreferrer">
                          <Button variant="ghost" size="icon" className="h-7 w-7 hover:text-teal-600 hover:bg-teal-50">
                            <ExternalLink className="h-3.5 w-3.5" />
                          </Button>
                        </a>

                        {/* Stop broadcasting (only for live content) */}
                        {isLiveBroadcasting(item) && (
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="h-7 text-amber-600 border-amber-200 hover:bg-amber-50 hover:text-amber-700 gap-1 text-xs"
                            onClick={() => handleAction(item, 'stop')}
                          >
                            <StopCircle className="h-3 w-3" /> Stop
                          </Button>
                        )}

                        {/* Resume broadcasting (for stopped content) */}
                        {item.status === 'approved' && item.is_broadcasting === false && !item.is_deleted && (
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="h-7 text-emerald-600 border-emerald-200 hover:bg-emerald-50 hover:text-emerald-700 gap-1 text-xs"
                            onClick={() => handleResume(item)}
                          >
                            <RotateCcw className="h-3 w-3" /> Resume
                          </Button>
                        )}

                        {/* Delete content (for non-deleted items) */}
                        {!item.is_deleted && (
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="h-7 text-rose-600 border-rose-200 hover:bg-rose-50 hover:text-rose-700 gap-1 text-xs"
                            onClick={() => handleAction(item, 'delete')}
                          >
                            <Trash2 className="h-3 w-3" /> Delete
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {selectedItem && (
        <ApprovalModal 
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onConfirm={onConfirm}
          title={selectedItem.title}
          mode={modalMode}
        />
      )}
    </DashboardLayout>
  );
}
