import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar/Navbar';
import ScoreCard from '../components/Feedback/ScoreCard';
import Strengths from '../components/Feedback/Strengths';
import Weaknesses from '../components/Feedback/Weaknesses';
import { getFeedback } from '../services/interviewApi';

const Feedback = () => {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const [feedback, setFeedback] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadFeedback();
  }, [sessionId]);

  const loadFeedback = async () => {
    try {
      setLoading(true);
      const data = await getFeedback(sessionId);
      setFeedback(data);
      setError(null);
    } catch (err) {
      setError('Failed to load feedback. Please try again.');
      console.error('Error loading feedback:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex items-center justify-center h-[calc(100vh-80px)]">
          <div className="text-center">
            <div className="inline-block w-12 h-12 border-4 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
            <p className="mt-4 text-gray-600">Loading feedback...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex items-center justify-center h-[calc(100vh-80px)]">
          <div className="text-center">
            <div className="text-red-600 text-5xl mb-4">⚠️</div>
            <p className="text-gray-700 mb-4">{error}</p>
            <button
              onClick={loadFeedback}
              className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!feedback) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex items-center justify-center h-[calc(100vh-80px)]">
          <p className="text-gray-500">No feedback available.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Interview Complete</h1>
          <p className="mt-2 text-gray-600">
            Here's your detailed performance feedback.
          </p>
        </div>

        <div className="space-y-6">
          <ScoreCard 
            overallScore={feedback.overallScore}
            scores={feedback.scores}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Strengths strengths={feedback.strengths} />
            <Weaknesses weaknesses={feedback.weaknesses} />
          </div>

          {feedback.recommendations && feedback.recommendations.length > 0 && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Recommended Topics
              </h3>
              <ul className="space-y-2">
                {feedback.recommendations.map((rec, index) => (
                  <li key={index} className="flex items-center text-gray-700">
                    <span className="w-2 h-2 bg-primary-500 rounded-full mr-3"></span>
                    {rec}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="flex justify-center pt-4">
            <button
              onClick={() => navigate('/candidates')}
              className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
            >
              Start Another Interview
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Feedback;