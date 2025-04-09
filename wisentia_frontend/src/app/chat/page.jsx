// src/app/chat/page.jsx
"use client";
import { useState, useEffect, useRef } from 'react';
import MainLayout from '@/components/layout/MainLayout';

export default function ChatPage() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [sessionId, setSessionId] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [sessionLoading, setSessionLoading] = useState(true);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    // Get chat history/sessions
    const fetchChatSessions = async () => {
      try {
        setSessionLoading(true);
        const response = await fetch('/api/ai/chat/sessions');
        if (response.ok) {
          const data = await response.json();
          setSessions(data);
          
          // If there are sessions, set the most recent one as active
          if (data.length > 0 && data[0].IsActive) {
            setSessionId(data[0].SessionID);
            fetchSessionMessages(data[0].SessionID);
          }
        }
      } catch (err) {
        console.error('Failed to fetch chat sessions:', err);
      } finally {
        setSessionLoading(false);
      }
    };

    fetchChatSessions();
  }, []);

  useEffect(() => {
    // Scroll to bottom when messages change
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const fetchSessionMessages = async (sid) => {
    try {
      setLoading(true);
      const response = await fetch(`/api/ai/chat/sessions/${sid}`);
      if (response.ok) {
        const data = await response.json();
        setMessages(data.messages || []);
      }
    } catch (err) {
      console.error('Failed to fetch session messages:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if (!input.trim()) return;
    
    const userMessage = {
      content: input,
      sender: 'user',
      timestamp: new Date().toISOString(),
    };
    
    setMessages([...messages, userMessage]);
    setInput('');
    setLoading(true);
    
    try {
      const response = await fetch('/api/ai/chat/message', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: input,
          sessionId: sessionId,
        }),
      });
      
      if (response.ok) {
        const data = await response.json();
        
        if (!sessionId && data.sessionId) {
          setSessionId(data.sessionId);
          
          // Update sessions list
          const sessionsResponse = await fetch('/api/ai/chat/sessions');
          if (sessionsResponse.ok) {
            const sessionsData = await sessionsResponse.json();
            setSessions(sessionsData);
          }
        }
        
        const aiMessage = {
          content: data.message,
          sender: 'ai',
          timestamp: new Date().toISOString(),
        };
        
        setMessages(prevMessages => [...prevMessages, aiMessage]);
      } else {
        const errorData = await response.json();
        console.error('Error sending message:', errorData);
        
        const errorMessage = {
          content: errorData.message || 'Sorry, there was an error processing your request.',
          sender: 'ai',
          error: true,
          timestamp: new Date().toISOString(),
        };
        
        setMessages(prevMessages => [...prevMessages, errorMessage]);
      }
    } catch (err) {
      console.error('Failed to send message:', err);
      
      const errorMessage = {
        content: 'Sorry, there was an error processing your request.',
        sender: 'ai',
        error: true,
        timestamp: new Date().toISOString(),
      };
      
      setMessages(prevMessages => [...prevMessages, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleNewChat = () => {
    setSessionId(null);
    setMessages([]);
  };

  const handleSelectSession = (sid) => {
    setSessionId(sid);
    fetchSessionMessages(sid);
  };

  const handleEndSession = async () => {
    if (!sessionId) return;
    
    try {
      const response = await fetch(`/api/ai/chat/sessions/${sessionId}/end`, {
        method: 'POST',
      });
      
      if (response.ok) {
        // Update sessions list
        const sessionsResponse = await fetch('/api/ai/chat/sessions');
        if (sessionsResponse.ok) {
          const sessionsData = await sessionsResponse.json();
          setSessions(sessionsData);
        }
        
        // Start a new chat
        handleNewChat();
      }
    } catch (err) {
      console.error('Failed to end session:', err);
    }
  };

  return (
    <MainLayout>
      <div className="container mx-auto p-4 flex h-[calc(100vh-80px)]">
        {/* Chat Sessions Sidebar */}
        <div className="w-64 bg-white rounded-lg shadow-md p-4 mr-4">
          <h2 className="font-bold text-lg mb-4">Your Chats</h2>
          
          <button 
            onClick={handleNewChat}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded mb-4 hover:bg-blue-700"
          >
            New Chat
          </button>
          
          <div className="overflow-y-auto max-h-[calc(100vh-200px)]">
            {sessionLoading ? (
              <p className="text-gray-500">Loading sessions...</p>
            ) : sessions.length === 0 ? (
              <p className="text-gray-500">No chat history</p>
            ) : (
              sessions.map((session) => (
                <div 
                  key={session.SessionID}
                  className={`p-2 rounded mb-2 cursor-pointer hover:bg-gray-100 ${sessionId === session.SessionID ? 'bg-gray-100' : ''}`}
                  onClick={() => handleSelectSession(session.SessionID)}
                >
                  <p className="font-semibold truncate">
                    {session.LastMessage ? session.LastMessage.substring(0, 20) + '...' : 'New Chat'}
                  </p>
                  <p className="text-xs text-gray-500">
                    {new Date(session.StartTime).toLocaleDateString()}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
        
        {/* Chat Main Area */}
        <div className="flex-1 flex flex-col bg-white rounded-lg shadow-md">
          {/* Chat Header */}
          <div className="p-4 border-b flex justify-between items-center">
            <h1 className="font-bold text-lg">Wisentia AI Assistant</h1>
            {sessionId && (
              <button 
                onClick={handleEndSession}
                className="text-red-600 hover:text-red-800"
              >
                End Chat
              </button>
            )}
          </div>
          
          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4">
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-gray-500">
                <p className="text-xl font-semibold mb-2">Ask me anything about your learning journey!</p>
                <p>I can help with your courses, quests, and more.</p>
              </div>
            ) : (
              messages.map((message, index) => (
                <div 
                  key={index}
                  className={`mb-4 ${message.sender === 'user' ? 'text-right' : 'text-left'}`}
                >
                  <div className={`inline-block max-w-[80%] p-3 rounded-lg ${
                    message.sender === 'user' 
                      ? 'bg-blue-600 text-white rounded-br-none' 
                      : message.error 
                        ? 'bg-red-100 text-red-800 rounded-bl-none' 
                        : 'bg-gray-100 text-gray-800 rounded-bl-none'
                  }`}>
                    <p className="whitespace-pre-wrap">{message.content}</p>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    {new Date(message.timestamp).toLocaleTimeString()}
                  </p>
                </div>
              ))
            )}
            {loading && (
              <div className="text-left mb-4">
                <div className="inline-block max-w-[80%] p-3 rounded-lg bg-gray-100 text-gray-800 rounded-bl-none">
                  <div className="flex space-x-2">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
          
          {/* Input Area */}
          <div className="p-4 border-t">
            <div className="flex items-center">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type your message..."
                className="flex-1 border rounded-lg p-2 resize-none"
                rows={2}
                disabled={loading}
              ></textarea>
              <button
                onClick={handleSendMessage}
                disabled={loading || !input.trim()}
                className="ml-2 bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-300"
              >
                Send
              </button>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}