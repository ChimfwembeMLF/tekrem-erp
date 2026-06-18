import React, { useState } from 'react';
import { Button } from '@/Components/ui/button';
import { Textarea } from '@/Components/ui/textarea';
import { Label } from '@/Components/ui/label';
import { AlertTriangle, X } from 'lucide-react';
import { chatbotApi } from '@/lib/chatbot-api';
import { toast } from 'sonner';

interface EscalationFormProps {
  conversationId: string | null;
  onCancel: () => void;
  onSubmitted?: () => void;
}

export function EscalationForm({ conversationId, onCancel, onSubmitted }: EscalationFormProps) {
  const [reason, setReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!conversationId) return;

    setIsSubmitting(true);
    try {
      const response = await chatbotApi.escalateToHuman({
        conversation_id: conversationId,
        reason: reason.trim() || undefined,
      });

      toast.success(response.message || 'Escalated to a human agent');
      onSubmitted?.();
      onCancel();
      setReason('');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to escalate. Please try again.';
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="shrink-0 border-t border-border bg-card">
      <div className="flex items-center justify-between gap-2 border-b border-border px-4 py-2.5">
        <div className="flex min-w-0 items-center gap-2">
          <AlertTriangle className="h-4 w-4 shrink-0 text-orange-500" />
          <p className="truncate text-sm font-medium text-foreground">Connect with human agent</p>
        </div>
        <Button type="button" variant="ghost" size="icon" className="h-7 w-7" onClick={onCancel}>
          <X className="h-4 w-4" />
          <span className="sr-only">Close escalation form</span>
        </Button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3 p-4">
        <p className="text-xs text-muted-foreground">
          A human agent will review your conversation and follow up shortly.
        </p>

        <div className="space-y-1.5">
          <Label htmlFor="escalation-reason" className="text-xs font-medium">
            Reason (optional)
          </Label>
          <Textarea
            id="escalation-reason"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Why do you need human assistance?"
            className="min-h-[72px] resize-none bg-background text-sm"
            maxLength={500}
          />
          <p className="text-[11px] text-muted-foreground">{reason.length}/500</p>
        </div>

        <div className="rounded-lg border border-border bg-muted/40 p-2.5 text-[11px] text-muted-foreground">
          <p className="mb-1 font-medium text-foreground">What to expect</p>
          <ul className="space-y-0.5">
            <li>• Your full chat history is preserved</li>
            <li>• Typical response within 5–15 minutes</li>
            <li>• You will be notified when an agent responds</li>
          </ul>
        </div>

        <div className="flex justify-end gap-2 pt-1">
          <Button type="button" variant="outline" size="sm" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit" size="sm" disabled={isSubmitting}>
            {isSubmitting ? 'Connecting…' : 'Request human help'}
          </Button>
        </div>
      </form>
    </div>
  );
}
