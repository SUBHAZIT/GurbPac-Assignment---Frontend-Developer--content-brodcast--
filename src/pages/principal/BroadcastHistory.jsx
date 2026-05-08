import { useState, useEffect, useCallback } from 'react';
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
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { 
  History, 
  Filter, 
  Play, 
  StopCircle, 
  Clock, 
  Trash2, 
  CheckCircle, 
  XCircle,
  User,
  Radio,
  Loader2,
  Calendar,
  ArrowRight,
  Zap,
  FileText
} from 'lucide-react';
import { toast } from 'sonner';
import { format, formatDistanceToNow } from 'date-fns';

const ACTION_CONFIG = {
  started: {
    icon: Play,
    label: 'Started',
    color: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    iconColor: 'text-emerald-500',
    bgGlow: 'bg-emerald-50',
  },
  stopped: {
    icon: StopCircle,
    label: 'Stopped',
    color: 'bg-amber-100 text-amber-700 border-amber-200',
    iconColor: 'text-amber-500',
    bgGlow: 'bg-amber-50',
  },
  expired: {
    icon: Clock,
    label: 'Auto-Expired',
    color: 'bg-slate-100 text-slate-600 border-slate-200',
    iconColor: 'text-slate-400',
    bgGlow: 'bg-slate-50',
  },
  deleted: {
    icon: Trash2,
    label: 'Deleted',
    color: 'bg-rose-100 text-rose-700 border-rose-200',
    iconColor: 'text-rose-500',
    bgGlow: 'bg-rose-50',
  },
  approved: {
    icon: CheckCircle,
    label: 'Approved',
    color: 'bg-teal-100 text-teal-700 border-teal-200',
    iconColor: 'text-teal-500',
    bgGlow: 'bg-teal-50',
  },
  rejected: {
    icon: XCircle,
    label: 'Rejected',
    color: 'bg-red-100 text-red-700 border-red-200',
    iconColor: 'text-red-500',
    bgGlow: 'bg-red-50',
  },
};

