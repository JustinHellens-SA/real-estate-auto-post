'use client';

import { useEffect, useState } from 'react';
import { UserPlus, Edit2, Trash2, Phone, Mail, ArrowLeft, Facebook, Instagram, CheckCircle2, XCircle } from 'lucide-react';
import Link from 'next/link';

interface Agent {
  id: string;
  name: string;
  phone: string;
  email?: string;
  headshotUrl?: string;
  active: boolean;
  facebookToken?: string;
  facebookPageId?: string;
  instagramUserId?: string;
  tokenExpires?: string;
  defaultPostingMode?: string;
}

export default function AgentsPage() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingAgent, setEditingAgent] = useState<Agent | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    headshotUrl: '',
  });

  useEffect(() => {
    fetchAgents();
    
    // Check for OAuth success/error
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('success') === 'connected') {
      alert('Successfully connected to Facebook!');
      window.history.replaceState({}, '', '/agents');
    }
    if (urlParams.get('error') === 'oauth_failed') {
      alert('Failed to connect to Facebook. Please try again.');
      window.history.replaceState({}, '', '/agents');
    }
  }, []);

  const fetchAgents = async () => {
    try {
      const response = await fetch('/api/agents');
      const data = await response.json();
      setAgents(data);
    } catch (error) {
      console.error('Error fetching agents:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const url = editingAgent ? `/api/agents/${editingAgent.id}` : '/api/agents';
      const method = editingAgent ? 'PATCH' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        await fetchAgents();
        setShowForm(false);
        setEditingAgent(null);
        setFormData({ name: '', phone: '', email: '', headshotUrl: '' });
      }
    } catch (error) {
      console.error('Error saving agent:', error);
      alert('Failed to save agent');
    }
  };

  const handleEdit = (agent: Agent) => {
    setEditingAgent(agent);
    setFormData({
      name: agent.name,
      phone: agent.phone,
      email: agent.email || '',
      headshotUrl: agent.headshotUrl || '',
    });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to remove this agent?')) return;

    try {
      await fetch(`/api/agents/${id}`, { method: 'DELETE' });
      await fetchAgents();
    } catch (error) {
      console.error('Error deleting agent:', error);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // In production, upload to your server/storage
    // For now, use base64 data URL
    const reader = new FileReader();
    reader.onloadend = () => {
      setFormData({ ...formData, headshotUrl: reader.result as string });
    };
    reader.readAsDataURL(file);
  };

  const handleConnectFacebook = (agentId: string) => {
    // Redirect to OAuth initiate endpoint
    window.location.href = `/api/auth/facebook/initiate?agentId=${agentId}`;
  };

  const handleDisconnectFacebook = async (agentId: string) => {
    if (!confirm('Disconnect Facebook? You\'ll need to reconnect to post to your personal account.')) return;

    try {
      await fetch('/api/auth/facebook/disconnect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ agentId }),
      });
      await fetchAgents();
      alert('Facebook disconnected successfully');
    } catch (error) {
      console.error('Error disconnecting:', error);
      alert('Failed to disconnect Facebook');
    }
  };

  const isTokenExpired = (expiryDate?: string) => {
    if (!expiryDate) return true;
    return new Date(expiryDate) < new Date();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <Link
              href="/"
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white mb-4"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Home
            </Link>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Manage Agents
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Add and manage your real estate agents
            </p>
          </div>
          <button
            onClick={() => {
              setShowForm(!showForm);
              setEditingAgent(null);
              setFormData({ name: '', phone: '', email: '', headshotUrl: '' });
            }}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-6 rounded-lg transition flex items-center gap-2"
          >
            <UserPlus className="w-5 h-5" />
            Add Agent
          </button>
        </div>

        {/* Add/Edit Form */}
        {showForm && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-8">
            <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
              {editingAgent ? 'Edit Agent' : 'Add New Agent'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Name *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                    placeholder="Rory Anderson"
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Phone *
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    required
                    placeholder="073 697 4159"
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="rory@localrealestate.co.za"
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Headshot Photo
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                  />
                </div>
              </div>
              {formData.headshotUrl && (
                <div className="flex items-center gap-4">
                  <img
                    src={formData.headshotUrl}
                    alt="Preview"
                    className="w-20 h-20 rounded-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, headshotUrl: '' })}
                    className="text-red-600 hover:text-red-700 text-sm"
                  >
                    Remove photo
                  </button>
                </div>
              )}
              <div className="flex gap-2">
                <button
                  type="submit"
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-6 rounded-lg transition"
                >
                  {editingAgent ? 'Update Agent' : 'Add Agent'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setEditingAgent(null);
                    setFormData({ name: '', phone: '', email: '', headshotUrl: '' });
                  }}
                  className="bg-gray-300 hover:bg-gray-400 dark:bg-gray-600 dark:hover:bg-gray-700 text-gray-800 dark:text-white font-semibold py-2 px-6 rounded-lg transition"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Agents Grid */}
        {agents.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-12 text-center">
            <p className="text-gray-500 dark:text-gray-400 text-lg">
              No agents added yet. Click "Add Agent" to get started.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {agents.map((agent) => (
              <div
                key={agent.id}
                className="bg-white dark:bg-gray-800 rounded-lg shadow hover:shadow-lg transition p-6"
              >
                <div className="flex items-start gap-4">
                  {agent.headshotUrl ? (
                    <img
                      src={agent.headshotUrl}
                      alt={agent.name}
                      className="w-16 h-16 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center">
                      <span className="text-2xl font-bold text-indigo-600 dark:text-indigo-300">
                        {agent.name.charAt(0)}
                      </span>
                    </div>
                  )}
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                      {agent.name}
                    </h3>
                    <div className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
                      <div className="flex items-center gap-2">
                        <Phone className="w-4 h-4" />
                        {agent.phone}
                      </div>
                      {agent.email && (
                        <div className="flex items-center gap-2">
                          <Mail className="w-4 h-4" />
                          {agent.email}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                
                {/* Social Media Connection Status */}
                <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                  {agent.facebookToken && !isTokenExpired(agent.tokenExpires) ? (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400">
                        <CheckCircle2 className="w-4 h-4" />
                        <span className="font-medium">Connected to Personal Account</span>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-gray-600 dark:text-gray-400">
                        {agent.facebookPageId && (
                          <div className="flex items-center gap-1">
                            <Facebook className="w-3 h-3" />
                            Facebook
                          </div>
                        )}
                        {agent.instagramUserId && (
                          <div className="flex items-center gap-1">
                            <Instagram className="w-3 h-3" />
                            Instagram
                          </div>
                        )}
                      </div>
                      <button
                        onClick={() => handleDisconnectFacebook(agent.id)}
                        className="text-xs text-red-600 hover:text-red-700 dark:text-red-400"
                      >
                        Disconnect
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => handleConnectFacebook(agent.id)}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg transition flex items-center justify-center gap-2 text-sm"
                    >
                      <Facebook className="w-4 h-4" />
                      Connect Facebook Account
                    </button>
                  )}
                  {agent.facebookToken && isTokenExpired(agent.tokenExpires) && (
                    <div className="flex items-center gap-2 text-sm text-amber-600 dark:text-amber-400 mb-2">
                      <XCircle className="w-4 h-4" />
                      <span>Token expired - reconnect to post</span>
                    </div>
                  )}
                </div>
                
                {/* Edit/Delete buttons */}
                <div className="flex gap-2 mt-4">
                  <button
                    onClick={() => handleEdit(agent)}
                    className="flex-1 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-white py-2 px-4 rounded-lg transition flex items-center justify-center gap-2"
                  >
                    <Edit2 className="w-4 h-4" />
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(agent.id)}
                    className="flex-1 bg-red-100 hover:bg-red-200 dark:bg-red-900 dark:hover:bg-red-800 text-red-800 dark:text-red-200 py-2 px-4 rounded-lg transition flex items-center justify-center gap-2"
                  >
                    <Trash2 className="w-4 h-4" />
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
