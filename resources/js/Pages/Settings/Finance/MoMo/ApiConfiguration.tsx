import React, { useState } from 'react';
import { Head, useForm } from '@inertiajs/react';
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
  Server,
  Key,
  Shield,
  AlertTriangle,
  CheckCircle,
  Eye,
  EyeOff,
  TestTube,
  Loader2,
  Save,
  RefreshCw,
  Info
} from 'lucide-react';
import useTranslate from '@/Hooks/useTranslate';
import useRoute from '@/Hooks/useRoute';
import { toast } from 'sonner';

interface ApiConfiguration {
  global_timeout: number;
  max_retry_attempts: number;
  retry_delay_seconds: number;
  enable_request_logging: boolean;
  enable_response_logging: boolean;
  log_sensitive_data: boolean;
  rate_limit_enabled: boolean;
  rate_limit_requests_per_minute: number;
  health_check_interval_minutes: number;
  auto_disable_unhealthy_providers: boolean;
  webhook_timeout_seconds: number;
  webhook_retry_attempts: number;
  enable_sandbox_mode: boolean;
  sandbox_api_base_url: string;
  production_api_base_url: string;
  default_currency: string;
  enable_transaction_encryption: boolean;
  encryption_algorithm: string;
  api_version: string;
}

interface Props {
  configuration: ApiConfiguration;
  supportedCurrencies: string[];
  encryptionAlgorithms: string[];
}

