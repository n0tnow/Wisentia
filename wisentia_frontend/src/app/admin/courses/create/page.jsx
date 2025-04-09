// src/app/admin/courses/create/page.jsx
"use client";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import MainLayout from '@/components/layout/MainLayout';
import { useAuth } from '@/contexts/AuthContext';

export default function CreateCoursePage() {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    difficulty: 'beginner',
    thumbnailUrl: '',
  });
  
  const [videos, setVideos] = useState([
    { title: '', description: '', youtubeVideoId: '', duration: '', orderInCourse: 1 }
  ]);
  
  const [loading, setLoading] = useState(false);
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
      [name]: value
    });
  };

  const handleVideoChange = (index, field, value) => {
    const updatedVideos = [...videos];
    updatedVideos[index][field] = value;
    setVideos(updatedVideos);
  };

  const addVideoField = () => {
    setVideos([
      ...videos,
      { 
        title: '', 
        description: '', 
        youtubeVideoId: '', 
        duration: '', 
        orderInCourse: videos.length + 1 
      }
    ]);
  };

  const removeVideoField = (index) => {
    if (videos.length <= 1) return;
    
    const updatedVideos = [...videos];
    updatedVideos.splice(index, 1);
    
    // Update orderInCourse for remaining videos
    updatedVideos.forEach((video, idx) => {
      video.orderInCourse = idx + 1;
    });
    
    setVideos(updatedVideos);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      
      // Create course
      const courseResponse = await fetch('/api/admin/courses/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
      
      if (!courseResponse.ok) {
        throw new Error('Failed to create course');
      }
      
      const courseData = await courseResponse.json();
      const courseId = courseData.courseId;
      
      // Add videos
      const videoPromises = videos.map(video => {
        return fetch('/api/admin/courses/videos/create', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            ...video,
            courseId
          }),
        });
      });
      
      await Promise.all(videoPromises);
      
      alert('Course created successfully!');
      router.push('/admin/content?type=courses');
    } catch (err) {
      alert(`Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <MainLayout>
      <div className="container mx-auto p-4">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Create New Course</h1>
          <button
            onClick={() => router.push('/admin/content?type=courses')}
            className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
          >
            Back to Courses
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Course Details */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-lg font-semibold mb-4">Course Details</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title*</label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category*</label>
                <input
                  type="text"
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Difficulty*</label>
                <select
                  name="difficulty"
                  value={formData.difficulty}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded"
                  required
                >
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Thumbnail URL</label>
                <input
                  type="text"
                  name="thumbnailUrl"
                  value={formData.thumbnailUrl}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded"
                  placeholder="https://example.com/image.jpg"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Description*</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded"
                  rows="4"
                  required
                ></textarea>
              </div>
            </div>
          </div>
          
          {/* Course Videos */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">Course Videos</h2>
              <button
                type="button"
                onClick={addVideoField}
                className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 text-sm"
              >
                Add Video
              </button>
            </div>
            
            {videos.map((video, index) => (
              <div key={index} className="border p-4 rounded mb-4">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="font-medium">Video {index + 1}</h3>
                  {videos.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeVideoField(index)}
                      className="text-red-600 hover:text-red-800 text-sm"
                    >
                      Remove
                    </button>
                  )}
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-2">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Title*</label>
                    <input
                      type="text"
                      value={video.title}
                      onChange={(e) => handleVideoChange(index, 'title', e.target.value)}
                      className="w-full p-2 border rounded"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">YouTube Video ID*</label>
                    <input
                      type="text"
                      value={video.youtubeVideoId}
                      onChange={(e) => handleVideoChange(index, 'youtubeVideoId', e.target.value)}
                      className="w-full p-2 border rounded"
                      placeholder="dQw4w9WgXcQ"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Duration (seconds)</label>
                    <input
                      type="number"
                      value={video.duration}
                      onChange={(e) => handleVideoChange(index, 'duration', e.target.value)}
                      className="w-full p-2 border rounded"
                      placeholder="300"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Order</label>
                    <input
                      type="number"
                      value={video.orderInCourse}
                      onChange={(e) => handleVideoChange(index, 'orderInCourse', parseInt(e.target.value))}
                      className="w-full p-2 border rounded"
                      min="1"
                      required
                      readOnly
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                    <textarea
                      value={video.description}
                      onChange={(e) => handleVideoChange(index, 'description', e.target.value)}
                      className="w-full p-2 border rounded"
                      rows="2"
                    ></textarea>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          <div className="flex space-x-3">
            <button
              type="submit"
              disabled={loading}
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:bg-gray-400"
            >
              {loading ? 'Creating...' : 'Create Course'}
            </button>
            <button
              type="button"
              onClick={() => router.push('/admin/content?type=courses')}
              className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </MainLayout>
  );
}