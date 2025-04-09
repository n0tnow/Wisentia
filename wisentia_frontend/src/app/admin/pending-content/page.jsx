// src/app/admin/pending-content/page.jsx
"use client";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import MainLayout from '@/components/layout/MainLayout';
import { useAuth } from '@/contexts/AuthContext';

export default function PendingContentPage() {
  const [pendingContent, setPendingContent] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedContent, setSelectedContent] = useState(null);
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Admin kontrolü
    if (user && user.role !== 'admin') {
      router.push('/');
      return;
    }

    const fetchPendingContent = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/ai/admin/pending-content');
        if (!response.ok) {
          throw new Error('Failed to fetch pending content');
        }
        
        const data = await response.json();
        setPendingContent(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (user && user.role === 'admin') {
      fetchPendingContent();
    }
  }, [user, router]);

  const handleApproveQuest = async (contentId) => {
    const content = pendingContent.find(item => item.ContentID === contentId);
    if (!content || content.ContentType !== 'quest') return;
    
    try {
      const response = await fetch(`/api/ai/admin/approve-quest/${contentId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          requiredPoints: 50,
          rewardPoints: 100,
          difficultyLevel: 'intermediate',
          conditionType: 'total_points',
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to approve quest');
      }
      
      const data = await response.json();
      alert('Quest approved and created successfully!');
      
      // Yenile
      setPendingContent(pendingContent.filter(item => item.ContentID !== contentId));
    } catch (err) {
      alert(`Error: ${err.message}`);
    }
  };

  const handleApproveQuiz = async (contentId) => {
    const content = pendingContent.find(item => item.ContentID === contentId);
    if (!content || content.ContentType !== 'quiz') return;
    
    try {
      const videoId = content.GenerationParams.video_id;
      const response = await fetch(`/api/ai/admin/approve-quiz/${contentId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          videoId: videoId,
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to approve quiz');
      }
      
      const data = await response.json();
      alert('Quiz approved and created successfully!');
      
      // Yenile
      setPendingContent(pendingContent.filter(item => item.ContentID !== contentId));
    } catch (err) {
      alert(`Error: ${err.message}`);
    }
  };

  const handleReject = async (contentId) => {
    // İçeriği silmek yerine sadece UI'dan kaldıralım
    setPendingContent(pendingContent.filter(item => item.ContentID !== contentId));
    setSelectedContent(null);
  };

  const handleViewContent = (content) => {
    setSelectedContent(content);
  };

  const handleBack = () => {
    setSelectedContent(null);
  };

  if (loading) return (
    <MainLayout>
      <div className="container mx-auto p-4">
        <p>Loading pending content...</p>
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
          <h1 className="text-2xl font-bold">
            {selectedContent ? 'Content Details' : 'Pending AI Generated Content'}
          </h1>
          {selectedContent && (
            <button
              onClick={handleBack}
              className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
            >
              Back to List
            </button>
          )}
        </div>
        
        {selectedContent ? (
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="mb-6">
              <span className="inline-block px-2 py-1 text-xs font-semibold rounded-full mr-2 uppercase bg-blue-100 text-blue-800">
                {selectedContent.ContentType}
              </span>
              <span className="text-gray-500 text-sm">
                Created on {new Date(selectedContent.CreationDate).toLocaleString()}
              </span>
            </div>
            
            <div className="mb-6">
              <h2 className="text-lg font-semibold mb-2">Content</h2>
              {selectedContent.ContentType === 'quest' && (
                <div>
                  <h3 className="font-semibold text-xl mb-2">{selectedContent.Content.title}</h3>
                  <p className="text-gray-700 mb-4">{selectedContent.Content.description}</p>
                  
                  <div className="mb-4">
                    <h4 className="font-semibold mb-2">Conditions:</h4>
                    <ul className="space-y-2 pl-5 list-disc">
                      {selectedContent.Content.conditions.map((condition, index) => (
                        <li key={index}>{condition.description}</li>
                      ))}
                    </ul>
                  </div>
                  
                  <div className="flex items-center text-gray-700">
                    <span className="font-semibold mr-2">Estimated completion time:</span>
                    <span>{selectedContent.Content.estimated_completion_time} minutes</span>
                  </div>
                </div>
              )}
              
              {selectedContent.ContentType === 'quiz' && (
                <div>
                  <h3 className="font-semibold text-xl mb-2">{selectedContent.Content.title}</h3>
                  <p className="text-gray-700 mb-4">{selectedContent.Content.description}</p>
                  <div className="mb-4">
                    <span className="font-semibold">Passing Score:</span> {selectedContent.Content.passing_score}%
                  </div>
                  
                  <div className="mb-6">
                    <h4 className="font-semibold mb-3">Questions:</h4>
                    <div className="space-y-6">
                      {selectedContent.Content.questions.map((question, index) => (
                        <div key={index} className="border p-3 rounded">
                          <p className="font-medium mb-2">
                            {index + 1}. {question.question_text}
                          </p>
                          <ul className="pl-5 space-y-1">
                            {question.options.map((option, optIdx) => (
                              <li key={optIdx} className={option.is_correct ? 'text-green-600 font-medium' : ''}>
                                {String.fromCharCode(97 + optIdx)}) {option.text}
                                {option.is_correct && ' ✓'}
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            <div className="mb-6">
              <h2 className="text-lg font-semibold mb-2">Generation Parameters</h2>
              <pre className="bg-gray-100 p-3 rounded overflow-x-auto text-sm">
                {JSON.stringify(selectedContent.GenerationParams, null, 2)}
              </pre>
            </div>
            
            <div className="flex space-x-3">
              {selectedContent.ContentType === 'quest' && (
                <button
                  onClick={() => handleApproveQuest(selectedContent.ContentID)}
                  className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                >
                  Approve Quest
                </button>
              )}
              
              {selectedContent.ContentType === 'quiz' && (
                <button
                  onClick={() => handleApproveQuiz(selectedContent.ContentID)}
                  className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                >
                  Approve Quiz
                </button>
              )}
              
              <button
                onClick={() => handleReject(selectedContent.ContentID)}
                className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
              >
                Reject
              </button>
            </div>
          </div>
        ) : (
          <div>
            {pendingContent.length === 0 ? (
              <div className="bg-white rounded-lg shadow-md p-6 text-center">
                <p className="text-gray-500">No pending content to review</p>
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Content Preview</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {pendingContent.map((content) => (
                      <tr key={content.ContentID}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                            {content.ContentType}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm font-medium text-gray-900 truncate max-w-md">
                            {content.ContentType === 'quest' ? content.Content.title :
                             content.ContentType === 'quiz' ? content.Content.title : 
                             'Unknown content type'}
                          </div>
                          <div className="text-sm text-gray-500 truncate max-w-md">
                            {content.ContentType === 'quest' ? content.Content.description.substring(0, 100) + '...' :
                             content.ContentType === 'quiz' ? `${content.Content.questions.length} questions` : 
                             ''}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(content.CreationDate).toLocaleString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <button
                            onClick={() => handleViewContent(content)}
                            className="text-blue-600 hover:text-blue-900 mr-3"
                          >
                            View
                          </button>
                          {content.ContentType === 'quest' && (
                            <button
                              onClick={() => handleApproveQuest(content.ContentID)}
                              className="text-green-600 hover:text-green-900 mr-3"
                            >
                              Approve
                            </button>
                          )}
                          {content.ContentType === 'quiz' && (
                            <button
                              onClick={() => handleApproveQuiz(content.ContentID)}
                              className="text-green-600 hover:text-green-900 mr-3"
                            >
                              Approve
                            </button>
                          )}
                          <button
                            onClick={() => handleReject(content.ContentID)}
                            className="text-red-600 hover:text-red-900"
                          >
                            Reject
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </MainLayout>
  );
}