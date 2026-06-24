import React, { useEffect, useState } from 'react';
import { Button } from '@/Components/ui/button';
import { Textarea } from '@/Components/ui/textarea';
import { Label } from '@/Components/ui/label';
import { ThumbsUp, ThumbsDown, X } from 'lucide-react';
import { chatbotApi } from '@/lib/chatbot-api';
import { toast } from 'sonner';

interface RatingFormProps {
  conversationId: string | null;
  messageId: string | null;
  initialRating?: 'helpful' | 'not_helpful' | null;
  onCancel: () => void;
  onSubmitted?: (rating: 'helpful' | 'not_helpful', conversationId?: string) => void;
}

export function RatingForm({
  conversationId,
  messageId,
  initialRating = null,
  onCancel,
  onSubmitted,
}: RatingFormProps) {
  const [rating, setRating] = useState<'helpful' | 'not_helpful' | null>(initialRating);
  const [feedback, setFeedback] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    setRating(initialRating);
    setFeedback('');
  }, [initialRating, messageId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!conversationId || !messageId || !rating) return;

    setIsSubmitting(true);
    try {
      const result = await chatbotApi.rateResponse({
        conversation_id: conversationId,
        message_id: messageId,
        rating,
        feedback: feedback.trim() || undefined,
      });

      toast.success('Thank you for your feedback!');
      onSubmitted?.(rating, result.conversation_id);
      onCancel();
      setRating(null);
      setFeedback('');
    } catch {
      toast.error('Failed to submit rating. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="shrink-0 border-t border-border bg-card">
      <div className="flex items-center justify-between gap-2 border-b border-border px-4 py-2.5">
        <p className="text-sm font-medium text-foreground">Rate this response</p>
        <Button type="button" variant="ghost" size="icon" className="h-7 w-7" onClick={onCancel}>
          <X className="h-4 w-4" />
          <span className="sr-only">Close rating form</span>
        </Button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3 p-4">
        <p className="text-xs text-muted-foreground">Help us improve by rating how helpful this response was.</p>

        <div className="space-y-1.5">
          <Label className="text-xs font-medium">Was this response helpful?</Label>
          <div className="flex gap-2">
            <Button
              type="button"
              variant={rating === 'helpful' ? 'default' : 'outline'}
              size="sm"
              className="flex-1"
              onClick={() => setRating('helpful')}
            >
              <ThumbsUp className="mr-1.5 h-3.5 w-3.5" />
              Helpful
            </Button>
            <Button
              type="button"
              variant={rating === 'not_helpful' ? 'default' : 'outline'}
              size="sm"
              className="flex-1"
              onClick={() => setRating('not_helpful')}
            >
              <ThumbsDown className="mr-1.5 h-3.5 w-3.5" />
              Not helpful
            </Button>
          </div>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="rating-feedback" className="text-xs font-medium">
            Additional feedback (optional)
          </Label>
          <Textarea
            id="rating-feedback"
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            placeholder="Tell us how we can improve…"
            className="min-h-[72px] resize-none bg-background text-sm"
            maxLength={500}
          />
          <p className="text-[11px] text-muted-foreground">{feedback.length}/500</p>
        </div>

        <div className="flex justify-end gap-2 pt-1">
          <Button type="button" variant="outline" size="sm" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit" size="sm" disabled={!rating || isSubmitting}>
            {isSubmitting ? 'Submitting…' : 'Submit rating'}
          </Button>
        </div>
      </form>
    </div>
  );
}
