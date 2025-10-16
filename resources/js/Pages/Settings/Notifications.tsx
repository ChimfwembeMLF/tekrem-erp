import React, { useState, ChangeEvent } from 'react';
import { Head, useForm } from '@inertiajs/react';
import { route } from 'ziggy-js';
import AppLayout from '@/Layouts/AppLayout';
import { Button } from '@/Components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/Components/ui/card';
// import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import { Switch } from '@/Components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/Components/ui/select';
import { Separator } from '@/Components/ui/separator';
import { Badge } from '@/Components/ui/badge';
import { Bell, Settings, Mail, Smartphone, MessageSquare, Clock, CheckCircle, AlertTriangle } from 'lucide-react';
import { Input } from '@/Components/ui/input';

interface NotificationSettings {
  email_notifications: boolean;
  sms_notifications: boolean;
  push_notifications: boolean;
  notification_frequency: string;
  email_from_name: string;
  email_from_address: string;
  smtp_host: string;
  smtp_port: number;
  smtp_username: string;
  smtp_password: string;
  smtp_encryption: string;
}

interface Props {
  settings: NotificationSettings;
}

export default function Notifications({ settings }: Props) {
  const [showAdvanced, setShowAdvanced] = useState(false);

  const { data, setData, post, processing, errors } = useForm({
    email_notifications: settings.email_notifications || false,
    sms_notifications: settings.sms_notifications || false,
    push_notifications: settings.push_notifications || false,
    notification_frequency: settings.notification_frequency || 'immediate',
    email_from_name: settings.email_from_name || '',
    email_from_address: settings.email_from_address || '',
    smtp_host: settings.smtp_host || '',
    smtp_port: settings.smtp_port || 587,
    smtp_username: settings.smtp_username || '',
    smtp_password: settings.smtp_password || '',
    smtp_encryption: settings.smtp_encryption || 'tls',
  });

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    post(route('settings.notifications.update'));
  };

  const testEmailConnection = () => {
    // Add test connection logic here
    console.log('Testing email connection...');
  };

  return (
    <AppLayout title="Notification Settings">
      <Head title="Notification Settings" />

      <div className="py-12">
        <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
          <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-xl sm:rounded-lg">
            <div className="p-6 lg:p-8">
              <div className="flex items-center mb-6">
                <Settings className="w-8 h-8 text-gray-600 dark:text-gray-400 mr-3" />
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                    Notification Settings
                  </h1>
                  <p className="text-gray-600 dark:text-gray-400">
                    Manage your notification preferences and email configuration
                  </p>
                </div>
              </div>

              {/* Stats Overview */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Email Notifications</p>
                        <p className="text-lg font-bold">
                          {data.email_notifications ? 'Enabled' : 'Disabled'}
                        </p>
                      </div>
                      <div className="flex items-center">
                        {data.email_notifications ? (
                          <CheckCircle className="w-3 h-3 mr-1" />
                        ) : (
                          <AlertTriangle className="w-3 h-3 mr-1" />
                        )}
                        <Badge variant={data.email_notifications ? 'default' : 'secondary'}>
                          {data.email_notifications ? 'Active' : 'Inactive'}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">SMS Notifications</p>
                        <p className="text-lg font-bold">
                          {data.sms_notifications ? 'Enabled' : 'Disabled'}
                        </p>
                      </div>
                      <div className="flex items-center">
                        {data.sms_notifications ? (
                          <CheckCircle className="w-3 h-3 mr-1" />
                        ) : (
                          <AlertTriangle className="w-3 h-3 mr-1" />
                        )}
                        <Badge variant={data.sms_notifications ? 'default' : 'secondary'}>
                          {data.sms_notifications ? 'Active' : 'Inactive'}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Push Notifications</p>
                        <p className="text-lg font-bold">
                          {data.push_notifications ? 'Enabled' : 'Disabled'}
                        </p>
                      </div>
                      <div className="flex items-center">
                        {data.push_notifications ? (
                          <CheckCircle className="w-3 h-3 mr-1" />
                        ) : (
                          <AlertTriangle className="w-3 h-3 mr-1" />
                        )}
                        <Badge variant={data.push_notifications ? 'default' : 'secondary'}>
                          {data.push_notifications ? 'Active' : 'Inactive'}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <form onSubmit={submit} className="space-y-6">
                {/* Notification Channels */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Bell className="w-5 h-5 mr-2" />
                      Notification Channels
                    </CardTitle>
                    <CardDescription>
                      Enable or disable different notification methods
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    
                    {/* Email Notifications */}
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <Label className="flex items-center">
                          <Mail className="w-4 h-4 mr-2" />
                          Email Notifications
                        </Label>
                        <p className="text-sm text-muted-foreground">
                          Send notifications via email to users
                        </p>
                      </div>
                      <Switch
                        checked={data.email_notifications}
                        onCheckedChange={(checked) => setData('email_notifications', checked)}
                      />
                    </div>

                    <Separator />

                    {/* SMS Notifications */}
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <Label className="flex items-center">
                          <Smartphone className="w-4 h-4 mr-2" />
                          SMS Notifications
                        </Label>
                        <p className="text-sm text-muted-foreground">
                          Send notifications via SMS messages
                        </p>
                      </div>
                      <Switch
                        checked={data.sms_notifications}
                        onCheckedChange={(checked) => setData('sms_notifications', checked)}
                      />
                    </div>

                    <Separator />

                    {/* Push Notifications */}
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <Label className="flex items-center">
                          <MessageSquare className="w-4 h-4 mr-2" />
                          Push Notifications
                        </Label>
                        <p className="text-sm text-muted-foreground">
                          Send browser push notifications
                        </p>
                      </div>
                      <Switch
                        checked={data.push_notifications}
                        onCheckedChange={(checked) => setData('push_notifications', checked)}
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* General Settings */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Clock className="w-5 h-5 mr-2" />
                      General Settings
                    </CardTitle>
                    <CardDescription>
                      Configure general notification behavior
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <Label htmlFor="notification_frequency">Notification Frequency</Label>
                      <Select
                        value={data.notification_frequency}
                        onValueChange={(value: string) => setData('notification_frequency', value)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="immediate">Immediate</SelectItem>
                          <SelectItem value="hourly">Hourly</SelectItem>
                          <SelectItem value="daily">Daily</SelectItem>
                          <SelectItem value="weekly">Weekly</SelectItem>
                        </SelectContent>
                      </Select>
                      {errors.notification_frequency && (
                        <p className="text-sm text-destructive">{errors.notification_frequency}</p>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Email Configuration */}
                {data.email_notifications && (
                  <Card>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle className="flex items-center">
                            <Mail className="w-5 h-5 mr-2" />
                            Email Configuration
                          </CardTitle>
                          <CardDescription>
                            Configure email sending settings
                          </CardDescription>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => setShowAdvanced(!showAdvanced)}
                        >
                          {showAdvanced ? 'Hide Advanced' : 'Show Advanced'}
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <Label htmlFor="email_from_name">From Name</Label>
                          <Input
                            id="email_from_name"
                            type="text"
                            value={data.email_from_name}
                            onChange={(e: ChangeEvent<HTMLInputElement>) => setData('email_from_name', e.target.value)}
                            placeholder="Enter sender name"
                          />
                          {errors.email_from_name && (
                            <p className="text-sm text-destructive">{errors.email_from_name}</p>
                          )}
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="email_from_address">From Email</Label>
                          <Input
                            id="email_from_address"
                            type="email"
                            value={data.email_from_address}
                            onChange={(e: ChangeEvent<HTMLInputElement>) => setData('email_from_address', e.target.value)}
                            placeholder="Enter sender email"
                          />
                          {errors.email_from_address && (
                            <p className="text-sm text-destructive">{errors.email_from_address}</p>
                          )}
                        </div>
                      </div>

                      {showAdvanced && (
                        <div className="mt-6 pt-6 border-t">
                          <div className="flex items-center space-x-2 mb-4">
                            <Badge variant="secondary" className="text-yellow-600">
                              Advanced
                            </Badge>
                            <span className="text-sm text-muted-foreground">
                              Modify only if you know what you're doing
                            </span>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                              <Label htmlFor="smtp_host">SMTP Host</Label>
                              <Input
                                id="smtp_host"
                                type="text"
                                value={data.smtp_host}
                                onChange={(e: ChangeEvent<HTMLInputElement>) => setData('smtp_host', e.target.value)}
                                placeholder="smtp.example.com"
                              />
                              {errors.smtp_host && (
                                <p className="text-sm text-destructive">{errors.smtp_host}</p>
                              )}
                            </div>

                            <div className="space-y-2">
                              <Label htmlFor="smtp_port">SMTP Port</Label>
                              <Input
                                id="smtp_port"
                                type="number"
                                value={data.smtp_port.toString()}
                                onChange={(e: ChangeEvent<HTMLInputElement>) => setData('smtp_port', parseInt(e.target.value) || 587)}
                                placeholder="587"
                              />
                              {errors.smtp_port && (
                                <p className="text-sm text-destructive">{errors.smtp_port}</p>
                              )}
                            </div>

                            <div className="space-y-2">
                              <Label htmlFor="smtp_username">SMTP Username</Label>
                              <Input
                                id="smtp_username"
                                type="text"
                                value={data.smtp_username}
                                onChange={(e: ChangeEvent<HTMLInputElement>) => setData('smtp_username', e.target.value)}
                                placeholder="Enter username"
                              />
                              {errors.smtp_username && (
                                <p className="text-sm text-destructive">{errors.smtp_username}</p>
                              )}
                            </div>

                            <div className="space-y-2">
                              <Label htmlFor="smtp_password">SMTP Password</Label>
                              <Input
                                id="smtp_password"
                                type="password"
                                value={data.smtp_password}
                                onChange={(e: ChangeEvent<HTMLInputElement>) => setData('smtp_password', e.target.value)}
                                placeholder="Enter password"
                              />
                              {errors.smtp_password && (
                                <p className="text-sm text-destructive">{errors.smtp_password}</p>
                              )}
                            </div>

                            <div className="space-y-2">
                              <Label htmlFor="smtp_encryption">Encryption</Label>
                              <Select
                                value={data.smtp_encryption}
                                onValueChange={(value: string) => setData('smtp_encryption', value)}
                              >
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="tls">TLS</SelectItem>
                                  <SelectItem value="ssl">SSL</SelectItem>
                                  <SelectItem value="none">None</SelectItem>
                                </SelectContent>
                              </Select>
                              {errors.smtp_encryption && (
                                <p className="text-sm text-destructive">{errors.smtp_encryption}</p>
                              )}
                            </div>
                          </div>

                          <div className="mt-4">
                            <Button
                              type="button"
                              variant="outline"
                              onClick={testEmailConnection}
                            >
                              Test Connection
                            </Button>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}

                {/* Submit Button */}
                <div className="flex justify-end pt-6">
                  <Button type="submit" disabled={processing}>
                    {processing ? 'Saving...' : 'Save Settings'}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}