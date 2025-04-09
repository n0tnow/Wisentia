// src/app/admin/subscriptions/page.jsx
"use client";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import MainLayout from '@/components/layout/MainLayout';
import { useAuth } from '@/contexts/AuthContext';

export default function SubscriptionManagementPage() {
  const [plans, setPlans] = useState([]);
  const [subscriptionStats, setSubscriptionStats] = useState({});
  const [recentSubscriptions, setRecentSubscriptions] = useState([]);
  const [editingPlanId, setEditingPlanId] = useState(null);
  const [formData, setFormData] = useState({
    planName: '',
    description: '',
    durationDays: 30,
    price: 0,
    nftId: '',
    features: '',
    isActive: true,
  });
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

    const fetchSubscriptionData = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/admin/subscriptions');
        if (!response.ok) {
          throw new Error('Failed to fetch subscription data');
        }

        const data = await response.json();
        setPlans(data.plans);
        setSubscriptionStats(data.stats);
        setRecentSubscriptions(data.recentSubscriptions);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (user && user.role === 'admin') {
      fetchSubscriptionData();
    }
  }, [user, router]);

  const handleCreatePlan = async () => {
    try {
      // Reset form data
      setFormData({
        planName: '',
        description: '',
        durationDays: 30,
        price: 0,
        nftId: '',
        features: '',
        isActive: true,
      });
      setEditingPlanId('new');
    } catch (err) {
      alert(`Error: ${err.message}`);
    }
  };

  const handleEditPlan = (plan) => {
    setFormData({
      planName: plan.PlanName,
      description: plan.Description || '',
      durationDays: plan.DurationDays,
      price: plan.Price,
      nftId: plan.NFTID || '',
      features: plan.Features || '',
      isActive: plan.IsActive,
    });
    setEditingPlanId(plan.PlanID);
  };

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
      // Convert to correct types
      const dataToSend = {
        ...formData,
        durationDays: parseInt(formData.durationDays),
        price: parseFloat(formData.price),
        nftId: formData.nftId ? parseInt(formData.nftId) : null,
      };

      const isNewPlan = editingPlanId === 'new';
      const url = isNewPlan 
        ? '/api/admin/subscriptions/create' 
        : `/api/admin/subscriptions/${editingPlanId}/update`;

      const response = await fetch(url, {
        method: isNewPlan ? 'POST' : 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(dataToSend),
      });

      if (!response.ok) {
        throw new Error('Failed to save subscription plan');
      }

      // Refresh plans list
      const refreshResponse = await fetch('/api/admin/subscriptions');
      if (refreshResponse.ok) {
        const refreshData = await refreshResponse.json();
        setPlans(refreshData.plans);
      }

      setEditingPlanId(null);
      alert(isNewPlan ? 'Plan created successfully' : 'Plan updated successfully');
    } catch (err) {
      alert(`Error: ${err.message}`);
    }
  };

  const handleToggleActive = async (planId, isActive) => {
    try {
      const response = await fetch(`/api/admin/subscriptions/${planId}/update`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          isActive: !isActive,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update plan');
      }

      // Plan listesini güncelle
      setPlans(plans.map(plan => 
        plan.PlanID === planId ? { ...plan, IsActive: !isActive } : plan
      ));
    } catch (err) {
      alert(`Error: ${err.message}`);
    }
  };

  if (loading) return (
    <MainLayout>
      <div className="container mx-auto p-4">
        <p>Loading subscription data...</p>
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

  return (
    <MainLayout>
      <div className="container mx-auto p-4">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Subscription Management</h1>
          {!editingPlanId && (
            <button
              onClick={handleCreatePlan}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              Create New Plan
            </button>
          )}
        </div>

        {/* Plan Form */}
        {editingPlanId && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">
              {editingPlanId === 'new' ? 'Create New Plan' : 'Edit Plan'}
            </h2>
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Plan Name*</label>
                  <input
                    type="text"
                    name="planName"
                    value={formData.planName}
                    onChange={handleInputChange}
                    className="w-full p-2 border rounded"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Duration (days)*</label>
                  <input
                    type="number"
                    name="durationDays"
                    value={formData.durationDays}
                    onChange={handleInputChange}
                    className="w-full p-2 border rounded"
                    min="1"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Price*</label>
                  <input
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleInputChange}
                    className="w-full p-2 border rounded"
                    min="0"
                    step="0.01"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">NFT ID</label>
                  <input
                    type="text"
                    name="nftId"
                    value={formData.nftId}
                    onChange={handleInputChange}
                    className="w-full p-2 border rounded"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    className="w-full p-2 border rounded"
                    rows="3"
                  ></textarea>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Features (comma separated)</label>
                  <textarea
                    name="features"
                    value={formData.features}
                    onChange={handleInputChange}
                    className="w-full p-2 border rounded"
                    rows="3"
                    placeholder="Feature 1, Feature 2, Feature 3"
                  ></textarea>
                </div>
                <div>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      name="isActive"
                      checked={formData.isActive}
                      onChange={handleInputChange}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label className="ml-2 block text-sm text-gray-900">Active</label>
                  </div>
                </div>
              </div>
              <div className="flex space-x-2">
                <button
                  type="submit"
                  className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                >
                  Save
                </button>
                <button
                  type="button"
                  onClick={() => setEditingPlanId(null)}
                  className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Subscription Plans */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Subscription Plans</h2>
          {plans.length === 0 ? (
            <p className="text-gray-500">No subscription plans found</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Plan Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Duration</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">NFT</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Active Subscribers</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {plans.map((plan) => (
                    <tr key={plan.PlanID}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="font-medium text-gray-900">{plan.PlanName}</div>
                        <div className="text-gray-500 text-sm truncate max-w-xs">{plan.Description}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">{plan.DurationDays} days</td>
                      <td className="px-6 py-4 whitespace-nowrap">${plan.Price.toFixed(2)}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{plan.NFTTitle || 'N/A'}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          plan.IsActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {plan.IsActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {subscriptionStats[plan.PlanID]?.activeCount || 0}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => handleEditPlan(plan)}
                          className="text-blue-600 hover:text-blue-900 mr-3"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleToggleActive(plan.PlanID, plan.IsActive)}
                          className={`${plan.IsActive ? 'text-red-600 hover:text-red-900' : 'text-green-600 hover:text-green-900'}`}
                        >
                          {plan.IsActive ? 'Deactivate' : 'Activate'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Recent Subscriptions */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Recent Subscriptions</h2>
          {recentSubscriptions.length === 0 ? (
            <p className="text-gray-500">No recent subscriptions</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Plan</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Start Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">End Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {recentSubscriptions.map((subscription) => (
                    <tr key={subscription.SubscriptionID}>
                      <td className="px-6 py-4 whitespace-nowrap">{subscription.Username}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{subscription.PlanName}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {new Date(subscription.StartDate).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {new Date(subscription.EndDate).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          subscription.IsActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {subscription.IsActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
}