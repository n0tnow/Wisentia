// src/app/admin/system-health/page.jsx
"use client";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import MainLayout from '@/components/layout/MainLayout';
import { useAuth } from '@/contexts/AuthContext';

export default function SystemHealthPage() {
  const [healthData, setHealthData] = useState(null);
  const [cacheStats, setCacheStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Admin kontrolü
    if (user && user.role !== 'admin') {
      router.push('/');
      return;
    }

    const fetchSystemHealth = async () => {
      try {
        setLoading(true);
        // Sistem sağlığı verilerini getir
        const healthResponse = await fetch('/api/admin/system-health');
        if (!healthResponse.ok) {
          throw new Error('Failed to fetch system health data');
        }
        const healthData = await healthResponse.json();
        setHealthData(healthData);
        
        // Cache istatistiklerini getir
        const cacheResponse = await fetch('/api/admin/cache-stats');
        if (cacheResponse.ok) {
          const cacheData = await cacheResponse.json();
          setCacheStats(cacheData);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (user && user.role === 'admin') {
      fetchSystemHealth();
    }
  }, [user, router]);

  const handleClearCache = async () => {
    if (!confirm('Are you sure you want to clear the entire cache?')) {
      return;
    }
    
    try {
      const response = await fetch('/api/admin/cache-clear', {
        method: 'POST',
      });
      
      if (!response.ok) {
        throw new Error('Failed to clear cache');
      }
      
      alert('Cache cleared successfully');
      
      // Refresh cache stats
      const cacheResponse = await fetch('/api/admin/cache-stats');
      if (cacheResponse.ok) {
        const cacheData = await cacheResponse.json();
        setCacheStats(cacheData);
      }
    } catch (err) {
      alert(`Error: ${err.message}`);
    }
  };

  if (loading) return (
    <MainLayout>
      <div className="container mx-auto p-4">
        <p>Loading system health data...</p>
      </div>
    </MainLayout>
  );

  if (error) return (
    <MainLayout>
      <div className="container mx-auto p-4">
        <p className="text-red-500">Error: {error}</p>
      </div>
    </MainLayout>
  );

  if (!healthData) return (
    <MainLayout>
      <div className="container mx-auto p-4">
        <p>Unable to load system health data</p>
      </div>
    </MainLayout>
  );

  return (
    <MainLayout>
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-6">System Health</h1>
        
        {/* System Warnings */}
        {healthData.warnings && healthData.warnings.length > 0 && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <h2 className="text-yellow-800 font-semibold mb-2">System Warnings</h2>
            <ul className="space-y-2">
              {healthData.warnings.map((warning, index) => (
                <li key={index} className={`p-2 rounded ${
                  warning.severity === 'error' ? 'bg-red-100 text-red-800' : 
                  warning.severity === 'warning' ? 'bg-yellow-100 text-yellow-800' : 
                  'bg-blue-100 text-blue-800'
                }`}>
                  <span className="font-medium">{warning.type}: </span>
                  {warning.message}
                </li>
              ))}
            </ul>
          </div>
        )}
        
        {/* User Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-lg font-semibold mb-4">User Statistics</h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-blue-50 p-3 rounded">
                <p className="text-sm text-gray-600">Total Users</p>
                <p className="text-xl font-semibold">{healthData.users.total}</p>
              </div>
              <div className="bg-green-50 p-3 rounded">
                <p className="text-sm text-gray-600">New Users (30 days)</p>
                <p className="text-xl font-semibold">{healthData.users.newLast30Days}</p>
              </div>
              <div className="bg-purple-50 p-3 rounded">
                <p className="text-sm text-gray-600">Active Users (7 days)</p>
                <p className="text-xl font-semibold">{healthData.users.activeLast7Days}</p>
              </div>
              <div className="bg-red-50 p-3 rounded">
                <p className="text-sm text-gray-600">Inactive Users</p>
                <p className="text-xl font-semibold">{healthData.users.inactive}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-lg font-semibold mb-4">Content Statistics</h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-blue-50 p-3 rounded">
                <p className="text-sm text-gray-600">Active Courses</p>
                <p className="text-xl font-semibold">{healthData.content.courses}</p>
              </div>
              <div className="bg-green-50 p-3 rounded">
                <p className="text-sm text-gray-600">Active Quests</p>
                <p className="text-xl font-semibold">{healthData.content.quests}</p>
              </div>
              <div className="bg-purple-50 p-3 rounded">
                <p className="text-sm text-gray-600">Total NFTs</p>
                <p className="text-xl font-semibold">{healthData.content.nfts}</p>
              </div>
              <div className="bg-indigo-50 p-3 rounded">
                <p className="text-sm text-gray-600">Community Posts</p>
                <p className="text-xl font-semibold">{healthData.content.communityPosts}</p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Activity & Subscription Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-lg font-semibold mb-4">Activity Statistics</h2>
            <div className="grid grid-cols-1 gap-4">
              <div className="bg-blue-50 p-3 rounded">
                <p className="text-sm text-gray-600">Total Activities (7 days)</p>
                <p className="text-xl font-semibold">{healthData.activity.totalLast7Days}</p>
              </div>
              <div className="bg-green-50 p-3 rounded">
                <p className="text-sm text-gray-600">Unique Users (7 days)</p>
                <p className="text-xl font-semibold">{healthData.activity.uniqueUsersLast7Days}</p>
              </div>
              <div className="bg-purple-50 p-3 rounded">
                <p className="text-sm text-gray-600">Last Activity</p>
                <p className="text-base font-semibold">
                  {healthData.activity.lastActivityTime 
                    ? new Date(healthData.activity.lastActivityTime).toLocaleString() 
                    : 'N/A'}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-lg font-semibold mb-4">Subscription Statistics</h2>
            <div className="grid grid-cols-1 gap-4">
              <div className="bg-blue-50 p-3 rounded">
                <p className="text-sm text-gray-600">Total Subscriptions</p>
                <p className="text-xl font-semibold">{healthData.subscriptions.total}</p>
              </div>
              <div className="bg-green-50 p-3 rounded">
                <p className="text-sm text-gray-600">Active Subscriptions</p>
                <p className="text-xl font-semibold">{healthData.subscriptions.active}</p>
              </div>
              <div className="bg-purple-50 p-3 rounded">
                <p className="text-sm text-gray-600">Auto-Renew Enabled</p>
                <p className="text-xl font-semibold">{healthData.subscriptions.autoRenewEnabled}</p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Cache Statistics */}
        {cacheStats && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">Cache Statistics</h2>
              <button
                onClick={handleClearCache}
                className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
              >
                Clear Cache
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-blue-50 p-3 rounded">
                <p className="text-sm text-gray-600">Memory Used</p>
                <p className="text-xl font-semibold">{cacheStats.memory.used}</p>
              </div>
              <div className="bg-blue-50 p-3 rounded">
                <p className="text-sm text-gray-600">Memory Peak</p>
                <p className="text-xl font-semibold">{cacheStats.memory.peak}</p>
              </div>
              <div className="bg-green-50 p-3 rounded">
                <p className="text-sm text-gray-600">Total Keys</p>
                <p className="text-xl font-semibold">{cacheStats.keys.total}</p>
              </div>
              <div className="bg-green-50 p-3 rounded">
                <p className="text-sm text-gray-600">Keys with Expiry</p>
                <p className="text-xl font-semibold">{cacheStats.keys.with_expiry}</p>
              </div>
              <div className="bg-purple-50 p-3 rounded">
                <p className="text-sm text-gray-600">Cache Hits/Misses</p>
                <p className="text-xl font-semibold">
                  {cacheStats.performance.hits} / {cacheStats.performance.misses}
                </p>
              </div>
              <div className="bg-purple-50 p-3 rounded">
                <p className="text-sm text-gray-600">Hit Ratio</p>
                <p className="text-xl font-semibold">{cacheStats.performance.hit_ratio}</p>
              </div>
            </div>
          </div>
        )}
        
        {/* User Growth Chart */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-semibold mb-4">User Growth (Last 30 Days)</h2>
          <div className="h-64 bg-gray-100 rounded p-4 flex items-center justify-center">
            <p className="text-gray-500">Chart will be implemented in design phase</p>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}