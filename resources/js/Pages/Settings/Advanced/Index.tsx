import React, { useState } from 'react';
import { Head, useForm, router } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/Components/ui/card';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import { Switch } from '@/Components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/Components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/Components/ui/tabs';
import { Separator } from '@/Components/ui/separator';
import { Textarea } from '@/Components/ui/textarea';
import { Badge } from '@/Components/ui/badge';
import {
  ArrowLeft,
  Settings,
  Save,
  Shield,
  Zap,
  Plug,
  Server,
  Database,
  Trash2,
  Download,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  Info,
  Bot,
  Eye,
  EyeOff,
  TestTube,
  Loader2,
  Bell,
  Mail,
  Smartphone,
  Webhook
} from 'lucide-react';
import { toast } from 'sonner';
import useRoute from '@/Hooks/useRoute';

interface AdvancedSettingsProps {
  systemSettings: any;
  securitySettings: any;
  performanceSettings: any;
  integrationSettings: any;
  systemInfo: any;
}

export default function AdvancedSettings({
  systemSettings,
  securitySettings,
  performanceSettings,
  integrationSettings,
  systemInfo
}: AdvancedSettingsProps) {
  const route = useRoute();
  const [activeTab, setActiveTab] = useState('system');
  const [isMaintenanceRunning, setIsMaintenanceRunning] = useState(false);

  // Integration state
  const [showApiKeys, setShowApiKeys] = useState<Record<string, boolean>>({});
  const [connectionStatus, setConnectionStatus] = useState<Record<string, string>>(() => {
    const initial: Record<string, string> = {};
    Object.entries(integrationSettings.ai_services || {}).forEach(([service, config]: [string, any]) => {
      if (config?.status && config.status !== 'disconnected') {
        initial[`ai-${service}`] = config.status;
      }
    });
    return initial;
  });
  const [testingConnection, setTestingConnection] = useState<Record<string, boolean>>({});

  // Notification settings form
  const notificationForm = useForm({
    email_notifications: true,
    push_notifications: true,
    sms_notifications: false,
    slack_notifications: false,
    webhook_notifications: false,
    notification_frequency: 'immediate',
    admin_alerts: true,
    system_alerts: true,
    security_alerts: true,
    backup_alerts: true,
    error_alerts: true,
    performance_alerts: false,
    webhook_url: '',
    slack_webhook_url: '',
    email_from_name: 'TekRem ERP',
    email_from_address: 'noreply@tekrem.com',
  });

  // System settings form
  const systemForm = useForm(systemSettings);

  // Security settings form
  const securityForm = useForm(securitySettings);

  // Performance settings form
  const performanceForm = useForm(performanceSettings);

  // Integration settings form
  const integrationForm = useForm(integrationSettings);

  // AI service forms
  const aiServiceForms = {
    mistral: useForm(integrationSettings.ai_services?.mistral || {}),
    openai: useForm(integrationSettings.ai_services?.openai || {}),
    anthropic: useForm(integrationSettings.ai_services?.anthropic || {}),
  };

  const handleSystemSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    systemForm.put(route('settings.advanced.system.update'), {
      onSuccess: () => {
        toast.success('System settings updated!', {
          description: 'Advanced system settings have been saved successfully.'
        });
      },
      onError: () => {
        toast.error('Failed to update settings', {
          description: 'Please check the form for errors and try again.'
        });
      }
    });
  };

  const handleSecuritySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    securityForm.put(route('settings.advanced.security.update'), {
      onSuccess: () => {
        toast.success('Security settings updated!', {
          description: 'Security configuration has been saved successfully.'
        });
      },
      onError: () => {
        toast.error('Failed to update security settings', {
          description: 'Please check the form for errors and try again.'
        });
      }
    });
  };

  const handlePerformanceSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    performanceForm.put(route('settings.advanced.performance.update'), {
      onSuccess: () => {
        toast.success('Performance settings updated!', {
          description: 'Performance optimization settings have been saved successfully.'
        });
      },
      onError: () => {
        toast.error('Failed to update performance settings', {
          description: 'Please check the form for errors and try again.'
        });
      }
    });
  };

  const handleIntegrationSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    integrationForm.put(route('settings.advanced.integrations.update'), {
      onSuccess: () => {
        toast.success('Integration settings updated!', {
          description: 'Integration configuration has been saved successfully.'
        });
      },
      onError: () => {
        toast.error('Failed to update integration settings', {
          description: 'Please check the form for errors and try again.'
        });
      }
    });
  };

  const handleNotificationSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    notificationForm.put(route('settings.advanced.notifications.update'), {
      onSuccess: () => {
        toast.success('Notification settings updated!', {
          description: 'Notification preferences have been saved successfully.'
        });
      },
      onError: () => {
        toast.error('Failed to update notification settings', {
          description: 'Please check the form for errors and try again.'
        });
      }
    });
  };

  const handleMaintenanceAction = async (action: string) => {
    setIsMaintenanceRunning(true);

    try {
      const response = await fetch(route(`settings.maintenance.${action}`), {
        method: 'POST',
        headers: {
          'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
          'Content-Type': 'application/json',
        },
      });

      const result = await response.json();

      if (result.success) {
        toast.success(result.message, {
          description: result.details?.join(', ') || 'Operation completed successfully'
        });
      } else {
        toast.error(result.message || 'Operation failed');
      }
    } catch (error) {
      toast.error('Maintenance operation failed', {
        description: 'Please try again or check the system logs.'
      });
    } finally {
      setIsMaintenanceRunning(false);
    }
  };

  // Helper functions for integrations
  const toggleApiKeyVisibility = (service: string) => {
    setShowApiKeys(prev => ({
      ...prev,
      [service]: !prev[service]
    }));
  };

  const handleAIServiceSubmit = (service: string) => {
    const form = aiServiceForms[service as keyof typeof aiServiceForms];
    const { enabled, ...settings } = form.data;

    router.put(route('settings.advanced.ai-services.update'), {
      service,
      enabled,
      settings
    }, {
      onSuccess: () => {
        toast.success(`${service.charAt(0).toUpperCase() + service.slice(1)} AI service updated!`, {
          description: 'AI service settings have been saved successfully.'
        });
      },
      onError: () => {
        toast.error('Failed to update AI service settings', {
          description: 'Please check the form for errors and try again.'
        });
      }
    });
  };

  const testConnection = async (service: string) => {
    const key = `ai-${service}`;
    setTestingConnection(prev => ({ ...prev, [key]: true }));

    try {
      const form = aiServiceForms[service as keyof typeof aiServiceForms];

      const response = await fetch(route('settings.advanced.test-connection'), {
        method: 'POST',
        headers: {
          'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'ai',
          service,
          settings: form.data,
        }),
      });

      const result = await response.json();

      setConnectionStatus(prev => ({
        ...prev,
        [key]: result.status
      }));

      if (result.status === 'connected') {
        toast.success('Connection successful!', {
          description: result.message
        });
      } else {
        toast.error('Connection failed', {
          description: result.message
        });
      }
    } catch (error) {
      setConnectionStatus(prev => ({
        ...prev,
        [key]: 'error'
      }));
      toast.error('Connection test failed', {
        description: 'Please try again or check your settings.'
      });
    } finally {
      setTestingConnection(prev => ({ ...prev, [key]: false }));
    }
  };

  const getConnectionStatusBadge = (service: string) => {
    const key = `ai-${service}`;
    const status = connectionStatus[key] || 'disconnected';

    switch (status) {
      case 'connected':
        return <Badge variant="default" className="bg-green-100 text-green-800 border-green-200">Connected</Badge>;
      case 'configured':
        return <Badge variant="outline" className="text-blue-800 border-blue-200">Configured</Badge>;
      case 'error':
        return <Badge variant="destructive">Error</Badge>;
      default:
        return <Badge variant="secondary">Disconnected</Badge>;
    }
  };

  const defaultAiService = ['mistral', 'openai', 'anthropic'].find(
    (service) => aiServiceForms[service as keyof typeof aiServiceForms]?.data?.enabled
  );

  return (
    <AppLayout
      title="Advanced Settings"
      renderHeader={() => (
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.visit(route('settings.index'))}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Settings
            </Button>
            <div className="flex items-center gap-2">
              <Settings className="h-6 w-6 text-gray-600 dark:text-gray-400" />
              <h2 className="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">
                Advanced Settings
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
      <Head title="Advanced Settings" />

      <div className="space-y-6">
        {/* System Information Overview */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Info className="h-5 w-5" />
              System Information
            </CardTitle>
            <CardDescription>
              Current system status and configuration overview
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="space-y-1">
                <p className="text-sm font-medium">PHP Version</p>
                <p className="text-sm text-gray-600">{systemInfo.php_version}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium">Laravel Version</p>
                <p className="text-sm text-gray-600">{systemInfo.laravel_version}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium">Memory Usage</p>
                <p className="text-sm text-gray-600">{systemInfo.memory_usage}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium">Cache Status</p>
                <div className="flex items-center gap-1">
                  <CheckCircle className="h-3 w-3 text-green-600" />
                  <p className="text-sm text-gray-600">{systemInfo.cache_status}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Maintenance Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Server className="h-5 w-5" />
              System Maintenance
            </CardTitle>
            <CardDescription>
              Quick maintenance actions and system utilities
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              <Button
                variant="outline"
                className="h-auto p-4 flex flex-col items-center gap-2"
                onClick={() => handleMaintenanceAction('cache-clear')}
                disabled={isMaintenanceRunning}
              >
                <RefreshCw className={`h-5 w-5 ${isMaintenanceRunning ? 'animate-spin' : ''}`} />
                <span className="text-sm">Clear Cache</span>
              </Button>
              <Button
                variant="outline"
                className="h-auto p-4 flex flex-col items-center gap-2"
                onClick={() => handleMaintenanceAction('logs-clear')}
                disabled={isMaintenanceRunning}
              >
                <Trash2 className="h-5 w-5" />
                <span className="text-sm">Clear Logs</span>
              </Button>
              <Button
                variant="outline"
                className="h-auto p-4 flex flex-col items-center gap-2"
                onClick={() => handleMaintenanceAction('backup')}
                disabled={isMaintenanceRunning}
              >
                <Download className="h-5 w-5" />
                <span className="text-sm">Create Backup</span>
              </Button>
              <Button
                variant="outline"
                className="h-auto p-4 flex flex-col items-center gap-2"
                onClick={() => window.open(route('settings.maintenance.system-info'), '_blank')}
              >
                <Database className="h-5 w-5" />
                <span className="text-sm">System Info</span>
              </Button>
              <Button
                variant="outline"
                className="h-auto p-4 flex flex-col items-center gap-2"
                onClick={() => router.visit(route('crm.ai-conversations.export.index'))}
              >
                <Bot className="h-5 w-5 text-purple-600" />
                <span className="text-sm">AI Export</span>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Advanced Settings Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="system" className="flex items-center gap-2">
              <Server className="h-4 w-4" />
              System
            </TabsTrigger>
            <TabsTrigger value="security" className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Security
            </TabsTrigger>
            <TabsTrigger value="performance" className="flex items-center gap-2">
              <Zap className="h-4 w-4" />
              Performance
            </TabsTrigger>
            <TabsTrigger value="notifications" className="flex items-center gap-2">
              <Bell className="h-4 w-4" />
              Notifications
            </TabsTrigger>
            <TabsTrigger value="integrations" className="flex items-center gap-2">
              <Plug className="h-4 w-4" />
              Integrations
            </TabsTrigger>
          </TabsList>

          {/* System Settings Tab */}
          <TabsContent value="system">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Server className="h-5 w-5" />
                  System Configuration
                </CardTitle>
                <CardDescription>
                  Configure core system settings and behavior
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSystemSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="space-y-1">
                          <Label htmlFor="debug_mode">Debug Mode</Label>
                          <p className="text-sm text-gray-500">Enable detailed error reporting</p>
                        </div>
                        <Switch
                          id="debug_mode"
                          checked={systemForm.data.debug_mode}
                          onCheckedChange={(checked) => systemForm.setData('debug_mode', checked)}
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="space-y-1">
                          <Label htmlFor="maintenance_mode">Maintenance Mode</Label>
                          <p className="text-sm text-gray-500">Put the application in maintenance mode</p>
                        </div>
                        <Switch
                          id="maintenance_mode"
                          checked={systemForm.data.maintenance_mode}
                          onCheckedChange={(checked) => systemForm.setData('maintenance_mode', checked)}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="log_level">Log Level</Label>
                        <Select
                          value={systemForm.data.log_level}
                          onValueChange={(value) => systemForm.setData('log_level', value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select log level" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="emergency">Emergency</SelectItem>
                            <SelectItem value="alert">Alert</SelectItem>
                            <SelectItem value="critical">Critical</SelectItem>
                            <SelectItem value="error">Error</SelectItem>
                            <SelectItem value="warning">Warning</SelectItem>
                            <SelectItem value="notice">Notice</SelectItem>
                            <SelectItem value="info">Info</SelectItem>
                            <SelectItem value="debug">Debug</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="max_upload_size">Max Upload Size (MB)</Label>
                        <Input
                          id="max_upload_size"
                          type="number"
                          min="1"
                          max="1024"
                          value={systemForm.data.max_upload_size}
                          onChange={(e) => systemForm.setData('max_upload_size', parseInt(e.target.value))}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="max_execution_time">Max Execution Time (seconds)</Label>
                        <Input
                          id="max_execution_time"
                          type="number"
                          min="30"
                          max="300"
                          value={systemForm.data.max_execution_time}
                          onChange={(e) => systemForm.setData('max_execution_time', parseInt(e.target.value))}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="memory_limit">Memory Limit (MB)</Label>
                        <Input
                          id="memory_limit"
                          type="number"
                          min="128"
                          max="2048"
                          value={systemForm.data.memory_limit}
                          onChange={(e) => systemForm.setData('memory_limit', parseInt(e.target.value))}
                        />
                      </div>
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-4">
                    <h4 className="text-sm font-medium">Backup Configuration</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="flex items-center justify-between">
                        <div className="space-y-1">
                          <Label htmlFor="auto_backup_enabled">Auto Backup</Label>
                          <p className="text-sm text-gray-500">Enable automatic backups</p>
                        </div>
                        <Switch
                          id="auto_backup_enabled"
                          checked={systemForm.data.auto_backup_enabled}
                          onCheckedChange={(checked) => systemForm.setData('auto_backup_enabled', checked)}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="auto_backup_frequency">Backup Frequency</Label>
                        <Select
                          value={systemForm.data.auto_backup_frequency}
                          onValueChange={(value) => systemForm.setData('auto_backup_frequency', value)}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="daily">Daily</SelectItem>
                            <SelectItem value="weekly">Weekly</SelectItem>
                            <SelectItem value="monthly">Monthly</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="backup_retention_days">Retention (days)</Label>
                        <Input
                          id="backup_retention_days"
                          type="number"
                          min="1"
                          max="365"
                          value={systemForm.data.backup_retention_days}
                          onChange={(e) => systemForm.setData('backup_retention_days', parseInt(e.target.value))}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <Button
                      type="submit"
                      disabled={systemForm.processing}
                      className="flex items-center gap-2"
                    >
                      <Save className="h-4 w-4" />
                      {systemForm.processing ? 'Saving...' : 'Save System Settings'}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Security Settings Tab */}
          <TabsContent value="security">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Security Configuration
                </CardTitle>
                <CardDescription>
                  Configure security policies and access controls
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSecuritySubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <h4 className="text-sm font-medium">Transport &amp; authentication</h4>

                      <div className="flex items-center justify-between">
                        <div className="space-y-1">
                          <Label htmlFor="force_https">Force HTTPS</Label>
                          <p className="text-sm text-gray-500">Redirect all traffic to secure connections</p>
                        </div>
                        <Switch
                          id="force_https"
                          checked={securityForm.data.force_https}
                          onCheckedChange={(checked) => securityForm.setData('force_https', checked)}
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="space-y-1">
                          <Label htmlFor="csrf_protection">CSRF protection</Label>
                          <p className="text-sm text-gray-500">Validate tokens on state-changing requests</p>
                        </div>
                        <Switch
                          id="csrf_protection"
                          checked={securityForm.data.csrf_protection}
                          onCheckedChange={(checked) => securityForm.setData('csrf_protection', checked)}
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="space-y-1">
                          <Label htmlFor="two_factor_required">Require two-factor auth</Label>
                          <p className="text-sm text-gray-500">All users must enable 2FA</p>
                        </div>
                        <Switch
                          id="two_factor_required"
                          checked={securityForm.data.two_factor_required}
                          onCheckedChange={(checked) => securityForm.setData('two_factor_required', checked)}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="password_expiry_days">Password expiry (days)</Label>
                        <Input
                          id="password_expiry_days"
                          type="number"
                          min="30"
                          max="365"
                          placeholder="Leave empty for no expiry"
                          value={securityForm.data.password_expiry_days ?? ''}
                          onChange={(e) => securityForm.setData('password_expiry_days', e.target.value ? parseInt(e.target.value) : null)}
                        />
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h4 className="text-sm font-medium">Login protection</h4>

                      <div className="flex items-center justify-between">
                        <div className="space-y-1">
                          <Label htmlFor="failed_login_lockout">Failed login lockout</Label>
                          <p className="text-sm text-gray-500">Temporarily lock accounts after failed attempts</p>
                        </div>
                        <Switch
                          id="failed_login_lockout"
                          checked={securityForm.data.failed_login_lockout}
                          onCheckedChange={(checked) => securityForm.setData('failed_login_lockout', checked)}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="lockout_duration">Lockout duration (minutes)</Label>
                        <Input
                          id="lockout_duration"
                          type="number"
                          min="5"
                          max="1440"
                          value={securityForm.data.lockout_duration}
                          onChange={(e) => securityForm.setData('lockout_duration', parseInt(e.target.value))}
                        />
                      </div>
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-4">
                    <h4 className="text-sm font-medium">Rate limiting</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div className="space-y-1">
                            <Label htmlFor="rate_limiting_enabled">Web rate limiting</Label>
                            <p className="text-sm text-gray-500">Limit requests per IP on web routes</p>
                          </div>
                          <Switch
                            id="rate_limiting_enabled"
                            checked={securityForm.data.rate_limiting_enabled}
                            onCheckedChange={(checked) => securityForm.setData('rate_limiting_enabled', checked)}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="rate_limit_requests">Max requests</Label>
                          <Input
                            id="rate_limit_requests"
                            type="number"
                            min="10"
                            max="1000"
                            value={securityForm.data.rate_limit_requests}
                            onChange={(e) => securityForm.setData('rate_limit_requests', parseInt(e.target.value))}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="rate_limit_window">Time window (minutes)</Label>
                          <Input
                            id="rate_limit_window"
                            type="number"
                            min="1"
                            max="60"
                            value={securityForm.data.rate_limit_window}
                            onChange={(e) => securityForm.setData('rate_limit_window', parseInt(e.target.value))}
                          />
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div className="space-y-1">
                            <Label htmlFor="api_rate_limiting">API rate limiting</Label>
                            <p className="text-sm text-gray-500">Throttle API consumers</p>
                          </div>
                          <Switch
                            id="api_rate_limiting"
                            checked={securityForm.data.api_rate_limiting}
                            onCheckedChange={(checked) => securityForm.setData('api_rate_limiting', checked)}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="api_rate_limit">API limit (requests / hour)</Label>
                          <Input
                            id="api_rate_limit"
                            type="number"
                            min="100"
                            max="10000"
                            value={securityForm.data.api_rate_limit}
                            onChange={(e) => securityForm.setData('api_rate_limit', parseInt(e.target.value))}
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-4">
                    <h4 className="text-sm font-medium">IP access control</h4>
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <Label htmlFor="ip_whitelist_enabled">Enable IP whitelist</Label>
                        <p className="text-sm text-gray-500">Only allow admin access from listed addresses</p>
                      </div>
                      <Switch
                        id="ip_whitelist_enabled"
                        checked={securityForm.data.ip_whitelist_enabled}
                        onCheckedChange={(checked) => securityForm.setData('ip_whitelist_enabled', checked)}
                      />
                    </div>

                    {securityForm.data.ip_whitelist_enabled && (
                      <div className="space-y-2">
                        <Label htmlFor="ip_whitelist">Allowed IP addresses</Label>
                        <Textarea
                          id="ip_whitelist"
                          rows={4}
                          value={securityForm.data.ip_whitelist}
                          onChange={(e) => securityForm.setData('ip_whitelist', e.target.value)}
                          placeholder="One IP per line, e.g. 192.168.1.10"
                        />
                      </div>
                    )}
                  </div>

                  <div className="flex justify-end">
                    <Button
                      type="submit"
                      disabled={securityForm.processing}
                      className="flex items-center gap-2"
                    >
                      <Save className="h-4 w-4" />
                      {securityForm.processing ? 'Saving...' : 'Save Security Settings'}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Performance Settings Tab */}
          <TabsContent value="performance">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5" />
                  Performance Optimization
                </CardTitle>
                <CardDescription>
                  Configure caching, optimization, and performance settings
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handlePerformanceSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <h4 className="text-sm font-medium">Caching</h4>

                      <div className="flex items-center justify-between">
                        <div className="space-y-1">
                          <Label htmlFor="cache_enabled">Application cache</Label>
                          <p className="text-sm text-gray-500">Enable response and data caching</p>
                        </div>
                        <Switch
                          id="cache_enabled"
                          checked={performanceForm.data.cache_enabled}
                          onCheckedChange={(checked) => performanceForm.setData('cache_enabled', checked)}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="cache_driver">Cache driver</Label>
                        <Select
                          value={performanceForm.data.cache_driver}
                          onValueChange={(value) => performanceForm.setData('cache_driver', value)}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="file">File</SelectItem>
                            <SelectItem value="redis">Redis</SelectItem>
                            <SelectItem value="memcached">Memcached</SelectItem>
                            <SelectItem value="database">Database</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="cache_ttl">Default cache TTL (seconds)</Label>
                        <Input
                          id="cache_ttl"
                          type="number"
                          min="60"
                          max="86400"
                          value={performanceForm.data.cache_ttl}
                          onChange={(e) => performanceForm.setData('cache_ttl', parseInt(e.target.value))}
                        />
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h4 className="text-sm font-medium">Runtime drivers</h4>

                      <div className="space-y-2">
                        <Label htmlFor="session_driver">Session driver</Label>
                        <Select
                          value={performanceForm.data.session_driver}
                          onValueChange={(value) => performanceForm.setData('session_driver', value)}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="file">File</SelectItem>
                            <SelectItem value="cookie">Cookie</SelectItem>
                            <SelectItem value="database">Database</SelectItem>
                            <SelectItem value="redis">Redis</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="queue_driver">Queue driver</Label>
                        <Select
                          value={performanceForm.data.queue_driver}
                          onValueChange={(value) => performanceForm.setData('queue_driver', value)}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="sync">Sync (inline)</SelectItem>
                            <SelectItem value="database">Database</SelectItem>
                            <SelectItem value="redis">Redis</SelectItem>
                            <SelectItem value="sqs">Amazon SQS</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <h4 className="text-sm font-medium">Database monitoring</h4>

                      <div className="flex items-center justify-between">
                        <div className="space-y-1">
                          <Label htmlFor="database_query_logging">Query logging</Label>
                          <p className="text-sm text-gray-500">Log slow and expensive database queries</p>
                        </div>
                        <Switch
                          id="database_query_logging"
                          checked={performanceForm.data.database_query_logging}
                          onCheckedChange={(checked) => performanceForm.setData('database_query_logging', checked)}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="slow_query_threshold">Slow query threshold (ms)</Label>
                        <Input
                          id="slow_query_threshold"
                          type="number"
                          min="100"
                          max="10000"
                          value={performanceForm.data.slow_query_threshold}
                          onChange={(e) => performanceForm.setData('slow_query_threshold', parseInt(e.target.value))}
                        />
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h4 className="text-sm font-medium">Asset delivery</h4>

                      <div className="flex items-center justify-between">
                        <div className="space-y-1">
                          <Label htmlFor="compression_enabled">Gzip compression</Label>
                          <p className="text-sm text-gray-500">Compress HTTP responses</p>
                        </div>
                        <Switch
                          id="compression_enabled"
                          checked={performanceForm.data.compression_enabled}
                          onCheckedChange={(checked) => performanceForm.setData('compression_enabled', checked)}
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="space-y-1">
                          <Label htmlFor="minify_assets">Minify assets</Label>
                          <p className="text-sm text-gray-500">Minify CSS and JavaScript in production builds</p>
                        </div>
                        <Switch
                          id="minify_assets"
                          checked={performanceForm.data.minify_assets}
                          onCheckedChange={(checked) => performanceForm.setData('minify_assets', checked)}
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="space-y-1">
                          <Label htmlFor="cdn_enabled">CDN</Label>
                          <p className="text-sm text-gray-500">Serve static assets from a CDN</p>
                        </div>
                        <Switch
                          id="cdn_enabled"
                          checked={performanceForm.data.cdn_enabled}
                          onCheckedChange={(checked) => performanceForm.setData('cdn_enabled', checked)}
                        />
                      </div>

                      {performanceForm.data.cdn_enabled && (
                        <div className="space-y-2">
                          <Label htmlFor="cdn_url">CDN base URL</Label>
                          <Input
                            id="cdn_url"
                            type="url"
                            value={performanceForm.data.cdn_url}
                            onChange={(e) => performanceForm.setData('cdn_url', e.target.value)}
                            placeholder="https://cdn.example.com"
                          />
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <Button
                      type="submit"
                      disabled={performanceForm.processing}
                      className="flex items-center gap-2"
                    >
                      <Save className="h-4 w-4" />
                      {performanceForm.processing ? 'Saving...' : 'Save Performance Settings'}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Notification Settings Tab */}
          <TabsContent value="notifications">
            <div className="space-y-6">
              {/* Email Notifications */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Mail className="h-5 w-5" />
                    Email Notifications
                  </CardTitle>
                  <CardDescription>
                    Configure email notification settings and preferences
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleNotificationSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <Label htmlFor="email_notifications" className="text-sm font-medium">
                            Email Notifications
                          </Label>
                          <Switch
                            id="email_notifications"
                            checked={notificationForm.data.email_notifications}
                            onCheckedChange={(checked) => notificationForm.setData('email_notifications', checked)}
                          />
                        </div>

                        <div className="flex items-center justify-between">
                          <Label htmlFor="admin_alerts" className="text-sm font-medium">
                            Admin Alerts
                          </Label>
                          <Switch
                            id="admin_alerts"
                            checked={notificationForm.data.admin_alerts}
                            onCheckedChange={(checked) => notificationForm.setData('admin_alerts', checked)}
                          />
                        </div>

                        <div className="flex items-center justify-between">
                          <Label htmlFor="system_alerts" className="text-sm font-medium">
                            System Alerts
                          </Label>
                          <Switch
                            id="system_alerts"
                            checked={notificationForm.data.system_alerts}
                            onCheckedChange={(checked) => notificationForm.setData('system_alerts', checked)}
                          />
                        </div>

                        <div className="flex items-center justify-between">
                          <Label htmlFor="security_alerts" className="text-sm font-medium">
                            Security Alerts
                          </Label>
                          <Switch
                            id="security_alerts"
                            checked={notificationForm.data.security_alerts}
                            onCheckedChange={(checked) => notificationForm.setData('security_alerts', checked)}
                          />
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <Label htmlFor="backup_alerts" className="text-sm font-medium">
                            Backup Alerts
                          </Label>
                          <Switch
                            id="backup_alerts"
                            checked={notificationForm.data.backup_alerts}
                            onCheckedChange={(checked) => notificationForm.setData('backup_alerts', checked)}
                          />
                        </div>

                        <div className="flex items-center justify-between">
                          <Label htmlFor="error_alerts" className="text-sm font-medium">
                            Error Alerts
                          </Label>
                          <Switch
                            id="error_alerts"
                            checked={notificationForm.data.error_alerts}
                            onCheckedChange={(checked) => notificationForm.setData('error_alerts', checked)}
                          />
                        </div>

                        <div className="flex items-center justify-between">
                          <Label htmlFor="performance_alerts" className="text-sm font-medium">
                            Performance Alerts
                          </Label>
                          <Switch
                            id="performance_alerts"
                            checked={notificationForm.data.performance_alerts}
                            onCheckedChange={(checked) => notificationForm.setData('performance_alerts', checked)}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="notification_frequency" className="text-sm font-medium">
                            Notification Frequency
                          </Label>
                          <Select
                            value={notificationForm.data.notification_frequency}
                            onValueChange={(value) => notificationForm.setData('notification_frequency', value)}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select frequency" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="immediate">Immediate</SelectItem>
                              <SelectItem value="hourly">Hourly</SelectItem>
                              <SelectItem value="daily">Daily</SelectItem>
                              <SelectItem value="weekly">Weekly</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>

                    <Separator />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="email_from_name" className="text-sm font-medium">
                          From Name
                        </Label>
                        <Input
                          id="email_from_name"
                          value={notificationForm.data.email_from_name}
                          onChange={(e) => notificationForm.setData('email_from_name', e.target.value)}
                          placeholder="TekRem ERP"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="email_from_address" className="text-sm font-medium">
                          From Email Address
                        </Label>
                        <Input
                          id="email_from_address"
                          type="email"
                          value={notificationForm.data.email_from_address}
                          onChange={(e) => notificationForm.setData('email_from_address', e.target.value)}
                          placeholder="noreply@tekrem.com"
                        />
                      </div>
                    </div>

                    <div className="flex justify-end">
                      <Button type="submit" disabled={notificationForm.processing}>
                        {notificationForm.processing ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Saving...
                          </>
                        ) : (
                          'Save Email Settings'
                        )}
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>

              {/* Push & SMS Notifications */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Smartphone className="h-5 w-5" />
                    Push & SMS Notifications
                  </CardTitle>
                  <CardDescription>
                    Configure push notifications and SMS alert settings
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <Label className="text-sm font-medium">Push Notifications</Label>
                          <p className="text-xs text-muted-foreground">Browser push notifications for real-time alerts</p>
                        </div>
                        <Switch
                          checked={notificationForm.data.push_notifications}
                          onCheckedChange={(checked) => notificationForm.setData('push_notifications', checked)}
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <Label className="text-sm font-medium">SMS Notifications</Label>
                          <p className="text-xs text-muted-foreground">SMS alerts for critical system events</p>
                        </div>
                        <Switch
                          checked={notificationForm.data.sms_notifications}
                          onCheckedChange={(checked) => notificationForm.setData('sms_notifications', checked)}
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Webhook Notifications */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Webhook className="h-5 w-5" />
                    Webhook & Integration Notifications
                  </CardTitle>
                  <CardDescription>
                    Configure webhook endpoints and third-party notification integrations
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <Label className="text-sm font-medium">Webhook Notifications</Label>
                          <p className="text-xs text-muted-foreground">Send notifications to external webhooks</p>
                        </div>
                        <Switch
                          checked={notificationForm.data.webhook_notifications}
                          onCheckedChange={(checked) => notificationForm.setData('webhook_notifications', checked)}
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <Label className="text-sm font-medium">Slack Notifications</Label>
                          <p className="text-xs text-muted-foreground">Send alerts to Slack channels</p>
                        </div>
                        <Switch
                          checked={notificationForm.data.slack_notifications}
                          onCheckedChange={(checked) => notificationForm.setData('slack_notifications', checked)}
                        />
                      </div>
                    </div>

                    {notificationForm.data.webhook_notifications && (
                      <div className="space-y-2">
                        <Label htmlFor="webhook_url" className="text-sm font-medium">
                          Webhook URL
                        </Label>
                        <Input
                          id="webhook_url"
                          type="url"
                          value={notificationForm.data.webhook_url}
                          onChange={(e) => notificationForm.setData('webhook_url', e.target.value)}
                          placeholder="https://your-webhook-endpoint.com/notifications"
                        />
                      </div>
                    )}

                    {notificationForm.data.slack_notifications && (
                      <div className="space-y-2">
                        <Label htmlFor="slack_webhook_url" className="text-sm font-medium">
                          Slack Webhook URL
                        </Label>
                        <Input
                          id="slack_webhook_url"
                          type="url"
                          value={notificationForm.data.slack_webhook_url}
                          onChange={(e) => notificationForm.setData('slack_webhook_url', e.target.value)}
                          placeholder="https://hooks.slack.com/services/..."
                        />
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Integration Settings Tab */}
          <TabsContent value="integrations">
            <div className="space-y-6">
              {/* AI Service Integrations */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Bot className="h-5 w-5" />
                    AI Service Integrations
                  </CardTitle>
                  <CardDescription>
                    Configure AI services for enhanced automation and intelligent features
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {Object.entries(integrationSettings.ai_services || {}).map(([service, config]) => (
                      <div key={service} className="border rounded-lg p-6">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-3">
                            <Bot className="h-5 w-5 text-purple-600" />
                            <div>
                              <h4 className="font-medium capitalize flex items-center gap-2">
                                {service}
                                {service === defaultAiService && (
                                  <Badge variant="default" className="bg-blue-100 text-blue-800 border-blue-200">
                                    Default
                                  </Badge>
                                )}
                              </h4>
                              <p className="text-sm text-gray-500">
                                {service === 'mistral' && 'Mistral AI - Advanced language model for intelligent responses'}
                                {service === 'openai' && 'OpenAI GPT - Powerful AI for natural language processing'}
                                {service === 'anthropic' && 'Anthropic Claude - Safe and helpful AI assistant'}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {getConnectionStatusBadge(service)}
                            <Switch
                              checked={aiServiceForms[service as keyof typeof aiServiceForms]?.data?.enabled || false}
                              onCheckedChange={(checked) =>
                                aiServiceForms[service as keyof typeof aiServiceForms]?.setData('enabled', checked)
                              }
                            />
                          </div>
                        </div>

                        {aiServiceForms[service as keyof typeof aiServiceForms]?.data?.enabled && (
                          <div className="space-y-4 border-t pt-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <Label htmlFor={`${service}_api_key`}>API Key</Label>
                                <div className="relative">
                                  <Input
                                    id={`${service}_api_key`}
                                    type={showApiKeys[`${service}_api_key`] ? 'text' : 'password'}
                                    value={aiServiceForms[service as keyof typeof aiServiceForms]?.data?.api_key || ''}
                                    onChange={(e) =>
                                      aiServiceForms[service as keyof typeof aiServiceForms]?.setData('api_key', e.target.value)
                                    }
                                    placeholder={`Enter ${service.charAt(0).toUpperCase() + service.slice(1)} API Key`}
                                  />
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    className="absolute right-2 top-1/2 -translate-y-1/2 h-6 w-6 p-0"
                                    onClick={() => toggleApiKeyVisibility(`${service}_api_key`)}
                                  >
                                    {showApiKeys[`${service}_api_key`] ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                  </Button>
                                </div>
                              </div>

                              <div className="space-y-2">
                                <Label htmlFor={`${service}_model`}>Model</Label>
                                <Select
                                  value={aiServiceForms[service as keyof typeof aiServiceForms]?.data?.model || ''}
                                  onValueChange={(value) =>
                                    aiServiceForms[service as keyof typeof aiServiceForms]?.setData('model', value)
                                  }
                                >
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select model" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {service === 'mistral' && (
                                      <>
                                        <SelectItem value="mistral-large-latest">Mistral Large (Latest)</SelectItem>
                                        <SelectItem value="mistral-medium-latest">Mistral Medium (Latest)</SelectItem>
                                        <SelectItem value="mistral-small-latest">Mistral Small (Latest)</SelectItem>
                                      </>
                                    )}
                                    {service === 'openai' && (
                                      <>
                                        <SelectItem value="gpt-4o">GPT-4o</SelectItem>
                                        <SelectItem value="gpt-4o-mini">GPT-4o Mini</SelectItem>
                                        <SelectItem value="gpt-4-turbo">GPT-4 Turbo</SelectItem>
                                        <SelectItem value="gpt-3.5-turbo">GPT-3.5 Turbo</SelectItem>
                                      </>
                                    )}
                                    {service === 'anthropic' && (
                                      <>
                                        <SelectItem value="claude-3-5-sonnet-20241022">Claude 3.5 Sonnet</SelectItem>
                                        <SelectItem value="claude-3-5-haiku-20241022">Claude 3.5 Haiku</SelectItem>
                                        <SelectItem value="claude-3-opus-20240229">Claude 3 Opus</SelectItem>
                                        <SelectItem value="claude-3-haiku-20240307">Claude 3 Haiku</SelectItem>
                                      </>
                                    )}
                                  </SelectContent>
                                </Select>
                              </div>

                              <div className="space-y-2">
                                <Label htmlFor={`${service}_max_tokens`}>Max Tokens</Label>
                                <Input
                                  id={`${service}_max_tokens`}
                                  type="number"
                                  min="1"
                                  max="8192"
                                  value={aiServiceForms[service as keyof typeof aiServiceForms]?.data?.max_tokens || 4096}
                                  onChange={(e) =>
                                    aiServiceForms[service as keyof typeof aiServiceForms]?.setData('max_tokens', parseInt(e.target.value))
                                  }
                                />
                              </div>

                              <div className="space-y-2">
                                <Label htmlFor={`${service}_temperature`}>Temperature</Label>
                                <Input
                                  id={`${service}_temperature`}
                                  type="number"
                                  min="0"
                                  max="2"
                                  step="0.1"
                                  value={aiServiceForms[service as keyof typeof aiServiceForms]?.data?.temperature || 0.7}
                                  onChange={(e) =>
                                    aiServiceForms[service as keyof typeof aiServiceForms]?.setData('temperature', parseFloat(e.target.value))
                                  }
                                />
                              </div>

                              {service === 'openai' && (
                                <div className="space-y-2 md:col-span-2">
                                  <Label htmlFor={`${service}_organization`}>Organization ID (Optional)</Label>
                                  <Input
                                    id={`${service}_organization`}
                                    value={aiServiceForms.openai?.data?.organization || ''}
                                    onChange={(e) => aiServiceForms.openai?.setData('organization', e.target.value)}
                                    placeholder="Enter OpenAI Organization ID"
                                  />
                                </div>
                              )}
                            </div>

                            <div className="flex justify-between items-center pt-4 border-t">
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => testConnection(service)}
                                disabled={testingConnection[`ai-${service}`]}
                                className="flex items-center gap-2"
                              >
                                {testingConnection[`ai-${service}`] ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                  <TestTube className="h-4 w-4" />
                                )}
                                Test Connection
                              </Button>
                              <Button
                                type="button"
                                onClick={() => handleAIServiceSubmit(service)}
                                className="flex items-center gap-2"
                              >
                                <Save className="h-4 w-4" />
                                Save {service.charAt(0).toUpperCase() + service.slice(1)} Settings
                              </Button>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* reCAPTCHA Integration */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5" />
                    reCAPTCHA Integration
                  </CardTitle>
                  <CardDescription>
                    Configure Google reCAPTCHA to protect forms from spam and abuse
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">reCAPTCHA Protection</h4>
                        <p className="text-sm text-muted-foreground">
                          Enable reCAPTCHA verification for enhanced security
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-green-600 border-green-600">
                          Available
                        </Badge>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => window.open(route('settings.recaptcha.index'), '_blank')}
                        >
                          Configure reCAPTCHA
                        </Button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <span>Login Protection</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <span>Registration Protection</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <span>Password Reset Protection</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <span>Contact Form Protection</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <span>Guest Chat Protection</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <span>v2 & v3 Support</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}
