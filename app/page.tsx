'use client';

import { useState, useEffect } from 'react';
import { Home, Sparkles, Send, Users } from 'lucide-react';
import Link from 'next/link';

interface Agent {
  id: string;
  name: string;
  phone: string;
  headshotUrl?: string;
}

export default function HomePage() {
  const [url, setUrl] = useState('');
  const [agentId, setAgentId] = useState('');
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchAgents();
  }, []);

  const fetchAgents = async () => {
    try {
      const response = await fetch('/api/agents');
      const data = await response.json();
      setAgents(data);
    } catch (error) {
      console.error('Error fetching agents:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const response = await fetch('/api/scrape-listing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          url,
          agentId: agentId || undefined,
        }),
      });
      
      const data = await response.json();
      
      if (data.postId) {
        // Redirect to review page
        window.location.href = `/review/${data.postId}`;
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to process listing. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="flex justify-center mb-4">
              <div className="bg-indigo-600 p-4 rounded-full">
                <Home className="w-12 h-12 text-white" />
              </div>
            </div>
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
              Real Estate Auto Post
            </h1>
            <p className="text-gray-600 dark:text-gray-300">
              Turn listing URLs into beautiful social media posts in seconds
            </p>
          </div>

          {/* Main Card */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
            <form onSubmit={handleSubmit}>
              <div className="mb-6">
                <label 
                  htmlFor="listingUrl" 
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                >
                  Listing URL
                </label>
                <input
                  type="url"
                  id="listingUrl"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://example.com/property/123"
                  required
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                />
              </div>

              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <label 
                    htmlFor="agent" 
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                  >
                    Select Agent (Optional)
                  </label>
                  <Link
                    href="/agents"
                    className="flex items-center gap-1 text-sm text-indigo-600 hover:text-indigo-700 dark:text-indigo-400"
                  >
                    <Users className="w-4 h-4" />
                    Manage Agents
                  </Link>
                </div>
                <select
                  id="agent"
                  value={agentId}
                  onChange={(e) => setAgentId(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                >
                  <option value="">No agent selected</option>
                  {agents.map((agent) => (
                    <option key={agent.id} value={agent.id}>
                      {agent.name} - {agent.phone}
                    </option>
                  ))}
                </select>
                {agents.length === 0 && (
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                    No agents added yet. <Link href="/agents" className="text-indigo-600 hover:underline">Add agents</Link> to select from this list.
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={loading || !url}
                className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400 text-white font-semibold py-3 px-6 rounded-lg transition duration-200 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Sparkles className="w-5 h-5 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Send className="w-5 h-5" />
                    Generate Post
                  </>
                )}
              </button>
            </form>

            {/* How it Works */}
            <div className="mt-8 pt-8 border-t border-gray-200 dark:border-gray-700">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">
                How it works:
              </h3>
              <ol className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                <li className="flex gap-2">
                  <span className="font-semibold text-indigo-600">1.</span>
                  Paste the listing URL from your website
                </li>
                <li className="flex gap-2">
                  <span className="font-semibold text-indigo-600">2.</span>
                  AI extracts property details and generates captions
                </li>
                <li className="flex gap-2">
                  <span className="font-semibold text-indigo-600">3.</span>
                  Review and customize the post
                </li>
                <li className="flex gap-2">
                  <span className="font-semibold text-indigo-600">4.</span>
                  Post directly to Facebook & Instagram
                </li>
              </ol>
            </div>
          </div>

          {/* Quick Access */}
          <div className="mt-8 text-center">
            <a 
              href="/dashboard" 
              className="text-indigo-600 dark:text-indigo-400 hover:underline"
            >
              View Pending Posts →
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
