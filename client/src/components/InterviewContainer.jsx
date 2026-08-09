import React, { useState } from 'react';
import { startInterview, sendAnswer } from '../services/api';

export default function InterviewContainer() {
  const [sessionId, setSessionId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [currentDay, setCurrentDay] = useState(null);

  // Initialize Interview
  const handleStartSession = async () => {
    setLoading(true);
    try {
      const data = await startInterview();
      setSessionId(data.sessionId);
      setCurrentDay(data.day);
      setMessages([
        { role: 'assistant', content: data.content, day: data.day }
      ]);
    } catch (err) {
      console.error('Failed to start interview:', err);
    } finally {
      setLoading(false);
    }
  };

  // Submit Answer & Handle Next Turn / Report
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMsg = input.trim();
    setInput('');
    setMessages((prev) => [...prev, { role: 'user', content: userMsg }]);
    setLoading(true);

    try {
      const data = await sendAnswer(sessionId, userMsg);

      if (data.isComplete) {
        setIsComplete(true);
        setFeedback(data.feedback);
        setMessages((prev) => [
          ...prev,
          { role: 'assistant', content: data.content }
        ]);
      } else {
        setCurrentDay(data.day);
        setMessages((prev) => [
          ...prev,
          { role: 'assistant', content: data.content, day: data.day }
        ]);
      }
    } catch (err) {
      console.error('Failed to process answer:', err);
    } finally {
      setLoading(false);
    }
  };

  if (!sessionId) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <h1 className="text-2xl font-bold mb-4">AI Cohort Technical Interviewer</h1>
        <button
          onClick={handleStartSession}
          disabled={loading}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? 'Initializing Session...' : 'Start Interview'}
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4 flex flex-col h-screen">
      {/* Header Info */}
      <header className="flex justify-between items-center py-4 border-b">
        <h2 className="text-xl font-bold">Technical Interview Session</h2>
        {currentDay && (
          <span className="px-3 py-1 bg-gray-100 rounded-full text-sm font-medium">
            Assessing Curriculum Day: {currentDay}
          </span>
        )}
      </header>

      {/* Main Chat Area */}
      <div className="flex-1 overflow-y-auto py-4 space-y-4">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-xl p-4 rounded-lg ${
                msg.role === 'user'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-900 border border-gray-200'
              }`}
            >
              <p className="whitespace-pre-wrap">{msg.content}</p>
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-gray-100 p-4 rounded-lg text-gray-500 animate-pulse">
              Evaluating response & selecting next topic...
            </div>
          </div>
        )}
      </div>

      {/* Input Box or Final Report View */}
      {!isComplete ? (
        <form onSubmit={handleSubmit} className="py-4 border-t flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your technical response here..."
            className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={loading}
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50"
          >
            Send
          </button>
        </form>
      ) : (
        <div className="p-6 bg-green-50 border border-green-200 rounded-lg mt-4">
          <h3 className="text-xl font-bold text-green-900 mb-2">
            Interview Completed!
          </h3>
          {feedback && (
            <div className="space-y-2 text-green-800">
              <p><strong>Overall Score:</strong> {feedback.overallScore || 'N/A'}</p>
              <div>
                <strong>Strengths:</strong>
                <ul className="list-disc pl-5">
                  {feedback.strengths?.map((s, i) => <li key={i}>{s}</li>)}
                </ul>
              </div>
              <div>
                <strong>Areas for Improvement:</strong>
                <ul className="list-disc pl-5">
                  {feedback.weaknesses?.map((w, i) => <li key={i}>{w}</li>)}
                </ul>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}