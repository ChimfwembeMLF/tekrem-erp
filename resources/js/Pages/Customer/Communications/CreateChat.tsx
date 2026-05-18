import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import CustomerLayout from '@/Layouts/CustomerLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Textarea } from '@/Components/ui/textarea';
import { useTranslate } from '@/Hooks/useTranslate';

export default function CreateChat() {
  const { t } = useTranslate();
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<any>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setErrors({});
    router.post(route('customer.communications.chats.store'), {
      title,
      message,
    }, {
      onError: (err) => setErrors(err),
      onFinish: () => setSubmitting(false),
    });
  };

  return (
    <CustomerLayout>
      <Head title={t('Start a New Chat Conversation')} />
      <div className="max-w-xl mx-auto mt-10">
        <Card>
          <CardHeader>
            <CardTitle>{t('Start a New Chat Conversation')}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium mb-1">{t('Title (optional)')}</label>
                <Input
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  placeholder={t('Enter a title for your conversation')}
                  disabled={submitting}
                />
                {errors.title && <div className="text-red-500 text-xs mt-1">{errors.title}</div>}
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">{t('Message')}</label>
                <Textarea
                  value={message}
                  onChange={e => setMessage(e.target.value)}
                  placeholder={t('Type your message here...')}
                  required
                  rows={5}
                  disabled={submitting}
                />
                {errors.message && <div className="text-red-500 text-xs mt-1">{errors.message}</div>}
              </div>
              <div className="flex justify-end gap-2">
                <Link href={route('customer.communications.chats')}>
                  <Button type="button" variant="outline" disabled={submitting}>
                    {t('Cancel')}
                  </Button>
                </Link>
                <Button type="submit" disabled={submitting}>
                  {submitting ? t('Submitting...') : t('Start Conversation')}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </CustomerLayout>
  );
}
