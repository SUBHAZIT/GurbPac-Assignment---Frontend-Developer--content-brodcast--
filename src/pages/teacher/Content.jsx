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
  XCircle
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import { format } from 'date-fns';

export default function TeacherContent() {
  const { user } = useAuth();
  const [content, setContent] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

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

  const filteredContent = content.filter(item => 
    item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.subject.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusBadge = (status) => {
    switch (status) {
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

        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
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
          </div>

          <Table>
            <TableHeader className="bg-slate-50/50">
              <TableRow>
                <TableHead className="font-semibold text-slate-700">Content</TableHead>
                <TableHead className="font-semibold text-slate-700">Subject</TableHead>
                <TableHead className="font-semibold text-slate-700">Schedule</TableHead>
                <TableHead className="font-semibold text-slate-700">Status</TableHead>
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
                      <p className="font-medium text-slate-900">No content found</p>
                      <p className="text-sm">Try adjusting your search or upload something new.</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filteredContent.map((item) => (
                  <TableRow key={item.id} className="group hover:bg-slate-50/50 transition-colors">
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-16 rounded-md overflow-hidden bg-slate-100 border border-slate-200">
                          <img src={item.file_url} alt="" className="w-full h-full object-cover" />
                        </div>
                        <div>
                          <p className="font-semibold text-slate-900">{item.title}</p>
                          <p className="text-xs text-slate-500 truncate max-w-[200px]">{item.description || 'No description'}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="font-medium">{item.subject}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="text-xs space-y-1">
                        <p className="text-slate-600 flex items-center gap-1">
                          <span className="font-bold text-[10px] uppercase text-slate-400">Start:</span> {format(new Date(item.start_time), 'MMM d, HH:mm')}
                        </p>
                        <p className="text-slate-600 flex items-center gap-1">
                          <span className="font-bold text-[10px] uppercase text-slate-400">End:</span> {format(new Date(item.end_time), 'MMM d, HH:mm')}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-2">
                        {getStatusBadge(item.status)}
                        {item.status === 'rejected' && (
                          <div className="flex items-start gap-1.5 p-2 bg-rose-50 rounded-lg text-[11px] text-rose-700 border border-rose-100 max-w-[180px]">
                            <AlertCircle className="h-3 w-3 shrink-0 mt-0.5" />
                            <p><span className="font-bold">Reason:</span> {item.rejection_reason || 'No reason provided'}</p>
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon" className="hover:text-teal-600 hover:bg-teal-50" asChild>
                        <a href={item.file_url} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="h-4 w-4" />
                        </a>
                      </Button>
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

function FileText({ className }) {
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
      <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" />
      <path d="M14 2v4a2 2 0 0 0 2 2h4" />
      <path d="M10 9H8" />
      <path d="M16 13H8" />
      <path d="M16 17H8" />
    </svg>
  );
}
