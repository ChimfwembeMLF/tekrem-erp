import React, { useState } from 'react';
import { Head, useForm, router } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { Button } from '@/Components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/Components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/Components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/Components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/Components/ui/alert-dialog';
import { Input } from '@/Components/ui/input';
import { Textarea } from '@/Components/ui/textarea';
import { Switch } from '@/Components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/Components/ui/select';
import { Badge } from '@/Components/ui/badge';
import { Plus, Edit2, Trash2, Link2, Copy, Zap } from 'lucide-react';
import useTranslate from '@/Hooks/useTranslate';
import { toast, Toaster } from 'sonner';
import axios from 'axios';

declare function route(name: string, params?: any): string;

interface Source {
  id: number;
  name: string;
  description: string | null;
  slug: string;
  is_active: boolean;
  created_at: string;
}

interface Props {
  sources: Source[];
}

export default function Index({ sources }: Props) {
  const { t } = useTranslate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isIntegrationModalOpen, setIsIntegrationModalOpen] = useState(false);
  const [editingSource, setEditingSource] = useState<Source | null>(null);
  const [activeIntegration, setActiveIntegration] = useState<Source | null>(null);
  const [generatedToken, setGeneratedToken] = useState<string | null>(null);
  const [deleteConfirmSource, setDeleteConfirmSource] = useState<Source | null>(null);
  const [tokenConfirmSource, setTokenConfirmSource] = useState<Source | null>(null);
  
  // Customization State
  const [embedTheme, setEmbedTheme] = useState('light');
  const [embedColor, setEmbedColor] = useState('#2563eb');

  const { data, setData, post, put, delete: destroy, processing, errors, reset, clearErrors } = useForm({
    name: '',
    description: '',
    is_active: true,
  });

  const openCreateModal = () => {
    setEditingSource(null);
    reset();
    clearErrors();
    setIsModalOpen(true);
  };

  const openEditModal = (source: Source) => {
    setEditingSource(source);
    setData({
      name: source.name,
      description: source.description || '',
      is_active: source.is_active,
    });
    clearErrors();
    setIsModalOpen(true);
  };

  const openIntegrationModal = (source: Source) => {
    setActiveIntegration(source);
    setGeneratedToken(null);
    setEmbedTheme('light');
    setEmbedColor('#2563eb');
    setIsIntegrationModalOpen(true);
  };

  const executeGenerateToken = async () => {
    if (!tokenConfirmSource) return;
    try {
      const response = await axios.post(route('support.ticket-sources.generate-token', tokenConfirmSource.id));
      setGeneratedToken(response.data.token);
      setTokenConfirmSource(null);
      toast.success(t('support.token_generated', 'Token generated successfully! Copy it securely now.'));
    } catch {
      toast.error(t('support.token_failed', 'Failed to generate token.'));
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success(t('common.copied', 'Copied to clipboard.'));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingSource) {
      put(route('support.ticket-sources.update', editingSource.id), {
        onSuccess: () => {
          setIsModalOpen(false);
          toast.success(t('support.source_updated', 'Ticket source updated successfully.'));
        },
      });
    } else {
      post(route('support.ticket-sources.store'), {
        onSuccess: () => {
          setIsModalOpen(false);
          toast.success(t('support.source_created', 'Ticket source created successfully.'));
        },
      });
    }
  };

  const confirmDelete = () => {
    if (!deleteConfirmSource) return;
    destroy(route('support.ticket-sources.destroy', deleteConfirmSource.id), {
      onSuccess: () => {
        setDeleteConfirmSource(null);
        toast.success(t('support.source_deleted', 'Ticket source deleted successfully.'));
      },
    });
  };

  return (
    <AppLayout title={t('support.ticket_sources', 'Ticket Sources')}>
      <Head title={t('support.ticket_sources', 'Ticket Sources')} />
      <Toaster position="top-right" />

      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{t('support.ticket_sources', 'Ticket Sources Whitelist')}</h1>
            <p className="text-muted-foreground">
              {t('support.ticket_sources_desc', 'Manage the external systems allowed to create tickets via the API or Embedded Form.')}
            </p>
          </div>
          <Button onClick={openCreateModal}>
            <Plus className="w-4 h-4 mr-2" />
            {t('support.add_source', 'Add Source')}
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>{t('support.allowed_systems', 'Allowed Systems')}</CardTitle>
            <CardDescription>
              {t('support.allowed_systems_desc', 'Only active sources will populate filter dropdowns and be accepted in API requests.')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {sources.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground rounded-lg border border-dashed">
                <p>{t('support.no_sources_found', 'No sources configured yet.')}</p>
                <Button variant="link" onClick={openCreateModal}>{t('support.add_first_source', 'Add your first source')}</Button>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t('common.name', 'Name')}</TableHead>
                    <TableHead>{t('common.slug', 'API Slug')}</TableHead>
                    <TableHead>{t('common.description', 'Description')}</TableHead>
                    <TableHead>{t('common.status', 'Status')}</TableHead>
                    <TableHead className="text-right">{t('common.actions', 'Actions')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sources.map((source) => (
                    <TableRow key={source.id}>
                      <TableCell className="font-medium">{source.name}</TableCell>
                      <TableCell><code className="bg-muted px-1 py-0.5 rounded text-xs">{source.slug}</code></TableCell>
                      <TableCell className="text-muted-foreground">{source.description || '-'}</TableCell>
                      <TableCell>
                        <Badge variant={source.is_active ? 'default' : 'secondary'} className={source.is_active ? 'bg-green-500 hover:bg-green-600' : ''}>
                          {source.is_active ? t('common.active', 'Active') : t('common.inactive', 'Inactive')}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="icon" onClick={() => openIntegrationModal(source)} title={t('support.integration', 'Integration Setup')}>
                          <Link2 className="w-4 h-4 text-blue-500" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => openEditModal(source)}>
                          <Edit2 className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => setDeleteConfirmSource(source)} className="text-destructive">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Integration Setup Modal */}
      <Dialog open={isIntegrationModalOpen} onOpenChange={setIsIntegrationModalOpen}>
        <DialogContent className="max-w-3xl" onInteractOutside={(e) => e.preventDefault()}>
          <DialogHeader>
            <DialogTitle>
              {t('support.integration_setup', 'Integration Setup')}: {activeIntegration?.name}
            </DialogTitle>
            <DialogDescription>
              {t('support.integration_setup_desc', 'Use the following iframe snippet to embed the support form on this external system.')}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-medium">{t('support.api_token', 'API Token')}</h3>
              <Button onClick={() => setTokenConfirmSource(activeIntegration)} variant="outline" size="sm">
                <Zap className="w-4 h-4 mr-2" />
                {t('support.generate_new_token', 'Generate New Token')}
              </Button>
            </div>
            
            {generatedToken ? (
              <div className="bg-muted p-4 rounded-md relative flex items-center justify-between">
                <code className="text-sm break-all font-mono text-green-600 dark:text-green-400">
                  {generatedToken}
                </code>
                <Button variant="ghost" size="icon" onClick={() => copyToClipboard(generatedToken)}>
                  <Copy className="w-4 h-4" />
                </Button>
              </div>
            ) : (
              <div className="bg-muted/50 p-4 rounded-md text-center text-muted-foreground text-sm border border-dashed">
                {t('support.no_token_visible', 'Tokens are only shown once upon creation. Click above to generate a new replacement token.')}
              </div>
            )}

            <div className="grid grid-cols-2 gap-4 pt-2">
              <div className="space-y-2">
                <label className="text-sm font-medium">{t('support.theme', 'Widget Theme')}</label>
                <Select value={embedTheme} onValueChange={setEmbedTheme}>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="light">{t('common.light', 'Light')}</SelectItem>
                    <SelectItem value="dark">{t('common.dark', 'Dark')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">{t('support.brand_color', 'Brand Primary Color')}</label>
                <div className="flex gap-2 items-center">
                  <input type="color" value={embedColor} onChange={(e) => setEmbedColor(e.target.value)} className="h-10 w-12 border border-input rounded p-1 cursor-pointer bg-transparent" />
                  <Input value={embedColor} onChange={(e) => setEmbedColor(e.target.value)} className="flex-1 font-mono uppercase" placeholder="#HEXCODE" />
                </div>
              </div>
            </div>

            <h3 className="text-lg font-medium pt-4">{t('support.iframe_code', 'Embeddable Iframe Code')}</h3>
            <div className="bg-slate-950 text-slate-50 p-4 rounded-md relative group">
              <pre className="text-sm overflow-x-auto whitespace-pre-wrap font-mono pr-12">
                {`<iframe src="${typeof window !== 'undefined' ? window.location.origin : ''}/support/embed/ticket?source=${activeIntegration?.slug}&token=${generatedToken || 'YOUR_API_TOKEN'}&theme=${embedTheme}&primary_color=${encodeURIComponent(embedColor)}" style="border: none; position: fixed; bottom: 0; right: 0; z-index: 99999; width: 400px; max-width: 100%; height: 600px; max-height: 100vh; background: transparent;" allowtransparency="true"></iframe>`}
              </pre>
              <Button 
                variant="ghost" 
                size="icon" 
                className="absolute top-2 right-2 text-slate-400 hover:text-white opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={() => copyToClipboard(`<iframe src="${typeof window !== 'undefined' ? window.location.origin : ''}/support/embed/ticket?source=${activeIntegration?.slug}&token=${generatedToken || 'YOUR_API_TOKEN'}&theme=${embedTheme}&primary_color=${encodeURIComponent(embedColor)}" style="border: none; position: fixed; bottom: 0; right: 0; z-index: 99999; width: 400px; max-width: 100%; height: 600px; max-height: 100vh; background: transparent;" allowtransparency="true"></iframe>`)}
              >
                <Copy className="w-4 h-4" />
              </Button>
            </div>
          </div>
          
          
          <DialogFooter>
            <Button onClick={() => setIsIntegrationModalOpen(false)}>
              {t('common.close', 'Close')}
            </Button>
          </DialogFooter>

          {/* Token Generation Confirmation */}
          <AlertDialog open={!!tokenConfirmSource} onOpenChange={(open) => !open && setTokenConfirmSource(null)}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>{t('common.are_you_sure', 'Are you sure?')}</AlertDialogTitle>
                <AlertDialogDescription>
                  {t('support.confirm_new_token', 'Generating a new token will invalidate any existing tokens for this source. Are you sure?')}
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>{t('common.cancel', 'Cancel')}</AlertDialogCancel>
                <AlertDialogAction onClick={(e) => { e.preventDefault(); executeGenerateToken(); }}>
                  {t('support.generate_new_token', 'Generate New Token')}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </DialogContent>
      </Dialog>

      {/* Edit / Create Data Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent onInteractOutside={(e) => e.preventDefault()}>
          <DialogHeader>
            <DialogTitle>
              {editingSource 
                ? t('support.edit_source', 'Edit Ticket Source') 
                : t('support.add_source', 'Add Ticket Source')}
            </DialogTitle>
            <DialogDescription>
              {t('support.source_modal_desc', 'Configure the details for this external system.')}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">{t('common.name', 'Display Name')}</label>
              <Input
                value={data.name}
                onChange={(e) => setData('name', e.target.value)}
                placeholder="e.g., HR Application"
              />
              {errors.name && <p className="text-sm text-destructive">{errors.name}</p>}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">{t('common.description', 'Description (Optional)')}</label>
              <Textarea
                value={data.description}
                onChange={(e) => setData('description', e.target.value)}
                placeholder="Briefly describe this integration..."
              />
              {errors.description && <p className="text-sm text-destructive">{errors.description}</p>}
            </div>

            <div className="flex items-center space-x-2 pt-2">
              <Switch
                id="is_active"
                checked={data.is_active}
                onCheckedChange={(checked) => setData('is_active', checked)}
              />
              <label htmlFor="is_active" className="text-sm font-medium">
                {t('common.active', 'Active')}
              </label>
            </div>

            <DialogFooter className="pt-4">
              <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
                {t('common.cancel', 'Cancel')}
              </Button>
              <Button type="submit" disabled={processing}>
                {t('common.save', 'Save')}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteConfirmSource} onOpenChange={(open) => !open && setDeleteConfirmSource(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('common.are_you_sure', 'Are you sure?')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('support.confirm_delete_source', 'Are you sure you want to delete this source? This action cannot be undone.')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={processing}>{t('common.cancel', 'Cancel')}</AlertDialogCancel>
            <AlertDialogAction 
              onClick={(e) => { e.preventDefault(); confirmDelete(); }} 
              className="bg-destructive hover:bg-destructive/90 text-destructive-foreground relative"
            >
              {processing && <span className="absolute inset-0 flex items-center justify-center bg-destructive"><div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" /></span>}
              <span className={processing ? 'invisible' : ''}>{t('common.delete', 'Delete')}</span>
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

    </AppLayout>
  );
}
