import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar/Navbar';
import CandidateCard from '../components/CandidateCard/CandidateCard';
import { getCandidates, startInterview } from '../services/interviewApi';

const CandidateSelection = () => {
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [startingInterview, setStartingInterview] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    loadCandidates();
  }, []);

  const loadCandidates = async () => {
    try {
      setLoading(true);
      const data = await getCandidates();
      setCandidates(data);
      setError(null);
    } catch (err) {
      setError('Failed to load candidates. Please try again.');
      console.error('Error loading candidates:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleStartInterview = async (candidateId) => {
  try {
    setStartingInterview(candidateId);
    const response = await startInterview(candidateId);
    
    // Store candidate data in sessionStorage
    sessionStorage.setItem('candidateData', JSON.stringify(response.candidate));
    
    navigate(`/interview/${response.sessionId}`);
  } catch (err) {
    setError('Failed to start interview. Please try again.');
    console.error('Error starting interview:', err);
    setStartingInterview(null);
  }
};

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex items-center justify-center h-[calc(100vh-80px)]">
          <div className="text-center">
            <div className="inline-block w-12 h-12 border-4 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
            <p className="mt-4 text-gray-600">Loading candidates...</p>
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
              onClick={loadCandidates}
              className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Select a Candidate</h1>
          <p className="mt-2 text-gray-600">Choose a candidate to begin their personalized interview.</p>
        </div>

        {candidates.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
            <p className="text-gray-500">No candidates available.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {candidates.map((candidate) => (
              <CandidateCard
                key={candidate.id}
                candidate={candidate}
                onStartInterview={handleStartInterview}
                isLoading={startingInterview === candidate.id}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default CandidateSelection;