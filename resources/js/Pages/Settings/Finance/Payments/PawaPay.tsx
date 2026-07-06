import React, { useState } from 'react';
import { Head, router, useForm } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { Button } from '@/Components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/Components/ui/card';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import { Textarea } from '@/Components/ui/textarea';
import { Switch } from '@/Components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/Components/ui/select';
import { Badge } from '@/Components/ui/badge';
import { Alert, AlertDescription } from '@/Components/ui/alert';
import {
  ArrowLeft,
  Smartphone,
  Key,
  Server,
  CheckCircle,
  Eye,
  EyeOff,
  TestTube,
  Loader2,
  Save,
  Info,
  Database,
} from 'lucide-react';
import useRoute from '@/Hooks/useRoute';
import { toast } from 'sonner';

interface PawaPayConfiguration {
  env: 'sandbox' | 'production';
  configured: boolean;
  platform_configured: boolean;
  use_own_credentials: boolean;
  credentials_source: 'platform' | 'own';
  stored_in_database: boolean;
  provider_label: string;
  base_url: string;
  base_url_sandbox: string;
  base_url_prod: string;
  callback_url: string;
  timeout: number;
  enable_logging: boolean;
  public_key_id: string;
  private_key_set: boolean;
  public_key_set: boolean;
  api_token_masked: string | null;
  transaction_id_prefix: string;
}

interface Props {
  configuration: PawaPayConfiguration;
  canManagePlatform?: boolean;
}

