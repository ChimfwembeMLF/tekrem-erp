import React, { useState } from 'react';
import { useForm } from '@inertiajs/react';
import { Button } from '@/Components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/Components/ui/card';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import { Textarea } from '@/Components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/Components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/Components/ui/radio-group';
import EmailTemplateGenerator from '@/Components/CRM/EmailTemplateGenerator';
import SentimentAnalysis from '@/Components/CRM/SentimentAnalysis';
import useCRMAI from '@/Hooks/useCRMAI';
import { Bot, Heart } from 'lucide-react';
import { Client, Lead, InertiaSharedProps } from '@/types/index';
import useRoute from '@/Hooks/useRoute';
import { CrmFormShell } from '@/Components/Module/moduleFormWrappers';

interface CommunicationCreateProps extends InertiaSharedProps {
  clients: Client[];
  leads: Lead[];
  communicableType?: string;
  communicableId?: number;
}

export default function CommunicationCreate({
  clients,
  leads,
  communicableType,
  communicableId,
}: CommunicationCreateProps) {
  const route = useRoute();
  const { analyzeSentiment, loading: aiLoading } = useCRMAI();

  const [showEmailGenerator, setShowEmailGenerator] = useState(false);
  const [showSentimentAnalysis, setShowSentimentAnalysis] = useState(false);
  const [sentimentAnalysis, setSentimentAnalysis] = useState<any>(null);

  const { data, setData, post, processing, errors } = useForm({
    type: 'note',
    content: '',
    subject: '',
    communication_date: new Date().toISOString().slice(0, 16),
    direction: 'outbound',
    status: 'completed',
    communicable_type: communicableType || '',
    communicable_id: communicableId ? communicableId.toString() : '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    post(route('crm.communications.store'));
  };

  const handleAnalyzeSentiment = async () => {
    if (!data.content.trim()) return;

    const analysis = await analyzeSentiment(data.content, data.type);
    if (analysis) {
      setSentimentAnalysis(analysis);
      setShowSentimentAnalysis(true);
    }
  };

  const handleEmailTemplateGenerated = (template: any) => {
    setData('subject', template.subject);
    setData('content', template.body);
  };

  const getSelectedContact = () => {
    if (data.communicable_type === 'App\\Models\\Client') {
      return clients.find(c => c.id.toString() === data.communicable_id);
    }

    if (data.communicable_type === 'App\\Models\\Lead') {
      return leads.find(l => l.id.toString() === data.communicable_id);
    }

    return null;
  };

  return (
    <CrmFormShell
      title="Add Communication"
      backHref={route('crm.communications.index')}
      backLabel="Back"
      onSubmit={handleSubmit}
      processing={processing}
      submitLabel="Save"
      maxWidth="4xl"
    >
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Add New Communication</CardTitle>
              <CardDescription>
                Record a new communication with a client or lead
              </CardDescription>
            </div>

            <div className="flex gap-2">
              {data.type === 'email' && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowEmailGenerator(true)}
                >
                  <Bot className="h-4 w-4 mr-1" />
                  Generate Email
                </Button>
              )}

              {data.content.trim() && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleAnalyzeSentiment}
                  disabled={aiLoading}
                >
                  <Heart className="h-4 w-4 mr-1" />
                  Analyze Sentiment
                </Button>
              )}
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {showEmailGenerator && (
            <EmailTemplateGenerator
              onTemplateGenerated={handleEmailTemplateGenerated}
              onClose={() => setShowEmailGenerator(false)}
              leadData={getSelectedContact()}
              context={{ communication_type: data.type }}
            />
          )}

          {showSentimentAnalysis && sentimentAnalysis && (
            <SentimentAnalysis
              analysis={sentimentAnalysis}
              onDismiss={() => setShowSentimentAnalysis(false)}
              loading={aiLoading}
            />
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label>Type *</Label>
              <Select value={data.type} onValueChange={(v) => setData('type', v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="email">Email</SelectItem>
                  <SelectItem value="call">Phone Call</SelectItem>
                  <SelectItem value="meeting">Meeting</SelectItem>
                  <SelectItem value="note">Note</SelectItem>
                </SelectContent>
              </Select>
              {errors.type && <p className="text-red-500 text-sm">{errors.type}</p>}
            </div>

            <div className="space-y-2">
              <Label>Date & Time *</Label>
              <Input
                type="datetime-local"
                value={data.communication_date}
                onChange={(e) => setData('communication_date', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>Subject</Label>
              <Input value={data.subject} onChange={(e) => setData('subject', e.target.value)} />
            </div>

            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={data.status} onValueChange={(v) => setData('status', v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="scheduled">Scheduled</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Direction</Label>
            <RadioGroup
              value={data.direction}
              onValueChange={(v) => setData('direction', v)}
              className="flex space-x-4"
            >
              <RadioGroupItem value="inbound" id="inbound" />
              <Label htmlFor="inbound">Inbound</Label>

              <RadioGroupItem value="outbound" id="outbound" />
              <Label htmlFor="outbound">Outbound</Label>
            </RadioGroup>
          </div>

          <div className="space-y-2">
            <Label>Related To</Label>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Select
                value={data.communicable_type}
                onValueChange={(v) => setData('communicable_type', v)}
                disabled={!!communicableType}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="App\\Models\\Client">Client</SelectItem>
                  <SelectItem value="App\\Models\\Lead">Lead</SelectItem>
                </SelectContent>
              </Select>

              <Select
                value={data.communicable_id}
                onValueChange={(v) => setData('communicable_id', v)}
                disabled={!!communicableId}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select person" />
                </SelectTrigger>
                <SelectContent>
                  {data.communicable_type === 'App\\Models\\Client'
                    ? clients.map(c => (
                        <SelectItem key={c.id} value={c.id.toString()}>
                          {c.name}
                        </SelectItem>
                      ))
                    : leads.map(l => (
                        <SelectItem key={l.id} value={l.id.toString()}>
                          {l.name}
                        </SelectItem>
                      ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Content *</Label>
            <Textarea
              rows={6}
              value={data.content}
              onChange={(e) => setData('content', e.target.value)}
            />
          </div>
        </CardContent>
      </Card>
    </CrmFormShell>
  );
}