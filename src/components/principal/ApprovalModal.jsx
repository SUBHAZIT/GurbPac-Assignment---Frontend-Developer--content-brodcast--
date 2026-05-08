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
import { Loader2, AlertCircle, StopCircle, Trash2, XCircle, CheckCircle } from 'lucide-react';

const MODE_CONFIG = {
  approve: {
    title: 'Approve Content',
    icon: CheckCircle,
    color: 'emerald',
    description: (title) => `Are you sure you want to approve "${title}"? This will make it available for broadcasting.`,
    buttonText: 'Approve',
    reasonRequired: false,
    reasonLabel: 'Note (Optional)',
    reasonPlaceholder: 'Add an optional note...',
  },
  reject: {
    title: 'Reject Content',
    icon: XCircle,
    color: 'rose',
    description: (title) => `Please provide a reason for rejecting "${title}". This feedback will be sent to the teacher.`,
    buttonText: 'Reject',
    reasonRequired: true,
    reasonLabel: 'Rejection Reason',
    reasonPlaceholder: 'e.g. Image resolution is too low or contains incorrect information.',
  },
  stop: {
    title: 'Stop Broadcasting',
    icon: StopCircle,
    color: 'amber',
    description: (title) => `This will immediately stop broadcasting "${title}". The teacher will be notified. Provide a reason below.`,
    buttonText: 'Stop Broadcasting',
    reasonRequired: true,
    reasonLabel: 'Stop Reason',
    reasonPlaceholder: 'e.g. Content needs revision, scheduled maintenance, inappropriate timing...',
  },
  delete: {
    title: 'Delete Content',
    icon: Trash2,
    color: 'rose',
    description: (title) => `This will permanently remove "${title}" from broadcasting. The teacher will see the deletion reason. This action cannot be undone easily.`,
    buttonText: 'Delete Content',
    reasonRequired: true,
    reasonLabel: 'Deletion Reason',
    reasonPlaceholder: 'e.g. Duplicate content, outdated material, policy violation...',
  },
};

const COLOR_MAP = {
  emerald: {
    title: 'text-emerald-600',
    icon: 'text-emerald-500',
    iconBg: 'bg-emerald-50',
    button: 'bg-emerald-600 hover:bg-emerald-700',
    ring: 'focus:ring-emerald-500/20 focus:border-emerald-500',
  },
  rose: {
    title: 'text-rose-600',
    icon: 'text-rose-500',
    iconBg: 'bg-rose-50',
    button: '',
    ring: 'focus:ring-rose-500/20 focus:border-rose-500',
  },
  amber: {
    title: 'text-amber-600',
    icon: 'text-amber-500',
    iconBg: 'bg-amber-50',
    button: 'bg-amber-600 hover:bg-amber-700',
    ring: 'focus:ring-amber-500/20 focus:border-amber-500',
  },
};

export function ApprovalModal({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title, 
  mode = 'approve' 
}) {
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);
  const config = MODE_CONFIG[mode] || MODE_CONFIG.approve;
  const colors = COLOR_MAP[config.color] || COLOR_MAP.emerald;
  const Icon = config.icon;

  const handleConfirm = async () => {
    if (config.reasonRequired && !reason.trim()) {
      return;
    }
    setLoading(true);
    await onConfirm(reason);
    setLoading(false);
    setReason('');
    onClose();
  };

  const handleClose = () => {
    setReason('');
    onClose();
  };

  const isDestructive = mode === 'reject' || mode === 'delete';

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[440px] rounded-2xl">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-1">
            <div className={`p-2 rounded-xl ${colors.iconBg}`}>
              <Icon className={`h-5 w-5 ${colors.icon}`} />
            </div>
            <DialogTitle className={colors.title}>
              {config.title}
            </DialogTitle>
          </div>
          <DialogDescription className="text-slate-500 text-sm">
            {config.description(title)}
          </DialogDescription>
        </DialogHeader>
        
        {(config.reasonRequired || mode === 'approve') && (
          <div className="py-4 space-y-3">
            <Label htmlFor="reason" className="text-slate-700 font-semibold">
              {config.reasonLabel} {config.reasonRequired && <span className="text-rose-500">*</span>}
            </Label>
            <Textarea
              id="reason"
              placeholder={config.reasonPlaceholder}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className={`min-h-[100px] border-slate-200 ${colors.ring}`}
            />
            {config.reasonRequired && !reason.trim() && (
              <p className="text-[11px] text-rose-500 flex items-center gap-1">
                <AlertCircle className="h-3 w-3" /> Reason is mandatory
              </p>
            )}
          </div>
        )}

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="ghost" onClick={handleClose} disabled={loading}>
            Cancel
          </Button>
          <Button 
            variant={isDestructive ? 'destructive' : 'default'}
            className={!isDestructive ? colors.button : ''}
            onClick={handleConfirm}
            disabled={loading || (config.reasonRequired && !reason.trim())}
          >
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {config.buttonText}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
