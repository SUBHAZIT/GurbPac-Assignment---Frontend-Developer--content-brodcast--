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
import { Input } from '@/components/ui/input';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Search, Filter, CheckCircle2, XCircle, Clock, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';

export default function PrincipalAllContent() {
  const [content, setContent] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    status: 'all',
    search: '',
  });

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

  const getStatusBadge = (status) => {
    switch (status) {
      case 'approved':
        return <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200">Approved</Badge>;
      case 'rejected':
        return <Badge variant="destructive" className="bg-rose-100 text-rose-700 border-rose-200">Rejected</Badge>;
      default:
        return <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">Pending</Badge>;
    }
  };

  return (
    <DashboardLayout allowedRole="principal">
      <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">All Content</h1>
          <p className="text-slate-500 mt-1">Browse and filter the entire content library.</p>
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
                <TableHead>Created At</TableHead>
                <TableHead className="text-right">Action</TableHead>
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
                  <TableRow key={item.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-12 rounded bg-slate-100 border border-slate-200 overflow-hidden shrink-0">
                          <img src={item.file_url} alt="" className="w-full h-full object-cover" />
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold text-slate-900 truncate text-sm">{item.title}</p>
                          <p className="text-[10px] text-slate-400 truncate">{item.profiles?.full_name}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="font-normal">{item.subject}</Badge>
                    </TableCell>
                    <TableCell>{getStatusBadge(item.status)}</TableCell>
                    <TableCell className="text-xs text-slate-500">
                      {format(new Date(item.created_at), 'MMM d, yyyy')}
                    </TableCell>
                    <TableCell className="text-right">
                      <a href={item.file_url} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="h-4 w-4 text-slate-400 hover:text-teal-600 cursor-pointer transition-colors inline" />
                      </a>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </DashboardLayout>
  );
}
