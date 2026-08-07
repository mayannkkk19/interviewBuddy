import { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useInterview } from '../hooks/useInterview';
import Navbar from '../components/Navbar/Navbar';
import ChatWindow from '../components/Chat/ChatWindow';
import MessageInput from '../components/Chat/MessageInput';
import ProgressBar from '../components/Progress/ProgressBar';

const Interview = () => {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const messagesEndRef = useRef(null);
  const [candidate, setCandidate] = useState(null);
  
  const {
    messages,
    currentQuestion,
    totalQuestions,
    isLoading,
    isCompleted,
    sendAnswer,
    error,
    initializeInterview
  } = useInterview(sessionId);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // Load candidate data from sessionStorage
    const storedCandidate = sessionStorage.getItem('candidateData');
    if (storedCandidate) {
      const candidateData = JSON.parse(storedCandidate);
      setCandidate(candidateData);
      // Initialize the interview with the first question
      initializeInterview(candidateData);
    } else {
      // If no candidate data, redirect to candidates page
      navigate('/candidates');
    }
  }, [sessionId, navigate, initializeInterview]);

  useEffect(() => {
    if (isCompleted) {
      navigate(`/feedback/${sessionId}`);
    }
  }, [isCompleted, navigate, sessionId]);

  const handleSendMessage = async (message) => {
    await sendAnswer(message);
  };

  if (!candidate) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex items-center justify-center h-[calc(100vh-80px)]">
          <div className="text-center">
            <div className="inline-block w-12 h-12 border-4 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
            <p className="mt-4 text-gray-600">Loading interview...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />
      
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-4 pb-4 flex flex-col">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                {candidate.name}
              </h2>
              <p className="text-sm text-gray-500">
                {candidate.role || 'Candidate'}
              </p>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">
                Question {currentQuestion} / {totalQuestions}
              </span>
              <span className="text-sm px-3 py-1 bg-primary-100 text-primary-700 rounded-full">
                {totalQuestions > 0 ? Math.round((currentQuestion / totalQuestions) * 100) : 0}%
              </span>
            </div>
          </div>
          <div className="mt-3">
            <ProgressBar current={currentQuestion} total={totalQuestions} />
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden flex flex-col">
          <ChatWindow 
            messages={messages} 
            isLoading={isLoading}
            error={error}
          />
          <div ref={messagesEndRef} />
          
          <div className="border-t border-gray-200 p-4">
            <MessageInput
              onSend={handleSendMessage}
              disabled={isLoading || isCompleted}
              placeholder={isLoading ? "AI is thinking..." : "Type your answer..."}
            />
          </div>
        </div>
      </main>
    </div>
  );
};

export default Interview;