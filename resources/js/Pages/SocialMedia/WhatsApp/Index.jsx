import React, { useState } from 'react';
import AppLayout from '@/Layouts/AppLayout';
import { Card, CardHeader, CardTitle, CardContent } from '@/Components/ui/card';

import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/Components/ui/tabs';
import WhatsAppChat from './Chat';


const WhatsAppDashboard = ({ accounts = [], messages = [], stats = {} }) => {
  const [messageText, setMessageText] = useState('');
  const [recipient, setRecipient] = useState('');
  const [accountId, setAccountId] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSendMessage = (e) => {
    e.preventDefault();
    setSubmitting(true);
    Inertia.post(route('social-media.whatsapp.messages.send'), {
      content: messageText,
      to: recipient,
      whatsapp_account_id: accountId,
    }, {
      onFinish: () => {
        setSubmitting(false);
        setMessageText('');
        setRecipient('');
      }
    });
  };

  return (
    <AppLayout title="WhatsApp Dashboard">
      <div className="space-y-6">
        <h1 className="text-3xl font-bold tracking-tight">WhatsApp</h1>
        <Tabs defaultValue="dashboard" className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="send-message">Send Message</TabsTrigger>
            <TabsTrigger value="chat">Chat</TabsTrigger>
            <TabsTrigger value="add-contact">Add Contact</TabsTrigger>
          </TabsList>
          <TabsContent value="add-contact">
            <Card>
              <CardHeader>
                <CardTitle>Add WhatsApp Contact</CardTitle>
              </CardHeader>
              <CardContent>
                <AddContactForm />
              </CardContent>
            </Card>
          </TabsContent>


          <TabsContent value="dashboard">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader>
                  <CardTitle>Total Messages</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.total_messages ?? 0}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Total Accounts</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.total_accounts ?? 0}</div>
                </CardContent>
              </Card>
            </div>
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Recent Messages</CardTitle>
              </CardHeader>
              <CardContent>
                {messages.length === 0 ? (
                  <p className="text-muted-foreground">No messages found.</p>
                ) : (
                  <ul>
                    {messages.map((msg) => (
                      <li key={msg.id} className="flex items-center justify-between py-2 border-b last:border-b-0">
                        <span>{msg.content}</span>
                        <span className={msg.delivered ? 'ml-4 text-green-600' : 'ml-4 text-red-600'}>
                          {msg.delivered ? 'Delivered' : 'Failed'}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="chat">
            <WhatsAppChat userId={null} />
          </TabsContent>
          <TabsContent value="send-message">
            <Card>
              <CardHeader>
                <CardTitle>Send a WhatsApp Message</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSendMessage} className="space-y-4">
                  <input
                    className="w-full border rounded p-2"
                    type="text"
                    value={recipient}
                    onChange={e => setRecipient(e.target.value)}
                    placeholder="Recipient phone number"
                    required
                  />
                  <textarea
                    className="w-full border rounded p-2"
                    rows={3}
                    value={messageText}
                    onChange={e => setMessageText(e.target.value)}
                    placeholder="Type your message..."
                    required
                  />
                  {/* Add account selection if multiple accounts supported */}
                  <button
                    type="submit"
                    className="px-4 py-2 bg-green-600 text-white rounded"
                    disabled={submitting}
                  >
                    {submitting ? 'Sending...' : 'Send Message'}
                  </button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
};


export default WhatsAppDashboard;

// AddContactForm component (must be outside WhatsAppDashboard)
function AddContactForm() {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    setSuccess(false);
    try {
      // TODO: Replace with your actual API endpoint
      const res = await fetch('/api/whatsapp/contacts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, phone })
      });
      if (!res.ok) throw new Error('Failed to add contact');
      setSuccess(true);
      setName('');
      setPhone('');
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <input
        className="w-full border rounded p-2"
        type="text"
        value={name}
        onChange={e => setName(e.target.value)}
        placeholder="Contact name"
        required
      />
      <input
        className="w-full border rounded p-2"
        type="text"
        value={phone}
        onChange={e => setPhone(e.target.value)}
        placeholder="Phone number"
        required
      />
      <button
        type="submit"
        className="px-4 py-2 bg-green-600 text-white rounded"
        disabled={submitting}
      >
        {submitting ? 'Adding...' : 'Add Contact'}
      </button>
      {success && <div className="text-green-600">Contact added!</div>}
      {error && <div className="text-red-600">{error}</div>}
    </form>
  );
}