export default function PawaPaySettings({ configuration, canManagePlatform = false }: Props) {
  const route = useRoute();
  const [showApiToken, setShowApiToken] = useState(false);
  const [showPrivateKey, setShowPrivateKey] = useState(false);
  const [showPublicKey, setShowPublicKey] = useState(false);
  const [isTestingConnection, setIsTestingConnection] = useState(false);
  const [useOwnCredentials, setUseOwnCredentials] = useState(configuration.use_own_credentials);
  const [platformScope, setPlatformScope] = useState(false);

  const { data, setData, put, processing, errors } = useForm({
    use_own_credentials: configuration.use_own_credentials,
    platform_scope: false,
    env: configuration.env || 'sandbox',
    api_token: '',
    base_url_sandbox: configuration.base_url_sandbox || 'https://api.sandbox.pawapay.io/v2',
    base_url_prod: configuration.base_url_prod || 'https://api.pawapay.io/v2',
    callback_url: configuration.callback_url || '',
    timeout: configuration.timeout || 30,
    enable_logging: configuration.enable_logging ?? true,
    private_key: '',
    public_key: '',
    public_key_id: configuration.public_key_id || '',
    transaction_id_prefix: configuration.transaction_id_prefix || 'MOMO',
  });

  const requiresToken = platformScope
    ? !configuration.platform_configured
    : useOwnCredentials && !configuration.configured;

  const showCredentialForm = platformScope || useOwnCredentials;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    setData('use_own_credentials', useOwnCredentials);
    setData('platform_scope', platformScope);

    if (showCredentialForm && requiresToken && !data.api_token.trim()) {
      toast.error('API token is required for the initial setup');
      return;
    }

    put(route('settings.finance.payments.pawapay.update'), {
      onSuccess: () => {
        toast.success(platformScope
          ? 'Platform PawaPay configuration saved'
          : useOwnCredentials
            ? 'Organization PawaPay credentials saved'
            : 'Using platform PawaPay for this organization');
        setData('api_token', '');
        setData('private_key', '');
        setData('public_key', '');
      },
      onError: () => {
        toast.error('Failed to save PawaPay configuration');
      },
    });
  };

  const testConnection = async () => {
    setIsTestingConnection(true);

    try {
      const response = await fetch(route('settings.finance.payments.pawapay.test'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (result.success) {
        toast.success(result.message || 'Connected to PawaPay', {
          description: result.providers?.length
            ? `Available networks: ${result.providers.join(', ')}`
            : result.response_time
              ? `Response time: ${result.response_time}ms`
              : undefined,
        });
      } else {
        toast.error(result.message || 'Connection test failed');
      }
    } catch {
      toast.error('Connection test failed');
    } finally {
      setIsTestingConnection(false);
    }
  };

  return (
    <AppLayout
      title="PawaPay Settings"
      renderHeader={() => (
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.visit(route('settings.finance.index'))}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Finance Settings
            </Button>
            <div className="flex items-center gap-2">
              <Smartphone className="h-6 w-6 text-gray-600 dark:text-gray-400" />
              <h2 className="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">
                PawaPay
              </h2>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-blue-600 border-blue-600">
              <Database className="h-3 w-3 mr-1" />
              Database
            </Badge>
            <Badge variant="outline" className={configuration.configured ? 'text-green-600 border-green-600' : 'text-amber-600 border-amber-600'}>
              {configuration.configured ? (
                <>
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Connected
                </>
              ) : (
                'Not configured'
              )}
            </Badge>
          </div>
        </div>
      )}
    >
      <Head title="PawaPay Settings" />

      <div className="py-12">
        <div className="max-w-3xl mx-auto sm:px-6 lg:px-8 space-y-6">
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              {platformScope
                ? 'These credentials are saved globally and used by all organizations unless they configure their own PawaPay account.'
                : useOwnCredentials
                  ? 'Your organization will collect payments using your own PawaPay credentials.'
                  : 'This organization uses the platform-integrated PawaPay account. Enable your own credentials below only if you have a separate PawaPay merchant account.'}
            </AlertDescription>
          </Alert>

          {canManagePlatform && (
            <Card>
              <CardHeader>
                <CardTitle>Platform PawaPay</CardTitle>
                <CardDescription>
                  Default mobile money account for all tenants
                  {configuration.platform_configured ? ' — configured' : ' — not configured yet'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Edit platform credentials</Label>
                    <p className="text-sm text-muted-foreground">Super-user only — saves globally</p>
                  </div>
                  <Switch checked={platformScope} onCheckedChange={setPlatformScope} />
                </div>
              </CardContent>
            </Card>
          )}

          {!platformScope && (
            <Card>
              <CardHeader>
                <CardTitle>Organization payment account</CardTitle>
                <CardDescription>
                  {useOwnCredentials
                    ? 'Using your own PawaPay credentials'
                    : 'Using platform PawaPay (recommended)'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Use my own PawaPay credentials</Label>
                    <p className="text-sm text-muted-foreground">
                      Leave off to use the system-integrated PawaPay account
                    </p>
                  </div>
                  <Switch
                    checked={useOwnCredentials}
                    onCheckedChange={setUseOwnCredentials}
                  />
                </div>
              </CardContent>
            </Card>
          )}

          {!showCredentialForm && (
            <Alert className="border-green-500/30">
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                Payments for shop checkout and subscription billing will route through the platform PawaPay integration
                {configuration.platform_configured ? '.' : ' once the platform owner configures PawaPay.'}
              </AlertDescription>
            </Alert>
          )}

          {showCredentialForm && (
          <form onSubmit={handleSubmit} className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Server className="h-5 w-5" />
                  Environment & URLs
                </CardTitle>
                <CardDescription>
                  Active base URL: <span className="font-mono text-xs">{configuration.base_url}</span>
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Environment</Label>
                  <Select value={data.env} onValueChange={(value: 'sandbox' | 'production') => setData('env', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="sandbox">Sandbox</SelectItem>
                      <SelectItem value="production">Production</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.env && <p className="text-sm text-red-600">{errors.env}</p>}
                </div>

                <div className="grid grid-cols-1 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="base_url_sandbox">Sandbox base URL</Label>
                    <Input
                      id="base_url_sandbox"
                      value={data.base_url_sandbox}
                      onChange={(e) => setData('base_url_sandbox', e.target.value)}
                      placeholder="https://api.sandbox.pawapay.io/v2"
                      required
                    />
                    {errors.base_url_sandbox && <p className="text-sm text-red-600">{errors.base_url_sandbox}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="base_url_prod">Production base URL</Label>
                    <Input
                      id="base_url_prod"
                      value={data.base_url_prod}
                      onChange={(e) => setData('base_url_prod', e.target.value)}
                      placeholder="https://api.pawapay.io/v2"
                      required
                    />
                    {errors.base_url_prod && <p className="text-sm text-red-600">{errors.base_url_prod}</p>}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Key className="h-5 w-5" />
                  Credentials
                </CardTitle>
                <CardDescription>
                  {configuration.api_token_masked
                    ? `Saved token: ${configuration.api_token_masked}`
                    : 'No API token saved in the database yet'}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="api_token">
                    API Token {requiresToken && '*'}
                  </Label>
                  <div className="relative">
                    <Input
                      id="api_token"
                      type={showApiToken ? 'text' : 'password'}
                      value={data.api_token}
                      onChange={(e) => setData('api_token', e.target.value)}
                      placeholder={requiresToken ? 'Paste your PawaPay API token' : 'Leave blank to keep the saved token'}
                      className="pr-10"
                      required={requiresToken}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3"
                      onClick={() => setShowApiToken(!showApiToken)}
                    >
                      {showApiToken ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                  {errors.api_token && <p className="text-sm text-red-600">{errors.api_token}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="callback_url">Callback URL</Label>
                  <Input
                    id="callback_url"
                    value={data.callback_url}
                    onChange={(e) => setData('callback_url', e.target.value)}
                    placeholder="https://your-app.com/api/pawapay/callback"
                  />
                  {errors.callback_url && <p className="text-sm text-red-600">{errors.callback_url}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="public_key_id">Public Key ID (for signed requests)</Label>
                  <Input
                    id="public_key_id"
                    value={data.public_key_id}
                    onChange={(e) => setData('public_key_id', e.target.value)}
                    placeholder="Key ID from PawaPay dashboard"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="private_key">
                    Private Key
                    {configuration.private_key_set && ' — leave blank to keep the saved key'}
                  </Label>
                  <div className="relative">
                    <Textarea
                      id="private_key"
                      value={data.private_key}
                      onChange={(e) => setData('private_key', e.target.value)}
                      placeholder="PEM private key for signing outgoing requests"
                      rows={4}
                      className={showPrivateKey ? '' : 'font-mono text-transparent caret-foreground'}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-2 top-2"
                      onClick={() => setShowPrivateKey(!showPrivateKey)}
                    >
                      {showPrivateKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="public_key">
                    PawaPay Public Key
                    {configuration.public_key_set && ' — leave blank to keep the saved key'}
                  </Label>
                  <div className="relative">
                    <Textarea
                      id="public_key"
                      value={data.public_key}
                      onChange={(e) => setData('public_key', e.target.value)}
                      placeholder="PEM public key for verifying PawaPay webhook signatures"
                      rows={4}
                      className={showPublicKey ? '' : 'font-mono text-transparent caret-foreground'}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-2 top-2"
                      onClick={() => setShowPublicKey(!showPublicKey)}
                    >
                      {showPublicKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Options</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="transaction_id_prefix">Transaction reference prefix</Label>
                  <Input
                    id="transaction_id_prefix"
                    value={data.transaction_id_prefix}
                    onChange={(e) => setData('transaction_id_prefix', e.target.value.toUpperCase())}
                    placeholder="MOMO"
                    maxLength={20}
                  />
                  <p className="text-sm text-muted-foreground">
                    Sent to PawaPay as <code className="text-xs">clientReferenceId</code> (e.g.{' '}
                    <span className="font-mono">{data.transaction_id_prefix || 'MOMO'}-202606-000001</span>).
                    Deposit, payout, and refund IDs remain UUIDs as required by PawaPay.
                  </p>
                  {errors.transaction_id_prefix && (
                    <p className="text-sm text-red-600">{errors.transaction_id_prefix}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="timeout">Request timeout (seconds)</Label>
                  <Input
                    id="timeout"
                    type="number"
                    min={5}
                    max={120}
                    value={data.timeout}
                    onChange={(e) => setData('timeout', parseInt(e.target.value, 10) || 30)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Enable request logging</Label>
                    <p className="text-sm text-muted-foreground">Log PawaPay API requests for debugging</p>
                  </div>
                  <Switch
                    checked={data.enable_logging}
                    onCheckedChange={(checked) => setData('enable_logging', checked)}
                  />
                </div>
              </CardContent>
            </Card>

            <div className="flex gap-3">
              <Button type="submit" disabled={processing}>
                {processing ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Save className="h-4 w-4 mr-2" />
                )}
                Save configuration
              </Button>
              <Button type="button" variant="outline" onClick={testConnection} disabled={isTestingConnection}>
                {isTestingConnection ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <TestTube className="h-4 w-4 mr-2" />
                )}
                Test connection
              </Button>
            </div>
          </form>
          )}

          {!showCredentialForm && (
            <Button
              type="button"
              disabled={processing}
              onClick={() => {
                setData('use_own_credentials', useOwnCredentials);
                setData('platform_scope', false);
                put(route('settings.finance.payments.pawapay.update'), {
                  onSuccess: () => toast.success('PawaPay settings updated'),
                });
              }}
            >
              {processing ? 'Saving…' : 'Save payment settings'}
            </Button>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
