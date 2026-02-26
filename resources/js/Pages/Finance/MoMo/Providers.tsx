import React, { useState } from 'react';
import { Head, Link, router, useForm } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/Components/ui/card';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import { Badge } from '@/Components/ui/badge';
import { Switch } from '@/Components/ui/switch';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/Components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/Components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/Components/ui/dropdown-menu';
import {
  ArrowLeft,
  Settings,
  Plus,
  MoreHorizontal,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
  Smartphone,
  Key,
  DollarSign,
  Activity
} from 'lucide-react';
import useTranslate from '@/Hooks/useTranslate';
import useRoute from '@/Hooks/useRoute';
import { toast } from 'sonner';

interface MomoProvider {
  id: number;
  display_name: string;
  provider_code: string;
  api_base_url: string;
  is_active: boolean;
  supported_currencies: string[];
  fee_structure: {
    fixed_fee?: number;
    percentage_fee?: number;
    minimum_fee?: number;
    maximum_fee?: number;
  };
  last_health_check?: string;
  health_status?: 'healthy' | 'degraded' | 'down';
  created_at: string;
  updated_at: string;
}

interface Props {
  providers: MomoProvider[];
}

export default function Providers({ providers }: Props) {
  const { t } = useTranslate();
  const route = useRoute();
  const [editingProvider, setEditingProvider] = useState<MomoProvider | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const { data, setData, post, put, processing, errors, reset } = useForm({
    display_name: '',
    provider_code: '',
    api_base_url: '',
    client_id: '',
    client_secret: '',
    is_active: true,
    supported_currencies: ['ZMW'],
    fee_structure: {
      fixed_fee: 0,
      percentage_fee: 0,
      minimum_fee: 0,
      maximum_fee: 0,
    },
  });

  const handleEdit = (provider: MomoProvider) => {
    setEditingProvider(provider);
    setData({
      display_name: provider.display_name,
      provider_code: provider.provider_code,
      api_base_url: provider.api_base_url,
      client_id: '',
      client_secret: '',
      is_active: provider.is_active,
      supported_currencies: provider.supported_currencies,
      fee_structure: provider.fee_structure,
    });
    setIsDialogOpen(true);
  };

  const handleCreate = () => {
    setEditingProvider(null);
    reset();
    setIsDialogOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const url = editingProvider
      ? route('finance.momo.providers.update', editingProvider.id)
      : route('finance.momo.providers.store');

    const method = editingProvider ? put : post;

    method(url, {
      onSuccess: () => {
        toast.success(
          editingProvider
            ? t('finance.momo.provider_updated', 'Provider updated successfully')
            : t('finance.momo.provider_created', 'Provider created successfully')
        );
        setIsDialogOpen(false);
        reset();
      },
      onError: () => {
        toast.error(t('common.error_occurred', 'An error occurred'));
      },
    });
  };

  const handleDelete = (provider: MomoProvider) => {
    if (confirm(t('finance.momo.confirm_delete_provider', 'Are you sure you want to delete this provider?'))) {
      router.delete(route('finance.momo.providers.destroy', provider.id), {
        onSuccess: () => {
          toast.success(t('finance.momo.provider_deleted', 'Provider deleted successfully'));
        },
        onError: () => {
          toast.error(t('common.error_occurred', 'An error occurred'));
        },
      });
    }
  };

  const handleToggleStatus = (provider: MomoProvider) => {
    router.patch(route('finance.momo.providers.toggle', provider.id), {}, {
      onSuccess: () => {
        toast.success(
          provider.is_active
            ? t('finance.momo.provider_disabled', 'Provider disabled')
            : t('finance.momo.provider_enabled', 'Provider enabled')
        );
      },
      onError: () => {
        toast.error(t('common.error_occurred', 'An error occurred'));
      },
    });
  };

  const handleHealthCheck = (provider: MomoProvider) => {
    router.post(route('finance.momo.providers.health-check', provider.id), {}, {
      onSuccess: () => {
        toast.success(t('finance.momo.health_check_completed', 'Health check completed'));
      },
      onError: () => {
        toast.error(t('common.error_occurred', 'An error occurred'));
      },
    });
  };

  const getHealthBadge = (status?: string) => {
    const statusConfig = {
      healthy: { variant: 'default' as const, icon: CheckCircle, color: 'text-green-600' },
      degraded: { variant: 'secondary' as const, icon: Activity, color: 'text-yellow-600' },
      down: { variant: 'destructive' as const, icon: XCircle, color: 'text-red-600' },
    };

    if (!status) {
      return <Badge variant="outline">Unknown</Badge>;
    }

    const config = statusConfig[status as keyof typeof statusConfig];
    if (!config) {
      return <Badge variant="outline">{status}</Badge>;
    }

    const Icon = config.icon;

    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon className="h-3 w-3" />
        {t(`finance.momo.health.${status}`, status)}
      </Badge>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <AppLayout
      title={t('finance.momo.providers', 'Mobile Money Providers')}
      >
      <Head title={t('finance.momo.providers', 'Mobile Money Providers')} />

      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="outline" size="icon" asChild>
              <Link href={route('finance.momo.index')}>
                <ArrowLeft className="h-4 w-4" />
              </Link>
            </Button>
            <div>
              <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
                {t('finance.momo.providers', 'Mobile Money Providers')}
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {t('finance.momo.providers_description', 'Manage mobile money provider configurations')}
              </p>
            </div>
          </div>
          <Button onClick={handleCreate}>
            <Plus className="h-4 w-4" />
            {t('finance.momo.add_provider', 'Add Provider')}
          </Button>
        </div>

        {/* Providers Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Smartphone className="h-4 w-4" />
              {t('finance.momo.configured_providers', 'Configured Providers')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t('finance.momo.provider_name', 'Provider Name')}</TableHead>
                    <TableHead>{t('finance.momo.code', 'Code')}</TableHead>
                    <TableHead>{t('finance.momo.currencies', 'Currencies')}</TableHead>
                    <TableHead>{t('finance.momo.health_status', 'Health')}</TableHead>
                    <TableHead>{t('finance.momo.status', 'Status')}</TableHead>
                    <TableHead>{t('finance.momo.last_check', 'Last Check')}</TableHead>
                    <TableHead className="w-[50px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {providers.map((provider) => (
                    <TableRow key={provider.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          <div className="h-8 w-8 rounded bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-xs font-medium">
                            {provider.provider_code}
                          </div>
                          {provider.display_name}
                        </div>
                      </TableCell>
                      <TableCell>
                        <code className="text-xs bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
                          {provider.provider_code}
                        </code>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          {provider.supported_currencies.map((currency) => (
                            <Badge key={currency} variant="outline" className="text-xs">
                              {currency}
                            </Badge>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell>{getHealthBadge(provider.health_status)}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Switch
                            checked={provider.is_active}
                            onCheckedChange={() => handleToggleStatus(provider)}
                          />
                          <span className="text-sm">
                            {provider.is_active ? t('common.active', 'Active') : t('common.inactive', 'Inactive')}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-gray-600 dark:text-gray-400">
                        {provider.last_health_check ? formatDate(provider.last_health_check) : 'Never'}
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleEdit(provider)}>
                              <Edit className="h-4 w-4" />
                              {t('common.edit', 'Edit')}
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleHealthCheck(provider)}>
                              <Activity className="h-4 w-4" />
                              {t('finance.momo.health_check', 'Health Check')}
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleDelete(provider)}
                              className="text-red-600"
                            >
                              <Trash2 className="h-4 w-4" />
                              {t('common.delete', 'Delete')}
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Provider Configuration Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {editingProvider
                  ? t('finance.momo.edit_provider', 'Edit Provider')
                  : t('finance.momo.add_provider', 'Add Provider')}
              </DialogTitle>
              <DialogDescription>
                {t('finance.momo.provider_form_description', 'Configure mobile money provider settings and credentials')}
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="display_name">
                    {t('finance.momo.display_name', 'Display Name')} *
                  </Label>
                  <Input
                    id="display_name"
                    placeholder="MTN Mobile Money"
                    value={data.display_name}
                    onChange={(e) => setData('display_name', e.target.value)}
                    className={errors.display_name ? 'border-red-500' : ''}
                  />
                  {errors.display_name && (
                    <p className="text-sm text-red-600">{errors.display_name}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="provider_code">
                    {t('finance.momo.provider_code', 'Provider Code')} *
                  </Label>
                  <Input
                    id="provider_code"
                    placeholder="MTN"
                    value={data.provider_code}
                    onChange={(e) => setData('provider_code', e.target.value.toUpperCase())}
                    className={errors.provider_code ? 'border-red-500' : ''}
                  />
                  {errors.provider_code && (
                    <p className="text-sm text-red-600">{errors.provider_code}</p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="api_base_url">
                  {t('finance.momo.api_base_url', 'API Base URL')} *
                </Label>
                <Input
                  id="api_base_url"
                  placeholder="https://api.mtn.com/v1"
                  value={data.api_base_url}
                  onChange={(e) => setData('api_base_url', e.target.value)}
                  className={errors.api_base_url ? 'border-red-500' : ''}
                />
                {errors.api_base_url && (
                  <p className="text-sm text-red-600">{errors.api_base_url}</p>
                )}
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="client_id">
                    {t('finance.momo.client_id', 'Client ID')} *
                  </Label>
                  <Input
                    id="client_id"
                    placeholder="your-client-id"
                    value={data.client_id}
                    onChange={(e) => setData('client_id', e.target.value)}
                    className={errors.client_id ? 'border-red-500' : ''}
                  />
                  {errors.client_id && (
                    <p className="text-sm text-red-600">{errors.client_id}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="client_secret">
                    {t('finance.momo.client_secret', 'Client Secret')} *
                  </Label>
                  <Input
                    id="client_secret"
                    type="password"
                    placeholder="your-client-secret"
                    value={data.client_secret}
                    onChange={(e) => setData('client_secret', e.target.value)}
                    className={errors.client_secret ? 'border-red-500' : ''}
                  />
                  {errors.client_secret && (
                    <p className="text-sm text-red-600">{errors.client_secret}</p>
                  )}
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="is_active"
                  checked={data.is_active}
                  onCheckedChange={(checked) => setData('is_active', checked)}
                />
                <Label htmlFor="is_active">
                  {t('finance.momo.active_provider', 'Active Provider')}
                </Label>
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  {t('common.cancel', 'Cancel')}
                </Button>
                <Button type="submit" disabled={processing}>
                  {processing ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      {t('common.saving', 'Saving...')}
                    </>
                  ) : (
                    <>
                      <Settings className="h-4 w-4" />
                      {editingProvider ? t('common.update', 'Update') : t('common.create', 'Create')}
                    </>
                  )}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </AppLayout>
  );
}
