// src/app/admin/users/[userId]/page.jsx
"use client";
import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import MainLayout from '@/components/layout/MainLayout';
import { useAuth } from '@/contexts/AuthContext';

export default function UserDetailsPage() {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    userRole: '',
    isActive: true,
  });
  
  const { user } = useAuth();
  const router = useRouter();
  const { userId } = useParams();

  useEffect(() => {
    // Admin kontrolü
    if (user && user.role !== 'admin') {
      router.push('/');
      return;
    }

    const fetchUserDetails = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/admin/users/${userId}`);
        if (!response.ok) {
          throw new Error('Failed to fetch user details');
        }

        const data = await response.json();
        setUserData(data);
        setFormData({
          username: data.user.Username,
          email: data.user.Email,
          userRole: data.user.UserRole,
          isActive: data.user.IsActive,
        });
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (user && user.role === 'admin' && userId) {
      fetchUserDetails();
    }
  }, [user, router, userId]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`/api/admin/users/${userId}/update`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error('Failed to update user');
      }

      const updateResult = await response.json();
      
      // Update local state
      setUserData({
        ...userData,
        user: {
          ...userData.user,
          Username: formData.username,
          Email: formData.email,
          UserRole: formData.userRole,
          IsActive: formData.isActive,
        }
      });
      
      setEditMode(false);
      alert('User updated successfully');
    } catch (err) {
      alert(`Error: ${err.message}`);
    }
  };

  if (loading) return (
    <MainLayout>
      <div className="container mx-auto p-4">
        <p>Loading user details...</p>
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

  if (!userData) return (
    <MainLayout>
      <div className="container mx-auto p-4">
        <p>User not found</p>
      </div>
    </MainLayout>
  );

  return (
    <MainLayout>
      <div className="container mx-auto p-4">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">User Details</h1>
          <div className="flex space-x-2">
            <button
              onClick={() => router.push('/admin/users')}
              className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
            >
              Back to Users
            </button>
            {!editMode ? (
              <button
                onClick={() => setEditMode(true)}
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
              >
                Edit User
              </button>
            ) : (
              <button
                onClick={() => setEditMode(false)}
                className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
              >
                Cancel
              </button>
            )}
          </div>
        </div>

        {/* User Information */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          {editMode ? (
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
                  <input
                    type="text"
                    name="username"
                    value={formData.username}
                    onChange={handleInputChange}
                    className="w-full p-2 border rounded"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full p-2 border rounded"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                  <select
                    name="userRole"
                    value={formData.userRole}
                    onChange={handleInputChange}
                    className="w-full p-2 border rounded"
                    required
                  >
                    <option value="regular">Regular</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    name="isActive"
                    checked={formData.isActive}
                    onChange={handleInputChange}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label className="ml-2 block text-sm text-gray-900">Active Account</label>
                </div>
              </div>
              <div className="mt-6">
                <button
                  type="submit"
                  className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                >
                  Save Changes
                </button>
              </div>
            </form>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h2 className="text-lg font-semibold mb-4">Basic Information</h2>
                <div className="flex items-center mb-2">
                  {userData.user.ProfileImage ? (
                    <img 
                      src={userData.user.ProfileImage} 
                      alt={userData.user.Username} 
                      className="h-16 w-16 rounded-full mr-3"
                    />
                  ) : (
                    <div className="h-16 w-16 rounded-full bg-gray-200 mr-3 flex items-center justify-center">
                      <span className="text-gray-500 text-xl">{userData.user.Username[0]}</span>
                    </div>
                  )}
                  <div>
                    <h3 className="font-semibold text-xl">{userData.user.Username}</h3>
                    <p className="text-gray-600">{userData.user.Email}</p>
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-2">
                  <div>
                    <p className="text-sm text-gray-600">Role</p>
                    <p>{userData.user.UserRole}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Status</p>
                    <p className={userData.user.IsActive ? 'text-green-600' : 'text-red-600'}>
                      {userData.user.IsActive ? 'Active' : 'Inactive'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Join Date</p>
                    <p>{new Date(userData.user.JoinDate).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Last Login</p>
                    <p>{userData.user.LastLogin ? new Date(userData.user.LastLogin).toLocaleString() : 'Never'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Total Points</p>
                    <p>{userData.user.TotalPoints}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Wallet Connected</p>
                    <p>{userData.user.WalletAddress ? 'Yes' : 'No'}</p>
                  </div>
                </div>
              </div>

              <div>
                <h2 className="text-lg font-semibold mb-4">User Stats</h2>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-blue-50 p-3 rounded">
                    <p className="text-sm text-gray-600">Completed Courses</p>
                    <p className="text-xl font-semibold">{userData.stats.completedCourses}</p>
                  </div>
                  <div className="bg-green-50 p-3 rounded">
                    <p className="text-sm text-gray-600">Watched Videos</p>
                    <p className="text-xl font-semibold">{userData.stats.watchedVideos}</p>
                  </div>
                  <div className="bg-yellow-50 p-3 rounded">
                    <p className="text-sm text-gray-600">Passed Quizzes</p>
                    <p className="text-xl font-semibold">{userData.stats.passedQuizzes}</p>
                  </div>
                  <div className="bg-purple-50 p-3 rounded">
                    <p className="text-sm text-gray-600">Completed Quests</p>
                    <p className="text-xl font-semibold">{userData.stats.completedQuests}</p>
                  </div>
                  <div className="bg-indigo-50 p-3 rounded">
                    <p className="text-sm text-gray-600">Owned NFTs</p>
                    <p className="text-xl font-semibold">{userData.stats.ownedNFTs}</p>
                  </div>
                  <div className="bg-pink-50 p-3 rounded">
                    <p className="text-sm text-gray-600">Active Subscriptions</p>
                    <p className="text-xl font-semibold">{userData.stats.activeSubscriptions}</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-semibold mb-4">Recent Activity</h2>
          <div className="divide-y">
            {userData.recentActivities.length === 0 ? (
              <p className="text-gray-500 py-2">No recent activity</p>
            ) : (
              userData.recentActivities.map((activity, index) => (
                <div key={index} className="py-3">
                  <div className="flex justify-between">
                    <p className="font-medium">{activity.ActivityType}</p>
                    <p className="text-sm text-gray-500">
                      {new Date(activity.Timestamp).toLocaleString()}
                    </p>
                  </div>
                  <p className="text-gray-600 mt-1">{activity.Description}</p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </MainLayout>
  );
}