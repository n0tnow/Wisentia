// src/app/search/advanced/page.jsx
"use client";
import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import MainLayout from '@/components/layout/MainLayout';

function AdvancedSearchPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [contentType, setContentType] = useState('all');
  const [category, setCategory] = useState('');
  const [difficulty, setDifficulty] = useState('');
  const [sortBy, setSortBy] = useState('relevance');
  
  const [results, setResults] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [categories, setCategories] = useState([]);
  
  useEffect(() => {
    // Parse search parameters from URL
    const query = searchParams.get('q') || '';
    const type = searchParams.get('type') || 'all';
    const cat = searchParams.get('category') || '';
    const diff = searchParams.get('difficulty') || '';
    const sort = searchParams.get('sort_by') || 'relevance';
    
    setSearchQuery(query);
    setContentType(type);
    setCategory(cat);
    setDifficulty(diff);
    setSortBy(sort);
    
    // Fetch categories for dropdown
    const fetchCategories = async () => {
      try {
        const coursesResponse = await fetch('/api/courses/categories');
        
        if (coursesResponse.ok) {
          const coursesData = await coursesResponse.json();
          setCategories(coursesData);
        }
      } catch (err) {
        console.error('Failed to fetch categories:', err);
      }
    };
    
    fetchCategories();
    
    // If there's a query, perform search
    if (query) {
      performSearch(query, type, cat, diff, sort);
    }
  }, [searchParams]);
  
  const performSearch = async (query, type, category, difficulty, sortBy) => {
    try {
      setLoading(true);
      setError(null);
      
      const params = new URLSearchParams();
      if (query) params.append('q', query);
      if (type && type !== 'all') params.append('type', type);
      if (category) params.append('category', category);
      if (difficulty) params.append('difficulty', difficulty);
      if (sortBy) params.append('sort_by', sortBy);
      
      const response = await fetch(`/api/search/advanced?${params.toString()}`);
      
      if (!response.ok) {
        throw new Error('Search failed');
      }
      
      const data = await response.json();
      setResults(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  
  const handleSearch = (e) => {
    e.preventDefault();
    
    // Update URL with search parameters
    const params = new URLSearchParams();
    if (searchQuery) params.append('q', searchQuery);
    if (contentType !== 'all') params.append('type', contentType);
    if (category) params.append('category', category);
    if (difficulty) params.append('difficulty', difficulty);
    if (sortBy !== 'relevance') params.append('sort_by', sortBy);
    
    router.push(`/search/advanced?${params.toString()}`);
    
    // Perform search
    performSearch(searchQuery, contentType, category, difficulty, sortBy);
  };
  
  const handleClearFilters = () => {
    setSearchQuery('');
    setContentType('all');
    setCategory('');
    setDifficulty('');
    setSortBy('relevance');
    setResults({});
    
    router.push('/search/advanced');
  };

  return (
    <MainLayout>
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-6">Advanced Search</h1>
        
        {/* Search Form */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <form onSubmit={handleSearch} className="space-y-4">
            <div className="flex items-center space-x-2">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search..."
                className="flex-1 p-2 border rounded"
              />
              <button
                type="submit"
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
              >
                Search
              </button>
              <button
                type="button"
                onClick={handleClearFilters}
                className="bg-gray-200 text-gray-800 px-4 py-2 rounded hover:bg-gray-300"
              >
                Clear
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Content Type</label>
                <select
                  value={contentType}
                  onChange={(e) => setContentType(e.target.value)}
                  className="w-full p-2 border rounded"
                >
                  <option value="all">All Content</option>
                  <option value="courses">Courses</option>
                  <option value="quests">Quests</option>
                  <option value="nfts">NFTs</option>
                  <option value="community">Community Posts</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full p-2 border rounded"
                >
                  <option value="">All Categories</option>
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Difficulty</label>
                <select
                  value={difficulty}
                  onChange={(e) => setDifficulty(e.target.value)}
                  className="w-full p-2 border rounded"
                >
                  <option value="">All Difficulties</option>
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Sort By</label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full p-2 border rounded"
                >
                  <option value="relevance">Relevance</option>
                  <option value="date">Date (Newest First)</option>
                  <option value="popularity">Popularity</option>
                </select>
              </div>
            </div>
          </form>
        </div>
        
        {/* Search Results */}
        {loading ? (
          <div className="text-center p-4">
            <p>Searching...</p>
          </div>
        ) : error ? (
          <div className="bg-red-100 text-red-700 p-4 rounded mb-6">
            <p>Error: {error}</p>
          </div>
        ) : (
          <div>
            {Object.keys(results).length === 0 ? (
              searchQuery ? (
                <div className="bg-white rounded-lg shadow-md p-6 text-center">
                  <p className="text-gray-500">No results found. Try different search terms or filters.</p>
                </div>
              ) : null
            ) : (
              <div className="space-y-6">
                {/* Course Results */}
                {results.courses && results.courses.length > 0 && (
                  <div className="bg-white rounded-lg shadow-md p-6">
                    <h2 className="text-xl font-semibold mb-4">Courses ({results.courses.length})</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {results.courses.map((course) => (
                        <div key={course.CourseID} className="border rounded overflow-hidden">
                          {course.ThumbnailURL ? (
                            <img 
                              src={course.ThumbnailURL} 
                              alt={course.Title} 
                              className="w-full h-32 object-cover"
                            />
                          ) : (
                            <div className="w-full h-32 bg-gray-200 flex items-center justify-center">
                              <span className="text-gray-500">No image</span>
                            </div>
                          )}
                          <div className="p-4">
                            <h3 className="font-semibold mb-2 truncate">{course.Title}</h3>
                            <div className="flex justify-between text-sm text-gray-600 mb-2">
                              <span>{course.Category}</span>
                              <span>{course.Difficulty}</span>
                            </div>
                            <p className="text-gray-600 text-sm mb-3 line-clamp-2">{course.Description}</p>
                            <a 
                              href={`/courses/${course.CourseID}`}
                              className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                            >
                              View Course →
                            </a>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* Quest Results */}
                {results.quests && results.quests.length > 0 && (
                  <div className="bg-white rounded-lg shadow-md p-6">
                    <h2 className="text-xl font-semibold mb-4">Quests ({results.quests.length})</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {results.quests.map((quest) => (
                        <div key={quest.QuestID} className="border rounded p-4">
                          <div className="flex justify-between items-start">
                            <h3 className="font-semibold mb-2">{quest.Title}</h3>
                            <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                              {quest.DifficultyLevel}
                            </span>
                          </div>
                          <p className="text-gray-600 text-sm mb-3 line-clamp-2">{quest.Description}</p>
                          <div className="flex justify-between items-center">
                            <div className="text-sm">
                              <span className="font-medium">Reward:</span> {quest.RewardPoints} points
                            </div>
                            <a 
                              href={`/quests/${quest.QuestID}`}
                              className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                            >
                              View Quest →
                            </a>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* NFT Results */}
                {results.nfts && results.nfts.length > 0 && (
                  <div className="bg-white rounded-lg shadow-md p-6">
                    <h2 className="text-xl font-semibold mb-4">NFTs ({results.nfts.length})</h2>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      {results.nfts.map((nft) => (
                        <div key={nft.NFTID} className="border rounded overflow-hidden">
                          {nft.ImageURI ? (
                            <img 
                              src={nft.ImageURI} 
                              alt={nft.Title} 
                              className="w-full h-40 object-cover"
                            />
                          ) : (
                            <div className="w-full h-40 bg-gray-200 flex items-center justify-center">
                              <span className="text-gray-500">No image</span>
                            </div>
                          )}
                          <div className="p-4">
                            <div className="flex justify-between items-start mb-2">
                              <h3 className="font-semibold truncate">{nft.Title}</h3>
                              <span className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded-full">
                                {nft.NFTType}
                              </span>
                            </div>
                            <p className="text-gray-600 text-sm mb-3">Value: {nft.TradeValue}</p>
                            <a 
                              href={`/nfts/${nft.NFTID}`}
                              className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                            >
                              View NFT →
                            </a>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* Community Results */}
                {results.community && results.community.length > 0 && (
                  <div className="bg-white rounded-lg shadow-md p-6">
                    <h2 className="text-xl font-semibold mb-4">Community Posts ({results.community.length})</h2>
                    <div className="space-y-4">
                      {results.community.map((post) => (
                        <div key={post.PostID} className="border rounded p-4">
                          <div className="flex justify-between items-start mb-2">
                            <h3 className="font-semibold">{post.Title}</h3>
                            <span className="px-2 py-1 bg-gray-100 text-gray-800 text-xs rounded-full">
                              {post.Category}
                            </span>
                          </div>
                          <p className="text-gray-600 text-sm mb-3 line-clamp-2">{post.Content}</p>
                          <div className="flex justify-between items-center text-sm text-gray-500">
                            <div>
                              <span>By {post.Username}</span> • 
                              <span className="ml-1">{new Date(post.CreationDate).toLocaleDateString()}</span>
                            </div>
                            <div>
                              <span className="mr-3">{post.Likes} likes</span>
                              <span>{post.CommentCount} comments</span>
                            </div>
                          </div>
                          <div className="mt-3">
                            <a 
                              href={`/community/${post.PostID}`}
                              className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                            >
                              View Post →
                            </a>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </MainLayout>
  );
}

export default function AdvancedSearchPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <AdvancedSearchPageContent />
    </Suspense>
  );
}