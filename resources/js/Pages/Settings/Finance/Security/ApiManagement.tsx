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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/Components/ui/tabs';
import {
  ArrowLeft,
  Key,
  Shield,
  Lock,
  Eye,
  EyeOff,
  AlertTriangle,
  CheckCircle,
  Save,
  Loader2,
  RefreshCw,
  Copy,
  Trash2,
  Plus,
  Settings
} from 'lucide-react';
import useTranslate from '@/Hooks/useTranslate';
import useRoute from '@/Hooks/useRoute';
import { toast } from 'sonner';

interface ApiKey {
  id: string;
  name: string;
  key: string;
  permissions: string[];
  last_used: string | null;
  expires_at: string | null;
  is_active: boolean;
  created_at: string;
}

interface SecuritySettings {
  api_rate_limiting_enabled: boolean;
  api_rate_limit_per_minute: number;
  api_key_expiry_days: number;
  require_api_key_rotation: boolean;
  enable_ip_whitelisting: boolean;
  allowed_ip_addresses: string[];
  enable_request_signing: boolean;
  signature_algorithm: string;
  enable_audit_logging: boolean;
  log_retention_days: number;
  enable_encryption_at_rest: boolean;
  encryption_key_rotation_days: number;
  enable_two_factor_auth: boolean;
  session_timeout_minutes: number;
}

interface Props {
  apiKeys: ApiKey[];
  securitySettings: SecuritySettings;
  availablePermissions: string[];
  signatureAlgorithms: string[];
}

