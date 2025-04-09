// src/app/admin/content/page.jsx
"use client";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import MainLayout from '@/components/layout/MainLayout';
import { useAuth } from '@/contexts/AuthContext';

export default function ContentManagementPage() {
  const [contentType, setContentType] = useState('courses');
  const [items, setItems] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [totalPages, setTotalPages] = useState(1);
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

    const fetchContent = async () => {
      try {
        setLoading(true);
        const queryParams = new URLSearchParams({
          type: contentType,
          page,
          pageSize,
        });

        const response = await fetch(`/api/admin/content?${queryParams.toString()}`);
        if (!response.ok) {
          throw new Error('Failed to fetch content');
        }

        const data = await response.json();
        setItems(data.items);
        setTotalCount(data.totalCount);
        setTotalPages(data.totalPages);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (user && user.role === 'admin') {
      fetchContent();
    }
  }, [user, router, contentType, page, pageSize]);

  const handleCreateCourse = () => {
    router.push('/admin/courses/create');
  };

  const handleCreateQuest = () => {
    router.push('/admin/quests/create');
  };

  const handleCreateNFT = () => {
    router.push('/admin/nfts/create');
  };

  const handleToggleActive = async (id, isActive) => {
    try {
      let endpoint = '';
      switch (contentType) {
        case 'courses':
          endpoint = `/api/courses/${id}`;
          break;
        case 'quests':
          endpoint = `/api/quests/${id}`;
          break;
        case 'nfts':
          endpoint = `/api/nfts/${id}`;
          break;
        default:
          return;
      }

      const response = await fetch(endpoint, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          isActive: !isActive,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update item');
      }

      // İçerik listesini güncelle
      setItems(items.map(item => 
        item.CourseID === id || item.QuestID === id || item.NFTID === id
          ? { ...item, IsActive: !isActive }
          : item
      ));
    } catch (err) {
      alert(`Error: ${err.message}`);
    }
  };

  const handleViewItem = (id) => {
    switch (contentType) {
      case 'courses':
        router.push(`/courses/${id}`);
        break;
      case 'quests':
        router.push(`/quests/${id}`);
        break;
      case 'nfts':
        router.push(`/nfts/${id}`);
        break;
      default:
        break;
    }
  };

  if (loading && items.length === 0) return (
    <MainLayout>
      <div className="container mx-auto p-4">
        <p>Loading content...</p>
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
          <h1 className="text-2xl font-bold">Content Management</h1>
          <div className="space-x-2">
            {contentType === 'courses' && (
              <button
                onClick={handleCreateCourse}
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
              >
                Create Course
              </button>
            )}
            {contentType === 'quests' && (
              <button
                onClick={handleCreateQuest}
                className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
              >
                Create Quest
              </button>
            )}
            {contentType === 'nfts' && (
              <button
                onClick={handleCreateNFT}
                className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700"
              >
                Create NFT
              </button>
            )}
          </div>
        </div>

        {/* Content Type Tabs */}
        <div className="mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex">
              <button
                onClick={() => setContentType('courses')}
                className={`py-2 px-4 border-b-2 font-medium text-sm ${
                  contentType === 'courses'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Courses
              </button>
              <button
                onClick={() => setContentType('quests')}
                className={`py-2 px-4 border-b-2 font-medium text-sm ${
                  contentType === 'quests'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Quests
              </button>
              <button
                onClick={() => setContentType('nfts')}
                className={`py-2 px-4 border-b-2 font-medium text-sm ${
                  contentType === 'nfts'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                NFTs
              </button>
            </nav>
          </div>
        </div>

        {/* Content Table */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            {contentType === 'courses' && (
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Difficulty</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Enrolled</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {items.map((course) => (
                    <tr key={course.CourseID}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          {course.ThumbnailURL ? (
                            <img 
                              src={course.ThumbnailURL} 
                              alt={course.Title} 
                              className="h-10 w-10 rounded object-cover mr-2"
                            />
                          ) : (
                            <div className="h-10 w-10 rounded bg-gray-200 mr-2 flex items-center justify-center">
                              <span className="text-gray-500">{course.Title[0]}</span>
                            </div>
                          )}
                          <span className="truncate max-w-xs">{course.Title}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">{course.Category}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{course.Difficulty}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {new Date(course.CreationDate).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          course.IsActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {course.IsActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">{course.EnrolledUsers || 0}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => handleViewItem(course.CourseID)}
                          className="text-blue-600 hover:text-blue-900 mr-3"
                        >
                          View
                        </button>
                        <button
                          onClick={() => handleToggleActive(course.CourseID, course.IsActive)}
                          className={`${course.IsActive ? 'text-red-600 hover:text-red-900' : 'text-green-600 hover:text-green-900'}`}
                        >
                          {course.IsActive ? 'Deactivate' : 'Activate'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {contentType === 'quests' && (
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Difficulty</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Points</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">AI Generated</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {items.map((quest) => (
                    <tr key={quest.QuestID}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="truncate max-w-xs">{quest.Title}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">{quest.DifficultyLevel}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{quest.RewardPoints}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {new Date(quest.CreationDate).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          quest.IsActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {quest.IsActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {quest.IsAIGenerated ? 'Yes' : 'No'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => handleViewItem(quest.QuestID)}
                          className="text-blue-600 hover:text-blue-900 mr-3"
                        >
                          View
                        </button>
                        <button
                          onClick={() => handleToggleActive(quest.QuestID, quest.IsActive)}
                          className={`${quest.IsActive ? 'text-red-600 hover:text-red-900' : 'text-green-600 hover:text-green-900'}`}
                        >
                          {quest.IsActive ? 'Deactivate' : 'Activate'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {contentType === 'nfts' && (
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Value</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Subscription</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Owned</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {items.map((nft) => (
                    <tr key={nft.NFTID}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="truncate max-w-xs">{nft.Title}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">{nft.NFTType}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{nft.TradeValue}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {nft.SubscriptionDays ? `${nft.SubscriptionDays} days` : 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          nft.IsActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {nft.IsActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">{nft.OwnedCount || 0}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => handleViewItem(nft.NFTID)}
                          className="text-blue-600 hover:text-blue-900 mr-3"
                        >
                          View
                        </button>
                        <button
                          onClick={() => handleToggleActive(nft.NFTID, nft.IsActive)}
                          className={`${nft.IsActive ? 'text-red-600 hover:text-red-900' : 'text-green-600 hover:text-green-900'}`}
                        >
                          {nft.IsActive ? 'Deactivate' : 'Activate'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
          
          {/* Pagination */}
          {totalPages > 1 && (
            <div className="px-6 py-3 flex items-center justify-between border-t">
              <div>
                <p className="text-sm text-gray-700">
                  Showing <span className="font-medium">{(page - 1) * pageSize + 1}</span> to <span className="font-medium">{Math.min(page * pageSize, totalCount)}</span> of{' '}
                  <span className="font-medium">{totalCount}</span> items
                </p>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-3 py-1 border rounded bg-white text-gray-500 disabled:opacity-50"
                >
                  Previous
                </button>
                <button
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="px-3 py-1 border rounded bg-white text-gray-500 disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
}