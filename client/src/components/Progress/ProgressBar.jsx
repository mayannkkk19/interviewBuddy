import React from 'react';

export default function ProgressBar({ turn = 0, totalTurns = 8 }) {
  const percentage = Math.min((turn / totalTurns) * 100, 100);

  return (
    <div style={{ marginTop: '1rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.25rem' }}>
        <span>Interview Progress</span>
        <span>Turn {turn} of {totalTurns}</span>
      </div>
      <div style={{ width: '100%', height: '8px', background: '#e0e0e0', borderRadius: '4px', overflow: 'hidden' }}>
        <div
          style={{
            width: `${percentage}%`,
            height: '100%',
            background: '#0070f3',
            transition: 'width 0.3s ease',
          }}
        />
      </div>
    </div>
  );
}