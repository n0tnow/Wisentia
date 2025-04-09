// src/app/admin/generate-quiz/page.jsx
"use client";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import MainLayout from '@/components/layout/MainLayout';
import { useAuth } from '@/contexts/AuthContext';

export default function GenerateQuizPage() {
  const [courseVideos, setCourseVideos] = useState([]);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [formData, setFormData] = useState({
    numQuestions: 5,
    difficulty: 'intermediate',
    videoContent: '',
  });
  
  const [generatedQuiz, setGeneratedQuiz] = useState(null);
  const [loading, setLoading] = useState(false);
  const [contentId, setContentId] = useState(null);
  const [loadingVideos, setLoadingVideos] = useState(true);
  
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Admin kontrolü
    if (user && user.role !== 'admin') {
      router.push('/');
      return;
    }

    // Fetch available videos
    const fetchVideos = async () => {
      try {
        setLoadingVideos(true);
        const response = await fetch('/api/admin/courses/videos');
        if (!response.ok) {
          throw new Error('Failed to fetch videos');
        }
        
        const data = await response.json();
        setCourseVideos(data);
      } catch (err) {
        console.error('Error loading videos:', err);
      } finally {
        setLoadingVideos(false);
      }
    };

    fetchVideos();
  }, [user, router]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: name === 'numQuestions' ? parseInt(value) : value
    });
  };

  const handleVideoSelect = (e) => {
    const videoId = parseInt(e.target.value);
    const video = courseVideos.find(v => v.VideoID === videoId);
    setSelectedVideo(video);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!selectedVideo) {
      alert('Please select a video first');
      return;
    }
    
    try {
      setLoading(true);
      const response = await fetch('/api/ai/admin/generate-quiz', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          videoId: selectedVideo.VideoID,
          videoTitle: selectedVideo.Title,
          videoContent: formData.videoContent,
          numQuestions: formData.numQuestions,
          difficulty: formData.difficulty
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to generate quiz');
      }
      
      const data = await response.json();
      setGeneratedQuiz(data.quiz);
      setContentId(data.contentId);
    } catch (err) {
      alert(`Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async () => {
    if (!contentId || !selectedVideo) return;
    
    try {
      setLoading(true);
      const response = await fetch(`/api/ai/admin/approve-quiz/${contentId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          videoId: selectedVideo.VideoID,
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to approve quiz');
      }
      
      const data = await response.json();
      alert('Quiz approved and created successfully!');
      
      // Quiz sayfasına yönlendir
      router.push(`/courses/${selectedVideo.CourseID}/videos/${selectedVideo.VideoID}`);
    } catch (err) {
      alert(`Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleRegenerate = () => {
    setGeneratedQuiz(null);
    setContentId(null);
    handleSubmit({ preventDefault: () => {} });
  };

  return (
    <MainLayout>
      <div className="container mx-auto p-4">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Generate Quiz with AI</h1>
          <button
            onClick={() => router.push('/admin/content?type=courses')}
            className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
          >
            Back to Courses
          </button>
        </div>
        
        {!generatedQuiz ? (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-lg font-semibold mb-4">Quiz Generation Parameters</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Select Video*</label>
                {loadingVideos ? (
                  <p>Loading videos...</p>
                ) : (
                  <select
                    value={selectedVideo?.VideoID || ''}
                    onChange={handleVideoSelect}
                    className="w-full p-2 border rounded"
                    required
                  >
                    <option value="">-- Select a video --</option>
                    {courseVideos.map(video => (
                      <option key={video.VideoID} value={video.VideoID}>
                        {video.Title} (Course: {video.CourseTitle})
                      </option>
                    ))}
                  </select>
                )}
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Number of Questions</label>
                  <input
                    type="number"
                    name="numQuestions"
                    value={formData.numQuestions}
                    onChange={handleInputChange}
                    className="w-full p-2 border rounded"
                    min="3"
                    max="15"
                  />
                </div>
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
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Video Content/Transcript (optional)
                </label>
                <textarea
                  name="videoContent"
                  value={formData.videoContent}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded"
                  rows="6"
                  placeholder="Paste video transcript or content details here to improve quiz generation"
                ></textarea>
              </div>
              
              <button
                type="submit"
                disabled={loading || !selectedVideo}
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:bg-gray-400"
              >
                {loading ? 'Generating...' : 'Generate Quiz'}
              </button>
            </form>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-lg font-semibold mb-4">Generated Quiz</h2>
              <div className="mb-4">
                <h3 className="font-semibold text-xl mb-2">{generatedQuiz.title}</h3>
                <p className="text-gray-700 mb-4">{generatedQuiz.description}</p>
                <div className="mb-4">
                  <span className="font-semibold">Passing Score:</span> {generatedQuiz.passing_score}%
                </div>
                
                <div className="mb-6">
                  <h4 className="font-semibold mb-3">Questions:</h4>
                  <div className="space-y-6">
                    {generatedQuiz.questions.map((question, index) => (
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
                    setGeneratedQuiz(null);
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