import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useInterviewContext } from '../context/InterviewContext';

export default function Feedback() {
  const { feedback, resetSession } = useInterviewContext();
  const navigate = useNavigate();

  const handleRestart = () => {
    resetSession();
    navigate('/select');
  };

  if (!feedback) return <div>No feedback available.</div>;

  return (
    <div style={{ maxWidth: '800px', margin: '2rem auto', padding: '2rem', border: '1px solid #eee', borderRadius: '8px' }}>
      <h2>Technical Assessment Report</h2>
      <p style={{ fontSize: '1.1rem', color: '#555' }}>{feedback.summary}</p>

      <div style={{ margin: '2rem 0' }}>
        <h3 style={{ color: 'green' }}>Strengths</h3>
        <ul>
          {feedback.strengths?.map((s, idx) => <li key={idx}>{s}</li>)}
        </ul>
      </div>

      <div style={{ margin: '2rem 0' }}>
        <h3 style={{ color: 'orange' }}>Areas for Growth</h3>
        <ul>
          {feedback.gaps?.map((g, idx) => <li key={idx}>{g}</li>)}
        </ul>
      </div>

      <button onClick={handleRestart} style={{ padding: '0.75rem 1.5rem', background: '#0070f3', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
        Start New Interview
      </button>
    </div>
  );
}