export default function SecurityApiManagement({ 
  apiKeys, 
  securitySettings, 
  availablePermissions, 
  signatureAlgorithms 
}: Props) {
  const { t } = useTranslate();
  const route = useRoute();
  const [activeTab, setActiveTab] = useState('api-keys');
  const [showApiKeys, setShowApiKeys] = useState<Record<string, boolean>>({});
  const [isGeneratingKey, setIsGeneratingKey] = useState(false);

  const { data, setData, put, processing, errors, reset } = useForm({
    api_rate_limiting_enabled: securitySettings.api_rate_limiting_enabled || true,
    api_rate_limit_per_minute: securitySettings.api_rate_limit_per_minute || 100,
    api_key_expiry_days: securitySettings.api_key_expiry_days || 365,
    require_api_key_rotation: securitySettings.require_api_key_rotation || true,
    enable_ip_whitelisting: securitySettings.enable_ip_whitelisting || false,
    allowed_ip_addresses: securitySettings.allowed_ip_addresses || [],
    enable_request_signing: securitySettings.enable_request_signing || true,
    signature_algorithm: securitySettings.signature_algorithm || 'HMAC-SHA256',
    enable_audit_logging: securitySettings.enable_audit_logging || true,
    log_retention_days: securitySettings.log_retention_days || 90,
    enable_encryption_at_rest: securitySettings.enable_encryption_at_rest || true,
    encryption_key_rotation_days: securitySettings.encryption_key_rotation_days || 90,
    enable_two_factor_auth: securitySettings.enable_two_factor_auth || false,
    session_timeout_minutes: securitySettings.session_timeout_minutes || 60,
  });

  const [newApiKey, setNewApiKey] = useState({
    name: '',
    permissions: [] as string[],
    expires_at: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    put(route('settings.finance.security.update'), {
      onSuccess: () => {
        toast.success('Security settings updated successfully');
      },
      onError: () => {
        toast.error('Failed to update security settings');
      },
    });
  };

  const generateApiKey = async () => {
    if (!newApiKey.name.trim()) {
      toast.error('Please enter a name for the API key');
      return;
    }

    setIsGeneratingKey(true);
    
    try {
      const response = await fetch(route('settings.finance.security.api-keys.generate'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
        },
        body: JSON.stringify(newApiKey),
      });
      
      const result = await response.json();
      
      if (result.success) {
        toast.success('API key generated successfully');
        setNewApiKey({ name: '', permissions: [], expires_at: '' });
        // Refresh the page to show the new key
        window.location.reload();
      } else {
        toast.error(`Failed to generate API key: ${result.message}`);
      }
    } catch (error) {
      toast.error('Failed to generate API key');
    } finally {
      setIsGeneratingKey(false);
    }
  };

  const revokeApiKey = async (keyId: string) => {
    if (!confirm('Are you sure you want to revoke this API key? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await fetch(route('settings.finance.security.api-keys.revoke', keyId), {
        method: 'DELETE',
        headers: {
          'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
        },
      });
      
      const result = await response.json();
      
      if (result.success) {
        toast.success('API key revoked successfully');
        window.location.reload();
      } else {
        toast.error(`Failed to revoke API key: ${result.message}`);
      }
    } catch (error) {
      toast.error('Failed to revoke API key');
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard');
  };

  const toggleApiKeyVisibility = (keyId: string) => {
    setShowApiKeys(prev => ({
      ...prev,
      [keyId]: !prev[keyId]
    }));
  };

  return (
    <AppLayout
      title="Security & API Management"
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
              <Shield className="h-6 w-6 text-gray-600 dark:text-gray-400" />
              <h2 className="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">
                Security & API Management
              </h2>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-red-600 border-red-600">
              <AlertTriangle className="h-3 w-3 mr-1" />
              High Security
            </Badge>
          </div>
        </div>
      )}
    >
      <Head title="Security & API Management" />

      <div className="py-12">
        <div className="max-w-6xl mx-auto sm:px-6 lg:px-8">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-6">
              <TabsTrigger value="api-keys">
                <Key className="h-4 w-4 mr-2" />
                API Keys
              </TabsTrigger>
              <TabsTrigger value="security">
                <Shield className="h-4 w-4 mr-2" />
                Security Settings
              </TabsTrigger>
              <TabsTrigger value="encryption">
                <Lock className="h-4 w-4 mr-2" />
                Encryption
              </TabsTrigger>
            </TabsList>

            {/* API Keys Tab */}
            <TabsContent value="api-keys" className="space-y-6">
              {/* Generate New API Key */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Plus className="h-5 w-5" />
                    Generate New API Key
                  </CardTitle>
                  <CardDescription>
                    Create a new API key for external integrations
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="key_name">API Key Name</Label>
                      <Input
                        id="key_name"
                        placeholder="e.g., Mobile App Integration"
                        value={newApiKey.name}
                        onChange={(e) => setNewApiKey({ ...newApiKey, name: e.target.value })}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="expires_at">Expiry Date (Optional)</Label>
                      <Input
                        id="expires_at"
                        type="date"
                        value={newApiKey.expires_at}
                        onChange={(e) => setNewApiKey({ ...newApiKey, expires_at: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Permissions</Label>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                      {availablePermissions.map((permission) => (
                        <label key={permission} className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            checked={newApiKey.permissions.includes(permission)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setNewApiKey({
                                  ...newApiKey,
                                  permissions: [...newApiKey.permissions, permission]
                                });
                              } else {
                                setNewApiKey({
                                  ...newApiKey,
                                  permissions: newApiKey.permissions.filter(p => p !== permission)
                                });
                              }
                            }}
                            className="rounded border-gray-300"
                          />
                          <span className="text-sm">{permission}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <Button
                    onClick={generateApiKey}
                    disabled={isGeneratingKey || !newApiKey.name.trim()}
                  >
                    {isGeneratingKey ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Key className="h-4 w-4 mr-2" />
                    )}
                    Generate API Key
                  </Button>
                </CardContent>
              </Card>

              {/* Existing API Keys */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Key className="h-5 w-5" />
                    Existing API Keys
                  </CardTitle>
                  <CardDescription>
                    Manage your existing API keys and their permissions
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {apiKeys.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      No API keys found. Generate your first API key above.
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {apiKeys.map((apiKey) => (
                        <div key={apiKey.id} className="border rounded-lg p-4">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <h4 className="font-medium">{apiKey.name}</h4>
                              <Badge variant={apiKey.is_active ? 'default' : 'secondary'}>
                                {apiKey.is_active ? 'Active' : 'Inactive'}
                              </Badge>
                            </div>
                            <div className="flex items-center gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => toggleApiKeyVisibility(apiKey.id)}
                              >
                                {showApiKeys[apiKey.id] ? (
                                  <EyeOff className="h-4 w-4" />
                                ) : (
                                  <Eye className="h-4 w-4" />
                                )}
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => copyToClipboard(apiKey.key)}
                              >
                                <Copy className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => revokeApiKey(apiKey.id)}
                                className="text-red-600 hover:text-red-700"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>

                          <div className="space-y-2">
                            <div className="font-mono text-sm bg-gray-100 dark:bg-gray-800 p-2 rounded">
                              {showApiKeys[apiKey.id] ? apiKey.key : '••••••••••••••••••••••••••••••••'}
                            </div>
                            
                            <div className="flex flex-wrap gap-1">
                              {apiKey.permissions.map((permission) => (
                                <Badge key={permission} variant="outline" className="text-xs">
                                  {permission}
                                </Badge>
                              ))}
                            </div>

                            <div className="text-sm text-gray-500 grid grid-cols-2 gap-4">
                              <div>Created: {new Date(apiKey.created_at).toLocaleDateString()}</div>
                              <div>Last Used: {apiKey.last_used ? new Date(apiKey.last_used).toLocaleDateString() : 'Never'}</div>
                              {apiKey.expires_at && (
                                <div>Expires: {new Date(apiKey.expires_at).toLocaleDateString()}</div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Security Settings Tab */}
            <TabsContent value="security" className="space-y-6">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Rate Limiting */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Settings className="h-5 w-5" />
                      Rate Limiting
                    </CardTitle>
                    <CardDescription>
                      Configure API rate limiting to prevent abuse
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Enable API Rate Limiting</Label>
                        <p className="text-sm text-gray-500">Limit the number of API requests per minute</p>
                      </div>
                      <Switch
                        checked={data.api_rate_limiting_enabled}
                        onCheckedChange={(checked) => setData('api_rate_limiting_enabled', checked)}
                      />
                    </div>

                    {data.api_rate_limiting_enabled && (
                      <div className="space-y-2">
                        <Label htmlFor="api_rate_limit_per_minute">Requests per Minute</Label>
                        <Input
                          id="api_rate_limit_per_minute"
                          type="number"
                          min="1"
                          max="10000"
                          value={data.api_rate_limit_per_minute}
                          onChange={(e) => setData('api_rate_limit_per_minute', parseInt(e.target.value))}
                        />
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* IP Whitelisting */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Shield className="h-5 w-5" />
                      IP Whitelisting
                    </CardTitle>
                    <CardDescription>
                      Restrict API access to specific IP addresses
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Enable IP Whitelisting</Label>
                        <p className="text-sm text-gray-500">Only allow API access from whitelisted IPs</p>
                      </div>
                      <Switch
                        checked={data.enable_ip_whitelisting}
                        onCheckedChange={(checked) => setData('enable_ip_whitelisting', checked)}
                      />
                    </div>

                    {data.enable_ip_whitelisting && (
                      <div className="space-y-2">
                        <Label htmlFor="allowed_ip_addresses">Allowed IP Addresses</Label>
                        <Textarea
                          id="allowed_ip_addresses"
                          placeholder="192.168.1.1&#10;10.0.0.1&#10;203.0.113.0/24"
                          value={data.allowed_ip_addresses.join('\n')}
                          onChange={(e) => setData('allowed_ip_addresses', e.target.value.split('\n').filter(ip => ip.trim()))}
                          rows={4}
                        />
                        <p className="text-sm text-gray-500">Enter one IP address or CIDR block per line</p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Request Signing */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Key className="h-5 w-5" />
                      Request Signing
                    </CardTitle>
                    <CardDescription>
                      Require cryptographic signatures for API requests
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Enable Request Signing</Label>
                        <p className="text-sm text-gray-500">Require HMAC signatures for all API requests</p>
                      </div>
                      <Switch
                        checked={data.enable_request_signing}
                        onCheckedChange={(checked) => setData('enable_request_signing', checked)}
                      />
                    </div>

                    {data.enable_request_signing && (
                      <div className="space-y-2">
                        <Label htmlFor="signature_algorithm">Signature Algorithm</Label>
                        <Select value={data.signature_algorithm} onValueChange={(value) => setData('signature_algorithm', value)}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select signature algorithm" />
                          </SelectTrigger>
                          <SelectContent>
                            {signatureAlgorithms.map((algorithm) => (
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

                <div className="flex items-center justify-end gap-2">
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
                    Save Security Settings
                  </Button>
                </div>
              </form>
            </TabsContent>

            {/* Encryption Tab */}
            <TabsContent value="encryption" className="space-y-6">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Encryption at Rest */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Lock className="h-5 w-5" />
                      Encryption at Rest
                    </CardTitle>
                    <CardDescription>
                      Configure encryption for stored data
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Enable Encryption at Rest</Label>
                        <p className="text-sm text-gray-500">Encrypt sensitive data in the database</p>
                      </div>
                      <Switch
                        checked={data.enable_encryption_at_rest}
                        onCheckedChange={(checked) => setData('enable_encryption_at_rest', checked)}
                      />
                    </div>

                    {data.enable_encryption_at_rest && (
                      <div className="space-y-2">
                        <Label htmlFor="encryption_key_rotation_days">Key Rotation Interval (days)</Label>
                        <Input
                          id="encryption_key_rotation_days"
                          type="number"
                          min="30"
                          max="365"
                          value={data.encryption_key_rotation_days}
                          onChange={(e) => setData('encryption_key_rotation_days', parseInt(e.target.value))}
                        />
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Audit Logging */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Settings className="h-5 w-5" />
                      Audit Logging
                    </CardTitle>
                    <CardDescription>
                      Configure audit logging for security events
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Enable Audit Logging</Label>
                        <p className="text-sm text-gray-500">Log all security-related events</p>
                      </div>
                      <Switch
                        checked={data.enable_audit_logging}
                        onCheckedChange={(checked) => setData('enable_audit_logging', checked)}
                      />
                    </div>

                    {data.enable_audit_logging && (
                      <div className="space-y-2">
                        <Label htmlFor="log_retention_days">Log Retention Period (days)</Label>
                        <Input
                          id="log_retention_days"
                          type="number"
                          min="30"
                          max="2555"
                          value={data.log_retention_days}
                          onChange={(e) => setData('log_retention_days', parseInt(e.target.value))}
                        />
                      </div>
                    )}
                  </CardContent>
                </Card>

                <div className="flex items-center justify-end gap-2">
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
                    Save Encryption Settings
                  </Button>
                </div>
              </form>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </AppLayout>
  );
}
