import { useState, useEffect } from 'react';
import { contentService } from '@/services/content.service';
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
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Check, 
  X, 
  Eye, 
  User, 
  Calendar, 
  Loader2,
  FileSearch
} from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';

export default function PrincipalPending() {
  const [content, setContent] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState(null);
  const [modalMode, setModalMode] = useState('approve'); // 'approve' | 'reject'
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    fetchPending();
  }, []);

  async function fetchPending() {
    setLoading(true);
    try {
      const data = await contentService.getPendingContent();
      setContent(data);
    } catch (error) {
      toast.error('Failed to fetch pending content');
    } finally {
      setLoading(false);
    }
  }

  const handleAction = (item, mode) => {
    setSelectedItem(item);
    setModalMode(mode);
    setIsModalOpen(true);
  };

  const onConfirm = async (reason) => {
    try {
      const status = modalMode === 'approve' ? 'approved' : 'rejected';
      await contentService.updateContentStatus(selectedItem.id, status, reason);
      toast.success(`Content ${status} successfully`);
      fetchPending();
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  return (
    <DashboardLayout allowedRole="principal">
      <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Pending Approvals</h1>
          <p className="text-slate-500 mt-1">Review content submitted by teachers for broadcasting.</p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <Table>
            <TableHeader className="bg-slate-50/50">
              <TableRow>
                <TableHead className="font-semibold text-slate-700">Teacher & Content</TableHead>
                <TableHead className="font-semibold text-slate-700">Subject</TableHead>
                <TableHead className="font-semibold text-slate-700">Schedule</TableHead>
                <TableHead className="text-right font-semibold text-slate-700">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                Array(3).fill(0).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell><div className="h-12 w-48 bg-slate-100 animate-pulse rounded" /></TableCell>
                    <TableCell><div className="h-6 w-20 bg-slate-100 animate-pulse rounded" /></TableCell>
                    <TableCell><div className="h-10 w-32 bg-slate-100 animate-pulse rounded" /></TableCell>
                    <TableCell><div className="h-8 w-24 bg-slate-100 animate-pulse rounded ml-auto" /></TableCell>
                  </TableRow>
                ))
              ) : content.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="h-64 text-center">
                    <div className="flex flex-col items-center justify-center text-slate-400">
                      <div className="p-4 bg-emerald-50 text-emerald-600 rounded-full mb-3">
                        <Check className="h-8 w-8" />
                      </div>
                      <p className="font-medium text-slate-900">All caught up!</p>
                      <p className="text-sm">There are no pending submissions at the moment.</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                content.map((item) => (
                  <TableRow key={item.id} className="group hover:bg-slate-50/50 transition-colors">
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="h-12 w-20 rounded-lg overflow-hidden bg-slate-100 border border-slate-200 shrink-0">
                          <img src={item.file_url} alt="" className="w-full h-full object-cover" />
                        </div>
                        <div className="min-w-0">
                          <p className="font-bold text-slate-900 truncate">{item.title}</p>
                          <p className="text-xs text-slate-500 flex items-center gap-1">
                            <User className="h-3 w-3" /> {item.profiles?.full_name || item.profiles?.email}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="font-medium bg-teal-50 text-teal-700 border-teal-100">{item.subject}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="text-xs space-y-1">
                        <p className="text-slate-600 flex items-center gap-1">
                          <Calendar className="h-3 w-3 text-slate-400" /> {format(new Date(item.start_time), 'MMM d, HH:mm')}
                        </p>
                        <p className="text-slate-400 pl-4">to {format(new Date(item.end_time), 'HH:mm')}</p>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="h-8 gap-1.5"
                          asChild
                        >
                          <a href={item.file_url} target="_blank" rel="noopener noreferrer">
                            <Eye className="h-3.5 w-3.5" /> Preview
                          </a>
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="h-8 text-rose-600 border-rose-100 hover:bg-rose-50 hover:text-rose-700 gap-1.5"
                          onClick={() => handleAction(item, 'reject')}
                        >
                          <X className="h-3.5 w-3.5" /> Reject
                        </Button>
                        <Button 
                          size="sm" 
                          className="h-8 bg-emerald-600 hover:bg-emerald-700 gap-1.5"
                          onClick={() => handleAction(item, 'approve')}
                        >
                          <Check className="h-3.5 w-3.5" /> Approve
                        </Button>
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