export default function BroadcastHistory() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionFilter, setActionFilter] = useState('all');

  const fetchHistory = useCallback(async () => {
    setLoading(true);
    try {
      const data = await contentService.getBroadcastHistory({ 
        action: actionFilter 
      });
      setHistory(data);
    } catch (error) {
      toast.error('Failed to fetch broadcast history');
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [actionFilter]);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  return (
    <DashboardLayout allowedRole="principal">
      <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <div className="p-2 bg-gradient-to-br from-violet-500 to-purple-600 rounded-xl shadow-lg shadow-violet-500/20">
                <History className="h-5 w-5 text-white" />
              </div>
              <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Broadcast History</h1>
            </div>
            <p className="text-slate-500 mt-1">Track all broadcasting events — starts, stops, expirations, and deletions.</p>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 text-sm font-medium text-slate-500 whitespace-nowrap">
              <Filter className="h-4 w-4" /> Action:
            </div>
            <Select value={actionFilter} onValueChange={setActionFilter}>
              <SelectTrigger className="w-[160px] bg-white border-slate-200">
                <SelectValue placeholder="All Actions" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Actions</SelectItem>
                <SelectItem value="started">Started</SelectItem>
                <SelectItem value="stopped">Stopped</SelectItem>
                <SelectItem value="expired">Auto-Expired</SelectItem>
                <SelectItem value="deleted">Deleted</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Stats summary */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Total Events', value: history.length, icon: Zap, color: 'text-violet-600', bg: 'bg-violet-50' },
            { label: 'Stopped', value: history.filter(h => h.action === 'stopped').length, icon: StopCircle, color: 'text-amber-600', bg: 'bg-amber-50' },
            { label: 'Auto-Expired', value: history.filter(h => h.action === 'expired').length, icon: Clock, color: 'text-slate-600', bg: 'bg-slate-50' },
            { label: 'Deleted', value: history.filter(h => h.action === 'deleted').length, icon: Trash2, color: 'text-rose-600', bg: 'bg-rose-50' },
          ].map((stat) => (
            <div key={stat.label} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
              <div className="flex items-center gap-2 mb-2">
                <div className={`p-1.5 rounded-lg ${stat.bg}`}>
                  <stat.icon className={`h-4 w-4 ${stat.color}`} />
                </div>
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">{stat.label}</span>
              </div>
              <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
            </div>
          ))}
        </div>

        {/* History Table */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <Table>
            <TableHeader className="bg-slate-50/50">
              <TableRow>
                <TableHead className="font-semibold text-slate-700">Event</TableHead>
                <TableHead className="font-semibold text-slate-700">Content</TableHead>
                <TableHead className="font-semibold text-slate-700">Performed By</TableHead>
                <TableHead className="font-semibold text-slate-700">Reason</TableHead>
                <TableHead className="font-semibold text-slate-700">Timestamp</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                Array(5).fill(0).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell><div className="h-6 w-24 bg-slate-100 animate-pulse rounded" /></TableCell>
                    <TableCell><div className="h-6 w-40 bg-slate-100 animate-pulse rounded" /></TableCell>
                    <TableCell><div className="h-6 w-28 bg-slate-100 animate-pulse rounded" /></TableCell>
                    <TableCell><div className="h-6 w-48 bg-slate-100 animate-pulse rounded" /></TableCell>
                    <TableCell><div className="h-6 w-32 bg-slate-100 animate-pulse rounded" /></TableCell>
                  </TableRow>
                ))
              ) : history.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-64 text-center">
                    <div className="flex flex-col items-center justify-center text-slate-400">
                      <div className="p-4 bg-slate-50 rounded-full mb-3">
                        <History className="h-8 w-8" />
                      </div>
                      <p className="font-medium text-slate-900">No history found</p>
                      <p className="text-sm">Broadcasting events will appear here as they occur.</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                history.map((entry) => {
                  const config = ACTION_CONFIG[entry.action] || ACTION_CONFIG.started;
                  const Icon = config.icon;

                  return (
                    <TableRow key={entry.id} className="group hover:bg-slate-50/50 transition-colors">
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className={`p-1.5 rounded-lg ${config.bgGlow}`}>
                            <Icon className={`h-4 w-4 ${config.iconColor}`} />
                          </div>
                          <Badge className={`${config.color} text-xs font-semibold`}>
                            {config.label}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="min-w-0">
                          <p className="font-semibold text-slate-900 truncate text-sm max-w-[200px]">
                            {entry.content?.title || 'Unknown Content'}
                          </p>
                          <p className="text-[10px] text-slate-400 truncate">
                            {entry.content?.subject} · By {entry.content?.profiles?.full_name || 'Unknown'}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        {entry.profiles ? (
                          <div className="flex items-center gap-2">
                            <div className="h-6 w-6 rounded-full bg-teal-500 flex items-center justify-center text-white text-[9px] font-bold">
                              {entry.profiles.full_name?.charAt(0)?.toUpperCase() || '?'}
                            </div>
                            <div>
                              <p className="text-xs font-medium text-slate-900">{entry.profiles.full_name}</p>
                              <p className="text-[10px] text-slate-400 capitalize">{entry.profiles.role}</p>
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1.5 text-slate-400">
                            <Zap className="h-3.5 w-3.5" />
                            <span className="text-xs font-medium">System (Auto)</span>
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        {entry.reason ? (
                          <div className="flex items-start gap-1.5 max-w-[250px]">
                            <FileText className="h-3 w-3 text-slate-400 shrink-0 mt-0.5" />
                            <p className="text-xs text-slate-600 line-clamp-2">{entry.reason}</p>
                          </div>
                        ) : (
                          <span className="text-xs text-slate-300 italic">No reason</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="space-y-0.5">
                          <p className="text-xs text-slate-700 font-medium">
                            {format(new Date(entry.created_at), 'MMM d, yyyy')}
                          </p>
                          <p className="text-[10px] text-slate-400">
                            {format(new Date(entry.created_at), 'HH:mm:ss')} · {formatDistanceToNow(new Date(entry.created_at), { addSuffix: true })}
                          </p>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </DashboardLayout>
  );
}
