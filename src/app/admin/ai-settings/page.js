"use client";

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Settings, Save, RefreshCw, AlertCircle, CheckCircle, BarChart3 } from 'lucide-react';

export default function AISettingsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);
  const [formData, setFormData] = useState({
    imageGeneration: true,
    titleGeneration: true,
    descriptionGeneration: true,
    dailyLimit: 100,
    monthlyLimit: 1000
  });

  useEffect(() => {
    console.log('AI Settings - Session status:', status);
    console.log('AI Settings - Session data:', session);
    console.log('AI Settings - User role:', session?.user?.role);

    if (status === 'loading') {
      console.log('AI Settings - Still loading session...');
      return;
    }

    if (!session) {
      console.log('AI Settings - No session found, redirecting to login');
      router.push('/admin-secret');
      return;
    }

    if (session.user.role !== 'admin') {
      console.log('AI Settings - User is not admin, redirecting to login. Role:', session.user.role);
      router.push('/admin-secret');
      return;
    }

    console.log('AI Settings - User is admin, fetching settings');
    fetchSettings();
  }, [session, status, router]);

  const fetchSettings = async () => {
    try {
      const response = await fetch('/api/admin/ai-settings');
      if (response.ok) {
        const data = await response.json();
        setSettings(data);
        setFormData({
          imageGeneration: data.imageGeneration ?? true,
          titleGeneration: data.titleGeneration ?? true,
          descriptionGeneration: data.descriptionGeneration ?? true,
          dailyLimit: data.dailyLimit,
          monthlyLimit: data.monthlyLimit
        });
      } else {
        throw new Error('Failed to fetch settings');
      }
    } catch (error) {
      console.error('Error fetching AI settings:', error);
      setMessage({ type: 'error', text: 'Failed to load AI settings' });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage(null);

    try {
      const response = await fetch('/api/admin/ai-settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        await response.json();
        setMessage({ type: 'success', text: 'AI settings updated successfully!' });
        fetchSettings(); // Refresh data
      } else {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update settings');
      }
    } catch (error) {
      console.error('Error updating AI settings:', error);
      setMessage({ type: 'error', text: error.message });
    } finally {
      setSaving(false);
    }
  };

  const handleResetUsage = async () => {
    if (!confirm('Are you sure you want to reset the usage counters? This will set daily and monthly usage back to 0.')) {
      return;
    }

    setSaving(true);
    setMessage(null);

    try {
      const response = await fetch('/api/admin/ai-settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          resetUsage: true
        })
      });

      if (response.ok) {
        setMessage({ type: 'success', text: 'Usage counters reset successfully!' });
        fetchSettings(); // Refresh data
      } else {
        const error = await response.json();
        throw new Error(error.error || 'Failed to reset usage');
      }
    } catch (error) {
      console.error('Error resetting usage:', error);
      setMessage({ type: 'error', text: error.message });
    } finally {
      setSaving(false);
    }
  };

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">Loading AI settings...</p>
        </div>
      </div>
    );
  }

  if (!session || session.user.role !== 'admin') {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Settings className="w-6 h-6 text-blue-600" />
              <h1 className="text-xl font-bold text-gray-800">AI Features Settings</h1>
            </div>
            <button
              onClick={() => router.push('/admin')}
              className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 text-sm"
            >
              ← Back to Admin
            </button>
          </div>
        </div>
      </div>

      <div className="py-8 px-4">
        <div className="max-w-4xl mx-auto">
          {/* Current Usage Stats */}
          {settings && (
            <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
              <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                <BarChart3 className="w-5 h-5 mr-2 text-green-600" />
                Current Usage Statistics
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h3 className="font-medium text-blue-800 mb-2">Daily Usage</h3>
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold text-blue-600">
                      {settings.currentDailyUsage}
                    </span>
                    <span className="text-sm text-blue-600">
                      / {settings.dailyLimit} limit
                    </span>
                  </div>
                  <div className="w-full bg-blue-200 rounded-full h-2 mt-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{
                        width: `${Math.min((settings.currentDailyUsage / settings.dailyLimit) * 100, 100)}%`
                      }}
                    ></div>
                  </div>
                </div>

                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                  <h3 className="font-medium text-purple-800 mb-2">Monthly Usage</h3>
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold text-purple-600">
                      {settings.currentMonthlyUsage}
                    </span>
                    <span className="text-sm text-purple-600">
                      / {settings.monthlyLimit} limit
                    </span>
                  </div>
                  <div className="w-full bg-purple-200 rounded-full h-2 mt-2">
                    <div
                      className="bg-purple-600 h-2 rounded-full transition-all duration-300"
                      style={{
                        width: `${Math.min((settings.currentMonthlyUsage / settings.monthlyLimit) * 100, 100)}%`
                      }}
                    ></div>
                  </div>
                </div>
              </div>

              <div className="mt-4 flex items-center justify-between">
                <div className="text-sm text-gray-600">
                  <p>Last daily reset: {settings.lastResetDate}</p>
                  <p>Last monthly reset: {settings.lastMonthReset}</p>
                </div>
                <button
                  onClick={handleResetUsage}
                  disabled={saving}
                  className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 disabled:opacity-50 text-sm"
                >
                  Reset Usage Counters
                </button>
              </div>
            </div>
          )}

          {/* Settings Form */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-6">AI Generation Settings</h2>

            {message && (
              <div className={`mb-6 p-4 rounded-lg border ${message.type === 'success'
                ? 'bg-green-50 border-green-200 text-green-700'
                : 'bg-red-50 border-red-200 text-red-700'
                }`}>
                <div className="flex items-center">
                  {message.type === 'success' ? (
                    <CheckCircle className="w-5 h-5 mr-2" />
                  ) : (
                    <AlertCircle className="w-5 h-5 mr-2" />
                  )}
                  {message.text}
                </div>
              </div>
            )}

            <div className="space-y-6">
              {/* Individual AI Feature Controls */}
              <div className="bg-gray-50 rounded-lg p-4 space-y-4">
                <h3 className="font-medium text-gray-800 mb-3">AI Feature Controls</h3>

                {/* Image Generation */}
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-gray-700">AI Image Generation</h4>
                    <p className="text-sm text-gray-600">Allow users to generate images using AI</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      name="imageGeneration"
                      checked={formData.imageGeneration}
                      onChange={handleInputChange}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>

                {/* Title Generation */}
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-gray-700">AI Title Generation</h4>
                    <p className="text-sm text-gray-600">Allow users to generate titles using AI</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      name="titleGeneration"
                      checked={formData.titleGeneration}
                      onChange={handleInputChange}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>

                {/* Description Generation */}
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-gray-700">AI Description Generation</h4>
                    <p className="text-sm text-gray-600">Allow users to generate descriptions using AI</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      name="descriptionGeneration"
                      checked={formData.descriptionGeneration}
                      onChange={handleInputChange}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
              </div>

              {/* Daily Limit */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Daily AI Usage Limit
                </label>
                <input
                  type="number"
                  name="dailyLimit"
                  value={formData.dailyLimit}
                  onChange={handleInputChange}
                  min="0"
                  max="10000"
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="100"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Maximum number of AI operations (images, titles, descriptions) per day across all users
                </p>
              </div>

              {/* Monthly Limit */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Monthly AI Usage Limit
                </label>
                <input
                  type="number"
                  name="monthlyLimit"
                  value={formData.monthlyLimit}
                  onChange={handleInputChange}
                  min="0"
                  max="100000"
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="1000"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Maximum number of AI operations (images, titles, descriptions) per month across all users
                </p>
              </div>

              {/* Save Button */}
              <div className="flex justify-end pt-4">
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                >
                  {saving ? (
                    <>
                      <RefreshCw className="w-5 h-5 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="w-5 h-5 mr-2" />
                      Save Settings
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}