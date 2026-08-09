import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useInterviewContext } from '../context/InterviewContext';

const CANDIDATES = [
  { id: 'cand_001', name: 'Alex Rivera', role: 'Full-Stack Dev', completed: '28/31 Days', highlight: 'Strong RAG, Skipped MCP' },
  { id: 'cand_002', name: 'Priya Sharma', role: 'AI Engineer', completed: '31/31 Days', highlight: 'Completed All Missions' },
  { id: 'cand_003', name: 'Jordan Lee', role: 'Backend Dev', completed: '22/31 Days', highlight: 'Vector DBs Expert, Weak Agents' },
];

export default function CandidateSelection() {
  const { initSession } = useInterviewContext();
  const navigate = useNavigate();

  const handleSelect = async (id) => {
    await initSession(id);
    navigate('/interview');
  };

  return (
    <div style={{ padding: '2rem', maxWidth: '1000px', margin: '0 auto' }}>
      <h1>Select Candidate Profile</h1>
      <p>Select a participant to evaluate their cohort learnings across 31 days.</p>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem', marginTop: '2rem' }}>
        {CANDIDATES.map((cand) => (
          <div key={cand.id} style={{ border: '1px solid #ccc', borderRadius: '8px', padding: '1.5rem', background: '#fafafa' }}>
            <h3>{cand.name}</h3>
            <p><strong>Role:</strong> {cand.role}</p>
            <p><strong>Cohort Progress:</strong> {cand.completed}</p>
            <p><strong>Signal:</strong> {cand.highlight}</p>
            <button 
              onClick={() => handleSelect(cand.id)}
              style={{ width: '100%', padding: '0.75rem', marginTop: '1rem', background: '#0070f3', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
            >
              Start Technical Interview
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}