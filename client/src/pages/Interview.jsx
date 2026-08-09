import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useInterviewContext } from '../context/InterviewContext';
import ChatWindow from '../components/Chat/ChatWindow';
import ProgressBar from '../components/Progress/ProgressBar';

export default function Interview() {
  const { sessionId, isCompleted, currentDay, turn } = useInterviewContext();
  const navigate = useNavigate();

  useEffect(() => {
    if (!sessionId) {
      navigate('/select');
    } else if (isCompleted) {
      navigate('/feedback');
    }
  }, [sessionId, isCompleted, navigate]);

  return (
    <div style={{ display: 'flex', height: '90vh', gap: '1rem', padding: '1rem' }}>
      {/* Sidebar Context */}
      <div style={{ width: '300px', borderRight: '1px solid #eee', paddingRight: '1rem' }}>
        <h3>Interview Status</h3>
        <ProgressBar turn={turn} totalTurns={8} />
        {currentDay && (
          <div style={{ marginTop: '1.5rem', padding: '1rem', background: '#eef6ff', borderRadius: '6px' }}>
            <strong>Active Focus:</strong>
            <p style={{ margin: '0.5rem 0 0' }}>Day {currentDay} Topic Assessment</p>
          </div>
        )}
      </div>

      {/* Main Chat Interface */}
      <div style={{ flex: 1 }}>
        <ChatWindow />
      </div>
    </div>
  );
}