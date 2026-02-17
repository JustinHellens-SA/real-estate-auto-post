'use client';

import { useEffect, useState } from 'react';
import { Upload, Palette, ArrowLeft, Save } from 'lucide-react';
import Link from 'next/link';

interface BrandingSettings {
  id: string;
  companyName: string;
  logoUrl?: string;
  forSaleGraphic?: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor1?: string;
  accentColor2?: string;
  accentColor3?: string;
  tagline: string;
}

export default function BrandingPage() {
  const [settings, setSettings] = useState<BrandingSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    companyName: 'Local Real Estate SA',
    logoUrl: '',
    forSaleGraphic: '',
    primaryColor: '#f9b32d',    // Brand Orange (Pantone 1235 C)
    secondaryColor: '#003d51',  // Brand Dark Teal (Pantone 3035 C)
    accentColor1: '#ea4b8b',    // Brand Pink (Pantone 1915 C)
    accentColor2: '#5dc2e8',    // Brand Cyan (Pantone 0821 C)
    accentColor3: '#92c679',    // Brand Green (Pantone 7487 C)
    tagline: 'MAKE YOUR NEXT MOVE A LOCAL ONE',
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await fetch('/api/branding');
      const data = await response.json();
      setSettings(data);
      setFormData({
        companyName: data.companyName || 'Local Real Estate SA',
        logoUrl: data.logoUrl || '',
        forSaleGraphic: data.forSaleGraphic || '',
        primaryColor: data.primaryColor || '#f9b32d',
        secondaryColor: data.secondaryColor || '#003d51',
        accentColor1: data.accentColor1 || '#ea4b8b',
        accentColor2: data.accentColor2 || '#5dc2e8',
        accentColor3: data.accentColor3 || '#92c679',
        tagline: data.tagline || 'MAKE YOUR NEXT MOVE A LOCAL ONE',
      });
    } catch (error) {
      console.error('Error fetching branding:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    field: 'logoUrl' | 'forSaleGraphic'
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Convert to base64 for simple storage
    // In production, upload to cloud storage (S3, Cloudinary, etc.)
    const reader = new FileReader();
    reader.onloadend = () => {
      setFormData({ ...formData, [field]: reader.result as string });
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const response = await fetch('/api/branding', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        alert('Branding settings saved successfully!');
        await fetchSettings();
      }
    } catch (error) {
      console.error('Error saving branding:', error);
      alert('Failed to save branding settings');
    } finally {
      setSaving(false);
    }
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
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/"
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Branding Settings
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Upload your logo, FOR SALE graphics, and customize brand colors
          </p>
        </div>

        <div className="space-y-6">
          {/* Company Info */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
              Company Information
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Company Name
                </label>
                <input
                  type="text"
                  value={formData.companyName}
                  onChange={(e) =>
                    setFormData({ ...formData, companyName: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Tagline
                </label>
                <input
                  type="text"
                  value={formData.tagline}
                  onChange={(e) =>
                    setFormData({ ...formData, tagline: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                />
              </div>
            </div>
          </div>

          {/* Logo Upload */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white flex items-center gap-2">
              <Upload className="w-5 h-5" />
              Company Logo
            </h2>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => handleFileUpload(e, 'logoUrl')}
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 mb-4"
            />
            {formData.logoUrl && (
              <div className="mt-4">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Preview:</p>
                <img
                  src={formData.logoUrl}
                  alt="Logo preview"
                  className="max-w-xs max-h-32 object-contain bg-gray-100 dark:bg-gray-700 p-4 rounded"
                />
              </div>
            )}
          </div>

          {/* FOR SALE Graphic */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white flex items-center gap-2">
              <Upload className="w-5 h-5" />
              FOR SALE Graphic / Wordart
            </h2>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => handleFileUpload(e, 'forSaleGraphic')}
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 mb-4"
            />
            {formData.forSaleGraphic && (
              <div className="mt-4">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Preview:</p>
                <img
                  src={formData.forSaleGraphic}
                  alt="FOR SALE graphic preview"
                  className="max-w-xs max-h-32 object-contain bg-gray-100 dark:bg-gray-700 p-4 rounded"
                />
              </div>
            )}
            <p className="text-xs text-gray-500 mt-2">
              Upload a transparent PNG with "FOR SALE" or "EXCLUSIVE" text/graphics
            </p>
          </div>

          {/* Brand Colors */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white flex items-center gap-2">
              <Palette className="w-5 h-5" />
              Brand Colors
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Primary Color (Orange)
                </label>
                <div className="flex gap-2">
                  <input
                    type="color"
                    value={formData.primaryColor}
                    onChange={(e) =>
                      setFormData({ ...formData, primaryColor: e.target.value })
                    }
                    className="w-16 h-10 rounded cursor-pointer"
                  />
                  <input
                    type="text"
                    value={formData.primaryColor}
                    onChange={(e) =>
                      setFormData({ ...formData, primaryColor: e.target.value })
                    }
                    className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Secondary Color (Dark Teal)
                </label>
                <div className="flex gap-2">
                  <input
                    type="color"
                    value={formData.secondaryColor}
                    onChange={(e) =>
                      setFormData({ ...formData, secondaryColor: e.target.value })
                    }
                    className="w-16 h-10 rounded cursor-pointer"
                  />
                  <input
                    type="text"
                    value={formData.secondaryColor}
                    onChange={(e) =>
                      setFormData({ ...formData, secondaryColor: e.target.value })
                    }
                    className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Accent Color 1 (Pink)
                </label>
                <div className="flex gap-2">
                  <input
                    type="color"
                    value={formData.accentColor1}
                    onChange={(e) =>
                      setFormData({ ...formData, accentColor1: e.target.value })
                    }
                    className="w-16 h-10 rounded cursor-pointer"
                  />
                  <input
                    type="text"
                    value={formData.accentColor1}
                    onChange={(e) =>
                      setFormData({ ...formData, accentColor1: e.target.value })
                    }
                    className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Accent Color 2 (Cyan)
                </label>
                <div className="flex gap-2">
                  <input
                    type="color"
                    value={formData.accentColor2}
                    onChange={(e) =>
                      setFormData({ ...formData, accentColor2: e.target.value })
                    }
                    className="w-16 h-10 rounded cursor-pointer"
                  />
                  <input
                    type="text"
                    value={formData.accentColor2}
                    onChange={(e) =>
                      setFormData({ ...formData, accentColor2: e.target.value })
                    }
                    className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Accent Color 3 (Green)
                </label>
                <div className="flex gap-2">
                  <input
                    type="color"
                    value={formData.accentColor3}
                    onChange={(e) =>
                      setFormData({ ...formData, accentColor3: e.target.value })
                    }
                    className="w-16 h-10 rounded cursor-pointer"
                  />
                  <input
                    type="text"
                    value={formData.accentColor3}
                    onChange={(e) =>
                      setFormData({ ...formData, accentColor3: e.target.value })
                    }
                    className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  />
                </div>
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-4">
              From Local Real Estate SA Brand Guidelines (Pantone 1235 C, 3035 C, 1915 C, 0821 C, 7487 C)
            </p>
          </div>

          {/* Save Button */}
          <button
            onClick={handleSave}
            disabled={saving}
            className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400 text-white font-semibold py-3 px-6 rounded-lg transition flex items-center justify-center gap-2"
          >
            {saving ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                Saving...
              </>
            ) : (
              <>
                <Save className="w-5 h-5" />
                Save Branding Settings
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
