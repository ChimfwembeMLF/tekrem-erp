import { useState } from "react";
import React from 'react'


export default function AddContactForm() {
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
      const res = await fetch('/whatsapp/contacts', {
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