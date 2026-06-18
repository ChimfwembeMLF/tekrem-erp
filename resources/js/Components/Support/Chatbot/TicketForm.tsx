import React, { useEffect, useState } from 'react';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/Components/ui/select';
import { Ticket, X } from 'lucide-react';
import { chatbotApi } from '@/lib/chatbot-api';
import { toast } from 'sonner';

interface TicketFormProps {
  conversationId: string | null;
  suggestedTitle?: string | null;
  onCancel: () => void;
  onCreated?: (ticketNumber: string) => void;
}

export function TicketForm({ conversationId, suggestedTitle, onCancel, onCreated }: TicketFormProps) {
  const [title, setTitle] = useState('');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high' | 'urgent'>('medium');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loadingTitle, setLoadingTitle] = useState(false);

  useEffect(() => {
    if (!conversationId) return;

    if (suggestedTitle) {
      setTitle(suggestedTitle);
      return;
    }

    setLoadingTitle(true);
    chatbotApi
      .suggestTicketTitle(conversationId)
      .then((res) => setTitle(res.title))
      .catch(() => setTitle(''))
      .finally(() => setLoadingTitle(false));
  }, [conversationId, suggestedTitle]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!conversationId || !title.trim()) return;

    setIsSubmitting(true);
    try {
      const response = await chatbotApi.createTicket({
        conversation_id: conversationId,
        title: title.trim(),
        priority,
      });

      const ticketNumber = (response.ticket as { ticket_number?: string })?.ticket_number;
      toast.success(response.message || 'Ticket created successfully', {
        description: ticketNumber ? `Reference: ${ticketNumber}` : undefined,
      });

      onCreated?.(ticketNumber ?? '');
      onCancel();
      setTitle('');
      setPriority('medium');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to create ticket. Please try again.';
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="shrink-0 border-t border-border bg-card">
      <div className="flex items-center justify-between gap-2 border-b border-border px-4 py-2.5">
        <div className="flex min-w-0 items-center gap-2">
          <Ticket className="h-4 w-4 shrink-0 text-primary" />
          <p className="truncate text-sm font-medium text-foreground">Create support ticket</p>
        </div>
        <Button type="button" variant="ghost" size="icon" className="h-7 w-7" onClick={onCancel}>
          <X className="h-4 w-4" />
          <span className="sr-only">Close ticket form</span>
        </Button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3 p-4">
        <p className="text-xs text-muted-foreground">
          Your chat history and attachments will be included. Our team will follow up by email.
        </p>

        <div className="space-y-1.5">
          <Label htmlFor="ticket-title" className="text-xs font-medium">
            Title
          </Label>
          <Input
            id="ticket-title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder={loadingTitle ? 'Suggesting title…' : 'Brief description of your issue'}
            className="h-9 bg-background text-sm"
            maxLength={255}
            disabled={loadingTitle}
            autoFocus
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="ticket-priority" className="text-xs font-medium">
            Priority
          </Label>
          <Select value={priority} onValueChange={(value: 'low' | 'medium' | 'high' | 'urgent') => setPriority(value)}>
            <SelectTrigger id="ticket-priority" className="h-9 bg-background text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="z-[999]">
              <SelectItem value="low">Low</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="high">High</SelectItem>
              <SelectItem value="urgent">Urgent</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex justify-end gap-2 pt-1">
          <Button type="button" variant="outline" size="sm" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit" size="sm" disabled={!title.trim() || isSubmitting || loadingTitle}>
            {isSubmitting ? 'Creating…' : 'Submit ticket'}
          </Button>
        </div>
      </form>
    </div>
  );
}
