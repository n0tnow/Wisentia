// src/app/subscriptions/page.jsx
"use client";
import { useState, useEffect } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { useAuth } from '@/contexts/AuthContext';

export default function SubscriptionsPage() {
  const [plans, setPlans] = useState([]);
  const [userSubscription, setUserSubscription] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useAuth();

  useEffect(() => {
    const fetchSubscriptions = async () => {
      try {
        setLoading(true);
        // Tüm abonelik planlarını getir
        const plansResponse = await fetch('/api/subscriptions/plans');
        if (!plansResponse.ok) {
          throw new Error('Failed to fetch subscription plans');
        }
        const plansData = await plansResponse.json();
        setPlans(plansData);
        
        // Kullanıcının abonelik bilgilerini getir
        if (user) {
          const userSubResponse = await fetch('/api/subscriptions/user');
          if (userSubResponse.ok) {
            const userSubData = await userSubResponse.json();
            setUserSubscription(userSubData);
          }
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchSubscriptions();
  }, [user]);

  const handleSubscribe = async (planId) => {
    try {
      const response = await fetch('/api/subscriptions/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          planId,
          paymentMethod: 'wallet',
          autoRenew: false
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to subscribe to plan');
      }
      
      const result = await response.json();
      alert('Subscription successful!');
      
      // Kullanıcının abonelik bilgilerini güncelle
      const userSubResponse = await fetch('/api/subscriptions/user');
      if (userSubResponse.ok) {
        const userSubData = await userSubResponse.json();
        setUserSubscription(userSubData);
      }
    } catch (err) {
      alert(`Error: ${err.message}`);
    }
  };

  const handleCancelSubscription = async (subscriptionId) => {
    try {
      const response = await fetch(`/api/subscriptions/${subscriptionId}/cancel`, {
        method: 'POST',
      });
      
      if (!response.ok) {
        throw new Error('Failed to cancel subscription');
      }
      
      alert('Subscription cancelled successfully');
      
      // Kullanıcının abonelik bilgilerini güncelle
      const userSubResponse = await fetch('/api/subscriptions/user');
      if (userSubResponse.ok) {
        const userSubData = await userSubResponse.json();
        setUserSubscription(userSubData);
      }
    } catch (err) {
      alert(`Error: ${err.message}`);
    }
  };

  const handleToggleAutoRenew = async (subscriptionId, autoRenew) => {
    try {
      const response = await fetch(`/api/subscriptions/${subscriptionId}/auto-renew`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          autoRenew: !autoRenew
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to toggle auto-renew');
      }
      
      alert(`Auto-renew ${!autoRenew ? 'enabled' : 'disabled'} successfully`);
      
      // Kullanıcının abonelik bilgilerini güncelle
      const userSubResponse = await fetch('/api/subscriptions/user');
      if (userSubResponse.ok) {
        const userSubData = await userSubResponse.json();
        setUserSubscription(userSubData);
      }
    } catch (err) {
      alert(`Error: ${err.message}`);
    }
  };

  if (loading) return (
    <MainLayout>
      <div className="container mx-auto p-4">
        <p>Loading subscription plans...</p>
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
        <h1 className="text-2xl font-bold mb-6">Subscription Plans</h1>
        
        {/* Current Subscription */}
        {userSubscription && userSubscription.activeSubscriptions && userSubscription.activeSubscriptions.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-bold mb-4">Your Current Subscription</h2>
            <div className="bg-white rounded-lg shadow-md p-6">
              {userSubscription.activeSubscriptions.map((sub) => (
                <div key={sub.SubscriptionID} className="mb-4">
                  <h3 className="font-semibold text-lg">{sub.PlanName}</h3>
                  <p className="text-gray-600 mb-2">
                    Valid until: {new Date(sub.EndDate).toLocaleDateString()}
                  </p>
                  <div className="flex space-x-3 mt-4">
                    <button 
                      onClick={() => handleCancelSubscription(sub.SubscriptionID)}
                      className="bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-4 rounded"
                    >
                      Cancel Subscription
                    </button>
                    <button 
                      onClick={() => handleToggleAutoRenew(sub.SubscriptionID, sub.AutoRenew)}
                      className={`${sub.AutoRenew ? 'bg-yellow-500 hover:bg-yellow-600' : 'bg-green-500 hover:bg-green-600'} text-white font-semibold py-2 px-4 rounded`}
                    >
                      {sub.AutoRenew ? 'Disable Auto-Renew' : 'Enable Auto-Renew'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* Subscription History */}
        {userSubscription && userSubscription.history && userSubscription.history.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-bold mb-4">Subscription History</h2>
            <div className="bg-white rounded-lg shadow-md p-6">
              <table className="min-w-full">
                <thead>
                  <tr>
                    <th className="text-left pb-3">Plan</th>
                    <th className="text-left pb-3">Start Date</th>
                    <th className="text-left pb-3">End Date</th>
                    <th className="text-left pb-3">Payment Method</th>
                  </tr>
                </thead>
                <tbody>
                  {userSubscription.history.map((sub) => (
                    <tr key={sub.SubscriptionID} className="border-t">
                      <td className="py-3">{sub.PlanName}</td>
                      <td className="py-3">{new Date(sub.StartDate).toLocaleDateString()}</td>
                      <td className="py-3">{new Date(sub.EndDate).toLocaleDateString()}</td>
                      <td className="py-3">{sub.PaymentMethod}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
        
        {/* Available Plans */}
        <div>
          <h2 className="text-xl font-bold mb-4">Available Plans</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {plans.map((plan) => (
              <div key={plan.PlanID} className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="bg-blue-600 text-white p-4">
                  <h3 className="font-bold text-lg">{plan.PlanName}</h3>
                </div>
                <div className="p-6">
                  <p className="font-bold text-2xl mb-4">${plan.Price}<span className="text-sm font-normal">/month</span></p>
                  <p className="text-gray-600 mb-4">{plan.Description}</p>
                  <p className="mb-4">Duration: {plan.DurationDays} days</p>
                  
                  {plan.NFTTitle && (
                    <div className="mb-4">
                      <p className="font-semibold">Includes NFT:</p>
                      <p>{plan.NFTTitle}</p>
                    </div>
                  )}
                  
                  <button 
                    onClick={() => handleSubscribe(plan.PlanID)}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mt-4"
                    disabled={userSubscription && userSubscription.activeSubscriptions && userSubscription.activeSubscriptions.length > 0}
                  >
                    {userSubscription && userSubscription.activeSubscriptions && userSubscription.activeSubscriptions.length > 0 
                      ? 'Already Subscribed' 
                      : 'Subscribe Now'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </MainLayout>
  );
}