export default function MoMoApiConfiguration({ 
  configuration, 
  supportedCurrencies, 
  encryptionAlgorithms 
}: Props) {
  const { t } = useTranslate();
  const route = useRoute();
  const [showSensitiveFields, setShowSensitiveFields] = useState(false);
  const [isTestingConnection, setIsTestingConnection] = useState(false);

  const { data, setData, put, processing, errors, reset } = useForm({
    global_timeout: configuration.global_timeout || 30,
    max_retry_attempts: configuration.max_retry_attempts || 3,
    retry_delay_seconds: configuration.retry_delay_seconds || 5,
    enable_request_logging: configuration.enable_request_logging || true,
    enable_response_logging: configuration.enable_response_logging || true,
    log_sensitive_data: configuration.log_sensitive_data || false,
    rate_limit_enabled: configuration.rate_limit_enabled || true,
    rate_limit_requests_per_minute: configuration.rate_limit_requests_per_minute || 60,
    health_check_interval_minutes: configuration.health_check_interval_minutes || 15,
    auto_disable_unhealthy_providers: configuration.auto_disable_unhealthy_providers || true,
    webhook_timeout_seconds: configuration.webhook_timeout_seconds || 30,
    webhook_retry_attempts: configuration.webhook_retry_attempts || 3,
    enable_sandbox_mode: configuration.enable_sandbox_mode || false,
    sandbox_api_base_url: configuration.sandbox_api_base_url || '',
    production_api_base_url: configuration.production_api_base_url || '',
    default_currency: configuration.default_currency || 'ZMW',
    enable_transaction_encryption: configuration.enable_transaction_encryption || true,
    encryption_algorithm: configuration.encryption_algorithm || 'AES-256-GCM',
    api_version: configuration.api_version || 'v1',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    put(route('settings.finance.momo.api.update'), {
      onSuccess: () => {
        toast.success('MoMo API configuration updated successfully');
      },
      onError: () => {
        toast.error('Failed to update MoMo API configuration');
      },
    });
  };

  const testConnection = async () => {
    setIsTestingConnection(true);
    
    try {
      const response = await fetch(route('settings.finance.momo.api.test'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
        },
        body: JSON.stringify(data),
      });
      
      const result = await response.json();
      
      if (result.success) {
        toast.success('API connection test successful');
      } else {
        toast.error(`API connection test failed: ${result.message}`);
      }
    } catch (error) {
      toast.error('Failed to test API connection');
    } finally {
      setIsTestingConnection(false);
    }
  };

  return (
    <AppLayout
      title="MoMo API Configuration"
      renderHeader={() => (
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.history.back()}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <div className="flex items-center gap-2">
              <Server className="h-6 w-6 text-gray-600 dark:text-gray-400" />
              <h2 className="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">
                MoMo API Configuration
              </h2>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-orange-600 border-orange-600">
              <AlertTriangle className="h-3 w-3 mr-1" />
              Admin Only
            </Badge>
          </div>
        </div>
      )}
    >
      <Head title="MoMo API Configuration" />

      <div className="py-12">
        <div className="max-w-4xl mx-auto sm:px-6 lg:px-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Connection Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Server className="h-5 w-5" />
                  Connection Settings
                </CardTitle>
                <CardDescription>
                  Configure API connection parameters and timeouts
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="global_timeout">Global Timeout (seconds)</Label>
                    <Input
                      id="global_timeout"
                      type="number"
                      min="5"
                      max="300"
                      value={data.global_timeout}
                      onChange={(e) => setData('global_timeout', parseInt(e.target.value))}
                      className={errors.global_timeout ? 'border-red-500' : ''}
                    />
                    {errors.global_timeout && (
                      <p className="text-sm text-red-600">{errors.global_timeout}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="api_version">API Version</Label>
                    <Select value={data.api_version} onValueChange={(value) => setData('api_version', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select API version" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="v1">Version 1.0</SelectItem>
                        <SelectItem value="v2">Version 2.0</SelectItem>
                        <SelectItem value="v3">Version 3.0</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="max_retry_attempts">Max Retry Attempts</Label>
                    <Input
                      id="max_retry_attempts"
                      type="number"
                      min="0"
                      max="10"
                      value={data.max_retry_attempts}
                      onChange={(e) => setData('max_retry_attempts', parseInt(e.target.value))}
                      className={errors.max_retry_attempts ? 'border-red-500' : ''}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="retry_delay_seconds">Retry Delay (seconds)</Label>
                    <Input
                      id="retry_delay_seconds"
                      type="number"
                      min="1"
                      max="60"
                      value={data.retry_delay_seconds}
                      onChange={(e) => setData('retry_delay_seconds', parseInt(e.target.value))}
                      className={errors.retry_delay_seconds ? 'border-red-500' : ''}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Environment Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TestTube className="h-5 w-5" />
                  Environment Settings
                </CardTitle>
                <CardDescription>
                  Configure sandbox and production environment settings
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Enable Sandbox Mode</Label>
                    <p className="text-sm text-gray-500">Use sandbox environment for testing</p>
                  </div>
                  <Switch
                    checked={data.enable_sandbox_mode}
                    onCheckedChange={(checked) => setData('enable_sandbox_mode', checked)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="sandbox_api_base_url">Sandbox API Base URL</Label>
                  <Input
                    id="sandbox_api_base_url"
                    type="url"
                    placeholder="https://sandbox-api.momo.com"
                    value={data.sandbox_api_base_url}
                    onChange={(e) => setData('sandbox_api_base_url', e.target.value)}
                    className={errors.sandbox_api_base_url ? 'border-red-500' : ''}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="production_api_base_url">Production API Base URL</Label>
                  <Input
                    id="production_api_base_url"
                    type="url"
                    placeholder="https://api.momo.com"
                    value={data.production_api_base_url}
                    onChange={(e) => setData('production_api_base_url', e.target.value)}
                    className={errors.production_api_base_url ? 'border-red-500' : ''}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="default_currency">Default Currency</Label>
                  <Select value={data.default_currency} onValueChange={(value) => setData('default_currency', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select default currency" />
                    </SelectTrigger>
                    <SelectContent>
                      {supportedCurrencies.map((currency) => (
                        <SelectItem key={currency} value={currency}>
                          {currency}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Rate Limiting */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Rate Limiting & Security
                </CardTitle>
                <CardDescription>
                  Configure rate limiting and security settings
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Enable Rate Limiting</Label>
                    <p className="text-sm text-gray-500">Limit API requests per minute</p>
                  </div>
                  <Switch
                    checked={data.rate_limit_enabled}
                    onCheckedChange={(checked) => setData('rate_limit_enabled', checked)}
                  />
                </div>

                {data.rate_limit_enabled && (
                  <div className="space-y-2">
                    <Label htmlFor="rate_limit_requests_per_minute">Requests per Minute</Label>
                    <Input
                      id="rate_limit_requests_per_minute"
                      type="number"
                      min="1"
                      max="1000"
                      value={data.rate_limit_requests_per_minute}
                      onChange={(e) => setData('rate_limit_requests_per_minute', parseInt(e.target.value))}
                    />
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Enable Transaction Encryption</Label>
                    <p className="text-sm text-gray-500">Encrypt sensitive transaction data</p>
                  </div>
                  <Switch
                    checked={data.enable_transaction_encryption}
                    onCheckedChange={(checked) => setData('enable_transaction_encryption', checked)}
                  />
                </div>

                {data.enable_transaction_encryption && (
                  <div className="space-y-2">
                    <Label htmlFor="encryption_algorithm">Encryption Algorithm</Label>
                    <Select value={data.encryption_algorithm} onValueChange={(value) => setData('encryption_algorithm', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select encryption algorithm" />
                      </SelectTrigger>
                      <SelectContent>
                        {encryptionAlgorithms.map((algorithm) => (
                          <SelectItem key={algorithm} value={algorithm}>
                            {algorithm}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Logging Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Info className="h-5 w-5" />
                  Logging & Monitoring
                </CardTitle>
                <CardDescription>
                  Configure logging and monitoring settings
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Enable Request Logging</Label>
                      <p className="text-sm text-gray-500">Log API requests</p>
                    </div>
                    <Switch
                      checked={data.enable_request_logging}
                      onCheckedChange={(checked) => setData('enable_request_logging', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Enable Response Logging</Label>
                      <p className="text-sm text-gray-500">Log API responses</p>
                    </div>
                    <Switch
                      checked={data.enable_response_logging}
                      onCheckedChange={(checked) => setData('enable_response_logging', checked)}
                    />
                  </div>
                </div>

                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    <div className="flex items-center justify-between">
                      <div>
                        <strong>Log Sensitive Data</strong>
                        <p className="text-sm mt-1">Include sensitive data in logs (not recommended for production)</p>
                      </div>
                      <Switch
                        checked={data.log_sensitive_data}
                        onCheckedChange={(checked) => setData('log_sensitive_data', checked)}
                      />
                    </div>
                  </AlertDescription>
                </Alert>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="health_check_interval_minutes">Health Check Interval (minutes)</Label>
                    <Input
                      id="health_check_interval_minutes"
                      type="number"
                      min="5"
                      max="1440"
                      value={data.health_check_interval_minutes}
                      onChange={(e) => setData('health_check_interval_minutes', parseInt(e.target.value))}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Auto-disable Unhealthy Providers</Label>
                      <p className="text-sm text-gray-500">Automatically disable failing providers</p>
                    </div>
                    <Switch
                      checked={data.auto_disable_unhealthy_providers}
                      onCheckedChange={(checked) => setData('auto_disable_unhealthy_providers', checked)}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Webhook Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <RefreshCw className="h-5 w-5" />
                  Webhook Configuration
                </CardTitle>
                <CardDescription>
                  Configure webhook timeout and retry settings
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="webhook_timeout_seconds">Webhook Timeout (seconds)</Label>
                    <Input
                      id="webhook_timeout_seconds"
                      type="number"
                      min="5"
                      max="300"
                      value={data.webhook_timeout_seconds}
                      onChange={(e) => setData('webhook_timeout_seconds', parseInt(e.target.value))}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="webhook_retry_attempts">Webhook Retry Attempts</Label>
                    <Input
                      id="webhook_retry_attempts"
                      type="number"
                      min="0"
                      max="10"
                      value={data.webhook_retry_attempts}
                      onChange={(e) => setData('webhook_retry_attempts', parseInt(e.target.value))}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="flex items-center justify-between">
              <Button
                type="button"
                variant="outline"
                onClick={testConnection}
                disabled={isTestingConnection}
              >
                {isTestingConnection ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <TestTube className="h-4 w-4 mr-2" />
                )}
                Test Connection
              </Button>

              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => reset()}
                  disabled={processing}
                >
                  Reset
                </Button>
                <Button type="submit" disabled={processing}>
                  {processing ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4 mr-2" />
                  )}
                  Save Configuration
                </Button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </AppLayout>
  );
}
