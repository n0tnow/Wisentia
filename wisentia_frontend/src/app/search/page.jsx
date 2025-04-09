'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import axios from 'axios';
import Link from 'next/link';
import Image from 'next/image';

export default function SearchPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const q = searchParams.get('q') || '';
  const category = searchParams.get('category') || '';
  const type = searchParams.get('type') || '';
  const difficulty = searchParams.get('difficulty') || '';
  
  const [searchTerm, setSearchTerm] = useState(q);
  const [searchResults, setSearchResults] = useState({
    courses: [],
    quests: [],
    community: [],
    nfts: []
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const [filters, setFilters] = useState({
    category: category,
    type: type,
    difficulty: difficulty
  });
  
  const contentTypes = [
    { value: '', label: 'All' },
    { value: 'courses', label: 'Courses' },
    { value: 'quests', label: 'Quests' },
    { value: 'community', label: 'Community' },
    { value: 'nfts', label: 'NFTs' }
  ];
  
  const difficulties = [
    { value: '', label: 'All' },
    { value: 'beginner', label: 'Beginner' },
    { value: 'intermediate', label: 'Intermediate' },
    { value: 'advanced', label: 'Advanced' }
  ];
  
  // Perform search when URL parameters change
  useEffect(() => {
    setSearchTerm(q);
    
    setFilters({
      category: category,
      type: type,
      difficulty: difficulty
    });
    
    if (q) {
      performSearch();
    }
  }, [q, category, type, difficulty]);
  
  const performSearch = async () => {
    if (!searchTerm.trim()) return;
    
    const queryParams = new URLSearchParams();
    queryParams.append('q', searchTerm);
    
    if (filters.category) {
      queryParams.append('category', filters.category);
    }
    
    if (filters.difficulty) {
      queryParams.append('difficulty', filters.difficulty);
    }
    
    let endpoint = '/api/search/';
    if (filters.type) {
      endpoint = `/api/search/${filters.type}/`;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await axios.get(`${endpoint}?${queryParams.toString()}`);
      
      if (filters.type) {
        // Single content type search
        const resultsByType = {
          courses: [],
          quests: [],
          community: [],
          nfts: []
        };
        resultsByType[filters.type] = response.data;
        setSearchResults(resultsByType);
      } else {
        // General search
        setSearchResults(response.data);
      }
      
      setLoading(false);
    } catch (err) {
      setError('Error performing search.');
      setLoading(false);
      console.error('Search error:', err);
    }
  };
  
  const handleSearch = (e) => {
    e.preventDefault();
    
    const queryParams = new URLSearchParams();
    queryParams.append('q', searchTerm);
    
    if (filters.category) {
      queryParams.append('category', filters.category);
    }
    
    if (filters.type) {
      queryParams.append('type', filters.type);
    }
    
    if (filters.difficulty) {
      queryParams.append('difficulty', filters.difficulty);
    }
    
    router.push(`/search?${queryParams.toString()}`);
  };
  
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  return (
    <div className="container mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold mb-6">Search</h1>
      
      {/* Search Form */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <form onSubmit={handleSearch}>
          <div className="flex flex-col md:flex-row md:space-x-4 space-y-4 md:space-y-0">
            <div className="flex-grow">
              <input 
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search for courses, quests, community posts, or NFTs..."
                className="w-full p-2 border border-gray-300 rounded"
                required
              />
            </div>
            
            <button 
              type="submit"
              className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Search
            </button>
          </div>
          
          <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-gray-700 mb-2" htmlFor="type">
                Content Type
              </label>
              <select 
                id="type"
                name="type"
                value={filters.type}
                onChange={handleFilterChange}
                className="w-full p-2 border border-gray-300 rounded"
              >
                {contentTypes.map(type => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-gray-700 mb-2" htmlFor="category">
                Category
              </label>
              <input 
                type="text"
                id="category"
                name="category"
                value={filters.category}
                onChange={handleFilterChange}
                placeholder="Category"
                className="w-full p-2 border border-gray-300 rounded"
              />
            </div>
            
            <div>
              <label className="block text-gray-700 mb-2" htmlFor="difficulty">
                Difficulty Level
              </label>
              <select 
                id="difficulty"
                name="difficulty"
                value={filters.difficulty}
                onChange={handleFilterChange}
                className="w-full p-2 border border-gray-300 rounded"
              >
                {difficulties.map(difficulty => (
                  <option key={difficulty.value} value={difficulty.value}>
                    {difficulty.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </form>
      </div>
      
      {/* Search Results */}
      {loading ? (
        <div className="flex justify-center items-center py-12">
          <p>Searching...</p>
        </div>
      ) : error ? (
        <div className="flex justify-center items-center py-12">
          <p className="text-red-600">{error}</p>
        </div>
      ) : searchTerm ? (
        <div>
          {/* Courses */}
          {(!filters.type || filters.type === 'courses') && searchResults.courses.length > 0 && (
            <div className="mb-8">
              <h2 className="text-xl font-semibold mb-4">Courses</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {searchResults.courses.map(course => (
                  <div key={course.CourseID} className="bg-white rounded-lg shadow overflow-hidden">
                    <div className="h-40 bg-gray-200 relative">
                      {course.ThumbnailURL ? (
                        <Image 
                          src={course.ThumbnailURL} 
                          alt={course.Title}
                          layout="fill"
                          objectFit="cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gray-200 text-gray-500">
                          No Image
                        </div>
                      )}
                    </div>
                    <div className="p-4">
                      <h3 className="font-semibold mb-2">{course.Title}</h3>
                      <p className="text-sm text-gray-600 mb-2">{course.Description?.substring(0, 100)}...</p>
                      
                      <div className="flex justify-between items-center">
                        <div>
                          <span className="inline-block px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded">
                            {course.Category}
                          </span>
                          <span className="inline-block ml-2 px-2 py-1 text-xs bg-gray-100 text-gray-800 rounded">
                            {course.Difficulty}
                          </span>
                        </div>
                        
                        <Link 
                          href={`/courses/${course.CourseID}`}
                          className="text-blue-600 hover:underline text-sm"
                        >
                          Details
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              {filters.type !== 'courses' && (
                <div className="mt-4 text-right">
                  <Link 
                    href={`/search?q=${searchTerm}&type=courses`}
                    className="text-blue-600 hover:underline"
                  >
                    View all course results
                  </Link>
                </div>
              )}
            </div>
          )}
          
          {/* Quests */}
          {(!filters.type || filters.type === 'quests') && searchResults.quests.length > 0 && (
            <div className="mb-8">
              <h2 className="text-xl font-semibold mb-4">Quests</h2>
              <div className="space-y-4">
                {searchResults.quests.map(quest => (
                  <div key={quest.QuestID} className="bg-white rounded-lg shadow p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-semibold mb-2">{quest.Title}</h3>
                        <p className="text-sm text-gray-600 mb-2">{quest.Description?.substring(0, 150)}...</p>
                        
                        <div className="flex flex-wrap gap-2 mt-2">
                          <span className="inline-block px-2 py-1 text-xs bg-purple-100 text-purple-800 rounded">
                            {quest.DifficultyLevel}
                          </span>
                          <span className="inline-block px-2 py-1 text-xs bg-green-100 text-green-800 rounded">
                            {quest.RewardPoints} Points
                          </span>
                          {quest.RewardNFTTitle && (
                            <span className="inline-block px-2 py-1 text-xs bg-yellow-100 text-yellow-800 rounded">
                              NFT Reward
                            </span>
                          )}
                        </div>
                      </div>
                      
                      <Link 
                        href={`/quests/${quest.QuestID}`}
                        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
                      >
                        Start Quest
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
              
              {filters.type !== 'quests' && (
                <div className="mt-4 text-right">
                  <Link 
                    href={`/search?q=${searchTerm}&type=quests`}
                    className="text-blue-600 hover:underline"
                  >
                    View all quest results
                  </Link>
                </div>
              )}
            </div>
          )}
          
          {/* Community */}
          {(!filters.type || filters.type === 'community') && searchResults.community.length > 0 && (
            <div className="mb-8">
              <h2 className="text-xl font-semibold mb-4">Community Posts</h2>
              <div className="space-y-4">
                {searchResults.community.map(post => (
                  <div key={post.PostID} className="bg-white rounded-lg shadow p-4">
                    <div className="flex justify-between">
                      <div>
                        <h3 className="font-semibold mb-1">{post.Title}</h3>
                        <p className="text-xs text-gray-500 mb-2">
                          By {post.Username} on {new Date(post.CreationDate).toLocaleDateString()}
                        </p>
                      </div>
                      
                      <div>
                        <span className="inline-block px-2 py-1 text-xs bg-gray-100 text-gray-800 rounded">
                          {post.Category}
                        </span>
                      </div>
                    </div>
                    
                    <p className="text-sm text-gray-600 mb-2">{post.Content?.substring(0, 150)}...</p>
                    
                    <div className="flex justify-between items-center mt-4">
                      <div className="flex space-x-4 text-xs text-gray-500">
                        <span>{post.Likes} likes</span>
                        <span>{post.CommentCount} comments</span>
                        <span>{post.Views} views</span>
                      </div>
                      
                      <Link 
                        href={`/community/${post.PostID}`}
                        className="text-blue-600 hover:underline text-sm"
                      >
                        Read More
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
              
              {filters.type !== 'community' && (
                <div className="mt-4 text-right">
                  <Link 
                    href={`/search?q=${searchTerm}&type=community`}
                    className="text-blue-600 hover:underline"
                  >
                    View all community results
                  </Link>
                </div>
              )}
            </div>
          )}
          
          {/* NFTs */}
          {(!filters.type || filters.type === 'nfts') && searchResults.nfts.length > 0 && (
            <div className="mb-8">
              <h2 className="text-xl font-semibold mb-4">NFTs</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {searchResults.nfts.map(nft => (
                  <div key={nft.NFTID} className="bg-white rounded-lg shadow overflow-hidden">
                    <div className="h-40 bg-gray-200 relative">
                      {nft.ImageURI ? (
                        <Image 
                          src={nft.ImageURI} 
                          alt={nft.Title}
                          layout="fill"
                          objectFit="cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gray-200 text-gray-500">
                          NFT Image
                        </div>
                      )}
                    </div>
                    <div className="p-4">
                      <h3 className="font-semibold mb-1">{nft.Title}</h3>
                      <p className="text-xs text-gray-500 mb-2">{nft.NFTType}</p>
                      <p className="text-sm text-gray-600 mb-2">{nft.Description?.substring(0, 80)}...</p>
                      
                      <div className="mt-2">
                        <span className="text-blue-600 font-semibold">
                          Value: {nft.TradeValue} Points
                        </span>
                      </div>
                      
                      <Link 
                        href={`/nfts/${nft.NFTID}`}
                        className="mt-2 block text-center px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
                      >
                        View Details
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
              
              {filters.type !== 'nfts' && (
                <div className="mt-4 text-right">
                  <Link 
                    href={`/search?q=${searchTerm}&type=nfts`}
                    className="text-blue-600 hover:underline"
                  >
                    View all NFT results
                  </Link>
                </div>
              )}
            </div>
          )}
          
          {/* No Results */}
          {Object.values(searchResults).every(arr => arr.length === 0) && (
            <div className="bg-white rounded-lg shadow p-6 text-center">
              <h2 className="text-xl font-semibold mb-2">No results found</h2>
              <p className="text-gray-600">
                We couldn't find any results matching "{searchTerm}".
              </p>
              <p className="text-gray-600 mt-2">
                Try using different keywords or removing some filters.
              </p>
            </div>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow p-6 text-center">
          <h2 className="text-xl font-semibold mb-2">Enter a search term</h2>
          <p className="text-gray-600">
            Use the search bar above to find courses, quests, community posts, and NFTs.
          </p>
        </div>
      )}
    </div>
  );
}