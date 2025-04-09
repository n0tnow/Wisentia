// src/app/admin/dashboard/page.jsx
"use client";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import MainLayout from '@/components/layout/MainLayout';
import { useAuth } from '@/contexts/AuthContext';

export default function AdminDashboardPage() {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Check if user is admin
    if (user && user.role !== 'admin') {
      router.push('/');
      return;
    }

    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/admin/dashboard');
        if (!response.ok) {
          throw new Error('Failed to fetch dashboard data');
        }
        const data = await response.json();
        setDashboardData(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (user && user.role === 'admin') {
      fetchDashboardData();
    }
  }, [user, router]);

  if (loading) return (
    <MainLayout>
      <div className="container mx-auto p-4">
        <p>Loading admin dashboard...</p>
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

  if (!dashboardData) return (
    <MainLayout>
      <div className="container mx-auto p-4">
        <p>Unable to load dashboard data</p>
      </div>
    </MainLayout>
  );

  return (
    <MainLayout>
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-6">Admin Dashboard</h1>
        
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-lg font-semibold text-gray-600">Total Users</h2>
            <p className="text-3xl font-bold mt-2">{dashboardData.summary.totalUsers}</p>
            <p className="text-sm text-green-600 mt-2">
              +{dashboardData.summary.newUsers} new users in the last 30 days
            </p>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-lg font-semibold text-gray-600">Active Courses</h2>
            <p className="text-3xl font-bold mt-2">{dashboardData.summary.activeCourses}</p>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-lg font-semibold text-gray-600">Active Quests</h2>
            <p className="text-3xl font-bold mt-2">{dashboardData.summary.activeQuests}</p>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-lg font-semibold text-gray-600">Active Subscriptions</h2>
            <p className="text-3xl font-bold mt-2">{dashboardData.summary.activeSubscriptions}</p>
          </div>
        </div>
        
        {/* Charts Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-lg font-semibold mb-4">User Growth (Last 30 Days)</h2>
            <div className="h-64 bg-gray-100 rounded p-4 flex items-center justify-center">
              <p className="text-gray-500">Chart will be implemented in design phase</p>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-lg font-semibold mb-4">Active Users</h2>
            <table className="min-w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left pb-3">Username</th>
                  <th className="text-left pb-3">Activity Count</th>
                </tr>
              </thead>
              <tbody>
                {dashboardData.activeUsers.map((user) => (
                  <tr key={user.UserID} className="border-b">
                    <td className="py-2">{user.Username}</td>
                    <td className="py-2">{user.ActivityCount}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        
        {/* Popular Courses & Recent Activities */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-lg font-semibold mb-4">Popular Courses</h2>
            <table className="min-w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left pb-3">Course</th>
                  <th className="text-left pb-3">Enrolled Users</th>
                </tr>
              </thead>
              <tbody>
                {dashboardData.popularCourses.map((course) => (
                  <tr key={course.CourseID} className="border-b">
                    <td className="py-2">{course.Title}</td>
                    <td className="py-2">{course.EnrolledUsers}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-lg font-semibold mb-4">Recent Activities</h2>
            <div className="max-h-64 overflow-y-auto">
              {dashboardData.recentActivities.map((activity) => (
                <div key={activity.LogID} className="border-b py-2">
                  <p className="font-semibold">{activity.Username}</p>
                  <p className="text-gray-600">{activity.Description}</p>
                  <p className="text-gray-400 text-sm">
                    {new Date(activity.Timestamp).toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
        
        {/* Admin Actions */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <a 
              href="/admin/users" 
              className="bg-blue-600 text-white py-3 px-4 rounded text-center hover:bg-blue-700"
            >
              Manage Users
            </a>
            <a 
              href="/admin/content" 
              className="bg-green-600 text-white py-3 px-4 rounded text-center hover:bg-green-700"
            >
              Manage Content
            </a>
            <a 
              href="/admin/subscriptions" 
              className="bg-purple-600 text-white py-3 px-4 rounded text-center hover:bg-purple-700"
            >
              Manage Subscriptions
            </a>
            <a 
              href="/admin/system-health" 
              className="bg-yellow-500 text-white py-3 px-4 rounded text-center hover:bg-yellow-600"
            >
              System Health
            </a>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}