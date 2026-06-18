import React, { useState } from 'react';
import { Head, router, useForm } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/Components/ui/card';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import { Textarea } from '@/Components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/Components/ui/select';
import { Badge } from '@/Components/ui/badge';
import { Bot, Plus, Trash2, Save } from 'lucide-react';
import useRoute from '@/Hooks/useRoute';

interface Entry {
  id: number;
  title: string;
  content: string;
  category: string;
  is_published: boolean;
  updated_at: string;
}

interface Props {
  companyName: string;
  companyInfo: string;
  guestBotName: string;
  supportBotName: string;
  entries: Entry[];
}

export default function BotKnowledgeIndex({
  companyName,
  companyInfo,
  guestBotName,
  supportBotName,
  entries,
}: Props) {
  const route = useRoute();
  const [editingId, setEditingId] = useState<number | null>(null);

  const settingsForm = useForm({
    company_name: companyName,
    company_info: companyInfo,
    guest_bot_name: guestBotName,
    support_bot_name: supportBotName,
  });

  const entryForm = useForm({
    title: '',
    content: '',
    category: 'general',
    is_published: true,
  });

  const saveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    settingsForm.put(route('support.bot-knowledge.settings'));
  };

  const addEntry = (e: React.FormEvent) => {
    e.preventDefault();
    entryForm.post(route('support.bot-knowledge.store'), {
      onSuccess: () => entryForm.reset(),
    });
  };

  const startEdit = (entry: Entry) => {
    setEditingId(entry.id);
    entryForm.setData({
      title: entry.title,
      content: entry.content,
      category: entry.category,
      is_published: entry.is_published,
    });
  };

  const saveEntry = (id: number) => {
    entryForm.put(route('support.bot-knowledge.update', id), {
      onSuccess: () => {
        setEditingId(null);
        entryForm.reset();
      },
    });
  };

  return (
    <AppLayout title="Bot Knowledge">
      <Head title="Bot Knowledge" />

      <div className="mx-auto max-w-5xl space-y-6">
        <div>
          <h1 className="flex items-center gap-2 text-3xl font-bold tracking-tight">
            <Bot className="h-8 w-8" />
            Bot Knowledge
          </h1>
          <p className="mt-1 text-muted-foreground">
            Grounded context for the guest chat bot and support widget. Both use Mistral and only answer from this knowledge — published FAQs, knowledge base articles, ticket resolutions, and entries below.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Company & bot settings</CardTitle>
            <CardDescription>Company info is always included in bot context.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={saveSettings} className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="company_name">Company name</Label>
                  <Input
                    id="company_name"
                    value={settingsForm.data.company_name}
                    onChange={(e) => settingsForm.setData('company_name', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="guest_bot_name">Guest bot name</Label>
                  <Input
                    id="guest_bot_name"
                    value={settingsForm.data.guest_bot_name}
                    onChange={(e) => settingsForm.setData('guest_bot_name', e.target.value)}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="support_bot_name">Support widget bot name</Label>
                <Input
                  id="support_bot_name"
                  value={settingsForm.data.support_bot_name}
                  onChange={(e) => settingsForm.setData('support_bot_name', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="company_info">Company information</Label>
                <Textarea
                  id="company_info"
                  rows={8}
                  placeholder="Services, contact details, hours, policies, product overview…"
                  value={settingsForm.data.company_info}
                  onChange={(e) => settingsForm.setData('company_info', e.target.value)}
                />
              </div>
              <Button type="submit" disabled={settingsForm.processing}>
                <Save className="mr-2 h-4 w-4" />
                Save settings
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Add knowledge entry</CardTitle>
            <CardDescription>Resolutions, policies, product guides, and other bot-only context.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={addEntry} className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Title</Label>
                  <Input
                    value={entryForm.data.title}
                    onChange={(e) => entryForm.setData('title', e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Category</Label>
                  <Select
                    value={entryForm.data.category}
                    onValueChange={(value) => entryForm.setData('category', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="company">Company</SelectItem>
                      <SelectItem value="resolution">Resolution</SelectItem>
                      <SelectItem value="policy">Policy</SelectItem>
                      <SelectItem value="product">Product</SelectItem>
                      <SelectItem value="general">General</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Content</Label>
                <Textarea
                  rows={6}
                  value={entryForm.data.content}
                  onChange={(e) => entryForm.setData('content', e.target.value)}
                  required
                />
              </div>
              <Button type="submit" disabled={entryForm.processing}>
                <Plus className="mr-2 h-4 w-4" />
                Add entry
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Knowledge entries</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {entries.length === 0 ? (
              <p className="text-sm text-muted-foreground">No custom entries yet. Published FAQs and knowledge base articles are still included automatically.</p>
            ) : (
              entries.map((entry) => (
                <div key={entry.id} className="rounded-lg border p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-medium">{entry.title}</p>
                        <Badge variant="secondary">{entry.category}</Badge>
                        {!entry.is_published && <Badge variant="outline">Draft</Badge>}
                      </div>
                      <p className="mt-1 text-xs text-muted-foreground">
                        Updated {new Date(entry.updated_at).toLocaleString()}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={() => startEdit(entry)}>
                        Edit
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => router.delete(route('support.bot-knowledge.destroy', entry.id))}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  {editingId === entry.id && (
                    <div className="mt-4 space-y-3 border-t pt-4">
                      <Input
                        value={entryForm.data.title}
                        onChange={(e) => entryForm.setData('title', e.target.value)}
                      />
                      <Textarea
                        rows={5}
                        value={entryForm.data.content}
                        onChange={(e) => entryForm.setData('content', e.target.value)}
                      />
                      <Button size="sm" onClick={() => saveEntry(entry.id)} disabled={entryForm.processing}>
                        Save changes
                      </Button>
                    </div>
                  )}
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
