// src/app/quizzes/[quizId]/page.jsx
"use client";
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import MainLayout from '@/components/layout/MainLayout';
import { useAuth } from '@/contexts/AuthContext';

export default function QuizPage() {
  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [userAnswers, setUserAnswers] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [quizResult, setQuizResult] = useState(null);
  const { quizId } = useParams();
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    const fetchQuizDetails = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/quizzes/${quizId}`);
        if (!response.ok) {
          throw new Error('Failed to fetch quiz details');
        }
        
        const data = await response.json();
        setQuiz(data);
        
        // Check if user already completed this quiz
        if (data.attempts && data.attempts.length > 0) {
          const latestAttempt = data.attempts[0];
          if (latestAttempt.Passed) {
            setSubmitted(true);
            setQuizResult({
              attemptId: latestAttempt.AttemptID,
              score: latestAttempt.Score,
              maxScore: latestAttempt.MaxScore,
              scorePercentage: (latestAttempt.Score / latestAttempt.MaxScore) * 100,
              passed: latestAttempt.Passed,
              earnedPoints: latestAttempt.EarnedPoints,
            });
          }
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (quizId) {
      fetchQuizDetails();
    }
  }, [quizId, user]);

  const handleSelectOption = (questionId, optionId) => {
    setUserAnswers({
      ...userAnswers,
      [questionId]: optionId,
    });
  };

  const handleTextAnswer = (questionId, text) => {
    setUserAnswers({
      ...userAnswers,
      [questionId]: text,
    });
  };

  const handleNextQuestion = () => {
    if (currentQuestion < quiz.questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    }
  };

  const handlePrevQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const handleSubmitQuiz = async () => {
    if (!quiz) return;
    
    // Tüm soruların cevaplanıp cevaplanmadığını kontrol et
    const answeredQuestions = Object.keys(userAnswers).length;
    if (answeredQuestions < quiz.questions.length) {
      if (!confirm(`You've only answered ${answeredQuestions} out of ${quiz.questions.length} questions. Are you sure you want to submit?`)) {
        return;
      }
    }
    
    try {
      setIsSubmitting(true);
      
      // Cevapları formatla
      const formattedAnswers = Object.entries(userAnswers).map(([questionId, answer]) => {
        const question = quiz.questions.find(q => q.QuestionID === parseInt(questionId));
        
        return {
          questionId: parseInt(questionId),
          selectedOptionId: question.QuestionType === 'short_answer' ? null : parseInt(answer),
          textAnswer: question.QuestionType === 'short_answer' ? answer : null,
        };
      });
      
      const response = await fetch(`/api/quizzes/${quizId}/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          answers: formattedAnswers,
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to submit quiz');
      }
      
      const result = await response.json();
      setQuizResult(result);
      setSubmitted(true);
    } catch (err) {
      alert(`Error: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleViewResults = () => {
    if (quizResult) {
      router.push(`/quizzes/attempts/${quizResult.attemptId}`);
    }
  };

  const handleBackToVideo = () => {
    if (quiz && quiz.VideoID) {
      router.push(`/courses/${quiz.CourseID}/videos/${quiz.VideoID}`);
    } else {
      router.push(`/courses/${quiz.CourseID}`);
    }
  };

  if (loading) return (
    <MainLayout>
      <div className="container mx-auto p-4">
        <p>Loading quiz...</p>
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

  if (!quiz) return (
    <MainLayout>
      <div className="container mx-auto p-4">
        <p>Quiz not found</p>
      </div>
    </MainLayout>
  );

  return (
    <MainLayout>
      <div className="container mx-auto p-4">
        <div className="flex justify-between items-center mb-6">
          <button
            onClick={handleBackToVideo}
            className="text-blue-600 hover:text-blue-800 flex items-center"
          >
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Video
          </button>

          <h1 className="text-2xl font-bold">{quiz.Title}</h1>
          
          <div className="w-32"></div> {/* Spacer for alignment */}
        </div>
        
        {submitted ? (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">Quiz Completed!</h2>
            
            <div className="mb-6">
              <div className="flex items-center justify-center">
                <div className="w-32 h-32 rounded-full flex items-center justify-center bg-blue-100 text-blue-800 text-3xl font-bold">
                  {Math.round(quizResult.scorePercentage)}%
                </div>
              </div>
              
              <div className="mt-4 text-center">
                <p className="font-medium text-lg">
                  You scored {quizResult.score} out of {quizResult.maxScore} points
                </p>
                
                {quizResult.passed ? (
                  <div className="mt-2 flex flex-col items-center">
                    <div className="flex items-center text-green-600">
                      <svg className="w-5 h-5 mr-1" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <span className="font-medium">Passed!</span>
                    </div>
                    
                    {quizResult.earnedPoints > 0 && (
                      <p className="text-green-600 mt-1">
                        +{quizResult.earnedPoints} points earned
                      </p>
                    )}
                  </div>
                ) : (
                  <p className="mt-2 text-red-600">
                    Not passed. Required score: {quiz.PassingScore}%
                  </p>
                )}
              </div>
            </div>
            
            <div className="flex justify-center space-x-4">
              <button
                onClick={handleViewResults}
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
              >
                View Detailed Results
              </button>
              <button
                onClick={handleBackToVideo}
                className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
              >
                Return to Course
              </button>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-md p-6">
            {/* Quiz Info */}
            <div className="mb-6">
              {quiz.Description && (
                <p className="text-gray-700 mb-4">{quiz.Description}</p>
              )}
              
              <div className="flex justify-between text-sm text-gray-600">
                <span>Passing Score: {quiz.PassingScore}%</span>
                <span>Question {currentQuestion + 1} of {quiz.questions.length}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5 mt-1">
                <div 
                  className="bg-blue-600 h-2.5 rounded-full" 
                  style={{ width: `${((currentQuestion + 1) / quiz.questions.length) * 100}%` }}
                ></div>
              </div>
            </div>
            
            {/* Current Question */}
            {quiz.questions.length > 0 && (
              <div className="mb-6">
                <div className="mb-4">
                  <h3 className="text-lg font-semibold mb-2">
                    Question {currentQuestion + 1}: {quiz.questions[currentQuestion].QuestionText}
                  </h3>
                  
                  {quiz.questions[currentQuestion].QuestionType === 'multiple_choice' && (
                    <div className="space-y-2">
                      {quiz.questions[currentQuestion].options.map((option) => (
                        <div 
                          key={option.OptionID}
                          className={`border rounded-lg p-3 cursor-pointer ${
                            userAnswers[quiz.questions[currentQuestion].QuestionID] === option.OptionID 
                              ? 'border-blue-500 bg-blue-50' 
                              : 'hover:bg-gray-50'
                          }`}
                          onClick={() => handleSelectOption(quiz.questions[currentQuestion].QuestionID, option.OptionID)}
                        >
                          {option.OptionText}
                        </div>
                      ))}
                    </div>
                  )}
                  
                  {quiz.questions[currentQuestion].QuestionType === 'true_false' && (
                    <div className="space-y-2">
                      {quiz.questions[currentQuestion].options.map((option) => (
                        <div 
                          key={option.OptionID}
                          className={`border rounded-lg p-3 cursor-pointer ${
                            userAnswers[quiz.questions[currentQuestion].QuestionID] === option.OptionID 
                              ? 'border-blue-500 bg-blue-50' 
                              : 'hover:bg-gray-50'
                          }`}
                          onClick={() => handleSelectOption(quiz.questions[currentQuestion].QuestionID, option.OptionID)}
                        >
                          {option.OptionText}
                        </div>
                      ))}
                    </div>
                  )}
                  
                  {quiz.questions[currentQuestion].QuestionType === 'short_answer' && (
                    <div>
                      <textarea
                        value={userAnswers[quiz.questions[currentQuestion].QuestionID] || ''}
                        onChange={(e) => handleTextAnswer(quiz.questions[currentQuestion].QuestionID, e.target.value)}
                        className="w-full p-3 border rounded-lg"
                        rows="4"
                        placeholder="Type your answer here..."
                      ></textarea>
                    </div>
                  )}
                </div>
                
                <div className="flex justify-between">
                  <button
                    onClick={handlePrevQuestion}
                    disabled={currentQuestion === 0}
                    className="bg-gray-200 text-gray-800 px-4 py-2 rounded hover:bg-gray-300 disabled:opacity-50"
                  >
                    Previous
                  </button>
                  
                  {currentQuestion < quiz.questions.length - 1 ? (
                    <button
                      onClick={handleNextQuestion}
                      className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                    >
                      Next
                    </button>
                  ) : (
                    <button
                      onClick={handleSubmitQuiz}
                      disabled={isSubmitting}
                      className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:opacity-50"
                    >
                      {isSubmitting ? 'Submitting...' : 'Submit Quiz'}
                    </button>
                  )}
                </div>
              </div>
            )}
            
            {/* Question Navigation */}
            <div className="pt-6 border-t">
              <h3 className="text-sm font-medium text-gray-700 mb-3">Question Navigator</h3>
              <div className="flex flex-wrap gap-2">
                {quiz.questions.map((question, index) => (
                  <button
                    key={question.QuestionID}
                    className={`w-8 h-8 rounded-full ${
                      currentQuestion === index 
                        ? 'bg-blue-600 text-white' 
                        : userAnswers[question.QuestionID]
                          ? 'bg-green-100 text-green-800 border border-green-500' 
                          : 'bg-gray-200 text-gray-800'
                    }`}
                    onClick={() => setCurrentQuestion(index)}
                  >
                    {index + 1}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
}