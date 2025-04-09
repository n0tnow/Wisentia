// src/app/admin/generate-quest/page.jsx
"use client";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import MainLayout from '@/components/layout/MainLayout';
import { useAuth } from '@/contexts/AuthContext';

export default function GenerateQuestPage() {
  const [formData, setFormData] = useState({
    difficulty: 'intermediate',
    category: 'General Learning',
    pointsRequired: 100,
    pointsReward: 50,
  });
  
  const [generatedQuest, setGeneratedQuest] = useState(null);
  const [loading, setLoading] = useState(false);
  const [contentId, setContentId] = useState(null);
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Admin kontrolü
    if (user && user.role !== 'admin') {
      router.push('/');
    }
  }, [user, router]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: name === 'pointsRequired' || name === 'pointsReward' ? parseInt(value) : value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const response = await fetch('/api/ai/admin/generate-quest', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
      
      if (!response.ok) {
        throw new Error('Failed to generate quest');
      }
      
      const data = await response.json();
      setGeneratedQuest(data.quest);
      setContentId(data.contentId);
    } catch (err) {
      alert(`Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async () => {
    if (!contentId) return;
    
    try {
      setLoading(true);
      const response = await fetch(`/api/ai/admin/approve-quest/${contentId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          requiredPoints: formData.pointsRequired,
          rewardPoints: formData.pointsReward,
          difficultyLevel: formData.difficulty,
          conditionType: 'total_points',
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to approve quest');
      }
      
      const data = await response.json();
      alert('Quest approved and created successfully!');
      router.push(`/quests/${data.questId}`);
    } catch (err) {
      alert(`Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleRegenerate = () => {
    setGeneratedQuest(null);
    setContentId(null);
    handleSubmit({ preventDefault: () => {} });
  };

  return (
    <MainLayout>
      <div className="container mx-auto p-4">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Generate Quest with AI</h1>
          <button
            onClick={() => router.push('/admin/content?type=quests')}
            className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
          >
            Back to Quests
          </button>
        </div>
        
        {!generatedQuest ? (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-lg font-semibold mb-4">Quest Generation Parameters</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Difficulty Level</label>
                  <select
                    name="difficulty"
                    value={formData.difficulty}
                    onChange={handleInputChange}
                    className="w-full p-2 border rounded"
                  >
                    <option value="beginner">Beginner</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="advanced">Advanced</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                  <input
                    type="text"
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    className="w-full p-2 border rounded"
                    placeholder="e.g. Programming, Mathematics, History"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Points Required</label>
                  <input
                    type="number"
                    name="pointsRequired"
                    value={formData.pointsRequired}
                    onChange={handleInputChange}
                    className="w-full p-2 border rounded"
                    min="0"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Points Reward</label>
                  <input
                    type="number"
                    name="pointsReward"
                    value={formData.pointsReward}
                    onChange={handleInputChange}
                    className="w-full p-2 border rounded"
                    min="0"
                  />
                </div>
              </div>
              <button
                type="submit"
                disabled={loading}
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:bg-gray-400"
              >
                {loading ? 'Generating...' : 'Generate Quest'}
              </button>
            </form>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-lg font-semibold mb-4">Generated Quest</h2>
              <div className="mb-4">
                <h3 className="font-semibold text-xl mb-2">{generatedQuest.title}</h3>
                <p className="text-gray-700 mb-4">{generatedQuest.description}</p>
                
                <div className="mb-4">
                  <h4 className="font-semibold mb-2">Conditions:</h4>
                  <ul className="space-y-2 pl-5 list-disc">
                    {generatedQuest.conditions.map((condition, index) => (
                      <li key={index}>{condition.description}</li>
                    ))}
                  </ul>
                </div>
                
                <div className="flex items-center text-gray-700">
                  <span className="font-semibold mr-2">Estimated completion time:</span>
                  <span>{generatedQuest.estimated_completion_time} minutes</span>
                </div>
              </div>
              
              <div className="flex space-x-3">
                <button
                  onClick={handleApprove}
                  disabled={loading}
                  className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:bg-gray-400"
                >
                  {loading ? 'Processing...' : 'Approve & Create'}
                </button>
                <button
                  onClick={handleRegenerate}
                  disabled={loading}
                  className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:bg-gray-400"
                >
                  {loading ? 'Processing...' : 'Regenerate'}
                </button>
                <button
                  onClick={() => {
                    setGeneratedQuest(null);
                    setContentId(null);
                  }}
                  className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
                >
                  Discard & Start Over
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
}