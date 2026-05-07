'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Loader2, AlertCircle } from 'lucide-react';

export function ApprovalModal({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title, 
  mode = 'approve' 
}) {
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);

  const handleConfirm = async () => {
    if (mode === 'reject' && !reason.trim()) {
      return;
    }
    setLoading(true);
    await onConfirm(reason);
    setLoading(false);
    setReason('');
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px] rounded-2xl">
        <DialogHeader>
          <DialogTitle className={mode === 'reject' ? 'text-rose-600' : 'text-emerald-600'}>
            {mode === 'approve' ? 'Approve Content' : 'Reject Content'}
          </DialogTitle>
          <DialogDescription>
            {mode === 'approve' 
              ? `Are you sure you want to approve "${title}"? This will make it available for broadcasting.`
              : `Please provide a reason for rejecting "${title}". This feedback will be sent to the teacher.`}
          </DialogDescription>
        </DialogHeader>
        
        {mode === 'reject' && (
          <div className="py-4 space-y-3">
            <Label htmlFor="reason" className="text-slate-700 font-semibold">Rejection Reason <span className="text-rose-500">*</span></Label>
            <Textarea
              id="reason"
              placeholder="e.g. Image resolution is too low or contains incorrect information."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="min-h-[100px] border-slate-200 focus:ring-rose-500/20 focus:border-rose-500"
            />
            {!reason.trim() && (
              <p className="text-[11px] text-rose-500 flex items-center gap-1">
                <AlertCircle className="h-3 w-3" /> Reason is mandatory for rejection
              </p>
            )}
          </div>
        )}

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="ghost" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button 
            variant={mode === 'reject' ? 'destructive' : 'default'}
            className={mode === 'approve' ? 'bg-emerald-600 hover:bg-emerald-700' : ''}
            onClick={handleConfirm}
            disabled={loading || (mode === 'reject' && !reason.trim())}
          >
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {mode === 'approve' ? 'Approve' : 'Reject'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
